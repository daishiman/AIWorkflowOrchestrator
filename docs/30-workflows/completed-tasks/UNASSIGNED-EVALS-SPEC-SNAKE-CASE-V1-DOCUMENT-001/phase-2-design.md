# Phase 2: 設計（snake_case v1 スキーマ追記設計）

## メタ情報

| 項目       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| Phase      | 2                                                                               |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001                                |
| タスク種別 | NON_VISUAL / docs-only                                                          |
| ステータス | completed                                                                       |
| 前提Phase  | Phase 1（要件定義）                                                             |
| 後続Phase  | Phase 3（設計レビュー）                                                         |
| 入力       | outputs/phase-1/requirements-summary.md, outputs/phase-1/spec-extraction-map.md |
| 作成日     | 2026-04-21                                                                      |

## 目的

Phase 1 で確定した不足フィールドリストを入力として、`evals-schema-spec.md` §3 に追記すべき内容を設計する。実際の追記（Phase 5）の前に、設計レベルで内容を確定しレビューに備える。

具体的には以下を達成する。

- `levels.{N}` ツリー構造の型・意味・writer/reader の設計
- `average_satisfaction` フィールドの型・範囲・意味・writer/reader の設計
- v1 固有フィールドの完全型テーブルの設計（camelCase 対応なしのフィールドを含む）
- camelCase v2 との関係記述の文言設計（断定なし / 両立スタイル）
- dual root 反映方法の設計（`.claude/skills` → `.agents/skills` の同期手順）

## 実行タスク

### Step 1: `levels.{N}` ツリー構造の設計

Phase 1 の `spec-extraction-map.md` と実 EVALS.json の型推定結果を入力として、以下を設計する。

#### 設計項目

- `levels` フィールド全体の型（レベル番号文字列キーを持つ object か、未保持か）
- 各 entry のフィールド一覧
  - `name`: string
  - `description`: string（存在する場合）
  - `unlocked`: boolean（存在する場合）
  - `requirements.min_usage_count`: number
  - `requirements.min_success_rate`: number
- entry の意味（静的レベル定義としての位置づけ）
- writer: どのスクリプト / 処理が `levels` を更新するか
- reader: どの consumer が `levels` を参照するか
- `levelHistory`（camelCase v2）との比較関係（同等ではなく、比較対象として扱う）

#### 設計制約

- camelCase v2 との比較は行うが、1:1 対応や意味的等価性は断定しない
- entry 構造に揺れがある場合は「既知の揺れ」として記録し、統一は後続タスクに委ねる

### Step 2: `average_satisfaction` フィールドの設計

Phase 1 の型推定結果を入力として、以下を設計する。

#### 設計項目

- 型: number（浮動小数点）
- 値域: 実 EVALS.json の観測値を記録し、グローバル固定値域は断定しない
- 意味: 何の満足度を集計した値か（タスク実行品質 / ユーザー評価 / 内部スコア等）
- writer: どのスクリプト / 処理が `average_satisfaction` を更新するか
- reader: どの consumer が `average_satisfaction` を参照するか
- camelCase v2 との対応: v2 に対応フィールドなし（v1 固有）であることを明記

#### 設計制約

- v2 に対応フィールドがない旨を明記するが、「v1 が独自機能を持つ」という断定は避ける
- 意味が実 EVALS.json から判別不能な場合は「推定」として記載し、確定情報との区別を明確にする

### Step 3: v1 固有フィールドの完全型テーブルの設計

Phase 1 の不足リストを入力として、v1 固有フィールドの完全型テーブルを設計する。

#### テーブル構成（設計案）

camelCase v2 との対照表（既存）に加え、v1 独自の型テーブルを新設する。

| フィールド                     | 型     | 範囲 / 形式  | 意味                          | 主 writer          | 主 reader                 |
| ------------------------------ | ------ | ------------ | ----------------------------- | ------------------ | ------------------------- |
| `current_level`                | number | 1..4         | 現在レベル                    | log_usage（v1 系） | select_skill（v1 対応部） |
| `metrics.total_usage_count`    | number | 0以上        | 累計使用回数                  | log_usage（v1 系） | select_skill              |
| `metrics.success_count`        | number | 0以上        | 成功回数                      | log_usage（v1 系） | select_skill              |
| `metrics.failure_count`        | number | 0以上        | 失敗回数                      | log_usage（v1 系） | select_skill              |
| `metrics.success_rate`         | number | 0..1         | 成功率                        | log_usage（v1 系） | select_skill              |
| `metrics.average_duration`     | number | 0以上（ms）  | 平均実行時間                  | log_usage（v1 系） | select_skill              |
| `metrics.last_evaluated`       | string | ISO-8601     | 最終評価日時                  | log_usage（v1 系） | select_skill              |
| `metrics.average_satisfaction` | number | Phase 1 確認 | （Phase 1 で確定）            | （Phase 1 で確定） | （Phase 1 で確定）        |
| `levels`                       | array  | entry[]      | レベル変動履歴（v1 固有形式） | log_usage（v1 系） | select_skill / analytics  |

※ `average_satisfaction` の型・範囲・意味・writer/reader は Phase 1 の実値確認後に確定する。

### Step 4: camelCase v2 との関係記述の設計

#### 記述方針

- 対照表（既存 §3 冒頭の表）は現状維持し、情報を補完する形で追記する
- 新設セクション `§3.3 v1 固有フィールド完全定義` を設け、完全型テーブルを配置する
- 新設セクション `§3.4 levels フィールドの構造` を設け、`levels.{N}` ツリー構造を定義する
- `§3.1 どちらが正本か` の既存記述（「断定しない」方針）は変更せず、整合性を確保する
- `§3.2 方言検出・移行時の注意点` も既存記述を維持する

