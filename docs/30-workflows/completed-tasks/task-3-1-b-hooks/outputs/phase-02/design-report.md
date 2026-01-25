# Phase 2: 設計 完了レポート

## 実行日時

2026-01-25

---

## タスク1: アーキテクチャ設計

### アーキテクチャ図

```
┌──────────────────────────────────────────────────────────────────┐
│                        SkillExecutor                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     execute()                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │              createHooks(executionId)                   │ │ │
│  │  │  ┌─────────────────┐    ┌─────────────────┐            │ │ │
│  │  │  │   PreToolUse    │    │   PostToolUse   │            │ │ │
│  │  │  │  ┌───────────┐  │    │  ┌───────────┐  │            │ │ │
│  │  │  │  │Danger Chk │  │    │  │Result Ntf │  │            │ │ │
│  │  │  │  │Protected  │  │    │  │Status Ntf │  │            │ │ │
│  │  │  │  │Start Ntf  │  │    │  └───────────┘  │            │ │ │
│  │  │  │  └───────────┘  │    │                 │            │ │ │
│  │  │  └─────────────────┘    └─────────────────┘            │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │              Error Handling                             │ │ │
│  │  │  ┌───────────────┐    ┌───────────────┐                │ │ │
│  │  │  │categorizeError│    │ isRetryable   │                │ │ │
│  │  │  └───────────────┘    └───────────────┘                │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                     sendStream()                            │ │
│  │        → mainWindow.webContents.send("skill:stream", msg)  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↑
                              │ import
          ┌───────────────────┴───────────────────┐
          │       @repo/shared/constants           │
          │  ┌─────────────────────────────────┐  │
          │  │  isDangerousCommand(cmd)        │  │
          │  │  isProtectedPath(path)          │  │
          │  └─────────────────────────────────┘  │
          └───────────────────────────────────────┘
```

### コンポーネント構成表

| コンポーネント    | 役割                                 | 依存                                |
| ----------------- | ------------------------------------ | ----------------------------------- |
| `SkillExecutor`   | スキル実行管理・Hooks統合            | @repo/shared/constants              |
| `createHooks()`   | PreToolUse/PostToolUse Hooksを生成   | sendStream(), security funcs        |
| `PreToolUse`      | 危険コマンド・保護パスチェック・通知 | isDangerousCommand, isProtectedPath |
| `PostToolUse`     | ツール結果・完了ステータス通知       | sendStream()                        |
| `categorizeError` | エラーカテゴリ判定                   | なし                                |
| `isRetryable`     | リトライ可能性判定                   | なし                                |
| `sendStream()`    | ストリームメッセージ送信             | mainWindow.webContents              |

---

## タスク2: 詳細設計 - Hooks インターフェース

### PreToolUse Hook インターフェース

```typescript
type PreToolUseInput = {
  toolName: string;
  args: Record<string, unknown>;
};

type PreToolUseContext = {
  signal: AbortSignal;
};

type PreToolUseResult = { proceed: true } | { proceed: false; message: string };

type PreToolUseHook = (
  input: PreToolUseInput,
  toolUseId: string,
  context: PreToolUseContext,
) => Promise<PreToolUseResult>;
```

### PostToolUse Hook インターフェース

```typescript
type PostToolUseInput = {
  toolName: string;
  result?: unknown;
};

type PostToolUseContext = {
  signal: AbortSignal;
};

type PostToolUseResult = Record<string, never>; // 空オブジェクト

type PostToolUseHook = (
  input: PostToolUseInput,
  toolUseId: string,
  context: PostToolUseContext,
) => Promise<PostToolUseResult>;
```

### Hooks オブジェクト型

```typescript
type SkillExecutorHooks = {
  PreToolUse: PreToolUseHook;
  PostToolUse: PostToolUseHook;
};
```

---

## タスク3: 詳細設計 - PreToolUse 処理フロー

### PreToolUse フローチャート

```
PreToolUse(input, toolUseId, context)
    │
    ▼
┌───────────────────────────────┐
│ input.toolName === "Bash" ?  │
└───────────────┬───────────────┘
                │
    ┌───────────┴───────────┐
    │ YES                   │ NO
    ▼                       ▼
┌─────────────────────┐     │
│ isDangerousCommand  │     │
│ (input.args.command)│     │
└──────────┬──────────┘     │
           │                │
    ┌──────┴──────┐         │
    │ true        │ false   │
    ▼             ▼         │
┌──────────┐      │         │
│sendStream│      │         │
│(blocked) │      │         │
└────┬─────┘      │         │
     │            │         │
     ▼            │         │
┌──────────┐      │         │
│ return   │      │         │
│{proceed: │      │         │
│ false}   │      │         │
└──────────┘      │         │
                  │         │
                  ▼         ▼
          ┌───────────────────────────────────┐
          │ input.toolName === "Write" ||     │
          │ input.toolName === "Edit" ?       │
          └───────────────┬───────────────────┘
                          │
              ┌───────────┴───────────┐
              │ YES                   │ NO
              ▼                       ▼
          ┌─────────────────────┐     │
          │ isProtectedPath     │     │
          │ (args.path ||       │     │
          │  args.file_path)    │     │
          └──────────┬──────────┘     │
                     │                │
              ┌──────┴──────┐         │
              │ true        │ false   │
              ▼             ▼         │
          ┌──────────┐      │         │
          │sendStream│      │         │
          │(blocked) │      │         │
          └────┬─────┘      │         │
               │            │         │
               ▼            │         │
          ┌──────────┐      │         │
          │ return   │      │         │
          │{proceed: │      │         │
          │ false}   │      │         │
          └──────────┘      │         │
                            │         │
                            ▼         ▼
                    ┌───────────────────────┐
                    │ sendStream(tool_use)  │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ return {proceed: true}│
                    └───────────────────────┘
```

