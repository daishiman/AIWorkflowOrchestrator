# Claude Code CLI統合 - 型定義設計書

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | claude-code-cli-integration |
| バージョン | 1.0.0                       |
| 作成日     | 2026-01-17                  |
| Phase      | 2                           |

---

## 1. 型定義概要

### 1.1 型定義の配置

| 配置場所                                      | 用途                            |
| --------------------------------------------- | ------------------------------- |
| `packages/shared/src/claude-cli/types.ts`     | 共有型定義（Main/Renderer共通） |
| `apps/desktop/src/main/claude-cli/types.ts`   | Main Process専用型              |
| `apps/desktop/src/renderer/types/global.d.ts` | グローバル型拡張                |

### 1.2 型定義の方針

1. **共有型**: IPC通信で使用する型は`@repo/shared`に配置
2. **Result型**: 全APIレスポンスは`Result<T>`型で統一
3. **Zodスキーマ**: バリデーション用にZodスキーマを定義
4. **型推論**: Zodスキーマから型を推論（`z.infer<>`）

---

## 2. 共有型定義

### 2.1 Result型

```typescript
// packages/shared/src/claude-cli/types.ts

/**
 * 成功または失敗を表す汎用Result型
 */
export type Result<T, E = CliError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Result型のヘルパー関数
 */
export const Result = {
  /**
   * 成功Result を作成
   */
  ok<T>(data: T): Result<T> {
    return { success: true, data };
  },

  /**
   * 失敗Result を作成
   */
  err<T = never>(error: CliError): Result<T> {
    return { success: false, error };
  },

  /**
   * Result が成功か判定
   */
  isOk<T>(result: Result<T>): result is { success: true; data: T } {
    return result.success;
  },

  /**
   * Result が失敗か判定
   */
  isErr<T>(result: Result<T>): result is { success: false; error: CliError } {
    return !result.success;
  },

  /**
   * Result からデータを取得（失敗時は例外）
   */
  unwrap<T>(result: Result<T>): T {
    if (result.success) {
      return result.data;
    }
    throw new Error(result.error.message);
  },

  /**
   * Result からデータを取得（失敗時はデフォルト値）
   */
  unwrapOr<T>(result: Result<T>, defaultValue: T): T {
    if (result.success) {
      return result.data;
    }
    return defaultValue;
  },
};
```

### 2.2 エラー型

```typescript
// packages/shared/src/claude-cli/types.ts

/**
 * CLIエラーコード
 */
export type CliErrorCode =
  // CLI関連
  | "CLI_NOT_INSTALLED"
  | "CLI_VERSION_MISMATCH"
  | "CLI_TIMEOUT"
  | "CLI_MANAGER_NOT_INITIALIZED"
  // スキル関連
  | "SKILL_NOT_FOUND"
  | "SKILL_INVALID"
  | "SKILL_SCAN_FAILED"
  | "SKILL_PARSE_FAILED"
  // セッション関連
  | "SESSION_NOT_FOUND"
  | "SESSION_LIMIT_EXCEEDED"
  | "SESSION_ALREADY_TERMINATED"
  // セキュリティ関連
  | "PATH_TRAVERSAL_DETECTED"
  | "IPC_SENDER_INVALID"
  | "COMMAND_INJECTION_DETECTED"
  // 実行関連
  | "SCRIPT_NOT_FOUND"
  | "UNSUPPORTED_SCRIPT_TYPE"
  | "PROCESS_SPAWN_FAILED"
  | "EXECUTION_FAILED"
  // 一般
  | "VALIDATION_ERROR"
  | "NOT_IMPLEMENTED"
  | "UNKNOWN_ERROR";

/**
 * CLIエラー
 */
export interface CliError {
  /** エラーコード */
  code: CliErrorCode;
  /** 人間可読なエラーメッセージ */
  message: string;
  /** 追加の詳細情報 */
  details?: unknown;
  /** スタックトレース（開発時のみ） */
  stack?: string;
}

/**
 * エラー生成ヘルパー
 */
export function createCliError(
  code: CliErrorCode,
  message: string,
  details?: unknown,
): CliError {
  return { code, message, details };
}

/**
 * 未知のエラーをCliErrorに変換
 */
export function toCliError(error: unknown): CliError {
  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      details: error,
      stack: error.stack,
    };
  }
  return {
    code: "UNKNOWN_ERROR",
    message: String(error),
    details: error,
  };
}
```

