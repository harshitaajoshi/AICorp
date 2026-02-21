# AICorp

**An autonomous AI corporation that runs itself.**

Four specialist agents sell financial intelligence on demand — CFO reports, investment research, due diligence, and smart contract audits. Each agent earns its own payroll, pays for its own compute, and every dollar flows through an on-chain treasury with solvency enforcement. No humans required.

---

## Overview

AICorp is a multi-agent financial intelligence firm built on a real corporate financial model:

- **Revenue** is collected via x402 HTTP-native stablecoin payments
- **Payroll** is transferred in USDC to each agent before it starts working
- **Compute** costs are paid to 0G Labs decentralized inference and logged as OPEX
- **Solvency** is enforced on-chain — operations halt automatically if the treasury can't cover expenses
- **Every transaction** is immutable and verifiable on Base Sepolia

The result is a working autonomous corporation with a live P&L, four employees, and no human involvement.

---

## Architecture

```
  Client Request
       │
       ▼
  Manager Agent                    ← receives x402 payment, verifies solvency,
       │                             records revenue, routes to specialist
       ├── CFO Agent         $0.25  ← protocol financial health
       ├── Alpha Analyst     $0.20  ← investment research
       ├── DD Agent          $0.30  ← VC-style due diligence
       └── Auditor Agent     $0.35  ← smart contract security
                │
                ▼
         0G Inference               ← decentralized AI compute (OPEX)
                │
                ▼
        Base Sepolia                ← revenue, payroll, compute logged on-chain
```

---

## The Agents

| Agent | What it does | Price |
|---|---|---|
| **CFO Agent** | Protocol or wallet financial health — inflows, outflows, runway estimate, treasury score, SOLVENT / AT\_RISK / INSOLVENT verdict | `$0.25` |
| **Alpha Analyst** | Investment research brief — narrative, thesis, onchain signals, BUY / WATCH / AVOID verdict | `$0.20` |
| **DD Agent** | VC-style due diligence — product, tokenomics, team, competition, PASS / WATCH / RED\_FLAG verdict | `$0.30` |
| **Auditor Agent** | Smart contract security — vulnerability findings, severity scores, SAFE / MODERATE / CRITICAL risk rating | `$0.35` |

Each agent receives its USDC payroll before running inference. Compute cost is deducted from margin. All recorded on-chain.

---

## Technology

| Layer | Technology |
|---|---|
| Payments | [x402 Protocol](https://x402.org) — Coinbase CDP, HTTP-native USDC micropayments |
| AI Inference | [0G Labs](https://0g.ai) — decentralized compute, cost tracked as OPEX |
| On-chain | Base Sepolia — treasury contract, USDC payroll transfers |
| Agent Identity | ERC-8004 on Kite Testnet — persistent on-chain agent identity |
| Backend | Node.js, Express, Ethers.js, Viem |
| Frontend | Next.js 14, Tailwind CSS, Framer Motion |

---

## Repository

```
AICorp/
├── contracts/
│   ├── Treasury.sol          # On-chain P&L ledger
│   └── AgentRegistry.sol     # ERC-8004 agent identity
│
├── src/
│   ├── server.mjs            # Express entry point
│   ├── agents/
│   │   ├── manager.mjs       # Manager Agent + x402 middleware
│   │   └── workers/
│   │       ├── base-worker.mjs
│   │       ├── cfo-agent.mjs
│   │       ├── alpha-agent.mjs
│   │       ├── dd-agent.mjs
│   │       └── auditor-agent.mjs
│   └── services/
│       ├── chain.mjs         # Ethers provider + NonceManager
│       ├── treasury.mjs      # Treasury contract interface
│       ├── usdc.mjs          # USDC transfers
│       └── ogInference.mjs   # 0G Labs inference
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx          # Dashboard
        │   ├── services/         # Service Terminal
        │   ├── agents/           # Agent roster
        │   ├── ledger/           # On-chain ledger
        │   └── about/            # About
        └── components/
            ├── HeroCanvas.tsx
            ├── TiltCard.tsx
            └── CursorSpotlight.tsx
```

---

## Running Locally

**Requirements:** Node.js 18+, pnpm, Base Sepolia wallets funded with ETH and USDC, 0G testnet tokens.

### Backend

```bash
pnpm install
cp .env.example .env
# fill in your keys
node src/server.mjs
```

Starts on `http://localhost:4021`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# set NEXT_PUBLIC_BACKEND_URL=http://localhost:4021
npm run dev
```

Starts on `http://localhost:3000`

---

## API

Production routes require an x402 USDC payment. Demo routes (prefixed `/demo/`) run the full pipeline without payment — used by the frontend.

```bash
# Run a live CFO report (demo, no payment)
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
      "runway_estimate": "Unknown",
      "net_position": "Surplus"
    },
    "risk_flags": ["High ETH/USDC concentration"],
    "recommendation": "SOLVENT"
  },
  "corporate": {
    "revenue": "$7.15 USDC",
    "payroll": "$4.83 USDC",
    "netMargin": "$2.32 USDC",
    "isSolvent": true,
    "txCount": 79
  },
  "worker": {
    "name": "CFO Agent",
    "payroll": "$0.1750 USDC",
    "payrollTx": "https://sepolia.basescan.org/tx/0x..."
  }
}
```

| Route | Method | Auth | Description |
|---|---|---|---|
| `/cfo-report` | POST | x402 | CFO financial health report |
| `/alpha-brief` | POST | x402 | Investment research brief |
| `/due-diligence` | POST | x402 | VC-style due diligence |
| `/audit` | POST | x402 | Smart contract audit |
| `/demo/*` | POST | none | Full pipeline, no payment |
| `/status` | GET | none | Treasury + agent stats |
| `/services` | GET | none | Service catalogue |
| `/health` | GET | none | Health check |

---

## Environment Variables

```bash
# Wallets
MANAGER_PRIVATE_KEY=0x...
WORKER_PRIVATE_KEY=0x...

# Base Sepolia
BASE_SEPOLIA_RPC=https://sepolia.base.org
TREASURY_CONTRACT_ADDRESS=0x...

# x402
X402_FACILITATOR_URL=https://x402.org/facilitator
X402_NETWORK=eip155:84532

# 0G Labs
OG_RPC_URL=https://evmrpc-testnet.0g.ai
OG_PRIVATE_KEY=0x...

# Kite AI
KITE_ERC8004_REGISTRY=0x...
KITE_AGENT_ID=0

# Server
PORT=4021
```

---

## On-Chain

| Item | Network | Address |
|---|---|---|
| Treasury Contract | Base Sepolia | [`0xfaFeEC...`](https://sepolia.basescan.org/address/0xfaFeEC111670c06835f65EF9aebF964A8150f1E1) |
| Manager Wallet | Base Sepolia | `0x32d863...49D0` |
| Agent Identity | Kite Testnet | ERC-8004 token #0 |

---

*ETHDenver 2026 · New France Village · Future of Finance*
