# Phase 9: security audit checklist

| #   | チェック項目        | 確認内容                                                                | 結果 |
| --- | ------------------- | ----------------------------------------------------------------------- | ---- |
| 1   | sender 検証順序     | handler 冒頭で `validateSender` を実行                                  | PASS |
| 2   | invalid sender 分類 | null sender / destroyed sender / external origin / missing frame を拒否 | PASS |
| 3   | origin 制限         | `file://`, `http://localhost`, `https://localhost` のみ許可             | PASS |
| 4   | invalid mode 分類   | sender 通過後に mode 値を検証                                           | PASS |
| 5   | error sanitize      | token / key / `sk-ant-*` を mask                                        | PASS |
| 6   | channel whitelist   | `AUTH_MODE_GET/SET/STATUS/VALIDATE/CHANGED` が明示許可                  | PASS |
| 7   | preload 安全化      | `safeInvoke`, `safeOn` を経由して公開                                   | PASS |
| 8   | Renderer 暴露範囲   | `electronAPI.authMode` の必要最小 surface のみ使用                      | PASS |

## 補足

- 今回は channel 名を変えず payload shape だけを整合したため、whitelist 破壊リスクは低い
- unauthorized path の画面証跡は Phase 11 の主対象ではないが、manual note に再確認可能
