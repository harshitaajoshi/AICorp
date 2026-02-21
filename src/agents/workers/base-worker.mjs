import { ogInference } from "../../services/ogInference.mjs";
import { transferUsdc } from "../../services/usdc.mjs";
import { treasury } from "../../services/treasury.mjs";
import { config } from "../../config.mjs";

/**
 * BaseWorker — shared logic for all AICorp specialized agents.
 * Handles payroll receipt, 0G inference, Treasury recording, and stats.
 */
export class BaseWorker {
  constructor({ id, name, role, wallet }) {
    this.id      = id;
    this.name    = name;
    this.role    = role;
    this.address = wallet || config.workerWallet;
    this.tasksCompleted = 0;
    this.totalEarned    = 0;
    this.totalCompute   = 0;
  }

  /**
   * Core execution loop — called by all specialized workers.
   * @param {string} prompt     - The enriched prompt to send to 0G
   * @param {string} systemPrompt - The agent's specialist persona
   * @param {object} ctx        - { taskId, payrollUsdc, serviceTag }
   */
  async _execute(prompt, systemPrompt, { taskId, payrollUsdc, serviceTag }) {
    console.log(`\n[${this.name}] Task #${taskId} | Service: ${serviceTag}`);

    // 1. Receive payroll on-chain
    const payrollTx = await transferUsdc(this.address, payrollUsdc);
    await treasury.recordPayroll(payrollUsdc, this.address);
    console.log(`  [${this.name}] Payroll received: $${payrollUsdc} USDC`);

    // 2. Run 0G inference
    console.log(`  [${this.name}] Calling 0G inference...`);
    const { answer, tokensUsed, costUsd, model } = await ogInference.infer(
      prompt,
      systemPrompt
    );

    // 3. Record compute cost
    await treasury.recordComputeCost(costUsd, this.address, `${serviceTag} | ${tokensUsed} tokens`);

    // Update stats
    this.tasksCompleted++;
    this.totalEarned  += payrollUsdc;
    this.totalCompute += costUsd;

    console.log(`  [${this.name}] Done | Tokens: ${tokensUsed} | Compute: $${costUsd.toFixed(6)}`);

    return {
      workerId:      this.id,
      workerName:    this.name,
      workerRole:    this.role,
      workerAddress: this.address,
      rawAnswer:     answer,
      tokensUsed,
      costUsd,
      payrollUsdc,
      workerMargin:  payrollUsdc - costUsd,
      payrollTxHash: payrollTx.hash,
      model,
    };
  }

  /**
   * Try to parse JSON from the model's response.
   * Falls back to wrapping raw text in a structured object.
   */
  _parseJson(raw, fallbackKey = "report") {
    try {
      const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) ||
                        raw.match(/```\s*([\s\S]*?)```/) ||
                        [null, raw];
      return JSON.parse(jsonMatch[1].trim());
    } catch {
      return { [fallbackKey]: raw };
    }
  }

  getStats() {
    return {
      id:             this.id,
      name:           this.name,
      role:           this.role,
      address:        this.address,
      tasksCompleted: this.tasksCompleted,
      totalEarned:    this.totalEarned,
      totalCompute:   this.totalCompute,
      netProfit:      this.totalEarned - this.totalCompute,
    };
  }
}