### 2.3 CLIインストール状態

```typescript
// packages/shared/src/claude-cli/types.ts

/**
 * CLIインストール状態
 */
export interface CliInstallationStatus {
  /** CLIがインストールされているか */
  installed: boolean;
  /** CLIバージョン（インストール済みの場合） */
  version: string | null;
  /** CLI実行パス（インストール済みの場合） */
  path: string | null;
  /** エラーメッセージ（未インストールの場合） */
  error: string | null;
}
```

### 2.4 スキル関連型

```typescript
// packages/shared/src/claude-cli/types.ts

/**
 * スキルメタデータ
 */
export interface SkillMetadata {
  /** スキル名（kebab-case） */
  name: string;
  /** スキルディレクトリのパス */
  path: string;
  /** スキルの説明 */
  description: string;
  /** タグ一覧 */
  tags: string[];
  /** トリガーキーワード */
  triggers: string[];
  /** 依存スキル */
  dependencies: string[];
  /** 許可ツール */
  allowedTools: string[];
  /** scripts/ ディレクトリが存在するか */
  hasScripts: boolean;
  /** references/ ディレクトリが存在するか */
  hasReferences: boolean;
}

/**
 * スキル詳細情報
 */
export interface SkillDetail extends SkillMetadata {
  /** SKILL.md の本文 */
  content: string;
  /** スクリプト一覧 */
  scripts?: ScriptInfo[];
  /** 参照ファイル一覧 */
  references?: ReferenceInfo[];
}

/**
 * スクリプト情報
 */
export interface ScriptInfo {
  /** スクリプト名 */
  name: string;
  /** スクリプトのパス */
  path: string;
  /** スクリプトの種類 */
  type: ScriptType;
}

/**
 * スクリプト種類
 */
export type ScriptType = "node" | "python" | "bash" | "typescript";

/**
 * 参照ファイル情報
 */
export interface ReferenceInfo {
  /** ファイル名 */
  name: string;
  /** ファイルのパス */
  path: string;
}

/**
 * スキャンエラー
 */
export interface ScanError {
  /** エラーが発生したパス */
  path: string;
  /** エラーメッセージ */
  error: string;
}

/**
 * スキルスキャン結果
 */
export interface ScanResult {
  /** スキル一覧 */
  skills: SkillMetadata[];
  /** スキャン中のエラー */
  errors: ScanError[];
  /** スキャン日時（Unix timestamp） */
  scannedAt: number;
}

/**
 * スキルフィルタリング条件
 */
export interface FilterCriteria {
  /** 名前による部分一致検索 */
  name?: string;
  /** タグによるフィルタリング */
  tags?: string[];
  /** キーワード検索（説明文） */
  keyword?: string;
}
```

### 2.5 セッション関連型

