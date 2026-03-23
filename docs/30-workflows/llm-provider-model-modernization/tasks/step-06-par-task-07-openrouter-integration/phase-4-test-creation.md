# Phase 4: テスト作成（実施済み） -- OpenRouter プロバイダー統合

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 4                       |
| 機能名     | openrouter-integration  |
| タスクID   | TASK-LLM-MOD-07         |
| 作成日     | 2026-03-23              |
| ステータス | 実施済み                |
| 依存Phase  | Phase 3（設計レビュー） |

## 目的

OpenRouter プロバイダー統合の受入基準 AC-01 〜 AC-06 を検証するテストケースを設計・実装する（TDD の Red フェーズ）。

## 実行タスク（実施済み記録）

### Task 4-1: テストケース設計（完了）

#### グループ A: LLMProviderIdSchema の openrouter バリデーション

**テストファイル**: `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`

| テストID | 説明                                                      | 入力                  | 期待値                                   | 対応AC | 結果 |
| -------- | --------------------------------------------------------- | --------------------- | ---------------------------------------- | ------ | ---- |
| TS-A-01  | `"openrouter"` が有効な LLMProviderId として通ること      | `"openrouter"`        | `success: true`, `data === "openrouter"` | AC-01  | PASS |
| TS-A-02  | `"openrouter"` が enum の最後の要素であること（順序確認） | `LLMProviderIdSchema` | 5 要素の enum に `"openrouter"` 含む     | AC-01  | PASS |

#### グループ B: inferProviderId のモデルID推論

**テストファイル**: `apps/desktop/src/main/handlers/__tests__/llm.test.ts`

| テストID | 説明                                                                  | 入力                                   | 期待値         | 対応AC | 結果 |
| -------- | --------------------------------------------------------------------- | -------------------------------------- | -------------- | ------ | ---- |
| TS-B-01  | `/` 含みモデルIDで `"openrouter"` を返す                              | `"openai/gpt-4o"`                      | `"openrouter"` | AC-03  | PASS |
| TS-B-02  | `provider/model` 形式で `"openrouter"` を返す                         | `"anthropic/claude-3.5-sonnet"`        | `"openrouter"` | AC-03  | PASS |
| TS-B-03  | `meta-llama/llama-3.1-405b-instruct` で `"openrouter"` を返す         | `"meta-llama/llama-3.1-405b-instruct"` | `"openrouter"` | AC-03  | PASS |
| TS-B-04  | 既存プレフィックスが `/` より優先されること（`gpt-4o` は openai）     | `"gpt-4o"`                             | `"openai"`     | AC-03  | PASS |
| TS-B-05  | 既存プレフィックスが `/` より優先されること（`claude-` は anthropic） | `"claude-3-haiku-20240307"`            | `"anthropic"`  | AC-03  | PASS |
| TS-B-06  | 一致しないモデルIDで `null` を返す                                    | `"unknown-model"`                      | `null`         | -      | PASS |

#### グループ C: isValidProviderId のバリデーション

**テストファイル**: `apps/desktop/src/main/handlers/__tests__/llm.test.ts`

| テストID | 説明                                        | 入力           | 期待値  | 対応AC | 結果 |
| -------- | ------------------------------------------- | -------------- | ------- | ------ | ---- |
| TS-C-01  | `"openrouter"` が有効なプロバイダーIDである | `"openrouter"` | `true`  | AC-04  | PASS |
| TS-C-02  | `"invalid"` が無効なプロバイダーIDである    | `"invalid"`    | `false` | AC-04  | PASS |
| TS-C-03  | `null` が無効なプロバイダーIDである         | `null`         | `false` | AC-04  | PASS |
| TS-C-04  | `undefined` が無効なプロバイダーIDである    | `undefined`    | `false` | AC-04  | PASS |

#### グループ D: handleGetProviders の OpenRouter 返却

**テストファイル**: `apps/desktop/src/main/handlers/__tests__/llm.test.ts`

| テストID | 説明                                                          | 前提条件                          | 期待値                                  | 対応AC | 結果 |
| -------- | ------------------------------------------------------------- | --------------------------------- | --------------------------------------- | ------ | ---- |
| TS-D-01  | handleGetProviders が OpenRouter を含むプロバイダー一覧を返す | SecureStorage mock（APIキーなし） | `id: "openrouter"` のエントリが含まれる | AC-02  | PASS |
| TS-D-02  | OpenRouter の models が 4 エントリ含む                        | SecureStorage mock                | `models.length === 4`                   | AC-02  | PASS |
| TS-D-03  | OpenRouter の isAvailable が APIキー有無で変化する            | SecureStorage mock（APIキーあり） | `isAvailable: true`                     | AC-02  | PASS |
| TS-D-04  | OpenRouter のモデルIDに `/` が含まれている                    | -                                 | 全モデルの `id` に `/` が含まれる       | AC-02  | PASS |

#### グループ E: LLMAdapterFactory の OpenRouter 対応

**テストファイル**: `apps/desktop/src/main/adapters/llm/__tests__/LLMAdapterFactory.test.ts`

| テストID | 説明                                                         | 前提条件                          | 期待値                           | 対応AC | 結果 |
| -------- | ------------------------------------------------------------ | --------------------------------- | -------------------------------- | ------ | ---- |
| TS-E-01  | `getAdapter("openrouter")` が OpenAICompatibleAdapter を返す | SecureStorage mock（APIキーあり） | アダプターインスタンスが返される | AC-05  | PASS |
| TS-E-02  | `getAllProviderIds()` に `"openrouter"` が含まれる           | -                                 | `"openrouter"` が配列に含まれる  | AC-05  | PASS |

### Task 4-2: テストコード実装（完了）

既存テストファイルのインポートパスを確認してからテストコードを記述した（P63 対策）。

### Task 4-3: テスト実行（Green 確認済み）

全テスト（TS-A 〜 TS-E 全 16 ケース）が PASS であることを確認した。本タスクは実装済みのため、Red フェーズではなく Green 確認となった。

## 参照資料

| 資料                                                                     | 用途                   |
| ------------------------------------------------------------------------ | ---------------------- |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`       | 既存テスト確認・追加先 |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                   | 既存テスト確認・追加先 |
| `apps/desktop/src/main/adapters/llm/__tests__/LLMAdapterFactory.test.ts` | 既存テスト確認・追加先 |
| Phase 2 設計書                                                           | テスト設計の基礎       |

## 成果物

| 成果物                       | パス                                                                     | 備考                    |
| ---------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| スキーマバリデーションテスト | `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`       | TS-A-01, TS-A-02 追加   |
| ハンドラーテスト             | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                   | TS-B, TS-C, TS-D 系追加 |
| アダプターファクトリテスト   | `apps/desktop/src/main/adapters/llm/__tests__/LLMAdapterFactory.test.ts` | TS-E-01, TS-E-02 追加   |

## 完了条件

- [x] テストケース設計（TS-A 〜 TS-E 全 16 ケース）が完了した
- [x] 既存テストファイルのインポートパスを確認してからテストコードを記述した（P63 対策）
- [x] テストコードを実装した
- [x] 実装済みの変更に対するテストが全件 PASS であることを確認した

## 次のPhase

[Phase 5: 実装](./phase-5-implementation.md)
