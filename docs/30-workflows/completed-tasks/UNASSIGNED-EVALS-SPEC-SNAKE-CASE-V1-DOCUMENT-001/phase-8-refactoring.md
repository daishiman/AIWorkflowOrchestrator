# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 8                                                |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001 |
| タスク種別 | docs-only / NON_VISUAL                           |
| ステータス | completed                                        |
| 前Phase    | 7                                                |
| 次Phase    | 9                                                |
| 作成日     | 2026-04-21                                       |

## 目的

Phase 5〜7 で固めた内容を、冗長・重複・断定表現のない形へ整える。

## 実行タスク

### タスク1: 冗長記述整理

- 同じ説明の重複を削る
- 実データ事実と推測を分離する

### タスク2: 表現統一

- `levels`、`average_satisfaction`、canonical、mirror の用語を統一する
- v1 / v2 関係の表現を断定なしにそろえる

### タスク3: refactor log 作成

- `outputs/phase-8/refactor-decision-log.md` に整理前後の要点を書く

## 参照資料

| 資料名         | パス                                                                     | 用途             |
| -------------- | ------------------------------------------------------------------------ | ---------------- |
| Phase 5 結果   | `outputs/phase-5/spec-addition-result.md`                                | 元の追記内容     |
| Phase 6 結果   | `outputs/phase-6/consumer-impact-note.md`                                | 実データ整合結果 |
| Phase 7 結果   | `outputs/phase-7/coverage-report.md`                                     | AC 充足結果      |
| canonical 正本 | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` | 整理対象         |

## 実行手順

1. Phase 5〜7 の成果物を読む
2. 冗長記述と断定表現を整理する
3. `refactor-decision-log.md` を定義する

## 統合テスト連携

- ここでは内容整理だけを行い、意味変更を入れない
- parity は Phase 9 で再確認する

## 多角的チェック観点

- **改善思考**: 読みやすさが上がっているか
- **抽象化思考**: 不要な細部を残しすぎていないか
- **トレードオン思考**: 情報量を落とさず簡潔化できているか

## サブタスク管理

| サブタスクID | 内容              | ステータス |
| ------------ | ----------------- | ---------- |
| ST-8-01      | 冗長記述整理      | pending    |
| ST-8-02      | 表現統一          | pending    |
| ST-8-03      | refactor log 作成 | pending    |

## 成果物

- `outputs/phase-8/refactor-decision-log.md`

## 完了条件

- [ ] 冗長記述整理を終えている
- [ ] 表現統一を終えている
- [ ] `refactor-decision-log.md` を定義している

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 内容整理と意味変更を混同していない
- [ ] 成果物を定義している

## 次Phase

Phase 9（品質保証）へ進む。
