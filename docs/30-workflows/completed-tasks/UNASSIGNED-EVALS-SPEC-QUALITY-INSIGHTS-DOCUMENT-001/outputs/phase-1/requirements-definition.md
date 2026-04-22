# 正本仕様への追記要件定義

> Phase 1 Step 3 成果物
> 作成日: 2026-04-21

## 3-1: 追記対象ファイルの特定

### 調査結果

`evals-schema-spec.md` §6 に `qualityInsights` の定義が**すでに存在**する。ただし記述内容が実際の EVALS.json と一致していない。

### update vs no-op 判定

| 候補ファイル                                                                | 現在の状態                                                                             | 判定       | 対応内容                                                                 |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` §6 | `qualityInsights` 11フィールドが記述されているが、`taskMetrics.*` の構造が実態と不一致 | **update** | §6 の `taskMetrics` サブフィールド定義を実際の EVALS.json に合わせて修正 |
| topic-map                                                                   | `qualityInsights` エントリなし                                                         | **update** | エントリを追記                                                           |
| quick-reference                                                             | `qualityInsights` エントリなし                                                         | **update** | エントリを追記                                                           |

### 具体的な差分

**evals-schema-spec.md §6 が定義する `taskMetrics` サブフィールド（現行・誤り）:**

- `taskMetrics.createdCount`
- `taskMetrics.completedCount`
- `taskMetrics.failedCount`
- `taskMetrics.retriedCount`
- `taskMetrics.cancelRate`
- `taskMetrics.blockedCount`
- `taskMetrics.lastUpdated`

**実際の EVALS.json の `taskMetrics` 構造（正しい）:**

- `taskMetrics.{TASK_ID}.completedPhases`
- `taskMetrics.{TASK_ID}.totalTests`
- `taskMetrics.{TASK_ID}.avgCoverage`
- `taskMetrics.{TASK_ID}.systemSpecsUpdated`
- `taskMetrics.{TASK_ID}.unassignedTasksDetected`

### 修正方針

`evals-schema-spec.md` §6 の `taskMetrics` 記述を実際の EVALS.json に合わせて修正する。
また、writer・運用責任・更新タイミングの記述が不十分なため、これを補強する。

## 3-2: validator 導入要件

### 現状確認

- validator（フィールドの存在・型・値域を検証するスクリプト）は **0件**
- `skill-fixture-runner/scripts/validate-skill-structure.js` は EVALS.json の存在性・JSON parse 可能性のみ対象

### 判定

**保留**: 手動チェックリストで当面の品質確保は可能。ただし以下のリスクがある:

- フィールド定義の silent break（命名変更時の検出遅れ）
- `taskMetrics` の構造ミスが実行時まで検出されない

**将来方針**: validator 実装は `UNASSIGNED-EVALS-VALIDATOR-GUARD-001` で追跡。

### 推奨する validator 設計案（スコープ外・参考）

- 対象: `qualityInsights.patternAdoptionRate`, `coverageTargetHitRate`, `unassignedTaskDetectionRate` の値域（0.0〜1.0）
- 対象: `taskMetrics.{TASK_ID}` エントリの5サブフィールド存在確認
- 実装候補: `task-specification-creator/scripts/validate-evals.js`（新設）

## 3-3: 他スキルへの波及要件

| スキル名                   | qualityInsights 有無 | 展開方針 | 根拠                           |
| -------------------------- | -------------------- | -------- | ------------------------------ |
| task-specification-creator | あり（正本）         | 変更なし | 唯一の有効実装                 |
| skill-creator              | なし                 | opt-in   | 成熟度・usage count が基準未達 |
| aiworkflow-requirements    | なし                 | opt-in   | 同上                           |
| github-issue-manager       | なし                 | opt-in   | 同上                           |
| int-test-skill             | なし                 | opt-in   | 同上                           |
| skill-fixture-runner       | なし                 | opt-in   | 同上                           |

**opt-in 基準**: usage count が 10 以上に達した時点で追加を推奨する（強制しない）。
