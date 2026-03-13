# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001                          |
| Phase      | 11                                                                               |
| Phase名    | 手動テスト検証                                                                   |
| ステータス | completed                                                                        |
| 前提Phase  | Phase 1、Phase 2、Phase 3、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10 |
| 後続Phase  | Phase 12                                                                         |

## 目的

non-visual な discovery、archive / history 導線、dependency path、generated index 状態表示が実用的かを人手で確認する。加えて、user が branch-level screenshot 検証を明示要求した場合は representative dashboard screenshot を撮影し、Apple UI/UX 観点の sanity review も残す。

## 実行タスク

- タスク1: `SKILL.md` / `quick-reference.md` / `resource-map.md` から family docs と child shard へたどる
- タスク2: ledger / history / archive 導線と dependency path を確認する
- タスク3: `topic-map.md` の status 表示と blocked record を確認する
- タスク4: user の明示要求がある場合は representative screenshot を撮影し、Apple UI/UX 観点の sanity review を記録する

## 参照資料

| 参照資料         | パス                                                                                             | 説明                   |
| ---------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| Phase 2 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-2/`  | lane と discovery 前提 |
| Phase 5 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-5/`  | 実装結果               |
| Phase 6 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-6/`  | regression suite       |
| Phase 7 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-7/`  | coverage matrix        |
| Phase 8 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-8/`  | discovery link 調整    |
| Phase 9 outputs  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-9/`  | quality gate 結果      |
| Phase 10 outputs | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-10/` | final review 結果      |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                                                | 内容               |
| --------------- | ------------------------------------------------------------------- | ------------------ |
| quick reference | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` | discovery 入口     |
| resource map    | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`    | resource 逆引き    |
| update agent    | `.claude/skills/aiworkflow-requirements/agents/update-spec.md`      | topic-map 更新条件 |

## 実行手順

### ステップ1: discovery walkthrough を実行する

入口三層から family parent file へ、さらに child shard へたどれるかを確認する。親だけ見えて child が孤立していないことも確認する。

### ステップ2: history / archive walkthrough を実行する

`.claude/skills/aiworkflow-requirements/LOGS.md`、`.claude/skills/aiworkflow-requirements/references/lessons-learned.md`、`.claude/skills/aiworkflow-requirements/references/task-workflow.md` から archive / companion へ移動できるかを確認する。そこから関連する parent file へ戻れるかも確認する。

### ステップ3: generated index 表示を確認する

`topic-map.md` の resolved / blocked 状態が documentation と矛盾していないかを確認する。

## テストカテゴリ

| カテゴリ        | 内容                                                        |
| --------------- | ----------------------------------------------------------- |
| discovery       | 入口三層からの到達性                                        |
| archive         | ledger / history companion への遷移                         |
| status          | generated index の状態表示                                  |
| dependency path | parent / child / history / archive / discovery の人手追跡性 |

## 統合テスト連携

| 観点            | 連携内容                                           |
| --------------- | -------------------------------------------------- |
| discovery       | Phase 12 changelog と lessons へ反映する           |
| archive         | Phase 12 documentation summary の材料にする        |
| status          | G0 blocker 記録の最終確認に使う                    |
| dependency path | Phase 12 documentation と follow-up 判断へ反映する |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                            | 仕様参照先                                                                                                                                               |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| split ルール   | 必須                                | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`, `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md` |
| discovery 導線 | 必須                                | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`, `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    |
| quality gate   | 必須                                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  |
| フェーズ遷移   | 必須                                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`        |
| mirror sync    | manual walkthrough の対象なので必須 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`, `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`      |

## サブタスク管理

Phase実行開始時に管理するサブタスク:

1. 参照資料と system spec の確認
2. 実行タスク 1-3 の実施
3. テストカテゴリの確認
4. 多角的チェック観点の確認
5. 完了条件の確認

## 成果物

| 成果物                  | パス                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| navigation-walkthrough  | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-11/navigation-walkthrough.md`                            |
| manual-test-result      | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-11/manual-test-result.md`                                |
| ui-sanity-visual-review | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-11/ui-sanity-visual-review.md`                           |
| history-archive-check   | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-11/history-archive-check.md`                             |
| discovery-smoke-test    | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-11/discovery-smoke-test.md`                              |
| screenshot-metadata     | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-11/screenshots-app-sanity/phase11-capture-metadata.json` |

## 完了条件

- [x] 入口三層から family docs へ到達できる
- [x] ledger / history / archive 導線が確認できる
- [x] G0 の status 表示が documentation と一致する
- [x] dependency path が人手で追跡可能である
- [x] explicit visual sanity request に対する screenshot と Apple UI/UX review が記録されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 参照資料と成果物の対応が確認済み
- [x] `artifacts.json` または引き継ぎ条件が更新済み
- [x] 次Phaseへ渡す前提が明記されている

## 次Phase

Phase 12: ドキュメント更新
