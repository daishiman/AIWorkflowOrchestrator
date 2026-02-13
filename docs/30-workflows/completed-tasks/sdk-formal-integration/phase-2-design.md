# Phase 2: 設計 — 型安全な SDK 統合の設計

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION                        |
| Phase番号  | 2                                                       |
| Phase名    | 設計                                                    |
| 目的       | 型安全な SDK 統合のアーキテクチャ・インターフェース設計 |
| 前提Phase  | Phase 1（要件定義）                                     |
| 後続Phase  | Phase 3（設計レビューゲート）                           |
| ステータス | 未実施                                                  |
| ブランチ   | refactor/task-9b-i-sdk-formal-integration               |
| 作成日     | 2026-02-12                                              |

---

## 目的

Phase 1 で定義した要件に基づき、`SkillExecutor.ts` の `as any` を除去するための具体的な設計を行う。SDK の実シグネチャに合致する型定義の更新方針、動的 import の型付けパターン、およびローカル型定義との整合性設計を策定する。

---

## 依存関係

| 依存元  | 成果物                                       | 用途                 |
| ------- | -------------------------------------------- | -------------------- |
| Phase 1 | `outputs/phase-1/requirements-definition.md` | 要件（FR/NFR）の参照 |
| Phase 1 | `outputs/phase-1/acceptance-criteria.md`     | 受入基準の参照       |

---

## 実行タスク

### Task 1: SDK 型定義調査 — 実エクスポートの特定

#### 調査手順

1. `node_modules/@anthropic-ai/claude-agent-sdk/` のエントリポイントを確認する
2. SDK が公開する TypeScript 型定義（`.d.ts` ファイル）を特定する
3. `query()` メソッドの実シグネチャを確認する
4. 公開されている型名（`ClaudeClient`, `QueryOptions` 等）を一覧化する

#### 調査対象

| 調査項目                     | 調査先                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------ |
| パッケージエントリポイント   | `node_modules/@anthropic-ai/claude-agent-sdk/package.json` の `main` / `types` |
| `query()` シグネチャ         | SDK の `.d.ts` または `index.js` 内の JSDoc                                    |
| エクスポートされる型         | `export type` / `export interface` の一覧                                      |
| `AgentExecutor.ts` の import | 既に型安全な import がどの型を使用しているか                                   |

#### 成果物

`outputs/phase-2/type-mapping.md` に以下を記録する:

| 項目               | 現行 `d.ts` 定義 | SDK 実定義   | 差分         |
| ------------------ | ---------------- | ------------ | ------------ |
| `query()` 引数     | `QueryOptions`   | （調査結果） | （差分詳細） |
| `query()` 戻り値   | `QueryResult`    | （調査結果） | （差分詳細） |
| クライアント生成   | `createClient()` | （調査結果） | （差分詳細） |
| エクスポート型一覧 | （現行一覧）     | （調査結果） | （差分詳細） |

### Task 2: 型定義更新設計 — `@anthropic-ai-claude-agent-sdk.d.ts` の修正方針

#### 設計方針の検討

以下の選択肢を比較し、最適な方針を決定する:

| 方針                                   | メリット                       | デメリット                           | 採用判断 |
| -------------------------------------- | ------------------------------ | ------------------------------------ | -------- |
| A: `d.ts` を SDK 実定義に完全合わせる  | 型安全性が最大化される         | `AgentExecutor` 等への影響調査が必要 | 要検討   |
| B: `QueryOptions` にオーバーロード追加 | 後方互換性を維持しつつ拡張可能 | 型定義が複雑化する                   | 要検討   |
| C: `d.ts` を削除し SDK 自体の型を使用  | メンテナンスコスト最小         | SDK に `.d.ts` がない場合は不可      | 要検討   |

#### 設計判断の基準

- `AgentExecutor.ts` / `agent-client.ts` が現行 `d.ts` のどの型を参照しているかで方針が決まる
- SDK 自体が TypeScript 型定義を公開している場合は方針 C を優先する
- SDK が型定義を公開していない場合は方針 A または B を選択する

