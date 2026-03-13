# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 |
| Phase      | 8                                                       |
| Phase名    | リファクタリング                                        |
| ステータス | completed                                               |
| 前提Phase  | Phase 1、Phase 2、Phase 5、Phase 6、Phase 7             |
| 後続Phase  | Phase 9                                                 |

## 目的

split 後の重複説明、naming、history / archive 導線、discovery link、dependency path を整える。

## 実行タスク

- タスク1: parent / child / history file の naming を正規化する
- タスク2: duplicate explanation、broken cross-link、broken dependency edge を整理する
- タスク3: quick-reference / resource-map からの導線と parent→child→history / archive path を最短化する

## 参照資料

| 参照資料        | パス                                                                                                              | 説明               |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/`                   | inventory baseline |
| Phase 2 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/`                   | split と lane 設計 |
| coverage matrix | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-7/coverage-matrix.md` | 対象漏れの有無     |
| Phase 5 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/`                   | 実装結果           |
| Phase 6 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-6/`                   | regression suite   |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                   | 内容              |
| --------------- | ---------------------------------------------------------------------- | ----------------- |
| spec guidelines | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` | naming と記述形式 |
| discovery index | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`    | discovery 導線    |
| discovery map   | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`       | resource 逆引き   |

## 実行手順

### ステップ1: naming を統一する

parent、child、history / archive の命名規則を family 横断で揃え、依存先が推測できる命名に統一する。

### ステップ2: 重複と drift を整理する

同じ説明が parent / child に重複していないか、古い path が残っていないか、dependency edge が切れていないかを確認する。

### ステップ3: discovery を最短化する

quick-reference と resource-map から各 family へ最短でたどれ、親から child / history / archive へ 1 段で落ちるように link を再編する。

## 統合テスト連携

| 観点                 | 連携内容                          |
| -------------------- | --------------------------------- |
| naming               | Phase 9 quality gate に渡す       |
| discovery            | Phase 11 manual test に渡す       |
| drift                | Phase 12 の final sync 前提になる |
| dependency integrity | Phase 9、10、11 の判定材料になる  |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                | 仕様参照先                                                                                                                                               |
| -------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                                    | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | 必須                                    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                                    | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | navigation と naming に影響するため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

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
| refactor-log               | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-8/refactor-log.md`               |
| naming-normalization       | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-8/naming-normalization.md`       |
| discovery-link-adjustments | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-8/discovery-link-adjustments.md` |

## 完了条件

- [x] naming が family 横断で統一されている
- [x] duplicate explanation と broken cross-link が解消されている
- [x] discovery link の drift が解消されている
- [x] dependency path の drift が解消されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 9: 品質保証
