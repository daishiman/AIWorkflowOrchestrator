# Phase 4: テスト作成（TDD Red → Green）

## テストファイル

`apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts`

## テスト結果（Phase 5 実装後）

| テストID | 内容                                               | 結果 |
| -------- | -------------------------------------------------- | ---- |
| T-01     | GET 200レスポンスをT型で返す                       | PASS |
| T-02     | POST JSONボディ送信 200レスポンス                  | PASS |
| T-03     | api-key認証 X-API-Keyヘッダー付与                  | PASS |
| T-04     | bearer認証 Authorization: Bearer付与               | PASS |
| T-05     | basic認証 Base64エンコード付与                     | PASS |
| T-06     | 30秒タイムアウト ExternalApiTimeoutError           | PASS |
| T-07     | 404レスポンス ExternalApiHttpError(statusCode=404) | PASS |
| T-08     | APIキーがconsole.logに出力されない                 | PASS |

**8 tests passed, 0 failed**
