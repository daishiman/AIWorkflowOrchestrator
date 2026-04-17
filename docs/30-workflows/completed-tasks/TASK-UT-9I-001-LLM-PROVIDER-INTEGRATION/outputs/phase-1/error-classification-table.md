# Phase 1: エラー分類コード表

| 文字列コード      | DocError.code | カテゴリ         | HTTP ステータス | 原因             | retryable | UI アクション  |
| ----------------- | ------------- | ---------------- | --------------- | ---------------- | --------- | -------------- |
| `API_KEY_MISSING` | 2001          | BUSINESS         | 401             | APIキー未設定    | false     | 設定画面へ誘導 |
| `API_KEY_INVALID` | 2002          | BUSINESS         | 401/403         | APIキー無効      | false     | キー再入力     |
| `RATE_LIMIT`      | 3002          | EXTERNAL_SERVICE | 429             | レート制限       | true      | 指数バックオフ |
| `SERVER_ERROR`    | 3003          | EXTERNAL_SERVICE | 5xx             | サーバエラー     | true      | 指数バックオフ |
| `TIMEOUT`         | 3001          | EXTERNAL_SERVICE | -               | 30秒超過         | true      | 自動リトライ   |
| `NETWORK_ERROR`   | 3004          | EXTERNAL_SERVICE | -               | ネットワーク断   | true      | 自動リトライ   |
| `INTERNAL_ERROR`  | 5001          | INTERNAL         | -               | 予期しないエラー | false     | ログ記録・報告 |