```typescript
// packages/shared/src/claude-cli/types.ts

/**
 * セッションステータス
 */
export type SessionStatus =
  | "pending" // 待機中
  | "running" // 実行中
  | "completed" // 正常完了
  | "failed" // 失敗
  | "terminated"; // 手動終了

/**
 * セッションサマリー（一覧表示用）
 */
export interface SessionSummary {
  /** セッションID */
  id: string;
  /** 実行スキル名 */
  skillName: string;
  /** ステータス */
  status: SessionStatus;
  /** 開始日時（Unix timestamp） */
  startedAt: number;
  /** 完了日時（Unix timestamp、未完了の場合はnull） */
  completedAt: number | null;
}

/**
 * セッション詳細
 */
export interface SessionDetail extends SessionSummary {
  /** 終了コード（完了の場合） */
  exitCode: number | null;
  /** 標準出力履歴 */
  output: string[];
  /** エラー出力履歴 */
  error: string[];
}

/**
 * ストリームメッセージ
 */
export interface StreamMessage {
  /** セッションID */
  sessionId: string;
  /** メッセージ種類 */
  type: StreamMessageType;
  /** メッセージ内容 */
  content: string;
  /** タイムスタンプ（Unix timestamp） */
  timestamp: number;
}

/**
 * ストリームメッセージ種類
 */
export type StreamMessageType = "stdout" | "stderr" | "exit";
```

### 2.6 IPC リクエスト/レスポンス型

```typescript
// packages/shared/src/claude-cli/types.ts

// ========================================
// リクエスト型
// ========================================

/**
 * スキル一覧取得リクエスト
 */
export interface ListSkillsRequest {
  /** フィルタリング条件 */
  filter?: FilterCriteria;
  /** キャッシュを無視して再スキャン */
  forceRefresh?: boolean;
}

/**
 * スキル詳細取得リクエスト
 */
export interface GetSkillDetailRequest {
  /** スキル名 */
  skillName: string;
  /** スクリプト一覧を含める */
  includeScripts?: boolean;
  /** 参照ファイル一覧を含める */
  includeReferences?: boolean;
}

/**
 * スクリプト実行リクエスト
 */
export interface ExecuteScriptRequest {
  /** スキル名 */
  skillName: string;
  /** スクリプトファイル名 */
  scriptName: string;
  /** コマンドライン引数 */
  args?: string[];
  /** 作業ディレクトリ */
  cwd?: string;
  /** タイムアウト（ms） */
  timeoutMs?: number;
}

/**
 * セッション終了リクエスト
 */
export interface TerminateSessionRequest {
  /** セッションID */
  sessionId: string;
  /** 強制終了（SIGKILL） */
  force?: boolean;
}

/**
 * セッション取得リクエスト
 */
export interface GetSessionRequest {
  /** セッションID */
  sessionId: string;
}

// ========================================
// レスポンス型
// ========================================

/**
 * スクリプト実行レスポンス
 */
export interface ExecuteScriptResponse {
  /** セッションID */
  sessionId: string;
  /** 初期ステータス */
  status: SessionStatus;
}

/**
 * セッション終了レスポンス
 */
export interface TerminateSessionResponse {
  /** セッションID */
  sessionId: string;
  /** 終了成功フラグ */
  terminated: boolean;
}
```

---

## 3. Zodスキーマ定義

### 3.1 基本スキーマ

```typescript
// packages/shared/src/claude-cli/schemas.ts

import { z } from "zod";

// ========================================
// 基本型スキーマ
// ========================================

/**
 * スキル名スキーマ（kebab-case、最大64文字）
 */
export const skillNameSchema = z
  .string()
  .min(1, "スキル名は必須です")
  .max(64, "スキル名は64文字以内です")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "スキル名はkebab-caseで入力してください");

/**
 * セッションIDスキーマ（UUID形式）
 */
export const sessionIdSchema = z
  .string()
  .uuid("セッションIDは有効なUUID形式である必要があります");

/**
 * タイムアウトスキーマ（1秒〜30分）
 */
export const timeoutMsSchema = z
  .number()
  .min(1000, "タイムアウトは1秒以上必要です")
  .max(30 * 60 * 1000, "タイムアウトは30分以内です")
  .optional();

/**
 * パススキーマ（パストラバーサル防止）
 */
export const safePathSchema = z
  .string()
  .refine(
    (path) => !path.includes("..") && !path.includes("\0"),
    "不正なパスが含まれています",
  );
```

### 3.2 リクエストスキーマ

