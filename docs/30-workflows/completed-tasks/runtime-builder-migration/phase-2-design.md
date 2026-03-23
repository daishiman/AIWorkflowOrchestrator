# Phase 2: 設計

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | UT-RUNTIME-BUILDER-MIGRATION-001 |
| Phase    | 2（設計）                        |
| 前提     | Phase 1 要件定義 完了            |
| 作成日   | 2026-03-23                       |

---

## 1. 設計方針

### 1.1 統一メソッドの配置先

`runtime/TerminalHandoffBuilder.ts` に `buildForSurface()` を追加する。

**理由**:

- 既に `buildForAgentExecution()` / `buildForSkillExecution()` という surface 別メソッドを持つ
- `sanitizePrompt()` / `sanitizePath()` などのセキュリティユーティリティが実装済み
- `chat-edit/TerminalHandoffBuilder.ts` は `SendWithContextRequest` に特化した簡易実装であり、汎用化に不向き

### 1.2 リクエスト型の設計

surface ごとに異なるリクエスト型を discriminated union で統一する。

```typescript
/** buildForSurface() の統一リクエスト型 */
export type BuildForSurfaceRequest =
  | ChatEditSurfaceRequest
  | RuntimeSurfaceRequest
  | SkillDocsSurfaceRequest;

export interface ChatEditSurfaceRequest {
  surfaceType: "chat-edit";
  /** 編集コマンドタイプ */
  commandType: string;
  /** 対象ファイルパスの配列 */
  filePaths: string[];
  /** ユーザーメッセージ（任意） */
  message?: string;
  /** ワークスペースパス（任意） */
  workspacePath?: string;
}

export interface RuntimeSurfaceRequest {
  surfaceType: "runtime";
  /** "agent" または "skill" のサブタイプ */
  runtimeType: "agent" | "skill";
  /** スキルID（任意） */
  skillId?: string;
  /** スキル名（任意） */
  skillName?: string;
  /** プロンプト（任意） */
  prompt?: string;
  /** 作業ディレクトリ（任意） */
  workingDirectory?: string;
}

export interface SkillDocsSurfaceRequest {
  surfaceType: "skill-docs";
  /** クエリテキスト */
  queryText?: string;
  /** スキル名（任意） */
  skillName?: string;
}
```

---

## 2. buildForSurface() メソッド設計

### 2.1 メソッドシグネチャ

```typescript
buildForSurface(
  request: BuildForSurfaceRequest,
  reason: HandoffGuidance["reason"],
): HandoffGuidance
```

### 2.2 内部フロー

```
buildForSurface(request, reason)
  ├─ switch (request.surfaceType)
  │   ├─ "chat-edit"  → buildContextSummaryForChatEdit(request)
  │   ├─ "runtime"    → buildContextSummaryForRuntime(request)
  │   ├─ "skill-docs" → buildContextSummaryForSkillDocs(request)
  │   └─ default      → throw Error("Unknown surfaceType")  ← P62 対策
  │
  ├─ terminalCommand = buildTerminalCommand(request)
  │
  └─ return { terminalCommand, contextSummary, reason }
```

### 2.3 surface 別 contextSummary 生成

| surfaceType       | 生成ロジック                                                                                          | 出力例                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| "chat-edit"       | `command={commandType} files={filePaths.map(basename).join(",")} workspace={basename(workspacePath)}` | `command=refactor files=App.tsx,utils.ts workspace=my-project` |
| "runtime" (agent) | `surface=agent skill={skillId \|\| "unknown"}`                                                        | `surface=agent skill=code-review`                              |
| "runtime" (skill) | `surface=skill skill={skillName \|\| skillId \|\| "unknown"}`                                         | `surface=skill skill=test-generator`                           |
| "skill-docs"      | `surface=skill-docs query={queryText \|\| "none"}`                                                    | `surface=skill-docs query=How to use X`                        |

### 2.4 terminalCommand 生成

全 surface で共通のコマンド生成ロジックを使用:

```typescript
private buildTerminalCommandForSurface(request: BuildForSurfaceRequest): string {
  const prompt = this.extractPrompt(request);
  const safePrompt = this.sanitizePrompt(prompt);
  return `claude -p "${safePrompt}"`;
}
```

`extractPrompt()` は surface 別にプロンプトを抽出:

| surfaceType  | プロンプト抽出                                                 |
| ------------ | -------------------------------------------------------------- |
| "chat-edit"  | `request.message ?? "Please {commandType} the selected code"`  |
| "runtime"    | `request.prompt ?? "現在のコンテキストで実行を続けてください"` |
| "skill-docs" | `request.queryText ?? "スキルドキュメントを確認してください"`  |

---

## 3. 旧メソッドの deprecated 付与

### 3.1 runtime/TerminalHandoffBuilder の旧メソッド

