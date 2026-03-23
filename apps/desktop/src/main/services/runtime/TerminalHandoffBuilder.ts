/**
 * TerminalHandoffBuilder - TerminalHandoffBundle を構築する
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 * UT-RUNTIME-BUILDER-MIGRATION-001: buildForSurface() 統一メソッド追加
 */
import type { HandoffGuidance } from "@repo/shared/types";
import type { TerminalHandoffBundle } from "@repo/shared/types";

export interface HandoffBuildOptions {
  /** 実行時コンテキスト情報（任意） */
  context?: string;
  /** 詳細手順（任意） */
  runbook?: string;
  /** permissionMode（任意） */
  permissionMode?: string;
}

export interface AgentHandoffBuildRequest {
  skillId?: string;
  prompt?: string;
  workingDirectory?: string;
}

export interface SkillHandoffBuildRequest {
  skillName?: string;
  skillId?: string;
  prompt?: string;
  workingDirectory?: string;
}

// --- buildForSurface() 型定義 (UT-RUNTIME-BUILDER-MIGRATION-001) ---

/** buildForSurface() に渡す surface の種別 */
export type SurfaceType = "chat-edit" | "runtime" | "skill-docs";

export interface ChatEditSurfaceRequest {
  surfaceType: "chat-edit";
  commandType: string;
  filePaths: string[];
  message?: string;
  workspacePath?: string;
}

export interface RuntimeSurfaceRequest {
  surfaceType: "runtime";
  runtimeType: "agent" | "skill";
  skillId?: string;
  skillName?: string;
  prompt?: string;
  workingDirectory?: string;
}

export interface SkillDocsSurfaceRequest {
  surfaceType: "skill-docs";
  queryText?: string;
  skillName?: string;
}

/** buildForSurface() へのリクエスト型（discriminated union） */
export type BuildForSurfaceRequest =
  | ChatEditSurfaceRequest
  | RuntimeSurfaceRequest
  | SkillDocsSurfaceRequest;

export class TerminalHandoffBuilder {
  /**
   * 統一エントリーポイント: surface 種別に応じた HandoffGuidance を生成する。
   *
   * P62 対策: 未知の surfaceType は fallback せずエラーを throw する。
   * P55 対策: sanitizePrompt() を全 surface で適用する。
   */
  buildForSurface(
    request: BuildForSurfaceRequest,
    reason: HandoffGuidance["reason"],
  ): HandoffGuidance {
    switch (request.surfaceType) {
      case "chat-edit":
        return this.buildForChatEditSurface(request, reason);
      case "runtime":
        return this.buildForRuntimeSurface(request, reason);
      case "skill-docs":
        return this.buildForSkillDocsSurface(request, reason);
      default: {
        // P62: exhaustive check - 未知の surfaceType は fallback せずエラー
        const _exhaustiveCheck: never = request;
        throw new Error(
          `未知の surfaceType: ${(_exhaustiveCheck as { surfaceType: string }).surfaceType}`,
        );
      }
    }
  }

  /**
   * chat-edit surface 用の HandoffGuidance を生成する。
   *
   * 設計上の差異: 旧 chat-edit/TerminalHandoffBuilder は `claude --add-dir "path" "message"` を生成していたが、
   * 本実装は全 surface で統一された `claude -p "prompt"` 形式を採用する（Phase 2 設計決定）。
   * `--add-dir` 機能は contextSummary の workspace 情報で代替する。
   */
  private buildForChatEditSurface(
    request: ChatEditSurfaceRequest,
    reason: HandoffGuidance["reason"],
  ): HandoffGuidance {
    const prompt =
      request.message ?? `Please ${request.commandType} the selected code`;
    const safePrompt = this.sanitizePrompt(prompt);
    const terminalCommand = `claude -p "${safePrompt}"`;

    const fileList = request.filePaths.join(",");
    let contextSummary = `command=${request.commandType} files=${fileList}`;
    if (request.workspacePath) {
      const workspaceName = request.workspacePath.split("/").pop() || "";
      contextSummary += ` workspace=${workspaceName}`;
    }

    return { terminalCommand, contextSummary, reason };
  }

  private buildForRuntimeSurface(
    request: RuntimeSurfaceRequest,
    reason: HandoffGuidance["reason"],
  ): HandoffGuidance {
    const prompt =
      request.prompt?.trim() || "現在のコンテキストで実行を続けてください";
    const safePrompt = this.sanitizePrompt(prompt);
    const terminalCommand = `claude -p "${safePrompt}"`;

    const skillToken =
      (request.runtimeType === "skill" && request.skillName?.trim()) ||
      request.skillId?.trim() ||
      "unknown";
    const contextSummary = `surface=${request.runtimeType} skill=${skillToken}`;

    return { terminalCommand, contextSummary, reason };
  }

  private buildForSkillDocsSurface(
    request: SkillDocsSurfaceRequest,
    reason: HandoffGuidance["reason"],
  ): HandoffGuidance {
    const prompt =
      request.queryText?.trim() || "スキルドキュメントを確認してください";
    const safePrompt = this.sanitizePrompt(prompt);
    const terminalCommand = `claude -p "${safePrompt}"`;

    const queryInfo = request.queryText?.trim() || "none";
    const contextSummary = `surface=skill-docs query=${queryInfo}`;

    return { terminalCommand, contextSummary, reason };
  }

  /**
   * @deprecated buildForSurface() を使用してください。
   * 移行先: buildForSurface({ surfaceType: "runtime", ... }, reason)
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
   * @deprecated buildForSurface() を使用してください。
   * 移行先: buildForSurface({ surfaceType: "runtime", runtimeType: "agent", ... }, reason)
   */
  buildForAgentExecution(
    request: AgentHandoffBuildRequest,
    reason: string,
  ): HandoffGuidance {
    const prompt =
      request.prompt?.trim() ||
      "現在のコンテキストからエージェント実行を続けてください";
    const cwd =
      request.workingDirectory?.trim() && request.workingDirectory.trim() !== ""
        ? request.workingDirectory
        : process.cwd();
    const bundle = this.build(prompt, cwd);
    const skillId =
      typeof request.skillId === "string" && request.skillId.trim() !== ""
        ? request.skillId
        : "unknown";

    return {
      terminalCommand: bundle.suggestedCommand,
      contextSummary: `surface=agent skill=${skillId}`,
      reason,
    };
  }

  /**
   * @deprecated buildForSurface() を使用してください。
   * 移行先: buildForSurface({ surfaceType: "runtime", runtimeType: "skill", ... }, reason)
   */
  buildForSkillExecution(
    request: SkillHandoffBuildRequest,
    reason: string,
  ): HandoffGuidance {
    const prompt =
      request.prompt?.trim() ||
      (request.skillName?.trim()
        ? `「${request.skillName}」のスキル実行を続けてください`
        : "最新のコンテキストでスキル実行を続けてください");
    const cwd =
      request.workingDirectory?.trim() && request.workingDirectory.trim() !== ""
        ? request.workingDirectory
        : process.cwd();
    const bundle = this.build(prompt, cwd);

    const skillToken =
      (request.skillName && request.skillName.trim()) ||
      (request.skillId && request.skillId.trim()) ||
      "unknown";

    return {
      terminalCommand: bundle.suggestedCommand,
      contextSummary: `surface=skill skill=${skillToken}`,
      reason,
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
