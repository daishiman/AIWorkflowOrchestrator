# Session Implementation

## 実装した session 契約

| 契約              | 実装                                |
| ----------------- | ----------------------------------- |
| title helper      | `createChatSessionTitle()`          |
| handoff payload   | `ChatHandoffPayload`                |
| revive snapshot   | `ChatReviveSnapshot`                |
| Workspace handoff | `createWorkspaceChatHandoff()`      |
| lifecycle handoff | `createSkillLifecycleChatHandoff()` |

## current 振る舞い

- Workspace は selected files を `ChatContextAttachment[]` に正規化してから title/summary を生成する。
- Skill Lifecycle は skill name と path を skill attachment として handoff payload へ詰める。
- general chat は helper を共有するが、persistent conversation の transport は legacy 実装のまま。

## 未完了

general chat と workspace chat を同一 persistence 基盤で扱う transport merge は、このターンのスコープ外として follow-up 化する。