#### 型定義更新の設計テンプレート

```typescript
// 方針 A の場合: d.ts を SDK 実定義に合わせる
declare module "@anthropic-ai/claude-agent-sdk" {
  // SDK の実エクスポートに合わせた型定義
  export interface QueryOptions {
    prompt: string;
    options?: {
      apiKey?: string;
      tools?: unknown[];
      permissionMode?: string;
      signal?: AbortSignal;
    };
    sessionId?: string;
    systemPrompt?: string;
  }

  // ... 他のエクスポート
}
```

```typescript
// 方針 B の場合: オーバーロード追加
declare module "@anthropic-ai/claude-agent-sdk" {
  // 既存の QueryOptions（AgentExecutor 用）
  export interface QueryOptions {
    prompt: string;
    sessionId?: string;
    systemPrompt?: string;
  }

  // SkillExecutor 用の拡張 QueryOptions
  export interface SkillQueryOptions extends QueryOptions {
    options?: {
      apiKey?: string;
      tools?: unknown[];
      permissionMode?: string;
      signal?: AbortSignal;
    };
  }
}
```

### Task 3: 動的 import 型付け設計

#### 現状（型安全でない）

```typescript
// SkillExecutor.ts:759 — 現状
const sdk = (await import("@anthropic-ai/claude-agent-sdk")) as any;
sdk.query(/* ... */); // 型チェックなし
```

#### 設計案: 型安全な動的 import

TypeScript の動的 `import()` は `Promise<typeof import("module")>` を返す。`d.ts` が正しく定義されていれば、`as any` なしで型推論が有効になる。

```typescript
// 設計案 1: 直接的な動的 import（d.ts が正しい場合）
const sdk = await import("@anthropic-ai/claude-agent-sdk");
// sdk.query() に型チェックが適用される

// 設計案 2: 型アノテーション付き動的 import
type SDKModule = typeof import("@anthropic-ai/claude-agent-sdk");
const sdk: SDKModule = await import("@anthropic-ai/claude-agent-sdk");

// 設計案 3: 分割代入で必要なエクスポートのみ取得
const { query, createClient } = await import("@anthropic-ai/claude-agent-sdk");
```

#### 設計判断の基準

| 判断基準                      | 設計案 1    | 設計案 2     | 設計案 3               |
| ----------------------------- | ----------- | ------------ | ---------------------- |
| TypeScript 型推論の正確性     | `d.ts` 依存 | 明示的で確実 | `d.ts` 依存            |
| コードの簡潔さ                | 最も簡潔    | やや冗長     | 中程度                 |
| 既存コードとの差分量          | 最小        | 小           | 中（分割代入への変更） |
| `AgentExecutor.ts` との一貫性 | 要確認      | 要確認       | 要確認                 |

### Task 4: ローカル型定義整理 — `SDKQueryOptions` と共有型の整合性設計

#### 現状の問題

`SkillExecutor.ts` 内に `SDKQueryOptions` インターフェースが独自定義されている（420-425行目）:

```typescript
interface SDKQueryOptions {
  tools?: unknown[];
  permissionMode?: string;
  signal?: AbortSignal;
  timeout?: number;
}
```

この型は共有型定義 `@anthropic-ai-claude-agent-sdk.d.ts` の `QueryOptions` と独立して存在し、整合性が保証されていない。

#### 設計方針

| 方針                                    | 説明                                              | 判断             |
| --------------------------------------- | ------------------------------------------------- | ---------------- | ----- | ------ |
| ローカル型を廃止し共有型に統合          | `d.ts` 更新後、ローカル型は不要になる可能性がある | 要検討           |
| ローカル型を共有型からの派生に変更      | `Pick<SDKModuleType, 'tools'                      | 'permissionMode' | ...>` | 要検討 |
| ローカル型を維持（リネーム + コメント） | スコープ外を最小化、ただし二重定義の問題は残る    | 要検討           |

---

## 参照資料

