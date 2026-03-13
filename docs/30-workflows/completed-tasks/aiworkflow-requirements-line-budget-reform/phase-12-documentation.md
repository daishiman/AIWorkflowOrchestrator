# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001                                    |
| Phase      | 12                                                                                         |
| Phase名    | ドキュメント更新                                                                           |
| ステータス | completed                                                                                  |
| 前提Phase  | Phase 1、Phase 2、Phase 3、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10、Phase 11 |
| 後続Phase  | Phase 13                                                                                   |

## 目的

manual docs reform の結果を aiworkflow skill 正本へ同期し、implementation guide、system spec sync、documentation changelog、未タスク検出、skill feedback を完了させる。

注記: 本タスクでは documentation shell 作成に留めず、Phase 12 outputs まで実行した。workflow 全体の状態は `Phase 1-12 completed / currentPhase=13 / Phase 13 blocked` として `artifacts.json` と verification report に同期する。

## 事前チェック【必須】

- manual docs 34 件の quality gate が PASS している
- `topic-map.md` の resolved / blocked 判定が Phase 10 で確定している
- `.claude` / `.agents` mirror diff が 0、または差分理由が説明できる
- Phase 10 と Phase 11 の結果から Phase 12 mandatory 5 tasks を埋める材料が揃っている

## 実行タスク

- タスク12-1: 実装ガイドを作成する
- タスク12-2: システム仕様書を更新する
- タスク12-3: ドキュメント更新履歴と artifacts を更新する
- タスク12-4: 未タスク検出レポートを作成する
- タスク12-5: スキルフィードバックレポートを作成する

### Task 12-1 から Task 12-5 の一覧

| Task | 内容                                      | 主要出力                                                                                              |
| ---- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 12-1 | implementation guide                      | `outputs/phase-12/implementation-guide.md`                                                            |
| 12-2 | system spec sync                          | `outputs/phase-12/system-spec-update-summary.md`                                                      |
| 12-3 | documentation changelog と artifacts sync | `outputs/phase-12/documentation-changelog.md`                                                         |
| 12-4 | unassigned detection                      | `outputs/phase-12/unassigned-task-detection.md`                                                       |
| 12-5 | skill feedback と compliance check        | `outputs/phase-12/skill-feedback-report.md`、`outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 参照資料

| 参照資料         | パス                                                                                                                         | 説明                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 2 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/`                              | split と lane 設計      |
| Phase 5 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/`                              | 実装結果                |
| Phase 6 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-6/`                              | regression suite        |
| Phase 7 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-7/`                              | coverage matrix         |
| Phase 8 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-8/`                              | naming / discovery 整理 |
| Phase 9 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-9/`                              | quality gate 結果       |
| Phase 10 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-10/`                             | review 判定             |
| Phase 11 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-11/`                             | manual test 結果        |
| validation plan  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | final validation matrix |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                  |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| update agent             | `.claude/skills/aiworkflow-requirements/agents/update-spec.md`                              | Step 1 と index 再生成                |
| task workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了記録と blocked dependency 導線    |
| lessons learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止記録                          |
| spec guidelines          | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`                      | 記述形式                              |
| quick reference          | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | discovery 入口の同期                  |
| resource map             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | family parent 入口の同期              |
| topic map                | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                               | G0 blocked dependency の記録先        |
| keywords                 | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                              | generate-index 生成物の一貫性確認     |
| phase 11/12 guide        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | Phase 12 実行ガイド                   |
| spec update workflow     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1-A〜1-E と Step 2 の正本        |
| phase12 checklist        | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`      | Task 1/3/4/5 実体確認                 |
| unassigned guidelines    | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | 0件時を含む未タスク formalize ルール  |
| documentation guide      | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`     | implementation guide の Part 1/2 要件 |
| phase12 compliance asset | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | Phase 12 準拠監査の出力形式           |

## 実行手順

### ステップ1: Task 12-1 を実施する

