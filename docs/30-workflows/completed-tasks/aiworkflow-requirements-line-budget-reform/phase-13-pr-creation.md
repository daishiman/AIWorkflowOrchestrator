# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001                                              |
| Phase      | 13                                                                                                   |
| Phase名    | PR作成                                                                                               |
| ステータス | blocked                                                                                              |
| 前提Phase  | Phase 1、Phase 2、Phase 3、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10、Phase 11、Phase 12 |
| 後続Phase  | なし                                                                                                 |

## 目的

user が許可した場合のみ、manual docs reform と generated index status を説明できる PR 材料を整える。

## 実行タスク

- タスク1: PR summary と verification 抜粋を整える
- タスク2: generated index の resolved / blocked 状態を明記する
- タスク3: user 承認があるまで commit / PR を実行しない

## 参照資料

| 参照資料            | パス                                                                                                          | 説明                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 2 outputs     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/`               | split と lane 設計      |
| Phase 5 outputs     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/`               | 実装結果                |
| Phase 6 outputs     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-6/`               | regression suite        |
| Phase 7 outputs     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-7/`               | coverage matrix         |
| Phase 8 outputs     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-8/`               | naming / discovery 整理 |
| Phase 9 outputs     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-9/`               | quality gate 結果       |
| Phase 10 outputs    | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-10/`              | final review 結果       |
| Phase 11 outputs    | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-11/`              | manual test 結果        |
| Phase 12 outputs    | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/`              | final sync 結果         |
| verification report | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/verification-report.md` | 検証結果                |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                                                        | 内容              |
| ------------- | --------------------------------------------------------------------------- | ----------------- |
| task workflow | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | 完了記録の正本    |
| task rules    | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  | 最終 gate         |
| cross-skill   | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md` | mirror 状態の説明 |

## 実行手順

### ステップ1: PR 材料を準備する

manual docs reform の要点、verification、G0 状態を summary にまとめる。

### ステップ2: blocker を明記する

`topic-map.md` が blocked の場合は、script exclusion 由来であることを明示する。

### ステップ3: 実行を止める

user 明示承認があるまで commit / PR を行わない。

## 統合テスト連携

| 観点               | 連携内容                            |
| ------------------ | ----------------------------------- |
| PR summary         | Phase 12 documentation と整合させる |
| blocker disclosure | generated index の扱いを隠さない    |
| stop condition     | user 指示待ちを維持する             |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                 | 仕様参照先                                                                                                                                               |
| -------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 最終説明に必要           | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | PR summary に必要        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 最終説明に必要           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | merge 前の最終確認に必要 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. 多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物             | パス                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| pr-summary         | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-13/pr-summary.md`         |
| release-note-draft | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-13/release-note-draft.md` |

## 完了条件

- [ ] user 明示承認がある
- [ ] PR summary に manual docs reform と G0 状態が記載されている
- [ ] commit / PR 実行可否が user 指示と一致している

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 参照資料と成果物の対応が確認済み
- [ ] `artifacts.json` または引き継ぎ条件が更新済み
- [ ] user 明示承認があるまで実行しない条件が維持されている
