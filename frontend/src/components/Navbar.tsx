"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/services", label: "Services" },
  { href: "/ledger", label: "Ledger" },
  { href: "/agents", label: "Agents" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [alive, setAlive] = useState(true);
  const [time, setTime] = useState("");

  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch("http://localhost:4021/health");
        setAlive(r.ok);
      } catch {
        setAlive(false);
      }
    };
    poll();
    const iv = setInterval(poll, 8000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1f1f1f]/60 backdrop-blur-xl bg-black/80">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center relative">
        {/* Logo — left */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Circle grid logo */}
          <svg width="20" height="20" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
            <circle cx="10" cy="10" r="5" fill="white"/>
            <circle cx="22" cy="10" r="5" fill="white"/>
            <circle cx="34" cy="10" r="5" fill="white"/>
            <circle cx="46" cy="10" r="5" fill="white"/>
            <circle cx="58" cy="10" r="5" fill="white"/>
            <circle cx="10" cy="22" r="5" fill="white"/>
            <circle cx="22" cy="22" r="5" fill="white"/>
            <circle cx="34" cy="22" r="5" fill="white"/>
            <circle cx="46" cy="22" r="5" fill="white"/>
            <circle cx="58" cy="22" r="5" fill="white"/>
            <circle cx="10" cy="34" r="5" fill="white"/>
            <circle cx="22" cy="34" r="5" fill="white"/>
            <circle cx="34" cy="34" r="5" fill="white"/>
            <circle cx="46" cy="34" r="5" fill="white"/>
            <circle cx="58" cy="34" r="5" fill="white"/>
            <circle cx="10" cy="46" r="5" fill="white"/>
            <circle cx="22" cy="46" r="5" fill="white"/>
            <circle cx="34" cy="46" r="5" fill="white"/>
            <circle cx="46" cy="46" r="5" fill="white"/>
            <circle cx="58" cy="46" r="5" fill="white"/>
            <circle cx="10" cy="58" r="5" fill="white"/>
            <circle cx="22" cy="58" r="5" fill="white"/>
            <circle cx="34" cy="58" r="5" fill="white"/>
            <circle cx="46" cy="58" r="5" fill="white"/>
            <circle cx="58" cy="58" r="5" fill="white"/>
          </svg>
          <span className="text-sm font-medium text-white group-hover:text-[#5EEAD4] transition-colors tracking-wide">
            AICorp
          </span>
        </Link>

        {/* Nav links — absolutely centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-[0.12em] uppercase transition-colors ${
                  active
                    ? "text-white"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Status — right */}
        <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
          <span className="mono-data hidden md:block">{time}</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2a2a2a]">
            <div className={`w-1.5 h-1.5 rounded-full ${alive ? "live-dot" : "bg-red-500 animate-pulse"}`} />
            <span className={`font-medium text-xs ${alive ? "text-[#5EEAD4]" : "text-red-500"}`}>
              {alive ? "LIVE" : "OFFLINE"}
            </span>
            <span className="text-gray-600">Base Sepolia</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
