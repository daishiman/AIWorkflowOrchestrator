# schema-addition-design.md — §3 追記内容の全体設計

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21  
> フェーズ: Phase 2（設計）

---

## 1. §3 への追記内容の全体設計

### 1.1 変更方針

- **誤記修正**: §3 対照テーブルの `levels` 行「配列構造」→「静的オブジェクト」
- **新設 §3.3**: v1 固有フィールド完全定義（`average_satisfaction` の独立セクション）
- **新設 §3.4**: `levels` フィールドの構造（`levels.{N}` ツリー構造定義）
- **既存 §3.1 / §3.2**: 変更なし（断定なし方針・NaN 伝播リスク記述を維持）

### 1.2 新設セクション構成

```
## 3. 方言スキーマ（snake_case v1 系）
  [既存テーブル — levels 行の「配列構造」を「静的オブジェクト」に修正]
  ### 3.1 どちらが正本か  [変更なし]
  ### 3.2 方言検出・移行時の注意点  [変更なし]
  ### 3.3 v1 固有フィールド完全定義  [新設]
  ### 3.4 levels フィールドの構造  [新設]
```

---

## 2. §3.3 v1 固有フィールド完全定義（設計案）

### 追記内容

v1 系固有フィールドのうち §3 対照テーブルで詳細が未定義のフィールドを完全型テーブルで補完する。

**`metrics.average_satisfaction`**:

| 項目      | 内容                                                   |
| --------- | ------------------------------------------------------ |
| 型        | `number`（浮動小数点）                                 |
| 観測値    | `0`（skill-creator）、`4.5`（aiworkflow-requirements） |
| 値域      | 固定値域は断定しない                                   |
| 意味      | 満足度スコアの集計値（推定）                           |
| v1 固有   | v2 に対応フィールドは現時点で確認されていない          |
| writer    | なし（現行 script 側 write 実装なし）                  |
| reader    | なし（現行 script 側 read 実装なし）                   |
| 必須/任意 | optional（非保持スキルあり）                           |

---

## 3. §3.4 levels フィールドの構造（設計案）

### 追記内容

**`levels` フィールド全体の型**:

- レベル番号文字列キーを持つ静的オブジェクト（配列ではない）
- 非保持スキル（例: `skill-fixture-runner`）はキー自体が存在しない

**`LevelEntry` 型定義**:

| フィールド                      | 型             | 必須/任意 |
| ------------------------------- | -------------- | --------- |
| `name`                          | string         | required  |
| `description`                   | string         | optional  |
| `unlocked`                      | boolean        | optional  |
| `requirements.min_usage_count`  | number         | required  |
| `requirements.min_success_rate` | number（0..1） | required  |

**writer / reader**:

- writer: `init_skill.js`（初期化）/ `log_usage.js`（更新）
- reader: `select_skill.js`（昇格判定）

**`levelHistory`（v2）との比較**:

`levelHistory`（camelCase v2）は配列型のレベル変動履歴。`levels`（snake_case v1）は静的オブジェクト。両者は意味論的に比較可能だが、構造・用途が異なるため直接等価とはみなさない。

---

## 4. dual root 反映手順

1. `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` のみを編集
2. `sync-skills-mirror.sh` を実行して `.agents` 側を同期
3. `diff -qr` でゼロ差分を確認

---

## 5. Phase 3 レビューで確認すべき観点

1. **AC カバレッジ**: AC-1〜AC-5 が設計に全て含まれているか
2. **断定なし方針**: `levelHistory` / `levels` 比較で等価断定を行っていないか
3. **根拠の実データ依存**: `average_satisfaction` の値域が実観測値に基づいているか
4. **後続タスク境界**: dialect 統一・validator 実装の設計が含まれていないか
5. **parity 手順**: Phase 5 の dual root 同期手順に `diff` 検証が含まれているか
