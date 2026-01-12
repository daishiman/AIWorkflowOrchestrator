# エージェント実行UI 型定義設計

## 概要

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | AGENT-004          |
| 機能名   | agent-execution-ui |
| Phase    | 2                  |
| 作成日   | 2026-01-12         |

---

## 型定義配置

| ファイル                                               | 内容               |
| ------------------------------------------------------ | ------------------ |
| `packages/shared/src/types/agent.ts`                   | 共有型定義（追加） |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 状態管理型（拡張） |

---

## 共有型定義（packages/shared/src/types/agent.ts）

### AgentExecutionStatus

エージェントの実行状態を表す型。

```typescript
/**
 * エージェント実行状態
 */
export type AgentExecutionStatus =
  | "idle" // 待機中（初期状態）
  | "executing" // 実行中（クエリ送信後）
  | "streaming" // ストリーミング受信中
  | "awaiting_permission" // 権限確認待ち
  | "completed" // 完了
  | "cancelled" // キャンセル
  | "error"; // エラー

/**
 * 実行状態の遷移図
 *
 * idle → executing → streaming → completed
 *                  ↓           ↓
 *         awaiting_permission  cancelled
 *                  ↓           ↓
 *               streaming    error
 */
```

### AgentMessage

チャットメッセージを表す型。

```typescript
/**
 * エージェントメッセージ
 */
export interface AgentMessage {
  /** 一意識別子（UUID） */
  id: string;

  /** メッセージの送信者 */
  role: "user" | "assistant" | "system";

  /** メッセージ内容 */
  content: string;

  /** 送信日時 */
  timestamp: Date;

  /** ストリーミング中フラグ（未完了のメッセージ） */
  isStreaming?: boolean;

  /** メッセージタイプ（テキスト、ツール使用、エラー等） */
  type?: "text" | "tool_use" | "tool_result" | "error";

  /** ツール使用時のツール名 */
  toolName?: string;

  /** ツール使用時の引数 */
  toolArgs?: Record<string, unknown>;
}
```

### PermissionRequest

Main Process → Renderer への権限確認リクエスト。

```typescript
/**
 * 権限確認リクエスト（Main → Renderer）
 */
export interface PermissionRequest {
  /** 実行ID（どの実行に関連するか） */
  executionId: string;

  /** リクエストID（一意識別子） */
  requestId: string;

  /** ツール名（例: "Bash", "Write", "Read"） */
  toolName: string;

  /** ツール引数 */
  args: Record<string, unknown>;

  /** 理由・説明（任意） */
  reason?: string;

  /** ルール名（ask, allow, deny） */
  ruleName?: "ask" | "allow" | "deny";

  /** リクエスト日時 */
  requestedAt: Date;
}
```

### PermissionResponse

Renderer → Main Process への権限確認応答。

```typescript
/**
 * 権限確認レスポンス（Renderer → Main）
 */
export interface PermissionResponse {
  /** リクエストID（対応するリクエストの識別子） */
  requestId: string;

  /** 承認フラグ（true: 許可, false: 拒否） */
  approved: boolean;

  /** 選択を記憶するフラグ */
  rememberChoice?: boolean;

  /** 応答日時 */
  respondedAt: Date;
}
```

### AgentExecutionState

エージェント実行の全体状態を表す型。

```typescript
/**
 * エージェント実行状態
 */
export interface AgentExecutionState {
  /** 現在の実行状態 */
  status: AgentExecutionStatus;

  /** 実行ID（実行中の場合） */
  executionId: string | null;

  /** 実行中のスキル */
  currentSkill: Skill | null;

  /** チャット履歴 */
  messages: AgentMessage[];

  /** ストリーミング中の一時的なコンテンツ */
  currentStreamingContent: string;

  /** エラーメッセージ */
  error: string | null;

  /** 実行開始日時 */
  startedAt: Date | null;

  /** 実行完了日時 */
  completedAt: Date | null;

  /** 保留中の権限確認リクエスト */
  pendingPermission: PermissionRequest | null;

  /** 記憶した権限選択（ツール名 → 許可/拒否） */
  rememberedChoices: Record<string, boolean>;
}

/**
 * 初期状態
 */
export const initialAgentExecutionState: AgentExecutionState = {
  status: "idle",
  executionId: null,
  currentSkill: null,
  messages: [],
  currentStreamingContent: "",
  error: null,
  startedAt: null,
  completedAt: null,
  pendingPermission: null,
  rememberedChoices: {},
};
```

---

## IPC通信ペイロード型

### AgentStartPayload

実行開始リクエストのペイロード。

```typescript
/**
 * エージェント実行開始ペイロード
 */
export interface AgentStartPayload {
  /** スキルID */
  skillId: string;

  /** ユーザープロンプト */
  prompt: string;

  /** オプション設定 */
  options?: {
    /** セッションID（既存セッション継続時） */
    sessionId?: string;

    /** タイムアウト（ミリ秒） */
    timeout?: number;
  };
}
```

### AgentStopPayload

実行停止リクエストのペイロード。

```typescript
/**
 * エージェント実行停止ペイロード
 */
export interface AgentStopPayload {
  /** 実行ID */
  executionId: string;
}
```

### AgentStreamPayload

ストリーミングメッセージのペイロード。

