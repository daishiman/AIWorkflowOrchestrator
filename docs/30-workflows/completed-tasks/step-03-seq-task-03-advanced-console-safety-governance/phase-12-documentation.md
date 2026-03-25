# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 12                                              |
| Phase名    | ドキュメント更新                                |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 前提Phase  | Phase 1-11                                      |
| 後続Phase  | Phase 13（PR作成）                              |
| ステータス | completed                                       |
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

| 参照資料         | パス                           | 内容         |
| ---------------- | ------------------------------ | ------------ |
| 依存Phase        | Phase 1-11                     | 前提成果物   |
| task 要件        | `phase-1-requirements.md`      | 受入基準定義 |
| task 設計        | `phase-2-design.md`            | 設計成果物   |
| task 実装計画    | `phase-5-implementation.md`    | 実装成果物   |
| task 回帰拡張    | `phase-6-test-expansion.md`    | テスト拡充   |
| task coverage    | `phase-7-coverage-check.md`    | カバレッジ   |
| task 整理方針    | `phase-8-refactoring.md`       | リファクタ   |
| task 品質確認    | `phase-9-quality-assurance.md` | 品質検証     |
| task 最終判定    | `phase-10-final-review.md`     | 最終判定結果 |
| task manual test | `phase-11-manual-test.md`      | 手動テスト   |

## 実行手順

### ステップ1: Task 12-1（実装ガイド）を作成する

Part 1（中学生レベル概念説明）と Part 2（技術者向け詳細）の2パート構成で作成する。

### ステップ2: Task 12-2（システム仕様書更新）を実施する

Step 2A（計画記録）→ Step 2B（実更新）の2段階方式で実施する。

### ステップ3: Task 12-3〜12-6 を完了する

documentation-changelog、未タスク検出、準拠チェック、skill feedback を作成する。

## 統合テスト連携

Phase 12 成果物の網羅性と相互参照の整合性を確認。

## 多角的チェック観点

- Task 12-1〜12-6 の全成果物が存在するか
- policy / disclosure / manual boundary に関する follow-up 抽出ルールが明記されているか
- PR/commit が自動実行されない前提が明記されているか
- LOGS.md 2ファイル（aiworkflow-requirements / task-specification-creator）が更新されているか

## サブタスク管理

| サブタスク                  | 担当 | ステータス |
| --------------------------- | ---- | ---------- |
| Task 12-1: 実装ガイド作成   | -    | -          |
| Task 12-2: system spec 更新 | -    | -          |
| Task 12-3: 変更履歴作成     | -    | -          |
| Task 12-4: 未タスク検出     | -    | -          |
| Task 12-5: 準拠チェック     | -    | -          |
| Task 12-6: skill feedback   | -    | -          |

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

## タスク100%実行確認

- [ ] Task 12-1: 実装ガイド作成完了
- [ ] Task 12-2: system spec 更新完了
- [ ] Task 12-3: 変更履歴作成完了
- [ ] Task 12-4: 未タスク検出完了
- [ ] Task 12-5: 準拠チェック完了
- [ ] Task 12-6: skill feedback 作成完了

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)
