# TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001: aiworkflow-requirements 大規模 Markdown 責務分離

## ユーザー要求の要約

```text
@.claude/skills/aiworkflow-requirements/ についても、task-specification-creator と aiworkflow-requirements の規則を漏れなく反映した task 仕様書を作る。対象は script を除く 500 行超 Markdown 全体とし、Phase 1-3 の設計書を先に固める。並列実行できる関心ごとは SubAgent 単位で分離する。commit と PR はしない。
```

## タスク概要

### 目的

`.claude/skills/aiworkflow-requirements/` 配下の non-script over-limit Markdown を、`aiworkflow-requirements` 自身の分割ルールと `task-specification-creator` の phase gate に従って family-wave で再編し、Phase 1-12 の設計・実装・検証・文書同期まで完了させる。

### 背景

- `SKILL.md` は現時点で 499 行と上限内だが、起票時点では non-script Markdown 全体で 35 件が 500 行を超えていた
- 起票時の内訳は manual docs 34 件、generated index 1 件（`indexes/topic-map.md` 2179 行）であり、実行後は manual docs over-limit 0 / `topic-map.md` 3520 行が残存している
- `validate-structure.js` は主に `references/` の over-limit を警告するが、generated index の行数超過は別計測が必要である
- 既存未タスク `task-ref-quality-requirements-split-001.md` は `quality-requirements.md` 単独、`UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001` は入口導線単独であり、今回必要な全体 reform を覆っていない
- `topic-map.md` は `generate-index.js` の生成物なので、script 変更を除外する今回の task では manual docs reform と同一 lane に混ぜると破綻する

### 最終ゴール

- manual over-limit docs 34 件を 6 family へ再編し、manual over-limit 0 / max 495 行を確認できている
- generated index 1 件を manual docs と分離し、`topic-map.md` 3520 行を blocked dependency として formalize できている
- `.claude` 正本 / `.agents` mirror、`validate-structure.js`、`generate-index.js`、`wc -l`、`diff -qr`、discovery / dependency smoke test の検証結果が揃っている
- Phase 1-13 が completed となり、PR #1207 と artifacts / phase specs が同期されている
- 各 phase の outputs が `outputs/phase-*` 配下に作成され、verification report と follow-up task まで閉じている

### 成果物一覧

