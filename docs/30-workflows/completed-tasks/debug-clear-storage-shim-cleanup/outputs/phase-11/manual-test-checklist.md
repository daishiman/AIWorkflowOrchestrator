# Phase 11: 手動テストチェックリスト

## メタ情報

| 項目     | 内容                                        |
| -------- | ------------------------------------------- |
| タスクID | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase    | 11                                          |
| 出力種別 | 手動テストチェックリスト                    |

## チェックリスト

| TC  | 確認観点    | 内容                                                                    | 状態 |
| --- | ----------- | ----------------------------------------------------------------------- | ---- |
| 1-1 | 残骸除去    | `debug-clear-storage` が `apps/` / `scripts/` に残っていない            | PASS |
| 1-2 | 残骸除去    | docs / skill 内の残存が historical note 形式に降格済み                  | PASS |
| 2-1 | e2e         | `global-setup.ts` から debug 前提が除去済み                             | PASS |
| 2-2 | e2e         | 認証バイパスが `auth-storage` / `claude-auth-token` で維持される        | PASS |
| 3-1 | script      | screenshot script が debug 前提に依存していない                         | PASS |
| 4-1 | persist     | `App.tsx` に `localStorage.clear()` / `window.location.reload()` がない | PASS |
| 5-1 | spec        | system spec の記録が workflow の状態と整合している                      | PASS |
| 6-1 | link / test | `verify-unassigned-links.js` と全テストが PASS                          | PASS |

## 実行メモ

- CLI 制約により一部の画面取得はコードレビュー代替で確認した。
- `debug-clear-storage` の検索は repo-wide で実施し、不要残骸の分類を完了した。
