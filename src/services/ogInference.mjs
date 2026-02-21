import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import { config } from "../config.mjs";

// 0G token price in USD (approximate, for cost tracking)
// qwen-2.5-7b-instruct: 0.10 0G per 1M output tokens
// At ~$0.002/0G token on testnet (approximate), each token costs $0.0000002
// We track actual token usage and convert to USD equivalent
const OG_TOKEN_PRICE_USD = 0.002; // rough testnet equivalent

class OGInferenceService {
  constructor() {
    this._broker = null;
    this._ready  = false;
  }

  async init() {
    if (this._ready) return;
    const provider = new ethers.JsonRpcProvider(config.ogRpc);
    const wallet   = new ethers.Wallet(config.ogKey, provider);
    this._broker   = await createZGComputeNetworkBroker(wallet);
    this._ready    = true;
    console.log("  [0G] Broker initialized. Provider:", config.ogProvider);
  }

  /**
   * Run inference on 0G network.
   * @returns { answer: string, tokensUsed: number, costUsd: number }
   */
  async infer(prompt, systemPrompt = "You are a helpful AI assistant for AICorp.") {
    await this.init();

    const { endpoint, model } = await this._broker.inference.getServiceMetadata(config.ogProvider);
    const headers = await this._broker.inference.getRequestHeaders(config.ogProvider);

    const body = JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: prompt },
      ],
      max_tokens: 512,
    });

    const res = await fetch(`${endpoint}/chat/completions`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`0G inference failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const answer     = data.choices?.[0]?.message?.content ?? "";
    const tokensUsed = data.usage?.total_tokens ?? 0;

    // Process response for automatic fee management
    if (data.usage) {
      await this._broker.inference.processResponse(
        config.ogProvider,
        undefined,
        JSON.stringify(data.usage)
      );
    }

    // Cost: output tokens at 0.10 0G per 1M tokens → convert to USD
    const ogTokensSpent = (tokensUsed / 1_000_000) * 0.10;
    const costUsd       = ogTokensSpent * OG_TOKEN_PRICE_USD;

    console.log(`  [0G] Inference complete | ${tokensUsed} tokens | ~$${costUsd.toFixed(6)} USD`);

    return { answer, tokensUsed, costUsd, model, endpoint };
  }
}

export const ogInference = new OGInferenceService();
