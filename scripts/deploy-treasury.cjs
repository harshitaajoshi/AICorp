const hre = require("hardhat");
const fs  = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log(`\n🏦 Deploying AACTreasury to ${network}`);
  console.log("   Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("   ETH balance:", hre.ethers.formatEther(balance), "ETH");

  const Treasury = await hre.ethers.getContractFactory("AACTreasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();

  const address = await treasury.getAddress();
  console.log("\n✅ AACTreasury deployed at:", address);
  console.log("   Explorer: https://sepolia.basescan.org/address/" + address);

  // Write address to .env patch file for reference
  const envLine = `TREASURY_CONTRACT_ADDRESS=${address}`;
  console.log("\n📋 Add to .env:");
  console.log("  ", envLine);
}

main().catch((e) => {
  console.error("❌", e.message || e);
  process.exit(1);
});