```typescript
/**
 * @deprecated buildForSurface() を使用してください。
 * 移行先: buildForSurface({ surfaceType: "runtime", ... }, reason)
 */
build(prompt: string, cwd: string, options?: HandoffBuildOptions): TerminalHandoffBundle

/**
 * @deprecated buildForSurface() を使用してください。
 * 移行先: buildForSurface({ surfaceType: "runtime", runtimeType: "agent", ... }, reason)
 */
buildForAgentExecution(request: AgentHandoffBuildRequest, reason: string): HandoffGuidance

/**
 * @deprecated buildForSurface() を使用してください。
 * 移行先: buildForSurface({ surfaceType: "runtime", runtimeType: "skill", ... }, reason)
 */
buildForSkillExecution(request: SkillHandoffBuildRequest, reason: string): HandoffGuidance
```

### 3.2 chat-edit/TerminalHandoffBuilder の旧メソッド

```typescript
/**
 * @deprecated runtime/TerminalHandoffBuilder.buildForSurface() を使用してください。
 * 移行先: buildForSurface({ surfaceType: "chat-edit", ... }, reason)
 */
build(request: SendWithContextRequest, reason: string): HandoffGuidance
```

---

## 4. 呼び出し元の移行設計

### 4.1 ipc/chatEditHandlers.ts（L179）

**Before:**

```typescript
import { TerminalHandoffBuilder } from "../services/chat-edit/TerminalHandoffBuilder";
// ...
const builder = new TerminalHandoffBuilder();
const guidance = builder.build(args, resolution.reason);
```

**After:**

```typescript
import { TerminalHandoffBuilder } from "../services/runtime/TerminalHandoffBuilder";
// ...
const builder = new TerminalHandoffBuilder();
const guidance = builder.buildForSurface(
  {
    surfaceType: "chat-edit",
    commandType: args.command.type,
    filePaths: args.contexts.map((ctx) => ctx.filePath),
    message: args.message,
    workspacePath: args.workspacePath,
  },
  resolution.reason,
);
```

### 4.2 ipc/agentHandlers.ts（L64-76）

**Before:**

```typescript
const builder = new TerminalHandoffBuilder();
const response: AgentStartResult = {
  // ...
  guidance: builder.buildForAgentExecution(
    {
      skillId: request.skillId,
      prompt: request.prompt,
      workingDirectory: request.workingDirectory,
    },
    resolution.reason,
  ),
};
```

**After:**

```typescript
const builder = new TerminalHandoffBuilder();
const response: AgentStartResult = {
  // ...
  guidance: builder.buildForSurface(
    {
      surfaceType: "runtime",
      runtimeType: "agent",
      skillId: request.skillId,
      prompt: request.prompt,
      workingDirectory: request.workingDirectory,
    },
    resolution.reason,
  ),
};
```

### 4.3 ipc/skillHandlers.ts（L392-404）

**Before:**

```typescript
const builder = new TerminalHandoffBuilder();
const guidance = builder.buildForSkillExecution(
  { skillName, skillId, prompt, workingDirectory },
  resolution.reason,
);
```

**After:**

```typescript
const builder = new TerminalHandoffBuilder();
const guidance = builder.buildForSurface(
  {
    surfaceType: "runtime",
    runtimeType: "skill",
    skillName: hasSkillName ? args.skillName : undefined,
    skillId: hasSkillName ? undefined : args.skillId,
    prompt: hasSkillName ? args.prompt : undefined,
    workingDirectory:
      hasSkillName && typeof args.workingDirectory === "string"
        ? args.workingDirectory
        : undefined,
  },
  resolution.reason,
);
```

### 4.4 RuntimeSkillCreatorFacade.ts（L72-76）

**Before:**

```typescript
const bundle = this.handoffBuilder.build(
  `Skill を作成してください: ${skillSpec}`,
  process.cwd(),
);
return { type: "terminal_handoff", bundle };
```

**After:**

```typescript
const guidance = this.handoffBuilder.buildForSurface(
  {
    surfaceType: "runtime",
    runtimeType: "skill",
    prompt: `Skill を作成してください: ${skillSpec}`,
    workingDirectory: process.cwd(),
  },
  decision.reason ?? "terminal_handoff",
);
return { type: "terminal_handoff", guidance };
```

**注意**: `RuntimeSkillCreatorFacade` の戻り値型 `RuntimeSkillCreatorPlanResponse` が `bundle: TerminalHandoffBundle` から `guidance: HandoffGuidance` に変更される。これは P44 対策（内部型 Renderer 漏洩防止）として正しい方向だが、呼び出し元の型定義も更新が必要。

---

## 5. P62 対策: 未知 surfaceType のエラー処理

```typescript
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
      const _exhaustive: never = request;
      throw new Error(
        `Unknown surfaceType: ${(_exhaustive as BuildForSurfaceRequest).surfaceType}`,
      );
    }
  }
}
```

TypeScript の `never` 型による exhaustive check で、新しい surfaceType が追加された場合にコンパイルエラーとして検出可能。

---

## 6. ファイル変更スコープ

