# Phase 2 IPC / watcher 設計

## 使用チャネル

| channel                    | 用途                                | 備考                       |
| -------------------------- | ----------------------------------- | -------------------------- |
| `workspace:load`           | 初期 workspace 読込                 | 既存                       |
| `workspace:add-folder`     | zero state / panel から folder 追加 | 既存                       |
| `workspace:validate-paths` | load 後 path 妥当性確認             | 既存                       |
| `file:get-tree`            | folder tree 再読込                  | 既存                       |
| `file:read`                | selected file 内容 / metadata 読込  | 既存                       |
| `file:watch-start`         | selected file watch 開始            | Main 実装追加が必要        |
| `file:watch-stop`          | watch 停止                          | Main 実装追加が必要        |
| `file:changed`             | watch event 通知                    | Main event emit 追加が必要 |

## Main 実装方針

| 項目           | 方針                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------ |
| watch registry | `Map<string, FileWatcher>` を module scope で保持                                                |
| watch id       | `crypto.randomUUID()` か同等の一意 ID                                                            |
| start          | path 検証後に `FileWatcher` を生成、event を `event.sender.send("file:changed", payload)` で通知 |
| stop           | watch id に紐づく watcher を close して registry から除去                                        |
| cleanup        | renderer 切断 / stop / duplicate start 時に close                                                |
| security       | 既存 `validatePath` を通した path のみ許可                                                       |

## Renderer hook 契約

```ts
interface UseFileWatcherArgs {
  filePath: string | null;
  enabled: boolean;
  onFileChanged: (filePath: string) => Promise<void>;
}
```

## エッジケース

- watch start 失敗時は layout を壊さず status bar に warning 表示
- `file:changed` が別 path を返した場合は無視
- unmount 時は `watchStop` を fire-and-forget せず await する
- test 用に `resetFileWatcherGuard()` を export して module scope 状態を戻せるようにする
