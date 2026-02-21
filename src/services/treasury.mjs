import { ethers } from "ethers";
import { config } from "../config.mjs";
import { signer, provider } from "./chain.mjs";

const ABI = [
  "function recordRevenue(uint256 amount, address payer, string note) external",
  "function recordPayroll(uint256 amount, address worker) external",
  "function recordComputeCost(uint256 usdEquiv, address worker, string note) external",
  "function getStats() external view returns (uint256 revenue, uint256 payroll, uint256 compute, int256 margin, bool solvent, uint256 txCount)",
  "function getLedger() external view returns (tuple(uint256 timestamp, string entryType, uint256 amount, address agent, string note)[])",
  "function netMargin() external view returns (int256)",
  "function isSolvent() external view returns (bool)",
  "event Revenue(uint256 indexed id, address indexed payer, uint256 amount, string note)",
  "event Payroll(uint256 indexed id, address indexed worker, uint256 amount)",
  "event ComputeCost(uint256 indexed id, address indexed worker, uint256 usdEquiv, string note)",
];

// 1 USDC = 1_000_000 units (6 decimals)
export const USDC_DECIMALS = 6n;
export const toUsdc = (dollars) => BigInt(Math.round(dollars * 1_000_000));
export const fromUsdc = (units) => Number(units) / 1_000_000;

class TreasuryService {
  constructor() {
    this.provider = provider;
    this.contract = new ethers.Contract(config.treasuryAddress, ABI, signer);
  }

  async recordRevenue(amountUsdc, payerAddress, note = "") {
    const units = toUsdc(amountUsdc);
    const tx = await this.contract.recordRevenue(units, payerAddress, note);
    const receipt = await tx.wait();
    console.log(`  [Treasury] REVENUE +$${amountUsdc} USDC | tx: ${receipt.hash}`);
    return receipt;
  }

  async recordPayroll(amountUsdc, workerAddress) {
    const units = toUsdc(amountUsdc);
    const tx = await this.contract.recordPayroll(units, workerAddress);
    const receipt = await tx.wait();
    console.log(`  [Treasury] PAYROLL -$${amountUsdc} USDC → ${workerAddress.slice(0,10)}... | tx: ${receipt.hash}`);
    return receipt;
  }

  async recordComputeCost(amountUsdc, workerAddress, note = "") {
    const units = toUsdc(amountUsdc);
    const tx = await this.contract.recordComputeCost(units, workerAddress, note);
    const receipt = await tx.wait();
    console.log(`  [Treasury] COMPUTE -$${amountUsdc.toFixed(6)} USDC | tx: ${receipt.hash}`);
    return receipt;
  }

  async getStats() {
    const [revenue, payroll, compute, margin, solvent, txCount] =
      await this.contract.getStats();
    return {
      revenue:     fromUsdc(revenue),
      payroll:     fromUsdc(payroll),
      compute:     fromUsdc(compute),
      netMargin:   fromUsdc(margin < 0n ? -(-margin) : margin) * (margin < 0n ? -1 : 1),
      isSolvent:   solvent,
      txCount:     Number(txCount),
      contractAddress: config.treasuryAddress,
    };
  }

  async getLedger() {
    const entries = await this.contract.getLedger();
    return entries.map((e) => ({
      timestamp:  new Date(Number(e.timestamp) * 1000).toISOString(),
      type:       e.entryType,
      amount:     fromUsdc(e.amount),
      agent:      e.agent,
      note:       e.note,
    }));
  }

  async checkSolvency() {
    return this.contract.isSolvent();
  }
}

export const treasury = new TreasuryService();
