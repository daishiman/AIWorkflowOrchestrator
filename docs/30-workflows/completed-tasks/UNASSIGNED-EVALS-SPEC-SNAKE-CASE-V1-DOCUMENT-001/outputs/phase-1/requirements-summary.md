# requirements-summary.md — Phase 1 要件サマリ

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21  
> フェーズ: Phase 1（要件定義）

---

## 1. 追記すべき内容の要件（AC-1〜AC-5 の詳細）

### AC-1: `levels` 静的オブジェクト構造の定義

**要件内容**:

- `levels` フィールドが「レベル番号文字列キーを持つ静的オブジェクト」であることを明記する
- §3 対照テーブルの「配列構造」という誤記を修正する
- §3.4 として新設セクションに `levels.{N}` entry の詳細構造を定義する

**entry の詳細構造（実 EVALS.json から）**:

| フィールド                      | 型      | 必須/任意 | 根拠                                                           |
| ------------------------------- | ------- | --------- | -------------------------------------------------------------- |
| `{N}` (キー)                    | string  | required  | レベル番号（"1", "2", "3", "4"）                               |
| `name`                          | string  | required  | skill-creator / aiworkflow-requirements 両方で保持             |
| `description`                   | string  | optional  | aiworkflow-requirements のみ保持、skill-creator には存在しない |
| `unlocked`                      | boolean | optional  | aiworkflow-requirements のみ保持                               |
| `requirements.min_usage_count`  | number  | required  | 両スキルで保持                                                 |
| `requirements.min_success_rate` | number  | required  | 両スキルで保持                                                 |

**非保持スキル**: `skill-fixture-runner` は `levels` を持たない。非保持スキルに対してはフィールド自体が存在しないことを明記する。

**writer / reader**:

- writer: `log_usage.js`（各スキルの scripts/ 配下）— `init_skill.js` が初期値を生成
- reader: `select_skill.js`（スキル選定スコアリング）

---

### AC-2: `average_satisfaction` の型・意味・観測値の定義

**要件内容**:

- §3.3 として新設セクションに `average_satisfaction` の独立定義を置く
- 型: `number`（浮動小数点）
- 観測値: `0`（skill-creator、未評価を示す可能性）、`4.5`（aiworkflow-requirements、高評価を示す可能性）
- 意味: タスク実行に対するユーザー満足度スコアの集計値（推定）— 意味の確定情報は実データから判別不能なため「推定」として記載する
- v1 固有であることを明記する（v2 に対応フィールドなし）

**非保持スキル**: `skill-fixture-runner` は `average_satisfaction` を持たない。

**writer / reader**:

- writer: `log_usage.js` / `collect_feedback.js`（各スキルの scripts/ 配下）
- reader: 現行 consumer なし（consumer audit では read 0 件）

---

### AC-3: v1 固有フィールドの完全型テーブル

**要件内容**:

- §3 対照テーブルに `levels.{N}` と `average_satisfaction` の行を追加する（または更新する）
- 対照テーブルの `levels` 行の「配列構造」を「静的オブジェクト」に修正する
- `average_satisfaction` の v2 対応なしを明記する

---

### AC-4: v1 / v2 関係の断定なし・両立スタイル記述

**要件内容**:

- §3.1 の「断定しない」方針を変更せず維持する
- `levels` と `levelHistory` の比較では「意味論的に比較可能だが 1:1 等価は断定しない」形で記述する
- 具体的な文言例: 「`levelHistory`（camelCase v2）は `levels`（snake_case v1）と意味論的に比較可能だが、フィールド構造・writer・使用コンテキストが異なる可能性があるため直接等価とはみなさない」

---

### AC-5: dual root parity 維持

**要件内容**:

- Phase 5 で `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` に追記した後、`sync-skills-mirror.sh` を実行して `.agents` 側を同期する
- `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` でゼロ差分を確認する

---

## 2. camelCase v2 との関係記述の方針

- **断定禁止**: 「v1 が正しい」「v2 が正しい」という断定表現を使用しない
- **両立スタイル**: v1 固有フィールド（`levels`, `average_satisfaction`）は「v1 に固有」であることを事実として記述し、v2 批判の文脈には置かない
- **比較可能性の記述**: `levelHistory` との比較は「比較対象として整理する」にとどめ、等価断定は行わない
- **根拠**: `design-docs/phase-2-scope-architecture.md` §3.1 の dual root 正本断定禁止方針

---

## 3. dual root 現在の差分状況サマリ

- 現状: **差分ゼロ**（parity 保持中）
- 確認コマンド: `diff .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md .agents/skills/aiworkflow-requirements/references/evals-schema-spec.md`
- Phase 5 追記後の対応: `sync-skills-mirror.sh` で同期 → `diff -qr` で再確認

---

## 4. Phase 2 で決定すべき事項 vs Phase 5 で記述すべき内容

| 区分                   | 内容                                                                   |
| ---------------------- | ---------------------------------------------------------------------- |
| **Phase 2 設計で決定** | §3.3 / §3.4 の新設セクション構成、各フィールドの型テーブル形式、文言案 |
| **Phase 5 実装で記述** | `evals-schema-spec.md` §3 への実際の追記、`sync-skills-mirror.sh` 実行 |
