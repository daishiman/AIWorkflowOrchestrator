# Phase 1: 要件定義 — テスト期待値更新

## メタ情報

| 項目      | 値              |
| --------- | --------------- |
| Phase番号 | 1               |
| 機能名    | test-update     |
| タスクID  | TASK-LLM-MOD-04 |
| 作成日    | 2026-03-23      |
| 前Phase   | なし（初回）    |
| 次Phase   | Phase 2: 設計   |

## 目的

PROVIDER_CONFIGS 更新（Task01）および Adapter 更新（Task02, Task03）の完了を受けて、既存テストが新モデル定義に対して正しく期待値を検証できるよう、テストコードの要件を定義する。

## 実行タスク

### Task 1-1: 変更対象テストファイルの洗い出し

以下のファイルを対象として確定する:

| ファイルパス                                                             | 要変更理由                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                   | handleGetProviders 期待値 / inferProviderId テスト追加 |
| `apps/desktop/src/main/handlers/__tests__/llm-stream.test.ts`            | ストリーミングリクエストのモデルID期待値               |
| `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts`  | ヘルスチェック model フィールド期待値                  |
| `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`     | system_instruction 対応のテスト追加                    |
| `apps/desktop/src/main/adapters/llm/__tests__/OpenAIAdapter.test.ts`     | モデルID期待値（差分確認後に判断）                     |
| `apps/desktop/src/main/adapters/llm/__tests__/xAIAdapter.test.ts`        | モデルID期待値（差分確認後に判断）                     |
| `apps/desktop/src/main/adapters/llm/__tests__/LLMAdapterFactory.test.ts` | ファクトリー登録整合性                                 |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`       | description フィールド追加時のスキーマ検証             |

### Task 1-2: 変更内容の要件整理

#### R-01: handleGetProviders 期待値更新（llm.test.ts）

- Task01 で更新した PROVIDER_CONFIGS に含まれる全プロバイダーの models 配列に一致すること
- 削除されたモデルIDが期待値に含まれていないこと
- 追加されたモデルIDが期待値に含まれていること

#### R-02: inferProviderId テスト追加（llm.test.ts）

- `o3` モデル名に対して `openai` を返すテストケースを追加すること
- `o4-mini` モデル名に対して `openai` を返すテストケースを追加すること

#### R-03: AnthropicAdapter ヘルスチェック期待値更新（AnthropicAdapter.test.ts）

- ヘルスチェックリクエストの model フィールド期待値を `claude-haiku-4-5` に更新すること

#### R-04: GoogleAdapter system_instruction テスト追加（GoogleAdapter.test.ts）

- systemPrompt が指定された場合、API リクエストに `system_instruction.parts[0].text` として設定されること
- systemPrompt が指定されない場合、`system_instruction` フィールドが省略されること
- 既存の user ロール埋め込みワークアラウンドテストを Task03 の変更に合わせて更新すること

#### R-05: 全テスト PASS（受入基準）

- `cd apps/desktop && pnpm vitest run` を実行して全テストが PASS すること
- 新規追加テストケースを含めて PASS すること

### Task 1-3: 非機能要件の確認

- P39 対応: happy-dom 環境では `userEvent` を使わず `fireEvent` を使用すること
- P40 対応: テスト実行は `cd apps/desktop && pnpm vitest run` の形式で実行すること
- 既存のテスト構造（describe/it 階層、beforeEach パターン）を変えないこと

## 参照資料

| 資料                                                                                                                      | 用途                                      |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `docs/30-workflows/llm-provider-model-modernization/tasks/step-01-seq-task-01-provider-configs-update/index.md`           | Task01 完了後の PROVIDER_CONFIGS 変更内容 |
| `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-02-anthropic-adapter-update/index.md`          | Task02 AnthropicAdapter 変更内容          |
| `docs/30-workflows/llm-provider-model-modernization/tasks/step-02-par-task-03-google-adapter-system-instruction/index.md` | Task03 GoogleAdapter 変更内容             |
| `.claude/rules/06-known-pitfalls.md#P39`                                                                                  | happy-dom 環境での userEvent 非互換       |
| `.claude/rules/06-known-pitfalls.md#P40`                                                                                  | テスト実行ディレクトリ依存（モノレポ）    |

## 統合テスト連携

このタスクはテスト専任 lane であるため、テストそのものの品質確保がアウトカム。
Task01〜03 の実装コードが正しいことを検証する統合テストとして、以下を確認する:

- `llm.test.ts` の `handleGetProviders` テストが PROVIDER_CONFIGS の実装と一致すること
- `AnthropicAdapter.test.ts` が Task02 実装と一致すること
- `GoogleAdapter.test.ts` が Task03 実装と一致すること

## 成果物

| 成果物                   | パス                      |
| ------------------------ | ------------------------- |
| 要件定義書（本ファイル） | `phase-1-requirements.md` |

## 完了条件

- [x] 変更対象テストファイル8件が確定している
- [x] R-01〜R-05 の要件が明確に記述されている
- [x] P39/P40 の制約が要件に反映されている
- [x] 受入基準（全テスト PASS）が定義されている

## 次のPhase

Phase 2: 設計 (`phase-2-design.md`)
