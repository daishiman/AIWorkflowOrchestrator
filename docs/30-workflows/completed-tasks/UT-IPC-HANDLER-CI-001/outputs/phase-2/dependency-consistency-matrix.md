# 依存整合マトリクス

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 2                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 依存関係

| 依存元                                         | 依存先                             | 依存内容                                           | 整合状態 |
| ---------------------------------------------- | ---------------------------------- | -------------------------------------------------- | -------- |
| `creatorHandlers.registrationSnapshot.test.ts` | `creatorHandlers.ts`               | `registerRuntimeSkillCreatorHandlers` をインポート | ✅       |
| `creatorHandlers.registrationSnapshot.test.ts` | `electron` (vi.mock)               | `ipcMain.handle` mock capture                      | ✅       |
| CI ワークフロー                                | `pnpm --filter @repo/desktop test` | 既存テストコマンドで自動実行                       | ✅       |
| スナップショットファイル                       | `creatorHandlers.ts` の登録順序    | ソート済みのため順序非依存                         | ✅       |

## 干渉確認

| テスト                                            | 干渉リスク                                 | 対策                                                       |
| ------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| `ipcHandlerRegistrationSnapshot.test.ts` との干渉 | 低（独立したファイル、別スナップショット） | `beforeEach` で `vi.clearAllMocks()` + `vi.resetModules()` |
| 既存の `creatorHandlers.*.test.ts` との干渉       | 低（capture を `beforeEach` で再設定）     | `mockImplementation` を各テスト前に再設定する              |

## Vitest バージョン制約

| 機能                             | 必要バージョン | 利用可否 |
| -------------------------------- | -------------- | -------- |
| `vi.mock` / `mockImplementation` | 0.x+           | ✅       |
| `toMatchSnapshot`                | 0.x+           | ✅       |
| `vi.clearAllMocks`               | 0.x+           | ✅       |
| `vi.resetModules`                | 0.x+           | ✅       |
