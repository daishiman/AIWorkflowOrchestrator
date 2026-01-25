# TASK-3-1-A アーキテクチャ設計書

## メタ情報

| 項目       | 内容       |
| ---------- | ---------- |
| タスクID   | TASK-3-1-A |
| Phase      | 2          |
| 作成日     | 2026-01-24 |
| ステータス | 完了       |

---

## クラス設計

### SkillExecutor クラス

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
import { v4 as uuidv4 } from "uuid";
import type { BrowserWindow } from "electron";
import type {
  SkillMetadata,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillStreamMessage,
  ExecutionState,
  ExecutionInfo,
} from "@repo/shared";
import { validateAllowedTools } from "@repo/shared/constants";

export class SkillExecutor {
  // 依存関係
  private mainWindow: BrowserWindow;

  // 実行管理
  private activeExecutions: Map<string, ExecutionContext> = new Map();
  private maxConcurrentExecutions: number = 5;
  private defaultTimeout: number = 30000; // 30秒

  constructor(mainWindow: BrowserWindow);

  // パブリック API
  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse>;

  abort(executionId: string): boolean;

  getActiveExecutions(): ExecutionInfo[];

  getExecutionStatus(executionId: string): ExecutionInfo | undefined;

  // プライベートメソッド
  private async buildPrompt(
    userPrompt: string,
    skill: SkillMetadata,
  ): Promise<string>;

  private buildContextInfo(skill: SkillMetadata): string;

  private async handleStreamMessage(
    executionId: string,
    message: unknown,
  ): Promise<void>;

  private convertToStreamMessage(
    executionId: string,
    message: unknown,
  ): SkillStreamMessage | null;

  private sendStream(message: SkillStreamMessage): void;

  private updateExecutionState(
    executionId: string,
    state: ExecutionState,
  ): void;

  private cleanup(executionId: string): void;
}
```

### ExecutionContext 型

```typescript
interface ExecutionContext {
  id: string;
  skillId: string;
  abortController: AbortController;
  state: ExecutionState;
  startedAt: number;
  completedAt?: number;
}
```

---

## クラス図

```
┌─────────────────────────────────────────────────────────────┐
│                      SkillExecutor                           │
├─────────────────────────────────────────────────────────────┤
│ - mainWindow: BrowserWindow                                  │
│ - activeExecutions: Map<string, ExecutionContext>            │
│ - maxConcurrentExecutions: number                            │
│ - defaultTimeout: number                                     │
├─────────────────────────────────────────────────────────────┤
│ + constructor(mainWindow: BrowserWindow)                     │
│ + execute(request, skill): Promise<SkillExecutionResponse>   │
│ + abort(executionId: string): boolean                        │
│ + getActiveExecutions(): ExecutionInfo[]                     │
│ + getExecutionStatus(id: string): ExecutionInfo | undefined  │
├─────────────────────────────────────────────────────────────┤
│ - buildPrompt(userPrompt, skill): Promise<string>            │
│ - buildContextInfo(skill): string                            │
│ - handleStreamMessage(execId, message): Promise<void>        │
│ - convertToStreamMessage(execId, msg): SkillStreamMessage    │
│ - sendStream(message: SkillStreamMessage): void              │
│ - updateExecutionState(execId, state): void                  │
│ - cleanup(executionId: string): void                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   @anthropic-ai/claude-agent-sdk             │
├─────────────────────────────────────────────────────────────┤
│ + query(prompt, options): AsyncIterable<Message>             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ sends IPC
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       BrowserWindow                          │
├─────────────────────────────────────────────────────────────┤
│ + webContents.send(channel, ...args): void                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 依存関係

| 依存                             | 用途                     |
| -------------------------------- | ------------------------ |
| `@anthropic-ai/claude-agent-sdk` | SDK query() API          |
| `uuid`                           | executionId 生成         |
| `electron` (BrowserWindow)       | IPC メッセージ送信       |
| `@repo/shared`                   | 型定義・セキュリティ関数 |

---

## 型定義

### SkillExecutionRequest

```typescript
// packages/shared/src/types/skill-execution.ts

export interface SkillExecutionRequest {
  /** ユーザーの入力プロンプト */
  prompt: string;
  /** 実行対象のスキルID */
  skillId: string;
  /** タイムアウト（ミリ秒、オプション） */
  timeout?: number;
  /** セッションID（会話継続用、オプション） */
  sessionId?: string;
}
```

### SkillExecutionResponse

```typescript
export interface SkillExecutionResponse {
  /** 実行ID（UUID v4） */
  executionId: string;
  /** 成功/失敗 */
  success: boolean;
  /** エラー情報（失敗時） */
  error?: SkillExecutionError;
}
```

### ExecutionState

```typescript
export type ExecutionState =
  | "pending"
  | "running"
  | "completed"
  | "aborted"
  | "error";
```

### ExecutionInfo

```typescript
export interface ExecutionInfo {
  id: string;
  skillId: string;
  state: ExecutionState;
  startedAt: number;
  completedAt?: number;
}
```

### SkillStreamMessage

```typescript
export interface SkillStreamMessage {
  /** 実行ID */
  executionId: string;
  /** メッセージID */
  id: string;
  /** メッセージタイプ */
  type: "text" | "tool_use" | "error" | "complete";
  /** メッセージ内容 */
  content: string;
  /** タイムスタンプ */
  timestamp: number;
  /** 完了フラグ */
  isComplete: boolean;
}
```

### SkillExecutionError

```typescript
export interface SkillExecutionError {
  code: SkillExecutionErrorCode;
  message: string;
  details?: unknown;
}

export type SkillExecutionErrorCode =
  | "EXECUTION_FAILED"
  | "TIMEOUT"
  | "ABORTED"
  | "MAX_CONCURRENT_EXCEEDED"
  | "SKILL_NOT_FOUND"
  | "VALIDATION_FAILED"
  | "SDK_ERROR";
```

---

## IPC チャンネル定義

| チャンネル            | 方向            | ペイロード              |
| --------------------- | --------------- | ----------------------- |
| `skill:execute`       | Renderer → Main | SkillExecutionRequest   |
| `skill:abort`         | Renderer → Main | { executionId: string } |
| `skill:getStatus`     | Renderer → Main | { executionId: string } |
| `skill:getActive`     | Renderer → Main | (なし)                  |
| `skill:stream`        | Main → Renderer | SkillStreamMessage      |
| `skill:executeResult` | Main → Renderer | SkillExecutionResponse  |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
