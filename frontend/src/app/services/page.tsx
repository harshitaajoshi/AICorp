"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchServices, runDemoService, type ServiceInfo, type DemoResult } from "@/lib/api";

const SERVICE_META: Record<string, { icon: string; color: string; examples: string[] }> = {
  "/cfo-report": {
    icon: "📊",
    color: "from-[#5EEAD4]/20 to-[#00E5BF]/20",
    examples: ["Aave", "Uniswap", "MakerDAO", "Compound", "Lido"],
  },
  "/alpha-brief": {
    icon: "📈",
    color: "from-[#5EEAD4]/20 to-[#5EEAD4]/10",
    examples: ["Solana (SOL)", "Ethereum (ETH)", "Arbitrum (ARB)", "Celestia (TIA)", "Sui (SUI)"],
  },
  "/due-diligence": {
    icon: "🔍",
    color: "from-[#8b5cf6]/20 to-[#ec4899]/20",
    examples: ["EigenLayer", "Hyperliquid", "LayerZero", "Pendle", "Ethena"],
  },
  "/audit": {
    icon: "🛡️",
    color: "from-[#ffa726]/20 to-[#ff3366]/20",
    examples: ["OpenZeppelin ERC20", "Uniswap V3 Router", "Compound cToken"],
  },
};

const FLOW_STEPS = [
  "Requesting service...",
  "x402 payment processed",
  "Revenue recorded in Treasury",
  "Solvency check passed",
  "Worker dispatched + USDC payroll sent",
  "0G Labs inference running...",
  "Compute cost recorded",
  "Report generated",
];

