# Phase 6 追加テストケース

| TC-ID    | 種別   | 目的                                        | 状態     |
| -------- | ------ | ------------------------------------------- | -------- |
| TC-EX-01 | 異常系 | trim空文字で `ERR_1001` を返す              | 実装済み |
| TC-EX-02 | 異常系 | sender拒否で `ERR_2004` を返す              | 実装済み |
| TC-EX-03 | 異常系 | unknown error を `ERR_5001` に正規化        | 実装済み |
| TC-EX-04 | 境界   | `import()` が `SKILL_IMPORT` のみ呼ぶ       | 実装済み |
| TC-EX-05 | 境界   | `SKILL_IMPORT_FROM_SOURCE` が誤呼出されない | 実装済み |
| TC-EX-06 | 回帰   | raw payload の `errorCode` を保持           | 実装済み |
