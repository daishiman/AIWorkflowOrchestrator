# Current Facts Matrix — TASK-RT-04

| 対象                         | 現状                                                | 判定      |
| ---------------------------- | --------------------------------------------------- | --------- |
| `SettingsView`               | 主導線として `AuthKeySection` を保持                | canonical |
| `SkillLifecyclePanel`        | 補助導線として `ApiKeySettingsPanel` を統合         | current   |
| `window.electronAPI.authKey` | `exists/set/delete` を再利用                        | canonical |
| `window.electronAPI.apiKey`  | 汎用 provider 管理用。TASK-RT-04 では主契約にしない | boundary  |
| `auth-key:exists.source`     | `saved/env-fallback/not-set` を返す                 | required  |
