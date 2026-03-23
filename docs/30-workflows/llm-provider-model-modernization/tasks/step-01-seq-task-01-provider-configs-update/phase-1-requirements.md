# Phase 1: 要件定義 — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 1                       |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | なし（起点）            |

## 目的

`apps/desktop/src/main/handlers/llm.ts` 内の `PROVIDER_CONFIGS` に定義された旧モデル一覧と `inferProviderId` のパターンマッチを、各プロバイダーの2026年時点の最新 API 仕様に更新するための要件を定義する。

## 実行タスク

### Task 1-1: 現状調査

- `apps/desktop/src/main/handlers/llm.ts` を読み込み、`PROVIDER_CONFIGS` の現在のモデル一覧と `inferProviderId` の実装を記録する
- 既存テストファイル `__tests__/llm.test.ts` のモデルID関連アサーションを列挙する
- 既存テストが参照しているモデルID（`gpt-4o`、`claude-3-5-sonnet-20241022` 等）を洗い出し、更新後に影響を受けるテストケースを特定する

### Task 1-2: 要件定義

**変更対象**: `apps/desktop/src/main/handlers/llm.ts`

#### 要件 R-01: OpenAI モデル更新

| 項目       | 値                                           |
| ---------- | -------------------------------------------- |
| 削除モデル | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`       |
| 追加モデル | `gpt-4.1`（default, contextWindow: 1048576） |
|            | `gpt-4.1-mini`（contextWindow: 1048576）     |
|            | `gpt-4.1-nano`（contextWindow: 1048576）     |
|            | `o3`（contextWindow: 200000）                |
|            | `o4-mini`（contextWindow: 200000）           |

#### 要件 R-02: Anthropic モデル更新

| 項目       | 値                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| 削除モデル | `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-haiku-20240307` |
| 追加モデル | `claude-sonnet-4-6`（default, contextWindow: 200000）                             |
|            | `claude-opus-4-6`（contextWindow: 200000）                                        |
|            | `claude-haiku-4-5`（contextWindow: 200000）                                       |

#### 要件 R-03: Google モデル更新

| 項目       | 値                                                    |
| ---------- | ----------------------------------------------------- |
| 削除モデル | `gemini-1.5-pro`, `gemini-1.5-flash`                  |
| 追加モデル | `gemini-2.5-flash`（default, contextWindow: 1048576） |
|            | `gemini-2.5-pro`（contextWindow: 1048576）            |
|            | `gemini-2.5-flash-lite`（contextWindow: 1048576）     |

#### 要件 R-04: xAI モデル更新

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| 削除モデル | `grok-beta`                                |
| 追加モデル | `grok-3`（default, contextWindow: 131072） |
|            | `grok-3-mini`（contextWindow: 131072）     |

#### 要件 R-05: OpenRouter モデル（変更なし）

OpenRouter の `PROVIDER_CONFIGS` は今回の変更スコープ外とする。既存定義を維持する。

#### 要件 R-06: `description` フィールド追加

`PROVIDER_CONFIGS` の各モデルオブジェクト型に `description?: string` を追加し、各モデルに1行の説明文を付与する。

#### 要件 R-07: `inferProviderId` パターン追加

`o3` および `o4` で始まるモデルIDが `openai` に解決されること。
既存の `o3`/`o4` パターンがすでにコードに存在する場合は重複追加しない（現行コードを確認して判断する）。

### Task 1-3: 受入基準定義

| ID    | 受入基準                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| AC-01 | `handleGetProviders()` が OpenAI プロバイダーで `gpt-4.1` を `isDefault: true` で返す                                 |
| AC-02 | `handleGetProviders()` が Anthropic プロバイダーで `claude-sonnet-4-6` を `isDefault: true` で返す                    |
| AC-03 | `handleGetProviders()` が Google プロバイダーで `gemini-2.5-flash` を `isDefault: true` で返す                        |
| AC-04 | `handleGetProviders()` が xAI プロバイダーで `grok-3` を `isDefault: true` で返す                                     |
| AC-05 | 旧モデルID（`gpt-4o`, `claude-3-5-sonnet-20241022`, `gemini-1.5-pro`, `grok-beta`）が `PROVIDER_CONFIGS` に存在しない |
| AC-06 | `inferProviderId("o3")` が `"openai"` を返す                                                                          |
| AC-07 | `inferProviderId("o4-mini")` が `"openai"` を返す                                                                     |
| AC-08 | 各モデルオブジェクトに `description` フィールドが存在する（空文字列不可）                                             |
| AC-09 | TypeScript コンパイルエラーが 0 件                                                                                    |
| AC-10 | 既存の `inferProviderId` が返す値（`anthropic`, `google`, `xai`, `openrouter`）は変更されない                         |

### Task 1-4: スコープ外事項の明記

以下は本タスクのスコープ外とする：

- OpenRouter のモデル定義変更
- LLM アダプター実装（LLMAdapterFactory）の変更
- Renderer 側（llmSlice 等）のデフォルトモデル選択ロジックの変更
- Preload 型定義の変更
- API キー検証ロジックの変更

## 参照資料

| 資料名               | パス                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| 現行実装             | `apps/desktop/src/main/handlers/llm.ts`                                                                         |
| 現行テスト           | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                                                          |
| OpenAI モデル調査    | `docs/30-workflows/llm-provider-model-modernization/research/openai-models.md`                                  |
| Anthropic モデル調査 | `docs/30-workflows/llm-provider-model-modernization/research/anthropic-models.md`                               |
| Google モデル調査    | `docs/30-workflows/llm-provider-model-modernization/research/google-models.md`                                  |
| xAI モデル調査       | `docs/30-workflows/llm-provider-model-modernization/research/xai-models.md`                                     |
| タスク概要           | `docs/30-workflows/llm-provider-model-modernization/tasks/step-01-seq-task-01-provider-configs-update/index.md` |

## 成果物

| 成果物                   | パス                                                                                                                                     | 形式              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 要件定義書（本ファイル） | `docs/30-workflows/llm-provider-model-modernization/tasks/step-01-seq-task-01-provider-configs-update/outputs/phase-1/requirements.md`   | Markdown          |
| 影響テスト一覧           | `docs/30-workflows/llm-provider-model-modernization/tasks/step-01-seq-task-01-provider-configs-update/outputs/phase-1/affected-tests.md` | Markdown テーブル |

## 完了条件

- [ ] `PROVIDER_CONFIGS` の現在のモデル一覧（全プロバイダー）を記録した
- [ ] 削除対象モデルID（12個）を確定した
- [ ] 追加対象モデルID（13個）とそのメタデータ（contextWindow, isDefault）を確定した
- [ ] 受入基準 AC-01〜AC-10 を定義した
- [ ] 既存テストへの影響範囲を特定した（影響ありのテストIDを列挙）
- [ ] スコープ外事項を明記した

## 統合テスト連携

Phase 1 では統合テストは実施しない。Phase 4 でテストファイルを作成する際に、本 Phase で特定した影響テスト一覧を参照する。

## 次の Phase

Phase 2: 設計（`phase-2-design.md`）
