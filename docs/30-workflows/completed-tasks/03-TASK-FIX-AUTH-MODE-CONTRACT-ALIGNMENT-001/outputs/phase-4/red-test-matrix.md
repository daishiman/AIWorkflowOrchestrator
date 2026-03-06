# Phase 4 Red テスト行列

| channel    | Main                                                | Preload                                         | Renderer                                            |
| ---------- | --------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| `get`      | `data` が文字列直返しなので fail                    | bridge は `{ mode }` 前提なので fail            | `fetchMode` は `{ mode }` 前提、旧 Main 契約で fail |
| `set`      | success 後 event payload が旧 shape で fail         | `onModeChanged` が `mode/status` 前提で fail    | listener が `event.mode/status` 前提で fail         |
| `status`   | `isAuthenticated` 中心 DTO で fail                  | `AuthModeStatus` 前提で fail                    | UI が `message/errorCode` 前提で fail               |
| `validate` | `status` と異なる DTO で fail                       | `validate()` が `message/errorCode` 前提で fail | `validate` action が同一 DTO を返せず fail          |
| `changed`  | `currentMode/timestamp/isAuthenticated` のみで fail | `AuthModeChangedEvent` 前提で fail              | status を event payload から更新できず fail         |

## 補助観点

- invalid sender は Main で最優先 reject を要求する。
- SettingsView mount / no-loop は shape 変更後も維持する。
- preload whitelist は変更不要なので回帰のみ確認する。
