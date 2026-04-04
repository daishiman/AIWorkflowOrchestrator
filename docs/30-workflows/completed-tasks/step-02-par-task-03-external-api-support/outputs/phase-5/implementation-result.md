# Phase 5: 実装（TDD Green）

## 実装ファイル

| ファイル                                                                    | 変更種別 | 内容                                                                   |
| --------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `packages/shared/src/types/skillCreatorExternalApi.ts`                      | 新規     | 型定義・エラークラス                                                   |
| `packages/shared/src/types/index.ts`                                        | 変更     | re-export追加                                                          |
| `packages/shared/index.ts`                                                  | 変更     | re-export追加                                                          |
| `packages/shared/src/ipc/channels.ts`                                       | 変更     | EXTERNAL_API_CONFIG_REQUIRED + SKILL_CREATOR_EXTERNAL_API_CHANNELS追加 |
| `packages/shared/package.json`                                              | 変更     | exports/typesVersions追加                                              |
| `packages/shared/tsup.config.ts`                                            | 変更     | エントリ追加                                                           |
| `apps/desktop/tsconfig.json`                                                | 変更     | パスマッピング追加                                                     |
| `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts` | 新規     | fetch+AbortController+認証4種                                          |
| `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx`      | 新規     | 外部API設定フォームUI                                                  |

## テスト結果

T-01〜T-08: 全件PASS (Green)