| 種別              | 成果物                       | 配置先                                                                                                        |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| workflow          | メイン task 仕様書           | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/index.md`                       |
| phase specs       | Phase 1-13 仕様書            | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/phase-*.md`                     |
| artifact registry | canonical artifacts registry | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/artifacts.json`                 |
| phase outputs     | Phase 1-12 の成果物          | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/phase-*`                |
| verification      | 仕様書検証レポート           | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/verification-report.md` |

## メタ情報

| 項目         | 内容                                                                                                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001                                                                                                                                                 |
| タスク種別   | 改善                                                                                                                                                                                                    |
| 優先度       | 高                                                                                                                                                                                                      |
| ステータス   | completed                                                                                                                                                                                               |
| currentPhase | 13                                                                                                                                                                                                      |
| lastUpdated  | 2026-03-13T14:00:02Z                                                                                                                                                                                    |
| issue        | PR #1207                                                                                                                                                                                                |
| source docs  | `docs/30-workflows/unassigned-task/task-ref-quality-requirements-split-001.md`、`docs/30-workflows/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md`、2026-03-12 user request |
| 対象 root    | `.claude/skills/aiworkflow-requirements/`                                                                                                                                                               |
| mirror root  | `.agents/skills/aiworkflow-requirements/`                                                                                                                                                               |
| 作成ブランチ | `task/1144-aiworkflow-requirements-line-budget-reform-specs`                                                                                                                                            |

## 対象ファイル棚卸し

| family                           | 対象数 | 主対象                                                                | 主問題                                                | 目標状態                                    |
| -------------------------------- | -----: | --------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| G0 generated index               |      1 | `indexes/topic-map.md`                                                | 生成物 2179 行。script 変更なしでは持続的解消が困難   | blocked dependency として別管理             |
| F1 ledger / archive              |      3 | `LOGS.md`、`lessons-learned.md`、`task-workflow.md`                   | append-only ledger が巨大化し、探索と更新の責務が混在 | rolling index + archive / domain shard      |
| F2 pattern / rulebook            |      6 | `architecture-implementation-patterns.md` ほか                        | 横断パターン、品質、テスト、失敗例が 1 ファイルへ集中 | family index + theme shard                  |
| F3 architecture / core structure |      6 | `arch-state-management.md` ほか                                       | レイヤー説明と task 履歴が混在                        | overview + domain shard + history companion |
| F4 interfaces / api / security   |      9 | `interfaces-agent-sdk-skill.md` ほか                                  | 型定義、IPC、履歴が過密                               | parent index + domain split + history split |
| F5 ui / ux                       |      7 | `ui-ux-feature-components.md` ほか                                    | 機能 catalog と完了履歴が過密                         | overview + surface shard + history split    |
| F6 support / platform            |      3 | `deployment.md`、`database-implementation.md`、`technology-devops.md` | 中規模 docs が 500 行をまたいで維持されている         | overview + subtopic split                   |

## 受入基準

| ID   | 基準                                                                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `.claude/skills/aiworkflow-requirements/` 配下の non-script over-limit Markdown 35 件を inventory に含める                                         |
| AC-2 | 34 manual docs を 6 family へ割り当て、split topology、保持責務、mirror sync 方針を定義する                                                        |
| AC-3 | `spec-guidelines.md` と `spec-splitting-guidelines.md` の 500/700 行ルールを満たす manual docs reform を実装し、manual over-limit 0 を確認する     |
| AC-4 | `indexes/topic-map.md` を manual docs と分離し、script exclusion 由来の blocked dependency として扱う                                              |
| AC-5 | Atent Team 相当の SubAgent lane が 3 並列以下で設計される                                                                                          |
| AC-6 | Phase 1-13 を completed として `artifacts.json`、phase specs、verification report、PR #1207 に反映する                                             |
| AC-7 | user 承認後に commit / PR を実行し、Phase 13 記録まで同期する                                                                                      |
| AC-8 | 分割後も parent→child shard、ledger/history→archive、discovery index→family parent、`.claude`→`.agents` の依存関係が閉じている検証手順が定義される |

## スコープ

**含む**:

- non-script over-limit Markdown 35 件の inventory と family 分解
- manual docs 34 件の split topology 設計と実装
- generated index 1 件の blocked dependency 管理
- `.claude` 正本 / `.agents` mirror の同期
- `validate-structure.js`、`generate-index.js`、`wc -l`、`diff -qr`、discovery / dependency check の実行
- `aiworkflow-requirements` と `task-specification-creator` の規則反映
- Phase 1-12 outputs、verification report、follow-up task の作成

**含まない**:

- script 自体の変更
- generated index sharding の実装
- commit、PR、Phase 13 実行

## 参照ファイル

- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md`
- `docs/30-workflows/unassigned-task/task-ref-quality-requirements-split-001.md`
- `docs/30-workflows/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md`

## システム仕様抽出セット

