# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 12                                                                       |
| Phase名    | ドキュメント更新                                                         |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 11                                                                 |
| 後続Phase  | Phase 13                                                                 |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

Phase 12 必須 5 タスクを完了し、docs-only parent workflow sweep guard を system spec と workflow 文書へ同期する。実装ガイド、spec update summary、documentation changelog、unassigned task detection、skill feedback を欠かさず出す。

## 実行タスク

- SubAgent-A: `implementation-guide.md` を Part 1 / Part 2 で作成する
- SubAgent-B: `task-workflow.md`、`ui-ux-feature-components.md`、`lessons-learned.md`、`interfaces-*` の更新を実施する
- SubAgent-C: `documentation-changelog.md`、`spec-update-summary.md`、index 再生成、mirror sync 証跡をまとめる
- SubAgent-D: unassigned task detection、`verify-unassigned-links`、`audit-unassigned-tasks` を実行して結果を記録する
- Lead: `skill-feedback-report.md` と `phase12-task-spec-compliance-check.md` を作成し、全 Step 完了を確認する

## 参照資料

| 参照資料               | パス                                                                                                                                              | 説明                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1成果物          | `outputs/phase-1/requirements-definition.md`                                                                                                      | Why / What の再確認              |
| Phase 2成果物          | `outputs/phase-2/sweep-manifest-design.md`                                                                                                        | manifest と drift class の説明元 |
| Phase 5成果物          | `outputs/phase-5/implementation-log.md`                                                                                                           | 実装差分の説明元                 |
| Phase 6成果物          | `outputs/phase-6/test-expansion-result.md`                                                                                                        | variation 検証の説明元           |
| Phase 7成果物          | `outputs/phase-7/requirements-traceability.md`                                                                                                    | AC 追跡の説明元                  |
| Phase 8成果物          | `outputs/phase-8/responsibility-map.md`                                                                                                           | 責務分離の説明元                 |
| Phase 9成果物          | `outputs/phase-9/quality-report.md`                                                                                                               | 品質評価の説明元                 |
| Phase 10成果物         | `outputs/phase-10/final-review-result.md`                                                                                                         | 最終レビューの説明元             |
| Phase 11               | `phase-11-manual-test.md`                                                                                                                         | 手動確認結果                     |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`                                                                                                          | 最終確認結果                     |
| 発見事項               | `outputs/phase-11/manual-findings.md`                                                                                                             | 更新対象抽出                     |
| 実行証跡               | `outputs/phase-11/command-transcript.md`                                                                                                          | 実行順の確認                     |
| dual root precedent    | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md`                                     | mirror sync 記録の前例           |
| unassigned task 指示書 | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/unassigned-task/task-imp-workspace-parent-reference-sweep-guard-001.md` | Why/What/How の原本              |

### システム仕様（aiworkflow-requirements）

> 仕様書更新前に必ず以下のシステム仕様を確認し、更新対象と更新内容を把握してください。

| 参照資料                     | パス                                                                                   | 内容                                   |
| ---------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------- |
| task-workflow                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | 台帳正本                               |
| ui-ux-feature-components     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`        | feature spec 同期先                    |
| lessons-learned              | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                 | 苦戦箇所の同期先                       |
| interfaces-llm               | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                  | workspace chat evidence path 更新先    |
| interfaces-chat-history      | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`         | workspace history evidence path 更新先 |
| phase-11-12-guide            | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`            | Phase 12 必須タスク                    |
| spec-update-workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1 / Step 2 手順                   |
| unassigned-task-guidelines   | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`   | current / baseline 分離ルール          |
| phase12-checklist-definition | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Phase 12 完了定義                      |

## 実行手順

1. Part 1 は「引っ越し後の住所録をまとめて直す」比喩で parent reference sweep の必要性を説明する
2. Part 2 は manifest、drift class、validator contract、mirror sync、system spec sync を技術者向けに説明する
3. `task-workflow.md` を先に更新し、その後に `ui-ux-feature-components.md` と `lessons-learned.md` を更新する
4. `interfaces-llm.md` と `interfaces-chat-history.md` に workspace path の証跡更新がある場合は同一ターンで更新する
5. aiworkflow-requirements 側に変更がある場合は `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する
6. `.claude` と `.agents` の mirror sync を行い、`diff -qr` の結果を記録する
7. `verify-unassigned-links.js` と `audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...` を実行し、current / baseline を分けて記録する
8. `phase12-task-spec-compliance-check.md` に 5 必須タスクの完了可否を記録する

## 成果物

| 成果物             | パス                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-12/implementation-guide.md`               |
| 仕様更新サマリー   | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-12/spec-update-summary.md`                |
| 更新履歴           | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出       | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-12/unassigned-task-detection.md`          |
| スキル改善レポート | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-12/skill-feedback-report.md`              |
| Phase 12 準拠確認  | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [x] `implementation-guide.md` が Part 1 / Part 2 で構成されている
- [x] `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` の更新順が記録されている
- [x] `interfaces-*` 更新の有無と理由が記録されている
- [x] `verify-unassigned-links` と `audit-unassigned-tasks` の結果が current / baseline 分離で記録されている
- [x] `.claude` / `.agents` の mirror sync 結果が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 13: PR作成へ進む。
