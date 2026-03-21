/**
 * RuntimePolicyResolver - capability bridge を通じて runtime 実行経路を解決する
 *
 * TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001
 *
 * resolveCapability() を単一 authority とし、4状態（integratedRuntime / terminalSurface / both / none）
 * を AccessCapability として返す。assertNoSilentFallback() で "none" からの暗黙遷移を阻止する。
 */

import {
  type AccessCapability,
  type ExecutionCapabilityInput,
  resolveCapability,
  assertNoSilentFallback,
} from "@repo/shared/types/execution-capability";
import type { IAuthKeyService } from "../auth/types";

// TerminalHandoffBundle 型
export interface TerminalHandoffBundle {
  /** claude -p "..." 形式のコマンド */
  launcher: string;
  /** full prompt context */
  promptBundle: string;
  /** 作業ディレクトリ */
  cwd: string;
  /** コピー可能なコマンド文字列 */
  suggestedCommand: string;
  /** ユーザー向け案内メッセージ */
  manualRetryRule: string;
  /** 詳細操作手順（任意） */
  runbook?: string;
}

/**
 * 4状態対応の RuntimeDecision
 *
 * capability フィールドでまず4状態を判定し、
 * その後 bundle を参照する。
 */
export type RuntimeDecision =
  | { capability: "integratedRuntime" }
  | { capability: "terminalSurface"; bundle: TerminalHandoffBundle }
  | { capability: "both" }
  | { capability: "none" };

export interface IRuntimePolicyResolver {
  resolve(input: ExecutionCapabilityInput): RuntimeDecision;
  resolveFromServices(options?: { silent?: boolean }): Promise<RuntimeDecision>;
}

export class RuntimePolicyResolver implements IRuntimePolicyResolver {
  constructor(private readonly authKeyService?: IAuthKeyService) {}

  /**
   * ExecutionCapabilityInput から RuntimeDecision（4状態）を解決する。
   *
   * パイプライン:
   *   入力(ExecutionCapabilityInput)
   *     → resolveCapability(input)      ← packages/shared
   *     → assertNoSilentFallback(cap)   ← "none" で例外
   *     → RuntimeDecision 構築          ← 付随データ（bundle）を付与
   *     → return
   */
  resolve(input: ExecutionCapabilityInput): RuntimeDecision {
    const capability: AccessCapability = resolveCapability(input);
    assertNoSilentFallback(capability);

    return this.buildDecision(capability);
  }

  /**
   * authKeyService を使って入力を自動構築し、RuntimeDecision を解決するヘルパー。
   * silent: true で assertNoSilentFallback を抑制する（UI 表示目的で取得する際に使用）。
   */
  async resolveFromServices(
    options: { silent?: boolean } = {},
  ): Promise<RuntimeDecision> {
    const apiKey = this.authKeyService
      ? await this.authKeyService.getKey()
      : null;

    const input: ExecutionCapabilityInput = {
      apiKeyValid: typeof apiKey === "string" && apiKey.trim() !== "",
      subscriptionValid: false,
    };

    const capability: AccessCapability = resolveCapability(input);

    if (!options.silent) {
      assertNoSilentFallback(capability);
    }

    return this.buildDecision(capability);
  }

  private buildDecision(capability: AccessCapability): RuntimeDecision {
    switch (capability) {
      case "integratedRuntime":
        return { capability: "integratedRuntime" };
      case "terminalSurface": {
        const bundle = this.buildDefaultBundle();
        return { capability: "terminalSurface", bundle };
      }
      case "both":
        return { capability: "both" };
      case "none":
        return { capability: "none" };
    }
  }

  private buildDefaultBundle(): TerminalHandoffBundle {
    const cwd = process.cwd();
    const suggestedCommand = `claude -p "(スキルのプロンプトを入力してください)"`;
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