---

## タスク4: 詳細設計 - PostToolUse 処理フロー

### PostToolUse フローチャート

```
PostToolUse(input, toolUseId, context)
    │
    ▼
┌───────────────────────────────────┐
│ sendStream({                      │
│   type: "tool_result",            │
│   content: {                      │
│     toolUseId,                    │
│     success: true,                │
│     result: input.result          │
│   }                               │
│ })                                │
└───────────────┬───────────────────┘
                │
                ▼
┌───────────────────────────────────┐
│ sendStream({                      │
│   type: "status",                 │
│   content: {                      │
│     status: "tool_completed",     │
│     detail: input.toolName        │
│   }                               │
│ })                                │
└───────────────┬───────────────────┘
                │
                ▼
┌───────────────────────────────────┐
│ return {}                         │
└───────────────────────────────────┘
```

---

## タスク5: 詳細設計 - エラーハンドリング

### エラーカテゴリ判定ロジック

| 条件                                                       | カテゴリ            |
| ---------------------------------------------------------- | ------------------- |
| `error.name === "AbortError"`                              | `timeout`           |
| `error.message.includes("permission")`                     | `permission_denied` |
| `error.message.includes("network")` or `includes("fetch")` | `network`           |
| `error.message.includes("SDK")` or `includes("API")`       | `sdk_error`         |
| その他                                                     | `unknown`           |

```typescript
type ErrorCategory =
  | "sdk_error"
  | "permission_denied"
  | "timeout"
  | "network"
  | "unknown";

function categorizeError(error: unknown): ErrorCategory {
  if (error instanceof Error) {
    if (error.name === "AbortError") return "timeout";
    if (error.message.includes("permission")) return "permission_denied";
    if (error.message.includes("network") || error.message.includes("fetch"))
      return "network";
    if (error.message.includes("SDK") || error.message.includes("API"))
      return "sdk_error";
  }
  return "unknown";
}
```

### リトライ可能性判定ロジック

| 条件                                   | リトライ可能 |
| -------------------------------------- | ------------ |
| `error.message.includes("network")`    | true         |
| `error.message.includes("timeout")`    | true         |
| `error.message.includes("ECONNRESET")` | true         |
| その他                                 | false        |

```typescript
function isRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    if (
      error.message.includes("network") ||
      error.message.includes("timeout") ||
      error.message.includes("ECONNRESET")
    ) {
      return true;
    }
  }
  return false;
}
```

---

## タスク6: ストリームメッセージ設計

### ストリームメッセージ形式一覧

#### ツール実行開始（tool_use）

```typescript
{
  executionId: string;
  type: "tool_use";
  content: {
    toolName: string;
    args: Record<string, unknown>;
    toolUseId: string;
  }
  timestamp: number;
}
```

#### ツール結果（tool_result）

```typescript
{
  executionId: string;
  type: "tool_result";
  content: {
    toolUseId: string;
    success: boolean;
    result: unknown;
  }
  timestamp: number;
}
```

#### ステータス更新（status - blocked/completed）

```typescript
{
  executionId: string;
  type: "status";
  content: {
    status: "tool_completed";
    detail: string; // ブロック理由 or ツール名
  }
  timestamp: number;
}
```

#### エラー（error）

```typescript
{
  executionId: string;
  type: "error";
  content: {
    code: ErrorCategory;
    message: string;
    retryable: boolean;
  }
  timestamp: number;
}
```

---

## 完了条件チェックリスト

- [x] アーキテクチャ図を作成し、コンポーネント構成を明確化した
- [x] PreToolUse/PostToolUse の入出力インターフェースを定義した
- [x] PreToolUse の処理フローをフローチャートで図示した
- [x] PostToolUse の処理フローをフローチャートで図示した
- [x] エラーカテゴリ判定ロジックを設計した
- [x] リトライ可能性判定ロジックを設計した
- [x] 全ストリームメッセージ形式を定義した

---

## Phase末端アクション

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 3（設計レビューゲート）へ進む
