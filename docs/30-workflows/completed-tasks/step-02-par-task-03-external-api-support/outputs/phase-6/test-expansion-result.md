# Phase 6: テスト拡充

## 追加テスト結果

| テストID | 内容                                          | 結果 |
| -------- | --------------------------------------------- | ---- |
| T-09     | ネットワークエラーが元のエラーとしてスロー    | PASS |
| T-10     | HTTP 500 ExternalApiHttpError(statusCode=500) | PASS |
| T-11     | setAuth未呼び出しで認証ヘッダーなし           | PASS |
| T-12     | HTTPSでないURLにconsole.warn出力              | PASS |
| T-13     | POST Content-Type: application/json自動付与   | PASS |
| T-14     | api-key認証でAuthorizationヘッダーなし        | PASS |
| T-15     | カスタムヘッダーと認証ヘッダーのマージ        | PASS |

**T-01〜T-15: 全15件 PASS**
