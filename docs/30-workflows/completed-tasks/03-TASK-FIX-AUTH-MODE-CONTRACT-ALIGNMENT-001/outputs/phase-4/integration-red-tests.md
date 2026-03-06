# Phase 4 Integration Red テスト

## 直列ケース

| ID     | ケース                                                                | 現状の失敗理由                                              |
| ------ | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| INT-01 | `get -> status` が同じ mode と表示文言を返す                          | `get` と `status` の DTO が別物                             |
| INT-02 | `set -> changed -> status` が同じ DTO を共有する                      | `changed` event が status DTO を持たない                    |
| INT-03 | invalid sender が invalid mode より先に reject される                 | sender 順序は code で固定されているが専用保証が弱い         |
| INT-04 | SettingsView mount が no-loop のまま initialize し、status を表示する | UI は errorCode / guidance を表示できない                   |
| INT-05 | `validate(mode?)` が current mode / explicit mode の両方で同一 DTO    | explicit mode 時に current status 依存の drift が起こり得る |
