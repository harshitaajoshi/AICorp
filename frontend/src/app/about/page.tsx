"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STEPS = [
  {
    num: "01",
    title: "Pick a Service",
    desc: "CFO Report, Alpha Brief, Due Diligence, or Smart Contract Audit.",
  },
  {
    num: "02",
    title: "Pay via x402",
    desc: "USDC micropayment over HTTP. No wallet popups. No gas friction.",
  },
  {
    num: "03",
    title: "Agent Dispatched",
    desc: "Manager verifies solvency, records revenue, pays the worker its USDC payroll.",
  },
  {
    num: "04",
    title: "0G Inference",
    desc: "Decentralized AI compute runs the specialist model. Cost logged on-chain.",
  },
  {
    num: "05",
    title: "Report Delivered",
    desc: "Structured intelligence report in seconds. Every dollar tracked on-chain.",
  },
];

const FAQS = [
  {
    q: "Do I need a wallet or any setup?",
    a: "No. The backend handles all x402 payments automatically. Just type a target and click Generate.",
  },
  {
    q: "What is x402?",
    a: "An open protocol by Coinbase CDP for instant HTTP-native stablecoin payments. No wallet popups, no manual steps.",
  },
  {
    q: "Why 0G Labs?",
    a: "Decentralized AI compute. Agents pay for their own inference on-chain — compute becomes an auditable line item on the P&L.",
  },
  {
    q: "What if the treasury is insolvent?",
    a: "The corporation halts all agent dispatch until revenue covers expenses again. Solvency is enforced before every task.",
  },
  {
    q: "Can I verify the on-chain transactions?",
    a: "Yes — every revenue, payroll, and compute entry is on Base Sepolia, linked from the Ledger page.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-[#1f1f1f] cursor-pointer"
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex items-center justify-between py-5 px-1">
        <span className="text-sm text-gray-200 font-medium">{q}</span>
        <span className={`text-[#5EEAD4] text-lg font-light transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-gray-500 pb-5 px-1 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 page-enter">

      {/* Hero — clean, minimal */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20"
      >
        <p className="text-xs text-gray-600 uppercase tracking-[0.25em] mb-6">About</p>
        <h1 className="text-4xl md:text-5xl font-black font-serif-display leading-tight mb-6">
          The AI corporation<br />
          <span className="text-gray-500">that runs itself.</span>
        </h1>
        <p className="text-base text-gray-500 leading-relaxed max-w-xl">
          Four AI agents sell financial intelligence on demand — CFO reports,
          investment briefs, due diligence, and security audits. Each agent earns
          its own payroll, pays for its own compute, and every dollar flows through
          an on-chain treasury with solvency enforcement.
        </p>
      </motion.div>

      {/* Numbers that hit */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
      >
        {[
          { val: "$0.25", label: "per CFO report", sub: "vs $300k/yr human" },
          { val: "10s", label: "delivery time", sub: "vs 2 weeks human" },
          { val: "4", label: "specialist agents", sub: "zero employees" },
          { val: "100%", label: "on-chain", sub: "every dollar tracked" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="text-2xl font-bold text-white mono-data">{stat.val}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{stat.label}</div>
            <div className="text-xs text-gray-700 mt-0.5">{stat.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Problem → Solution */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1f1f1f] rounded-2xl overflow-hidden">
          {/* Problem */}
          <div className="bg-[#0a0a0a] p-8 md:p-10">
            <p className="text-xs text-gray-600 uppercase tracking-[0.25em] mb-5">The problem</p>
            <div className="space-y-4">
              {[
                { cost: "$300k/yr", what: "to hire a CFO analyst" },
                { cost: "$250k/yr", what: "for hedge fund research" },
                { cost: "2 weeks", what: "per VC due diligence report" },
                { cost: "$50k–200k", what: "per smart contract audit" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-baseline gap-3"
                >
                  <span className="text-sm font-bold text-gray-400 mono-data flex-shrink-0 w-24 text-right">{item.cost}</span>
                  <span className="text-sm text-gray-600">{item.what}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-gray-700 mt-6">Manual. Slow. Expensive. Gatekept.</p>
          </div>

          {/* Solution */}
          <div className="bg-[#0a0a0a] p-8 md:p-10">
            <p className="text-xs text-[#5EEAD4]/60 uppercase tracking-[0.25em] mb-5">The solution</p>
            <div className="space-y-4">
              {[
                { cost: "$0.25", what: "per CFO report — instant" },
                { cost: "$0.20", what: "per investment brief — 10 seconds" },
                { cost: "$0.30", what: "per due diligence — autonomous" },
                { cost: "$0.35", what: "per security audit — on demand" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-baseline gap-3"
                >
                  <span className="text-sm font-bold text-[#5EEAD4] mono-data flex-shrink-0 w-24 text-right">{item.cost}</span>
                  <span className="text-sm text-gray-400">{item.what}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-6">Autonomous. On-chain. No humans required.</p>
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <p className="text-xs text-gray-600 uppercase tracking-[0.25em] mb-6">How it works</p>
        <div>
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-6 py-5 border-b border-[#1f1f1f] group"
            >
              <span className="text-lg font-bold mono-data text-[#5EEAD4]/25 group-hover:text-[#5EEAD4]/50 transition-colors w-10 flex-shrink-0 pt-0.5">
                {step.num}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <p className="text-xs text-gray-600 uppercase tracking-[0.25em] mb-8">FAQ</p>
        <div>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center py-8"
      >
        <p className="text-gray-600 mb-5">See it live — generate a report in 30 seconds.</p>
        <Link href="/services" className="accent-btn !px-8 !py-3 relative z-10 inline-block">
          Try AICorp →
        </Link>
      </motion.div>
    </div>
  );
}
