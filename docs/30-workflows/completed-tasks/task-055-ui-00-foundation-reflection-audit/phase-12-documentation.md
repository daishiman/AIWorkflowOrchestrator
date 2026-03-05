# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 12                                         |
| Phase名   | ドキュメント更新                           |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 11                                   |
| 後続Phase | Phase 13                                   |

## 目的

Phase 1〜11 の監査結果を文書へ反映し、task-specification-creator の Phase 12 必須成果物 Task 1〜5 を揃える。

## 実行タスク

- Task 1 実装ガイド: Part 1（初学者向け、なぜ先行・日常例え）と Part 2（技術者向け、型/API/エッジケース/設定）を作成する。
- Task 2 Step 1-A: 完了タスク・関連ドキュメント・変更履歴を反映し、`aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md`、`indexes/topic-map.md` を更新する。
- Task 2 Step 1-B/1-C: 実装状況テーブルを `completed/spec_created` へ更新し、関連タスク/未タスク候補テーブルを同期する。
- Task 2 Step 2: 新規インターフェース/型変更の有無を判定し、必要時のみ仕様本文を更新する（不要時は根拠を記録）。
- Task 3 更新履歴: `documentation-changelog.md` を作成する。
- Task 4 未タスク検出: 0件でも `unassigned-task-detection.md` を作成する。
- Task 5 フィードバック: 改善点0件でも `skill-feedback-report.md` を作成する。

## 参照資料

| 参照資料               | パス                                                                                   | 内容                    |
| ---------------------- | -------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 要件定義       | `outputs/phase-1/requirements-definition.md`                                           | 基準再確認              |
| Phase 2 監査設計       | `outputs/phase-2/audit-matrix-design.md`                                               | 同期対象                |
| Phase 5 監査結果       | `outputs/phase-5/reflection-matrix.md`                                                 | 同期対象                |
| Phase 6 拡張監査       | `outputs/phase-6/expanded-audit-report.md`                                             | 同期対象                |
| Phase 7 集計結果       | `outputs/phase-7/coverage-report.md`                                                   | 同期対象                |
| Phase 8 回帰検証       | `outputs/phase-8/regression-validation.md`                                             | 同期対象                |
| Phase 9 QA結果         | `outputs/phase-9/qa-report.md`                                                         | 同期対象                |
| Phase 10 最終判定      | `outputs/phase-10/review-gate-decision.md`                                             | 同期対象                |
| Phase 11 手動検証      | `outputs/phase-11/manual-test-result.md`                                               | 同期対象                |
| Phase 11/12 ガイド     | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | Task 1〜5 の必須要件    |
| Phase 12 チェック定義  | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Task 1/3/4/5 の検証項目 |
| 仕様更新フロー         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | 実行手順                |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                                               | Phase 1 成果物          |
| スコープ定義           | `outputs/phase-1/scope-definition.md`                                                  | Phase 1 成果物          |
| 証跡取得計画           | `outputs/phase-2/evidence-plan.md`                                                     | Phase 2 成果物          |
| SubAgent計画           | `outputs/phase-2/subagent-plan.md`                                                     | Phase 2 成果物          |
| セクションリンクマップ | `outputs/phase-5/section-link-map.md`                                                  | Phase 5 成果物          |
| 指摘ログ               | `outputs/phase-5/finding-log.md`                                                       | Phase 5 成果物          |
| リファクタ計画         | `outputs/phase-8/matrix-refactor-plan.md`                                              | Phase 8 成果物          |
| リファクタ結果         | `outputs/phase-8/matrix-refactor-result.md`                                            | Phase 8 成果物          |
| リスク台帳             | `outputs/phase-9/qa-risk-register.md`                                                  | Phase 9 成果物          |
| QAチェックリスト       | `outputs/phase-9/qa-checklist.md`                                                      | Phase 9 成果物          |
| 最終レビュー報告       | `outputs/phase-10/final-review-report.md`                                              | Phase 10 成果物         |
| 証跡一覧               | `outputs/phase-11/screenshots-index.md`                                                | Phase 11 成果物         |
| 発見課題               | `outputs/phase-11/discovered-issues.md`                                                | Phase 11 成果物         |

## システム仕様（aiworkflow-requirements）

| 参照資料                    | パス                                                                            | このPhaseでの適用観点    |
| --------------------------- | ------------------------------------------------------------------------------- | ------------------------ |
| タスクワークフロー          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | Step 1-A反映先           |
| タスクワークフローPhase定義 | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`     | Phase 12成果物構成の整合 |
| 教訓集                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | Step 1-C反映先           |
| UIコンポーネント仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | Step 1-B反映先           |
| 機能別UI仕様                | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 関連タスク同期           |
| 状態管理アーキテクチャ      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | 状態責務の追記要否判定   |
| 仕様ガイドライン            | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`          | 更新フォーマット         |

