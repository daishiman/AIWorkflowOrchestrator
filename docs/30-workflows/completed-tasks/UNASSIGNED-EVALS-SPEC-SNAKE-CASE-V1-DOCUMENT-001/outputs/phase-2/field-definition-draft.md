# field-definition-draft.md — v1 固有フィールド完全型テーブル（下書き）

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21  
> フェーズ: Phase 2（設計）  
> 入力: outputs/phase-1/requirements-summary.md, outputs/phase-1/spec-extraction-map.md

---

## 1. v1 固有フィールド完全型テーブル（§3.3 追加候補）

| フィールド                     | 型     | 範囲 / 形式                              | 必須/任意 | 意味                                        | 主 writer                         | 主 reader                  |
| ------------------------------ | ------ | ---------------------------------------- | --------- | ------------------------------------------- | --------------------------------- | -------------------------- |
| `current_level`                | number | 1..4                                     | required  | 現在レベル                                  | log_usage（v1 系）                | select_skill（v1 対応部）  |
| `metrics.total_usage_count`    | number | 0 以上                                   | required  | 累計使用回数                                | log_usage（v1 系）                | select_skill               |
| `metrics.success_count`        | number | 0 以上                                   | required  | 成功回数                                    | log_usage（v1 系）                | select_skill               |
| `metrics.failure_count`        | number | 0 以上                                   | required  | 失敗回数                                    | log_usage（v1 系）                | select_skill               |
| `metrics.success_rate`         | number | 0..1                                     | required  | 成功率                                      | log_usage（v1 系）                | select_skill               |
| `metrics.average_duration`     | number | 0 以上（ms）                             | required  | 平均実行時間                                | log_usage（v1 系）                | select_skill               |
| `metrics.last_evaluated`       | string | ISO-8601                                 | required  | 最終評価日時                                | log_usage（v1 系）                | select_skill               |
| `metrics.average_satisfaction` | number | 観測値: 0, 4.5（固定値域断定不可）       | optional  | 満足度スコア集計値（推定）— v1 固有         | なし（現行 write 実装なし）       | なし（現行 read 実装なし） |
| `levels`                       | object | `{"{N}": LevelEntry}` 形式のオブジェクト | optional  | レベル定義の静的オブジェクト（v1 固有形式） | init_skill（初期化時）/ log_usage | select_skill / analytics   |

> ※ `average_satisfaction` の意味は実データから確定できないため「推定」として記載。

---

## 2. `levels.{N}` ツリー構造定義（§3.4 追加候補）

### 2.1 `levels` フィールド全体の型

`levels` は**レベル番号文字列キーを持つ静的オブジェクト**である。

```json
{
  "levels": {
    "1": { ... },
    "2": { ... },
    "3": { ... },
    "4": { ... }
  }
}
```

- §3 対照テーブルの「配列構造」は誤りであり、「静的オブジェクト」に修正する
- `levelHistory`（camelCase v2）はレベル変動履歴の配列であり、`levels`（静的定義オブジェクト）とは用途・構造が異なる（比較可能だが 1:1 等価とは断定しない）

### 2.2 `LevelEntry` 型定義

| フィールド                      | 型      | 必須/任意 | 根拠（実 EVALS.json）                              |
| ------------------------------- | ------- | --------- | -------------------------------------------------- |
| `name`                          | string  | required  | skill-creator / aiworkflow-requirements 両方で保持 |
| `description`                   | string  | optional  | aiworkflow-requirements のみ保持                   |
| `unlocked`                      | boolean | optional  | aiworkflow-requirements のみ保持                   |
| `requirements.min_usage_count`  | number  | required  | 両スキルで保持                                     |
| `requirements.min_success_rate` | number  | required  | 両スキルで保持（0..1 範囲）                        |

### 2.3 実例（skill-creator パターン）

```json
"levels": {
  "1": { "name": "Beginner", "requirements": { "min_usage_count": 0, "min_success_rate": 0 } },
  "2": { "name": "Intermediate", "requirements": { "min_usage_count": 5, "min_success_rate": 0.6 } }
}
```

### 2.4 実例（aiworkflow-requirements パターン：description / unlocked 保持）

```json
"levels": {
  "1": { "name": "Novice", "description": "基本的な仕様検索と参照", "unlocked": true, "requirements": { "min_usage_count": 0, "min_success_rate": 0 } },
  "4": { "name": "Master", "description": "仕様体系設計と品質管理", "unlocked": false, "requirements": { "min_usage_count": 50, "min_success_rate": 0.9 } }
}
```

### 2.5 非保持スキル

`skill-fixture-runner` は `levels` フィールドを持たない。非保持スキルでは `levels` キー自体が存在しない（`null` や空オブジェクトではなく、キー不存在）。

### 2.6 writer / reader

- writer: `init_skill.js`（初期化時に静的定義として設定）/ `log_usage.js`（更新）
- reader: `select_skill.js`（レベル昇格判定）/ analytics 処理

---

## 3. `average_satisfaction` 独立定義（§3.3 追加候補）

### 3.1 フィールド定義

| 項目           | 内容                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| フィールドパス | `metrics.average_satisfaction`                                                |
| 型             | `number`（浮動小数点）                                                        |
| 観測値         | `0`（skill-creator）、`4.5`（aiworkflow-requirements）                        |
| 値域           | 固定値域は断定しない（観測値から推定：0 以上、上限不明）                      |
| 意味           | 満足度スコアの集計値（推定）— 実データから意味を確定することは困難            |
| v1 固有        | **v2 に対応フィールドなし**（v2 の `metrics.averageSatisfaction` 等は未確認） |
| writer         | なし（consumer audit 時点で write 0 件。JSON 上に残存）                       |
| reader         | なし（consumer audit 時点で read 0 件）                                       |
| 必須/任意      | optional（`skill-fixture-runner` は保持しない）                               |

### 3.2 非保持スキル

`skill-fixture-runner` の `metrics` には `total_usage_count`, `success_count`, `failure_count` のみが存在し、`average_satisfaction` フィールドは存在しない。

---

## 4. camelCase v2 との関係記述（文言案）

### 方針

- `levels` と `levelHistory` の比較: 「意味論的に比較可能だが、構造・用途・writer が異なるため 1:1 等価とは断定しない」
- `average_satisfaction` の v2 対応: 「v2 スキーマには対応フィールドが現時点では確認されていない。v1 固有フィールドとして扱う」
- 断定禁止: 「v1 が正しい」「v2 が正しい」という表現を使用しない

### §3.4 追記文言案

> `levelHistory`（camelCase v2）は `levels`（snake_case v1）と意味論的に比較可能だが、v2 の `levelHistory` は配列型のレベル変動履歴であり、v1 の `levels` は静的オブジェクト（レベル番号キー付き）である。両者は構造・用途・writer コンテキストが異なるため、直接等価とはみなさない。

---

## 5. dual root 反映手順（Phase 5 向け設計）

1. `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` に追記する（唯一の編集対象）
2. 追記後に `sync-skills-mirror.sh` を実行して `.agents/skills` 側を同期する
3. `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` でゼロ差分を確認する

```bash
# Phase 5 実行時に使用する確認コマンド
diff .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md \
     .agents/skills/aiworkflow-requirements/references/evals-schema-spec.md
```
