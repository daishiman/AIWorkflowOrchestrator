# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001                       |
| Phase      | 11                                                                               |
| Phase名    | 手動テスト検証                                                                   |
| ステータス | completed                                                                        |
| 前提Phase  | Phase 1、Phase 2、Phase 3、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10 |
| 後続Phase  | Phase 12                                                                         |

## 目的

docs navigation、archive discoverability、mirror parity、dependency path を人手で確認し、knowledge path が実用的かを検証する。user が branch-level の画面検証を要求した場合は、補助的に representative screenshot を取得して Apple UI/UX 観点の sanity check も残す。

## 実行タスク

- タスク1: `SKILL.md` から new refs と child refs への navigation を確認する
- タスク2: `LOGS.md` から archive と dependency path への navigation を確認する
- タスク3: `.claude` 正本と `.agents` mirror の file set を確認する
- タスク4: user request がある場合、branch-level dashboard screenshot を撮って Apple UI/UX 観点で sanity review を記録する

## 参照資料

| 参照資料        | パス                                                                                                                            | 説明                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 5 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-5/`                              | implementation result   |
| Phase 6 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-6/`                              | regression result       |
| Phase 7 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-7/`                              | coverage result         |
| Phase 8 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-8/`                              | refactor result         |
| Phase 9 outputs | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-9/`                              | quality result          |
| final review    | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-10/final-review-result.md`       | Phase 11 の重点確認項目 |
| validation plan | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-2/validation-and-mirror-plan.md` | manual check の補助     |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                | 内容                                                 |
| ---------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| phase 11 guide   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`         | current phase の guide                               |
| screenshot guide | `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md` | docs-only / UI task / explicit sanity request の分岐 |
| skill resources  | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | navigation と直リンク                                |
| cross-skill      | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`         | root parity                                          |

## 実行手順

### ステップ1: navigation walkthrough を実行する

`SKILL.md` の quick start から target family file へたどれ、そこから child refs へ落ちるかを確認する。

### ステップ2: archive walkthrough を実行する

`LOGS.md` から archive index へたどれ、archive から parent guide へ戻れるかを確認する。

### ステップ3: root walkthrough を実行する

`.claude` と `.agents` の file set が一致するかを確認し、mirror 側でも dependency path が失われていないことを確認する。

### ステップ4: visual sanity review を実行する

user request がある場合は representative screenshot を取得し、Apple UI/UX 観点で hierarchy、contrast、grouping、responsive layout を確認する。

## テストカテゴリ

| カテゴリ                | 実施内容                                                              |
| ----------------------- | --------------------------------------------------------------------- |
| ナビゲーションテスト    | `SKILL.md` から target family refs へ移動できるか                     |
| archive discoverability | `LOGS.md` から archive index へ移動できるか                           |
| root parity             | `.claude` と `.agents` の file set が一致するか                       |
| validation replay       | documented command が再実行可能か                                     |
| dependency path         | parent / child / archive / mirror を人手で追跡できるか                |
| visual sanity           | user request 時に representative screenshot と Apple UI/UX 所見を残す |

## 統合テスト連携

| 観点            | 連携内容                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| navigation      | Phase 12 実装ガイドの reader path へ反映する                             |
| archive         | Phase 12 documentation changelog の注意点へ反映する                      |
| root parity     | Phase 12 final sync の証跡へ反映する                                     |
| dependency path | Phase 12 documentation と lessons へ反映する                             |
| visual sanity   | Phase 12 summary と changelog に branch-level sanity evidence を反映する |

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断                            | 仕様参照先                                                                                                                                                              |
| ------------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキル構造   | 必須                                | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 参照導線     | 必須                                | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md`, `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`  |
| 品質ゲート   | 必須                                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                 |
| フェーズ遷移 | 必須                                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`                       |
| mirror sync  | manual walkthrough の対象なので必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`                     |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. テストカテゴリと多角的チェック観点の確認
4. 成果物と artifacts の更新
5. 完了条件の確認

## 成果物

| 成果物                  | パス                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| manual-test-result      | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-11/manual-test-result.md`                                |
| discovered-issues       | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-11/discovered-issues.md`                                 |
| ui-sanity-visual-review | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-11/ui-sanity-visual-review.md`                           |
| screenshot-metadata     | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/phase-11/screenshots-app-sanity/phase11-capture-metadata.json` |

## 完了条件

- [x] `SKILL.md` から target family へ navigation できる
- [x] `LOGS.md` から archive へ navigation できる
- [x] `.claude` と `.agents` の file set が一致している
- [x] dependency path が人手で追跡可能である
- [x] user request がある場合、branch-level screenshot sanity と Apple UI/UX 所見が記録されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 12: ドキュメント更新

## テストケース

| TC       | シナリオ                                     | 状態 | 補足                               |
| -------- | -------------------------------------------- | ---- | ---------------------------------- |
| TC-11-01 | Dashboard home / normal / light / desktop    | PASS | 分割された family 導線の確認       |
| TC-11-02 | Dashboard home / empty / light / desktop     | PASS | 分岐説明と空状態導線の確認         |
| TC-11-03 | Dashboard home / loading / dark / desktop    | PASS | loading 安定性と見取り図維持の確認 |
| TC-11-04 | Dashboard home / normal / dark / mobile      | PASS | レスポンシブ時の階層維持の確認     |
| TC-11-05 | Dashboard home / normal / kanagawa / desktop | PASS | theme 変更時の情報構造維持の確認   |

## 画面カバレッジマトリクス

| TC       | 画面                           | 証跡                                                               |
| -------- | ------------------------------ | ------------------------------------------------------------------ |
| TC-11-01 | `home-normal-light-desktop`    | `screenshots-app-sanity/TC-11-01-home-normal-light-desktop.png`    |
| TC-11-02 | `home-empty-light-desktop`     | `screenshots-app-sanity/TC-11-02-home-empty-light-desktop.png`     |
| TC-11-03 | `home-loading-dark-desktop`    | `screenshots-app-sanity/TC-11-03-home-loading-dark-desktop.png`    |
| TC-11-04 | `home-normal-mobile-dark`      | `screenshots-app-sanity/TC-11-04-home-normal-mobile-dark.png`      |
| TC-11-05 | `home-normal-kanagawa-desktop` | `screenshots-app-sanity/TC-11-05-home-normal-kanagawa-desktop.png` |
