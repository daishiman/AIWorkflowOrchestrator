# Phase 6 失敗系一覧

| ケースID | 失敗条件                            | 期待エラー/応答                     | 検証状態 |
| -------- | ----------------------------------- | ----------------------------------- | -------- |
| FC-01    | `AUTH_LOGIN` に不正provider         | `AUTH_ERROR_CODES.INVALID_PROVIDER` | PASS     |
| FC-02    | refresh token なしで `AUTH_REFRESH` | `AUTH_ERROR_CODES.REFRESH_FAILED`   | PASS     |
| FC-03    | Supabase未設定で `AUTH_LOGIN`       | `AUTH_NOT_CONFIGURED`               | PASS     |
| FC-04    | Supabase未設定で `AUTH_LOGOUT`      | `AUTH_NOT_CONFIGURED`               | PASS     |
| FC-05    | Supabase未設定で `AUTH_REFRESH`     | `AUTH_NOT_CONFIGURED`               | PASS     |

## 備考

FC-01/FC-02 は `authHandlers.test.ts` 既存回帰。
FC-03〜FC-05 は fallback一元化後の互換条件として確認した。
