# エラーパス一覧 - Skill Runtime API Key Panel

## タスクID: TASK-RT-04 / Phase 6

## IPC エラーパス

| パス                     | 原因                    | Main 側挙動                                  | Renderer 側表示                    |
| ------------------------ | ----------------------- | -------------------------------------------- | ---------------------------------- |
| `auth-key:set` 失敗      | サービスエラー          | `{ success: false, error: "<sanitized>" }`   | `apiError` に表示                  |
| `auth-key:set` 例外      | 予期しないエラー        | `{ success: false, error: "Unknown error" }` | `"予期しないエラーが発生しました"` |
| `auth-key:exists` エラー | ネットワーク/ストレージ | `{ exists: false, source: "not-set" }`       | `not_set` フォールバック           |
| `auth-key:delete` 失敗   | ストレージエラー        | `{ success: false, error: "<sanitized>" }`   | `apiError` に表示                  |
| `auth-key:delete` 例外   | 予期しないエラー        | `{ success: false, error: "Unknown error" }` | `"予期しないエラーが発生しました"` |

## バリデーションエラーパス

| パス             | 入力            | エラーメッセージ                    |
| ---------------- | --------------- | ----------------------------------- |
| 空文字           | `""`            | `"APIキーを入力してください"`       |
| 空白のみ         | `"   "`         | `"APIキーを入力してください"`       |
| 長すぎる         | 201文字以上     | `"APIキーの長さが不正です"`         |
| フォーマット不正 | `"invalid-key"` | `"APIキーの形式が正しくありません"` |

## セキュリティエラーパス

| パス                   | 保護機構           | 挙動                |
| ---------------------- | ------------------ | ------------------- |
| 不正な sender          | `withValidation()` | リクエスト拒否      |
| API キーがログに漏れる | `sanitizeApiKey()` | `[REDACTED]` に置換 |
