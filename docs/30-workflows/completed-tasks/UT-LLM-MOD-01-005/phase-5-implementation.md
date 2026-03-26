# Phase 5: 実装

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| Phase      | 5                 |
| Phase名    | 実装              |
| 前提Phase  | Phase 4           |
| 後続Phase  | Phase 6           |
| ステータス | 完了              |
| 作成日     | 2026-03-25        |
| 機能名     | UT-LLM-MOD-01-005 |

---

## 目的

Phase 2 の設計に基づき、PROVIDER_CONFIGS を SSoT として LLMProviderIdSchema と inferProviderId を自動導出する実装を行う。Phase 4 で作成したテストを全て PASS（Green）させる。

---

## 背景

Phase 4 で作成したテストが全て FAIL（Red状態）であることを確認済み。TDD の Green フェーズとして、テストを PASS させる実装を行う。provider-registry.ts の新規作成と、provider.ts/llm.ts の変更を段階的に実施する。

---

## 実行タスク

1. `provider-registry.ts` を新設し、`PROVIDER_CONFIGS` / `PROVIDER_IDS` / `inferProviderId` を集約する。
2. `provider.ts` を `z.enum(PROVIDER_IDS)` ベースへ置き換える。
3. `index.ts` / `llm.ts` を shared registry 参照へ切り替える。
4. Red テストを Green に変え、型チェックと既存互換を維持する。

### ロールバック手順

実装中にビルドが通らなくなった場合:

```bash
# 変更前の状態に戻す
git stash
# 問題を確認後、変更を復帰
git stash pop
```

### Step 1: `provider-registry.ts` 新規作成

**対象ファイル**: `packages/shared/src/types/llm/schemas/provider-registry.ts`（新規）

実装内容:

1. `ProviderConfigEntry` / `ProviderModelEntry` インターフェースの定義
2. `PROVIDER_CONFIGS` 定数の定義（SSoT）
   - 既存 `apps/desktop/src/main/handlers/llm.ts` の `PROVIDER_CONFIGS`（34-208行）からデータを移行
   - 各プロバイダーに `modelPrefixes` フィールドを追加
   - OpenRouter に `specialMatcher: (modelId) => modelId.includes("/")` を追加
3. `PROVIDER_IDS` の自動導出（`PROVIDER_CONFIGS.map(p => p.id) as [string, ...string[]]`）
4. `inferProviderId()` 関数の実装
   - `specialMatcher` → `modelPrefixes` の優先順位でマッチング
   - マッチなしの場合 `null` を返す

```typescript
// modelPrefixes の設定値
// openai:     ["gpt-", "o3", "o4"]
// anthropic:  ["claude-"]
// google:     ["gemini-"]
// xai:        ["grok-"]
// openrouter: [] + specialMatcher: (modelId) => modelId.includes("/")
```

### Step 2: `provider.ts` 変更

**対象ファイル**: `packages/shared/src/types/llm/schemas/provider.ts`

変更内容:

1. `PROVIDER_IDS` を `./provider-registry` から import
2. `LLMProviderIdSchema` の定義を手動列挙から自動導出に変更

```typescript
// Before:
export const LLMProviderIdSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "xai",
  "openrouter",
]);

// After:
import { PROVIDER_IDS } from "./provider-registry";

export const LLMProviderIdSchema = z.enum(PROVIDER_IDS);
```

**注意**: `export type LLMProviderId = z.infer<typeof LLMProviderIdSchema>;` は変更不要。

### Step 3: `index.ts` 変更

**対象ファイル**: `packages/shared/src/types/llm/schemas/index.ts`

変更内容: `provider-registry.ts` からの re-export を追加

```typescript
// 追加分
export {
  PROVIDER_CONFIGS,
  PROVIDER_IDS,
  inferProviderId,
} from "./provider-registry";
export type {
  ProviderConfigEntry,
  ProviderModelEntry,
} from "./provider-registry";
```

### Step 4: `llm.ts` 変更

**対象ファイル**: `apps/desktop/src/main/handlers/llm.ts`

変更内容:

1. `PROVIDER_CONFIGS` ローカル定義を削除（34-208行付近）
2. `inferProviderId` ローカル定義を削除（519-532行付近）
3. `@repo/shared` からの import に追加

```typescript
// Before:
import {
  LLMProviderIdSchema,
  type LLMProviderId,
  // ...
} from "@repo/shared/types/llm/schemas";

// After:
import {
  LLMProviderIdSchema,
  PROVIDER_CONFIGS,
  inferProviderId,
  type LLMProviderId,
  // ...
} from "@repo/shared/types/llm/schemas";
```

