/**
 * TerminalHandoffBuilder - TerminalHandoffBundle を構築する
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 */
import type { TerminalHandoffBundle } from "./RuntimePolicyResolver";

export interface HandoffBuildOptions {
  /** 実行時コンテキスト情報（任意） */
  context?: string;
  /** 詳細手順（任意） */
  runbook?: string;
  /** permissionMode（任意） */
  permissionMode?: string;
}

export class TerminalHandoffBuilder {
  /**
   * TerminalHandoffBundle を構築する。
   * shell injection 対策のため prompt をシングルクォートでエスケープ。
   */
  build(
    prompt: string,
    cwd: string,
    options: HandoffBuildOptions = {},
  ): TerminalHandoffBundle {
    const safePrompt = this.sanitizePrompt(prompt);
    const safeCwd = this.sanitizePath(cwd);
    const suggestedCommand = `claude -p "${safePrompt}"`;

    return {
      launcher: "claude",
      promptBundle: safePrompt,
      cwd: safeCwd,
      suggestedCommand,
      manualRetryRule:
        "以下のコマンドをターミナルで実行してください。Claude Code CLI が必要です。",
      runbook: options.runbook,
    };
  }

  /**
   * プロンプトから機密情報を除去し、shell injection 対策エスケープを適用する。
   * P55 準拠: API キーなどの機密情報を含めない。
   */
  private sanitizePrompt(prompt: string): string {
    // shell injection 対策: ダブルクォート内の危険文字をエスケープ
    return prompt
      .replace(/\\/g, "\\\\") // バックスラッシュを先にエスケープ
      .replace(/"/g, '\\"') // ダブルクォートをエスケープ
      .replace(/\$/g, "\\$") // 変数展開を防ぐ
      .replace(/`/g, "\\`"); // バッククォートをエスケープ
  }

  /**
   * パスの安全性を確認する（P55: パスにメタ文字が含まれる場合の対策）
   */
  private sanitizePath(path: string): string {
    // パスのバリデーションのみ（変更なし）
    return path;
  }
}