| 参照資料                      | パス                                                                                        | 内容                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 1 成果物                | `outputs/phase-1/requirements-definition.md`                                                | 要件定義書                           |
| Phase 1 成果物                | `outputs/phase-1/acceptance-criteria.md`                                                    | 受入基準書                           |
| SkillExecutor 実装            | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                     | `as any` 使用箇所の実装ファイル      |
| SDK 型定義（共有）            | `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`                             | 現行の SDK 型宣言ファイル            |
| AgentExecutor 実装            | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                     | 型安全な import パターンの参照       |
| agent-client 実装             | `apps/desktop/src/main/services/agent/agent-client.ts`                                      | 型安全な import パターンの参照       |
| Executor インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`        | SkillExecutor のインターフェース仕様 |
| 実装パターン集                | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P32 型定義二箇所同時更新パターン     |
| エラーハンドリング仕様        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | SDK エラーレスポンス型定義           |

---

## 実行手順

### Step 1: SDK 実型定義の調査

1. `node_modules/@anthropic-ai/claude-agent-sdk/` 内を調査し、公開されている型定義を取得する
2. `query()` の実シグネチャを特定する
3. `AgentExecutor.ts` が使用している SDK 型を確認する
4. `type-mapping.md` に調査結果をまとめる

### Step 2: 型定義更新方針の決定

1. Task 2 の設計方針（A/B/C）を SDK 調査結果に基づいて決定する
2. 決定理由を文書化する
3. `AgentExecutor.ts` / `agent-client.ts` への影響がゼロであることを設計段階で保証する

### Step 3: 動的 import 型付けパターンの決定

1. Task 3 の設計案（1/2/3）を選択する
2. `AgentExecutor.ts` との一貫性を優先する
3. 具体的なコード変更差分のドラフトを作成する

### Step 4: ローカル型定義の整理方針決定

1. Task 4 のローカル型（`SDKQueryOptions`）の処理方針を決定する
2. 共有型定義との関係を明確にする

### Step 5: 設計文書の作成

1. 全 Task の設計結果を `architecture-design.md` にまとめる
2. `type-mapping.md` に型の対応表を記録する

---

## 成果物

| 成果物             | 説明                                        | 配置先                                   |
| ------------------ | ------------------------------------------- | ---------------------------------------- |
| アーキテクチャ設計 | 型定義更新方針・import パターン・整合性設計 | `outputs/phase-2/architecture-design.md` |
| 型マッピング表     | 現行定義と SDK 実定義の対応表               | `outputs/phase-2/type-mapping.md`        |

---

## Electron 層別影響分析

| 層       | 影響有無 | 詳細                                                     |
| -------- | -------- | -------------------------------------------------------- |
| Main     | 有       | `SkillExecutor.ts` の型定義変更（バックエンド層）        |
| Preload  | 無       | SDK は Main プロセスでのみ使用されるため影響なし         |
| Renderer | 無       | SDK の直接参照なし、IPC 経由のインターフェースに変更なし |
| Shared   | 有       | `@anthropic-ai-claude-agent-sdk.d.ts` の型定義更新       |

---

## 統合テスト連携

本タスクは型定義のみの変更であり、新規統合テストの設計は不要。Phase 5 の既存テスト全件 PASS 確認で統合的な動作保証を行う。

---

## 完了条件

- [ ] SDK の `query()` 実シグネチャが調査・文書化されている
- [ ] 型定義更新方針（A/B/C）が決定され、理由が記載されている
- [ ] 動的 import 型付けパターン（1/2/3）が決定されている
- [ ] `SDKQueryOptions` ローカル型の処理方針が決定されている
- [ ] `AgentExecutor.ts` / `agent-client.ts` への影響がゼロであることが設計段階で確認されている
- [ ] 全設計結果が `outputs/phase-2/architecture-design.md` に記録されている
- [ ] 型マッピング表が `outputs/phase-2/type-mapping.md` に記録されている
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 次Phase

**Phase 3: 設計レビューゲート** — Phase 2 設計の妥当性検証
