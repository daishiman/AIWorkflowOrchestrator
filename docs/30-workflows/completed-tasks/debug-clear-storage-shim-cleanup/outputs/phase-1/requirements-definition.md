# Phase 1: 要件定義書

## タスク概要

`TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` で App.tsx のデバッグコード本体は削除されたが、repo 全体に `debug-clear-storage` を前提とした古い workaround・stale comment・e2e preflight・screenshot script が残存している。これらを repo-wide に棚卸しし、不要なものを削除、必要なものは historical note へ降格する。

## P50チェック結果

**判定: 未実装** - `debug-clear-storage` 残骸が apps/ 配下に多数検出された。通常実行モードで Phase 1 以降を実行する。

## 検出結果サマリー

| カテゴリ             | 検出件数 | 対処方針                           |
| -------------------- | -------- | ---------------------------------- |
| e2e global-setup     | 2件      | 削除                               |
| screenshot scripts   | 23件     | 削除                               |
| Renderer ソース      | 1件      | 削除                               |
| 開発ドキュメント     | 1件      | historical note 降格               |
| テストファイル       | 1件      | 維持                               |
| .claude/skills/      | 6件      | historical note 降格               |
| localStorage.clear() | 3件      | 維持（debug-clear-storage と独立） |

詳細は `inventory-result.md` を参照。

## 関連パターン

- `skipAuth` / `dev-skip-auth` / `VITE_E2E_MODE`: 認証バイパス機構。`debug-clear-storage` とは独立しており、本タスクの変更対象外。
- `localStorage.clear()`: screenshot harness の後片付けとして使われている箇所は維持。App.tsx からは親タスクで既に削除済み。

## 受入基準

AC-1〜AC-7 が定義済み。詳細は `acceptance-criteria.md` を参照。
