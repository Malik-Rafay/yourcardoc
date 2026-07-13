import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  year: z.string().trim().max(10),
  make: z.string().trim().max(60),
  model: z.string().trim().max(60),
  mileage: z.string().trim().max(20),
  symptoms: z.string().trim().min(3).max(2000),
  tags: z.array(z.string().max(40)).max(20).default([]),
  language: z.string().max(20).default("en"),
  region: z.string().max(20).default("EU"),
  currency: z.string().max(10).default("EUR"),
});

export type DiagStep = {
  title: string;
  instruction: string;
  tip?: string;
  imagePrompt: string;
  searchQuery: string;
};
export type DiagPart = {
  part: string;
  estimatedCost: string;
  priceLow: number;
  priceHigh: number;
  searchQuery: string;
};
export type DiagTool = { name: string; searchQuery: string };

export type DiagnosisResult = {
  diagnosis: string;
  confidence: "High" | "Medium" | "Low";
  severity: "Low" | "Medium" | "High" | "Critical";
  estimatedCostRange: string;
  diyDifficulty: "Easy" | "Moderate" | "Hard" | "Not Recommended";
  diySteps: DiagStep[];
  partsNeeded: DiagPart[];
  toolsNeeded: DiagTool[];
  youtubeQueries: string[];
  vehicleImagePrompt: string;
  mechanicAdvice: string;
  additionalNotes: string;
};

const LANG_NAMES: Record<string, string> = {
  en: "English",
  fi: "Finnish",
  de: "German",
  es: "Spanish",
  fr: "French",
};

// Unified helper to guarantee we extract whichever key name is populated in Vercel/Local environment variables
function getActiveApiKey(): string {
  const key = process.env.OPENAI_API_KEY || process.env.LOVABLE_API_KEY || process.env.VITE_OPENAI_API_KEY || process.env.VITE_LOVABLE_API_KEY;
  if (!key) {
    console.error("AI Configuration Error: No API keys discovered in environment variables.");
    throw new Error("AI is not configured.");
  }
  return key;
}

export const runDiagnosis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<DiagnosisResult> => {
    const key = getActiveApiKey();
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("gpt-4o");

    const langName = LANG_NAMES[data.language] ?? "English";
    const prompt = `You are an expert automotive mechanic AI. The user has a ${data.year} ${data.make} ${data.model} with ${data.mileage} km/miles. They describe these symptoms: "${data.symptoms}". Additional tags: ${data.tags.join(", ") || "none"}.

IMPORTANT:
- Respond in ${langName}. All human-readable strings must be in ${langName}.
- The user is in region: ${data.region}. Price estimates MUST reflect typical parts AND labor costs for that region.
- Use ${data.currency} for currency. Provide realistic priceLow/priceHigh numbers (not symbolic).
- searchQuery fields MUST be in English (for product/video search engines), and should include the exact car: "${data.year} ${data.make} ${data.model}" where relevant.
- imagePrompt fields MUST be in English and describe a clear, photorealistic close-up illustration of what the user does in that step.

Respond ONLY with valid JSON (no markdown, no code fences) matching this schema exactly:
{
  "diagnosis": string,
  "confidence": "High" | "Medium" | "Low",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "estimatedCostRange": string,
  "diyDifficulty": "Easy" | "Moderate" | "Hard" | "Not Recommended",
  "diySteps": [{ "title": string, "instruction": string, "tip": string, "imagePrompt": string, "searchQuery": string }],
  "partsNeeded": [{ "part": string, "estimatedCost": string, "priceLow": number, "priceHigh": number, "searchQuery": string }],
  "toolsNeeded": [{ "name": string, "searchQuery": string }],
  "youtubeQueries": string[],
  "vehicleImagePrompt": string,
  "mechanicAdvice": string,
  "additionalNotes": string
}

- diySteps: 4–10 concrete, safety-aware steps. "title" is short (max 8 words). "instruction" is 1–3 sentences.
- youtubeQueries: 3–5 distinct YouTube search queries that would surface helpful tutorials for THIS specific car and problem.
- vehicleImagePrompt: a one-sentence prompt describing the user's car (year, make, model, common color, 3/4 angle, studio lighting, photorealistic) for an image generator.`;

    let text: string;
    try {
      const res = await generateText({ model, prompt });
      text = res.text;
    } catch (err) {
      console.error("runDiagnosis generateText error:", err);
      throw new Error("AI generation failed. Check server logs for details.");
    }
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();

    let parsed: DiagnosisResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned an invalid response.");
      parsed = JSON.parse(match[0]);
    }
    return parsed;
  });

const ExplainInput = z.object({
  stepTitle: z.string().max(200),
  stepInstruction: z.string().max(1000),
  vehicle: z.string().max(200),
  language: z.string().max(20).default("en"),
});

export const explainStep = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ExplainInput.parse(input))
  .handler(async ({ data }): Promise<{ detail: string }> => {
    const key = getActiveApiKey();
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("gpt-4o"); // Enforces direct OpenAI structure cleanly
    
    const langName = LANG_NAMES[data.language] ?? "English";
    const prompt = `Vehicle: ${data.vehicle}. A user is stuck on this repair step:
Title: ${data.stepTitle}
Instruction: ${data.stepInstruction}

Write a detailed, beginner-friendly walkthrough in ${langName} (5–10 short paragraphs) explaining exactly how to perform this step safely. Include tool handling, common mistakes, what success looks like, and what to do if something doesn't fit. Plain text only, no markdown.`;
    
    let detailText: string;
    try {
      const res = await generateText({ model, prompt });
      detailText = res.text;
    } catch (err) {
      console.error("explainStep generateText error:", err);
      throw new Error("AI generation failed. Check server logs for details.");
    }
    return { detail: detailText.trim() };
  });

const ImageInput = z.object({ prompt: z.string().min(3).max(500) });

export const generateImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ImageInput.parse(input))
  .handler(async ({ data }): Promise<{ dataUrl: string }> => {
    const key = getActiveApiKey(); // Uses unified fallback structure instead of crashing without LOVABLE_API_KEY
    
    const res = await fetch("[https://ai.gateway.lovable.dev/v1/images/generations](https://ai.gateway.lovable.dev/v1/images/generations)", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: data.prompt }],
        modalities: ["image", "text"],
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Image generation failed: ${res.status} ${t.slice(0, 200)}`);
    }
    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image returned");
    return { dataUrl: `data:image/png;base64,${b64}` };
  });