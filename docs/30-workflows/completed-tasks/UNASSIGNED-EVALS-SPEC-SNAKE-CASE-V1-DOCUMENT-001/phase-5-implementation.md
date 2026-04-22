# Phase 5: 実装

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 5                                                |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク種別 | docs-only / NON_VISUAL                           |
| ステータス | completed                                        |
| 前Phase    | 4                                                |
| 次Phase    | 6                                                |
| 作成日     | 2026-04-21                                       |

## 目的

canonical 正本である `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` に snake_case v1 の不足定義を追記し、その後 mirror を同期する。実装対象はコードではなく仕様本文である。

## 実行タスク

### タスク1: canonical 正本更新

- `levels` を時系列配列として扱わず、レベル番号文字列キーを持つ静的オブジェクトとして記述する
- `skill-fixture-runner` のように `levels` と `average_satisfaction` を保持しないスキルがあることを明記する
- `average_satisfaction` は型 `number` と意味を定義し、観測値 `0` / `4.5` を根拠として示す
- v2 側との関係は比較対象として整理し、1:1 対応や統一方針を断定しない

### タスク2: mirror 同期

- `.claude/skills` を唯一の編集対象とする
- canonical 更新後に `.claude/scripts/sync-skills-mirror.sh` で mirror を同期する
- `.agents` を直接編集対象として扱わない

### タスク3: 変更差分記録

- `outputs/phase-5/spec-addition-result.md` に追加した節、表、注記を要約する
- `outputs/phase-5/section-diff-report.md` に `§3` と変更履歴の差分要約を記録する

## 参照資料

| 資料名                | パス                                                                                                  | 用途                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| canonical 正本        | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                              | 更新対象                                     |
| mirror                | `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md`                              | 同期確認                                     |
| skill-creator EVALS   | `.claude/skills/skill-creator/EVALS.json`                                                             | `levels` / `average_satisfaction=0` の観測   |
| aiworkflow EVALS      | `.claude/skills/aiworkflow-requirements/EVALS.json`                                                   | `levels` / `average_satisfaction=4.5` の観測 |
| fixture runner EVALS  | `.claude/skills/skill-fixture-runner/EVALS.json`                                                      | 非保持ケースの観測                           |
| consumer audit report | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` | consumer 観点の補助                          |
| field map             | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       | フィールド比較の補助                         |

## 実行手順

1. EVALS 実データから `levels` / `average_satisfaction` の事実を再確認する
2. canonical 正本の §3 に不足定義を追記する
3. v2 側との関係は「比較可能だが直接等価ではない」として整理する
4. sync スクリプトで mirror を同期する
5. `spec-addition-result.md` と `section-diff-report.md` を定義する

## 統合テスト連携

- `git diff` で `evals-schema-spec.md` 以外へ意図しない変更がないことを確認する
- sync 後は Phase 6 で `diff -qr` を再確認する

## 多角的チェック観点

- **帰納的思考**: 実 EVALS.json の観測事実から書いているか
- **批判的思考**: `levelHistory` 等価説を無批判に採用していないか
- **システム思考**: canonical 更新と mirror 同期の責務を分離できているか
- **逆説思考**: この task で dialect 統一を始めていないか

## サブタスク管理

| サブタスクID | 内容                 | ステータス |
| ------------ | -------------------- | ---------- |
| ST-5-01      | EVALS 実データ再確認 | pending    |
| ST-5-02      | canonical 正本更新   | pending    |
| ST-5-03      | mirror 同期          | pending    |
| ST-5-04      | 差分記録作成         | pending    |

## 成果物

- `outputs/phase-5/spec-addition-result.md`
- `outputs/phase-5/section-diff-report.md`

## 完了条件

- [ ] `levels` の静的オブジェクト構造が記述されている
- [ ] `average_satisfaction` の意味と観測事実が記述されている
- [ ] 非保持スキルの扱いが記述されている
- [ ] mirror が canonical 追随として同期されている
- [ ] Phase 5 成果物 2 件を定義している

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] canonical と mirror の責務を書き分けた
- [ ] 実データに反する前提を残していない

## 次Phase

Phase 6（テスト拡張）へ進む。
