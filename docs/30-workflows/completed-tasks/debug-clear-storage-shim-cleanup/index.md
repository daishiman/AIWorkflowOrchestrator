# UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001: debug-clear-storage 残骸クリーンアップ

## 概要

`TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` で App.tsx のデバッグコード本体は削除されたが、repo 全体に `debug-clear-storage` を前提とした古い workaround・stale comment・e2e preflight・screenshot script が残存している。これらを repo-wide に棚卸しし、不要なものを削除、必要なものは historical note へ降格する。

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001        |
| タスク種別 | 改善                                               |
| 優先度     | 中                                                 |
| ステータス | blocked                                            |
| 依存タスク | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001          |
| 発見元     | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12 |
| Issue番号  | #1115                                              |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 受入基準

| ID   | 基準                                                                                          |
| ---- | --------------------------------------------------------------------------------------------- |
| AC-1 | `rg "debug-clear-storage"` の検出箇所が全件分類済み（runtime / test helper / historical doc） |
| AC-2 | 不要な workaround・stale comment が削除または historical note に降格済み                      |
| AC-3 | e2e global-setup / screenshot script が現行前提で正常動作すること                             |
| AC-4 | `verify-unassigned-links.js` が PASS                                                          |
| AC-5 | `audit-unassigned-tasks --target-file` で `currentViolations=0`                               |
| AC-6 | task-workflow backlog/history・lessons learned・関連 product/system spec が同期済み           |
| AC-7 | 全既存テストが PASS すること                                                                  |

## スコープ

**含む**:

- `debug-clear-storage` / `localStorage.clear()` / `window.location.reload()` の repo-wide 棚卸し
- e2e global-setup, screenshot script, development docs の是正
- 不要な workaround の削除、残すものの historical note 降格
- system spec / lessons-learned の同期

**含まない**:

- 修正済み `App.tsx` の再変更
- 認証フローの再設計
- unrelated なデバッグログ全般の削除

## 関連する既知の落とし穴

- P31: Zustand Store Hooks無限ループ（persist 状態管理の文脈）
- P48: useShallow未適用による派生セレクタ無限ループ
- P50: 既実装防御の発見による Phase 転換（P50チェック必須）
- P53: CLI環境でのスクリーンショット取得制約
