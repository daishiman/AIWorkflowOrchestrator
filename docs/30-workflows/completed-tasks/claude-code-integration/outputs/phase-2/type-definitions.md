# Claude Agent SDK統合 - 型定義設計書

## 1. 概要

本ドキュメントでは、Claude Agent SDK統合に必要な型定義を詳細に定義する。
配置先: `packages/shared/src/types/agent.ts`

---

## 2. 実行リクエスト型

### 2.1 AgentExecutionRequest

エージェント実行を開始する際のリクエストパラメータ。

```typescript
export interface AgentExecutionRequest {
  /** 実行ID（UUID形式、省略時は自動生成） */
  executionId?: string;

  /** スキルID（スキルを使用する場合） */
  skillId?: string;

  /** スキルファイルのパス */
  skillPath?: string;

  /** ユーザーからのプロンプト */
  prompt: string;

  /** 作業ディレクトリ（省略時はprocess.cwd()） */
  workingDirectory?: string;

  /** 許可するツール一覧 */
  tools?: string[];

  /** 権限モード */
  permissionMode?: PermissionMode;
}
```

### 2.2 PermissionMode

権限制御のモード。

```typescript
export type PermissionMode = "auto" | "ask" | "deny" | "default";
```

| モード    | 説明                             |
| --------- | -------------------------------- |
| `auto`    | すべてのツール使用を自動承認     |
| `ask`     | すべてのツール使用で確認を求める |
| `deny`    | すべてのツール使用を拒否         |
| `default` | ツールごとのデフォルト設定に従う |

---

## 3. ストリーミングメッセージ型

### 3.1 AgentStreamMessage

SDKからのストリーミングメッセージをIPC経由で転送する際の型。

```typescript
export interface AgentStreamMessage {
  /** 実行ID */
  executionId: string;

  /** メッセージ種別 */
  type: AgentStreamMessageType;

  /** メッセージ内容（種別により構造が異なる） */
  content: unknown;

  /** タイムスタンプ（ミリ秒） */
  timestamp: number;
}
```

### 3.2 AgentStreamMessageType

ストリーミングメッセージの種別。

```typescript
export type AgentStreamMessageType =
  | "assistant" // アシスタントからのテキストメッセージ
  | "user" // ユーザーメッセージ（リプレイ時）
  | "result" // ツール実行結果
  | "tool_use" // ツール使用開始
  | "status" // ステータス変更
  | "error"; // エラー発生
```

### 3.3 メッセージ種別別content構造

```typescript
// assistant
interface AssistantContent {
  text: string;
}

// result
interface ResultContent {
  toolName: string;
  result: unknown;
  isError?: boolean;
}

// tool_use
interface ToolUseContent {
  toolName: string;
  args: Record<string, unknown>;
}

// error
interface ErrorContent {
  message: string;
  code?: string;
  stack?: string;
}
```

---

## 4. 実行ステータス型

### 4.1 AgentExecutionStatus

実行のステータスを通知する型。

```typescript
export interface AgentExecutionStatus {
  /** 実行ID */
  executionId: string;

  /** 現在のステータス */
  status: ExecutionStatusType;

  /** 開始時刻（ミリ秒） */
  startedAt: number;

  /** 完了時刻（ミリ秒、完了時のみ） */
  completedAt?: number;

  /** エラーメッセージ（エラー時のみ） */
  error?: string;
}
```

### 4.2 ExecutionStatusType

```typescript
export type ExecutionStatusType =
  | "running" // 実行中
  | "completed" // 正常完了
  | "cancelled" // キャンセル
  | "error"; // エラー終了
```

---

## 5. Permission関連型

### 5.1 PermissionRequest

Main ProcessからRenderer Processへの権限確認リクエスト。

```typescript
export interface PermissionRequest {
  /** 実行ID */
  executionId: string;

  /** リクエストID（応答のマッチング用） */
  requestId: string;

  /** ツール名 */
  toolName: string;

  /** ツール引数 */
  args: Record<string, unknown>;

  /** 確認を求める理由（オプション） */
  reason?: string;
}
```

### 5.2 PermissionResponse

Renderer ProcessからMain Processへの権限確認応答。

```typescript
export interface PermissionResponse {
  /** リクエストID（リクエストとのマッチング用） */
  requestId: string;

  /** 承認されたかどうか */
  approved: boolean;

  /** この選択を記憶するか（オプション） */
  rememberChoice?: boolean;

  /** 拒否理由（オプション） */
  rejectReason?: string;
}
```

