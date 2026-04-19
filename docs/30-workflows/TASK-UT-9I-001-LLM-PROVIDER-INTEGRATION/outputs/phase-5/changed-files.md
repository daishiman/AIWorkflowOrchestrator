# Phase 5: 変更ファイル一覧

## 新規作成

| ファイルパス                                                        | 種別         | 説明                                              |
| ------------------------------------------------------------------- | ------------ | ------------------------------------------------- |
| `apps/desktop/src/main/services/llm/LLMClient.ts`                   | 新規         | LLMクライアントFacade（ILLMClient実装）           |
| `apps/desktop/src/main/services/llm/providers/AnthropicProvider.ts` | 新規         | Anthropic API プロバイダ（@anthropic-ai/sdk使用） |
| `apps/desktop/src/main/services/llm/__tests__/LLMClient.test.ts`    | 新規         | ユニットテスト（TC-01〜TC-20）                    |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.docs.test.ts`    | 新規（更新） | IPC統合テスト（H-01〜H-24、T-6-4系）              |

## 修正

| ファイルパス                                                 | 修正内容                              | 変更種別 |
| ------------------------------------------------------------ | ------------------------------------- | -------- |
| `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` | stub実装削除、LLMClient委譲実装に置換 | 機能変更 |

## 変更なし（薄い wiring 維持）

| ファイルパス                                 | 理由                                          |
| -------------------------------------------- | --------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`         | LLMDocQueryAdapterの登録は変更なし            |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | normalizeDocErrorはLLMDocQueryAdapter側で処理 |

## 依存関係

- `@anthropic-ai/sdk`: AnthropicProvider で使用（既存依存）
- `electron-log`: LLMClient / AnthropicProvider でログ出力
- `@repo/shared` の `DocError` / `DocOperationResult`: LLMDocQueryAdapter の返却型
