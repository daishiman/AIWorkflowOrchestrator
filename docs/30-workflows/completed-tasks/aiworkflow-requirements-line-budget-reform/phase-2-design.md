# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 |
| Phase      | 2                                                       |
| Phase名    | 設計                                                    |
| ステータス | completed                                               |
| 前提Phase  | Phase 1                                                 |
| 後続Phase  | Phase 3                                                 |

## 目的

manual docs 34 件の family topology、3 lane 実行計画、generated index measurement 付き validation matrix、分割後の依存契約を定義し、実装単位を固定する。

## 実行タスク

- タスク1: 6 family の target topology を設計する
- タスク2: Atent Team 相当の 3 lane と verifier lane を設計する
- タスク3: `validate-structure.js`、`generate-index.js`、`wc -l`、依存契約整合 check を含む検証経路を設計する

## 参照資料

| 参照資料        | パス                                                                                                                         | 説明                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| split plan      | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/responsibility-split-plan.md`  | family ごとの target shape |
| lane plan       | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/subagent-lane-plan.md`         | lane と wave 構成          |
| validation plan | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | command matrix             |
| Phase 1 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/`                              | requirement baseline       |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                | 内容                                   |
| ---------------- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| split guidelines | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md`    | family 別 split の正本                 |
| skill resources  | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | index / reference 役割分離             |
| validate agent   | `.claude/skills/aiworkflow-requirements/agents/validate-spec.md`                    | validate-structure と line budget 観点 |
| update agent     | `.claude/skills/aiworkflow-requirements/agents/update-spec.md`                      | generate-index と topic-map 更新条件   |
| cross-skill      | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`         | canonical root rule                    |

## 実行手順

### ステップ1: family topology を決める

F1-F6 に対して、parent file、child shard、history / archive companion の役割分担を table で固定し、parent→child→history / archive の依存経路も定義する。

### ステップ2: lane と wave を決める

Lane A-C を並列、Lane V を直列とする。各 lane 内は 3 ファイル以下 / SubAgent の sub-batch に限定する。

### ステップ3: validation matrix を決める

`list-specs.js --stats`、`validate-structure.js`、`split-reference.js --analyze`、`generate-index.js`、`wc -l indexes/topic-map.md`、`diff -qr`、family ごとの orphan shard / discovery link 欠落 check を phase plan に組み込む。

## 統合テスト連携

| 観点                | 連携内容                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------- |
| topology            | Phase 4 で test target へ変換する                                                           |
| lane                | Phase 5 でそのまま実装 batch に使う                                                         |
| validation          | Phase 6-9 と Phase 12 の command set を固定する                                             |
| dependency contract | Phase 5 以降で parent / child / history / archive / discovery / mirror を維持する基準になる |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                | 仕様参照先                                                                                                                                               |
| -------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                    | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | 必須                    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | lane 設計を扱うため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物                     | パス                                                                                                                         |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| responsibility-split-plan  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/responsibility-split-plan.md`  |
| subagent-lane-plan         | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/subagent-lane-plan.md`         |
| validation-and-mirror-plan | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` |

## 完了条件

- [x] 6 family の target topology が定義されている
- [x] 3 lane 上限と verifier lane が定義されている
- [x] generated index measurement を含む validation matrix が定義されている
- [x] 分割後の依存契約が定義されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 3: 設計レビュー
