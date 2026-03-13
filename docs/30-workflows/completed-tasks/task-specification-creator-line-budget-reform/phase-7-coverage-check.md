# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| Phase      | 7                                                          |
| Phase名    | テストカバレッジ確認                                       |
| ステータス | completed                                                  |
| 前提Phase  | Phase 5、Phase 6                                           |
| 後続Phase  | Phase 8                                                    |

## 目的

6 concern 全てに line budget、link、mirror、knowledge retention、dependency edge の check が割り当てられているかを確認する。

## 実行タスク

- タスク1: concern × command × dependency edge の coverage matrix を作成する
- タスク2: command coverage と dependency coverage を集計する
- タスク3: 未到達 concern と欠落 dependency を抽出する

## 参照資料

| 参照資料             | パス                                                                                                                           | 説明                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| Phase 5 outputs      | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-5/`                             | implementation result       |
| expanded test matrix | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-6/expanded-test-matrix.md`      | command coverage の元データ |
| split plan           | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/responsibility-split-plan.md` | concern list                |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                     |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage と quality gate |
| skill process        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md` | validate と link check   |

## 実行手順

### ステップ1: coverage matrix を作成する

6 concern と command family を行列化し、parent / child / archive / mirror の dependency edge も列に含める。

### ステップ2: gap を確認する

未割当 concern と command family、未確認の dependency edge を抽出する。

### ステップ3:改善案を記録する

Phase 8 へ渡す gap list を記録する。dependency break や orphan file 疑いも同じ list に集約する。

## 統合テスト連携

| 観点                | 連携内容                               |
| ------------------- | -------------------------------------- |
| concern coverage    | Phase 8 の重複削減と gap 補完へ渡す    |
| command coverage    | Phase 9 の quality report へ渡す       |
| gap list            | Phase 12 の lessons learned 入力へ渡す |
| dependency coverage | Phase 8 と Phase 11 の判定材料へ渡す   |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断            | 仕様参照先                                                                                                                                                              |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須                | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須                | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | coverage 対象に含む | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物          | パス                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| coverage-matrix | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-7/coverage-matrix.md` |
| gap-list        | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-7/gap-list.md`        |

## 完了条件

- [x] 6 concern の coverage matrix が作成されている
- [x] command family の gap が特定されている
- [x] Phase 8 へ渡す gap list が記録されている
- [x] parent / child / archive / mirror dependency edge の coverage が明示されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 8: リファクタリング
