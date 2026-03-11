# Phase 6 統合テスト結果

## 一連動作

| フロー                                 | 期待結果                       | 結果 |
| -------------------------------------- | ------------------------------ | ---- |
| folder load → tree render              | tree が描画される              | PASS |
| file select → status bar update        | path / ext / size が更新される | PASS |
| file select → attach action            | `addFiles()` が呼ばれる        | PASS |
| context menu → preview open            | preview panel が開く           | PASS |
| selected file change → watcher refresh | debounce 後に再読込される      | PASS |

## 依存境界

| 境界            | 確認内容                                                    | 結果 |
| --------------- | ----------------------------------------------------------- | ---- |
| 04A → 04B       | 背景情報への追加導線が `fileSelectionSlice` に集約される    | PASS |
| 04A → 04C       | preview は selected file と open state の境界だけを提供する | PASS |
| Renderer → Main | `file.read` / `file.watchStart` / `file.watchStop` のみ使用 | PASS |
| Main → Renderer | `FILE_CHANGED` push だけで再読込を発火する                  | PASS |
