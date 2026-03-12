# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 12                                                   |
| Phase名    | ドキュメント                                         |
| ステータス | completed                                            |
| 前提Phase  | Phase 11                                             |
| 後続Phase  | Phase 13                                             |

## 目的

guard 導入内容を implementation-guide / system spec / unassigned detection / skill feedback として残し、次回再監査の再現性を固定する。

## 実行タスク

- Task 1: `implementation-guide.md` を Part 1 / Part 2 の 2 パート構成で作成する
- Task 2: `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` / `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` を同期し、mirror drift が確認された場合のみ `.claude` / `.agents` の差分を記録する
- Task 3: `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/documentation-changelog.md` と `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/spec-update-summary.md` を作成する
- Task 4: `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/unassigned-task-detection.md` を 0件でも必ず作成する
- Task 5: `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/skill-feedback-report.md` と `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する

## 参照資料

| 参照資料                     | パス                                                                                        | 説明                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 11/12 guide            | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | Phase 12 必須5タスクの正本             |
| phase12 checklist definition | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`      | 完了定義                               |
| spec update workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | system spec 更新順序                   |
| Phase 2 成果物               | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-2/`  | screenshot / audit / evidence 設計     |
| Phase 5 成果物               | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-5/`  | 実装差分                               |
| Phase 6 成果物               | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-6/`  | 拡張テスト結果                         |
| Phase 7 成果物               | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-7/`  | coverage                               |
| Phase 8 成果物               | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-8/`  | refactoring 結果                       |
| Phase 9 成果物               | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-9/`  | quality gate 結果                      |
| Phase 10 成果物              | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-10/` | 最終レビュー結果                       |
| Phase 11 成果物              | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/` | screenshot / discovered issue / result |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                                                    |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| resource map             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                | 必要仕様の再確認入口                                    |
| quick reference          | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`             | current build / selector capture / mirror root の注意点 |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | checklist / evidence / unassigned 更新                  |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再監査教訓                                              |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature 側導線                                          |
| quality-requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | guard 品質基準                                          |

## 実行手順

### ステップ1: implementation guide を作成する

1. Part 1 では中学生レベルの例えで「なぜ guard が必要か」を説明する
2. Part 2 では artifact、TC-ID、script command、error path、edge case を記述する
3. screenshot / audit / evidence policy の関係を 1 文書で読めるようにする

### ステップ2: system spec を同期する

1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` に current build / selector capture / baseline policy / unassigned を同期する
2. `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` に再発条件と短手順を同期する
3. `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` に representative feature と manual review の導線を同期する
4. `.claude` と `.agents` の mirror root drift があれば記録する

### ステップ3: Phase 12 必須成果物を閉じる

1. `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/documentation-changelog.md` を作成する
2. `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/unassigned-task-detection.md` を 0件でも作成する
3. `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/skill-feedback-report.md` と `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する

## 統合テスト連携

| 観点              | 連携内容                                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec sync         | Phase 11 で確定した screenshot / issues を system spec へ移送する                                                                            |
| Unassigned bridge | current issue と baseline backlog を未タスクへ接続する                                                                                       |
| Skill improvement | task-specification-creator / aiworkflow-requirements を基本とし、今回のように再利用パターンを抽出した場合は skill-creator も更新して記録する |

## 多角的チェック観点

| 観点             | 適用内容                                                    | 仕様参照先                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ドキュメント品質 | guide が初学者向け / 実装者向けの両方を満たすか             | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                                                                               |
| system spec 整合 | task-workflow / lessons / feature spec の 3点同期           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                                                            |
| 運用証跡         | current build / selector / baseline policy を再利用できるか | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                               |
| skill 改善       | 2つの skill に対する再発防止フィードバックがあるか          | `.claude/skills/task-specification-creator/SKILL.md`, `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/skill-feedback-report.md` |

## 成果物

| 成果物                             | パス                                                                                                                             | 説明                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| implementation-guide               | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 構成の運用ガイド |
| spec-update-summary                | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/spec-update-summary.md`                | 同期した仕様の一覧               |
| documentation-changelog            | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/documentation-changelog.md`            | 変更履歴                         |
| unassigned-task-detection          | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須                  |
| skill-feedback-report              | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/skill-feedback-report.md`              | 2 skill への改善提案             |
| phase12-task-spec-compliance-check | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック            |

## 実行結果サマリー

- Task 1: `implementation-guide.md` を Part 1 / Part 2 構成で出力し、guard の目的・運用・コマンド・edge case を固定した。
- Task 2: `.claude` 正本の `task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` / `ui-ux-design-system.md` を同期し、mirror drift は `spec-update-summary.md` に記録した。
- Task 3-5: `documentation-changelog.md` / `spec-update-summary.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` を作成し、baseline backlog、global `unassigned-task/` legacy、skill 改善の判断を outputs 側へ残した。
- 二重台帳同期: `artifacts.json` と `outputs/artifacts.json` を一致させ、workflow `index.md` は `generate-index.js --regenerate` で再生成して Phase 状態を揃える。

## 完了条件

- [x] implementation-guide Part 1 / Part 2 と日常例え・型/API・edge case 要件が定義されている
- [x] task-workflow / lessons-learned / ui-ux-feature-components の同期方針が明記されている
- [x] unassigned-task-detection が 0件でも必須と記録されている
- [x] skill-feedback-report と mirror drift check の導線が記載されている

## サブタスク管理

1. Phase 11 成果物を確認する
2. implementation guide を作成する
3. system spec sync を整理する
4. Phase 12 必須成果物を列挙する
5. compliance check を更新する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] `artifacts.json` の Phase 12 登録を更新
- [x] system spec sync / skill feedback / unassigned detection を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 12
```

## 次Phase

Phase 13: PR作成