## 実行順序（直列/並列）

| 作業                  | 実行方式 | 理由                                    |
| --------------------- | -------- | --------------------------------------- |
| Task 1 実装ガイド作成 | 直列     | Part 1 と Part 2 を一貫させるため       |
| Task 2 仕様同期       | 直列     | Step 1-A/1-B/1-C の順序固定が必要なため |
| Task 3/4/5 成果物作成 | 並列     | 独立文書として作成できるため            |

## SubAgent Team分担

| SubAgent                | 関心ごと       | 担当成果物                                      |
| ----------------------- | -------------- | ----------------------------------------------- |
| SubAgent-DOC-GUIDE      | 実装ガイド     | `outputs/phase-12/implementation-guide.md`      |
| SubAgent-DOC-SYNC       | 仕様同期       | `outputs/phase-12/spec-update-summary.md`       |
| SubAgent-DOC-LOG        | 更新履歴       | `outputs/phase-12/documentation-changelog.md`   |
| SubAgent-DOC-UNASSIGNED | 未タスク検出   | `outputs/phase-12/unassigned-task-detection.md` |
| SubAgent-DOC-FEEDBACK   | フィードバック | `outputs/phase-12/skill-feedback-report.md`     |

## 仕様書別SubAgent分担（Task 2 専用）

| 対象仕様書                    | 専任SubAgent                | Step          | 実行方式 | 出力                     |
| ----------------------------- | --------------------------- | ------------- | -------- | ------------------------ |
| `task-workflow.md`            | SubAgent-SYNC-WORKFLOW      | 1-A/1-C       | 並列     | `spec-update-summary.md` |
| `lessons-learned.md`          | SubAgent-SYNC-LESSONS       | 1-C           | 並列     | `spec-update-summary.md` |
| `ui-ux-components.md`         | SubAgent-SYNC-UI-COMPONENTS | 1-B/2         | 並列     | `spec-update-summary.md` |
| `ui-ux-feature-components.md` | SubAgent-SYNC-UI-FEATURE    | 1-C/2         | 並列     | `spec-update-summary.md` |
| `arch-state-management.md`    | SubAgent-SYNC-STATE         | 2（条件付き） | 並列     | `spec-update-summary.md` |
| Step統合・最終判定            | SubAgent-DOC-SYNC           | 1-A→1-B→1-C→2 | 直列     | `spec-update-summary.md` |

## 成果物

| 成果物                | パス                                                     | 内容                  |
| --------------------- | -------------------------------------------------------- | --------------------- |
| 実装ガイド            | `outputs/phase-12/implementation-guide.md`               | Part 1/Part 2         |
| 仕様更新サマリー      | `outputs/phase-12/spec-update-summary.md`                | Step 1-A/1-B/1-C 結果 |
| 更新履歴              | `outputs/phase-12/documentation-changelog.md`            | 更新ログ              |
| 未タスク検出          | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果              |
| スキルフィードバック  | `outputs/phase-12/skill-feedback-report.md`              | 改善提案              |
| Phase 12 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 要件充足確認          |

## 完了条件

- [x] Task 1 の Part 1 と Part 2 が作成されている。
- [x] Task 2 の Step 1-A/1-B/1-C 結果が記録されている。
- [x] Task 3/4/5 の成果物が全て作成されている。
- [x] Step 2 実行要否の判定理由が記録されている。
- [x] Task 3.5 の整合ガード（必須成果物実在 + `artifacts.json` + `phase-12-documentation.md` 同期）を確認している。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. Phase 11 までの成果物を集約し、Task 1〜5 の入力を確定する。
2. SubAgentごとに Task 1〜5 を割り当てて並列作成する。
3. Task 2 は仕様書ごとに専任SubAgentを割り当てて並列更新する。
4. Task 2 Step 1-A/1-B/1-C を順番どおりに統合判定する。
5. Task 2 Step 2 の要否判定と根拠を記録する。
6. Task 3.5 整合ガードを実行し、成果物実体と記録の同期を確認する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 13 へ渡す文書セットを確定した。

## 依存関係

- 前提: Phase 11
- 後続: Phase 13
- 参照依存: Phase 1 / 2 / 5 / 6 / 7 / 8 / 9 / 10 / 11

## 次のPhase

- Phase 13: PR作成
