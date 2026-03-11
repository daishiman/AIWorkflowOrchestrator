# Phase 6 回帰マトリクス

## 境界値

| 分類        | ケース                         | 結果 |
| ----------- | ------------------------------ | ---- |
| resize      | file panel 180 / 400           | PASS |
| resize      | preview panel 280 / 560        | PASS |
| resize      | dblclick reset 260 / 320       | PASS |
| breakpoint  | 1023 / 1024                    | PASS |
| breakpoint  | 1439 / 1440                    | PASS |
| persistence | 壊れた `workspace-panel-sizes` | PASS |
| persistence | 不正 `workspace-layout-mode`   | PASS |

## エラー / watcher

| ケース                                 | 結果 |
| -------------------------------------- | ---- |
| `file.read` 失敗時の error surface     | PASS |
| `watchStart` 失敗時の watch error 表示 | PASS |
| same path 再監視時の重複登録防止       | PASS |
| callback 差し替え時の再 start 抑止     | PASS |

## 対応テスト

- `useWorkspaceLayout.test.ts`
- `usePanelResize.test.ts`
- `useFileWatcher.test.ts`
- `WorkspaceView.test.tsx`
- `fileHandlers.test.ts`
