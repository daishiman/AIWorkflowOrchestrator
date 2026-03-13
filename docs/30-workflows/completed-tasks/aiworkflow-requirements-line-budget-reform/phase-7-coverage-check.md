# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 |
| Phase      | 7                                                       |
| Phase名    | カバレッジ確認                                          |
| ステータス | completed                                               |
| 前提Phase  | Phase 5、Phase 6                                        |
| 後続Phase  | Phase 8                                                 |

## 目的

35 target 全てに validation command、review 観点、dependency edge が割り当てられているかを確認する。

## 実行タスク

- タスク1: target × command × dependency edge の coverage matrix を作る
- タスク2: manual docs 34 件に未覆蓋の target / dependency edge がないか確認する
- タスク3: G0 exception と dependency exception が matrix に明示されているか確認する

## 参照資料

| 参照資料          | パス                                                                                                                           | 説明             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| Phase 1 inventory | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-1/oversized-markdown-inventory.md` | 対象一覧         |
| Phase 5 outputs   | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/`                                | 実装結果         |
| Phase 6 outputs   | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-6/`                                | regression suite |
| validation plan   | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md`   | command family   |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                        | 内容                    |
| -------------------- | --------------------------------------------------------------------------- | ----------------------- |
| quality requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | coverage 観点           |
| task rules           | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  | quality gate            |
| lessons learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | coverage 漏れの再発防止 |

## 実行手順

### ステップ1: matrix を作る

35 target と command family を行列化し、manual docs と G0 を別列で表現する。manual docs 側は parent→child、history / archive、discovery、mirror の dependency edge も列に含める。

### ステップ2: uncovered target を洗い出す

manual docs 34 件に test / validation が割り当てられていない行、および dependency edge が未確認の行を抽出する。

### ステップ3: exception 表示を確認する

G0 が「未検証」ではなく「blocked dependency」として matrix に表現されているかを確認する。manual docs 側では orphan shard や discovery 欠落が exception 扱いで埋もれていないことも確認する。

## 統合テスト連携

| 観点                | 連携内容                             |
| ------------------- | ------------------------------------ |
| coverage matrix     | Phase 9 quality gate の証跡になる    |
| uncovered target    | Phase 8 へ戻す条件になる             |
| exception clarity   | Phase 10 final review の材料になる   |
| dependency coverage | Phase 9 と Phase 11 の判定材料になる |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                    | 仕様参照先                                                                                                                                               |
| -------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                        | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | 必須                        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | coverage 対象に含むため必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物                   | パス                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| coverage-matrix          | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-7/coverage-matrix.md`          |
| uncovered-targets-report | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-7/uncovered-targets-report.md` |
| gate-summary             | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-7/gate-summary.md`             |

## 完了条件

- [x] 35 target の coverage matrix が作成されている
- [x] manual docs の uncovered target が 0 になっている
- [x] G0 exception が明示されている
- [x] manual docs の dependency edge coverage が明示されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 8: リファクタリング
