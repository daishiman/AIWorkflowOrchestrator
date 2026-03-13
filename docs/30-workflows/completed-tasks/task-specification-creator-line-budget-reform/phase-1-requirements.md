# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| Phase      | 1                                                          |
| Phase名    | 要件定義                                                   |
| ステータス | completed                                                  |
| 前提Phase  | なし                                                       |
| 後続Phase  | Phase 2                                                    |

## 目的

over-limit Markdown の actual inventory と split target を確定し、本 task の scope を 6 concern へ固定する。

## 実行タスク

- タスク1: over-limit Markdown inventory を確定する
- タスク2: source doc と expanded scope の差分を定義する
- タスク3: acceptance criteria、SubAgent 上限、停止条件を確定する

## 参照資料

| 参照資料                | パス                                                                                                                              | 説明                             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| requirements definition | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-1/requirements-definition.md`      | requirement baseline             |
| oversized inventory     | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-1/oversized-markdown-inventory.md` | target 6 concern                 |
| source mapping          | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-1/source-task-mapping.md`          | issue #1144 と source doc の扱い |
| source task             | `docs/30-workflows/unassigned-task/task-imp-task-spec-skill-md-line-budget-001.md`                                                | 起点となる未タスク文書           |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                                | 内容                                  |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------------- |
| skill structure | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL、references、agents の標準構造  |
| skill resources | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | Progressive Disclosure と直リンク規則 |
| spec splitting  | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md`    | 500 行超 file の split 基準           |
| skill template  | `.claude/skills/skill-creator/assets/skill-template.md`                             | `SKILL.md 500 行以内` と file role    |
| cross-skill     | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`         | `.claude` 正本 / `.agents` mirror     |

## 実行手順

### ステップ0: P50 相当の既存対象調査

対象は新規 skill ではなく既存の大規模 Markdown 群なので、現行ファイル構成と行数を先に計測し、docs refactor mode として扱う。

### ステップ1: target inventory を確定する

`wc -l` と見出し棚卸しで、`.claude/skills/task-specification-creator/` 配下の 500 行超 Markdown 6 件を固定する。

### ステップ2: source scope を拡張する

Issue #1144 と source doc の `SKILL.md` 単独スコープを、actual inventory ベースの 6 concern scope へ拡張する。

### ステップ3: gate を定義する

Phase 1-3 完了前は Phase 4 以降を開始しない。並列数は 3 lane 上限とする。

## 統合テスト連携

| 観点          | 連携内容                                                  |
| ------------- | --------------------------------------------------------- |
| inventory     | Phase 4 で使う line budget test case の元データを固定する |
| root policy   | Phase 5 で使う mirror parity test の前提を固定する        |
| workflow gate | Phase 3 review へ渡す acceptance criteria を固定する      |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                | 仕様参照先                                                                                                                                                              |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須                    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須                    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須                    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | root 設計を扱うため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物                       | パス                                                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| requirements-definition      | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-1/requirements-definition.md`      |
| oversized-markdown-inventory | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-1/oversized-markdown-inventory.md` |
| source-task-mapping          | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-1/source-task-mapping.md`          |

## 完了条件

- [x] over-limit Markdown 6 件が inventory 化されている
- [x] source scope と expanded scope の差分が説明されている
- [x] Phase 1-3 gate と SubAgent 上限が定義されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 2: 設計
