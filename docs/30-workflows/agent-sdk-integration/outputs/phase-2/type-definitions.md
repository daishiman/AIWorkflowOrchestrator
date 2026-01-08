# Agent SDK統合 型定義設計

> Phase 2 成果物
> 作成日: 2026-01-08
> スキル: claude-agent-sdk

---

## 1. 概要

本ドキュメントは、Claude Agent SDK統合で使用するTypeScript型定義を設計する。

### 1.1 型定義の配置

```
packages/shared/src/
├── agent/
│   ├── index.ts              # パブリックエクスポート
│   ├── types.ts              # 型定義
│   ├── errors.ts             # エラークラス
│   └── validation.ts         # Zodスキーマ
└── ipc/
    └── agent-channels.ts     # IPCチャネル定数
```

---

## 2. 基本型定義

### 2.1 クエリ関連型

```typescript
// packages/shared/src/agent/types.ts

/**
 * クエリオプション
 */
export interface QueryOptions {
  /**
   * タイムアウト時間（ミリ秒）
   * @minimum 1000
   * @maximum 300000
   * @default 30000
   */
  timeout?: number;

  /**
   * セッションID（UUID v4形式）
   * 指定すると既存セッションのコンテキストを使用
   */
  sessionId?: string;

  /**
   * システムプロンプト
   * @maxLength 5000
   */
  systemPrompt?: string;
}

/**
 * クエリリクエスト（IPC経由）
 */
export interface AgentQueryRequest {
  /**
   * ユーザープロンプト
   * @minLength 1
   * @maxLength 10000
   */
  prompt: string;

  /**
   * オプション設定
   */
  options?: QueryOptions;
}
```

### 2.2 ステータス型

```typescript
// packages/shared/src/agent/types.ts

/**
 * エージェントステータスタイプ
 */
export type AgentStatusType =
  | "not_initialized"
  | "initializing"
  | "initialized"
  | "error";

/**
 * エージェントステータス
 */
export interface AgentStatus {
  /**
   * 現在のステータス
   */
  status: AgentStatusType;

  /**
   * エラーメッセージ（status === 'error' 時のみ）
   */
  error?: string;

  /**
   * ステータス更新時刻（Unix timestamp）
   */
  timestamp: number;
}
```

### 2.3 セッション型

```typescript
// packages/shared/src/agent/types.ts

/**
 * セッションコンテキスト
 */
export interface SessionContext {
  /**
   * 会話履歴のメッセージID配列
   */
  messageIds: string[];

  /**
   * カスタムメタデータ
   */
  metadata?: Record<string, unknown>;
}

/**
 * セッション情報
 */
export interface Session {
  /**
   * セッションID（UUID v4）
   */
  id: string;

  /**
   * 作成時刻（Unix timestamp）
   */
  createdAt: number;

  /**
   * 最終アクセス時刻（Unix timestamp）
   */
  lastAccessedAt: number;

  /**
   * セッションコンテキスト
   */
  context: SessionContext;
}

/**
 * セッション再開リクエスト
 */
export interface ResumeSessionRequest {
  sessionId: string;
}

/**
 * セッション破棄リクエスト
 */
export interface DestroySessionRequest {
  sessionId: string;
}

/**
 * セッション作成レスポンス
 */
export interface CreateSessionResponse {
  sessionId: string;
}
```

---

## 3. メッセージ型定義

### 3.1 SDKメッセージ型

```typescript
// packages/shared/src/agent/types.ts

/**
 * メッセージタイプ
 */
export type SDKMessageType =
  | "text"
  | "tool_use"
  | "tool_result"
  | "error"
  | "complete";

/**
 * ツール使用情報
 */
export interface ToolUseInfo {
  /**
   * ツール名
   */
  toolName: string;

  /**
   * ツール入力パラメータ
   */
  input: Record<string, unknown>;
}

/**
 * ツール結果情報
 */
export interface ToolResultInfo {
  /**
   * 対応するツール使用ID
   */
  toolUseId: string;

  /**
   * 実行結果
   */
  output: string;

  /**
   * エラーフラグ
   */
  isError: boolean;
}

/**
 * SDKメッセージ
 */
export interface SDKMessage {
  /**
   * メッセージID（UUID v4）
   */
  id: string;

  /**
   * メッセージタイプ
   */
  type: SDKMessageType;

  /**
   * メッセージ内容
   */
  content: string;

  /**
   * 受信時刻（Unix timestamp）
   */
  timestamp: number;

  /**
   * 完了フラグ
   * trueの場合、これ以上のメッセージは配信されない
   */
  isComplete: boolean;

  /**
   * ツール使用情報（type === 'tool_use' 時のみ）
   */
  toolUse?: ToolUseInfo;

  /**
   * ツール結果情報（type === 'tool_result' 時のみ）
   */
  toolResult?: ToolResultInfo;
}
```

