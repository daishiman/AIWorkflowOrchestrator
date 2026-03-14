/**
 * AnthropicLLMAdapter
 *
 * Electron の net.fetch を使用して Anthropic API を直接呼び出す LLMAdapter 実装。
 * Main Process で動作するため Node.js の fetch ではなく net.fetch を使用する。
 */
import { net } from "electron";
import type { LLMAdapter } from "./ChatEditService";
import { ANTHROPIC_API_ENDPOINT, ANTHROPIC_API_VERSION } from "../auth/types";

export class AnthropicLLMAdapter implements LLMAdapter {
  constructor(private readonly apiKey: string) {}

  async sendMessage(prompt: string): Promise<{
    success: boolean;
    data?: { message: string };
    error?: { message: string };
  }> {
    try {
      const response = await net.fetch(ANTHROPIC_API_ENDPOINT, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "anthropic-version": ANTHROPIC_API_VERSION,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: { message: `Anthropic API error: ${response.status}` },
        };
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };

      const text = data.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("");

      return { success: true, data: { message: text } };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Network error",
        },
      };
    }
  }
}
