# IPC 契約ケース - Skill Runtime API Key Panel

## タスクID: TASK-RT-04 / Phase 4

## auth-key:exists

| ケース         | 入力 | 期待レスポンス                             |
| -------------- | ---- | ------------------------------------------ |
| キー未設定     | —    | `{ exists: false, source: "not-set" }`     |
| saved キーあり | —    | `{ exists: true, source: "saved" }`        |
| env-fallback   | —    | `{ exists: true, source: "env-fallback" }` |
| エラー発生時   | —    | `{ exists: false, source: "not-set" }`     |

## auth-key:set

| ケース           | 入力                               | 期待レスポンス                                         |
| ---------------- | ---------------------------------- | ------------------------------------------------------ |
| 正常保存         | `{ key: "sk-ant-api03-..." }`      | `{ success: true }`                                    |
| 空文字           | `{ key: "" }`                      | `{ success: false, error: "API Key cannot be empty" }` |
| 不正フォーマット | `{ key: "invalid-key" }`           | `{ success: false, error: "Invalid API Key format" }`  |
| 長すぎるキー     | `{ key: "sk-" + "a".repeat(201) }` | `{ success: false, error: "API Key is too long" }`     |
| サービスエラー   | `{ key: "sk-ant-api03-..." }`      | `{ success: false, error: "<sanitized message>" }`     |

## auth-key:validate

| ケース   | 入力                              | 期待レスポンス                                   |
| -------- | --------------------------------- | ------------------------------------------------ |
| 有効キー | `{ key: "sk-ant-api03-..." }`     | `{ valid: true }`                                |
| 無効キー | `{ key: "sk-ant-api03-invalid" }` | `{ valid: false, error: "..." }`                 |
| 空文字   | `{ key: "" }`                     | `{ valid: false, error: "API Key is required" }` |

## auth-key:delete

| ケース         | 入力 | 期待レスポンス                                     |
| -------------- | ---- | -------------------------------------------------- |
| 正常削除       | —    | `{ success: true }`                                |
| サービスエラー | —    | `{ success: false, error: "<sanitized message>" }` |

## セキュリティ要件

- `validateIpcSender` により許可された BrowserWindow からのみ呼び出し可能
- API キーはログに生値で出力されない (`sanitizeApiKey()` で `[REDACTED]` に置換)