| ファイル                              | 変更種別 | 変更内容                                                         |
| ------------------------------------- | -------- | ---------------------------------------------------------------- |
| `runtime/TerminalHandoffBuilder.ts`   | 修正     | `buildForSurface()` 追加、型定義追加、旧メソッドに `@deprecated` |
| `ipc/chatEditHandlers.ts`             | 修正     | import 変更 + `buildForSurface()` 呼び出しに移行                 |
| `ipc/agentHandlers.ts`                | 修正     | `buildForSurface()` 呼び出しに移行                               |
| `ipc/skillHandlers.ts`                | 修正     | `buildForSurface()` 呼び出しに移行                               |
| `RuntimeSkillCreatorFacade.ts`        | 修正     | `buildForSurface()` 呼び出しに移行 + 戻り値型調整                |
| `chat-edit/TerminalHandoffBuilder.ts` | 修正     | `build()` に `@deprecated` 付与                                  |
| `TerminalHandoffBuilder.test.ts`      | 修正     | `buildForSurface()` テスト追加（12+ ケース）                     |
| `llm-workspace-chat-edit.md`          | 修正     | `buildForSurface()` 仕様セクション更新                           |

---

## 7. テストマトリクス（Phase 4 用）

### 7.1 surfaceType × reason マトリクス（12 ケース）

| #   | surfaceType       | reason                   | 検証ポイント                                    |
| --- | ----------------- | ------------------------ | ----------------------------------------------- |
| 1   | "chat-edit"       | "subscription mode"      | contextSummary に command/files 情報が含まれる  |
| 2   | "chat-edit"       | "API key not configured" | contextSummary に workspace 情報が含まれる      |
| 3   | "chat-edit"       | "terminal_handoff"       | terminalCommand が claude -p 形式               |
| 4   | "chat-edit"       | "LLM unreachable"        | reason フィールドが正確                         |
| 5   | "runtime" (agent) | "subscription mode"      | contextSummary に surface=agent が含まれる      |
| 6   | "runtime" (agent) | "API key not configured" | skillId が contextSummary に反映                |
| 7   | "runtime" (skill) | "terminal_handoff"       | skillName が contextSummary に反映              |
| 8   | "runtime" (skill) | "LLM unreachable"        | promptが sanitize されている                    |
| 9   | "skill-docs"      | "subscription mode"      | contextSummary に surface=skill-docs が含まれる |
| 10  | "skill-docs"      | "API key not configured" | queryText が contextSummary に反映              |
| 11  | "skill-docs"      | "terminal_handoff"       | terminalCommand が安全                          |
| 12  | "skill-docs"      | "LLM unreachable"        | reason フィールドが正確                         |

### 7.2 追加テストケース

| #   | テスト種別 | 検証ポイント                                                  |
| --- | ---------- | ------------------------------------------------------------- |
| 13  | P62 対策   | 未知の surfaceType でエラーが throw される                    |
| 14  | P55 対策   | terminalCommand に shell 特殊文字が含まれない                 |
| 15  | 空値処理   | prompt/message が未指定の場合にデフォルト値が使用される       |
| 16  | 返却型     | 戻り値が HandoffGuidance 型（TerminalHandoffBundle ではない） |

---

## 8. リスク評価

| リスク                                                                 | 影響度 | 対策                                                                                  |
| ---------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| RuntimeSkillCreatorFacade の戻り値型変更が波及                         | 中     | `RuntimeSkillCreatorPlanResponse` の `bundle` → `guidance` 変更は型定義ファイルも更新 |
| chat-edit/TerminalHandoffBuilder.ts の import 元が他にも存在する可能性 | 低     | grep で確認済み: export は index.ts 経由のみ                                          |
| 旧メソッド削除時の互換性                                               | 低     | `@deprecated` 付与のみ。削除は別タスク                                                |

---

## 統合テスト連携

本 Phase は設計のため、統合テストの追加・更新は不要。テストマトリクスの設計は Section 7 で完了。

---

## 多角的チェック観点

| 観点               | 確認内容                                          | 該当        |
| ------------------ | ------------------------------------------------- | ----------- |
| セキュリティ       | sanitizePrompt が全 surface で適用される設計か    | Section 2.4 |
| 型安全性           | never 型 exhaustive check が設計されているか      | Section 5   |
| API設計            | 2引数メソッドシグネチャが既存パターンと整合するか | Section 2.1 |
| エラーハンドリング | 未知 surfaceType で明示的エラーをスローするか     | Section 5   |

---

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成すること:

- [ ] 統一メソッドの配置先を決定する
- [ ] リクエスト型の discriminated union を設計する
- [ ] surface 別 contextSummary フォーマットを設計する
- [ ] 呼び出し元の Before/After 移行設計を作成する
- [ ] P62 対策の exhaustive check を設計する
- [ ] テストマトリクスを設計する

## タスク100%実行確認【必須】

- [ ] 全サブタスクが完了している
- [ ] 成果物が完了条件を満たしている

---

## 次 Phase

Phase 3（設計レビュー）へ進む。
