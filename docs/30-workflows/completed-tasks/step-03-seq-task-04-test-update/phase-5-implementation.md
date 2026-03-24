# Phase 5: 実装（テスト期待値の実際の更新） — テスト期待値更新

## メタ情報

| 項目      | 値                  |
| --------- | ------------------- |
| Phase番号 | 5                   |
| 機能名    | test-update         |
| タスクID  | TASK-LLM-MOD-04     |
| 作成日    | 2026-03-23          |
| 前Phase   | Phase 4: テスト作成 |
| 次Phase   | Phase 6: テスト拡充 |

## 目的

Phase 4 で設計した内容に基づき、各テストファイルの期待値更新および新規テストケースの追加を実際に行う。

## 実行タスク

### Task 5-1: 事前確認（依存タスクの完了確認）

実装開始前に Task01〜03 が完了していることを確認する。未完了の場合は完了を待つ。

```bash
# PROVIDER_CONFIGS の確認（Task01 成果物）
grep -n "models" apps/desktop/src/main/handlers/llm/providers.ts | head -30

# AnthropicAdapter のヘルスチェックモデルID確認（Task02 成果物）
grep -n "claude-haiku" apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts

# GoogleAdapter の system_instruction 実装確認（Task03 成果物）
grep -n "system_instruction" apps/desktop/src/main/adapters/llm/GoogleAdapter.ts
```

### Task 5-2: llm.test.ts の更新

#### Step 1: 現行テスト内容を Read で確認

```bash
# ファイル全体を読み込んで変更箇所を特定
# Read ツールを使用: apps/desktop/src/main/handlers/__tests__/llm.test.ts
```

#### Step 2: handleGetProviders 期待値更新

1. `handleGetProviders` の describe ブロックを特定する
2. 各プロバイダーの `models` 配列期待値を PROVIDER_CONFIGS の現行定義に合わせて更新する
3. 削除済みモデルIDを期待値から除去し、追加済みモデルIDを期待値に追加する

#### Step 3: inferProviderId テスト追加

既存の inferProviderId describe ブロック末尾に T-01 / T-02 を追加する:

```typescript
it("should return 'openai' for model 'o3'", () => {
  const result = inferProviderId("o3");
  expect(result).toBe("openai");
});

it("should return 'openai' for model 'o4-mini'", () => {
  const result = inferProviderId("o4-mini");
  expect(result).toBe("openai");
});
```

### Task 5-3: llm-stream.test.ts の更新

1. ファイルを Read して旧モデルIDを使用している箇所を特定する
2. 旧モデルIDを新モデルIDに置換する
3. 変更不要な場合はスキップ（スキップした場合は本ファイルの完了条件チェックボックスに記録する）

### Task 5-4: AnthropicAdapter.test.ts の更新

1. ファイルを Read してヘルスチェック関連テストを特定する
2. `model` フィールドの期待値を `"claude-haiku-4-5"` に変更する

変更対象の確認コマンド:

```bash
grep -n "claude-3-haiku\|healthCheck\|model:" apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

### Task 5-5: GoogleAdapter.test.ts の更新

1. ファイルを Read して既存の構造（mockFetch の変数名、describe 階層）を確認する
2. 既存のシステムプロンプト関連テストを確認し、Task03 の変更と整合させる
3. T-03 / T-04 の追加テストを Phase 4 設計に基づいて追加する（mockFetch の実際の変数名を使用すること）

### Task 5-6: OpenAIAdapter.test.ts / xAIAdapter.test.ts の差分確認と更新

```bash
# 旧モデルIDの使用箇所確認
grep -n "gpt-3.5\|gpt-4-0\|text-davinci\|grok-1" apps/desktop/src/main/adapters/llm/__tests__/OpenAIAdapter.test.ts
grep -n "grok-1[^.]" apps/desktop/src/main/adapters/llm/__tests__/xAIAdapter.test.ts
```

旧モデルIDが使用されている場合のみ更新する。変更なしの場合はスキップ。

### Task 5-7: LLMAdapterFactory.test.ts の確認と更新

```bash
grep -n "providerId\|adapterId\|model:" apps/desktop/src/main/adapters/llm/__tests__/LLMAdapterFactory.test.ts
```

Task01 で追加・削除されたプロバイダーIDに関する期待値が含まれている場合のみ更新する。

### Task 5-8: provider.test.ts の確認と更新

```bash
grep -n "description\|schema\|parse" packages/shared/src/types/llm/schemas/__tests__/provider.test.ts
```

Task01 で `description` フィールドが追加された場合かつスキーマテストが必須フィールドとして検証している場合のみ更新する。

### Task 5-9: 初回テスト実行（Task 4-4 相当）

```bash
# 必須: apps/desktop ディレクトリから実行（P40 対応）
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

