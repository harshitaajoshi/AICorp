"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import { fetchStatus, type StatusData, shortenAddr } from "@/lib/api";
import Link from "next/link";

const AGENT_INFO: Record<string, {
  icon: string;
  gradient: string;
  avatarBg: string;
  desc: string;
  realWorld: string;
  salary: string;
  price: string;
  endpoint: string;
}> = {
  cfo: {
    icon: "📊",
    gradient: "from-[#5EEAD4] to-[#00E5BF]",
    avatarBg: "bg-gradient-to-br from-[#5EEAD4]/20 to-[#00E5BF]/20",
    desc: "Give it any DAO, protocol, or wallet address — it pulls onchain data, runs 0G inference, and returns a structured financial health report with runway estimate, risk flags, and verdict.",
    realWorld: "Hired CFO analyst",
    salary: "$300k/year",
    price: "$0.25",
    endpoint: "/cfo-report",
  },
  alpha: {
    icon: "📈",
    gradient: "from-[#5EEAD4] to-[#5EEAD4]",
    avatarBg: "bg-gradient-to-br from-[#5EEAD4]/20 to-[#5EEAD4]/15",
    desc: "Give it a token, narrative, or protocol name — it generates a structured investment research brief with opportunity score, thesis, risks, onchain signals, and a clear BUY/WATCH/AVOID verdict.",
    realWorld: "Hedge fund analyst",
    salary: "$250k/year",
    price: "$0.20",
    endpoint: "/alpha-brief",
  },
  dd: {
    icon: "🔍",
    gradient: "from-[#8b5cf6] to-[#ec4899]",
    avatarBg: "bg-gradient-to-br from-[#8b5cf6]/20 to-[#ec4899]/20",
    desc: "Give it any protocol or project name — it runs a full VC-style due diligence covering product, tokenomics, onchain activity, team credibility, and competitive positioning.",
    realWorld: "VC associate",
    salary: "$200k/year",
    price: "$0.30",
    endpoint: "/due-diligence",
  },
  auditor: {
    icon: "🛡️",
    gradient: "from-[#ffa726] to-[#ff3366]",
    avatarBg: "bg-gradient-to-br from-[#ffa726]/20 to-[#ff3366]/20",
    desc: "Paste a Solidity contract — it returns a structured security audit with vulnerability findings, severity scores, financial risk patterns, centralization risks, and remediation steps.",
    realWorld: "Audit firm analyst",
    salary: "$50k–$200k per audit",
    price: "$0.35",
    endpoint: "/audit",
  },
};

export default function AgentsPage() {
  const [data, setData] = useState<StatusData | null>(null);

  useEffect(() => {
    fetchStatus().then(setData).catch(() => {});
    const iv = setInterval(() => {
      fetchStatus().then(setData).catch(() => {});
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-2 border-[#5EEAD4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const workers = Object.entries(data.workers).filter(
    ([key]) => key !== "legacy" && AGENT_INFO[key]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 page-enter">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl mb-2 font-page-heading">
          <span className="text-gradient">Meet the Team</span>
        </h1>
        <p className="text-gray-500 mb-2">
          Four autonomous AI agents — each a specialist, each on its own payroll, each running its own P&L.
        </p>
        <p className="text-xs text-gray-600 mb-10">
          No humans required. Just AICorp selling financial intelligence on demand.
        </p>
      </motion.div>

      <div className="space-y-6 stagger">
        {workers.map(([key, agent], i) => {
          const info = AGENT_INFO[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="glow-card p-0 overflow-hidden"
            >
              <div className={`h-1 bg-gradient-to-r ${info.gradient}`} />

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className={`agent-avatar w-20 h-20 rounded-2xl text-4xl ${info.avatarBg}`}>
                      {info.icon}
                    </div>
                    <div className="mt-3 text-center">
                      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                        Worker {key === "cfo" ? "A" : key === "alpha" ? "B" : key === "dd" ? "C" : "D"}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-xl font-bold">{agent.name}</h2>
                        <p className="text-sm text-gray-500">{agent.role}</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <div className={`mono-data text-2xl font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}>
                          {info.price}
                        </div>
                        <div className="text-[10px] text-gray-600">USDC per report</div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed mb-4">
                      {info.desc}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-[#0d0d0d] rounded-xl p-3 border border-[#1f1f1f]">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Reports</div>
                        <div className="text-lg font-bold mono-data mt-1">{agent.tasksCompleted}</div>
                      </div>
                      <div className="bg-[#0d0d0d] rounded-xl p-3 border border-[#1f1f1f]">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Earned</div>
                        <div className="text-lg font-bold text-[#5EEAD4] mono-data mt-1">
                          <AnimatedCounter value={agent.totalEarned} prefix="$" decimals={2} />
                        </div>
                      </div>
                      <div className="bg-[#0d0d0d] rounded-xl p-3 border border-[#1f1f1f]">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Compute</div>
                        <div className="text-lg font-bold text-[#8b5cf6] mono-data mt-1">
                          <AnimatedCounter value={agent.totalCompute} prefix="$" decimals={4} />
                        </div>
                      </div>
                      <div className="bg-[#0d0d0d] rounded-xl p-3 border border-[#1f1f1f]">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">Net Profit</div>
                        <div className="text-lg font-bold text-[#5EEAD4] mono-data mt-1">
                          <AnimatedCounter value={agent.netProfit} prefix="$" decimals={2} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="mono-data">Wallet: {shortenAddr(agent.address)}</span>
                        <span>Real-world: <span className="text-gray-400">{info.realWorld} ({info.salary})</span></span>
                      </div>
                      <Link href="/services" className="neon-btn text-xs !py-2 !px-4">
                        Run {agent.name} →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* The Corporation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 glow-card glow-cyan p-8 text-center"
      >
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">The Corporation</div>
        <h3 className="text-xl font-bold mb-2">Manager Agent — CEO</h3>
        <p className="text-sm text-gray-400 mb-4 max-w-2xl mx-auto">
          Routes x402 payments to the right specialist. Records all revenue, pays worker payroll in USDC, enforces solvency, and maintains the on-chain treasury. Every financial event is immutable.
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
          <span className="mono-data">Treasury: {shortenAddr(data.treasury.contractAddress)}</span>
          <span className="mono-data">ERC-8004: {data.agentId}</span>
        </div>
        <a
          href={data.treasury.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-xs text-[#5EEAD4] hover:underline relative z-10"
        >
          View Treasury on Basescan →
        </a>
      </motion.div>
    </div>
  );
}
