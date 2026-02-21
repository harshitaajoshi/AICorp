import "dotenv/config";
import { createManagerApp } from "./agents/manager.mjs";
import { config } from "./config.mjs";
import { ogInference } from "./services/ogInference.mjs";

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║        Autonomous AI Corporation (AICorp)               ║");
  console.log("║        ETHDenver 2026 — New France Village              ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  // Pre-warm 0G inference broker
  console.log("\n🔌 Initializing 0G inference broker...");
  await ogInference.init();
  console.log("✅ 0G broker ready");

  const app = createManagerApp();

  app.listen(config.port, () => {
    console.log(`\n🏢 AICorp ManagerAgent running on http://localhost:${config.port}`);
    console.log(`\n📋 Endpoints:`);
    console.log(`   POST/GET  http://localhost:${config.port}/ai-service?prompt=...`);
    console.log(`             → requires $0.10 USDC payment on Base Sepolia (x402)`);
    console.log(`   GET       http://localhost:${config.port}/status`);
    console.log(`             → corporate P&L, treasury, worker stats`);
    console.log(`   GET       http://localhost:${config.port}/health`);
    console.log(`\n📜 Treasury contract (Base Sepolia):`);
    console.log(`   ${config.treasuryAddress}`);
    console.log(`   https://sepolia.basescan.org/address/${config.treasuryAddress}`);
    console.log(`\n🤖 ERC-8004 Agent ID: ${config.kiteAgentId} on Kite Testnet`);
    console.log(`   Registry: ${config.kiteRegistry}`);
    console.log(`\n⏳ Waiting for x402 payments...\n`);
  });
}

main().catch((e) => {
  console.error("❌ Startup failed:", e.message);
  process.exit(1);
});