#### 文言の設計制約

- 「v1 が正しい」「v2 が正しい」という断定的な表現を使用しない
- 「v1 固有」は事実の記述であり、v2 の欠如を批判する意図はないことを文脈で明確にする
- 両立スタイルの具体例: 「v2 の `levelHistory` に意味論的に等価な v1 固有フィールドである」

### Step 5: dual root 反映方法の設計

Phase 5（実装）で使用する dual root 反映手順を設計する。

#### 反映手順の設計

1. `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` に追記する
2. 追記後の内容を `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md` に同一内容でコピーする
3. `diff` コマンドで両ファイルの差分が 0 件であることを確認する

```bash
# 差分確認コマンド（Phase 5 実行時に使用）
diff \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md \
  .agents/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

4. 両ファイルを同一 commit に含める

## 参照資料

| 資料名                               | パス                                                                                                        | 用途                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件サマリ                   | `outputs/phase-1/requirements-summary.md`                                                                   | 設計の入力                   |
| Phase 1 仕様抽出マップ               | `outputs/phase-1/spec-extraction-map.md`                                                                    | 不足フィールドリストの参照   |
| EVALS スキーマ正本（canonical root） | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                                    | 既存 §3 の構造確認           |
| EVALS 消費者監査教訓                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-evals-consumer-audit-001.md`             | 既知問題・教訓の参照         |
| evals-field-map.md                   | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`             | フィールド突合の参照         |
| consumer-audit-report.md             | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md`       | writer/reader の確認         |
| scope-architecture §3.1              | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` §3.1 | dual root 断定禁止方針の確認 |

## 実行手順

1. Phase 1 の `requirements-summary.md` と `spec-extraction-map.md` を読み込む
2. Step 1〜3 の設計項目を埋め、`schema-addition-design.md` を作成する
3. v1 固有フィールドの完全型テーブルを `field-definition-draft.md` に記述する
4. camelCase v2 との関係記述の文言案を `schema-addition-design.md` に記述する
5. dual root 反映手順を `schema-addition-design.md` に記述する
6. Phase 3 レビューで確認すべき観点を `schema-addition-design.md` の末尾に記述する

## 統合テスト連携

Phase 2 は設計フェーズであるため、ドキュメントへの実際の追記は行わない。

既存スキーマとの整合確認：

- 設計した追記内容が `evals-schema-spec.md` §2（camelCase v2）の記述と矛盾しないか確認する
- 設計した `§3.1 どちらが正本か` の扱いが `docs/30-workflows/completed-tasks/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` §3.1 と整合しているか確認する
- `field-definition-draft.md` の writer/reader 定義が `consumer-audit-report.md` と整合しているか確認する

## 多角的チェック観点

- **型の一貫性**: 設計した型テーブルが実 EVALS.json の実値と矛盾していないか
- **断定禁止方針の遵守**: 設計した文言が「どちらが正本か」を断定していないか
- **網羅性**: Phase 1 の不足フィールドリストが設計に全て含まれているか
- **後続タスクとの境界**: 設計内容が `UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` の担当範囲を侵食していないか（定義のみ行い、統一・移行は行わない）
- **consumer との整合**: 設計した writer/reader 定義が `consumer-audit-report.md` の consumer 一覧と矛盾していないか

## サブタスク管理

| サブタスクID | 内容                                    | 担当Step |
| ------------ | --------------------------------------- | -------- |
| ST-2-01      | `levels.{N}` ツリー構造の設計           | Step 1   |
| ST-2-02      | `average_satisfaction` フィールドの設計 | Step 2   |
| ST-2-03      | v1 固有フィールド完全型テーブルの設計   | Step 3   |
| ST-2-04      | camelCase v2 との関係記述の文言設計     | Step 4   |
| ST-2-05      | dual root 反映手順の設計                | Step 5   |

## 成果物

- `outputs/phase-2/schema-addition-design.md`
  - §3 への追記内容の全体設計
  - 新設セクション構成（§3.3 / §3.4）の設計
  - camelCase v2 との関係記述の文言案
  - dual root 反映手順
  - Phase 3 レビューで確認すべき観点リスト
- `outputs/phase-2/field-definition-draft.md`
  - v1 固有フィールドの完全型テーブル（下書き）
  - `levels.{N}` ツリー構造の定義（下書き）
  - `average_satisfaction` の型・範囲・意味・writer/reader の定義（下書き）

## 完了条件

- [ ] `levels.{N}` ツリー構造の型・意味・writer/reader が設計されている
- [ ] `average_satisfaction` の型・範囲・意味・writer/reader が設計されている
- [ ] v1 固有フィールドの完全型テーブルが `field-definition-draft.md` に記述されている
- [ ] camelCase v2 との関係記述の文言案が設計されている（断定なし / 両立スタイル）
- [ ] dual root 反映手順が設計されている
- [ ] 設計内容が Phase 1 の AC-1〜AC-5 を全てカバーしている

## タスク100%実行確認【必須】

以下を順番に確認すること:

1. `field-definition-draft.md` に Phase 1 の不足フィールドリストの全項目が含まれているか
2. `levels.{N}` の entry 構造が実 EVALS.json の実値に基づいて設計されているか
3. `average_satisfaction` の値域が実値から推定されており、根拠が記録されているか
4. 設計した文言に「どちらが正本か」を断定する表現が含まれていないか
5. dual root 反映手順に `diff` による検証が含まれているか

## 次Phase

Phase 3（設計レビュー）へ進む。`schema-addition-design.md` と `field-definition-draft.md` を入力として、設計の妥当性をレビューし Phase 4 への進行可否を判定する。