**注意点**:

- `PROVIDER_CONFIGS` の参照箇所（`getAvailableModels` 等）が shared からの import で動作することを確認
- `inferProviderId` の戻り値型が `string | null` に変わるため、呼び出し側の型互換性を確認
- `as LLMProviderId` へ逃がさず、`ProviderIdUnion` と tuple 導出で型整合を維持する

### Step 5: 型チェック実行

```bash
pnpm typecheck
```

全パッケージで型チェックが PASS することを確認する。

### Step 6: テスト実行（Green 確認）

```bash
pnpm --filter @repo/shared test -- --run provider-registry
```

Phase 4 で作成した全テストが PASS（Green）することを確認する。

---

## 参照資料

| 参照資料         | パス                                                | 内容                       |
| ---------------- | --------------------------------------------------- | -------------------------- |
| Phase 2 設計     | `phase-2-design.md`                                 | 詳細設計・コードスニペット |
| Phase 4 テスト   | `phase-4-test-creation.md`                          | テスト仕様                 |
| 現行 llm.ts      | `apps/desktop/src/main/handlers/llm.ts`             | 移行元ソースコード         |
| 現行 provider.ts | `packages/shared/src/types/llm/schemas/provider.ts` | 変更対象 Zod スキーマ      |
| 現行 index.ts    | `packages/shared/src/types/llm/schemas/index.ts`    | re-export 追加先           |

---

## 統合テスト連携

| 接続ポイント                           | 確認内容                                                            |
| -------------------------------------- | ------------------------------------------------------------------- |
| `provider-registry.ts` → `provider.ts` | PROVIDER_IDS import が正常動作し LLMProviderIdSchema が導出される   |
| `index.ts` re-export                   | 外部パッケージから PROVIDER_CONFIGS, inferProviderId が import 可能 |
| `llm.ts` → `@repo/shared`              | ローカル定義削除後、shared からの import で既存機能が維持される     |
| 既存 import 元                         | `health.ts`, `ipc.ts`, `request.ts`, `response.ts` が変更不要       |

---

## 成果物

| 成果物                | パス                                                         | 内容                 |
| --------------------- | ------------------------------------------------------------ | -------------------- |
| provider-registry.ts  | `packages/shared/src/types/llm/schemas/provider-registry.ts` | SSoT 定義（新規）    |
| provider.ts（変更済） | `packages/shared/src/types/llm/schemas/provider.ts`          | 自動導出版           |
| index.ts（変更済）    | `packages/shared/src/types/llm/schemas/index.ts`             | re-export 追加       |
| llm.ts（変更済）      | `apps/desktop/src/main/handlers/llm.ts`                      | ローカル定義削除     |
| 型チェック結果        | `outputs/phase-5/typecheck-result.md`                        | pnpm typecheck 結果  |
| テスト結果            | `outputs/phase-5/test-green-result.md`                       | Green フェーズの結果 |
| 実装記録              | `outputs/phase-5/implementation-record.md`                   | 実装作業の記録       |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run provider-registry
pnpm --filter @repo/shared test -- --run provider
pnpm --filter @repo/desktop test -- --run llm
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）
- [ ] Phase 4 で FAIL だったテストが全て PASS に変わったことを確認

---

## 完了条件

- [ ] `provider-registry.ts` が新規作成されている
- [ ] `PROVIDER_CONFIGS` に全5プロバイダーの定義が含まれている（openai, anthropic, google, xai, openrouter）
- [ ] `PROVIDER_IDS` が `PROVIDER_CONFIGS` から自動導出されている
- [ ] `inferProviderId` が `PROVIDER_CONFIGS` の `modelPrefixes` / `specialMatcher` から自動導出されている
- [ ] `provider.ts` の `LLMProviderIdSchema` が `PROVIDER_IDS` から自動導出に変更されている
- [ ] `index.ts` に re-export が追加されている
- [ ] `llm.ts` からローカルの `PROVIDER_CONFIGS` と `inferProviderId` が削除されている
- [ ] `llm.ts` が `@repo/shared` から `PROVIDER_CONFIGS` と `inferProviderId` を import している
- [ ] `pnpm typecheck` が全パッケージで PASS
- [ ] `pnpm --filter @repo/shared test -- --run provider-registry` が全テスト PASS（Green）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 5
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 5 実行記録

### 実行タスク

| タスク | 結果 | 備考 |
| ------ | ---- | ---- |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- ***

## 次のPhase

Phase 6: テスト拡充

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-6-*.md`
