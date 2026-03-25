/**

 * RuntimePolicyResolver - runtime 実行経路を解決する
 *
 * TASK-SC-02-RUNTIME-POLICY-CLOSURE
 *
 * authMode と apiKey を受け取り、実行経路（integrated_api / terminal_handoff）を決定する。
 * Skill / Agent / Skill Creator の全 surface が共通して参照する。
 *
 * 3パターン分岐:
 * - パターンA: apiKey 有効 → integrated_api
 * - パターンB: apiKey 無効 + subscription 無効 → terminal_handoff (no-auth)
 * - パターンC: apiKey 無効 + subscription 有効 → terminal_handoff (subscription)
 */

import type {
  AuthMode,
  ISubscriptionAuthProvider,
} from "@repo/shared/types/auth-mode";
import type { TerminalHandoffBundle, HealthPolicy } from "@repo/shared/types";
import type { IAuthKeyService } from "../auth/types";

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
  resolveWithService(authMode: AuthMode): Promise<RuntimeDecision>;
}

export class RuntimePolicyResolver implements IRuntimePolicyResolver {
  constructor(
    private readonly authKeyService?: IAuthKeyService,
    private readonly subscriptionAuthProvider?: ISubscriptionAuthProvider,
    private readonly healthPolicy?: HealthPolicy,
  ) {}

  async resolve(
    _authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeDecision> {
    // DENY-1: claude.ai consumer 認証の流用を拒否
    if (typeof apiKey === "string" && isConsumerToken(apiKey)) {
      throw new Error(
        "Consumer authentication tokens (claude.ai) are not accepted. Please use an API key.",
      );
    }
    // degraded チェック: HealthPolicy 経由（D-4）
    // P62 対策: degraded 時は integrated_api への暗黙 fallback を禁止
    if (this.healthPolicy?.isDegraded) {
      const isSubscriptionValid = await this.checkSubscription();
      if (isSubscriptionValid) {
        return {
          type: "terminal_handoff",
          bundle: this.buildDegradedBundle(),
        };
      }
      return {
        type: "terminal_handoff",
        bundle: this.buildNoAuthBundle(),
      };
    }
    const trimmedKey = typeof apiKey === "string" ? apiKey.trim() : "";
    if (trimmedKey !== "") {
      return {
        type: "integrated_api",
        apiKey: trimmedKey,
        permissionMode: "default",
      };
    }

    const isSubscriptionValid = await this.checkSubscription();
    const bundle = isSubscriptionValid
      ? this.buildSubscriptionBundle()
      : this.buildNoAuthBundle();
    return { type: "terminal_handoff", bundle };
  }

  async resolveWithService(authMode: AuthMode): Promise<RuntimeDecision> {
    let apiKey: string | null = null;
    try {
      apiKey = this.authKeyService ? await this.authKeyService.getKey() : null;
    } catch (error) {
      console.warn(
        "[RuntimePolicyResolver] AuthKeyService.getKey() failed, falling back to subscription check",
        error instanceof Error ? error.message : "unknown error",
      );
    }
    return this.resolve(authMode, apiKey);
  }

  private async checkSubscription(): Promise<boolean> {
    if (!this.subscriptionAuthProvider) return false;
    try {
      return await this.subscriptionAuthProvider.validateToken();
    } catch (error) {
      console.warn(
        "[RuntimePolicyResolver] subscription validation failed, falling back to no-auth",
        error instanceof Error ? error.message : "unknown error",
      );
      return false;
    }
  }

  private buildSubscriptionBundle(): TerminalHandoffBundle {
    return {
      launcher: "claude",
      promptBundle: "",
      cwd: process.cwd(),
      suggestedCommand: 'claude -p "（スキルのプロンプトを入力してください）"',
      manualRetryRule:
        "Claude Code サブスクリプションが有効です。以下のコマンドをターミナルで実行してください。",
      runbook:
        "1. ターミナルを開く\n2. 以下のコマンドを実行\n3. Claude Code CLI がサブスクリプション認証で実行されます",
    };
  }

  private buildDegradedBundle(): TerminalHandoffBundle {
    return {
      launcher: "claude",
      promptBundle: "",
      cwd: process.cwd(),
      suggestedCommand: 'claude -p "（プロンプトを入力してください）"',
      manualRetryRule:
        "接続品質が低下しています。ターミナルで手動実行してください。",
      runbook:
        "1. ターミナルを開く\n2. 接続状態を確認\n3. 手動でコマンドを実行",
    };
  }

  private buildNoAuthBundle(): TerminalHandoffBundle {
    return {
      launcher: "claude",
      promptBundle: "",
      cwd: process.cwd(),
      suggestedCommand: 'claude -p "（スキルのプロンプトを入力してください）"',
      manualRetryRule:
        "認証情報が設定されていません。設定画面で API Key を設定するか、Claude Code CLI で /login を実行してください。",
    };
  }
}

/**
 * claude.ai consumer token パターンを検出する (CAG-1)
 * sess- prefix は claude.ai session token の既知パターン
 */
function isConsumerToken(token: string): boolean {
  const trimmed = token.trim();
  return trimmed.startsWith("sess-") || trimmed.startsWith("sessionKey=");
}
