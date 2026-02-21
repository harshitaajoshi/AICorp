/**
 * Shared provider and signer for the Manager wallet.
 * Using NonceManager ensures sequential nonces across concurrent calls.
 */
import { ethers } from "ethers";
import { config } from "../config.mjs";

export const provider = new ethers.JsonRpcProvider(config.baseSepoliaRpc);

// NonceManager serialises transactions so nonces never collide
const rawSigner     = new ethers.Wallet(config.managerKey, provider);
export const signer = new ethers.NonceManager(rawSigner);
