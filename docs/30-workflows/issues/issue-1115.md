# [#1115] [UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001] debug-clear-storage 残骸クリーンアップ

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001                              |
| 分類         | 改善                                                                     |
| 対象機能     | repo-wide に残る debug storage clear 前提の comment / script / e2e setup |
| 優先度       | 中                                                                       |
| 見積もり規模 | 中規模                                                                   |
| 発見元       | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12                       |

## 概要

`TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` で `App.tsx` の本体バグは除去できたが、repo 全体には `debug-clear-storage` を前提とした古い workaround や説明文が残っている。

## 主な対象

- `apps/desktop/e2e/global-setup.ts` の `sessionStorage.setItem("debug-clear-storage", "done")`
- screenshot script / 開発ドキュメントの stale な storage clear 前提記述
- completed workflow docs の legacy pattern

## 仕様書

`docs/30-workflows/unassigned-task/task-fix-debug-clear-storage-shim-cleanup-001.md`
