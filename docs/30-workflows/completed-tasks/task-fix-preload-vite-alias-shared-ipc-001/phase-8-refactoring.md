# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 8                                          |
| 機能名 | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 |
| 作成日 | 2026-03-31                                 |

## 目的

build/test parity を閉じたあとに、不要な workaround と stale follow-up を除去する。

## 実施方針

- `governance-bundle.test.ts` の 7 階層相対パスを削除する
- 旧 follow-up `UT-DX-VITE-ALIAS-SHARED-IMPORT-001` は open set に残さない
- current 未タスクは 0 件で閉じる

## 成果物

| 成果物               | パス                                  |
| -------------------- | ------------------------------------- |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md` |