FAIL した場合:

- 期待値の記述ミスを修正する
- Task01〜03 の実装バグが原因の場合は依存タスクへフィードバックする

## 実装チェックリスト

| 対象ファイル              | 作業           | 完了 |
| ------------------------- | -------------- | ---- |
| llm.test.ts               | 期待値更新     | [ ]  |
| llm.test.ts               | T-01/T-02 追加 | [ ]  |
| llm-stream.test.ts        | 差分確認・更新 | [ ]  |
| AnthropicAdapter.test.ts  | 期待値更新     | [ ]  |
| GoogleAdapter.test.ts     | T-03/T-04 追加 | [ ]  |
| OpenAIAdapter.test.ts     | 差分確認・更新 | [ ]  |
| xAIAdapter.test.ts        | 差分確認・更新 | [ ]  |
| LLMAdapterFactory.test.ts | 差分確認・更新 | [ ]  |
| provider.test.ts          | 差分確認・更新 | [ ]  |

## 参照資料

| 資料                                     | 用途                               |
| ---------------------------------------- | ---------------------------------- |
| `phase-4-test-creation.md`               | 追加テストケース T-01〜T-04 の設計 |
| `phase-2-design.md`                      | ファイル別変更方針                 |
| `.claude/rules/06-known-pitfalls.md#P40` | テスト実行ディレクトリ確認         |

## 統合テスト連携

Task 5-9 の実行結果が全 PASS になれば、Task01〜03 の実装が期待通りに動作していることが検証される。FAIL が継続する場合は依存タスクの実装問題として上位にエスカレーションする。

## 成果物

| 成果物                            | パス                                                                    |
| --------------------------------- | ----------------------------------------------------------------------- |
| 更新済み llm.test.ts              | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                  |
| 更新済み llm-stream.test.ts       | `apps/desktop/src/main/handlers/__tests__/llm-stream.test.ts`           |
| 更新済み AnthropicAdapter.test.ts | `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` |
| 更新済み GoogleAdapter.test.ts    | `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`    |

## P50 適用記録

> Task01-03 実装時にテスト更新が同時完了していたことを Phase 5 事前確認で発見。
> 「検証・補完モード」に切り替え、変更0行で全要件充足を確認した。

## 完了条件

- [x] P50 パターン適用: Task01-03 完了時にテスト更新済みであることを確認（変更0行）
- [ ] Task01〜03 が完了済みであることを確認した
- [ ] llm.test.ts の handleGetProviders 期待値が PROVIDER_CONFIGS と一致している
- [ ] inferProviderId に o3 / o4-mini のテストケースが追加されている
- [ ] AnthropicAdapter.test.ts のヘルスチェック期待値が `claude-haiku-4-5` になっている
- [ ] GoogleAdapter.test.ts に T-03 / T-04 が追加されている
- [ ] `cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts` が PASS する
- [ ] `cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/` が PASS する

## 次のPhase

Phase 6: テスト拡充 (`phase-6-test-expansion.md`)
