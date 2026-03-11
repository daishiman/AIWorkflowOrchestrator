# Team-C 実装詳細

## 変更

- `auth-key:exists` レスポンスを `exists + source` へ拡張
- `SettingsView` に `AuthKeySection` の表示条件追加
- `AuthKeySection` は `source` 優先で状態判定

## 効果

- AuthMode/UI/実保存状態の整合を回復
