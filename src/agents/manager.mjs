import express from "express";
import cors from "cors";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { config } from "../config.mjs";
import { treasury } from "../services/treasury.mjs";
import { getUsdcBalance } from "../services/usdc.mjs";

// Specialized Workers
import { cfoAgent }     from "./workers/cfo-agent.mjs";
import { alphaAgent }   from "./workers/alpha-agent.mjs";
import { ddAgent }      from "./workers/dd-agent.mjs";
import { auditorAgent } from "./workers/auditor-agent.mjs";

// Legacy generic worker (kept for backwards compat)
import { workerAgent }  from "./worker.mjs";

let taskCounter = 0;

// ── Service Catalogue ────────────────────────────────────────────────────────
// Each entry defines pricing, worker agent, and description for x402 middleware
const SERVICES = {
  "/cfo-report": {
    price:       "$0.25",
    payrollPct:  0.70,
    description: "AI CFO Agent — protocol/wallet financial health report",
    agent:       cfoAgent,
    inputField:  "target",
    inputLabel:  "wallet address or protocol name",
  },
  "/alpha-brief": {
    price:       "$0.20",
    payrollPct:  0.70,
    description: "AI Alpha Analyst — investment research brief",
    agent:       alphaAgent,
    inputField:  "target",
    inputLabel:  "token or protocol name",
  },
  "/due-diligence": {
    price:       "$0.30",
    payrollPct:  0.70,
    description: "AI DD Agent — VC-style due diligence report",
    agent:       ddAgent,
    inputField:  "target",
    inputLabel:  "project or protocol name",
  },
  "/audit": {
    price:       "$0.35",
    payrollPct:  0.70,
    description: "AI Auditor — smart contract security audit",
    agent:       auditorAgent,
    inputField:  "target",
    inputLabel:  "contract address, name, or Solidity code",
  },
  // Legacy endpoint
  "/ai-service": {
    price:       "$0.10",
    payrollPct:  0.70,
    description: "AICorp generic AI service — autonomous inference",
    agent:       null, // handled separately with generic workerAgent
    inputField:  "prompt",
    inputLabel:  "prompt",
  },
};

// ── Extract payer address from x402 headers ──────────────────────────────────
function extractPayer(req) {
  try {
    const hdr = req.headers["x-payment"] || req.headers["payment-signature"] || "";
    if (hdr) {
      const decoded = JSON.parse(Buffer.from(hdr, "base64").toString("utf8"));
      const addr = decoded?.payload?.authorization?.from || decoded?.from;
      if (addr && addr.startsWith("0x")) return addr;
    }
  } catch {}
  return config.managerWallet;
}

// ── Build corporate P&L summary ──────────────────────────────────────────────
async function buildCorporateSummary() {
  const stats = await treasury.getStats();
  return {
    revenue:    `$${stats.revenue.toFixed(4)} USDC`,
    payroll:    `$${stats.payroll.toFixed(4)} USDC`,
    compute:    `$${stats.compute.toFixed(6)} USDC`,
    netMargin:  `$${stats.netMargin.toFixed(4)} USDC`,
    isSolvent:  stats.isSolvent,
    txCount:    stats.txCount,
    contract:   config.treasuryAddress,
    explorer:   `https://sepolia.basescan.org/address/${config.treasuryAddress}`,
  };
}

// ── Generic handler factory for specialized agents ───────────────────────────
function makeServiceHandler(servicePath) {
  const svc = SERVICES[servicePath];
  return async (req, res) => {
    const input = req.body?.[svc.inputField] || req.query?.[svc.inputField];
    if (!input) {
      return res.status(400).json({
        error:    `Missing "${svc.inputField}" parameter`,
        hint:     `Provide the ${svc.inputLabel}`,
        example:  `{ "${svc.inputField}": "..." }`,
      });
    }

    const taskId     = ++taskCounter;
    const payerAddr  = extractPayer(req);
    const priceNum   = parseFloat(svc.price.replace("$", ""));
    const payrollUsd = priceNum * svc.payrollPct;

    console.log(`\n${"═".repeat(70)}`);
    console.log(`[Manager] Task #${taskId} | Service: ${servicePath} | $${priceNum} USDC`);
    console.log(`[Manager] Input: "${String(input).slice(0, 100)}"`);
    console.log(`[Manager] Payer: ${payerAddr}`);

    const solvent = await treasury.checkSolvency();
    if (!solvent) {
      console.warn("[Manager] INSOLVENT — halting task intake");
      return res.status(503).json({
        error:   "Corporation is insolvent. Service halted.",
        message: "Revenue < expenses. Treasury requires funding.",
      });
    }

    try {
      await treasury.recordRevenue(priceNum, payerAddr, `Task #${taskId} | ${servicePath}`);
      console.log(`[Manager] Revenue recorded: +$${priceNum} USDC`);

      const result = await svc.agent.analyze({
        taskId,
        target:      input,
        payrollUsdc: payrollUsd,
      });

      const corporate = await buildCorporateSummary();

      console.log(`[Manager] Task #${taskId} complete | Net margin: ${corporate.netMargin}`);

      return res.json({
        success:   true,
        taskId,
        service:   servicePath,
        agent:     result.workerName,
        agentRole: result.workerRole,
        report:    result.report,
        corporate,
        worker: {
          id:          result.workerId,
          name:        result.workerName,
          address:     result.workerAddress,
          payroll:     `$${result.payrollUsdc.toFixed(4)} USDC`,
          computeCost: `$${result.costUsd.toFixed(6)} USDC`,
          netWorker:   `$${result.workerMargin.toFixed(4)} USDC`,
          tokensUsed:  result.tokensUsed,
          payrollTx:   `https://sepolia.basescan.org/tx/${result.payrollTxHash}`,
          model:       result.model,
        },
      });

    } catch (err) {
      console.error(`[Manager] Task #${taskId} failed:`, err.message);
      return res.status(500).json({ error: err.message });
    }
  };
}

