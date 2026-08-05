declare module "ai" {
  export type MessageContentPart =
    | { type: "text"; text: string }
    | { type: "image"; image: string; mimeType?: string }
    | { type: "file"; mimeType: string; data: string };

  export type ModelMessage = {
    role: "user" | "assistant" | "system";
    content: string | MessageContentPart[];
  };

  export interface GenerateTextOptions {
    model: unknown;
    prompt: string | ModelMessage[];
  }

  export interface GenerateTextResult {
    text: string;
  }

  export function generateText(options: GenerateTextOptions): Promise<GenerateTextResult>;
}