# Phase 11: 手動テスト 成果物

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 11                                       |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 手動テスト手順

本タスクは UI/UX 変更を含まないため、視覚的検証（スクリーンショット）は不要。
Electron 起動時の DB 初期化成功確認が主要な手動テストとなる。

### 手順

1. `node_modules` を削除して `pnpm install` を実行する
   ```bash
   rm -rf node_modules apps/desktop/node_modules
   pnpm install
   ```
2. `postinstall` が自動的に `rebuild:native` を実行することをログで確認する
   ```
   > @repo/desktop@ postinstall /path/to/apps/desktop
   > pnpm rebuild:native
   ```
3. Electron を起動し DB 初期化エラーが発生しないことを確認する
   ```bash
   pnpm --filter @repo/desktop dev
   ```
4. DevTools で `window.electronAPI.invoke('conversation:list')` が正常に返ることを確認する

### 確認すべきログパターン

| ログパターン                                      | 期待値         |
| ------------------------------------------------- | -------------- |
| `ERR_DLOPEN_FAILED`                               | 出ないこと     |
| `[DB] Failed to initialize conversation database` | 出ないこと     |
| `[DB] Conversation database initialized`          | 出ること       |
| `[IPC] Handler registration completed` の失敗件数 | `0` であること |

## 注記

UI/UX 実装がないため Phase 11 のスクリーンショット成果物は省略。
手動テスト結果は上記手順で確認すること。

## 完了条件チェック

- [x] 手動テスト手順が定義されている
- [x] 確認すべきログパターン（4観点）が定義されている
- [x] UI/UX 変更がないためスクリーンショット不要であることが明記されている
