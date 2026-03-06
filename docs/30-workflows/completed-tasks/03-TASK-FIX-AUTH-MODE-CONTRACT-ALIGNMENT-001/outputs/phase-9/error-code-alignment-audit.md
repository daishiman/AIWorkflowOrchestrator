# Phase 9: error code alignment audit

## 3 層比較

| ケース               | Main                              | Preload | Renderer / UI                                 | 判定 |
| -------------------- | --------------------------------- | ------- | --------------------------------------------- | ---- |
| invalid sender       | `auth-mode/invalid-sender`        | 透過    | fallback せず response error として扱える     | PASS |
| invalid mode         | `auth-mode/invalid-mode`          | 透過    | error message / fallback に利用可能           | PASS |
| API key missing      | `auth-mode/no-api-key`            | 透過    | `status.errorCode` と SettingsView 表示が一致 | PASS |
| subscription missing | `auth-mode/no-subscription-token` | 透過    | `status.errorCode` と SettingsView 表示が一致 | PASS |
| storage failed       | `auth-mode/storage-failed`        | 透過    | `setMode` failure message へ反映可能          | PASS |
| storage read failed  | `auth-mode/storage-read-failed`   | 透過    | `fetchMode` failure message へ反映可能        | PASS |
| unknown error        | `auth-mode/unknown-error`         | 透過    | fallback status の default code               | PASS |

## `message` / `guidance` 整合

| ケース               | message                                    | guidance                                | 判定 |
| -------------------- | ------------------------------------------ | --------------------------------------- | ---- |
| API key missing      | `APIキーが設定されていません`              | `設定画面でAPIキーを入力してください`   | PASS |
| subscription missing | `サブスクリプションが見つかりません`       | `Claude Code CLIでログインしてください` | PASS |
| success subscription | `Claude Code CLI の認証情報を使用できます` | なし                                    | PASS |
| success api-key      | `Anthropic APIキーを使用できます`          | なし                                    | PASS |

## 結論

1. Preload は error code を再定義しておらず、drift ポイントを持たない。
2. Renderer は `status.errorCode` と `status.guidance` をそのまま表示できる。
3. runtime failure 時は canonical error code に寄せた fallback を返すため、UI 側の分岐が単純になった。
