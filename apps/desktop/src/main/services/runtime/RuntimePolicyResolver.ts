/**
 * RuntimePolicyResolver - runtime 実行経路を解決する
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 *
 * authMode と apiKey を受け取り、実行経路（integrated_api / terminal_handoff）を決定する。
 * Skill / Agent / Skill Creator の全 surface が共通して参照する。
 */

// AuthMode 型は packages/shared から import
import type { AuthMode } from "@repo/shared/types/auth-mode";
import type { TerminalHandoffBundle } from "@repo/shared/types";
import type { IAuthKeyService } from "../auth/types";

// RuntimeDecision 型
export type RuntimeDecision =
  | {
      type: "integrated_api";
      apiKey: string;
      permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
    }
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
    };

export interface IRuntimePolicyResolver {
  resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>;
}

export class RuntimePolicyResolver implements IRuntimePolicyResolver {
  constructor(private readonly authKeyService?: IAuthKeyService) {}

  /**
   * authMode と apiKey から RuntimeDecision を解決する。
   *
   * ルール:
   * - authMode === "api-key" かつ apiKey が非空文字列 → integrated_api
   * - authMode === "subscription" → terminal_handoff
   * - authMode === "api-key" かつ apiKey が null/空  → terminal_handoff (fallback)
   */
  async resolve(
    authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeDecision> {
    // "api-key" モードかつ有効な apiKey があれば integrated_api
    if (
      authMode === "api-key" &&
      typeof apiKey === "string" &&
      apiKey.trim() !== ""
    ) {
      return {
        type: "integrated_api",
        apiKey: apiKey.trim(),
        permissionMode: "default",
      };
    }

    // それ以外（subscription モード、または api-key だが apiKey が空）は terminal_handoff
    const bundle = this.buildDefaultBundle();
    return {
      type: "terminal_handoff",
      bundle,
    };
  }

  /**
   * authMode を自動解決するヘルパー（authKeyService が DI されている場合）
   */
  async resolveWithService(authMode: AuthMode): Promise<RuntimeDecision> {
    const apiKey = this.authKeyService
      ? await this.authKeyService.getKey()
      : null;
    return this.resolve(authMode, apiKey);
  }

  private buildDefaultBundle(): TerminalHandoffBundle {
    const cwd = process.cwd();
    const suggestedCommand = `claude -p "（スキルのプロンプトを入力してください）"`;
    return {
      launcher: "claude",
      promptBundle: "",
      cwd,
      suggestedCommand,
      manualRetryRule:
        "以下のコマンドを terminal で実行してください。Claude Code が必要です。",
    };
  }
}
