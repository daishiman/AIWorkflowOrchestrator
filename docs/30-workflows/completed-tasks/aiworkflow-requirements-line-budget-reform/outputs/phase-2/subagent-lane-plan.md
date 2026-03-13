# Phase 2 Output: SubAgent Lane Plan

## lane topology

| lane   | 担当 family                                          | wave       | sub-batch rule         | 完了条件                              |
| ------ | ---------------------------------------------------- | ---------- | ---------------------- | ------------------------------------- |
| Lane A | F1 ledger / archive、F2 pattern / rulebook           | Wave 1-2   | 3 ファイル以下 / agent | archive / shard 導線と履歴分離が完了  |
| Lane B | F3 architecture / core、F6 support / platform        | Wave 1-2   | 3 ファイル以下 / agent | overview と subtopic split が完了     |
| Lane C | F4 interfaces / api / security、F5 ui / ux           | Wave 1-2   | 3 ファイル以下 / agent | parent index + domain split が完了    |
| Lane V | validation、mirror sync、generated index measurement | 各 wave 後 | 単独実行               | manual docs gate と G0 状態判定が完了 |

## wave 実行順

| wave   | Lane A | Lane B | Lane C | Lane V                                     |
| ------ | ------ | ------ | ------ | ------------------------------------------ |
| Wave 1 | F1     | F3     | F4     | validate + regenerate + measure            |
| Wave 2 | F2     | F6     | F5     | validate + regenerate + measure            |
| Final  | -      | -      | -      | final validation + blocked dependency 確定 |

## lane 運用ルール

1. Phase 1-3 完了前はどの lane も開始しない。
2. lane は最大 3 並列まで。Lane V は必ず直列で走らせる。
3. lane 内も 3 ファイル以下 / agent の sub-batch に分ける。
4. G0 `topic-map.md` は Lane V の measurement 対象であり、implementation lane には割り当てない。
5. どれかの lane で naming / mirror / line budget drift が出た場合、次 wave に進まず Lane V で止める。
