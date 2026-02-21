<div align="center">

<img src="https://img.shields.io/badge/ETHDenver_2026-New_France_Village-00E5BF?style=for-the-badge&logoColor=white" />
<img src="https://img.shields.io/badge/Future_of_Finance-Track-5EEAD4?style=for-the-badge&logoColor=black" />

<br /><br />

```
  █████╗ ██╗ ██████╗ ██████╗ ██████╗ ██████╗
 ██╔══██╗██║██╔════╝██╔═══██╗██╔══██╗██╔══██╗
 ███████║██║██║     ██║   ██║██████╔╝██████╔╝
 ██╔══██║██║██║     ██║   ██║██╔══██╗██╔═══╝
 ██║  ██║██║╚██████╗╚██████╔╝██║  ██║██║
 ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝
```

### **The World's First Autonomous AI Corporation**

*Four specialist agents. One live treasury. Zero humans required.*

<br />

[![x402](https://img.shields.io/badge/x402-Micropayments-0052FF?style=flat-square&logo=coinbase&logoColor=white)](https://x402.org)
[![0G Labs](https://img.shields.io/badge/0G_Labs-AI_Inference-8b5cf6?style=flat-square&logoColor=white)](https://0g.ai)
[![Base](https://img.shields.io/badge/Base_Sepolia-Treasury_Contract-0052FF?style=flat-square&logo=ethereum&logoColor=white)](https://sepolia.basescan.org/address/0xfaFeEC111670c06835f65EF9aebF964A8150f1E1)
[![ERC-8004](https://img.shields.io/badge/ERC--8004-Agent_Identity-ffa726?style=flat-square&logoColor=white)](https://kite.ai)
[![Next.js](https://img.shields.io/badge/Next.js_14-Frontend-black?style=flat-square&logo=next.js)](https://nextjs.org)

</div>

---

## What is AICorp?

AICorp is an **AI-native financial intelligence company that runs itself**.

Instead of humans, four autonomous AI agents act as employees — generating revenue, paying their own compute costs, managing an on-chain treasury, and enforcing solvency. The system behaves like a real corporation:

- **Revenue** flows in via x402 micropayments
- **OPEX** (compute) is paid to 0G Labs decentralized inference
- **Payroll** is sent in USDC to each specialist agent before they work
- **Margin** is tracked and verified on Base Sepolia every 5 seconds
- **Operations halt** automatically if the treasury turns insolvent

> *"We built the world's first Autonomous AI Corporation. The company employs four financial analyst agents. Each sells financial intelligence on demand. Each pays for its own compute. The company runs its own treasury, payroll, and margin accounting — and halts when it becomes insolvent. No humans required."*

---

## The Corporate Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUEST                           │
│                    (pays via x402 / USDC)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MANAGER AGENT (CEO)                        │
│  • Verifies solvency    • Records revenue on-chain              │
│  • Routes to specialist • Pays worker USDC payroll              │
│  • Updates treasury     • Calculates net margin                 │
└──────┬──────────────┬──────────────┬──────────────┬────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
  │   CFO   │   │  ALPHA  │   │   DD    │   │ AUDITOR │
  │  AGENT  │   │ANALYST  │   │  AGENT  │   │  AGENT  │
  │  $0.25  │   │  $0.20  │   │  $0.30  │   │  $0.35  │
  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   0G INFERENCE  │
                    │ (Decentralized) │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  BASE SEPOLIA   │
                    │  TREASURY P&L   │
                    └─────────────────┘
```

---

## The Four Agents

| Agent | Service | Price | Real-world equivalent | Cost replaced |
|-------|---------|-------|----------------------|---------------|
| **CFO Agent** | Protocol financial health report | `$0.25` | Hired CFO analyst | $300k/yr |
| **Alpha Analyst** | Investment research brief | `$0.20` | Hedge fund analyst | $250k/yr |
| **DD Agent** | VC-style due diligence | `$0.30` | VC associate | 2 weeks/report |
| **Auditor Agent** | Smart contract security audit | `$0.35` | Audit firm | $50k–$200k/audit |

Every agent: pays for its own compute via 0G · receives USDC payroll · logs every dollar on-chain

---

## Tech Stack & Bounty Alignment

### 🔵 Kite AI — x402 Micropayments
```
@x402/express   →  payment middleware on all 4 service routes
@x402/fetch     →  client-side payment execution
ExactEvmScheme  →  USDC on Base Sepolia (eip155:84532)
```
Every service request triggers a real x402 HTTP payment event. The `402 Payment Required` response is the gateway — no payment, no intelligence.

### 🟣 0G Labs — Decentralized AI Inference
```
@0glabs/0g-serving-broker  →  provider selection + inference
```
All four agents run inference through 0G's decentralized compute network. Compute cost is recorded to the on-chain treasury as OPEX — making every AI call an auditable corporate expense.

### 🔵 Base — On-Chain Treasury & Payroll
```
AACTreasury.sol  →  deployed on Base Sepolia
                    0xfaFeEC111670c06835f65EF9aebF964A8150f1E1
```
All revenue, payroll, and compute costs are immutably recorded. `isSolvent()` is checked before every task dispatch. Every entry is verifiable on [Basescan](https://sepolia.basescan.org/address/0xfaFeEC111670c06835f65EF9aebF964A8150f1E1).

### 🟡 Kite AI — ERC-8004 Agent Identity
```
AgentRegistry.sol  →  deployed on Kite Testnet
Agent ID: eip155:2368:0xfaFeEC111670c06835f65EF9aebF964A8150f1E1#0
```
The Manager Agent has a persistent on-chain identity via ERC-8004 — not a stateless function, but a registered corporate entity with a wallet and history.

---

## Repository Structure

```
AICorp/
├── contracts/
│   ├── Treasury.sol          # On-chain P&L ledger (Base Sepolia)
│   └── AgentRegistry.sol     # ERC-8004 agent identity (Kite Testnet)
│
├── scripts/
│   ├── deploy-treasury.cjs   # Deploy AACTreasury to Base Sepolia
│   └── deploy-erc8004.cjs    # Deploy AgentRegistry to Kite Testnet
│
├── src/
│   ├── config.mjs            # Centralized env config
│   ├── server.mjs            # Express entry point
│   ├── agents/
│   │   ├── manager.mjs       # Manager Agent + x402 middleware
│   │   ├── worker.mjs        # Legacy generic worker
│   │   └── workers/
│   │       ├── base-worker.mjs    # Shared execution loop
│   │       ├── cfo-agent.mjs      # CFO Agent (Worker A)
│   │       ├── alpha-agent.mjs    # Alpha Analyst (Worker B)
│   │       ├── dd-agent.mjs       # DD Agent (Worker C)
│   │       └── auditor-agent.mjs  # Smart Contract Auditor (Worker D)
│   └── services/
│       ├── chain.mjs         # Ethers provider + NonceManager signer
│       ├── treasury.mjs      # Treasury contract read/write
│       ├── usdc.mjs          # USDC balance + transfer
│       └── ogInference.mjs   # 0G Labs inference integration
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx          # Dashboard — live P&L, solvency gauge
        │   ├── services/page.tsx # Service Terminal
        │   ├── agents/page.tsx   # Agent roster + live stats
        │   ├── ledger/page.tsx   # On-chain transaction ledger
        │   └── about/page.tsx    # Problem/solution narrative + FAQ
        ├── components/
        │   ├── Navbar.tsx
        │   ├── HeroCanvas.tsx    # Canvas particle wave background
        │   ├── TiltCard.tsx      # 3D perspective tilt on hover
        │   ├── CursorSpotlight.tsx
        │   └── AnimatedCounter.tsx
        └── lib/api.ts            # Typed API client
```

---

## Live Deployment

| Component | URL |
|-----------|-----|
| **Frontend** | Coming soon — Vercel |
| **Backend** | Coming soon — Railway |
| **Treasury Contract** | [0xfaFeEC...](https://sepolia.basescan.org/address/0xfaFeEC111670c06835f65EF9aebF964A8150f1E1) |

---

## Running Locally

### Prerequisites
- Node.js 18+
- pnpm
- Funded wallets on Base Sepolia (USDC + ETH for gas)
- 0G Labs testnet tokens

### Backend

```bash
# Install dependencies
pnpm install

# Copy and fill environment variables
cp .env.example .env

# Start the Manager Agent server
node src/server.mjs
```

Server starts on `http://localhost:4021`

### Frontend

```bash
cd frontend
npm install

# Copy and fill environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_BACKEND_URL=http://localhost:4021

npm run dev
```

Frontend starts on `http://localhost:3000`

---

## API Reference

All production routes require an x402 USDC payment. Demo routes (prefixed `/demo`) bypass payment for frontend use.

| Method | Route | Price | Description |
|--------|-------|-------|-------------|
| `POST` | `/cfo-report` | `$0.25` | Protocol financial health report |
| `POST` | `/alpha-brief` | `$0.20` | Investment research brief |
| `POST` | `/due-diligence` | `$0.30` | VC-style due diligence |
| `POST` | `/audit` | `$0.35` | Smart contract security audit |
| `POST` | `/demo/cfo-report` | free | Demo (no x402) |
| `POST` | `/demo/alpha-brief` | free | Demo (no x402) |
| `POST` | `/demo/due-diligence` | free | Demo (no x402) |
| `POST` | `/demo/audit` | free | Demo (no x402) |
| `GET` | `/status` | free | Full corporate P&L + agent stats |
| `GET` | `/services` | free | Service catalogue |
| `GET` | `/health` | free | Health check |

### Example — CFO Report

```bash
curl -X POST http://localhost:4021/demo/cfo-report \
  -H "Content-Type: application/json" \
  -d '{"target": "Uniswap"}'
```

```json
{
  "success": true,
  "agent": "CFO Agent",
  "report": {
    "protocol_name": "Uniswap",
    "financial_summary": { "treasury_health_score": 9, ... },
    "risk_flags": ["High concentration risk in ETH/USDC"],
    "verdict": "Strong financial health with manageable risks",
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

---

## Environment Variables

```bash
# Wallet Private Keys
MANAGER_PRIVATE_KEY=0x...
WORKER_PRIVATE_KEY=0x...

# Base Sepolia
BASE_SEPOLIA_RPC=https://sepolia.base.org
TREASURY_CONTRACT_ADDRESS=0xfaFeEC111670c06835f65EF9aebF964A8150f1E1

# x402 Protocol
X402_FACILITATOR_URL=https://x402.org/facilitator
X402_NETWORK=eip155:84532

# 0G Labs
OG_RPC_URL=https://evmrpc-testnet.0g.ai
OG_PRIVATE_KEY=0x...

# Kite AI (ERC-8004)
KITE_ERC8004_REGISTRY=0x...
KITE_AGENT_ID=0

# Server
PORT=4021
```

---

## The Financial Model

```
Revenue per task:   $0.20 – $0.35 USDC
Worker payroll:     70% of revenue
Compute (0G):       ~$0.000001 USDC per inference
Net margin:         ~30% per task

Solvency rule:
  if (revenue - payroll - compute) < 0:
    halt all operations
```

Every number is live, on-chain, and verifiable. No mock data.

---

## ETHDenver 2026

**Track:** New France Village — Future of Finance

**Prize Targets:**

| Bounty | Sponsor | Alignment |
|--------|---------|-----------|
| Agent Payments | Kite AI | x402 on every service route |
| AI Inference | 0G Labs | All agents use 0G compute |
| Autonomous Agents | Base | Treasury + payroll on Base Sepolia |
| New France Village | ETHDenver | AI-native financial corporation |

---

<div align="center">

**Built at ETHDenver 2026**

*An AI corporation that employs, pays, and manages itself.*

</div>
