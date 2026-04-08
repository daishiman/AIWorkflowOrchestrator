# Phase 4: テスト作成 成果物

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 4                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 作成したテストファイル

`apps/desktop/src/__tests__/native/better-sqlite3-abi.test.ts`

### テストケース

1. **インメモリ DB を開いて CRUD が正常動作すること** — ABI 不一致の場合 require 時点で ERR_DLOPEN_FAILED が発生するため、このテストが通ることで Node.js プロセス上での動作を確認できる
2. **DB を閉じた後に再オープンできること** — 再使用可能性の確認

### Vitest テストと Electron 手動テストの役割分担

| 確認手段            | 役割                                     |
| ------------------- | ---------------------------------------- |
| Vitest テスト       | Node.js プロセスでの動作補助確認         |
| Phase 11 手動テスト | Electron での実際の ABI 確認（主要検証） |

## Electron 起動ログ確認観点（Phase 11 向け）

| ログパターン                                      | 期待値         |
| ------------------------------------------------- | -------------- |
| `ERR_DLOPEN_FAILED`                               | 出ないこと     |
| `[DB] Failed to initialize conversation database` | 出ないこと     |
| `[DB] Conversation database initialized`          | 出ること       |
| `[IPC] Handler registration completed` の失敗件数 | `0` であること |

## 完了条件チェック

- [x] `better-sqlite3` を `require` してインメモリ DB を操作するテストが作成されている
- [x] テスト実行コマンドが確認されている（`pnpm --filter @repo/desktop test`）
- [x] Electron 起動ログの確認観点（4パターン）が定義されている
- [x] Vitest テストと Electron 手動テストの役割分担が明確になっている
