"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import TiltCard from "@/components/TiltCard";
import { fetchStatus, type StatusData, type LedgerEntry, shortenAddr } from "@/lib/api";

const TICKER_LINES = [
  { label: "CFO reports that cost $300k/year", value: "now $0.25 per report" },
  { label: "Hedge fund research that takes weeks", value: "delivered in seconds" },
  { label: "VC due diligence at $200k/yr", value: "on demand, per micropayment" },
  { label: "Smart contract audits at $50k–$200k", value: "automated, autonomous" },
  { label: "Four AI agents. Zero humans.", value: "one live on-chain treasury" },
  { label: "Every dollar tracked on-chain.", value: "solvency enforced by contract" },
];

const AGENT_META: Record<string, { icon: string; color: string; glow: string }> = {
  cfo:     { icon: "📊", color: "text-[#5EEAD4]",  glow: "glow-green" },
  alpha:   { icon: "📈", color: "text-[#5EEAD4]",   glow: "glow-cyan" },
  dd:      { icon: "🔍", color: "text-[#8b5cf6]", glow: "glow-purple" },
  auditor: { icon: "🛡️", color: "text-[#ffa726]",  glow: "glow-amber" },
  legacy:  { icon: "⚡", color: "text-[#5EEAD4]",   glow: "glow-cyan" },
};

const TYPE_COLORS: Record<string, string> = {
  REVENUE: "text-[#5EEAD4] bg-[#5EEAD4]/10 border-[#5EEAD4]/20",
  PAYROLL: "text-[#ffa726] bg-[#ffa726]/10 border-[#ffa726]/20",
  COMPUTE: "text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20",
};

function SolvencyGauge({ margin, revenue }: { margin: number; revenue: number }) {
  const pct = revenue > 0 ? Math.max(0, Math.min(100, (margin / revenue) * 100)) : 100;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct > 60 ? "#5EEAD4" : pct > 30 ? "#ffa726" : "#ff3366";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" overflow="visible">
        <defs>
          <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="60" cy="60" r="54" fill="none" stroke="#1f1f1f" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r="54" fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          filter="url(#gaugeGlow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mono-data text-2xl font-bold" style={{ color }}>
          {pct.toFixed(0)}%
        </span>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Margin</span>
      </div>
    </div>
  );
}

