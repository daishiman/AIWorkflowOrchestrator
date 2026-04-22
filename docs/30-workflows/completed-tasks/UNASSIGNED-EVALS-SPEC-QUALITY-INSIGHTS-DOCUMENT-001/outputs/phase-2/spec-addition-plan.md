# 正本仕様への追記計画

> Phase 2 Step 4-5 成果物
> 作成日: 2026-04-21

## 追記候補ファイルの評価

| 候補ファイル                                                                | 評価                                                                            | 採用/却下          |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------ |
| `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` §6 | qualityInsights の定義がすでに存在する。ただし `taskMetrics` 構造が実態と不一致 | **採用（update）** |
| `indexes/topic-map.md`                                                      | qualityInsights エントリなし                                                    | **採用（追記）**   |
| `indexes/quick-reference.md`                                                | qualityInsights エントリなし                                                    | **採用（追記）**   |

## evals-schema-spec.md §6 修正内容

### 修正対象

§6 の `taskMetrics.*` フィールド定義部分（現行は実態と乖離している flat 構造）

### 修正後の内容テンプレート

```markdown
## 6. qualityInsights（拡張メトリクス / writer=手動メンテ）

`task-specification-creator/EVALS.json` の `qualityInsights.*` は、自動計装ではなく
**運用担当が手動でメンテする品質 KPI 集合**である。writer は手動、reader は現状 0 件
（将来、`select_skill.js` 等が消費する設計）。

| フィールド                                                      | 型                     | 意味                                                       |
| --------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------- |
| `qualityInsights.patternAdoptionRate`                           | number (0.0〜1.0)      | parent-skill pattern の採用率                              |
| `qualityInsights.coverageTargetHitRate`                         | number (0.0〜1.0)      | coverage target 達成率                                     |
| `qualityInsights.unassignedTaskDetectionRate`                   | number (0.0〜1.0)      | 未タスク検出率（Phase 12 Task 4 件数 / 全 Phase 発見件数） |
| `qualityInsights.notes`                                         | string                 | 運用者メモ                                                 |
| `qualityInsights.taskMetrics`                                   | Record<string, object> | 完了タスクIDをキーとした詳細メトリクス辞書                 |
| `qualityInsights.taskMetrics.{TASK_ID}.completedPhases`         | number (整数)          | そのタスクで完了した Phase 数                              |
| `qualityInsights.taskMetrics.{TASK_ID}.totalTests`              | number (整数)          | 総テスト数（docs-only: 0 を記録）                          |
| `qualityInsights.taskMetrics.{TASK_ID}.avgCoverage`             | number (0.0〜100.0)    | 平均コードカバレッジ（%）（docs-only: 0 を記録）           |
| `qualityInsights.taskMetrics.{TASK_ID}.systemSpecsUpdated`      | number (整数)          | 更新したシステム仕様書数                                   |
| `qualityInsights.taskMetrics.{TASK_ID}.unassignedTasksDetected` | number (整数)          | Phase 12 で検出した未タスク数                              |

### 6.1 運用ルール

- writer: Phase 12 closeout を実行する担当者（人間）
- 更新タイミング: 各タスクの Phase 12 closeout 時
- 運用責任: タスク担当者
- 手動更新時は commit メッセージに `chore(evals): qualityInsights update` を付与する
- validator 化は UNASSIGNED-EVALS-VALIDATOR-GUARD-001 の設計検討後に実施する
- reader 0 件である状態も「既知の制約」として §7 に明記
```

## topic-map への追記内容

```markdown
- qualityInsights（品質インサイト / writer=手動メンテ）: `evals-schema-spec.md#qualityInsights`
  - 10フィールド: patternAdoptionRate / coverageTargetHitRate / unassignedTaskDetectionRate /
    notes / taskMetrics.{TASK_ID}.completedPhases / totalTests / avgCoverage /
    systemSpecsUpdated / unassignedTasksDetected
  - writer: Phase 12 実行者（手動）/ reader: 0件（将来用）
```

## quick-reference への追記内容

```markdown
| qualityInsights | 品質インサイト（10フィールド / writer=手動）| `evals-schema-spec.md` §6 |
```

## 他スキルへの展開方針

| スキル名                   | qualityInsights の有無 | 展開方針                                                 |
| -------------------------- | ---------------------- | -------------------------------------------------------- |
| task-specification-creator | あり（正本）           | 変更なし。仕様定義の対象とする                           |
| skill-creator              | なし（現時点）         | opt-in: usage count が10以上に達した時点で追加を推奨する |
| aiworkflow-requirements    | なし（現時点）         | opt-in: 同上                                             |
| github-issue-manager       | なし（現時点）         | opt-in: 同上                                             |
| int-test-skill             | なし（現時点）         | opt-in: 同上                                             |
| skill-fixture-runner       | なし（現時点）         | opt-in: 同上                                             |

展開方針: **opt-in** を採用する。理由:

- 各スキルの成熟度・usage count に応じて追加タイミングが異なるため、強制展開は適切でない
- `task-specification-creator` が唯一の有効サンプルであり、他スキルへの追加は本仕様書を参照して手動追加する

## dual root 追記方針

- 正本への追記後、`.agents/skills/` 配下に同一内容を同期する
- 対象: `evals-schema-spec.md`（`aiworkflow-requirements` の references/）
- 確認コマンド: `diff -qr .claude/skills/ .agents/skills/`
