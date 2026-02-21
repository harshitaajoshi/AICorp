/**
 * AICorp Agent Test Suite
 * Tests all 4 specialized workers via x402 payment flow.
 *
 * Usage: node test-agents.mjs [cfo|alpha|dd|audit|all]  (default: all)
 */
import "dotenv/config";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const SERVER    = process.env.SERVER_URL || "http://localhost:4021";
const PAYER_KEY = ("0x" + process.env.WORKER_PRIVATE_KEY).replace("0x0x", "0x");
const RUN       = process.argv[2] || "all";

// ── Setup x402 auto-pay client ───────────────────────────────────────────────
const signer         = privateKeyToAccount(PAYER_KEY);
const client         = new x402Client();
registerExactEvmScheme(client, { signer });
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// ── Test cases ───────────────────────────────────────────────────────────────
const TESTS = {
  cfo: {
    endpoint: "/cfo-report",
    label:    "CFO Agent — Protocol Financial Health",
    body:     { target: "Uniswap" },
    price:    "$0.25",
  },
  alpha: {
    endpoint: "/alpha-brief",
    label:    "Alpha Analyst — Investment Research",
    body:     { target: "Arbitrum (ARB)" },
    price:    "$0.20",
  },
  dd: {
    endpoint: "/due-diligence",
    label:    "Due Diligence Agent — VC DD Report",
    body:     { target: "EigenLayer" },
    price:    "$0.30",
  },
  audit: {
    endpoint: "/audit",
    label:    "Auditor Agent — Smart Contract Security",
    body: {
      target: `pragma solidity ^0.8.0;
contract Vulnerable {
  mapping(address => uint256) public balances;

  function deposit() external payable {
    balances[msg.sender] += msg.value;
  }

  function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    (bool ok,) = msg.sender.call{value: amount}("");
    require(ok, "Transfer failed");
    balances[msg.sender] -= amount; // state update AFTER external call — reentrancy!
  }
}`,
    },
    price: "$0.35",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const sep  = (c = "─", n = 70) => console.log(c.repeat(n));
const hdr  = (label) => { sep("═"); console.log(`  ${label}`); sep("═"); };
const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => console.log(`  ✗ ${msg}`);
const info = (msg) => console.log(`  ℹ ${msg}`);

async function checkHealth() {
  const r = await fetch(`${SERVER}/health`);
  const d = await r.json();
  if (d.status !== "ok") throw new Error("Server not healthy");
  pass(`Server healthy | ${d.agents.length} agents registered`);
  return d;
}

async function checkServices() {
  const r = await fetch(`${SERVER}/services`);
  const d = await r.json();
  info(`${d.services.length} services available:`);
  for (const svc of d.services) {
    info(`  ${svc.endpoint.padEnd(18)} ${svc.price.padEnd(8)} — ${svc.agent}`);
  }
  return d;
}

async function runTest(key) {
  const t = TESTS[key];
  if (!t) { console.log(`Unknown test: ${key}`); return; }

  hdr(`${t.label} | ${t.endpoint} | ${t.price} USDC`);
  info(`Input: ${JSON.stringify(t.body)}`);

  // 1. Verify 402 is returned without payment
  console.log("\n  [1] Hitting without payment — expect 402...");
  const noAuth = await fetch(`${SERVER}${t.endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(t.body),
  });
  if (noAuth.status === 402) {
    pass(`402 Payment Required received`);
  } else {
    fail(`Expected 402, got ${noAuth.status}`);
  }

  // 2. Auto-pay via x402 and hit the service
  console.log("\n  [2] Auto-paying via x402 and calling service...");
  const start = Date.now();
  let res;
  try {
    res = await fetchWithPayment(`${SERVER}${t.endpoint}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(t.body),
    });
  } catch (err) {
    fail(`Request failed: ${err.message}`);
    return;
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  if (!res.ok) {
    const txt = await res.text();
    fail(`Service returned ${res.status}: ${txt.slice(0, 200)}`);
    return;
  }

  const data = await res.json();
  pass(`Response received in ${elapsed}s | Status: ${res.status}`);

  // Print report
  console.log("\n  [REPORT]");
  if (data.report) {
    const reportStr = JSON.stringify(data.report, null, 2);
    // Print up to 60 lines to avoid flooding the terminal
    const lines = reportStr.split("\n").slice(0, 60);
    lines.forEach(l => console.log("  " + l));
    if (reportStr.split("\n").length > 60) info("  ... (truncated)");
  } else {
    info("No structured report in response");
  }

  // Print financial summary
  console.log("\n  [CORPORATE P&L]");
  const c = data.corporate || {};
  info(`Revenue:   ${c.revenue}`);
  info(`Payroll:   ${c.payroll}`);
  info(`Compute:   ${c.compute}`);
  info(`NetMargin: ${c.netMargin}`);
  info(`Solvent:   ${c.isSolvent}`);
  info(`TxCount:   ${c.txCount}`);

  console.log("\n  [WORKER]");
  const w = data.worker || {};
  info(`Agent:     ${data.agent} (${data.agentRole})`);
  info(`Address:   ${w.address}`);
  info(`Payroll:   ${w.payroll}`);
  info(`Compute:   ${w.computeCost}`);
  info(`Net:       ${w.netWorker}`);
  info(`Tokens:    ${w.tokensUsed}`);
  info(`Model:     ${w.model}`);
  if (w.payrollTx) info(`PayrollTx: ${w.payrollTx}`);

  sep();
  pass(`Test "${key}" PASSED`);
  return data;
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║         AICorp — Specialized Agent Test Suite                       ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝\n");
  info(`Server: ${SERVER}`);
  info(`Payer:  ${signer.address}`);
  console.log();

  try {
    await checkHealth();
    await checkServices();
  } catch (err) {
    fail(`Server check failed: ${err.message}`);
    fail("Is the server running? → node src/server.mjs");
    process.exit(1);
  }

  const toRun = RUN === "all" ? Object.keys(TESTS) : [RUN];

  let passed = 0;
  let failed = 0;

  for (const key of toRun) {
    try {
      const result = await runTest(key);
      if (result) passed++;
      else failed++;
    } catch (err) {
      fail(`Test "${key}" threw: ${err.message}`);
      failed++;
    }
    // Small pause between tests to avoid rate limiting
    if (toRun.indexOf(key) < toRun.length - 1) {
      info("Pausing 3s between tests...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log("\n╔══════════════════════════════════════════════════════════════════════╗");
  console.log(`║  Results: ${passed} passed, ${failed} failed / ${toRun.length} total tests`);
  console.log("╚══════════════════════════════════════════════════════════════════════╝\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