```typescript
// packages/shared/src/claude-cli/schemas.ts

/**
 * フィルタリング条件スキーマ
 */
export const filterCriteriaSchema = z.object({
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
  keyword: z.string().optional(),
});

/**
 * スキル一覧取得リクエストスキーマ
 */
export const listSkillsRequestSchema = z.object({
  filter: filterCriteriaSchema.optional(),
  forceRefresh: z.boolean().optional(),
});

/**
 * スキル詳細取得リクエストスキーマ
 */
export const getSkillDetailRequestSchema = z.object({
  skillName: skillNameSchema,
  includeScripts: z.boolean().optional(),
  includeReferences: z.boolean().optional(),
});

/**
 * スクリプト実行リクエストスキーマ
 */
export const executeScriptRequestSchema = z.object({
  skillName: skillNameSchema,
  scriptName: safePathSchema.refine(
    (name) => /\.(mjs|js|py|sh|ts)$/.test(name),
    "サポートされるスクリプト形式: .mjs, .js, .py, .sh, .ts",
  ),
  args: z.array(z.string()).optional(),
  cwd: safePathSchema.optional(),
  timeoutMs: timeoutMsSchema,
});

/**
 * セッション終了リクエストスキーマ
 */
export const terminateSessionRequestSchema = z.object({
  sessionId: sessionIdSchema,
  force: z.boolean().optional(),
});

/**
 * セッション取得リクエストスキーマ
 */
export const getSessionRequestSchema = z.object({
  sessionId: sessionIdSchema,
});
```

### 3.3 レスポンススキーマ

```typescript
// packages/shared/src/claude-cli/schemas.ts

/**
 * セッションステータススキーマ
 */
export const sessionStatusSchema = z.enum([
  "pending",
  "running",
  "completed",
  "failed",
  "terminated",
]);

/**
 * ストリームメッセージ種類スキーマ
 */
export const streamMessageTypeSchema = z.enum(["stdout", "stderr", "exit"]);

/**
 * CLIインストール状態スキーマ
 */
export const cliInstallationStatusSchema = z.object({
  installed: z.boolean(),
  version: z.string().nullable(),
  path: z.string().nullable(),
  error: z.string().nullable(),
});

/**
 * スキルメタデータスキーマ
 */
export const skillMetadataSchema = z.object({
  name: z.string(),
  path: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  triggers: z.array(z.string()),
  dependencies: z.array(z.string()),
  allowedTools: z.array(z.string()),
  hasScripts: z.boolean(),
  hasReferences: z.boolean(),
});

/**
 * スキャンエラースキーマ
 */
export const scanErrorSchema = z.object({
  path: z.string(),
  error: z.string(),
});

/**
 * スキャン結果スキーマ
 */
export const scanResultSchema = z.object({
  skills: z.array(skillMetadataSchema),
  errors: z.array(scanErrorSchema),
  scannedAt: z.number(),
});

/**
 * スクリプト情報スキーマ
 */
export const scriptInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(["node", "python", "bash", "typescript"]),
});

/**
 * 参照ファイル情報スキーマ
 */
export const referenceInfoSchema = z.object({
  name: z.string(),
  path: z.string(),
});

/**
 * スキル詳細スキーマ
 */
export const skillDetailSchema = skillMetadataSchema.extend({
  content: z.string(),
  scripts: z.array(scriptInfoSchema).optional(),
  references: z.array(referenceInfoSchema).optional(),
});

/**
 * セッションサマリースキーマ
 */
export const sessionSummarySchema = z.object({
  id: z.string().uuid(),
  skillName: z.string(),
  status: sessionStatusSchema,
  startedAt: z.number(),
  completedAt: z.number().nullable(),
});

/**
 * セッション詳細スキーマ
 */
export const sessionDetailSchema = sessionSummarySchema.extend({
  exitCode: z.number().nullable(),
  output: z.array(z.string()),
  error: z.array(z.string()),
});

/**
 * ストリームメッセージスキーマ
 */
export const streamMessageSchema = z.object({
  sessionId: z.string().uuid(),
  type: streamMessageTypeSchema,
  content: z.string(),
  timestamp: z.number(),
});

/**
 * スクリプト実行レスポンススキーマ
 */
export const executeScriptResponseSchema = z.object({
  sessionId: z.string().uuid(),
  status: sessionStatusSchema,
});

/**
 * セッション終了レスポンススキーマ
 */
export const terminateSessionResponseSchema = z.object({
  sessionId: z.string().uuid(),
  terminated: z.boolean(),
});
```

