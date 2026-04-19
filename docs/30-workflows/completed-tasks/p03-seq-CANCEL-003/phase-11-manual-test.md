# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 11                                |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 10                          |
| 後続Phase  | Phase 12                          |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

`NON_VISUAL` task として、targeted command 実行結果と walkthrough を `TASK-SW-CANCEL-003-manual-test-report.md` に集約し、Main 層 cancel 仕様の最終証跡を残す。

## 背景

本 task は UI/UX 変更を伴わないため screenshot は不要である。Phase 11 の primary evidence は `TASK-SW-CANCEL-003-manual-test-report.md` とし、`manual-test-checklist.md` と `discovered-issues.md` を補助成果物として持つ。

## 実行タスク

### タスク0: NON_VISUAL walkthrough 実施

**目的**: screenshot なしで確認可能な観点を手動で追う。

**実行手順**:

1. `manual-test-checklist.md` に確認項目を列挙する。
2. targeted test、`typecheck`、`lint` を実行する。
3. handler 登録、delegate、unregister、`AbortSignal` 調査結果を walkthrough として確認する。

**期待される成果物**:

- `outputs/phase-11/TASK-SW-CANCEL-003-manual-test-report.md`
- `outputs/phase-11/manual-test-checklist.md`

### タスク1: 発見事項の分類

**目的**: blocker / note / info を切り分ける。

**実行手順**:

1. walkthrough 中の発見事項を `discovered-issues.md` に記録する。
2. CANCEL-004 依存事項と本 task 内で閉じる事項を分離する。
3. blocker がある場合は Phase 10 または Phase 12 へ戻す。

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

## 参照資料

| 参照資料                     | パス                                                                             | 内容                     |
| ---------------------------- | -------------------------------------------------------------------------------- | ------------------------ |
| Phase 11 テンプレート        | `.claude/skills/task-specification-creator/references/phase-template-phase11.md` | NON_VISUAL 運用          |
| Phase 2 差分確認設計         | `outputs/phase-2/design.md`                                                      | NON_VISUAL 方針          |
| Phase 5 差分確認             | `outputs/phase-5/implementation-summary.md`                                      | 実装修正有無             |
| Phase 6 テスト拡充記録       | `outputs/phase-6/test-expansion-record.md`                                       | edge case と引き継ぎ事項 |
| Phase 7 カバレッジ           | `outputs/phase-7/coverage-report.md`                                             | concern coverage         |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                                             | 変更点と regression      |
| Phase 10 レビュー結果        | `outputs/phase-10/final-review-result.md`                                        | walkthrough 入力         |
| Phase 9 品質保証             | `outputs/phase-9/quality-report.md`                                              | 実行コマンド候補         |

## 成果物

| 成果物                   | パス                                                        | 内容                                     |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------- |
| 手動テスト報告書         | `outputs/phase-11/TASK-SW-CANCEL-003-manual-test-report.md` | primary evidence、コマンド結果、判断根拠 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                 | walkthrough の補助記録                   |
| 発見事項一覧             | `outputs/phase-11/discovered-issues.md`                     | blocker / note / info の分類             |

## 統合テスト連携【必須】

| 判定項目                                                                        | 基準 | 結果    |
| ------------------------------------------------------------------------------- | ---- | ------- |
| `NON_VISUAL` evidence 方針が記録されている                                      | 完了 | pending |
| `TASK-SW-CANCEL-003-manual-test-report.md` を primary evidence として扱っている | 完了 | pending |
| 発見事項が分類されている                                                        | 完了 | pending |

## 完了条件

- [ ] `NON_VISUAL` task として walkthrough を実施している
- [ ] `TASK-SW-CANCEL-003-manual-test-report.md` を primary evidence として記録している
- [ ] `manual-test-checklist.md` を作成している
- [ ] `discovered-issues.md` を作成している
- [ ] UI/UX変更なしのため screenshot 不要と明記している
