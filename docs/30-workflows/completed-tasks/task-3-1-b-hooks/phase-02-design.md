# Phase 2: 設計 - TASK-3-1-B Hooks実装

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-25                    |
| 機能名     | TASK-3-1-B Hooks実装          |

---

## 目的

Phase 1で定義した要件（FR-001〜FR-007）を満たすアーキテクチャと詳細設計を行う。

## 背景

Hooksは`SkillExecutor`クラスの内部メソッドとして実装し、`execute()`メソッドから呼び出す。セキュリティチェックにはTASK-2Cで実装済みの関数を再利用する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: Hooks機能の全体アーキテクチャを設計する

**実行手順**:

1. コンポーネント構成を図示
2. データフローを定義
3. 依存関係を明確化

**期待される成果物**:

- アーキテクチャ図
- コンポーネント構成表

#### アーキテクチャ図

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

#### コンポーネント構成表

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

### タスク2: 詳細設計 - Hooks インターフェース

**目的**: Hooks の入出力インターフェースを詳細に設計する

**実行手順**:

1. PreToolUse Hook のシグネチャを定義
2. PostToolUse Hook のシグネチャを定義
3. 戻り値の型を定義

**期待される成果物**:

- Hooks インターフェース定義

#### PreToolUse Hook インターフェース

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

#### PostToolUse Hook インターフェース

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

#### Hooks オブジェクト型

```typescript
type SkillExecutorHooks = {
  PreToolUse: PreToolUseHook;
  PostToolUse: PostToolUseHook;
};
```

---

### タスク3: 詳細設計 - PreToolUse 処理フロー

**目的**: PreToolUse Hook の内部処理フローを設計する

**実行手順**:

1. 危険コマンドチェックのフローを定義
2. 保護パスチェックのフローを定義
3. 通知処理のフローを定義

**期待される成果物**:

- PreToolUse フローチャート

#### PreToolUse フローチャート

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

### タスク4: 詳細設計 - PostToolUse 処理フロー

**目的**: PostToolUse Hook の内部処理フローを設計する

**実行手順**:

1. ツール結果通知のフローを定義
2. 完了ステータス通知のフローを定義

**期待される成果物**:

- PostToolUse フローチャート

#### PostToolUse フローチャート

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

### タスク5: 詳細設計 - エラーハンドリング

**目的**: エラーカテゴリ判定とリトライ可能性判定のロジックを設計する

**実行手順**:

1. エラーカテゴリ判定ロジックを定義
2. リトライ可能性判定ロジックを定義

**期待される成果物**:

- エラーハンドリング設計

#### エラーカテゴリ判定ロジック

| 条件                                                                         | カテゴリ            |
| ---------------------------------------------------------------------------- | ------------------- |
| `error.name === "AbortError"`                                                | `timeout`           |
| `error.message.includes("permission")`                                       | `permission_denied` |
| `error.message.includes("network")` または `error.message.includes("fetch")` | `network`           |
| `error.message.includes("SDK")` または `error.message.includes("API")`       | `sdk_error`         |
| その他                                                                       | `unknown`           |

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

#### リトライ可能性判定ロジック

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

### タスク6: ストリームメッセージ設計

**目的**: 送信するストリームメッセージの形式を設計する

**実行手順**:

1. 各ストリームメッセージの形式を定義
2. TASK-1-1の`SkillStreamMessage`型との整合性を確認

**期待される成果物**:

- ストリームメッセージ形式一覧

#### ストリームメッセージ形式一覧

**ツール実行開始（tool_use）**

```typescript
{
  executionId: string;
  type: "tool_use";
  content: {
    toolName: string;
    args: Record<string, unknown>;
    toolUseId: string;
  }
  timestamp: number; // Date.now()
}
```

**ツール結果（tool_result）**

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

**ステータス更新（status - blocked）**

```typescript
{
  executionId: string;
  type: "status";
  content: {
    status: "tool_completed";
    detail: string; // ブロック理由
  }
  timestamp: number;
}
```

**ステータス更新（status - completed）**

```typescript
{
  executionId: string;
  type: "status";
  content: {
    status: "tool_completed";
    detail: string; // ツール名
  }
  timestamp: number;
}
```

**エラー（error）**

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

## 参照資料

| 参照資料                  | パス                                                                            | 内容                   |
| ------------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| Phase 1 要件定義          | `./phase-01-requirements.md`                                                    | 機能要件・受け入れ基準 |
| セキュリティパターン定義  | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | 危険パターン・API      |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`     | SDK型定義              |
| 既存実装                  | `docs/30-workflows/skill-import-agent-system/tasks/task-3-1-b-hooks.md`         | 元のコード例           |

---

## 成果物

| 成果物                     | パス           | 内容                             |
| -------------------------- | -------------- | -------------------------------- |
| アーキテクチャ図           | 本ドキュメント | コンポーネント構成・データフロー |
| Hooks インターフェース定義 | 本ドキュメント | PreToolUse/PostToolUse型定義     |
| PreToolUse フローチャート  | 本ドキュメント | 危険コマンド・保護パスチェック   |
| PostToolUse フローチャート | 本ドキュメント | 結果通知・完了通知               |
| エラーハンドリング設計     | 本ドキュメント | カテゴリ判定・リトライ判定       |
| ストリームメッセージ形式   | 本ドキュメント | 各メッセージ形式                 |

---

## 完了条件

- [ ] アーキテクチャ図を作成し、コンポーネント構成を明確化した
- [ ] PreToolUse/PostToolUse の入出力インターフェースを定義した
- [ ] PreToolUse の処理フローをフローチャートで図示した
- [ ] PostToolUse の処理フローをフローチャートで図示した
- [ ] エラーカテゴリ判定ロジックを設計した
- [ ] リトライ可能性判定ロジックを設計した
- [ ] 全ストリームメッセージ形式を定義した

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

```
docs/30-workflows/skill-import-agent-system/tasks/task-3-1-b-hooks/phase-03-review-gate.md
```
