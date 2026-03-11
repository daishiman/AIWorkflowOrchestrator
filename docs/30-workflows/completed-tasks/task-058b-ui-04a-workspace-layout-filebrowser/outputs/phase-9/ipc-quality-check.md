# Phase 9 IPC / セキュリティ品質チェック

## 利用チャネル

| チャネル           | 用途                                    | 判定                                |
| ------------------ | --------------------------------------- | ----------------------------------- |
| `workspace:*`      | workspace load / folder add / tree load | 既存契約利用                        |
| `file:read`        | selected file の再読込                  | 既存契約利用                        |
| `file:watch-start` | selected file の watch 開始             | 既存 preload 契約の Main 実装を追加 |
| `file:watch-stop`  | watch 停止                              | 既存 preload 契約の Main 実装を追加 |
| `file:changed`     | Main → Renderer push                    | 既存 allowlist に準拠               |

## チェック結果

| 観点                                           | 結果 |
| ---------------------------------------------- | ---- |
| 新規 namespace 追加なし                        | PASS |
| `ipcRenderer` 直公開なし                       | PASS |
| sender push は `event.sender.send(...)` に限定 | PASS |
| watcher stop を unmount / file switch で実施   | PASS |
| preload allowlist と channels test が一致      | PASS |

## 実装メモ

- `FILE_CHANGED` は subscribe 専用で、invoke allowlist へは追加していない。
- `useFileWatcher` は module scope guard で重複登録を抑止し、cleanup 時に stop する。
