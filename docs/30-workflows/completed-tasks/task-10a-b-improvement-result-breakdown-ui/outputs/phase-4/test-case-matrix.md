# Phase 4 テストケースマトリクス

| Test ID         | シナリオ      | 入力                           | 期待結果                            | 優先度 |
| --------------- | ------------- | ------------------------------ | ----------------------------------- | ------ |
| TC-BREAKDOWN-01 | mixed内訳表示 | applied=1, skipped=1, errors=1 | 3セクションと件数が表示される       | P0     |
| TC-BREAKDOWN-02 | 失敗理由表示  | errors>=1                      | 失敗提案名と理由が表示される        | P0     |
| TC-BREAKDOWN-03 | a11y通知      | result表示                     | status/live属性で読み上げ対象になる | P1     |
| TC-BREAKDOWN-04 | 再分析連携    | apply成功                      | analyze再実行後にパネルが閉じる     | P0     |
| TC-BREAKDOWN-05 | success only  | applied>=1                     | 成功セクションのみ表示される        | P1     |
| TC-BREAKDOWN-06 | skipped only  | skipped>=1                     | スキップセクションのみ表示される    | P1     |

## 完了判定

- [x] 正常/異常/境界ケースを網羅
