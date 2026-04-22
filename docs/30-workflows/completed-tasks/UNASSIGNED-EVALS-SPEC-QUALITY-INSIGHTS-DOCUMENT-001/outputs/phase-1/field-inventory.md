# qualityInsights フィールド棚卸し一覧

> Phase 1 Step 1 成果物
> 作成日: 2026-04-21
> タスクID: UNASSIGNED-EVALS-SPEC-QUALITY-INSIGHTS-DOCUMENT-001

## 調査対象

`.claude/skills/task-specification-creator/EVALS.json` の `qualityInsights` セクション

## P50チェック結果

`evals-schema-spec.md` §6 に `qualityInsights` の定義がすでに存在することを確認した（2026-04-19 作成）。
ただし、仕様書の定義と実際の EVALS.json の構造に**差分**があることを発見した。

### 発見した差分

| 項目                 | evals-schema-spec.md §6 の記述                   | 実際の EVALS.json                                              |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| `taskMetrics` の構造 | flat フィールド（`taskMetrics.createdCount` 等） | タスクIDキー辞書（`taskMetrics.{TASK_ID}.completedPhases` 等） |

この差分が本タスクの主要な修正対象である。

## フィールド棚卸し一覧

### 実際の EVALS.json に基づくフィールド一覧

| フィールド名                                                    | 型                     | 現在値（サンプル） | 現在の定義箇所                                                      |
| --------------------------------------------------------------- | ---------------------- | ------------------ | ------------------------------------------------------------------- |
| `qualityInsights.patternAdoptionRate`                           | number                 | 0.6                | EVALS.json（実装済み）、evals-schema-spec.md §6（定義あり）         |
| `qualityInsights.coverageTargetHitRate`                         | number                 | 0.875              | EVALS.json（実装済み）、evals-schema-spec.md §6（定義あり）         |
| `qualityInsights.unassignedTaskDetectionRate`                   | number                 | 1                  | EVALS.json（実装済み）、evals-schema-spec.md §6（定義あり）         |
| `qualityInsights.notes`                                         | string                 | 長文テキスト       | EVALS.json（実装済み）、evals-schema-spec.md §6（定義あり）         |
| `qualityInsights.taskMetrics`                                   | Record<string, object> | `{TASK_ID: {...}}` | EVALS.json（実装済み）、evals-schema-spec.md §6（**構造が不正確**） |
| `qualityInsights.taskMetrics.{TASK_ID}.completedPhases`         | number                 | 12                 | EVALS.json のみ（spec に記載なし）                                  |
| `qualityInsights.taskMetrics.{TASK_ID}.totalTests`              | number                 | 231, 48 等         | EVALS.json のみ（spec に記載なし）                                  |
| `qualityInsights.taskMetrics.{TASK_ID}.avgCoverage`             | number                 | 85.7, 99.6 等      | EVALS.json のみ（spec に記載なし）                                  |
| `qualityInsights.taskMetrics.{TASK_ID}.systemSpecsUpdated`      | number                 | 7, 14 等           | EVALS.json のみ（spec に記載なし）                                  |
| `qualityInsights.taskMetrics.{TASK_ID}.unassignedTasksDetected` | number                 | 1, 7 等            | EVALS.json のみ（spec に記載なし）                                  |

**合計: 10 フィールド**（`taskMetrics` コンテナ1件 + 4スカラー + 5サブフィールド）

## フィールド数の整合性確認

- 実際の EVALS.json: 10 フィールド（4スカラー + 1コンテナ + 5サブフィールド）
- evals-schema-spec.md §6: 11 フィールドとして記述（flat な `taskMetrics.*` 7フィールド + 4スカラー）
- **差異**: spec の `taskMetrics.*` フィールド群（`createdCount`, `completedCount`, `failedCount`, `retriedCount`, `cancelRate`, `blockedCount`, `lastUpdated`）は**実際の EVALS.json に存在しない**

## 他スキルの qualityInsights 有無確認

| スキル名                   | qualityInsights の有無 |
| -------------------------- | ---------------------- |
| task-specification-creator | **あり**（正本）       |
| skill-creator              | なし                   |
| aiworkflow-requirements    | なし                   |
| github-issue-manager       | なし                   |
| int-test-skill             | なし                   |
| skill-fixture-runner       | なし                   |

## dual root 確認

`.agents/skills/task-specification-creator/EVALS.json` について Phase 9 で確認予定。

## writer 調査（Step 2 への引き継ぎ）

スクリプト調査結果は `writer-survey.md` に記載する。
現時点での把握: scripts/ 配下に qualityInsights を自動更新するスクリプトは確認されていない（手動更新が運用）。