### 3.4 型推論

```typescript
// packages/shared/src/claude-cli/schemas.ts

import type { z } from "zod";

// ========================================
// Zodスキーマから型を推論
// ========================================

export type ListSkillsRequestSchema = z.infer<typeof listSkillsRequestSchema>;
export type GetSkillDetailRequestSchema = z.infer<
  typeof getSkillDetailRequestSchema
>;
export type ExecuteScriptRequestSchema = z.infer<
  typeof executeScriptRequestSchema
>;
export type TerminateSessionRequestSchema = z.infer<
  typeof terminateSessionRequestSchema
>;
export type GetSessionRequestSchema = z.infer<typeof getSessionRequestSchema>;

export type CliInstallationStatusSchema = z.infer<
  typeof cliInstallationStatusSchema
>;
export type SkillMetadataSchema = z.infer<typeof skillMetadataSchema>;
export type ScanResultSchema = z.infer<typeof scanResultSchema>;
export type SkillDetailSchema = z.infer<typeof skillDetailSchema>;
export type SessionSummarySchema = z.infer<typeof sessionSummarySchema>;
export type SessionDetailSchema = z.infer<typeof sessionDetailSchema>;
export type StreamMessageSchema = z.infer<typeof streamMessageSchema>;
export type ExecuteScriptResponseSchema = z.infer<
  typeof executeScriptResponseSchema
>;
export type TerminateSessionResponseSchema = z.infer<
  typeof terminateSessionResponseSchema
>;
```

---

## 4. エクスポート定義

```typescript
// packages/shared/src/claude-cli/index.ts

// 型定義
export type {
  // Result型
  Result,
  // エラー型
  CliError,
  CliErrorCode,
  // CLI型
  CliInstallationStatus,
  // スキル型
  SkillMetadata,
  SkillDetail,
  ScriptInfo,
  ScriptType,
  ReferenceInfo,
  ScanError,
  ScanResult,
  FilterCriteria,
  // セッション型
  SessionStatus,
  SessionSummary,
  SessionDetail,
  StreamMessage,
  StreamMessageType,
  // リクエスト型
  ListSkillsRequest,
  GetSkillDetailRequest,
  ExecuteScriptRequest,
  TerminateSessionRequest,
  GetSessionRequest,
  // レスポンス型
  ExecuteScriptResponse,
  TerminateSessionResponse,
} from "./types";

// Result ヘルパー
export { Result, createCliError, toCliError } from "./types";

// Zodスキーマ
export {
  // 基本スキーマ
  skillNameSchema,
  sessionIdSchema,
  timeoutMsSchema,
  safePathSchema,
  // リクエストスキーマ
  filterCriteriaSchema,
  listSkillsRequestSchema,
  getSkillDetailRequestSchema,
  executeScriptRequestSchema,
  terminateSessionRequestSchema,
  getSessionRequestSchema,
  // レスポンススキーマ
  sessionStatusSchema,
  streamMessageTypeSchema,
  cliInstallationStatusSchema,
  skillMetadataSchema,
  scanResultSchema,
  skillDetailSchema,
  sessionSummarySchema,
  sessionDetailSchema,
  streamMessageSchema,
  executeScriptResponseSchema,
  terminateSessionResponseSchema,
} from "./schemas";

// スキーマから推論した型（必要に応じて使用）
export type {
  ListSkillsRequestSchema,
  GetSkillDetailRequestSchema,
  ExecuteScriptRequestSchema,
  TerminateSessionRequestSchema,
  GetSessionRequestSchema,
  CliInstallationStatusSchema,
  SkillMetadataSchema,
  ScanResultSchema,
  SkillDetailSchema,
  SessionSummarySchema,
  SessionDetailSchema,
  StreamMessageSchema,
  ExecuteScriptResponseSchema,
  TerminateSessionResponseSchema,
} from "./schemas";
```

