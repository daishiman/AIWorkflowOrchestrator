# Phase 2 UI 状態マトリクス

| 状態ID | 状態          | トリガー     | 期待UI                        |
| ------ | ------------- | ------------ | ----------------------------- |
| ST-01  | zero          | 初期         | suggestion bubbles + 空ログ   |
| ST-02  | attached      | ファイル添付 | chips 表示                    |
| ST-03  | mention-open  | `@`入力      | dropdown 表示 + highlight     |
| ST-04  | streaming     | 送信後       | streaming bubble + 停止ボタン |
| ST-05  | stream-error  | stream error | alert 表示                    |
| ST-06  | compact       | 幅900        | overlay file panel            |
| ST-07  | keyboard-flow | keyboardのみ | remove/mention/send が成立    |
