# spec-extraction-map.md — Phase 1 仕様抽出マップ

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21  
> フェーズ: Phase 1（要件定義）

---

## 1. §3 現状判定表

`evals-schema-spec.md` §3（方言スキーマ / snake_case v1 系）の各項目について判定。

| 項目                                                                                   | 判定     | 現状記述内容                                                      |
| -------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `current_level` の型・意味                                                             | 記述あり | 対照テーブルに「1..4」と記載                                      |
| `metrics.total_usage_count` の型・意味                                                 | 記述あり | 対照テーブルに記載                                                |
| `metrics.success_count` の型・意味                                                     | 記述あり | 対照テーブルに記載                                                |
| `metrics.failure_count` の型・意味                                                     | 記述あり | 対照テーブルに記載                                                |
| `metrics.success_rate` の型・意味                                                      | 記述あり | 対照テーブルに「0..1」と記載                                      |
| `metrics.average_duration` の型・意味                                                  | 記述あり | 対照テーブルに「ms」と記載                                        |
| `metrics.last_evaluated` の型・意味                                                    | 記述あり | 対照テーブルに「ISO-8601」と記載                                  |
| `levels` のデータ構造（オブジェクト vs 配列）                                          | 不完全   | 「配列構造」と記載 — **実態と乖離**（実態はオブジェクト）         |
| `levels.{N}` entry のフィールド一覧（name / description / unlocked / requirements.\*） | 記述なし | エントリ構造の定義なし                                            |
| `levels.{N}` の writer                                                                 | 記述なし | —                                                                 |
| `levels.{N}` の reader                                                                 | 記述なし | —                                                                 |
| 未保持スキルの扱い（`levels` を保持しないスキルが存在）                                | 記述なし | —                                                                 |
| `metrics.average_satisfaction` の型                                                    | 記述なし | §3 テーブルの注記「v1 固有（v2 に対応フィールドなし）」のみ       |
| `metrics.average_satisfaction` の意味（何を集計した値か）                              | 記述なし | —                                                                 |
| `metrics.average_satisfaction` の観測値（0 / 4.5 等）                                  | 記述なし | —                                                                 |
| `metrics.average_satisfaction` の writer                                               | 記述なし | —                                                                 |
| `metrics.average_satisfaction` の reader                                               | 記述なし | —                                                                 |
| `metrics.average_satisfaction` の非保持スキルの扱い                                    | 記述なし | —                                                                 |
| v1 / v2 関係の断定なし・両立スタイル記述                                               | 記述あり | §3.1 で明示                                                       |
| camelCase v2 との対照テーブル（`levelHistory` ⇄ `levels`）                             | 不完全   | 対照テーブルに `levels` 行あり、ただし「配列構造」と誤記          |
| camelCase v2 との対照テーブル（`average_satisfaction` 対応なし）                       | 不完全   | `v1 固有（v2 に対応フィールドなし）` の注記はあるが、詳細定義なし |

---

## 2. 不足フィールドリスト（AC へのマッピング付き）

| No. | 不足項目                                                                                 | 対応 AC | 修正方針                                          |
| --- | ---------------------------------------------------------------------------------------- | ------- | ------------------------------------------------- |
| 1   | `levels` の「配列構造」という誤記 → 「レベル番号文字列キーを持つ静的オブジェクト」に修正 | AC-1    | §3 対照テーブルの `levels` 行の「配列構造」を修正 |
| 2   | `levels.{N}` entry の詳細構造（`name`, `description`, `unlocked`, `requirements.*`）     | AC-1    | §3.4 新設セクションで定義                         |
| 3   | `levels.{N}` の writer / reader                                                          | AC-1    | §3.4 新設セクションで定義                         |
| 4   | `levels` 未保持スキルの扱い                                                              | AC-1    | §3.4 新設セクションで明記                         |
| 5   | `average_satisfaction` の型（number）・観測値（0 / 4.5）                                 | AC-2    | §3.3 新設セクションで定義                         |
| 6   | `average_satisfaction` の意味（満足度スコア集計値）                                      | AC-2    | §3.3 新設セクションで定義                         |
| 7   | `average_satisfaction` の writer / reader                                                | AC-2    | §3.3 新設セクションで定義                         |
| 8   | `average_satisfaction` 未保持スキルの扱い                                                | AC-2    | §3.3 新設セクションで明記                         |
| 9   | v1 固有フィールド完全型テーブル（`levels` / `average_satisfaction` 含む）                | AC-3    | §3.3 で完全型テーブルを拡張                       |
| 10  | v1 / v2 関係を断定なしで整理（`levels` vs `levelHistory` の比較記述）                    | AC-4    | §3.4 で比較記述を追加                             |
| 11  | dual root parity の維持（Phase 5 追記後の同期）                                          | AC-5    | Phase 5 で sync スクリプト実行                    |

---

## 3. 実 EVALS.json から推定した型・値域

### 3.1 `levels` フィールドの実態

| スキル                               | `levels` の構造                                                 | entry フィールド                                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `skill-creator/EVALS.json`           | オブジェクト `{"1": {...}, "2": {...}, "3": {...}, "4": {...}}` | `name`(string), `requirements.min_usage_count`(number), `requirements.min_success_rate`(number)                                             |
| `aiworkflow-requirements/EVALS.json` | オブジェクト `{"1": {...}, "2": {...}, "3": {...}, "4": {...}}` | `name`(string), `description`(string), `unlocked`(boolean), `requirements.min_usage_count`(number), `requirements.min_success_rate`(number) |
| `skill-fixture-runner/EVALS.json`    | **フィールドなし**                                              | —                                                                                                                                           |

- `description` と `unlocked` は一部スキルのみ保持（optional フィールド）
- `requirements.min_usage_count` と `requirements.min_success_rate` は全スキルで保持（required フィールド）

### 3.2 `average_satisfaction` フィールドの実態

| スキル                               | `average_satisfaction` 値 | 備考                                                                  |
| ------------------------------------ | ------------------------- | --------------------------------------------------------------------- |
| `skill-creator/EVALS.json`           | `0`                       | `metrics.average_satisfaction = 0`                                    |
| `aiworkflow-requirements/EVALS.json` | `4.5`                     | `metrics.average_satisfaction = 4.5`                                  |
| `skill-fixture-runner/EVALS.json`    | **フィールドなし**        | metrics は `total_usage_count`, `success_count`, `failure_count` のみ |

- 型: `number`（浮動小数点）
- 観測値: `0`（未評価の場合）、`4.5`（評価済みの場合）
- 固定値域は断定不可（`0` が「未評価」を意味する可能性、最大値が `5.0` である可能性があるが、実データから断定できない）

---

## 4. dual root 現状差分サマリ

```
$ diff .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md \
       .agents/skills/aiworkflow-requirements/references/evals-schema-spec.md
（出力なし）
```

- **差分ゼロ**（parity 保持中）
- Phase 5 の追記後に sync スクリプトで同期し、再度 parity を確認する

---

## 5. Phase 2 への引き渡し事項

- `levels` は配列ではなく「レベル番号文字列キーを持つ静的オブジェクト」として設計する
- `description` と `unlocked` は optional フィールドとして定義する
- `average_satisfaction` の値域は実観測値（`0`, `4.5`）を根拠として示し、グローバル固定値域は断定しない
- `skill-fixture-runner` のような非保持スキルの記述を明示する
