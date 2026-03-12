# Task03 Failure Contracts

## 想定 failure

- lifecycle job 未設定
  - 許容: `null`
  - UI は generic `Skill Lifecycle` 表示にフォールバック
- model 未選択
  - error code: `MODEL_REQUIRED`
- streaming IPC 不可
  - error code: `LLM_NOT_AVAILABLE`
- stream 開始失敗
  - error code: `STREAM_START_ERROR`

## downstream 禁止

- Task03 が `window.electronAPI.llm.streamChat` を直接叩かない
- Task03 が `chatSessions` の永続化 schema を拡張しない
