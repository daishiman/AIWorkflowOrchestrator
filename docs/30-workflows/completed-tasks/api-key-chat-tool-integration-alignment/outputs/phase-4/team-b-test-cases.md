# Team-B テストケース

| TC      | 内容                                           | 期待結果        |
| ------- | ---------------------------------------------- | --------------- |
| TC-B-01 | `ai.chat` が request指定 provider/model を優先 | 指定値で実行    |
| TC-B-02 | provider/model 片指定                          | エラー応答      |
| TC-B-03 | 無効 provider 指定                             | エラー応答      |
| TC-B-04 | `llm:set-selected-config` 登録                 | handler登録済み |