```typescript
/**
 * ストリーミングメッセージタイプ
 */
export type StreamMessageType =
  | "text" // テキストコンテンツ
  | "tool_use" // ツール使用開始
  | "tool_result" // ツール結果
  | "complete" // メッセージ完了
  | "error"; // エラー

/**
 * ストリーミングメッセージペイロード
 */
export interface AgentStreamPayload {
  /** 実行ID */
  executionId: string;

  /** メッセージタイプ */
  type: StreamMessageType;

  /** コンテンツ */
  content: string;

  /** 完了フラグ */
  isComplete?: boolean;

  /** ツール名（tool_use時） */
  toolName?: string;

  /** ツール引数（tool_use時） */
  toolArgs?: Record<string, unknown>;
}
```

### AgentStatusPayload

実行状態変更通知のペイロード。

```typescript
/**
 * 実行状態変更ペイロード
 */
export interface AgentStatusPayload {
  /** 実行ID */
  executionId: string;

  /** 新しい状態 */
  status: AgentExecutionStatus;

  /** エラーメッセージ（error状態時） */
  error?: string;

  /** 更新日時 */
  updatedAt: Date;
}
```

---

## Zustand状態管理拡張（agentSlice）

### AgentSlice型

```typescript
/**
 * エージェント状態スライス
 */
export interface AgentSlice {
  // === 既存フィールド（Skill Dashboard機能） ===
  skills: Skill[];
  availableSkills: Skill[];
  importedSkillIds: string[];
  selectedSkill: Skill | null;
  skillFilter: string;
  skillCategory: SkillCategory | null;
  isImportDialogOpen: boolean;
  toastMessage: ToastMessage | null;
  isLoading: boolean;
  error: string | null;

  // === 実行状態（新規追加） ===
  executionState: AgentExecutionState;

  // === 既存アクション（Skill Dashboard機能） ===
  setSkills: (skills: Skill[]) => void;
  setAvailableSkills: (skills: Skill[]) => void;
  setImportedSkillIds: (ids: string[]) => void;
  selectSkill: (skill: Skill | null) => void;
  setSkillFilter: (filter: string) => void;
  setSkillCategory: (category: SkillCategory | null) => void;
  openImportDialog: () => void;
  closeImportDialog: () => void;
  showToast: (message: ToastMessage) => void;
  clearToast: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetAgentState: () => void;

  // === 実行アクション（新規追加） ===
  /** 実行開始 */
  startExecution: (skill: Skill, executionId: string) => void;

  /** 実行停止 */
  stopExecution: () => void;

  /** ユーザーメッセージ追加 */
  addUserMessage: (content: string) => void;

  /** アシスタントメッセージ追加 */
  addAssistantMessage: (
    message: Omit<AgentMessage, "id" | "timestamp" | "role">,
  ) => void;

  /** システムメッセージ追加 */
  addSystemMessage: (content: string, type?: "text" | "error") => void;

  /** ストリーミングコンテンツ追加 */
  appendStreamingContent: (content: string) => void;

  /** ストリーミングメッセージ確定 */
  finalizeStreamingMessage: () => void;

  /** 実行状態変更 */
  setExecutionStatus: (status: AgentExecutionStatus) => void;

  /** エラー設定 */
  setExecutionError: (error: string) => void;

  /** メッセージクリア */
  clearMessages: () => void;

  /** 実行状態リセット */
  resetExecutionState: () => void;

  // === Permission関連アクション（新規追加） ===
  /** 権限リクエスト設定 */
  setPermissionRequest: (request: PermissionRequest | null) => void;

  /** 権限応答処理 */
  respondToPermission: (response: PermissionResponse) => void;

  /** 権限選択記憶 */
  rememberPermissionChoice: (toolName: string, approved: boolean) => void;

  /** 記憶した選択取得 */
  getRememberedChoice: (toolName: string) => boolean | undefined;

  /** 記憶クリア */
  clearRememberedChoices: () => void;
}
```

---

## Zodバリデーションスキーマ

```typescript
// packages/shared/src/agent/validation.ts

import { z } from "zod";

/** AgentStartPayloadスキーマ */
export const agentStartPayloadSchema = z.object({
  skillId: z.string().min(1),
  prompt: z.string().min(1).max(100000),
  options: z
    .object({
      sessionId: z.string().uuid().optional(),
      timeout: z.number().int().positive().max(300000).optional(),
    })
    .optional(),
});

/** AgentStopPayloadスキーマ */
export const agentStopPayloadSchema = z.object({
  executionId: z.string().uuid(),
});

/** PermissionRequestスキーマ */
export const permissionRequestSchema = z.object({
  executionId: z.string().uuid(),
  requestId: z.string().uuid(),
  toolName: z.string().min(1),
  args: z.record(z.unknown()),
  reason: z.string().optional(),
  ruleName: z.enum(["ask", "allow", "deny"]).optional(),
  requestedAt: z.date(),
});

/** PermissionResponseスキーマ */
export const permissionResponseSchema = z.object({
  requestId: z.string().uuid(),
  approved: z.boolean(),
  rememberChoice: z.boolean().optional(),
  respondedAt: z.date(),
});

/** AgentStreamPayloadスキーマ */
export const agentStreamPayloadSchema = z.object({
  executionId: z.string().uuid(),
  type: z.enum(["text", "tool_use", "tool_result", "complete", "error"]),
  content: z.string(),
  isComplete: z.boolean().optional(),
  toolName: z.string().optional(),
  toolArgs: z.record(z.unknown()).optional(),
});
```

---

## 変更履歴

| Version | Date       | Author | Changes  |
| ------- | ---------- | ------ | -------- |
| 1.0.0   | 2026-01-12 | Claude | 初版作成 |
