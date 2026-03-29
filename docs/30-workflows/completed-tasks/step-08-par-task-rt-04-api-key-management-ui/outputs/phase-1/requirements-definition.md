# Requirements Definition — TASK-RT-04

## 要件

- `SkillLifecyclePanel` に最小の Anthropic API キー導線を追加する。
- 主導線は `SettingsView` に残し、責務を逆転させない。
- `authKey` 契約を再利用し、重複 API を増やさない。
- `saved` / `env-fallback` / `not-set` / `error` を識別できる。

## スコープ外

- 汎用 provider 一覧 UI の再設計
- `skillCreator` 契約の拡張
- commit / PR 作成
