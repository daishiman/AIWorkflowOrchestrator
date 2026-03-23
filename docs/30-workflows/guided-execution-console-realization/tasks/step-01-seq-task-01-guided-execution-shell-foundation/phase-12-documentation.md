# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 12                                             |
| Phase名    | ドキュメント更新                               |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 1-11                                     |
| 後続Phase  | Phase 13（PR作成）                             |
| ステータス | not_started                                    |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

Task01 の実装ガイド、system spec 更新方針、未タスク検出、skill フィードバックを整理する。

## 実行タスク

| Task      | 内容                 | 主成果物                                                 |
| --------- | -------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成       | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec 更新要約 | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | 変更履歴作成         | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| Task 12-6 | skill feedback 作成  | `outputs/phase-12/skill-feedback-report.md`              |

- Task 12-1: 実装ガイド作成
- Task 12-2: system spec 更新要約
- Task 12-3: 変更履歴作成
- Task 12-4: 未タスク検出
- Task 12-5: 準拠チェック
- Task 12-6: skill feedback 作成

## 参照資料

| 参照資料        | パス                                                                          | 内容               |
| --------------- | ----------------------------------------------------------------------------- | ------------------ |
| 依存Phase       | `phase-1-requirements.md`                                                     | Phase 1            |
| 依存Phase       | `phase-2-design.md`                                                           | Phase 2            |
| 依存Phase       | `phase-5-implementation.md`                                                   | Phase 5            |
| 依存Phase       | `phase-6-test-expansion.md`                                                   | Phase 6            |
| 依存Phase       | `phase-7-coverage-check.md`                                                   | Phase 7            |
| 依存Phase       | `phase-8-refactoring.md`                                                      | Phase 8            |
| 依存Phase       | `phase-9-quality-assurance.md`                                                | Phase 9            |
| 依存Phase       | `phase-10-final-review.md`                                                    | Phase 10           |
| 依存Phase       | `phase-11-manual-test.md`                                                     | Phase 11           |
| Phase 1-11      | `./phase-1-requirements.md` ほか                                              | 依存成果物確認     |
| root UX         | `docs/30-workflows/guided-execution-console-realization/ui-ux-realization.md` | naming 契約        |
| navigation 正本 | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`       | system spec 同期先 |

## 成果物

| 成果物           | パス                                                     | 説明                     |
| ---------------- | -------------------------------------------------------- | ------------------------ |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | Part 1/2 ガイド          |
| system spec 要約 | `outputs/phase-12/system-spec-update-summary.md`         | 同期対象一覧             |
| changelog        | `outputs/phase-12/documentation-changelog.md`            | 変更履歴                 |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 抽出           |
| compliance check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 完了確認 |
| skill feedback   | `outputs/phase-12/skill-feedback-report.md`              | 改善提案                 |

## 完了条件

- [ ] Task 12-1〜12-6 が全て成果物に対応している
- [ ] 未タスク 0 件でも検出レポートを出す
- [ ] PR/commit が自動実行されない前提を明記している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)
