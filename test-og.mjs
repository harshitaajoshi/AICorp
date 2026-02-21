import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import "dotenv/config";

const PROVIDER_ADDRESS = "0xa48f01287233509FD694a22Bf840225062E67836";
const RPC_URL = "https://evmrpc-testnet.0g.ai";
const PRIVATE_KEY = "0x679bd110e4ebba53a3733d0cadb854f7056a8ed806e95d56b22fb57a046e72c9";

async function main() {
  console.log("🔌 Connecting to 0G Newton testnet...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("✅ Wallet:", wallet.address);

  console.log("🤖 Initializing 0G broker...");
  const broker = await createZGComputeNetworkBroker(wallet);

  console.log("📊 Getting account balance...");
  const account = await broker.ledger.getLedger();
  console.log("✅ Account balance:", account.balance?.toString() || "0", "0G");

  console.log("🔍 Getting service metadata for provider...");
  const { endpoint, model } = await broker.inference.getServiceMetadata(PROVIDER_ADDRESS);
  console.log("✅ Endpoint:", endpoint);
  console.log("✅ Model:", model);

  console.log("🔑 Getting request headers...");
  const headers = await broker.inference.getRequestHeaders(PROVIDER_ADDRESS);

  console.log("💬 Making inference call...");
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "Say 'AICorp is live on 0G' in exactly 5 words." }],
      max_tokens: 20,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Inference failed:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const answer = data.choices?.[0]?.message?.content;
  console.log("✅ Response:", answer);

  if (data.usage) {
    await broker.inference.processResponse(PROVIDER_ADDRESS, undefined, JSON.stringify(data.usage));
    console.log("✅ Fee processed. Tokens used:", data.usage.total_tokens);
  }

  console.log("\n🎉 0G inference is fully working!");
}

main().catch((e) => {
  console.error("❌ Error:", e.message || e);
  process.exit(1);
});