---

## 5. Main Process専用型

```typescript
// apps/desktop/src/main/claude-cli/types.ts

import type { ChildProcess } from "child_process";
import type { SessionStatus } from "@repo/shared/claude-cli";

/**
 * 内部セッション（プロセス参照含む）
 */
export interface InternalSession {
  /** セッションID */
  id: string;
  /** 実行スキル名 */
  skillName: string;
  /** ステータス */
  status: SessionStatus;
  /** 子プロセス参照 */
  process: ChildProcess | null;
  /** 開始日時 */
  startedAt: number;
  /** 完了日時 */
  completedAt: number | null;
  /** 終了コード */
  exitCode: number | null;
  /** 標準出力履歴 */
  output: string[];
  /** エラー出力履歴 */
  error: string[];
}

/**
 * CLI検出設定
 */
export interface CliDetectorConfig {
  /** カスタムCLIパス */
  customPath?: string;
  /** タイムアウト（ms） */
  timeoutMs?: number;
}

/**
 * スキルスキャナー設定
 */
export interface SkillScannerConfig {
  /** スキルディレクトリのベースパス */
  basePath: string;
  /** スキャンの最大深度 */
  maxDepth?: number;
  /** 無効なスキルを含める */
  includeDisabled?: boolean;
}

/**
 * セッションマネージャー設定
 */
export interface SessionManagerConfig {
  /** 最大同時セッション数 */
  maxSessions?: number;
  /** デフォルトタイムアウト（ms） */
  defaultTimeoutMs?: number;
}

/**
 * プロセス起動オプション
 */
export interface SpawnOptions {
  /** 作業ディレクトリ */
  cwd?: string;
  /** 環境変数 */
  env?: NodeJS.ProcessEnv;
  /** タイムアウト（ms） */
  timeoutMs?: number;
}

/**
 * プロセス実行結果
 */
export interface ProcessResult {
  /** 終了コード */
  exitCode: number;
  /** 標準出力 */
  stdout: string;
  /** エラー出力 */
  stderr: string;
}

/**
 * CLI統合マネージャー設定
 */
export interface ClaudeCliManagerConfig {
  /** スキルディレクトリのベースパス */
  skillsBasePath: string;
  /** 最大同時セッション数 */
  maxSessions?: number;
  /** デフォルトタイムアウト（ms） */
  defaultTimeoutMs?: number;
}
```

---

## 6. グローバル型拡張

```typescript
// apps/desktop/src/renderer/types/global.d.ts

import type {
  Result,
  CliInstallationStatus,
  ListSkillsRequest,
  ScanResult,
  GetSkillDetailRequest,
  SkillDetail,
  ExecuteScriptRequest,
  ExecuteScriptResponse,
  TerminateSessionRequest,
  TerminateSessionResponse,
  SessionSummary,
  GetSessionRequest,
  SessionDetail,
  StreamMessage,
} from "@repo/shared/claude-cli";

/**
 * Claude CLI API
 */
interface ClaudeCliAPI {
  // CLI管理
  checkInstallation(): Promise<Result<CliInstallationStatus>>;

  // スキル管理
  listSkills(request: ListSkillsRequest): Promise<Result<ScanResult>>;
  getSkillDetail(request: GetSkillDetailRequest): Promise<Result<SkillDetail>>;

  // スクリプト実行
  executeScript(
    request: ExecuteScriptRequest,
  ): Promise<Result<ExecuteScriptResponse>>;
  terminateSession(
    request: TerminateSessionRequest,
  ): Promise<Result<TerminateSessionResponse>>;

  // セッション管理
  listSessions(): Promise<Result<SessionSummary[]>>;
  getSession(request: GetSessionRequest): Promise<Result<SessionDetail>>;

  // ストリーミング
  onOutputStream(callback: (message: StreamMessage) => void): () => void;
  onSessionStatus(
    callback: (sessionId: string, status: string) => void,
  ): () => void;
  onExecutionComplete(
    callback: (sessionId: string, exitCode: number) => void,
  ): () => void;
}

declare global {
  interface Window {
    claudeCliAPI: ClaudeCliAPI;
  }
}

export {};
```

