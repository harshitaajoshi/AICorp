const API =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" ? "http://localhost:4021" : "http://localhost:4021");

export interface TreasuryStats {
  revenue: number;
  payroll: number;
  compute: number;
  netMargin: number;
  isSolvent: boolean;
  txCount: number;
  contractAddress: string;
}

export interface LedgerEntry {
  timestamp: string;
  type: string;
  amount: number;
  agent: string;
  note: string;
}

export interface AgentStats {
  id: string;
  name: string;
  role: string;
  address: string;
  tasksCompleted: number;
  totalEarned: number;
  totalCompute: number;
  netProfit: number;
}

export interface ServiceInfo {
  endpoint: string;
  price: string;
  description: string;
  inputField: string;
  agent: string;
  agentRole: string;
}

export interface StatusData {
  corporation: string;
  agentId: string;
  treasury: TreasuryStats & { explorerUrl: string };
  wallets: {
    manager: { address: string; usdcBalance: number };
    worker: { address: string; usdcBalance: number };
  };
  workers: Record<string, AgentStats>;
  ledger: LedgerEntry[];
  services: { endpoint: string; price: string; agent: string }[];
}

export interface DemoResult {
  success: boolean;
  taskId: number;
  service: string;
  agent: string;
  agentRole: string;
  report: Record<string, unknown>;
  corporate: {
    revenue: string;
    payroll: string;
    compute: string;
    netMargin: string;
    isSolvent: boolean;
    txCount: number;
    contract: string;
    explorer: string;
  };
  worker: {
    id: string;
    name: string;
    address: string;
    payroll: string;
    computeCost: string;
    netWorker: string;
    tokensUsed: number;
    payrollTx: string;
    model: string;
  };
}

export async function fetchHealth() {
  const r = await fetch(`${API}/health`);
  return r.json();
}

export async function fetchStatus(): Promise<StatusData> {
  const r = await fetch(`${API}/status`);
  return r.json();
}

export async function fetchServices(): Promise<{ services: ServiceInfo[] }> {
  const r = await fetch(`${API}/services`);
  return r.json();
}

export async function runDemoService(
  service: string,
  target: string
): Promise<DemoResult> {
  const r = await fetch(`${API}/demo${service}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || `Request failed: ${r.status}`);
  }
  return r.json();
}

export function parseDollar(s: string | undefined): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[^0-9.\-]/g, "")) || 0;
}

export function shortenAddr(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
