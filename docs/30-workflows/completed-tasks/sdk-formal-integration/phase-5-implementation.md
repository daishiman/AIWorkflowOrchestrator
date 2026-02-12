# Phase 5: 実装 — `as any` 除去と型安全な SDK インポートの実装（TDD Green）

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION             |
| Phase番号  | 5                                            |
| Phase名    | 実装                                         |
| 目的       | `as any` 除去と型安全な SDK インポートの実装 |
| 前提Phase  | Phase 4（テスト作成 — TDD Red 状態）         |
| 後続Phase  | Phase 6（テスト拡充）                        |
| ステータス | 未実施                                       |
| ブランチ   | refactor/task-9b-i-sdk-formal-integration    |
| 作成日     | 2026-02-12                                   |

---

## 目的

Phase 4 で作成した Red 状態のテストを Green にするため、`SkillExecutor.ts` の `as any` を除去し、型安全な SDK インポートを実装する。共有型定義ファイル `@anthropic-ai-claude-agent-sdk.d.ts` を SDK の実シグネチャに合わせて更新し、テスト用モックファイルを新型定義に整合させる。本 Phase の変更はすべて型レベルであり、ビジネスロジックの変更は含まない。

---

## 依存関係

| 依存元  | 成果物                                       | 用途                     |
| ------- | -------------------------------------------- | ------------------------ |
| Phase 1 | `outputs/phase-1/requirements-definition.md` | FR/NFR の参照            |
| Phase 1 | `outputs/phase-1/acceptance-criteria.md`     | 受入基準の参照           |
| Phase 2 | `outputs/phase-2/architecture-design.md`     | 型定義更新方針の参照     |
| Phase 2 | `outputs/phase-2/type-mapping.md`            | 型マッピング表の参照     |
| Phase 4 | `outputs/phase-4/test-specification.md`      | テストケース設計の参照   |
| Phase 4 | `SkillExecutor.sdk-types.test.ts`            | Red 状態のテストファイル |

---

## 実行タスク

### Task 1: SDK 型定義更新 — `@anthropic-ai-claude-agent-sdk.d.ts` の修正

#### 対象ファイル

```
packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts
```

#### 修正内容

Phase 2 の設計結果に基づき、SDK の実シグネチャに合致する型定義に更新する。

##### 更新前（現行定義）

```typescript
declare module "@anthropic-ai/claude-agent-sdk" {
  export interface SDKConfig {
    apiKey: string;
  }

  export interface QueryOptions {
    prompt: string;
    sessionId?: string;
    systemPrompt?: string;
  }

  export interface QueryMessage {
    id: string;
    type: "text" | "tool_use" | "tool_result" | "error" | "complete";
    content: string;
    timestamp: number;
    isComplete: boolean;
  }

  export interface QueryResult {
    id: string;
    messages?: QueryMessage[];
  }

  export default class ClaudeSDK {
    constructor(config: SDKConfig);
    query(
      options: QueryOptions,
      onMessage?: (message: QueryMessage) => void,
    ): Promise<QueryResult>;
    abort(): void;
  }
}
```

##### 更新後（SDK 実シグネチャに合致）

以下の型を追加・更新する:

| 型名               | 変更種別 | 内容                                                                                  |
| ------------------ | -------- | ------------------------------------------------------------------------------------- |
| `QueryCallOptions` | 新規追加 | `{ apiKey: string, tools?: string[], permissionMode?: string, signal?: AbortSignal }` |
| `QueryConfig`      | 新規追加 | `{ prompt: string, options: QueryCallOptions }`                                       |
| `SDKMessage`       | 新規追加 | `{ type?: string, content?: string, tool_use?: {...}, error?: {...} }`                |
| `Conversation`     | 新規追加 | `{ stream(): AsyncIterable<SDKMessage> }`                                             |
| `query()`          | 新規追加 | `export function query(config: QueryConfig): Conversation`（名前付きエクスポート）    |
| `QueryOptions`     | 維持     | `AgentExecutor.ts` が参照しているため変更不可                                         |
| `ClaudeSDK`        | 維持     | `agent-client.ts` が参照しているため変更不可                                          |

##### 後方互換性の保証

- `QueryOptions` インターフェースは**変更しない**（`AgentExecutor.ts` が依存）
- `ClaudeSDK` クラスは**変更しない**（`agent-client.ts` が依存）
- 新規型の追加のみで既存の型定義を壊さない

---

### Task 2: SkillExecutor.ts の `as any` 除去

#### 対象ファイル

```
apps/desktop/src/main/services/skill/SkillExecutor.ts
```

#### 修正箇所: 行 759-760

##### 修正前

```typescript
// Dynamic import for SDK
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;
```

##### 修正後

```typescript
// Dynamic import for SDK（型安全）
const { query } = await import("@anthropic-ai/claude-agent-sdk");
```

#### 変更詳細

