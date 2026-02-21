import { ethers } from "ethers";
import { BaseWorker } from "./base-worker.mjs";
import { config } from "../../config.mjs";

const SYSTEM_PROMPT = `You are AICorp's CFO Agent — an expert protocol financial analyst with deep expertise in DeFi treasury management, onchain accounting, and protocol economics.

Given a wallet address, protocol name, or DAO treasury with optional onchain data, produce a structured financial health report.

You MUST respond ONLY with valid JSON in this exact structure (no markdown, no explanation outside JSON):
{
  "protocol_name": "Name or address",
  "analysis_date": "YYYY-MM-DD",
  "financial_summary": {
    "inflow_assessment": "Description of revenue/inflows",
    "outflow_assessment": "Description of expenses/outflows",
    "net_position": "Surplus or deficit assessment",
    "runway_estimate": "X days / X months / Unknown",
    "treasury_health_score": 7
  },
  "risk_flags": [
    "Specific risk 1",
    "Specific risk 2"
  ],
  "opportunities": [
    "Opportunity 1",
    "Opportunity 2"
  ],
  "key_metrics": {
    "concentration_risk": "High/Medium/Low",
    "liquidity_risk": "High/Medium/Low",
    "governance_risk": "High/Medium/Low"
  },
  "verdict": "One powerful sentence verdict about financial health",
  "recommendation": "SOLVENT",
  "confidence": "High/Medium/Low"
}

treasury_health_score is 1-10 (10 = extremely healthy).
recommendation must be exactly: SOLVENT, AT_RISK, or INSOLVENT.`;

// Fetch basic onchain data to enrich the prompt
async function fetchOnchainData(input) {
  const isAddress = /^0x[0-9a-fA-F]{40}$/.test(input.trim());
  if (!isAddress) return null;

  try {
    // Use public Ethereum mainnet RPC for real data
    const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
    const [balance, txCount] = await Promise.all([
      provider.getBalance(input),
      provider.getTransactionCount(input),
    ]);
    return {
      address:  input,
      ethBalance: parseFloat(ethers.formatEther(balance)).toFixed(4),
      txCount,
    };
  } catch {
    // Also try Base Sepolia for testnet addresses
    try {
      const provider = new ethers.JsonRpcProvider(config.baseSepoliaRpc);
      const [balance, txCount] = await Promise.all([
        provider.getBalance(input),
        provider.getTransactionCount(input),
      ]);
      return {
        address: input,
        ethBalance: parseFloat(ethers.formatEther(balance)).toFixed(4),
        txCount,
        network: "Base Sepolia",
      };
    } catch {
      return null;
    }
  }
}

class CFOAgent extends BaseWorker {
  constructor() {
    super({
      id:     "worker-a",
      name:   "CFO Agent",
      role:   "Protocol Financial Health Analyst",
      wallet: config.workerWallet,
    });
  }

  async analyze({ taskId, target, payrollUsdc }) {
    // Enrich with onchain data if it's an address
    const onchain = await fetchOnchainData(target);
    let prompt = `Analyze the financial health of: "${target}"\n\n`;

    if (onchain) {
      prompt += `ONCHAIN DATA (live):\n`;
      prompt += `- Address: ${onchain.address}\n`;
      prompt += `- ETH Balance: ${onchain.ethBalance} ETH\n`;
      prompt += `- Total Transactions: ${onchain.txCount}\n`;
      if (onchain.network) prompt += `- Network: ${onchain.network}\n`;
      prompt += `\n`;
    }

    prompt += `Based on this data and your knowledge of this protocol/entity, generate a complete CFO financial health report. Be specific, quantitative where possible, and professionally rigorous.`;

    const result = await this._execute(prompt, SYSTEM_PROMPT, {
      taskId,
      payrollUsdc,
      serviceTag: "CFO_REPORT",
    });

    return {
      ...result,
      report:   this._parseJson(result.rawAnswer, "financial_analysis"),
      onchainData: onchain,
    };
  }
}

export const cfoAgent = new CFOAgent();
