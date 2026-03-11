# Team-A テストケース

| TC      | 内容                                 | 期待結果                           |
| ------- | ------------------------------------ | ---------------------------------- |
| TC-A-01 | `apiKey:save` 後にキャッシュクリア   | `clearInstance(provider)` 呼び出し |
| TC-A-02 | `apiKey:delete` 後にキャッシュクリア | `clearInstance(provider)` 呼び出し |
| TC-A-03 | `secureStorage` が `api-keys` を参照 | 実行経路が単一ストア参照           |
