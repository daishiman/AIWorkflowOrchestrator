# Context Adapter 設計

## Adapter 一覧

- General adapter
  - `entryPoint: "chat"`
  - 追加 context なし
- Workspace adapter
  - `buildWorkspaceChatContext(selectedFiles, workspacePath)`
  - file path/name と handoffLabel を構成
- Skill Center adapter
  - `activateChatMode("skill-lifecycle", { lifecycleJob, entryPoint, handoffLabel })`

## Adapter 責務

- surface 固有 state を session context に変換する
- ChatView 本体へ surface 固有 UI を持ち込まない

## Adapter 非責務

- stream IPC
- message formatting
- history persistence
