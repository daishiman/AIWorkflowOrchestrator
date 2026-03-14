/**
 * RuntimeResolver
 *
 * authMode × API key の組み合わせからランタイムを決定する。
 * - "subscription" → ターミナルハンドオフ（Claude Code CLI 利用）
 * - "api-key" + hasKey → integrated（Anthropic API 直接呼び出し）
 * - "api-key" + no key → ターミナルハンドオフ
 */
import type { IAuthKeyService, IAuthModeService } from "../auth/types";
import type { LLMAdapter } from "./ChatEditService";
import { AnthropicLLMAdapter } from "./AnthropicLLMAdapter";

export type RuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string };

export class RuntimeResolver {
  constructor(
    private readonly authKeyService: IAuthKeyService,
    private readonly authModeService: IAuthModeService,
  ) {}

  async resolve(): Promise<RuntimeResolution> {
    const authMode = this.authModeService.getMode();

    if (authMode === "subscription") {
      return {
        type: "handoff",
        reason: "subscription mode: use Claude Code CLI",
      };
    }

    // api-key mode
    const hasKey = await this.authKeyService.hasKey();
    if (!hasKey) {
      return { type: "handoff", reason: "API key not configured" };
    }

    const apiKey = await this.authKeyService.getKey();
    if (!apiKey) {
      return { type: "handoff", reason: "API key unavailable" };
    }

    return {
      type: "integrated",
      adapter: new AnthropicLLMAdapter(apiKey),
    };
  }
}
