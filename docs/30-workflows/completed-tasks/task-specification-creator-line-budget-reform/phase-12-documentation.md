# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001                                 |
| Phase      | 12                                                                                         |
| Phase名    | ドキュメント更新                                                                           |
| ステータス | completed                                                                                  |
| 前提Phase  | Phase 1、Phase 2、Phase 3、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10、Phase 11 |
| 後続Phase  | Phase 13                                                                                   |

## 目的

doc split の結果を skill docs と system specs へ同期し、実装ガイド、changelog、未タスク検出、skill feedback を完了させる。

## 事前チェック【必須】

- [x] Phase 10 の final review result が揃っている
- [x] Phase 11 の manual walkthrough 結果が揃っている
- [x] `.claude` 正本と `.agents` mirror の差分状態が把握されている
- [x] system spec sync 対象ファイルが列挙されている

## 実行タスク

- タスク12-1: 実装ガイドを作成する
- タスク12-2: システム仕様書を更新する
- タスク12-3: ドキュメント更新履歴と artifacts を更新する
- タスク12-4: 未タスク検出レポートを作成する
- タスク12-5: スキルフィードバックレポートを作成する

### Task 12-1 から Task 12-5 の一覧

| Task | 内容                                      | 主要出力                                         |
| ---- | ----------------------------------------- | ------------------------------------------------ |
| 12-1 | implementation guide                      | `outputs/phase-12/implementation-guide.md`       |
| 12-2 | system spec sync                          | `outputs/phase-12/system-spec-update-summary.md` |
| 12-3 | documentation changelog と artifacts sync | `outputs/phase-12/documentation-changelog.md`    |
| 12-4 | unassigned detection                      | `outputs/phase-12/unassigned-task-detection.md`  |
| 12-5 | skill feedback                            | `outputs/phase-12/skill-feedback-report.md`      |

## 参照資料

| 参照資料         | パス                                                                                                                            | 説明                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 5 outputs  | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-5/`                              | implementation result   |
| Phase 6 outputs  | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-6/`                              | regression result       |
| Phase 7 outputs  | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-7/`                              | coverage result         |
| Phase 8 outputs  | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-8/`                              | refactor result         |
| manual test      | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-11/manual-test-result.md`        | final sync の前提       |
| quality report   | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-9/quality-report.md`             | system spec sync の根拠 |
| Phase 10 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-10/`                             | final review result     |
| validation plan  | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | final validation matrix |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                | 内容                        |
| -------------------- | ----------------------------------------------------------------------------------- | --------------------------- |
| task workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                | 完了台帳と follow-up 管理   |
| lessons learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`              | 再発防止知見                |
| skill structure      | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | skill split pattern         |
| skill resources      | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | navigation と ref split     |
| skill process        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`   | validate と direct link     |
| spec splitting       | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md`    | 500 行 split の再利用ルール |
| phase 11/12 guide    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`         | Phase 12 実行ガイド         |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | Step 1 と Step 2 の正本     |

## 実行手順

### ステップ1: 実装ガイドと sync summary を作成する

`implementation-guide.md` と `system-spec-update-summary.md` を作成し、split 理由、target files、mirror policy、validation result を記録する。

### ステップ2: 台帳と history を更新する

`.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md`、`.claude/skills/aiworkflow-requirements/LOGS.md`、`.claude/skills/task-specification-creator/LOGS.md`、両 SKILL change history を同期する。

### ステップ3: final validation を実行する

`quick_validate.js`、`validate_all.js`、`verify-all-specs.js`、`diff -qr`、`wc -l` を再実行し、dependency integrity の結果も含めて changelog へ記録する。

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                    | 仕様参照先                                                                                                                                                              |
| ------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須                        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須                        | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須                        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | final sync の対象なので必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 12-1 から 12-5 の実施
3. 多角的チェック観点の確認
4. 成果物、台帳、validation の更新
5. 完了条件の確認

## 成果物

| 成果物                             | パス                                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| implementation-guide               | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-12/implementation-guide.md`               |
| system-spec-update-summary         | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-12/system-spec-update-summary.md`         |
| documentation-changelog            | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-12/documentation-changelog.md`            |
| unassigned-task-detection          | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-12/unassigned-task-detection.md`          |
| skill-feedback-report              | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-12/skill-feedback-report.md`              |
| phase12-task-spec-compliance-check | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [x] Task 12-1 から Task 12-5 の出力が全て存在する
- [x] system spec、LOGS、SKILL history、task ledger が同期されている
- [x] final validation が PASS している

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] 台帳と validation の更新が完了している
- [x] 次Phaseへ渡す前提が明記されている

## 苦戦箇所の記録【推奨】

- line budget が再超過した理由
- canonical root と mirror sync で詰まった点
- refs link、archive link、validation で詰まった点
- parent / child / archive dependency で詰まった点

## 次Phase

Phase 13: PR作成