---

## 4. エラー型定義

### 4.1 エラーコード

```typescript
// packages/shared/src/agent/errors.ts

/**
 * エラーコード列挙
 */
export enum AgentErrorCode {
  /** SDK初期化失敗 */
  INITIALIZATION_FAILED = "AGENT_INIT_FAILED",

  /** SDK未初期化 */
  NOT_INITIALIZED = "AGENT_NOT_INITIALIZED",

  /** クエリ実行失敗 */
  QUERY_FAILED = "AGENT_QUERY_FAILED",

  /** タイムアウト */
  TIMEOUT = "AGENT_TIMEOUT",

  /** ユーザーキャンセル */
  ABORTED = "AGENT_ABORTED",

  /** セッション不存在 */
  SESSION_NOT_FOUND = "AGENT_SESSION_NOT_FOUND",

  /** セッション操作エラー */
  SESSION_ERROR = "AGENT_SESSION_ERROR",

  /** バリデーションエラー */
  VALIDATION_ERROR = "AGENT_VALIDATION_ERROR",
}
```

### 4.2 エラークラス階層

```typescript
// packages/shared/src/agent/errors.ts

/**
 * Agent基底エラークラス
 */
export class AgentError extends Error {
  constructor(
    public readonly code: AgentErrorCode,
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "AgentError";
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * JSON.stringifyで正しくシリアライズされるように
   */
  toJSON(): SerializedAgentError {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      stack: this.stack,
    };
  }
}

/**
 * 初期化エラー
 */
export class AgentInitializationError extends AgentError {
  constructor(message: string, cause?: Error) {
    super(AgentErrorCode.INITIALIZATION_FAILED, message, cause);
    this.name = "AgentInitializationError";
  }
}

/**
 * クエリ実行エラー
 */
export class AgentQueryError extends AgentError {
  constructor(message: string, cause?: Error) {
    super(AgentErrorCode.QUERY_FAILED, message, cause);
    this.name = "AgentQueryError";
  }
}

/**
 * タイムアウトエラー
 */
export class AgentTimeoutError extends AgentError {
  constructor(message: string = "Query timed out") {
    super(AgentErrorCode.TIMEOUT, message);
    this.name = "AgentTimeoutError";
  }
}

/**
 * キャンセルエラー
 */
export class AgentAbortedError extends AgentError {
  constructor(message: string = "Query was aborted") {
    super(AgentErrorCode.ABORTED, message);
    this.name = "AgentAbortedError";
  }
}

/**
 * セッションエラー
 */
export class AgentSessionError extends AgentError {
  constructor(
    message: string,
    code: AgentErrorCode = AgentErrorCode.SESSION_ERROR,
  ) {
    super(code, message);
    this.name = "AgentSessionError";
  }
}

/**
 * バリデーションエラー
 */
export class AgentValidationError extends AgentError {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super(AgentErrorCode.VALIDATION_ERROR, message);
    this.name = "AgentValidationError";
  }
}
```

### 4.3 シリアライズ型

