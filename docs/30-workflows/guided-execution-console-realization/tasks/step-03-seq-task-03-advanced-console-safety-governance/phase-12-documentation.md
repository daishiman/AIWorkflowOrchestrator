# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 12                                              |
| Phase名    | ドキュメント更新                                |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 1-11                                      |
| 後続Phase  | Phase 13（PR作成）                              |
| ステータス | not_started                                     |
| 作成日     | 2026-03-23                                      |
| 機能名     | advanced-console-safety-governance              |

## 目的

Task03 の implementation guide、system spec update、未タスク検出、skill feedback を整理する。

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

- 依存Phase: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11
- task 要件: `phase-1-requirements.md`
- task 設計: `phase-2-design.md`
- task 実装計画: `phase-5-implementation.md`
- task 回帰拡張: `phase-6-test-expansion.md`
- task coverage: `phase-7-coverage-check.md`
- task 整理方針: `phase-8-refactoring.md`
- task 品質確認: `phase-9-quality-assurance.md`
- task 最終判定: `phase-10-final-review.md`
- task manual test: `phase-11-manual-test.md`

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
- [ ] policy / disclosure / manual boundary に関する follow-up 抽出ルールがある
- [ ] PR/commit が自動実行されない前提を明記している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)
