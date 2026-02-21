const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n🚀 Deploying ERC-8004 AgentRegistry on Kite Testnet");
  console.log("   Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("   KITE balance:", hre.ethers.formatEther(balance), "KITE");

  if (balance === 0n) {
    console.error("❌ No KITE for gas. Get tokens from https://faucet.gokite.ai/");
    process.exit(1);
  }

  console.log("\n📦 Deploying AgentRegistry contract...");
  const Registry = await hre.ethers.getContractFactory("AgentRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("✅ AgentRegistry deployed at:", address);
  console.log("   Explorer: https://testnet.kitescan.ai/address/" + address);

  // Register the ManagerAgent (AICorp)
  console.log("\n🤖 Registering AICorp ManagerAgent...");
  const agentMeta = {
    type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
    name: "AICorp ManagerAgent",
    description: "Autonomous AI Corporation ManagerAgent. Receives x402 payments via Kite testnet, allocates payroll to WorkerAgents, and maintains corporate treasury. Built for ETHDenver 2026.",
    image: "",
    active: true,
    x402Support: true,
    services: [
      { name: "web", endpoint: "https://aicorp.dev" },
      { name: "MCP", endpoint: "https://neo.dev.gokite.ai/v1/mcp", version: "2025-06-18" }
    ],
  };

  const agentURI =
    "data:application/json;base64," +
    Buffer.from(JSON.stringify(agentMeta)).toString("base64");

  const tx = await registry.register(agentURI);
  const receipt = await tx.wait();

  // Parse AgentRegistered event to get agentId
  const iface = registry.interface;
  let agentId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "AgentRegistered") {
        agentId = parsed.args.agentId.toString();
        break;
      }
    } catch {}
  }

  console.log("✅ AICorp ManagerAgent registered!");
  console.log("   Agent ID:      ", agentId ?? "0");
  console.log("   Owner:         ", deployer.address);
  console.log("   TX:            ", receipt.hash);
  console.log("   Explorer TX:    https://testnet.kitescan.ai/tx/" + receipt.hash);

  console.log("\n📋 ADD THESE TO YOUR .env:");
  console.log("   KITE_ERC8004_REGISTRY=" + address);
  console.log("   KITE_AGENT_ID=" + (agentId ?? "0"));
  console.log("\n✅ Done. AICorp has an on-chain ERC-8004 identity on Kite Testnet.");
}

main().catch((e) => {
  console.error("❌", e.message || e);
  process.exit(1);
});
