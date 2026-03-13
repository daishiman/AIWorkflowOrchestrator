# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 |
| Phase      | 8                                                          |
| Phase名    | リファクタリング                                           |
| ステータス | completed                                                  |
| 前提Phase  | Phase 1、Phase 2、Phase 5、Phase 6、Phase 7                |
| 後続Phase  | Phase 9                                                    |

## 目的

split 後の重複説明、link naming、archive navigation、dependency path を整え、knowledge path を短くする。

## 実行タスク

- タスク1: duplicated explanation を削減する
- タスク2: link naming、index naming、dependency edge naming を統一する
- タスク3: archive navigation、quick start、parent→child path の導線を短縮する

## 参照資料

| 参照資料        | パス                                                                                                                           | 説明                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Phase 1 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-1/`                             | requirement baseline  |
| Phase 5 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-5/`                             | implementation result |
| Phase 6 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-6/`                             | regression result     |
| gap list        | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-7/gap-list.md`                  | 補正対象              |
| split plan      | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/responsibility-split-plan.md` | target shape          |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                                | 内容                  |
| --------------- | ----------------------------------------------------------------------------------- | --------------------- |
| skill resources | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | 直リンクと navigation |
| skill process   | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`   | 重複回避              |

## 実行手順

### ステップ1: duplicate を抽出する

`SKILL.md` と new refs の重複説明を抽出する。

### ステップ2: naming を統一する

index、family file、archive file、dependency edge が推測できる naming を統一する。

### ステップ3: navigation を再確認する

quick start から目的の detail へ 1 hop で移動でき、parent から child / archive に落ちる dependency path が崩れていないことを確認する。

## 統合テスト連携

| 観点                 | 連携内容                                 |
| -------------------- | ---------------------------------------- |
| duplicate removal    | Phase 9 quality report で再確認する      |
| naming               | direct link audit へ反映する             |
| navigation           | Phase 11 manual walkthrough へ反映する   |
| dependency integrity | Phase 9 と Phase 11 の判定材料へ反映する |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                                | 仕様参照先                                                                                                                                                              |
| ------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須                                    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須                                    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須                                    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須                                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | navigation と naming に影響するため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物                      | パス                                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| duplication-audit           | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-8/duplication-audit.md`           |
| navigation-refactor-summary | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-8/navigation-refactor-summary.md` |

## 完了条件

- [x] duplicated explanation が削減されている
- [x] naming と index path が統一されている
- [x] quick start から detail への導線が短縮されている
- [x] dependency path の drift が解消されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 9: 品質保証
