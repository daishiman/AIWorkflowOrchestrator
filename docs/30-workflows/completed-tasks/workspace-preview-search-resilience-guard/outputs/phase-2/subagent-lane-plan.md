# Phase 2 Output: SubAgent Lane Plan

## 1. Lane 一覧

| Lane | SubAgent   | 関心ごと             | 入力                 | 出力                  | 並列可否                          |
| ---- | ---------- | -------------------- | -------------------- | --------------------- | --------------------------------- |
| A    | SubAgent-A | search resilience    | Phase 1 requirements | search rule design    | Phase 1 完了後、Lane B と並列可   |
| B    | SubAgent-B | preview resilience   | Phase 1 requirements | preview helper design | Phase 1 完了後、Lane A と並列可   |
| C    | SubAgent-C | error taxonomy       | Lane A/B の設計      | taxonomy table        | Lane A/B の後                     |
| D    | SubAgent-D | docs / Phase 12 sync | Lane A/B/C の設計    | Phase 12 sync rule    | Lane C と一部並行、Phase 3 で統合 |

## 2. 直列ゲート

1. Phase 1 で元要求、正本仕様、scope を確定する。
2. Phase 2 で Lane A/B を並列化する。
3. Lane C/D の結果を Phase 3 で統合レビューする。
4. Phase 3 PASS 後に Lane A/B/C/D を順次実行し、Phase 12 で統合する。

## 3. 実行メモ

- 実行は 4 lane に分け、search / preview は先行、taxonomy / docs sync は後続で処理した。
- 実 SubAgent 機構はないため、lane 単位の並列作業と成果物分離で代替した。
