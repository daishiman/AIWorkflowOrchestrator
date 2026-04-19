# 異常系テスト結果

| ケース              | 期待動作             | 結果    |
| ------------------- | -------------------- | ------- |
| 空文字列入力        | 空配列を返す         | ✅ PASS |
| エンコーダ失敗      | 例外が上位に伝播     | ✅ PASS |
| startChar > endChar | InvalidBoundaryError | ✅ PASS |
| 負のstartChar       | InvalidBoundaryError | ✅ PASS |
| 空のchunkBoundaries | 空配列を返す         | ✅ PASS |
| hiddenStatesが空    | 例外なし・空配列返却 | ✅ PASS |
