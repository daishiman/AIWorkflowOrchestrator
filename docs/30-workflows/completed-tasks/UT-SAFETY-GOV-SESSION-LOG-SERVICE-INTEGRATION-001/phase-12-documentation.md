# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase      | 12                                                |
| 機能名     | Advanced Console 実セッションログ接続             |
| タスクID   | UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001 |
| ステータス | spec_created                                      |
| 前提Phase  | Phase 1-11                                        |
| 後続Phase  | Phase 13 (blocked)                                |
| 作成日     | 2026-04-02                                        |

## 目的

Task 12-1〜12-6 の成果物を `outputs/phase-12/` に分離し、current contract / target delta / N/A 判定を
ファイル単位で追える close-out pack に整える。

この workflow pack は `spec_created` 状態で設計され、Phase 12 の出力物は current facts に同期済みである。

## 実行タスク

- Task 12-1: 実装ガイド作成
- Task 12-2: system spec update summary 作成
- Task 12-3: documentation changelog 作成
- Task 12-4: unassigned task detection 作成
- Task 12-5: skill feedback report 作成
- Task 12-6: phase12 task spec compliance check 作成

## SubAgent 分担

| SubAgent | 担当範囲                                                                                                                                      | 実行形態           | 完了条件                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------ |
| A        | `outputs/phase-12/implementation-guide.md`                                                                                                    | 直列の起点         | Part 1 / Part 2 と current contract が揃う |
| B        | `outputs/phase-12/system-spec-update-summary.md`                                                                                              | A と並列可         | Step 1 / Step 2 の N/A・no-op が揃う       |
| C        | `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` | A/B 完了後に並列可 | 変更履歴・未タスク・フィードバックが揃う   |
| D        | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                                                      | C 完了後に直列     | Task 12-1〜12-6 と Phase 4 参照が一致する  |

## 実行手順

### ステップ1: Task 12-1 実装ガイドを作成する

1. Part 1 で「なぜ必要か」を先に説明し、日常の例えを 1 つ入れる
2. Part 2 で current contract と target delta を分ける
3. `getClaudeCliManager()`、`SESSION_NOT_FOUND`、`sanitizeForApiKeys()`、`getCopyCommand` の edge case を含める

### ステップ2: Task 12-2 system spec update summary を作成する

1. current wave での Step 1-A / 1-B / 1-C / Step 2 の判定を整理する
2. `task-workflow` / `LOGS` / `SKILL` / `topic-map` の no-op / mirror parity を明記する
3. `spec_created` である理由を N/A / no-op の文脈で残す

### ステップ3: Task 12-3〜12-5 を作成する

1. documentation changelog に phase 別の変更記録を残す
2. unassigned task detection で 0 件でも summary を残す
3. skill feedback は改善点がなくても理由付きで書く

### ステップ4: Task 12-6 compliance check を作成する

1. Task 12-1〜12-5 の成果物がすべて存在することを確認する
2. 事前語句や future wording が outputs に残っていないことを確認する
3. Phase 13 が user approval 待ちのまま blocked であることを確認する

## 参照資料

| 参照資料                   | パス                                                                                                     | 目的                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------- |
| task-specification-creator | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                   | Task 12-1〜12-6 の正本           |
| spec update workflow       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                           | Step 1 / Step 2 の判定基準       |
| aiworkflow current facts   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                           | current facts の起点             |
| aiworkflow backlog         | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                             | 既存 follow-up の確認            |
| unassigned task source     | `docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001.md` | 仕様 pack の元ネタ               |
| phase 4 test plan          | `outputs/phase-4/test-plan.md`                                                                           | ADV-16〜ADV-19 の Red/Green 参照 |

## 成果物

| 成果物                     | パス                                                     | 説明                         |
| -------------------------- | -------------------------------------------------------- | ---------------------------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 の 2 部構成  |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | current facts / N/A / no-op  |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | phase 別の記録と検証メモ     |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | follow-up の有無             |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | skill 改善提案               |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の整合性確認 |

## 完了条件

- [x] Task 12-1〜12-6 が全て成果物に対応している
- [x] current contract と target delta が分かれている
- [x] Step 1 / Step 2 の N/A / no-op 判定が明記されている
- [x] Phase 13 が blocked のままである
- [x] **本Phase内の全タスクを100%実行完了**
