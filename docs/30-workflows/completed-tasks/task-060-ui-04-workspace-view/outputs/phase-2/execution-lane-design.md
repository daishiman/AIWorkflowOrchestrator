# Phase 2 Execution Lane Design

## lane 設計

| Lane | 関心ごと                              | 依存            | 実行方針                          |
| ---- | ------------------------------------- | --------------- | --------------------------------- |
| A    | parent scope と system spec 抽出      | なし            | Phase 1 の requirement を確定する |
| B    | child canonical path と linkage       | Lane A          | parent-child の接続面を設計する   |
| C    | validator / traceability / compliance | Lane B と並列   | Phase 4-9 の検証面を先行設計する  |
| D    | future execution lane                 | Phase 3 PASS 後 | child 実装 task への引き継ぎ専用  |

## Phase gate

- Phase 1 完了後に Lane B を開始する。
- Phase 2 完了後に Lane C を固める。
- Phase 3 PASS まで Phase 4 以降へ進まない。

## 並列実行の原則

- 依存する入力が揃ってから並列化する。
- 同じ仕様書を同時に編集しない。
- 実行ログと成果物は lane ごとに分離して記録する。