---

## 6. Permission Rules型

### 6.1 PermissionRule

単一の権限ルール。

```typescript
export interface PermissionRule {
  /** 対象ツール（単一または複数） */
  tool: string | string[];

  /** 対象パス（glob形式、オプション） */
  paths?: string[];

  /** 対象コマンド（Bash用、オプション） */
  commands?: string[];
}
```

### 6.2 PermissionRules

権限ルールセット。

```typescript
export interface PermissionRules {
  /** 自動許可ルール */
  allow?: PermissionRule[];

  /** 拒否ルール */
  deny?: PermissionRule[];

  /** 確認要求ルール */
  ask?: PermissionRule[];
}
```

### 6.3 評価順序

```
1. deny ルール（マッチすれば即座に拒否）
2. allow ルール（マッチすれば許可）
3. ask ルール（マッチすればユーザー確認）
4. permissionMode に従う
```

---

## 7. IPC関連型

### 7.1 AgentStartResult

agent:start の戻り値。

```typescript
export interface AgentStartResult {
  /** 実行ID */
  executionId: string;

  /** 開始成功かどうか */
  success: boolean;

  /** エラーメッセージ（失敗時） */
  error?: string;
}
```

### 7.2 AgentStopRequest

agent:stop のリクエスト。

```typescript
export interface AgentStopRequest {
  /** 停止対象の実行ID */
  executionId: string;
}
```

### 7.3 AgentPermissionResRequest

agent:permission:res のリクエスト。

```typescript
export interface AgentPermissionResRequest {
  /** 実行ID */
  executionId: string;

  /** 権限応答 */
  response: PermissionResponse;
}
```

---

## 8. Hook関連型

### 8.1 HookInput

Hookコールバックへの入力。

```typescript
export interface HookInput {
  /** ツール名 */
  toolName: string;

  /** ツール引数 */
  args: Record<string, unknown>;

  /** セッションID（オプション） */
  sessionId?: string;
}
```

### 8.2 HookOutput

Hookコールバックからの出力。

```typescript
export interface HookOutput {
  /** 処理を続行するか */
  proceed?: boolean;

  /** フィードバックメッセージ */
  message?: string;

  /** エラーメッセージ */
  error?: string;

  /** 追加データ */
  data?: Record<string, unknown>;
}
```

---

## 9. Zodスキーマ

### 9.1 AgentExecutionRequestSchema

```typescript
import { z } from "zod";

export const AgentExecutionRequestSchema = z.object({
  executionId: z.string().uuid().optional(),
  skillId: z.string().optional(),
  skillPath: z.string().optional(),
  prompt: z.string().min(1).max(100000),
  workingDirectory: z.string().optional(),
  tools: z.array(z.string()).optional(),
  permissionMode: z.enum(["auto", "ask", "deny", "default"]).optional(),
});
```

### 9.2 PermissionResponseSchema

```typescript
export const PermissionResponseSchema = z.object({
  requestId: z.string(),
  approved: z.boolean(),
  rememberChoice: z.boolean().optional(),
  rejectReason: z.string().optional(),
});
```

---

## 10. 定数定義

### 10.1 デフォルト値

```typescript
export const AGENT_DEFAULTS = {
  /** デフォルトの許可ツール */
  DEFAULT_TOOLS: ["Read", "Edit", "Write", "Bash", "Glob", "Grep"] as const,

  /** デフォルトの権限モード */
  DEFAULT_PERMISSION_MODE: "default" as PermissionMode,

  /** Permission応答のタイムアウト（ミリ秒） */
  PERMISSION_TIMEOUT_MS: 30000,

  /** 最大同時実行数 */
  MAX_CONCURRENT_EXECUTIONS: 5,
} as const;
```

### 10.2 危険パターン

```typescript
export const DANGEROUS_PATTERNS = {
  /** 危険なBashコマンドパターン */
  BASH_COMMANDS: [
    "rm -rf",
    "sudo",
    "chmod 777",
    "dd if=",
    "mkfs",
    "> /dev/",
    ":(){ :|:& };:",
  ] as const,

  /** 保護対象パス */
  PROTECTED_PATHS: [
    "/etc/**",
    "/usr/**",
    "/var/**",
    "**/.bashrc",
    "**/.zshrc",
    "**/.profile",
  ] as const,
} as const;
```

---

作成日: 2026-01-12
Phase: 2
ステータス: 完了
