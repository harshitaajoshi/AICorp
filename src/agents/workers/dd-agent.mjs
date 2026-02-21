import { BaseWorker } from "./base-worker.mjs";
import { config } from "../../config.mjs";

const SYSTEM_PROMPT = `You are AICorp's Due Diligence Agent — a senior VC associate at a top crypto fund. You specialize in VC-style deep dives on DeFi protocols, DAOs, and early-stage crypto projects. You are thorough, skeptical, and direct.

Given a protocol, project name, or contract address, produce a comprehensive VC-style due diligence report.

You MUST respond ONLY with valid JSON in this exact structure (no markdown, no explanation outside JSON):
{
  "project": "Project name",
  "one_liner": "What it does in one crisp sentence",
  "category": "DeFi/L1/L2/DAO/NFT/AI/etc",
  "executive_summary": "2-3 sentence summary of the DD finding",
  "product_analysis": {
    "core_product": "Description of what they actually built",
    "product_market_fit": "Strong/Emerging/Weak/Unproven",
    "moat": "Sustainable competitive advantage or none",
    "traction": "Evidence of real usage or adoption"
  },
  "tokenomics_analysis": {
    "token_utility": "Real utility or governance-only",
    "emission_schedule": "Inflationary/Deflationary/Controlled",
    "vesting_risk": "High insider concentration or healthy",
    "red_flags": ["Flag 1", "Flag 2"]
  },
  "onchain_activity": {
    "tvl_trend": "Growing/Stable/Declining/Unknown",
    "user_activity": "Assessment of active users/addresses",
    "treasury_health": "Funded/Adequate/At Risk/Unknown",
    "notable_signals": ["Signal 1", "Signal 2"]
  },
  "team_and_code": {
    "team_credibility": "Anonymous/Pseudonymous/Doxxed/Institutional",
    "github_activity": "Active/Moderate/Stale/Unknown",
    "audit_status": "Audited/Partially/Unaudited",
    "vc_backing": "List notable backers or None"
  },
  "competitive_positioning": {
    "main_competitors": ["Competitor 1", "Competitor 2"],
    "differentiation": "What makes this unique",
    "market_share_outlook": "Growing/Stable/At Risk"
  },
  "red_flags": [
    "Specific red flag 1",
    "Specific red flag 2"
  ],
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "overall_verdict": "PASS",
  "risk_score": 5,
  "investor_recommendation": "One decisive recommendation sentence"
}

risk_score is 1-10 (10 = highest risk / avoid).
overall_verdict must be exactly: PASS, WATCH, or RED_FLAG.`;

class DDAgent extends BaseWorker {
  constructor() {
    super({
      id:     "worker-c",
      name:   "Due Diligence Agent",
      role:   "VC-Style Investment Due Diligence",
      wallet: config.workerWallet,
    });
  }

  async analyze({ taskId, target, payrollUsdc }) {
    const prompt = `Conduct a full VC-style due diligence on: "${target}"

Be as rigorous as if you were preparing a memo for a $50M investment committee. Cover every angle — product, tokenomics, onchain data, team, competitive positioning, and red flags. Do not hedge or be vague. Give a clear, defensible verdict.

If you have limited data on this project, say so explicitly in the relevant fields but still provide your best assessment based on available information.`;

    const result = await this._execute(prompt, SYSTEM_PROMPT, {
      taskId,
      payrollUsdc,
      serviceTag: "DUE_DILIGENCE",
    });

    return {
      ...result,
      report: this._parseJson(result.rawAnswer, "due_diligence_report"),
    };
  }
}

export const ddAgent = new DDAgent();
