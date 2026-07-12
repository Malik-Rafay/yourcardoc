import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Create an OpenAI-compatible provider. Prefer the Lovable gateway when the
// key is intended for Lovable; fall back to the real OpenAI API when a
// standard OpenAI key (sk-...) is provided (useful for local development).
export function createLovableAiGatewayProvider(apiKey: string) {
  const prefix = apiKey?.slice(0, 6) ?? "";
  // Heuristic: OpenAI API keys start with "sk-".
  const looksLikeOpenAIKey = typeof apiKey === "string" && apiKey.startsWith("sk-");

  if (looksLikeOpenAIKey) {
    // Use OpenAI directly.
    return createOpenAICompatible({
      name: "openai",
      baseURL: "https://api.openai.com/v1",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  // Default: Lovable gateway.
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}
