# IPC チャネル・レスポンス形式インベントリ

## 概要

E2E テストで検証対象とする IPC チャネルとレスポンス形式を、コードベースの実装に基づいて定義する。

> **重要（P60 修正）**: エラーレスポンスの `error` フィールドは単純な `string` 型である。`{ code: string, message: string }` ではない。これは `creatorHandlers.ts` および `skillCreatorHandlers.ts` の実装に準拠する。

---

## 共通レスポンス型

```typescript
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string; // 注意: string 型（P60修正）
}
```

- 成功時: `{ success: true, data: T }`
- エラー時: `{ success: false, error: "サニタイズ済みエラーメッセージ" }`

---

## チャネル一覧

### 1. `skill-creator:plan`

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| チャネル定数 | `IPC_CHANNELS.SKILL_CREATOR_PLAN`                                  |
| ハンドラー   | `creatorHandlers.ts` → `RuntimeSkillCreatorFacade.plan()`          |
| リクエスト型 | `{ prompt: string; authMode?: AuthMode; apiKey?: string \| null }` |
| レスポンス型 | `IpcResult<RuntimeSkillCreatorPlanResponse>`                       |

**成功レスポンス（通常）**:

```typescript
{
  success: true,
  data: {
    planId: string,
    skillSpec: string,
    estimatedSteps: number,
    skillName: string,
    description: string,
    agents: Array<{ name: string; role: string }>,
    scripts: Array<{ name: string; purpose: string }>,
    triggers: string[],
    anchors: string[]
  }
}
```

**成功レスポンス（TerminalHandoff）**:

```typescript
{
  success: true,
  data: {
    type: "terminal_handoff",
    guidance: {
      terminalCommand: string,
      contextSummary: string,
      reason: string
    }
  }
}
```

**エラーレスポンス**:

```typescript
{ success: false, error: "サニタイズ済みエラーメッセージ文字列" }
```

---

### 2. `skill-creator:execute-plan`

| 項目         | 内容                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| チャネル定数 | `IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN`                                             |
| ハンドラー   | `creatorHandlers.ts` → `RuntimeSkillCreatorFacade.execute()`                          |
| リクエスト型 | `{ planId: string; skillSpec: string; authMode?: AuthMode; apiKey?: string \| null }` |
| レスポンス型 | `IpcResult<RuntimeSkillCreatorExecuteResponse>`                                       |

**成功レスポンス**:

```typescript
{
  success: true,
  data: {
    executeId: string,
    skillName: string,
    success: boolean,
    error?: string
  }
}
```

**エラーレスポンス**:

```typescript
{ success: false, error: "サニタイズ済みエラーメッセージ文字列" }
```

---

### 3. `skill-creator:improve-skill`

| 項目         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| チャネル定数 | `IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL`                                              |
| ハンドラー   | `creatorHandlers.ts` → `RuntimeSkillCreatorFacade.improve()`                            |
| リクエスト型 | `{ skillName: string; feedback: string; authMode?: AuthMode; apiKey?: string \| null }` |
| レスポンス型 | `IpcResult<RuntimeSkillCreatorImproveResponse>`                                         |

**成功レスポンス（改善提案）**:

```typescript
{
  success: true,
  data: {
    improveId: string,
    suggestions: Array<{
      section: string,
      before: string,
      after: string,
      reason: string
    }>,
    revisedSpec?: string
  }
}
```

**成功レスポンス（TerminalHandoff）**:

```typescript
{
  success: true,
  data: {
    type: "terminal_handoff",
    guidance: { terminalCommand: string, contextSummary: string, reason: string }
  }
}
```

**エラーレスポンス**:

```typescript
{ success: false, error: "サニタイズ済みエラーメッセージ文字列" }
```

---

### 4. `skill-creator:apply-improvement`

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| チャネル定数 | `IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT`                               |
| ハンドラー   | `creatorHandlers.ts` → `RuntimeSkillCreatorFacade.applyImprovement()`        |
| リクエスト型 | `{ skillName: string; suggestions: RuntimeSkillCreatorImproveSuggestion[] }` |
| レスポンス型 | `IpcResult<ApplyImprovementResult>`                                          |

**成功レスポンス**:

```typescript
{
  success: true,
  data: {
    applied: number,
    skipped: number,
    skippedDetails: Array<{ section: string; reason: string }>,
    errors: string[]
  }
}
```

---

### 5. `skill-creator:progress`（Push チャネル）

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| チャネル定数 | `IPC_CHANNELS.SKILL_CREATOR_PROGRESS`                    |
| 方向         | Main → Renderer（`webContents.send`）                    |
| ペイロード型 | `{ phase: string; percentage: number; message: string }` |

注意: invoke ではなく push 型。テストでは `webContents.send` のスパイで検証する。

---

### 6. `skill:create`（既存チャネル - 後方互換）

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| チャネル定数 | `IPC_CHANNELS.SKILL_CREATE`         |
| ハンドラー   | `skillHandlers.ts` の既存ハンドラー |
| レスポンス型 | `IpcResult<string>`（スキルパス）   |

後方互換のため、新規チャネルと並行して動作する必要がある。

---

### 7. `skill-creator:verify`（未実装 - 本タスクで実装）

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| チャネル定数 | 未定義（本タスク FR-4 で新規追加） |
| ハンドラー   | 新規実装                           |
| 対応FR       | FR-4                               |

注意: 現時点では `channels.ts` にも `creatorHandlers.ts` にも定義されていない。Phase 5（実装）で新規追加する。

---

### 8. `skill-creator:cancel`（未実装）

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| チャネル定数 | 未定義                         |
| ステータス   | 未実装（本タスクのスコープ外） |

注意: `index.md` で言及されているが、`channels.ts` には未定義。本タスクでの実装対象外。

---

## エラーフォーマットに関する注意（P60 修正）

コードベースの実装確認結果:

- `skillCreatorHandlers.ts` L39-43: `IpcResult<T> = { success: boolean; data?: T; error?: string }`
- `creatorHandlers.ts` L24-28: 同様の `IpcResult<T>` 定義
- `sanitizeErrorMessage()` は `string` を返す

したがって、エラーレスポンスの `error` は**単純な `string` 型**である。`{ code: string, message: string }` 形式ではない。テストのアサーションでは `result.error` を直接文字列比較する。

> 例外: `RuntimeSkillCreatorFacade.improve()` 内部では `{ code, message }` 形式のエラーを返す場合があるが、IPC ハンドラー層（`creatorHandlers.ts`）の catch 句で `sanitizeErrorMessage()` により `string` に変換される。
