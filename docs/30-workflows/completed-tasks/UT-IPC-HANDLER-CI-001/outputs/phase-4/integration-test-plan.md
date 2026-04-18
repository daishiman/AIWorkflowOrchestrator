# 統合テスト計画

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 4                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## テストスイート構成

| テストファイル                                 | 担当範囲                                                                                 | パターン |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| `creatorHandlers.registrationSnapshot.test.ts` | `registerRuntimeSkillCreatorHandlers` のチャンネル登録（Electron mock capture パターン） | 新規     |
| `ipcHandlerRegistrationSnapshot.test.ts`       | 同上（vi.mock パターン、TC-01〜TC-05）                                                   | 既存     |

## 統合テスト実行順序

1. `creatorHandlers.registrationSnapshot.test.ts` - 単体テスト（Electron mock capture パターン）
2. `ipcHandlerRegistrationSnapshot.test.ts` - 単体テスト（mock パターン）
3. 両テストは独立して実行可能（順序非依存）

## CI 統合

| ステップ             | コマンド                                | 期待結果                 |
| -------------------- | --------------------------------------- | ------------------------ |
| テスト実行           | `pnpm --filter @repo/desktop test`      | 全テスト PASS            |
| スナップショット確認 | 自動（--updateSnapshot なし）           | スナップショット差分なし |
| 型チェック           | `pnpm --filter @repo/desktop typecheck` | エラーなし               |
| lint                 | `pnpm --filter @repo/desktop lint`      | エラーなし               |