| 種別             | 参照パス                                                                            | 役割                                                       |
| ---------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| skill structure  | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | 正本構造、SKILL 行数方針、references/indexes の役割        |
| skill overview   | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md`  | skill 責務境界、Progressive Disclosure、system spec 全体像 |
| skill resources  | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-resources.md` | Progressive Disclosure、index 導線、resource 分離          |
| skill process    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`   | 更新プロセス、quality gate、ファイル参照形式               |
| spec guidelines  | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`              | 命名規則、500/700 行ルール、記述形式                       |
| split guidelines | `.claude/skills/aiworkflow-requirements/references/spec-splitting-guidelines.md`    | family 別 split パターン、generate-index 更新条件          |
| discovery index  | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                 | 主要導線の入口設計                                         |
| discovery map    | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    | タスク種別→参照先逆引き                                    |
| topic map        | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                       | G0 generated index の実体、blocked dependency 判断材料     |
| keywords         | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                      | generate-index 生成物の一貫性確認、検索語彙の保持          |
| validate agent   | `.claude/skills/aiworkflow-requirements/agents/validate-spec.md`                    | validate-structure の品質観点                              |
| update agent     | `.claude/skills/aiworkflow-requirements/agents/update-spec.md`                      | generate-index と topic-map 更新条件                       |
| task ledger      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                | 実行記録と follow-up 導線                                  |
| task phases      | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`         | phase gate と出力テンプレート                              |
| task rules       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`          | 品質ゲート、単一責務、更新ルール                           |
| lessons          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`              | rate limit、phase ordering、index 再生成の教訓             |
| cross-skill      | `.claude/skills/skill-creator/references/cross-skill-reference-patterns.md`         | `.claude` 正本 / `.agents` mirror ルール                   |

## Atent Team / SubAgent 編成

| lane   | 担当 family                                          | 実行タイミング | 並列可否          | 理由                                                     |
| ------ | ---------------------------------------------------- | -------------- | ----------------- | -------------------------------------------------------- |
| Lane A | F1 ledger / archive、F2 pattern / rulebook           | Phase 4-5      | Lane B/C と並列可 | ledger と横断ルールは archive / shard 設計が共通する     |
| Lane B | F3 architecture / core、F6 support / platform        | Phase 4-5      | Lane A/C と並列可 | overview と subtopic split の構造が近い                  |
| Lane C | F4 interfaces / api / security、F5 ui / ux           | Phase 4-5      | Lane A/B と並列可 | domain spec の parent index + child split を共通化できる |
| Lane V | validation、mirror sync、generated index measurement | Phase 5-12     | 直列              | 全 lane 完了後に検証し、G0 の blocked 状態を判定する     |

> 並列数は 3 lane を上限とする。各 lane 内も 1 SubAgent あたり 3 ファイル以下の sub-batch に分ける。`lessons-learned.md` の rate limit 教訓を反映し、4 並列以上は採用しない。

## Concern 分解戦略

| 観点             | 判断                                                                     | 採用理由                                                         |
| ---------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| 分割軸           | file ごとではなく family ごとに分割                                      | 35 件を個別 task にすると gate と validation が破綻する          |
| generated index  | manual docs と切り離して扱う                                             | `topic-map.md` は generator 依存であり、docs-only で固定できない |
| parent file 設計 | parent は overview / index に縮める                                      | Progressive Disclosure を維持しつつ探索性を保てる                |
| history 管理     | task 履歴は history companion または archive へ逃がす                    | domain spec 本文と履歴の責務を分離できる                         |
| root 管理        | `.claude` 正本、`.agents` mirror                                         | user 指定 root と cross-skill ルールを両立できる                 |
| validation       | source docs と generated index を別コマンドで測る                        | `validate-structure.js` の監査穴を補える                         |
| 依存契約         | parent / child / history / archive / discovery / mirror の到達経路を残す | 分割後の孤立 shard や導線断線を防げる                            |

## 再設計監査（2026-03-12）

| 観点                 | 内容                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| overdesign 回避      | `SKILL.md` は 488 行で対象外。入口導線まで無理に分割する案は採らない                            |
| scope 正規化         | 既存未タスクの単発 split を、manual docs 34 件 + generated index 1 件の全体 reform へ再統合した |
| generator dependency | `topic-map.md` は docs-only での恒久解消が困難なため blocked dependency とした                  |
| execution result     | Phase 5 で manual docs reform を完了し、Phase 9-12 で blocker と follow-up を formalize した    |
| phase handling       | Phase 1-13 を completed とし、PR #1207 作成結果まで completed workflow へ同期した               |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | completed  |

## 検証導線

- `outputs/phase-1/` から `outputs/phase-12/` までの各成果物
- `artifacts.json`
- `outputs/artifacts.json`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/ui-sanity-visual-review.md`
- `outputs/phase-11/screenshots-app-sanity/phase11-capture-metadata.json`
- `outputs/verification-report.md`
- `docs/30-workflows/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md`
