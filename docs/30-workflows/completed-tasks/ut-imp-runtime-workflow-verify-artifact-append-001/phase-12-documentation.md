# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| Phase      | 12                                                                                |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                                |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001                                |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11 |
| 後続Phase  | Phase 13                                                                          |
| ステータス | 完了                                                                              |
| 作成日     | 2026-03-26                                                                        |

## 目的

今回修正が system spec 更新を要するか、task ledger 記録だけで閉じるかを判定し、Phase 12 の 5 必須タスクと compliance check を current fact で閉じる。

## 実行タスク

- Task 12-1: `implementation-guide.md` を Part 1 / Part 2 で作成する
- Task 12-2: `system-spec-update-summary.md` に Step 1-A〜1-C と Step 2 要否を記録する
- Task 12-3: `documentation-changelog.md` に root docs / artifacts / validator を記録する
- Task 12-4: `unassigned-task-detection.md` に 0件判定でも current を残す
- Task 12-5: `skill-feedback-report.md` に改善有無と next action を残す
- Task 12-6: `phase12-task-spec-compliance-check.md` で先送り表現なしを確認する

## 参照資料

| 参照資料         | パス                                                                                   | 内容                         |
| ---------------- | -------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 11         | `phase-11-manual-test.md`                                                              | 手動確認結果                 |
| compliance check | `outputs/phase-12/phase12-task-spec-compliance-check.md`                               | Phase 12 実施範囲            |
| Phase 12 guide   | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | canonical outputs と判定基準 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                           | 内容     |
| ---------------- | ------------------------------------------------------------------------------ | -------- |
| workflow ledger  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 状態管理 |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了記録 |
| lessons current  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | 再発防止 |

## 成果物

| 成果物                     | パス                                                     | 説明                       |
| -------------------------- | -------------------------------------------------------- | -------------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 実装ガイド |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜2 の判断         |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 更新履歴と validator 記録  |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | 0件含む未タスク検出記録    |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | skill 改善提案             |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 最終確認          |

## Step 判定表

| Step                        | 判定               | 根拠                                                                                                                |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Task 12-1 実装ガイド        | 必須               | Phase 12 guide の mandatory output                                                                                  |
| Step 1-A task 完了記録      | 実施               | `task-workflow-completed` / `lessons-learned-phase12-workflow-lifecycle` / LOGS / SKILL を same-wave で反映するため |
| Step 1-B 実装状況テーブル   | 実装完了後に要更新 | `spec_created` から実績値へ遷移するため                                                                             |
| Step 1-C 関連タスクテーブル | 実施               | 元未タスク指示書を完了化し、result workflow を接続するため                                                          |
| Step 2 system spec 更新     | 現時点では不要     | public IPC / preload / shared contract の変更を伴わない想定                                                         |
| Task 12-6 compliance check  | 必須               | 6成果物と先送り表現なしを確認するため                                                                               |

## 完了条件

- [ ] 6成果物が `outputs/phase-12/` に揃っている
- [ ] Step 1-A〜1-C と Step 2 の判定根拠が記録されている
- [ ] public contract 変更なしの判定根拠がある
- [ ] 先送り表現なしの compliance 記録が残っている
