# TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001: task-specification-creator 大規模 Markdown 責務分離

## ユーザー要求の要約

```text
/.claude/skills/task-specification-creator/ の task specification creator skill と /aiworkflow-requirements を反映し、まずブランチを切ってから仕様書作成に専念する。Issue #1144 と既存未タスク文書を起点にしつつ、SKILL.md だけでなく指定ディレクトリ配下の 500 行超 Markdown 全体を責務分離できる形へ改善する。Phase 1-3 の設計書を先に作り、並列化できる関心ごとは SubAgent 単位で分離する。commit と PR は禁止。
```

## タスク概要

### 目的

`.claude/skills/task-specification-creator/` 配下の 500 行超 Markdown を、`skill-creator` と `aiworkflow-requirements` の規則に沿って単一責務へ再編し、Phase 1〜12 の outputs と検証を完了させる。

### 背景

- Issue [#1144](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1144) と既存未タスク文書は `SKILL.md` 超過のみを主対象としている
- 実地棚卸しでは `LOGS.md`、`references/patterns.md`、`references/phase-templates.md`、`references/spec-update-workflow.md`、`references/phase-11-12-guide.md` も 500 行を超過している
- `skill-creator` は `SKILL.md 500 行以内`、`1 file = 1 responsibility`、`SKILL はナビゲーション中心`、`.claude` 正本 / `.agents` mirror ルールを要求している
- `task-specification-creator` 自身が過大な Markdown を保持したままだと、後続タスクで同じ膨張が再発する

### 最終ゴール

- 対象 6 ファイルを concern 単位で再編できる実装 plan が整う
- Phase 1-3 完了前に Phase 4 以降へ進まない gate が明文化される
- `.claude` 正本 / `.agents` mirror、`quick_validate`、line budget、直リンク、history 保全の検証 plan が揃う
- Phase 1〜12 を完了し、commit・PR は user 指示待ちのため Phase 13 を blocked のまま維持する

### 成果物一覧

| 種別              | 成果物                       | 配置先                                                                                                           |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| workflow          | メイン task 仕様書           | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/index.md`                       |
| phase specs       | Phase 1-13 仕様書            | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/phase-*.md`                     |
| artifact registry | canonical artifacts registry | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/artifacts.json`                 |
| phase outputs     | Phase 1-12 実行成果物        | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-*`                |
| verification      | 仕様書検証レポート           | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/verification-report.md` |

## メタ情報

| 項目         | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001                         |
| タスク種別   | 改善                                                                               |
| 優先度       | 高                                                                                 |
| ステータス   | Phase 1〜12 完了、Phase 13 blocked                                                 |
| issue        | #1144                                                                              |
| source doc   | `docs/30-workflows/unassigned-task/task-imp-task-spec-skill-md-line-budget-001.md` |
| 対象 root    | `.claude/skills/task-specification-creator/`                                       |
| mirror root  | `.agents/skills/task-specification-creator/`                                       |
| 作成ブランチ | `task/1144-skill-doc-line-budget-separation`                                       |

## 対象ファイル棚卸し

| concern | 現行ファイル                                                                   | 行数 | 主問題                                                 | 目標状態                                            |
| ------- | ------------------------------------------------------------------------------ | ---: | ------------------------------------------------------ | --------------------------------------------------- |
| C1      | `.claude/skills/task-specification-creator/SKILL.md`                           |  508 | entrypoint に Phase 12 詳細が残り過ぎている            | 350-400 行のナビゲーション中心                      |
| C2      | `.claude/skills/task-specification-creator/LOGS.md`                            | 6112 | 全履歴を 1 ファイルへ集約している                      | rolling log + archive index                         |
| C3      | `.claude/skills/task-specification-creator/references/patterns.md`             | 2186 | 成功/失敗/検証/運用が混在している                      | pattern family ごとの index 構造                    |
| C4      | `.claude/skills/task-specification-creator/references/phase-templates.md`      | 1818 | Phase 共通部と個別部が 1 枚に集中している              | phase family ごとの template 分離                   |
| C5      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` |  909 | Step 1/Step 2/validation が混在している                | completion / domain sync / validation matrix の分離 |
| C6      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    |  586 | screenshot guide と documentation guide が混在している | Phase 11 / Phase 12 の分離                          |

## 受入基準

| ID   | 基準                                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `.claude/skills/task-specification-creator/` 配下の 500 行超 Markdown 6 件を inventory に含める                                             |
| AC-2 | concern ごとに target topology、移設先、保持責務、mirror sync 方針が定義される                                                              |
| AC-3 | `skill-creator` の `SKILL.md 500 行以内`、`Progressive Disclosure`、`直リンク` を満たす検証手順が明記される                                 |
| AC-4 | `.claude` を canonical root、`.agents` を mirror とする rules が Phase 2 と Phase 12 に明記される                                           |
| AC-5 | Atent Team 相当の SubAgent lane が 3 並列以下で設計される                                                                                   |
| AC-6 | Phase 1-3 が completed になるまで Phase 4-13 は planned または blocked のまま維持される                                                     |
| AC-7 | 実装、commit、PR を開始しない停止条件が workflow に組み込まれる                                                                             |
| AC-8 | 分割後も `SKILL.md`→child refs、`LOGS.md`→archive、parent guide→detail refs、`.claude`→`.agents` の依存関係が閉じている検証手順が定義される |

## スコープ

**含む**:

- target directory の over-limit Markdown inventory
- line budget と責務分離の設計
- `.claude` 正本 / `.agents` mirror の同期設計
- `quick_validate`、`diff -qr`、`wc -l`、直リンク監査の実行計画
- system spec と skill-creator 規則の反映

**含まない**:

- 実際の Markdown 分割編集
- `task-specification-creator` 機能追加
- 他スキル全体の大規模再編
- commit、PR、タスク実行

## 参照ファイル

- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/task-specification-creator/references/patterns.md`
- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `docs/30-workflows/unassigned-task/task-imp-task-spec-skill-md-line-budget-001.md`

## システム仕様抽出セット

| 種別            | 参照パス                                                                            | 役割                                                |
| --------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| skill 構造      | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL、references、agents の正本構造                |
| skill 概要      | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`  | Skill の責務境界、Progressive Disclosure、Task 分離 |
| skill resources | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | Progressive Disclosure と直リンク規則               |
| skill process   | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`   | 500 行検証、refs link、quality gate                 |
| spec split      | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md`    | 500-700 行検討、700 行超は要分割                    |
| quality         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`         | docs quality と検証観点                             |
| task ledger     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                | 完了台帳と follow-up 登録先                         |
| task phases     | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`         | phase gate と段階遷移                               |
| task rules      | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`          | 品質ゲート、単一責務、更新ルール                    |
| lessons         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`              | 再発防止パターン反映先                              |
| cross-skill     | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`         | `.claude` 正本 / `.agents` mirror ルール            |
| skill template  | `.claude/skills/skill-creator/assets/skill-template.md`                             | `SKILL.md 500 行以内` と file role                  |

## Atent Team / SubAgent 編成

| lane   | 担当 concern                                  | 実行タイミング | 並列可否          | 理由                                    |
| ------ | --------------------------------------------- | -------------- | ----------------- | --------------------------------------- |
| Lane A | C1 SKILL.md, C2 LOGS.md                       | Phase 4-5      | Lane B/C と並列可 | entrypoint と履歴の境界を同時に詰める   |
| Lane B | C3 patterns, C4 phase-templates               | Phase 4-5      | Lane A/C と並列可 | reference family の再編を独立実行できる |
| Lane C | C5 spec-update-workflow, C6 phase-11-12-guide | Phase 4-5      | Lane A/B と並列可 | workflow guide を 1 系統として扱える    |
| Lane V | mirror sync, link audit, validation           | Phase 5-12     | 直列              | 全 lane の完了後に 1 回で検証する       |

> 並列数は 3 lane を上限とする。`task-specification-creator` の patterns にある rate limit 教訓を反映し、4 並列は採用しない。

## Concern 分解戦略

| 観点            | 判断                                                         | 採用理由                                         |
| --------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| 分割軸          | file ごとではなく responsibility family ごとに分割           | 1 file = 1 responsibility を満たせる             |
| root 管理       | `.claude` 正本、`.agents` mirror                             | user 指定 root と skill-creator 規則を両立できる |
| entrypoint 設計 | SKILL は概要・導線・task nav のみに縮小                      | 発見性を維持しつつ 500 行制約へ収める            |
| history 管理    | LOGS は rolling、詳細は archive                              | 日常利用と長期保存の関心を分離できる             |
| 依存契約        | parent / child / archive / mirror の到達経路を残す           | 分割後の孤立 file や参照欠落を防げる             |
| validation      | line budget、link、mirror、knowledge loss を別コマンドで確認 | 失敗点を 1 回で特定できる                        |

## 再設計監査（2026-03-12）

| 観点              | 内容                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------- |
| issue 拡張        | Issue #1144 と source doc の `SKILL.md` 単独スコープを、actual inventory に合わせて 6 concern へ拡張した |
| gate policy       | Phase 1-3 完了後に Phase 4-12 を順次実行し、Phase 13 だけを `blocked` に維持した                         |
| execution summary | 実ファイル変更、mirror sync、validator、system spec sync、workflow outputs 更新まで完了した              |
| mirror policy     | workflow 本文は `.claude` 正本を参照し、mirror 操作は Phase 5/9/12 に限定する                            |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 検証導線

- [outputs/phase-1/requirements-definition.md](./outputs/phase-1/requirements-definition.md)
- [outputs/phase-1/oversized-markdown-inventory.md](./outputs/phase-1/oversized-markdown-inventory.md)
- [outputs/phase-1/source-task-mapping.md](./outputs/phase-1/source-task-mapping.md)
- [outputs/phase-2/responsibility-split-plan.md](./outputs/phase-2/responsibility-split-plan.md)
- [outputs/phase-2/subagent-lane-plan.md](./outputs/phase-2/subagent-lane-plan.md)
- [outputs/phase-2/validation-and-mirror-plan.md](./outputs/phase-2/validation-and-mirror-plan.md)
- [outputs/phase-3/design-review-result.md](./outputs/phase-3/design-review-result.md)
- [outputs/phase-3/review-prompt.txt](./outputs/phase-3/review-prompt.txt)
- [outputs/phase-3/task-specification-creator-compliance-audit.md](./outputs/phase-3/task-specification-creator-compliance-audit.md)
- [outputs/phase-3/aiworkflow-requirements-extraction-audit.md](./outputs/phase-3/aiworkflow-requirements-extraction-audit.md)
- [outputs/phase-3/solution-elegance-review.md](./outputs/phase-3/solution-elegance-review.md)
- [outputs/phase-4/test-scenarios.md](./outputs/phase-4/test-scenarios.md)
- [outputs/phase-4/command-expectations.md](./outputs/phase-4/command-expectations.md)
- [outputs/phase-4/mirror-checklist.md](./outputs/phase-4/mirror-checklist.md)
- [outputs/phase-5/implementation-log.md](./outputs/phase-5/implementation-log.md)
- [outputs/phase-6/expanded-test-matrix.md](./outputs/phase-6/expanded-test-matrix.md)
- [outputs/phase-6/regression-checks.md](./outputs/phase-6/regression-checks.md)
- [outputs/phase-7/coverage-matrix.md](./outputs/phase-7/coverage-matrix.md)
- [outputs/phase-7/gap-list.md](./outputs/phase-7/gap-list.md)
- [outputs/phase-8/duplication-audit.md](./outputs/phase-8/duplication-audit.md)
- [outputs/phase-8/navigation-refactor-summary.md](./outputs/phase-8/navigation-refactor-summary.md)
- [outputs/phase-9/quality-report.md](./outputs/phase-9/quality-report.md)
- [outputs/phase-9/command-log.md](./outputs/phase-9/command-log.md)
- [outputs/phase-10/final-review-result.md](./outputs/phase-10/final-review-result.md)
- [outputs/phase-10/review-prompt.txt](./outputs/phase-10/review-prompt.txt)
- [outputs/phase-11/manual-test-result.md](./outputs/phase-11/manual-test-result.md)
- [outputs/phase-11/discovered-issues.md](./outputs/phase-11/discovered-issues.md)
- [outputs/phase-11/ui-sanity-visual-review.md](./outputs/phase-11/ui-sanity-visual-review.md)
- [outputs/phase-11/screenshots-app-sanity/phase11-capture-metadata.json](./outputs/phase-11/screenshots-app-sanity/phase11-capture-metadata.json)
- [outputs/phase-12/implementation-guide.md](./outputs/phase-12/implementation-guide.md)
- [outputs/phase-12/system-spec-update-summary.md](./outputs/phase-12/system-spec-update-summary.md)
- [outputs/phase-12/documentation-changelog.md](./outputs/phase-12/documentation-changelog.md)
- [outputs/phase-12/unassigned-task-detection.md](./outputs/phase-12/unassigned-task-detection.md)
- [outputs/phase-12/skill-feedback-report.md](./outputs/phase-12/skill-feedback-report.md)
- [outputs/phase-12/phase12-task-spec-compliance-check.md](./outputs/phase-12/phase12-task-spec-compliance-check.md)
- [outputs/verification-report.md](./outputs/verification-report.md)
