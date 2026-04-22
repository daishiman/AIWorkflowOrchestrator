# validator 設計案

> Phase 2 Step 3 成果物
> 作成日: 2026-04-21
> **注記: 本ドキュメントは設計案のみ。実装はスコープ外。**

## 現状

- validator（フィールドの存在・型・値域を検証するスクリプト）は **0件**
- `skill-fixture-runner/scripts/validate-skill-structure.js` は EVALS.json の存在性・JSON parse 可能性のみを対象

## validator 設計案（実装はスコープ外）

| 検証項目                                   | 検証方法                                         | 実行タイミング    |
| ------------------------------------------ | ------------------------------------------------ | ----------------- |
| `qualityInsights` セクションの存在確認     | キー存在チェック（`"qualityInsights" in evals`） | EVALS.json 更新後 |
| rate系フィールドの値域確認（0.0〜1.0）     | 数値範囲チェック                                 | EVALS.json 更新後 |
| `taskMetrics` 配下の必須サブフィールド確認 | 各エントリに5サブフィールドが存在するかチェック  | EVALS.json 更新後 |
| `notes` の型確認（string）                 | typeof チェック                                  | EVALS.json 更新後 |
| `taskMetrics.{TASK_ID}.avgCoverage` の値域 | 0.0〜100.0 の数値チェック                        | EVALS.json 更新後 |

## 実装アプローチ候補

1. **JSON Schema**: `EVALS.json` 全体に対してJSON Schemaを定義し、`ajv` 等で検証する
2. **custom script**: `validate-evals.js` を `.claude/skills/task-specification-creator/scripts/` に追加する
3. **既存validator拡張**: `validate-skill-structure.js`（`skill-fixture-runner`）の拡張として実装する

## 実装タスクへの引き継ぎ情報

- 追跡タスク: `UNASSIGNED-EVALS-VALIDATOR-GUARD-001`
- 候補ファイル: `task-specification-creator/scripts/validate-evals.js`（新設）
- 優先度: 中（validator=0件の silent break リスクあり）
- silent break の主要リスク3点:
  1. rate 系フィールドの値域逸脱（0.0〜1.0 を超える値）
  2. `taskMetrics` 配下の必須サブフィールド欠落
  3. フィールド型の不整合（例: `notes` が string でない）
