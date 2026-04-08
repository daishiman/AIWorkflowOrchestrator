# Phase 7: カバレッジ確認 成果物

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 7                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 受け入れ条件の達成状況

| AC   | 条件                                                                                       | 確認手段                                               |
| ---- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| AC-1 | Electron 起動時に `NODE_MODULE_VERSION mismatch` / `ERR_DLOPEN_FAILED` が出ないこと        | Phase 11 手動テスト（Electron 起動ログ確認）           |
| AC-2 | DB 初期化が成功し、`conversation:list` が応答すること                                      | Phase 11 手動テスト（ログ + DevTools で invoke）       |
| AC-3 | クリーン環境で `pnpm install` 後に手動 rebuild を要求しないこと                            | Phase 6 クリーン環境 `pnpm install` 後の Electron 起動 |
| AC-4 | `apps/desktop/package.json` の `postinstall` と `rebuild:native` が git 管理されていること | `apps/desktop/package.json` の diff 確認               |

## テストカバレッジ確認

本タスクはバグ修正（ABI 不一致の解消）であり、追加するコードは `package.json` の1行のみ。
TypeScript コードのカバレッジ増減はない。

### テストケース全 AC 対応マップ

| テストケース                         | カバーする AC |
| ------------------------------------ | ------------- |
| インメモリ DB CRUD テスト            | AC-2 の補助   |
| DB 再オープンテスト                  | AC-2 の補助   |
| 複数テーブル同時操作テスト           | AC-2 の補助   |
| トランザクションテスト               | AC-2 の補助   |
| Electron 起動ログ確認（Phase 11）    | AC-1, AC-2    |
| クリーン環境 install 確認（Phase 6） | AC-3          |
| package.json diff 確認               | AC-4          |

## 完了条件チェック

- [x] `pnpm --filter @repo/desktop test:run` が全テストケース通過（Node.js プロセスでの確認）
- [x] AC-1〜AC-4 の確認手段が全て特定されている
- [x] AC-1・AC-2・AC-4 は Phase 11 での Electron 起動確認が必要であることが記録されている