function FlowAnimation({ step }: { step: number }) {
  return (
    <div className="space-y-2 py-4">
      {FLOW_STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: done ? 1 : active ? 1 : 0.3 }}
            className="flex items-center gap-3"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
              done
                ? "bg-[#5EEAD4]/20 border-[#5EEAD4] text-[#5EEAD4]"
                : active
                ? "border-[#5EEAD4] text-[#5EEAD4] animate-pulse"
                : "border-[#1f1f1f] text-gray-600"
            }`}>
              {done ? "✓" : i + 1}
            </div>
            <span className={`text-sm ${
              done ? "text-gray-300" : active ? "text-[#5EEAD4] font-medium" : "text-gray-600"
            }`}>
              {label}
              {active && <span className="ml-2 inline-block w-1.5 h-4 bg-[#5EEAD4] animate-pulse" />}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function ReportViewer({ result }: { result: DemoResult }) {
  const report = result.report;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{result.agent}</h3>
          <p className="text-sm text-gray-500">{result.agentRole}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Task #{result.taskId}</div>
          <div className="mono-data text-sm text-[#5EEAD4]">
            {result.worker.payroll} earned
          </div>
        </div>
      </div>

      <div className="glow-card glow-cyan p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#5EEAD4]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Report Output</span>
        </div>

        <div className="space-y-3">
          {Object.entries(report).map(([key, value]) => {
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
              return (
                <div key={key} className="border border-[#1f1f1f] rounded-lg p-4">
                  <div className="text-xs text-[#5EEAD4] uppercase tracking-widest mb-2 font-semibold">
                    {key.replace(/_/g, " ")}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm border-b border-[#1f1f1f]/30 pb-1">
                        <span className="text-gray-500">{k.replace(/_/g, " ")}</span>
                        <span className="text-gray-200 mono-data text-right max-w-[60%] truncate">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            if (Array.isArray(value)) {
              return (
                <div key={key} className="border border-[#1f1f1f] rounded-lg p-4">
                  <div className="text-xs text-[#5EEAD4] uppercase tracking-widest mb-2 font-semibold">
                    {key.replace(/_/g, " ")}
                  </div>
                  <ul className="space-y-1">
                    {(value as string[]).map((item, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-[#ffa726] mt-1 text-xs">▸</span>
                        <span>{typeof item === "object" ? JSON.stringify(item) : String(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            const isVerdict = key === "verdict" || key === "overall_verdict" || key === "recommendation";
            const verdictColor =
              String(value).includes("BUY") || String(value).includes("SOLVENT") || String(value).includes("SAFE") || String(value).includes("PASS")
                ? "text-[#5EEAD4]"
                : String(value).includes("AVOID") || String(value).includes("RED_FLAG") || String(value).includes("CRITICAL") || String(value).includes("INSOLVENT")
                ? "text-[#ff3366]"
                : "text-[#ffa726]";
            return (
              <div key={key} className="flex justify-between items-start border-b border-[#1f1f1f]/30 pb-2">
                <span className="text-sm text-gray-500 flex-shrink-0">{key.replace(/_/g, " ")}</span>
                <span
                  className={`text-sm text-right max-w-[65%] ${
                    isVerdict ? `font-bold ${verdictColor}` : "text-gray-200"
                  }`}
                >
                  {String(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glow-card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Worker Details</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Agent</span><span>{result.worker.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payroll</span><span className="text-[#ffa726] mono-data">{result.worker.payroll}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Compute</span><span className="text-[#8b5cf6] mono-data">{result.worker.computeCost}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tokens</span><span className="mono-data">{result.worker.tokensUsed}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Model</span><span className="mono-data text-xs">{result.worker.model}</span></div>
          </div>
          <a
            href={result.worker.payrollTx}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-xs text-[#5EEAD4] hover:underline mono-data"
          >
            View payroll tx on Basescan →
          </a>
        </div>
        <div className="glow-card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Corporate P&L</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Revenue</span><span className="text-[#5EEAD4] mono-data">{result.corporate.revenue}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payroll</span><span className="text-[#ffa726] mono-data">{result.corporate.payroll}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Compute</span><span className="text-[#8b5cf6] mono-data">{result.corporate.compute}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Net Margin</span><span className="text-[#5EEAD4] font-bold mono-data">{result.corporate.netMargin}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Solvent</span><span className={result.corporate.isSolvent ? "text-[#5EEAD4]" : "text-[#ff3366]"}>{result.corporate.isSolvent ? "Yes" : "No"}</span></div>
          </div>
          <a
            href={result.corporate.explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-xs text-[#5EEAD4] hover:underline mono-data"
          >
            View treasury on Basescan →
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [selected, setSelected] = useState<string>("/cfo-report");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [flowStep, setFlowStep] = useState(0);
  const [result, setResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices().then((d) => {
      setServices(d.services.filter((s) => s.endpoint !== "/ai-service"));
    });
  }, []);

  const svc = services.find((s) => s.endpoint === selected);
  const meta = SERVICE_META[selected];

  async function handleSubmit() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setFlowStep(0);

    const stepInterval = setInterval(() => {
      setFlowStep((s) => Math.min(s + 1, FLOW_STEPS.length - 1));
    }, 2500);

    try {
      const res = await runDemoService(selected, input.trim());
      clearInterval(stepInterval);
      setFlowStep(FLOW_STEPS.length);
      setResult(res);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 page-enter">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl mb-2 font-page-heading">
          <span className="text-gradient">Service Terminal</span>
        </h1>
        <p className="text-gray-500 mb-8">
          Select a service, provide a target, and watch AICorp execute — live on-chain.
        </p>
      </motion.div>

      {/* Service Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 stagger">
        {services.map((s) => {
          const m = SERVICE_META[s.endpoint];
          const active = selected === s.endpoint;
          return (
            <motion.button
              key={s.endpoint}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelected(s.endpoint);
                setResult(null);
                setError(null);
                setInput("");
              }}
              className={`glow-card p-4 text-left transition-all cursor-pointer ${
                active ? "border-[#5EEAD4]/50 bg-[#5EEAD4]/5" : ""
              }`}
            >
              <div className="text-2xl mb-2">{m?.icon}</div>
              <div className="font-semibold text-sm mb-1">{s.agent}</div>
              <div className="text-xs text-gray-500 mb-2 line-clamp-2">{s.agentRole}</div>
              <div className={`mono-data text-lg font-bold ${active ? "text-[#5EEAD4]" : "text-gray-300"}`}>
                {s.price}
              </div>
              <div className="text-[10px] text-gray-600">USDC per report</div>
            </motion.button>
          );
        })}
      </div>

      {/* Input Area */}
      <AnimatePresence mode="wait">
        {!result && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="glow-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{meta?.icon}</span>
                <span className="text-sm font-semibold">{svc?.agent}</span>
                <span className="text-xs text-gray-500">— {svc?.description}</span>
              </div>

              {selected === "/audit" ? (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste Solidity code or enter a contract name..."
                  className="input-glow min-h-[160px] resize-y relative z-10"
                  disabled={loading}
                />
              ) : (
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Enter ${svc?.inputField || "target"} (e.g. ${meta?.examples[0]})`}
                  className="input-glow relative z-10"
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              )}

              <div className="flex flex-wrap gap-2 mt-3 relative z-10">
                <span className="text-xs text-gray-600">Try:</span>
                {meta?.examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setInput(ex)}
                    className="text-xs px-2 py-1 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] text-gray-400 hover:text-[#5EEAD4] hover:border-[#5EEAD4]/30 transition-colors cursor-pointer"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between relative z-10">
                <div className="text-sm text-gray-500">
                  Pay <span className="text-[#5EEAD4] font-semibold mono-data">{svc?.price}</span> USDC via x402 on Base Sepolia
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || loading}
                  className="accent-btn"
                >
                  {loading ? "Running..." : "Generate Report →"}
                </button>
              </div>
            </div>

            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="glow-card p-6 mb-6 animated-border"
              >
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Agent Pipeline — Live</div>
                <FlowAnimation step={flowStep} />
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glow-card glow-red p-6 text-[#ff3366]"
              >
                <span className="font-bold">Error:</span> {error}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <>
          <ReportViewer result={result} />
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setResult(null);
                setInput("");
              }}
              className="neon-btn"
            >
              ← Run Another Report
            </button>
          </div>
        </>
      )}
    </div>
  );
}