```typescript
// packages/shared/src/agent/errors.ts

/**
 * IPC経由でシリアライズされるエラー形式
 */
export interface SerializedAgentError {
  name: string;
  code: AgentErrorCode;
  message: string;
  stack?: string;
}

/**
 * シリアライズされたエラーからAgentErrorを復元
 */
export function deserializeAgentError(
  serialized: SerializedAgentError,
): AgentError {
  switch (serialized.code) {
    case AgentErrorCode.INITIALIZATION_FAILED:
      return new AgentInitializationError(serialized.message);
    case AgentErrorCode.QUERY_FAILED:
      return new AgentQueryError(serialized.message);
    case AgentErrorCode.TIMEOUT:
      return new AgentTimeoutError(serialized.message);
    case AgentErrorCode.ABORTED:
      return new AgentAbortedError(serialized.message);
    case AgentErrorCode.SESSION_NOT_FOUND:
    case AgentErrorCode.SESSION_ERROR:
      return new AgentSessionError(serialized.message, serialized.code);
    case AgentErrorCode.VALIDATION_ERROR:
      return new AgentValidationError(serialized.message);
    default:
      return new AgentError(serialized.code, serialized.message);
  }
}
```

---

## 5. バリデーションスキーマ

### 5.1 Zodスキーマ定義

```typescript
// packages/shared/src/agent/validation.ts

import { z } from "zod";

/**
 * クエリオプションスキーマ
 */
export const queryOptionsSchema = z
  .object({
    timeout: z.number().min(1000).max(300000).optional(),
    sessionId: z.string().uuid().optional(),
    systemPrompt: z.string().max(5000).optional(),
  })
  .strict();

/**
 * クエリリクエストスキーマ
 */
export const queryRequestSchema = z
  .object({
    prompt: z.string().min(1).max(10000),
    options: queryOptionsSchema.optional(),
  })
  .strict();

/**
 * セッション再開リクエストスキーマ
 */
export const resumeSessionRequestSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict();

/**
 * セッション破棄リクエストスキーマ
 */
export const destroySessionRequestSchema = z
  .object({
    sessionId: z.string().uuid(),
  })
  .strict();

// 型エクスポート
export type QueryOptionsInput = z.input<typeof queryOptionsSchema>;
export type QueryRequestInput = z.input<typeof queryRequestSchema>;
export type ResumeSessionRequestInput = z.input<
  typeof resumeSessionRequestSchema
>;
export type DestroySessionRequestInput = z.input<
  typeof destroySessionRequestSchema
>;
```

---

## 6. IPCチャネル型定義

### 6.1 チャネル定数

```typescript
// packages/shared/src/ipc/agent-channels.ts

/**
 * Agent IPCチャネル定数
 */
export const AGENT_IPC_CHANNELS = {
  /** クエリ実行 */
  QUERY: "agent:query",
  /** 処理中断 */
  ABORT: "agent:abort",
  /** ステータス取得 */
  GET_STATUS: "agent:getStatus",
  /** セッション作成 */
  CREATE_SESSION: "agent:createSession",
  /** セッション再開 */
  RESUME_SESSION: "agent:resumeSession",
  /** セッション破棄 */
  DESTROY_SESSION: "agent:destroySession",
  /** メッセージ配信（Main → Renderer） */
  MESSAGE: "agent:message",
} as const;

/**
 * チャネル型
 */
export type AgentIpcChannel =
  (typeof AGENT_IPC_CHANNELS)[keyof typeof AGENT_IPC_CHANNELS];
```

---

## 7. Preload API型定義

### 7.1 AgentAPI型

```typescript
// packages/shared/src/agent/types.ts

import type { SDKMessage, QueryOptions, AgentStatus } from "./types";

/**
 * Preload経由で公開されるAgent API
 */
export interface AgentAPI {
  /**
   * クエリを実行する
   */
  query(prompt: string, options?: QueryOptions): Promise<void>;

  /**
   * 実行中のクエリを中断する
   */
  abort(): void;

  /**
   * エージェントのステータスを取得する
   */
  getStatus(): Promise<AgentStatus>;

  /**
   * 新しいセッションを作成する
   */
  createSession(): Promise<string>;

  /**
   * 既存のセッションを再開する
   */
  resumeSession(sessionId: string): Promise<void>;

  /**
   * セッションを破棄する
   */
  destroySession(sessionId: string): Promise<void>;

  /**
   * メッセージ受信リスナーを登録する
   * @returns アンサブスクライブ関数
   */
  onMessage(callback: (message: SDKMessage) => void): () => void;
}
```

### 7.2 グローバル型宣言

