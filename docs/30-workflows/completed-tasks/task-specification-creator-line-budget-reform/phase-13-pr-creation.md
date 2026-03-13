# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001                                           |
| Phase      | 13                                                                                                   |
| Phase名    | PR作成                                                                                               |
| ステータス | blocked                                                                                              |
| 前提Phase  | Phase 1、Phase 2、Phase 3、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10、Phase 11、Phase 12 |
| 後続Phase  | 完了                                                                                                 |

## 目的

user 明示承認後にだけ commit と PR 準備を行う。

## 実行タスク

- タスク13-1: user に local review と commit 可否を確認する
- タスク13-2: diff summary と validation summary を提示する
- タスク13-3: user 承認後にだけ PR 素案を準備する

## 参照資料

| 参照資料                | パス                                                                                                                          | 説明                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Phase 2 outputs         | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/`                            | split と lane 設計    |
| Phase 5 outputs         | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-5/`                            | implementation result |
| Phase 6 outputs         | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-6/`                            | regression result     |
| Phase 7 outputs         | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-7/`                            | coverage result       |
| Phase 8 outputs         | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-8/`                            | refactor result       |
| Phase 10 outputs        | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-10/`                           | final review result   |
| Phase 11 outputs        | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-11/`                           | manual test result    |
| documentation changelog | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-12/documentation-changelog.md` | 最終 summary          |
| quality report          | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-9/quality-report.md`           | validation summary    |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                           | 内容                    |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| task workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 完了状態の記録先        |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Phase 12 完了条件の根拠 |

## 実行手順

### ステップ1: user 承認を確認する

commit と PR を開始する前に user から明示承認を取得する。

### ステップ2: summary を提示する

diff、validation、system spec sync の summary を提示する。

### ステップ3: 承認済みの場合だけ PR 素案を準備する

承認済みの場合だけ PR summary を作成する。

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                           | 仕様参照先                                                                                                                                                              |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | Phase 12 完了物の review に必要    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | diff summary の reader path に必要 | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | PR 前の最終確認に必要              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | blocked 条件の確認に必要           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | merge 前の最終確認に必要           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 13-1 から 13-3 の実施
3. 多角的チェック観点の確認
4. 成果物と blocked 条件の確認
5. 完了条件の確認

## 成果物

| 成果物     | パス                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| pr-summary | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-13/pr-summary.md` |

## 完了条件

- [ ] user が commit と PR を明示承認している
- [ ] diff summary と validation summary が提示されている
- [ ] PR 素案が承認済み条件の下でのみ作成されている

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 参照資料と成果物の対応が確認済み
- [ ] blocked 条件または承認条件が明記されている
- [ ] タスク完了前提が明記されている

## 次Phase

完了
