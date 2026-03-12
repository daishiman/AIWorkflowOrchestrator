# Mode Adapter Design

## Adapter 一覧

| adapter           | 役割                                                               | 実装                                |
| ----------------- | ------------------------------------------------------------------ | ----------------------------------- |
| Workspace adapter | selected files から attachments / summary / handoff payload を作る | `createWorkspaceChatHandoff()`      |
| Lifecycle adapter | skill name / created path を skill attachment に変換する           | `createSkillLifecycleChatHandoff()` |
| Request adapter   | context block と request を `LLMChatRequest` に変換する            | `buildChatPlatformRequest()`        |

## 設計ルール

1. mode ごとの差分は helper に閉じる。
2. `ChatView` / `chatSlice` 側へ file-system / skill-center 固有知識を持ち込まない。
3. metadata は `Record<string, unknown>` とし、mode ごとの詳細は adapter 側で詰める。
