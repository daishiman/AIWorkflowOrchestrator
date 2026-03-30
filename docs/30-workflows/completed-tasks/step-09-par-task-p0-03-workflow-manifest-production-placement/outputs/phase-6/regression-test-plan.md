# Phase 6: Regression テスト計画

| ID    | Regression Case                          | 検出方法                            | 結果     |
| ----- | ---------------------------------------- | ----------------------------------- | -------- |
| RC-01 | resource path のファイルが削除された     | fs.access error                     | PASS     |
| RC-02 | schemaVersion が変更された               | "schemaVersion は 1 のみ受理します" | PASS     |
| RC-03 | workflowId が空文字に変更された          | validation error                    | PASS     |
| RC-04 | `.agents` mirror が `.claude` と乖離した | TC-08 parity check                  | カバー済 |