```typescript
// apps/desktop/src/renderer/types/electron.d.ts

import type { AgentAPI } from "@repo/shared/agent/types";

declare global {
  interface Window {
    agentAPI: AgentAPI;
  }
}

export {};
```

---

## 8. React Hook型定義

### 8.1 useAgent型

```typescript
// apps/desktop/src/renderer/hooks/useAgent.ts

import type {
  AgentStatus,
  SDKMessage,
  QueryOptions,
  AgentError,
} from "@repo/shared/agent";

/**
 * useAgentオプション
 */
export interface UseAgentOptions {
  /**
   * 自動セッション管理を有効にする
   * @default true
   */
  autoSession?: boolean;

  /**
   * デフォルトタイムアウト（ミリ秒）
   * @default 30000
   */
  defaultTimeout?: number;
}

/**
 * useAgent戻り値
 */
export interface UseAgentReturn {
  /** エージェントステータス */
  status: AgentStatus | null;

  /** 受信メッセージ履歴 */
  messages: SDKMessage[];

  /** クエリ実行中フラグ */
  isLoading: boolean;

  /** エラー状態 */
  error: AgentError | null;

  /** 現在のセッションID */
  sessionId: string | null;

  /** クエリを実行する */
  query: (prompt: string, options?: QueryOptions) => Promise<void>;

  /** 実行中のクエリを中断する */
  abort: () => void;

  /** メッセージ履歴をクリアする */
  clearMessages: () => void;

  /** セッションをリセットする */
  resetSession: () => Promise<void>;
}
```

---

## 9. 設定型定義

### 9.1 クライアント設定

```typescript
// packages/shared/src/agent/types.ts

/**
 * AgentClient設定
 */
export interface AgentClientConfig {
  /**
   * Anthropic API Key
   * Main Processでのみ設定
   */
  apiKey: string;

  /**
   * デフォルトタイムアウト（ミリ秒）
   * @default 30000
   */
  defaultTimeout?: number;

  /**
   * 最大リトライ回数
   * @default 3
   */
  maxRetries?: number;

  /**
   * 初期リトライ待機時間（ミリ秒）
   * @default 1000
   */
  initialRetryDelay?: number;

  /**
   * 最大リトライ待機時間（ミリ秒）
   * @default 4000
   */
  maxRetryDelay?: number;
}

/**
 * デフォルト設定
 */
export const DEFAULT_AGENT_CLIENT_CONFIG: Omit<
  Required<AgentClientConfig>,
  "apiKey"
> = {
  defaultTimeout: 30000,
  maxRetries: 3,
  initialRetryDelay: 1000,
  maxRetryDelay: 4000,
};
```

---

## 10. パブリックエクスポート

### 10.1 packages/shared/src/agent/index.ts

```typescript
// 型エクスポート
export type {
  // クエリ関連
  QueryOptions,
  AgentQueryRequest,
  // ステータス
  AgentStatusType,
  AgentStatus,
  // セッション
  Session,
  SessionContext,
  ResumeSessionRequest,
  DestroySessionRequest,
  CreateSessionResponse,
  // メッセージ
  SDKMessageType,
  SDKMessage,
  ToolUseInfo,
  ToolResultInfo,
  // API
  AgentAPI,
  // 設定
  AgentClientConfig,
} from "./types";

// エラー関連
export {
  AgentErrorCode,
  AgentError,
  AgentInitializationError,
  AgentQueryError,
  AgentTimeoutError,
  AgentAbortedError,
  AgentSessionError,
  AgentValidationError,
  deserializeAgentError,
  type SerializedAgentError,
} from "./errors";

// バリデーション
export {
  queryOptionsSchema,
  queryRequestSchema,
  resumeSessionRequestSchema,
  destroySessionRequestSchema,
  type QueryOptionsInput,
  type QueryRequestInput,
  type ResumeSessionRequestInput,
  type DestroySessionRequestInput,
} from "./validation";

// 定数
export { DEFAULT_AGENT_CLIENT_CONFIG } from "./types";
```

### 10.2 packages/shared/src/ipc/index.ts

```typescript
// 既存のエクスポートに追加
export { AGENT_IPC_CHANNELS, type AgentIpcChannel } from "./agent-channels";
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-08 | 初版作成 |
