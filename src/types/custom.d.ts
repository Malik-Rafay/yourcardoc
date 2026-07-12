declare module "ai" {
  export interface GenerateTextOptions {
    model: unknown;
    prompt: string;
  }

  export interface GenerateTextResult {
    text: string;
  }

  export function generateText(options: GenerateTextOptions): Promise<GenerateTextResult>;
}