---

## 7. 型の使用例

### 7.1 Renderer Process での使用

```typescript
// apps/desktop/src/renderer/hooks/useClaudeCli.ts

import { useState, useEffect, useCallback } from "react";
import type {
  CliInstallationStatus,
  SkillMetadata,
  SessionDetail,
  StreamMessage,
  Result,
} from "@repo/shared/claude-cli";

export function useClaudeCli() {
  const [installStatus, setInstallStatus] =
    useState<CliInstallationStatus | null>(null);
  const [skills, setSkills] = useState<SkillMetadata[]>([]);
  const [currentSession, setCurrentSession] = useState<SessionDetail | null>(
    null,
  );
  const [output, setOutput] = useState<StreamMessage[]>([]);

  // CLIインストール確認
  const checkInstallation = useCallback(async () => {
    const result = await window.claudeCliAPI.checkInstallation();
    if (result.success) {
      setInstallStatus(result.data);
    }
    return result;
  }, []);

  // スキル一覧取得
  const loadSkills = useCallback(async (tags?: string[]) => {
    const result = await window.claudeCliAPI.listSkills({
      filter: tags ? { tags } : undefined,
    });
    if (result.success) {
      setSkills(result.data.skills);
    }
    return result;
  }, []);

  // スクリプト実行
  const executeScript = useCallback(
    async (skillName: string, scriptName: string, args?: string[]) => {
      const result = await window.claudeCliAPI.executeScript({
        skillName,
        scriptName,
        args,
      });
      return result;
    },
    [],
  );

  // 出力ストリーム購読
  useEffect(() => {
    const cleanup = window.claudeCliAPI.onOutputStream((message) => {
      setOutput((prev) => [...prev, message]);
    });
    return cleanup;
  }, []);

  return {
    installStatus,
    skills,
    currentSession,
    output,
    checkInstallation,
    loadSkills,
    executeScript,
  };
}
```

### 7.2 Main Process での使用

```typescript
// apps/desktop/src/main/claude-cli/SkillScanner.ts

import type {
  SkillMetadata,
  ScanResult,
  ScanError,
  FilterCriteria,
} from "@repo/shared/claude-cli";
import type { SkillScannerConfig } from "./types";

export class SkillScanner {
  private config: SkillScannerConfig;
  private cachedResult: ScanResult | null = null;

  constructor(config: SkillScannerConfig) {
    this.config = config;
  }

  async scan(): Promise<ScanResult> {
    const skills: SkillMetadata[] = [];
    const errors: ScanError[] = [];

    // スキャン処理...

    const result: ScanResult = {
      skills,
      errors,
      scannedAt: Date.now(),
    };

    this.cachedResult = result;
    return result;
  }

  filter(criteria: FilterCriteria): SkillMetadata[] {
    if (!this.cachedResult) {
      throw new Error("SCAN_NOT_PERFORMED");
    }

    return this.cachedResult.skills.filter((skill) => {
      // フィルタリング処理...
      return true;
    });
  }
}
```

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2026-01-17 | 1.0.0      | 初版作成 |
