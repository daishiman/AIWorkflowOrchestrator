# AuthKey UI State Matrix — TASK-RT-04

| 状態                       | badge    | source表示 | CTA    |
| -------------------------- | -------- | ---------- | ------ |
| `not_set`                  | 未設定   | なし       | 保存   |
| `validating`               | 検証中   | なし       | 無効化 |
| `configured(saved)`        | 設定済み | 保存済み   | 削除   |
| `configured(env-fallback)` | 設定済み | 環境変数   | 削除   |
| `error`                    | エラー   | なし       | 再入力 |