/**
 * ManagerAgent — the AI corporation's front door.
 * Routes x402-gated service requests to the right specialized WorkerAgent.
 */
export function createManagerApp() {
  const app = express();
  app.use(cors({
    origin: [
      "http://localhost:3000",
      "https://aicorp-eta.vercel.app",
      /\.vercel\.app$/,
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-PAYMENT", "X-PAYMENT-RESPONSE"],
  }));
  app.use(express.json({ limit: "1mb" })); // allow pasting full contracts

  // ── x402 Payment Middleware ──────────────────────────────────────────────
  const facilitatorClient = new HTTPFacilitatorClient({ url: config.x402FacilitatorUrl });
  const resourceServer = new x402ResourceServer(facilitatorClient)
    .register(config.x402Network, new ExactEvmScheme());

  // Build x402 route config from SERVICES catalogue
  const x402Routes = {};
  for (const [path, svc] of Object.entries(SERVICES)) {
    const routeConfig = {
      accepts: [{
        scheme:  "exact",
        price:   svc.price,
        network: config.x402Network,
        payTo:   config.managerWallet,
      }],
      description: svc.description,
      mimeType: "application/json",
    };
    x402Routes[`POST ${path}`] = routeConfig;
    x402Routes[`GET ${path}`]  = routeConfig;
  }

  app.use(paymentMiddleware(x402Routes, resourceServer));

  // ── Specialized Service Routes ───────────────────────────────────────────
  app.post("/cfo-report",    makeServiceHandler("/cfo-report"));
  app.get("/cfo-report",     makeServiceHandler("/cfo-report"));

  app.post("/alpha-brief",   makeServiceHandler("/alpha-brief"));
  app.get("/alpha-brief",    makeServiceHandler("/alpha-brief"));

  app.post("/due-diligence", makeServiceHandler("/due-diligence"));
  app.get("/due-diligence",  makeServiceHandler("/due-diligence"));

  app.post("/audit",         makeServiceHandler("/audit"));
  app.get("/audit",          makeServiceHandler("/audit"));

  // ── Demo Routes (no x402 — for frontend live demo) ──────────────────────
  // These bypass payment but still run the full agent pipeline:
  // revenue recording → payroll transfer → 0G inference → treasury update
  for (const [path, svc] of Object.entries(SERVICES)) {
    if (!svc.agent) continue; // skip legacy
    const handler = async (req, res) => {
      const input = req.body?.target || req.query?.target;
      if (!input) {
        return res.status(400).json({ error: "Missing target parameter" });
      }

      const taskId     = ++taskCounter;
      const payerAddr  = config.managerWallet;
      const priceNum   = parseFloat(svc.price.replace("$", ""));
      const payrollUsd = priceNum * svc.payrollPct;

      console.log(`\n${"═".repeat(70)}`);
      console.log(`[Manager] DEMO Task #${taskId} | Service: ${path} | $${priceNum} USDC`);
      console.log(`[Manager] Input: "${String(input).slice(0, 100)}"`);

      const solvent = await treasury.checkSolvency();
      if (!solvent) {
        return res.status(503).json({ error: "Corporation is insolvent." });
      }

      try {
        await treasury.recordRevenue(priceNum, payerAddr, `Demo #${taskId} | ${path}`);
        const result = await svc.agent.analyze({
          taskId,
          target:      input,
          payrollUsdc: payrollUsd,
        });

        const corporate = await buildCorporateSummary();

        return res.json({
          success:   true,
          taskId,
          service:   path,
          agent:     result.workerName,
          agentRole: result.workerRole,
          report:    result.report,
          corporate,
          worker: {
            id:          result.workerId,
            name:        result.workerName,
            address:     result.workerAddress,
            payroll:     `$${result.payrollUsdc.toFixed(4)} USDC`,
            computeCost: `$${result.costUsd.toFixed(6)} USDC`,
            netWorker:   `$${result.workerMargin.toFixed(4)} USDC`,
            tokensUsed:  result.tokensUsed,
            payrollTx:   `https://sepolia.basescan.org/tx/${result.payrollTxHash}`,
            model:       result.model,
          },
        });
      } catch (err) {
        console.error(`[Manager] Demo #${taskId} failed:`, err.message);
        return res.status(500).json({ error: err.message });
      }
    };
    app.post(`/demo${path}`, handler);
    app.get(`/demo${path}`,  handler);
  }

  // ── Legacy /ai-service (generic prompt) ─────────────────────────────────
  const handleLegacyAiService = async (req, res) => {
    const prompt = req.body?.prompt || req.query?.prompt;
    if (!prompt) return res.status(400).json({ error: "Missing prompt parameter" });

    const taskId     = ++taskCounter;
    const payerAddr  = extractPayer(req);
    const revenueUsd = 0.10;
    const payrollUsd = revenueUsd * config.payrollShare;

    console.log(`\n${"═".repeat(70)}`);
    console.log(`[Manager] Task #${taskId} | Service: /ai-service (legacy)`);
    console.log(`[Manager] Prompt: "${prompt.slice(0, 80)}"`);

    const solvent = await treasury.checkSolvency();
    if (!solvent) return res.status(503).json({ error: "Corporation is insolvent." });

    try {
      await treasury.recordRevenue(revenueUsd, payerAddr, `Task #${taskId} | ai-service`);

      const result = await workerAgent.execute({
        taskId,
        prompt,
        payrollUsdc: payrollUsd,
        payerAddress: payerAddr,
      });

      const corporate = await buildCorporateSummary();

      return res.json({
        success: true,
        taskId,
        service: "/ai-service",
        answer:  result.answer,
        corporate,
        worker: {
          id:          result.workerId,
          address:     result.workerAddress,
          payroll:     `$${result.payrollUsdc.toFixed(4)} USDC`,
          computeCost: `$${result.costUsd.toFixed(6)} USDC`,
          tokensUsed:  result.tokensUsed,
          payrollTx:   `https://sepolia.basescan.org/tx/${result.payrollTxHash}`,
        },
      });
    } catch (err) {
      console.error(`[Manager] Task #${taskId} failed:`, err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  app.post("/ai-service", handleLegacyAiService);
  app.get("/ai-service",  handleLegacyAiService);

  // ── Service Catalogue (public, no auth) ─────────────────────────────────
  app.get("/services", (req, res) => {
    res.json({
      corporation: "Autonomous AI Corporation (AICorp)",
      services: Object.entries(SERVICES).map(([path, svc]) => ({
        endpoint:    path,
        price:       svc.price,
        description: svc.description,
        inputField:  svc.inputField,
        agent:       svc.agent?.name || "Generic Worker",
        agentRole:   svc.agent?.role || "General Purpose",
      })),
    });
  });

  // ── Status / Dashboard API ───────────────────────────────────────────────
  app.get("/status", async (req, res) => {
    try {
      const [stats, ledger, managerUsdc, workerUsdc] = await Promise.all([
        treasury.getStats(),
        treasury.getLedger(),
        getUsdcBalance(config.managerWallet),
        getUsdcBalance(config.workerWallet),
      ]);

      res.json({
        corporation: "Autonomous AI Corporation (AICorp)",
        agentId:     `eip155:2368:${config.kiteRegistry}#${config.kiteAgentId}`,
        treasury: {
          ...stats,
          contractAddress: config.treasuryAddress,
          explorerUrl: `https://sepolia.basescan.org/address/${config.treasuryAddress}`,
        },
        wallets: {
          manager: { address: config.managerWallet, usdcBalance: managerUsdc },
          worker:  { address: config.workerWallet,  usdcBalance: workerUsdc  },
        },
        workers: {
          legacy:   workerAgent.getStats(),
          cfo:      cfoAgent.getStats(),
          alpha:    alphaAgent.getStats(),
          dd:       ddAgent.getStats(),
          auditor:  auditorAgent.getStats(),
        },
        ledger,
        services: Object.entries(SERVICES).map(([path, svc]) => ({
          endpoint: path,
          price:    svc.price,
          agent:    svc.agent?.name || "Generic Worker",
        })),
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // ── Health ───────────────────────────────────────────────────────────────
  app.get("/health", (req, res) => {
    res.json({
      status:   "ok",
      time:     new Date().toISOString(),
      services: Object.keys(SERVICES).length,
      agents:   ["CFO Agent", "Alpha Analyst", "DD Agent", "Smart Contract Auditor"],
    });
  });

  return app;
}
