# Phase 6 異常系一覧

| ケース                 | 条件                           | 期待結果                               | 証跡                                                |
| ---------------------- | ------------------------------ | -------------------------------------- | --------------------------------------------------- |
| read error             | `response.success=false`       | status bar / preview に error 表示     | `WorkspaceView.test.tsx`, `TC-11-07-read-error.png` |
| timeout                | `file.read` が応答しない       | 5 秒 timeout + 3 retry 後に error 表示 | `WorkspaceView.test.tsx`                            |
| structured parse error | invalid JSON/YAML              | alert banner + Source fallback         | `PreviewPanel.test.tsx`                             |
| render crash           | child render throw             | ErrorBoundary + reset                  | `PreviewErrorBoundary.test.tsx`                     |
| no file API            | `window.electronAPI.file` なし | error 文言を表示                       | `WorkspaceView/index.tsx` 実装確認                  |

## 残課題

- blocking な異常系未解消は 0 件
