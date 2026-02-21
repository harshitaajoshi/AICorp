import "dotenv/config";

export const config = {
  // Wallets
  managerKey:  "0x" + process.env.MANAGER_PRIVATE_KEY,
  workerKey:   "0x" + process.env.WORKER_PRIVATE_KEY,
  ogKey:       "0x" + process.env.OG_PRIVATE_KEY,

  // Base Sepolia
  baseSepoliaRpc:  "https://sepolia.base.org",
  baseSepoliaChainId: 84532,
  usdcAddress:     process.env.USDC_BASE_SEPOLIA,
  treasuryAddress: process.env.TREASURY_CONTRACT_ADDRESS,

  // x402
  x402FacilitatorUrl: process.env.X402_FACILITATOR_URL,
  x402Network:        process.env.X402_NETWORK,           // eip155:84532
  managerWallet:      "0x32d863A717EFf11eB168A40AceF65316496249D0",
  workerWallet:       "0x860c1fc93CCb73f04cdbe9e83FEE0B61Eb002aD0",

  // Pricing
  servicePrice:    "$0.10",   // USDC per request  (what client pays)
  payrollShare:    0.70,      // 70% goes to WorkerAgent
  marginShare:     0.30,      // 30% stays in treasury

  // 0G Labs
  ogRpc:           process.env.OG_RPC_URL,
  ogProvider:      process.env.OG_PROVIDER_ADDRESS,
  ogModel:         process.env.OG_MODEL,

  // Kite
  kiteRpc:         process.env.KITE_RPC_URL,
  kiteRegistry:    process.env.KITE_ERC8004_REGISTRY,
  kiteAgentId:     process.env.KITE_AGENT_ID,

  // Server
  port: process.env.PORT || 4021,
};
