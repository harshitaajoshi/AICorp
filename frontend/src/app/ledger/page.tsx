"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedCounter from "@/components/AnimatedCounter";
import { fetchStatus, type StatusData, type LedgerEntry, shortenAddr } from "@/lib/api";

const TYPE_BADGES: Record<string, { label: string; class: string }> = {
  REVENUE: { label: "REVENUE", class: "badge-safe" },
  PAYROLL: { label: "PAYROLL", class: "badge-high" },
  COMPUTE: { label: "COMPUTE", class: "badge-low" },
};

export default function LedgerPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const d = await fetchStatus();
        setData(d);
      } catch {}
    };
    load();
    const iv = setInterval(load, 6000);
    return () => clearInterval(iv);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-2 border-[#5EEAD4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const t = data.treasury;
  const ledger = [...data.ledger].reverse();
  const filtered = filter === "ALL" ? ledger : ledger.filter((e) => e.type === filter);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 page-enter">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl mb-2 font-page-heading">
          <span className="text-gradient">On-Chain Ledger</span>
        </h1>
        <p className="text-gray-500 mb-8">
          Every dollar the corporation has moved — all verifiable on Base Sepolia.
        </p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 stagger">
        <div className="glow-card p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Revenue</div>
          <div className="text-xl font-bold text-[#5EEAD4] mono-data mt-1">
            <AnimatedCounter value={t.revenue} prefix="$" decimals={4} />
          </div>
        </div>
        <div className="glow-card p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Payroll</div>
          <div className="text-xl font-bold text-[#ffa726] mono-data mt-1">
            <AnimatedCounter value={t.payroll} prefix="$" decimals={4} />
          </div>
        </div>
        <div className="glow-card p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Compute</div>
          <div className="text-xl font-bold text-[#8b5cf6] mono-data mt-1">
            <AnimatedCounter value={t.compute} prefix="$" decimals={6} />
          </div>
        </div>
        <div className="glow-card p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Net Margin</div>
          <div className={`text-xl font-bold mono-data mt-1 ${t.netMargin >= 0 ? "text-[#5EEAD4]" : "text-[#ff3366]"}`}>
            <AnimatedCounter value={t.netMargin} prefix="$" decimals={4} />
          </div>
        </div>
        <div className="glow-card p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">Entries</div>
          <div className="text-xl font-bold text-white mono-data mt-1">{t.txCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {["ALL", "REVENUE", "PAYROLL", "COMPUTE"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === f
                ? "bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/30"
                : "bg-[#0d0d0d] text-gray-500 border border-[#1f1f1f] hover:text-white"
            }`}
          >
            {f} {f !== "ALL" && `(${ledger.filter((e) => e.type === f).length})`}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-gray-600 mono-data">
          Showing {filtered.length} of {ledger.length}
        </span>
      </div>

      {/* Table */}
      <div className="glow-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#1f1f1f] text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
          <div className="col-span-2">Timestamp</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Agent</div>
          <div className="col-span-4">Note</div>
          <div className="col-span-1 text-right">Link</div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {filtered.map((entry, i) => {
            const badge = TYPE_BADGES[entry.type] || { label: entry.type, class: "badge-low" };
            const sign = entry.type === "REVENUE" ? "+" : "-";
            return (
              <motion.div
                key={`${entry.timestamp}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02, duration: 0.25 }}
                className="tx-row grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#1f1f1f]/20 items-center"
              >
                <div className="col-span-2 mono-data text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </div>
                <div className="col-span-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${badge.class}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="col-span-2 mono-data text-sm font-medium">
                  <span className={entry.type === "REVENUE" ? "text-[#5EEAD4]" : "text-gray-300"}>
                    {sign}${entry.amount.toFixed(4)}
                  </span>
                </div>
                <div className="col-span-2 text-xs text-gray-400 mono-data">
                  {shortenAddr(entry.agent)}
                </div>
                <div className="col-span-4 text-xs text-gray-500 truncate">{entry.note}</div>
                <div className="col-span-1 text-right relative z-10">
                  <a
                    href={data.treasury.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5EEAD4] hover:text-white text-xs transition-colors cursor-pointer"
                  >
                    ↗
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-600">No transactions match this filter.</div>
        )}
      </div>

      <div className="mt-6 text-center relative z-10">
        <a
          href={data.treasury.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-600 hover:text-[#5EEAD4] transition-colors mono-data cursor-pointer"
        >
          View full contract on Basescan: {data.treasury.contractAddress} →
        </a>
      </div>
    </div>
  );
}