| 変更項目         | 修正前                                                           | 修正後                                                   |
| ---------------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| 動的 import      | `(await import(...)) as any`                                     | `await import(...)`                                      |
| ESLint コメント  | `// eslint-disable-next-line @typescript-eslint/no-explicit-any` | 除去                                                     |
| JSDoc コメント   | `SDK型定義が不完全なため、anyキャストを使用`                     | `型安全` に更新                                          |
| `query()` 型推論 | `any` — 型チェックなし                                           | `(config: QueryConfig) => Conversation` — 型チェック有効 |

#### ロジック変更の有無

**変更なし**: `callSDKQuery()` メソッドの実行フローは完全に同一。以下のコードは修正対象外:

```typescript
const conversation = query({
  prompt,
  options: {
    apiKey,
    tools: options.tools,
    permissionMode: options.permissionMode,
    signal: options.signal,
  },
});

return {
  stream: () => conversation.stream(),
};
```

---

### Task 3: ESLint 例外コメント除去

#### 修正箇所: 行 758

##### 修正前

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

##### 修正後

コメント行を完全に除去する。

#### 除去理由

`as any` を除去したことで `@typescript-eslint/no-explicit-any` ルールの抑制が不要になるため。

---

### Task 4: SDK モックファイル更新

#### 対象ファイル

```
apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts
```

#### 修正内容

Task 1 で追加した新型定義に合致するモック実装を追加する。

##### 追加するモック

| モック対象     | モック実装                                                 |
| -------------- | ---------------------------------------------------------- |
| `query()` 関数 | 名前付きエクスポートとして `query` 関数を追加              |
| `Conversation` | `stream()` メソッドを持つオブジェクトを返すモック          |
| `SDKMessage`   | `{ type: "text", content: "mock" }` 形式のモックメッセージ |

##### 既存モックの維持

- `ClaudeSDK` クラスのモックは**維持**する（`agent-client.ts` のテストが依存）
- `QueryOptions`, `QueryMessage`, `QueryResult` の型エクスポートは**維持**する
- 新規追加のみで既存モックを壊さない

---

### Task 5: TypeScript コンパイル確認

#### 実行コマンド

```bash
# デスクトップパッケージの型チェック
pnpm --filter @repo/desktop typecheck

# 共有パッケージの型チェック
pnpm --filter @repo/shared typecheck

# 全パッケージの型チェック（最終確認）
pnpm typecheck
```

#### 確認項目

| 確認項目                                               | 期待結果                |
| ------------------------------------------------------ | ----------------------- |
| `SkillExecutor.ts` に `as any` が残っていないこと      | `grep "as any"` で 0 件 |
| `pnpm --filter @repo/desktop typecheck` が成功すること | エラー 0 件             |
| `pnpm --filter @repo/shared typecheck` が成功すること  | エラー 0 件             |
| `pnpm typecheck` が全パッケージで成功すること          | エラー 0 件             |
| `AgentExecutor.ts` に差分がないこと                    | `git diff` で変更なし   |
| `agent-client.ts` に差分がないこと                     | `git diff` で変更なし   |

---

## Electron 層別影響分析

| 層       | 影響有無 | 変更対象ファイル                                                    | 変更内容                           |
| -------- | -------- | ------------------------------------------------------------------- | ---------------------------------- |
| Main     | 有       | `apps/desktop/src/main/services/skill/SkillExecutor.ts`             | `as any` 除去、ESLint コメント除去 |
| Preload  | 無       | なし                                                                | SDK は Main プロセスでのみ使用     |
| Renderer | 無       | なし                                                                | IPC インターフェースに変更なし     |
| Shared   | 有       | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`     | 型定義追加（後方互換性維持）       |
| Test     | 有       | `apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts` | モック関数追加（後方互換性維持）   |

---

## 既知の落とし穴への対策

| Pitfall ID | 内容                               | 対策                                                              |
| ---------- | ---------------------------------- | ----------------------------------------------------------------- |
| P32        | 型定義の二箇所同時更新必須         | `d.ts`（Shared）とモックファイル（Test）を同一コミットで更新する  |
| P11        | PostToolUse フックによる Edit 失敗 | 各 Task の編集後に `git diff --stat` で変更数を確認する           |
| P23        | API 二重定義の型管理複雑性         | 既存型（`QueryOptions`, `ClaudeSDK`）は変更せず新規型のみ追加する |
| P8         | 幽霊依存                           | 型定義は `@repo/shared` に配置し、`package.json` の依存関係と整合 |

---

## 参照資料

| 参照資料                   | パス                                                                                              | 内容                             |
| -------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義書         | `outputs/phase-1/requirements-definition.md`                                                      | FR/NFR の参照                    |
| Phase 2 アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                                                          | 型定義更新方針                   |
| Phase 2 型マッピング表     | `outputs/phase-2/type-mapping.md`                                                                 | 型の対応表                       |
| Phase 4 テストケース設計書 | `outputs/phase-4/test-specification.md`                                                           | テストケース TC-001〜TC-006      |
| SkillExecutor 実装         | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                           | 修正対象ファイル                 |
| SDK 型定義（共有）         | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`                                   | 更新対象の型宣言ファイル         |
| SDK モックファイル         | `apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts`                               | 更新対象のテスト用モック         |
| AgentExecutor 実装         | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                           | 影響ゼロを確認する参照           |
| agent-client 実装          | `apps/desktop/src/main/services/agent/agent-client.ts`                                            | 影響ゼロを確認する参照           |
| 実装パターン集             | `../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P32 型定義二箇所同時更新パターン |
| エラーハンドリング仕様     | `../../.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | SDK エラーレスポンス型           |