function TransactionRow({ entry, index }: { entry: LedgerEntry; index: number }) {
  const typeColor = TYPE_COLORS[entry.type] || "text-gray-400 bg-gray-800 border-gray-700";
  const sign = entry.type === "REVENUE" ? "+" : "-";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="tx-row flex items-center gap-4 px-4 py-3 border-b border-[#1f1f1f]/30"
    >
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${typeColor}`}>
        {entry.type}
      </span>
      <span className="mono-data text-sm flex-shrink-0 w-28">
        {sign}${entry.amount.toFixed(4)}
      </span>
      <span className="text-gray-500 text-xs truncate flex-1">{entry.note}</span>
      <span className="text-gray-600 text-xs mono-data flex-shrink-0">
        {new Date(entry.timestamp).toLocaleTimeString("en-US", { hour12: false })}
      </span>
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<StatusData | null>(null);
  const [prevData, setPrevData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const d = await fetchStatus();
        if (mounted) {
          setData((prev) => {
            setPrevData(prev);
            return d;
          });
          setError(null);
        }
      } catch (e: unknown) {
        console.error("Dashboard fetch failed:", e);
        if (mounted) setError(e instanceof Error ? e.message : "Fetch failed");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 5000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setTickerIdx((i) => (i + 1) % TICKER_LINES.length);
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#5EEAD4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Connecting to AICorp...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center glow-card p-8 max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Backend Offline</h2>
          <p className="text-gray-400 text-sm mb-4">
            {error || "Cannot reach AICorp backend."}
          </p>
          <p className="text-xs text-gray-600 mono-data">
            Ensure the backend is running: <br />
            <code className="text-[#5EEAD4]">cd AICorp &amp;&amp; node src/server.mjs</code>
          </p>
        </div>
      </div>
    );
  }

  const t = data.treasury;
  const workers = Object.entries(data.workers).filter(
    ([, w]) => w && typeof w === "object" && w.name
  );
  const recentLedger = [...data.ledger].reverse().slice(0, 12);
  const newTxCount = prevData ? t.txCount - (prevData.treasury?.txCount || 0) : 0;

  // Runway: average cost per completed task → how many more tasks before insolvency
  const totalTasksDone = Object.values(data.workers).reduce((s, w) => s + (w?.tasksCompleted || 0), 0);
  const avgCostPerTask = totalTasksDone > 0 ? (t.payroll + t.compute) / totalTasksDone : 0.30;
  const runway = t.netMargin > 0 && avgCostPerTask > 0
    ? Math.floor(t.netMargin / avgCostPerTask)
    : t.netMargin <= 0 ? 0 : "∞";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 page-enter">

      {/* Insolvent Banner */}
      <AnimatePresence>
        {!t.isSolvent && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="mb-6 flex items-center gap-3 px-5 py-3 rounded-xl border border-[#ff3366]/30 bg-[#ff3366]/5 text-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse flex-shrink-0" />
            <span className="text-[#ff3366] font-semibold">Operations Halted</span>
            <span className="text-gray-500">—</span>
            <span className="text-gray-400">Treasury is insolvent. Net margin is negative. No new agent tasks will be dispatched until the treasury is funded.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className="relative flex flex-col items-center justify-center min-h-[55vh] -mt-8 mb-4 overflow-hidden">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10"
        >
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2a2a2a] bg-black/60 backdrop-blur-sm text-xs text-gray-400 mb-8 tracking-widest uppercase">
            <div className="live-dot" />
            Live on Base Sepolia
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-5 font-serif-display leading-none">
            <span className="text-gradient">AICorp</span>
          </h1>

          {/* Rotating pitch ticker */}
          <div className="h-10 flex items-center justify-center mb-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={tickerIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex items-center gap-2 text-sm text-center"
              >
                <span className="text-gray-600">
                  {TICKER_LINES[tickerIdx].label}
                </span>
                <span className="text-[#5EEAD4] font-semibold">
                  — {TICKER_LINES[tickerIdx].value}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-5 text-[10px] text-gray-700 tracking-widest uppercase">
            <span>On-chain treasury</span>
            <span>·</span>
            <span>4 autonomous agents</span>
            <span>·</span>
            <span>x402 micropayments</span>
            <span>·</span>
            <span>0G inference</span>
          </div>
        </motion.div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 stagger items-stretch">
        <TiltCard className="relative h-full" tiltIntensity={10}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glow-card glow-green p-6 metric-flash h-full flex flex-col justify-center"
          >
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-[#5EEAD4]">
              <AnimatedCounter value={t.revenue} prefix="$" suffix=" USDC" />
            </div>
            <div className="text-xs text-gray-600 mt-2 mono-data">
              {t.txCount} on-chain entries
            </div>
          </motion.div>
        </TiltCard>

        <TiltCard className="relative h-full" tiltIntensity={10}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glow-card glow-amber p-6 metric-flash h-full flex flex-col justify-center"
          >
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Payroll</div>
            <div className="text-3xl font-bold text-[#ffa726]">
              <AnimatedCounter value={t.payroll} prefix="$" suffix=" USDC" />
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Paid to {workers.length} agents
            </div>
          </motion.div>
        </TiltCard>

        <TiltCard className="relative h-full" tiltIntensity={10}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glow-card glow-cyan p-6 metric-flash h-full flex flex-col justify-center"
          >
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Net Margin</div>
            <div className={`text-3xl font-bold ${t.netMargin >= 0 ? "text-[#5EEAD4]" : "text-[#ff3366]"}`}>
              <AnimatedCounter value={t.netMargin} prefix="$" suffix=" USDC" />
            </div>
            <div className="text-xs text-gray-600 mt-2 mono-data">
              {t.revenue > 0 ? ((t.netMargin / t.revenue) * 100).toFixed(1) : "0.0"}% margin rate
            </div>
            <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Runway</span>
              <span className={`mono-data text-sm font-bold ${t.isSolvent ? "text-[#5EEAD4]" : "text-[#ff3366]"}`}>
                {runway === "∞" ? "∞" : `${runway} tasks`}
              </span>
            </div>
          </motion.div>
        </TiltCard>

        <TiltCard className="relative h-full" tiltIntensity={10}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`glow-card p-6 h-full flex flex-col ${t.isSolvent ? "glow-green" : "glow-red"}`}
          >
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Solvency</div>
            <div className="flex-1 flex items-center">
              <SolvencyGauge margin={t.netMargin} revenue={t.revenue} />
            </div>
          </motion.div>
        </TiltCard>
      </div>

      {/* Agents + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5EEAD4] animate-pulse" />
            Agents
          </h2>
          {workers.map(([key, agent], i) => {
            const meta = AGENT_META[key] || AGENT_META.legacy;
            return (
              <TiltCard key={key} className="relative" tiltIntensity={6}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`glow-card p-4 flex items-center gap-4 ${meta.glow}`}
                >
                  <div
                    className={`agent-avatar ${
                      key === "cfo"     ? "bg-[#5EEAD4]/15" :
                      key === "alpha"   ? "bg-[#5EEAD4]/10" :
                      key === "dd"      ? "bg-[#8b5cf6]/15" :
                      key === "auditor" ? "bg-[#ffa726]/15" : "bg-[#5EEAD4]/10"
                    }`}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{agent.name}</span>
                      {agent.tasksCompleted > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/20 font-bold">
                          {agent.tasksCompleted} tasks
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{agent.role}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`mono-data text-sm font-semibold ${meta.color}`}>
                      ${agent.totalEarned.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-gray-600">earned</div>
                  </div>
              </motion.div>
              </TiltCard>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5EEAD4] animate-pulse" />
            Live Transaction Feed
            {newTxCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/20 font-bold"
              >
                +{newTxCount} new
              </motion.span>
            )}
          </h2>
          <div className="glow-card overflow-hidden">
            <div className="max-h-[420px] overflow-y-auto">
              <AnimatePresence>
                {recentLedger.map((entry, i) => (
                  <TransactionRow key={`${entry.timestamp}-${i}`} entry={entry} index={i} />
                ))}
              </AnimatePresence>
              {recentLedger.length === 0 && (
                <div className="p-8 text-center text-gray-600 text-sm">
                  No transactions yet. Run a service to see live activity.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Balances */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="glow-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Manager Wallet</div>
            <div className="mono-data text-sm text-gray-300">
              {shortenAddr(data.wallets.manager.address)}
            </div>
          </div>
          <div className="text-right">
            <div className="mono-data text-lg font-semibold text-[#5EEAD4]">
              ${data.wallets.manager.usdcBalance.toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-600">USDC</div>
          </div>
        </div>
        <div className="glow-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Worker Wallet</div>
            <div className="mono-data text-sm text-gray-300">
              {shortenAddr(data.wallets.worker.address)}
            </div>
          </div>
          <div className="text-right">
            <div className="mono-data text-lg font-semibold text-[#ffa726]">
              ${data.wallets.worker.usdcBalance.toFixed(2)}
            </div>
            <div className="text-[10px] text-gray-600">USDC</div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mt-12 relative z-10 space-y-3">
        <div className="flex items-center justify-center gap-3 flex-wrap text-xs text-gray-700">
          <a
            href={data.treasury.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#5EEAD4] transition-colors mono-data cursor-pointer"
          >
            Treasury: {data.treasury.contractAddress}
          </a>
          <span>·</span>
          <span className="mono-data">ERC-8004: {data.agentId}</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <a
            href={data.treasury.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1f1f1f] hover:border-[#5EEAD4]/30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
              <path d="M55.5 20C36.4 20 21 35.4 21 54.5C21 73.6 36.4 89 55.5 89C74.6 89 90 73.6 90 54.5C90 35.4 74.6 20 55.5 20ZM55.5 74C44.7 74 36 65.3 36 54.5C36 43.7 44.7 35 55.5 35C66.3 35 75 43.7 75 54.5C75 65.3 66.3 74 55.5 74Z" fill="white"/>
            </svg>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Built on Base</span>
          </a>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1f1f1f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5EEAD4]" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">0G Inference</span>
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1f1f1f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">x402 Payments</span>
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1f1f1f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffa726]" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">ERC-8004 Identity</span>
          </span>
        </div>
      </div>
    </div>
  );
}
