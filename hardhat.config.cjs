require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const MANAGER_KEY = "0x" + (process.env.MANAGER_PRIVATE_KEY || "").replace("0x", "");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    kite_testnet: {
      url: "https://rpc-testnet.gokite.ai/",
      chainId: 2368,
      accounts: [MANAGER_KEY],
      gasPrice: "auto",
    },
    base_sepolia: {
      url: "https://sepolia.base.org",
      chainId: 84532,
      accounts: [MANAGER_KEY],
    },
  },
};
