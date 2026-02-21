import { ethers } from "ethers";
import "dotenv/config";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const wallets = {
  "Wallet 1 — Manager": process.env.MANAGER_PRIVATE_KEY,
  "Wallet 2 — Worker":  process.env.WORKER_PRIVATE_KEY,
  "Wallet 3 — Spare":   "fc000e2513e33e3fd0565c79e2aff655315576c2076bedf1956c40229cd192f4",
};

const networks = {
  "Base Sepolia": {
    rpc: "https://sepolia.base.org",
    tokens: {
      USDC: process.env.USDC_BASE_SEPOLIA,
    },
  },
  "0G Newton Testnet": {
    rpc: process.env.OG_RPC_URL,
    tokens: {},
  },
  "Kite Testnet": {
    rpc: process.env.KITE_RPC_URL,
    tokens: {
      "Test USDT": process.env.KITE_TEST_USDT,
    },
  },
};

async function checkWallet(label, privateKey, networkName, rpc, tokens) {
  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const key = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;
    const wallet = new ethers.Wallet(key, provider);
    const address = wallet.address;

    const nativeBal = await provider.getBalance(address);
    const { name: chainName } = await provider.getNetwork().catch(() => ({ name: "unknown" }));

    const rows = [`  Native: ${ethers.formatEther(nativeBal)}`];

    for (const [symbol, tokenAddress] of Object.entries(tokens)) {
      try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const [bal, dec] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals(),
        ]);
        rows.push(`  ${symbol}: ${ethers.formatUnits(bal, dec)}`);
      } catch {
        rows.push(`  ${symbol}: (fetch failed)`);
      }
    }

    return { address, rows };
  } catch (e) {
    return { address: "error", rows: [`  ERROR: ${e.message}`] };
  }
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║           AICorp — Live Balance Check                   ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  for (const [walletLabel, pk] of Object.entries(wallets)) {
    console.log(`┌─ ${walletLabel}`);
    for (const [netName, { rpc, tokens }] of Object.entries(networks)) {
      const { address, rows } = await checkWallet(walletLabel, pk, netName, rpc, tokens);
      console.log(`│  [${netName}]  ${address}`);
      for (const r of rows) console.log(`│ ${r}`);
    }
    console.log("│");
  }

  // 0G account detail (on-chain ledger, not wallet balance)
  console.log("┌─ 0G Compute Ledger (Wallet 1 — Manager)");
  try {
    const { createZGComputeNetworkBroker } = await import("@0glabs/0g-serving-broker");
    const provider = new ethers.JsonRpcProvider(process.env.OG_RPC_URL);
    const pk = "0x" + process.env.OG_PRIVATE_KEY.replace("0x", "");
    const wallet = new ethers.Wallet(pk, provider);
    const broker = await createZGComputeNetworkBroker(wallet);
    const ledger = await broker.ledger.getLedger();
    const subAccounts = await broker.ledger.listSubAccounts().catch(() => []);
    console.log(`│  Total deposited: ${ledger.balance ?? "?"} 0G`);
    if (subAccounts.length) {
      for (const sa of subAccounts) {
        console.log(`│  Sub-account (${sa.provider?.slice(0,10)}...): ${sa.balance} 0G`);
      }
    }
  } catch (e) {
    console.log(`│  (ledger fetch skipped: ${e.message?.slice(0, 60)})`);
  }

  // Kite ERC-8004 agent check
  console.log("│");
  console.log("┌─ Kite ERC-8004 Agent Registry");
  try {
    const provider = new ethers.JsonRpcProvider(process.env.KITE_RPC_URL);
    const registry = new ethers.Contract(
      process.env.KITE_ERC8004_REGISTRY,
      ["function ownerOf(uint256) view returns (address)", "function tokenURI(uint256) view returns (string)"],
      provider
    );
    const owner = await registry.ownerOf(0);
    console.log(`│  Agent ID 0 owner: ${owner}`);
    console.log(`│  Registry: ${process.env.KITE_ERC8004_REGISTRY}`);
    console.log(`│  Explorer: https://testnet.kitescan.ai/address/${process.env.KITE_ERC8004_REGISTRY}`);
  } catch (e) {
    console.log(`│  (registry check failed: ${e.message?.slice(0, 60)})`);
  }

  console.log("\n✅ Balance check complete.\n");
}

main().catch(console.error);
