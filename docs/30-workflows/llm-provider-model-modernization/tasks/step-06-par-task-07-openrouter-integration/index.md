# Task07: OpenRouter プロバイダー統合

## メタ情報

| 項目         | 値                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-LLM-MOD-07                                                                                                       |
| 責務         | OpenRouter を LLM プロバイダーとして全レイヤー（型定義 → アダプター → ファクトリ → ハンドラ → ストレージ → UI）に統合 |
| 実行順序     | step-06-par（step-05 完了後、step-08 と並列可能）                                                                     |
| 依存先       | TASK-LLM-MOD-06（OpenAICompatibleAdapter）                                                                            |
| ブロック対象 | なし                                                                                                                  |
| ステータス   | 実装済み                                                                                                              |

## 目的

OpenRouter を新規 LLM プロバイダーとして全レイヤーに統合する。OpenRouter は複数の AI プロバイダー（OpenAI、Anthropic、Google、Meta 等）のモデルを統一 API で利用可能にするルーティングサービスであり、OpenAI 互換 API を提供するため、TASK-LLM-MOD-06 で実装した `OpenAICompatibleAdapter` を活用して統合する。

## 対象ファイル

| ファイル                                                                            | 変更内容                                                                                                                                                  |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/llm/schemas/provider.ts`                                 | `LLMProviderIdSchema` に `"openrouter"` を追加                                                                                                            |
| `apps/desktop/src/main/handlers/llm.ts`                                             | `PROVIDER_CONFIGS` に OpenRouter モデル定義追加、`inferProviderId` に `/` 含みパターン追加、`isValidProviderId` を `LLMProviderIdSchema.safeParse` に統一 |
| `apps/desktop/src/main/services/secureStorage.ts`                                   | `ALL_PROVIDERS` に `"openrouter"` 追加                                                                                                                    |
| `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                           | `OPENAI_COMPATIBLE_CONFIGS` に OpenRouter 設定追加                                                                                                        |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                                           | ハードコード型リテラルを `LLMProviderId` 型に統一                                                                                                         |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | ハードコード型リテラルを `LLMProviderId` 型に統一                                                                                                         |

## 受入基準

- AC-01: `LLMProviderIdSchema.parse("openrouter")` が成功する
- AC-02: `handleGetProviders()` が OpenRouter プロバイダーを返す
- AC-03: `inferProviderId("openai/gpt-4o")` が `"openrouter"` を返す
- AC-04: `isValidProviderId("openrouter")` が `true` を返す
- AC-05: `LLMAdapterFactory.getAdapter("openrouter")` が `OpenAICompatibleAdapter` を返す
- AC-06: TypeScript コンパイルエラー 0 件

## 完了条件

- [ ] 全 6 ファイルの変更が完了している
- [ ] AC-01 〜 AC-06 の全受入基準を満たしている
- [ ] 既存プロバイダー（openai, anthropic, google, xai）の動作に影響がない
- [ ] TypeScript 型チェック PASS
- [ ] 全テスト PASS
