import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import HeroCanvas from "@/components/HeroCanvas";
import CursorSpotlight from "@/components/CursorSpotlight";

export const metadata: Metadata = {
  title: "AICorp",
  description: "AI-native financial intelligence firm. Four autonomous agents, on-chain treasury, x402 micropayments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <HeroCanvas />
        </div>
        <CursorSpotlight />
        <Navbar />
        <main className="relative z-10 pt-16">{children}</main>
      </body>
    </html>
  );
}
