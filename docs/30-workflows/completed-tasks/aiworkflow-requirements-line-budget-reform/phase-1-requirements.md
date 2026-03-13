# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 |
| Phase      | 1                                                       |
| Phase名    | 要件定義                                                |
| ステータス | completed                                               |
| 前提Phase  | なし                                                    |
| 後続Phase  | Phase 2                                                 |

## 目的

non-script over-limit Markdown 35 件の actual inventory を確定し、manual docs 34 件と generated index 1 件を分離した requirement baseline を固定する。

## 実行タスク

- タスク1: `aiworkflow-requirements` の non-script over-limit inventory を確定する
- タスク2: 既存未タスクと user request から expanded scope を定義する
- タスク3: script exclusion、generated index dependency、停止条件を確定する

## 参照資料

| 参照資料                | パス                                                                                                                           | 説明                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| requirements definition | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/requirements-definition.md`      | requirement baseline                |
| oversized inventory     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/oversized-markdown-inventory.md` | target 35 件                        |
| source mapping          | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/source-task-mapping.md`          | direct request と既存未タスクの扱い |
| quality split task      | `docs/30-workflows/unassigned-task/task-ref-quality-requirements-split-001.md`                                                 | 既存の単発 split task               |
| entrypoint guard task   | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md`                                 | 入口導線と validator の前提         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                             | 内容                          |
| ---------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| spec guidelines  | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`           | 500/700 行ルールと命名規則    |
| split guidelines | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` | family ごとの split パターン  |
| discovery index  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`              | 入口導線設計の前提            |
| discovery map    | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                 | 参照逆引きの前提              |
| validate agent   | `.claude/skills/aiworkflow-requirements/agents/validate-spec.md`                 | validate-structure の品質観点 |

## 実行手順

### ステップ0: P50 相当の既存対象調査

`list-specs.js --stats`、`validate-structure.js`、`wc -l` で、script を除いた over-limit Markdown を先に計測し、manual docs と generated artifact を区別する。

### ステップ1: target inventory を確定する

`references/` 33 件、`LOGS.md` 1 件、`indexes/topic-map.md` 1 件の合計 35 件を固定し、34 manual / 1 generated へ二分する。

### ステップ2: source scope を再構成する

単発 split task と入口導線 task を統合し、「aiworkflow-requirements 全体の line budget reform」として scope を拡張する。

### ステップ3: gate と停止条件を定義する

Phase 1-3 完了前は Phase 4 以降を開始しない。script 変更、commit、PR は禁止。`topic-map.md` は blocked dependency として別管理する。

## 統合テスト連携

| 観点         | 連携内容                                                         |
| ------------ | ---------------------------------------------------------------- |
| inventory    | Phase 4 で family test scenario の母集団になる                   |
| source split | Phase 5 で manual docs と generated index を混同しない前提になる |
| gate         | Phase 3 review で blocker 条件を判定する                         |

## 多角的チェック観点（AIが判断）

| 観点                       | 適用判断 | 仕様参照先                                                                                                                                               |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール               | 必須     | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線             | 必須     | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate               | 必須     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移               | 必須     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| generated index constraint | 必須     | `.claude/skills/aiworkflow-requirements/agents/update-spec.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                   |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物                       | パス                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| requirements-definition      | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/requirements-definition.md`      |
| oversized-markdown-inventory | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/oversized-markdown-inventory.md` |
| source-task-mapping          | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/source-task-mapping.md`          |

## 完了条件

- [x] non-script over-limit Markdown 35 件が inventory 化されている
- [x] 34 manual / 1 generated の責務分離が定義されている
- [x] script exclusion と停止条件が明文化されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 2: 設計
