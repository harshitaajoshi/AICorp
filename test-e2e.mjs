/**
 * End-to-end test client for AICorp.
 * Uses @x402/fetch to automatically handle the 402 → pay → retry flow.
 * The payer wallet pays $0.10 USDC on Base Sepolia via x402.
 */
import "dotenv/config";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const SERVER    = "http://localhost:4021";
// Worker wallet is the payer (has 20 USDC on Base Sepolia)
const PAYER_KEY = "0x8aefd92e9ad6713d9131e06bf15afc302a63dc9d0cbfa27aceb66000a0aead3c";

async function main() {
  console.log("\n🧪 AICorp End-to-End Test");
  console.log("══════════════════════════════════════════\n");

  // Step 1: Health check
  console.log("1️⃣  Checking server health...");
  const health = await fetch(`${SERVER}/health`).then(r => r.json());
  console.log("   ✅ Server:", health.status, "at", health.time);

  // Step 2: Status (no payment)
  console.log("\n2️⃣  Fetching corporate status (before payment)...");
  const status = await fetch(`${SERVER}/status`).then(r => r.json());
  console.log("   Corporation:", status.corporation);
  console.log("   Net Margin:  $" + (status.treasury.netMargin ?? 0).toFixed(4), "USDC");
  console.log("   Solvent:    ", status.treasury.isSolvent);

  // Step 3: Hit /ai-service without payment → expect 402
  console.log("\n3️⃣  Hitting /ai-service without payment → expecting 402...");
  const noPayRes = await fetch(`${SERVER}/ai-service`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ prompt: "test" }),
  });
  console.log("   HTTP status:", noPayRes.status, noPayRes.status === 402 ? "✅ 402 Payment Required" : "❌ Expected 402");

  // Step 4: Auto-pay with x402 client
  console.log("\n4️⃣  Making x402 auto-payment ($0.10 USDC on Base Sepolia)...");
  const signer = privateKeyToAccount(PAYER_KEY);
  console.log("   Payer wallet:", signer.address);

  const client = new x402Client();
  registerExactEvmScheme(client, { signer });
  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  const prompt = "Explain in 2 sentences why autonomous AI corporations with on-chain payroll are the future of finance.";
  console.log("   Prompt:", prompt.slice(0, 70) + "...");
  console.log("   Sending request (auto-paying 402)...\n");

  const t0  = Date.now();
  const res = await fetchWithPayment(`${SERVER}/ai-service`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ prompt }),
  });
  const elapsed = Date.now() - t0;

  if (!res.ok) {
    const txt = await res.text();
    console.error("   ❌ Request failed:", res.status, txt);
    process.exit(1);
  }

  const data = await res.json();

  console.log(`✅ Response in ${elapsed}ms\n`);
  console.log("┌─ AI ANSWER ────────────────────────────────────────────┐");
  console.log("│ " + (data.answer ?? "").replace(/\n/g, "\n│ "));
  console.log("└────────────────────────────────────────────────────────┘\n");

  console.log("💼 CORPORATE P&L (on-chain):");
  console.log("   Revenue:    ", data.corporate?.revenue);
  console.log("   Payroll:    ", data.corporate?.payroll);
  console.log("   Compute:    ", data.corporate?.compute);
  console.log("   Net Margin: ", data.corporate?.netMargin);
  console.log("   Solvent:    ", data.corporate?.isSolvent);
  console.log("   Tx Count:   ", data.corporate?.txCount);
  console.log("   Contract:   ", data.corporate?.contract);
  console.log("   Explorer:   ", data.corporate?.explorer);

  console.log("\n👷 WORKER:");
  console.log("   Address:    ", data.worker?.address);
  console.log("   Payroll:    ", data.worker?.payroll);
  console.log("   Compute:    ", data.worker?.computeCost);
  console.log("   Tokens:     ", data.worker?.tokensUsed);
  console.log("   Payroll TX: ", data.worker?.payrollTx);

  console.log("\n✅ End-to-end test PASSED!\n");
}

main().catch((e) => {
  console.error("\n❌ Test failed:", e.message);
  if (e.cause) console.error("   Cause:", e.cause);
  process.exit(1);
});
