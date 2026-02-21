<div align="center">

# AICorp

**An autonomous AI corporation that runs itself.**

Four specialist agents sell financial intelligence on demand.<br/>
Each earns its own payroll. Each pays for its own compute.<br/>
Every dollar flows through an on-chain treasury. No humans required.

<br/>

![x402](https://img.shields.io/badge/x402-Payments-0052FF?style=flat-square&logoColor=white)
![0G Labs](https://img.shields.io/badge/0G_Labs-AI_Inference-8b5cf6?style=flat-square)
![Base](https://img.shields.io/badge/Base_Sepolia-On_Chain-0052FF?style=flat-square&logo=ethereum&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_14-Frontend-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js&logoColor=white)

</div>

---

## 🏛️ What is AICorp?

AICorp is a **self-sustaining AI financial intelligence firm** built on real corporate economics.

When a client requests a report, a USDC micropayment is collected via x402, the Manager Agent verifies solvency, dispatches the right specialist, pays the worker its payroll, and the agent runs decentralized inference via 0G Labs — all autonomously, all on-chain.

The corporation runs a live P&L:

- 💰 **Revenue** — collected per report via x402 HTTP-native payments
- 💸 **Payroll** — sent in USDC to each agent before it starts working
- 🧠 **Compute (OPEX)** — paid to 0G Labs inference, logged on-chain
- 📊 **Net Margin** — tracked in real time, visible on the dashboard
- 🔒 **Solvency Enforcement** — operations halt automatically if treasury turns negative

---

## 🗺️ Architecture

```
  📥 Client Request
        │
        ▼
  🏛️  Manager Agent          receives x402 payment · verifies solvency
        │                    records revenue · routes to specialist
        │
        ├── 📊  CFO Agent          $0.25   financial health report
        ├── 📈  Alpha Analyst       $0.20   investment research brief
        ├── 🔍  DD Agent            $0.30   VC-style due diligence
        └── 🛡️  Auditor Agent       $0.35   smart contract audit
                    │
                    ▼
              🧠  0G Inference      decentralized AI compute (OPEX)
                    │
                    ▼
           🔵  Base Sepolia         revenue · payroll · compute logged on-chain
```

---

## 🤖 The Agents

| | Agent | What it produces | Price |
|---|---|---|---|
| 📊 | **CFO Agent** | Protocol financial health — inflows, outflows, runway estimate, treasury score, `SOLVENT` / `AT_RISK` / `INSOLVENT` | `$0.25` |
| 📈 | **Alpha Analyst** | Investment brief — narrative, thesis, onchain signals, `BUY` / `WATCH` / `AVOID` | `$0.20` |
| 🔍 | **DD Agent** | VC due diligence — product, tokenomics, team, competition, `PASS` / `WATCH` / `RED_FLAG` | `$0.30` |
| 🛡️ | **Auditor Agent** | Contract audit — vulnerability findings, severity scores, `SAFE` / `MODERATE` / `CRITICAL` | `$0.35` |

Each agent receives its USDC payroll **before** inference runs. Compute cost is deducted from margin. Every entry recorded on-chain.

---

## ⚙️ Technology

| Layer | Technology | Role |
|---|---|---|
| 💳 Payments | [x402 Protocol](https://x402.org) by Coinbase CDP | HTTP-native USDC micropayments — `402` returned without payment |
| 🧠 Inference | [0G Labs](https://0g.ai) decentralized compute | All agents run 0G inference — cost tracked as corporate OPEX |
| 🔵 On-chain | Base Sepolia + Solidity | Treasury, USDC payroll, ledger — all verifiable on Basescan |
| 🪪 Identity | ERC-8004 on Kite Testnet | Persistent on-chain agent identity |
| 🖥️ Backend | Node.js · Express · Ethers.js · Viem | Manager Agent + service routing |
| 🎨 Frontend | Next.js 14 · Tailwind · Framer Motion | Live dashboard with tilt cards, cursor spotlight, page transitions |

---

## 📁 Repository Structure

```
AICorp/
│
├── 📜 contracts/
│   ├── Treasury.sol          # On-chain P&L ledger (Base Sepolia)
│   └── AgentRegistry.sol     # ERC-8004 agent identity (Kite Testnet)
│
├── ⚙️  src/
│   ├── server.mjs            # Express entry point
│   ├── agents/
│   │   ├── manager.mjs       # Manager Agent + x402 middleware
│   │   └── workers/
│   │       ├── base-worker.mjs     # Shared payroll → inference → log loop
│   │       ├── cfo-agent.mjs       # Worker A
│   │       ├── alpha-agent.mjs     # Worker B
│   │       ├── dd-agent.mjs        # Worker C
│   │       └── auditor-agent.mjs   # Worker D
│   └── services/
│       ├── chain.mjs               # Ethers provider + NonceManager
│       ├── treasury.mjs            # Treasury contract read/write
│       ├── usdc.mjs                # USDC balance + transfer
│       └── ogInference.mjs         # 0G Labs inference integration
│
└── 🎨 frontend/
    └── src/
        ├── app/
        │   ├── page.tsx            # Live P&L dashboard
        │   ├── services/           # Service Terminal
        │   ├── agents/             # Agent roster + live stats
        │   ├── ledger/             # On-chain transaction history
        │   └── about/              # Problem · Solution · FAQ
        └── components/
            ├── HeroCanvas.tsx      # Canvas particle wave background
            ├── TiltCard.tsx        # 3D perspective tilt on hover
            └── CursorSpotlight.tsx # Mouse-tracking radial glow
```

---

## 🚀 Running Locally

**Requirements:** Node.js 18+, pnpm, Base Sepolia wallets funded with ETH and USDC, 0G testnet tokens.

### Backend

```bash
pnpm install
cp .env.example .env   # fill in your keys
node src/server.mjs
```

> Starts on `http://localhost:4021`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# NEXT_PUBLIC_BACKEND_URL=http://localhost:4021
npm run dev
```

> Starts on `http://localhost:3000`

---

## 🔌 API Reference

Production routes require an x402 USDC payment. Demo routes (prefixed `/demo/`) run the full pipeline without payment — used by the frontend live demo.

### Example — CFO Report

```bash
curl -X POST http://localhost:4021/demo/cfo-report \
  -H "Content-Type: application/json" \
  -d '{"target": "Uniswap"}'
```

```jsonc
{
  "success": true,
  "agent": "CFO Agent",
  "report": {
    "protocol_name": "Uniswap",
    "financial_summary": {
      "treasury_health_score": 9,
      "net_position": "Surplus"
    },
    "risk_flags": ["High ETH/USDC concentration"],
    "recommendation": "SOLVENT"
  },
  "corporate": {
    "revenue": "$7.15 USDC",
    "payroll": "$4.83 USDC",
    "netMargin": "$2.32 USDC",
    "isSolvent": true
  },
  "worker": {
    "payroll": "$0.1750 USDC",
    "payrollTx": "https://sepolia.basescan.org/tx/0x..."
  }
}
```

### Routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/cfo-report` | POST | 🔐 x402 | CFO financial health report |
| `/alpha-brief` | POST | 🔐 x402 | Investment research brief |
| `/due-diligence` | POST | 🔐 x402 | VC-style due diligence |
| `/audit` | POST | 🔐 x402 | Smart contract audit |
| `/demo/cfo-report` | POST | ✅ open | Full pipeline, no payment |
| `/demo/alpha-brief` | POST | ✅ open | Full pipeline, no payment |
| `/demo/due-diligence` | POST | ✅ open | Full pipeline, no payment |
| `/demo/audit` | POST | ✅ open | Full pipeline, no payment |
| `/status` | GET | ✅ open | Treasury stats + agent P&L |
| `/services` | GET | ✅ open | Service catalogue |
| `/health` | GET | ✅ open | Health check |

---

## 🔑 Environment Variables

```bash
# 👛 Wallets
MANAGER_PRIVATE_KEY=0x...
WORKER_PRIVATE_KEY=0x...

# 🔵 Base Sepolia
BASE_SEPOLIA_RPC=https://sepolia.base.org
TREASURY_CONTRACT_ADDRESS=0x...

# 💳 x402
X402_FACILITATOR_URL=https://x402.org/facilitator
X402_NETWORK=eip155:84532

# 🧠 0G Labs
OG_RPC_URL=https://evmrpc-testnet.0g.ai
OG_PRIVATE_KEY=0x...

# 🪪 Kite AI
KITE_ERC8004_REGISTRY=0x...
KITE_AGENT_ID=0

# 🖥️ Server
PORT=4021
```

---

## ⛓️ On-Chain

| | Network | Address |
|---|---|---|
| 🏦 Treasury Contract | Base Sepolia | [`0xfaFeEC111670c06835f65EF9aebF964A8150f1E1`](https://sepolia.basescan.org/address/0xfaFeEC111670c06835f65EF9aebF964A8150f1E1) |
| 👤 Manager Wallet | Base Sepolia | `0x32d863A717EFf11eB168A40AceF65316496249D0` |
| 🪪 Agent Identity | Kite Testnet | ERC-8004 token #0 |

---

<div align="center">

*ETHDenver 2026 · New France Village · Future of Finance*

</div>
