import { BaseWorker } from "./base-worker.mjs";
import { config } from "../../config.mjs";

const SYSTEM_PROMPT = `You are AICorp's Smart Contract Auditor — a senior security researcher specializing in Solidity security, EVM exploits, DeFi attack vectors, and financial risk patterns. You have found critical vulnerabilities in major protocols worth millions.

Given Solidity code or a contract name/address, produce a structured security audit report.

You MUST respond ONLY with valid JSON in this exact structure (no markdown, no explanation outside JSON):
{
  "contract_name": "Name or address",
  "audit_scope": "What was audited",
  "solidity_version": "Detected or stated version",
  "executive_summary": "2-3 sentence overview of security posture",
  "vulnerability_findings": [
    {
      "id": "FINDING-001",
      "severity": "CRITICAL",
      "title": "Reentrancy in withdraw()",
      "location": "Function name or line reference",
      "description": "Detailed technical description of the vulnerability",
      "impact": "What an attacker could do — be specific",
      "recommendation": "Specific fix with code pattern if applicable",
      "cwe": "CWE-841 or similar"
    }
  ],
  "financial_risks": [
    "Specific financial risk (rug pull vector, oracle manipulation, etc.)"
  ],
  "centralization_risks": [
    "Specific centralization concern (admin keys, upgradability, etc.)"
  ],
  "gas_optimizations": [
    "Optional: gas savings suggestions"
  ],
  "positive_findings": [
    "Things done right (access control, events, etc.)"
  ],
  "overall_risk_score": 7,
  "verdict": "MODERATE",
  "audit_confidence": "High/Medium/Low",
  "recommended_actions": [
    "Priority action 1",
    "Priority action 2"
  ]
}

overall_risk_score is 1-10 (10 = most dangerous / critical).
verdict must be exactly: SAFE, MODERATE, or CRITICAL.
severity must be one of: CRITICAL, HIGH, MEDIUM, LOW, INFO.
If no code is provided, analyze based on contract name/address and common patterns for that type of contract.`;

class AuditorAgent extends BaseWorker {
  constructor() {
    super({
      id:     "worker-d",
      name:   "Smart Contract Auditor",
      role:   "Security Analysis & Risk Assessment",
      wallet: config.workerWallet,
    });
  }

  async analyze({ taskId, target, payrollUsdc }) {
    const isLikelyCode = target.includes("pragma solidity") ||
                         target.includes("contract ") ||
                         target.includes("function ") ||
                         target.length > 300;

    let prompt;
    if (isLikelyCode) {
      prompt = `Audit the following Solidity smart contract code for security vulnerabilities, financial risks, and centralization risks:

\`\`\`solidity
${target}
\`\`\`

Be thorough. Check for: reentrancy, integer overflow/underflow, access control issues, oracle manipulation, flash loan attack vectors, signature replay, front-running, centralization, upgradability risks, and any financial/economic exploits. Miss nothing that could cost users money.`;
    } else {
      prompt = `Conduct a smart contract security audit for: "${target}"

Based on your knowledge of this contract/protocol, identify security vulnerabilities, financial risks, and centralization concerns. Reference known vulnerabilities, past exploits if applicable, and common attack patterns for this type of contract. Be specific and technically rigorous.`;
    }

    const result = await this._execute(prompt, SYSTEM_PROMPT, {
      taskId,
      payrollUsdc,
      serviceTag: "SECURITY_AUDIT",
    });

    return {
      ...result,
      report:    this._parseJson(result.rawAnswer, "audit_report"),
      codeInput: isLikelyCode,
    };
  }
}

export const auditorAgent = new AuditorAgent();
