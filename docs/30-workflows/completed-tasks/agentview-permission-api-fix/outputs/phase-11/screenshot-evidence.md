# screenshot evidence

現状の `placeholder-evidence.png` は validator 用の仮置きであり、最終証跡ではない。

## blocked 理由

- `apps/desktop/src/renderer/phase11-agent-view.tsx` が旧 `window.electronAPI.permissions` を前提にしていた
- worktree 環境で `@esbuild/darwin-arm64` / `darwin-x64` mismatch が発生し、Vite / Vitest 起動が blocked

## 次回再取得時の対象

| TC-ID    | 対象                                        | 証跡状態 | 備考          |
| -------- | ------------------------------------------- | -------- | ------------- |
| TC-11-01 | AgentView 初期表示                          | BLOCKED  | 実 png 未取得 |
| TC-11-02 | AdvancedSettingsPanel 展開 + 許可モード変更 | BLOCKED  | 実 png 未取得 |
| TC-11-03 | remembered count 表示                       | BLOCKED  | 実 png 未取得 |
| TC-11-04 | reset success 後の件数 0 + toast            | BLOCKED  | 実 png 未取得 |
| TC-11-05 | reset disabled 状態                         | BLOCKED  | 実 png 未取得 |
