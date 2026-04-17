# Phase 2: モジュール構成図

## 新規作成ファイル

| ファイルパス                                                        | 種別 | 説明                                            |
| ------------------------------------------------------------------- | ---- | ----------------------------------------------- |
| `apps/desktop/src/main/services/llm/LLMClient.ts`                   | 新規 | LLMクライアントFacade（リトライ・タイムアウト） |
| `apps/desktop/src/main/services/llm/providers/AnthropicProvider.ts` | 新規 | Anthropic SDK ラッパー                          |
| `apps/desktop/src/main/services/llm/__tests__/LLMClient.test.ts`    | 新規 | ユニットテスト（TC-01〜TC-20）                  |

## 修正対象ファイル

| ファイルパス                                                 | 修正内容                          |
| ------------------------------------------------------------ | --------------------------------- |
| `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` | stub実装 → `LLMClient` 委譲に変更 |

## 変更なし（後方互換性維持）

| ファイルパス                                                | 理由                                    |
| ----------------------------------------------------------- | --------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                        | LLMDocQueryAdapter の使用方法は変更なし |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | IPC ハンドラの成功・失敗パスは変更なし  |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | LLMQueryFn 型・DI 契約は変更なし        |
