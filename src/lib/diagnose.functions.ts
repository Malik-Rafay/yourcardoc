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
});

export type DiagnosisResult = {
  diagnosis: string;
  confidence: "High" | "Medium" | "Low";
  severity: "Low" | "Medium" | "High" | "Critical";
  estimatedCostRange: string;
  diyDifficulty: "Easy" | "Moderate" | "Hard" | "Not Recommended";
  diySteps: string[];
  partsNeeded: { part: string; estimatedCost: string }[];
  mechanicAdvice: string;
  additionalNotes: string;
};

export const runDiagnosis = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<DiagnosisResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured.");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are an expert automotive mechanic AI. The user has a ${data.year} ${data.make} ${data.model} with ${data.mileage} km/miles. They describe these symptoms: "${data.symptoms}". Additional tags: ${data.tags.join(", ") || "none"}.

Respond ONLY with valid JSON (no markdown, no code fences) matching this schema:
{
  "diagnosis": string,
  "confidence": "High" | "Medium" | "Low",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "estimatedCostRange": string,
  "diyDifficulty": "Easy" | "Moderate" | "Hard" | "Not Recommended",
  "diySteps": string[],
  "partsNeeded": [{ "part": string, "estimatedCost": string }],
  "mechanicAdvice": string,
  "additionalNotes": string
}
Use € for currency. Steps should be numbered, concrete, and safety-aware.`;

    const { text } = await generateText({ model, prompt });
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/, "").trim();

    let parsed: DiagnosisResult;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // attempt to extract first JSON object
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned an invalid response.");
      parsed = JSON.parse(match[0]);
    }
    return parsed;
  });