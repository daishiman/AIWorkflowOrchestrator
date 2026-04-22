# test-scenarios.md — Phase 4 検証シナリオ仕様書

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21  
> フェーズ: Phase 4（テスト作成）

---

## Step 0: Baseline 状態（Phase 5 追記前）

### baseline 確認結果

```
$ rg -n "levels\|average_satisfaction" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
（出力なし）
```

- `levels.{N}` のツリー構造定義: **§3 に存在しない**（baseline 確認）
- `average_satisfaction` の型・範囲・意味定義: **§3 に存在しない**（baseline 確認）

```
$ diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
（出力なし）
```

- `.claude/skills` と `.agents/skills`: **差分ゼロ**（baseline 時点で parity 保持中）

---

## SC-01: `levels.{N}` 構造が §3 に追記されているか検証

**目的**: Phase 5 の追記後、`levels` が静的オブジェクトとして定義され、`levels.{N}` entry の詳細構造が §3 に存在することを確認する

**PASS 条件**:

- `levels.{N}` のツリー構造がテーブル形式または定義ブロックで記述されている
- `levels` が静的オブジェクト（配列ではない）として明記されている
- `requirements.min_usage_count` と `requirements.min_success_rate` が明示されている
- `description` / `unlocked` が optional フィールドとして明示されている
- `levels` を保持しないスキルがあることが記述されている
- §3 内に記述が存在する

**FAIL 条件**:

- `levels.{N}` の定義が §3 に一切存在しない
- `levels` が「配列構造」のまま誤記が残っている
- entry の必須フィールド（`requirements.*`）が記述されていない

---

## SC-02: `average_satisfaction` フィールドが型・範囲・意味を含む形で記述されているか検証

**目的**: Phase 5 の追記後、`average_satisfaction` フィールドが型・観測値・意味を備えた定義として §3 に存在することを確認する

**PASS 条件**:

- `average_satisfaction` が §3 内でフィールド定義として記述されている
- 型（`number` 等）が明記されている
- 観測値として `0` や `4.5` があり得ること、固定値域は断定しないことが定義されている
- 意味（satisfaction スコアの意味論）が記述されている
- v1 固有であることが明記されている

**FAIL 条件**:

- 型・範囲・意味のいずれかが欠けている
- v1 固有である旨の記述がない

---

## SC-03: v2 との対照表（§3 テーブル）が更新されているか検証

**目的**: §3 の camelCase v2 ⇄ snake_case v1 対照テーブルで `levels` 行が「配列構造」から「静的オブジェクト」に修正されていることを確認する

**PASS 条件**:

- §3 対照テーブルの `levels` 行の「配列構造」が「静的オブジェクト」に修正されている
- §3.3 または §3.4 として「v1 固有フィールド定義」セクションが新設されている
- `average_satisfaction` の v2 対応なしが明示されている

**FAIL 条件**:

- `levels` 行が「配列構造」のまま修正されていない
- 新設セクションが存在しない

---

## SC-04: `.claude/skills` と `.agents/skills` の parity 確認

**目的**: Phase 5 の `.claude/skills` 正本更新後に `.agents/skills` への mirror が完了し、両 root が一致していることを確認する

**PASS 条件**:

- `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` の出力が空
- `diff` で `evals-schema-spec.md` の差分が 0 行

**FAIL 条件**:

- `.claude/skills` と `.agents/skills` の内容が一致しない

---

## SC-05: JSON parse 検証

**目的**: `evals-schema-spec.md` の追記に起因する既存 EVALS.json の破損がないことを確認する（docs-only タスクのため EVALS.json 自体に変更はないが念のため確認）

**PASS 条件**:

- 対象 EVALS.json が全て JSON parse 成功
- `git diff` で EVALS.json に変更がないことを確認

**FAIL 条件**:

- JSON parse エラーが発生している

---

## AC 対応マトリクス

| SC    | 対応 AC    | 検証内容                                |
| ----- | ---------- | --------------------------------------- |
| SC-01 | AC-1       | `levels.{N}` 構造・非保持スキルの定義   |
| SC-02 | AC-2       | `average_satisfaction` 型・意味・観測値 |
| SC-03 | AC-3, AC-4 | v2 対照テーブル更新・断定なし方針       |
| SC-04 | AC-5       | dual root parity                        |
| SC-05 | —（回帰）  | EVALS.json 無変更確認                   |