---

## 実行手順

### Step 1: SDK 型定義ファイルの更新

1. `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` を開く
2. Task 1 の設計に基づき、`QueryCallOptions`, `QueryConfig`, `SDKMessage`, `Conversation` 型を追加する
3. `query()` 関数を名前付きエクスポートとして追加する
4. 既存の `QueryOptions`, `ClaudeSDK` は変更しない
5. `pnpm --filter @repo/shared typecheck` で型チェックを実行する

### Step 2: SkillExecutor.ts の修正

1. `apps/desktop/src/main/services/skill/SkillExecutor.ts` を開く
2. 行 758 の ESLint 例外コメントを除去する（Task 3）
3. 行 759-760 の `as any` を除去する（Task 2）
4. JSDoc コメントを更新する
5. `pnpm --filter @repo/desktop typecheck` で型チェックを実行する

### Step 3: SDK モックファイルの更新

1. `apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts` を開く
2. Task 4 の設計に基づき、`query()` 関数のモック実装を追加する
3. `Conversation` のモック実装を追加する
4. 既存の `ClaudeSDK` クラスモックは変更しない

### Step 4: テスト実行（TDD Green 確認）

1. `pnpm vitest run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` を実行する
2. Phase 4 で Red だったテストが Green になることを確認する
3. TC-001〜TC-005 が全て PASS することを確認する

### Step 5: 既存テスト全件 PASS 確認（統合テスト連携 -- 必須）

1. `pnpm vitest run apps/desktop/src/main/services/skill/__tests__/` で全 7 ファイルを実行する
2. 既存 6 テストファイルが全件 PASS することを確認する（TC-006）
3. 新規テストファイルが PASS することを確認する

### Step 6: 全パッケージ型チェック

1. `pnpm typecheck` で全パッケージの型チェックを実行する
2. エラー 0 件であることを確認する
3. `AgentExecutor.ts`, `agent-client.ts` に `git diff` で差分がないことを確認する

---

## 成果物

| 成果物                 | 説明                                   | 配置先                                                              |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| 修正済み SkillExecutor | `as any` 除去・ESLint コメント除去済み | `apps/desktop/src/main/services/skill/SkillExecutor.ts`             |
| 更新済み SDK 型定義    | SDK 実シグネチャに合致する型定義       | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`     |
| 更新済みモックファイル | 新型定義に合致するモック実装           | `apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts` |

---

## 統合テスト連携【必須】

以下の 6 つの既存テストファイルが**全て変更なしで PASS** することを確認する:

| No. | テストファイル                         | 確認結果 |
| --- | -------------------------------------- | -------- |
| 1   | `SkillExecutor.test.ts`                | [ ] PASS |
| 2   | `SkillExecutor.auth.test.ts`           | [ ] PASS |
| 3   | `SkillExecutor.retry.test.ts`          | [ ] PASS |
| 4   | `SkillExecutor.integration.test.ts`    | [ ] PASS |
| 5   | `SkillExecutor.permission.test.ts`     | [ ] PASS |
| 6   | `SkillExecutor.type-migration.test.ts` | [ ] PASS |

---

## 完了条件

- [ ] `SkillExecutor.ts` から `as any` が全件除去されている（`grep "as any" SkillExecutor.ts` で 0 件）
- [ ] `SkillExecutor.ts` から `eslint-disable-next-line @typescript-eslint/no-explicit-any` が除去されている
- [ ] `@anthropic-ai-claude-agent-sdk.d.ts` に `QueryCallOptions`, `QueryConfig`, `Conversation`, `SDKMessage` 型が追加されている
- [ ] 既存の `QueryOptions`, `ClaudeSDK` 型が変更されていない
- [ ] SDK モックファイルに `query()` 関数モックが追加されている
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件で成功している
- [ ] `pnpm --filter @repo/shared typecheck` がエラー 0 件で成功している
- [ ] `pnpm typecheck` が全パッケージでエラー 0 件で成功している
- [ ] Phase 4 の型安全テスト（TC-001〜TC-005）が全て PASS している（TDD Green）
- [ ] 既存 6 テストファイルが全件 PASS している（NFR-001 準拠）
- [ ] `AgentExecutor.ts` に差分がない（`git diff` で確認）
- [ ] `agent-client.ts` に差分がない（`git diff` で確認）
- [ ] `@ts-expect-error` / `@ts-ignore` が新規追加されていない（NFR-002 準拠）
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 次Phase

**Phase 6: テスト拡充** — カバレッジ不足箇所のテスト追加
