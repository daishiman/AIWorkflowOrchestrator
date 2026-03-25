# UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001                      |
| タスク名     | navContract.ts に executionConsole エントリ追加                     |
| 分類         | 実装                                                                |
| 優先度       | 高                                                                  |
| 発見元       | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 Phase 10 前提条件 #7 |
| 作成日       | 2026-03-24                                                          |
| issue_number | 1553                                                                |

## 概要

`navContract.ts` の `DockViewType` union および `NAV_SECTIONS` に `executionConsole` エントリを追加し、GlobalNavStrip から実行コンソールへのナビゲーションを可能にする。

## 変更対象ファイル

| ファイル                                                    | 変更種別 | 内容                                   |
| ----------------------------------------------------------- | -------- | -------------------------------------- |
| `apps/desktop/src/renderer/components/atoms/Icon/index.tsx` | 修正     | `PlayCircle` import + IconName 追加    |
| `apps/desktop/src/renderer/navigation/navContract.ts`       | 修正     | DockViewType + NAV_SECTIONS + shortcut |
| `apps/desktop/src/renderer/navigation/navContract.test.ts`  | 修正     | テスト期待値の更新                     |
| `apps/desktop/src/renderer/store/types.test.ts`             | 修正     | ViewType テスト期待値の更新            |

## 受入基準

- [ ] AC-1: `grep "executionConsole" apps/desktop/src/renderer/navigation/navContract.ts` が 3 件以上ヒット
- [ ] AC-2: `pnpm --filter @repo/desktop typecheck` PASS
- [ ] AC-3: GlobalNavStrip に実行コンソールの nav item が表示される
- [ ] AC-4: 全テスト PASS（`pnpm --filter @repo/desktop test`）

## Phase 一覧

| Phase | 名称             | 仕様書パス                           |
| ----- | ---------------- | ------------------------------------ |
| 1     | 要件定義         | `phase-1-requirements-definition.md` |
| 2     | 設計             | `phase-2-design.md`                  |
| 3     | 設計レビュー     | `phase-3-design-review.md`           |
| 4     | テスト作成       | `phase-4-test-cases.md`              |
| 5     | 実装             | `phase-5-implementation.md`          |
| 6     | テスト拡充       | `phase-6-test-enhancement.md`        |
| 7     | カバレッジ確認   | `phase-7-coverage-report.md`         |
| 8     | リファクタリング | `phase-8-refactoring.md`             |
| 9     | 品質検証         | `phase-9-quality-verification.md`    |
| 10    | 最終レビュー     | `phase-10-final-review.md`           |
| 11    | 手動テスト       | `phase-11-manual-test.md`            |
| 12    | ドキュメント     | `phase-12-documentation.md`          |
| 13    | 完了             | `phase-13-completion.md`             |
