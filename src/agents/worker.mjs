import { ogInference } from "../services/ogInference.mjs";
import { transferUsdc } from "../services/usdc.mjs";
import { treasury } from "../services/treasury.mjs";
import { config } from "../config.mjs";

/**
 * WorkerAgent — executes AI tasks using 0G inference.
 * Receives a task and budget allocation from ManagerAgent,
 * pays for compute from the 0G ledger, and reports back.
 */
export class WorkerAgent {
  constructor(id = 1) {
    this.id      = id;
    this.address = config.workerWallet;
    this.tasksCompleted = 0;
    this.totalEarned    = 0;
    this.totalCompute   = 0;
  }

  /**
   * Execute a task:
   * 1. Receive payroll USDC transfer from Manager
   * 2. Run 0G inference
   * 3. Report compute cost back to Manager
   * 4. Return result
   */
  async execute({ taskId, prompt, payrollUsdc, payerAddress }) {
    console.log(`\n[Worker #${this.id}] Received task ${taskId}`);
    console.log(`[Worker #${this.id}] Budget: $${payrollUsdc} USDC`);

    // Step 1: Receive payroll transfer on-chain
    console.log(`[Worker #${this.id}] Awaiting payroll transfer...`);
    const payrollTx = await transferUsdc(this.address, payrollUsdc);

    // Step 2: Record payroll in Treasury
    await treasury.recordPayroll(payrollUsdc, this.address);

    // Step 3: Run inference on 0G
    console.log(`[Worker #${this.id}] Calling 0G inference...`);
    const { answer, tokensUsed, costUsd, model } = await ogInference.infer(
      prompt,
      "You are an AI service provided by AICorp. Answer clearly and concisely."
    );

    // Step 4: Record compute cost in Treasury
    await treasury.recordComputeCost(
      costUsd,
      this.address,
      `0G ${model} | ${tokensUsed} tokens`
    );

    // Update local stats
    this.tasksCompleted++;
    this.totalEarned  += payrollUsdc;
    this.totalCompute += costUsd;

    const workerMargin = payrollUsdc - costUsd;
    console.log(`[Worker #${this.id}] Task ${taskId} complete`);
    console.log(`[Worker #${this.id}] Earnings: $${payrollUsdc} | Compute: $${costUsd.toFixed(6)} | Margin: $${workerMargin.toFixed(6)}`);

    return {
      taskId,
      workerId:     this.id,
      workerAddress: this.address,
      answer,
      tokensUsed,
      costUsd,
      payrollUsdc,
      workerMargin,
      payrollTxHash: payrollTx.hash,
    };
  }

  getStats() {
    return {
      id:             this.id,
      address:        this.address,
      tasksCompleted: this.tasksCompleted,
      totalEarned:    this.totalEarned,
      totalCompute:   this.totalCompute,
      netProfit:      this.totalEarned - this.totalCompute,
    };
  }
}

export const workerAgent = new WorkerAgent(1);
