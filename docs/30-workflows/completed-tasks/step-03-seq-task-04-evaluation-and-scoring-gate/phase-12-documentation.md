# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 12                      |
| Phase名    | ドキュメント更新        |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 11                |
| 後続Phase  | Phase 13                |

## 目的

評価モデル、ゲート契約、実装結果を `task-specification-creator` と `aiworkflow-requirements` の両正本へ同期する。

## 実行タスク

- タスク1: 実装ガイド（Part 1/Part 2）を作成する。
- タスク2: システム仕様更新（Step 1-A/1-B/1-C + 条件付きStep 2）を実施する。
- タスク3: ドキュメント更新履歴を作成する。
- タスク4: 未タスク検出レポートを作成する（0件でも出力する）。
- タスク5: スキルフィードバックレポートを作成する（改善点なしでも出力する）。

## 参照資料

| 参照資料             | パス                                                                                                                                                                                                                                                                                                                                      | 目的                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 12 ガイド      | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                                                                                                                                                                                                                                                    | 必須成果物確認                           |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                                                                                                                                                                                                                            | Step 1/Step 2 実行                       |
| 検証マトリクス       | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`                                                                                                                                                                                                                                                   | 同期漏れ防止                             |
| task-workflow 正本   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                                                                                                                      | 完了記録同期                             |
| lessons-learned 正本 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                                                                                                                                                                                                                    | 教訓同期                                 |
| 仕様抽出マップ       | `./aiworkflow-requirements-extraction.md`                                                                                                                                                                                                                                                                                                 | 必要仕様再確認                           |
| エレガンス監査       | `./elegance-thinking-audit.md`                                                                                                                                                                                                                                                                                                            | 思考観点の同期結果確認                   |
| 依存Phase成果物      | phase-1-requirements.md（Phase 1）, phase-2-design.md（Phase 2）, phase-5-implementation.md（Phase 5）, phase-6-test-expansion.md（Phase 6）, phase-7-coverage-check.md（Phase 7）, phase-8-refactoring.md（Phase 8）, phase-9-quality-assurance.md（Phase 9）, phase-10-final-review.md（Phase 10）, phase-11-manual-test.md（Phase 11） | Phase 1/2/5/6/7/8/9/10/11 の成果物を参照 |

## 実行手順

1. Task 12-1〜12-5 の成果物テンプレートを先に作成する。
2. Step 1-A/1-B/1-C を順に実施し、更新対象を記録する。
3. Step 2 が必要か判定し、必要時は aiworkflow 正本仕様を更新する。
4. changelog、未タスク検出、フィードバックを完了する。
5. `outputs/phase-12/phase12-task-spec-compliance-check.md` で準拠を確認する。

## 多角的チェック観点（AIが判断）

- Step 1-A/1-B/1-C の全記録が存在するか。
- Step 2 必要時に aiworkflow 正本更新が漏れていないか。
- 0件時レポートが省略されていないか。

## サブタスク管理

| SubAgent   | 責務                    | 実行方式 | 出力                                                   |
| ---------- | ----------------------- | -------- | ------------------------------------------------------ |
| SubAgent-A | 実装ガイド/更新履歴     | 並列     | implementation-guide.md, documentation-changelog.md    |
| SubAgent-B | 仕様同期                | 並列     | system-spec-update-summary.md                          |
| SubAgent-C | 未タスク/フィードバック | 並列     | unassigned-task-detection.md, skill-feedback-report.md |

## 成果物

| 成果物           | パス                                                     | 内容                 |
| ---------------- | -------------------------------------------------------- | -------------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | Part 1/Part 2        |
| 仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/Step 2 結果   |
| 更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 更新一覧             |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | 0件時も出力          |
| フィードバック   | `outputs/phase-12/skill-feedback-report.md`              | 改善提案             |
| 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 検証 |

## 完了条件

- [x] Task 12-1〜12-5 の成果物が存在する
- [x] Step 1-A/1-B/1-C の結果が記録されている
- [x] Step 2 判定結果が記録されている
- [x] aiworkflow 正本同期結果が記録されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 未タスク検出結果（Task 12-4 完了記録）

Phase 10 最終レビュー（PASS + MINOR 2件）から検出した未タスク:

| タスクID                         | 内容                                                           | 優先度 | 指示書パス                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-FIX-EVAL-STORE-DISPATCH-001 | handleEvaluatePrompt Store経由化リファクタリング（FINAL-M-01） | low    | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md` |
| TASK-FIX-SCORE-DELTA-DEDUP-001   | ScoreDelta direction 判定ロジック重複解消（FINAL-M-02）        | low    | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md`   |

P3準拠 3ステップ完了確認:

- [x] ステップ1: 指示書作成（`docs/30-workflows/unassigned-task/` 配下に2ファイルを9セクション形式で作成）
- [x] ステップ2: task-workflow-backlog.md 残課題テーブルへの登録
- [x] ステップ3: 本仕様書（phase-12-documentation.md）への参照リンク追加

## 次Phase

Phase 13（PR作成）へ進む前に、ユーザー明示承認の有無を確認する。
