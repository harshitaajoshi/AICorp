import { ethers } from "ethers";
import { config } from "../config.mjs";
import { signer, provider } from "./chain.mjs";

const USDC_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export async function transferUsdc(toAddress, amountUsdc) {
  const usdc  = new ethers.Contract(config.usdcAddress, USDC_ABI, signer);
  const units = ethers.parseUnits(amountUsdc.toFixed(6), 6);

  const tx      = await usdc.transfer(toAddress, units);
  const receipt = await tx.wait();

  console.log(`  [USDC] Transferred $${amountUsdc} USDC → ${toAddress.slice(0, 10)}... | tx: ${receipt.hash}`);
  return receipt;
}

export async function getUsdcBalance(address) {
  const usdc = new ethers.Contract(config.usdcAddress, USDC_ABI, provider);
  const bal  = await usdc.balanceOf(address);
  return Number(ethers.formatUnits(bal, 6));
}