`implementation-guide.md` を 2 パート構成で作成する。Part 1 は中学生レベルの概念説明、Part 2 は family split、generated index policy、dependency contract、validation command を技術者向けに記録する。

### ステップ2: Task 12-2 を実施する

`spec-update-workflow.md` に従い、Step 1-A〜1-E を埋める。`.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md`、`.claude/skills/aiworkflow-requirements/LOGS.md`、split により入口導線が変わった family の `indexes/quick-reference.md` と `indexes/resource-map.md`、generated artifact の `indexes/topic-map.md` / `indexes/keywords.json` を同期対象として整理し、status は `Phase 1-12 completed / Phase 13 blocked` 前提で記録する。summary 出力は `outputs/phase-12/system-spec-update-summary.md` に固定する。

### ステップ3: Task 12-3 を実施する

`documentation-changelog.md` と `artifacts.json` を更新する。`generate-index.js`、`validate-structure.js`、raw `wc -l`、`wc -l indexes/topic-map.md`、`diff -qr`、dependency integrity check を再実行し、各コマンドの結果または未実行理由を changelog と `generated-index-status.md` に記録する。

### ステップ4: Task 12-4 を実施する

未タスクを検出し、0 件でも `unassigned-task-detection.md` を出力する。検出がある場合は `unassigned-task-guidelines.md` に従って `docs/30-workflows/unassigned-task/` へ formalize し、`task-workflow.md` と関連仕様書への導線を記録する。

### ステップ5: Task 12-5 を実施する

`skill-feedback-report.md` を作成し、`task-specification-creator` と `aiworkflow-requirements` の運用改善点、または改善点なしの判断根拠を記録する。feedback が skill 本体のルール変更に達する場合は `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md`、関連する SKILL history の同期要否も記録する。あわせて `phase12-task-spec-compliance-check.md` を作成し、Task 12-1 / 12-3 / 12-4 / 12-5 の実体確認結果を残す。

## 苦戦箇所の記録【推奨】

- family split 後に discovery link が切れやすかった箇所
- generated index measurement と validator 結果のズレ
- archive / history companion 命名で迷った箇所
- parent / child / history / archive dependency が崩れやすかった箇所
- Phase 12 mandatory 5 tasks のどこで取りこぼしやすいか

## 統合テスト連携

| 観点                 | 連携内容                                                  |
| -------------------- | --------------------------------------------------------- |
| final sync           | Phase 13 の blocked 解除条件に使う                        |
| generated index      | follow-up 要否の最終判断に使う                            |
| lessons              | 同種課題の再利用知見として残す                            |
| dependency integrity | follow-up と再発防止記録の基準になる                      |
| unassigned detection | blocked dependency と follow-up task の切り分け根拠になる |
| skill feedback       | 同種の skill line-budget reform を改善する入力になる      |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                    | 仕様参照先                                                                                                                                               |
| -------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                        | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | 必須                        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | final sync の対象なので必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 12-1 から 12-5 の実施
3. 事前チェックの確認
4. 多角的チェック観点の確認
5. 完了条件の確認

## 成果物

| 成果物                             | パス                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| implementation-guide               | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/implementation-guide.md`               |
| documentation-changelog            | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/documentation-changelog.md`            |
| system-spec-update-summary         | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/system-spec-update-summary.md`         |
| unassigned-task-detection          | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/unassigned-task-detection.md`          |
| skill-feedback-report              | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/skill-feedback-report.md`              |
| phase12-task-spec-compliance-check | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/phase12-task-spec-compliance-check.md` |
| generated-index-status             | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-12/generated-index-status.md`             |

## 完了条件

- [x] Task 12-1 から Task 12-5 の出力が全て存在する
- [x] system spec、LOGS、task ledger、generated index status が同期されている
- [x] verification 結果が記録されている
- [x] G0 の resolved / blocked と dependency integrity が documentation に固定されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 13: PR作成
