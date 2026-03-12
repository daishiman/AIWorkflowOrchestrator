# Chat Mode Gap Matrix

| 項目               | general                  | workspace                                | skill-lifecycle                             |
| ------------------ | ------------------------ | ---------------------------------------- | ------------------------------------------- |
| source surface     | `chat-view`              | `workspace-view`                         | `skill-center` / `skill-creator` / `task03` |
| 実行 surface       | `chat-view`              | `chat-view` へ handoff                   | `chat-view` へ handoff                      |
| 追加文脈           | なし                     | file attachments                         | skill attachment / lifecycle metadata       |
| title 生成         | request 先頭             | `Workspace:` prefix                      | `Skill Lifecycle:` prefix                   |
| persistence        | local chat state         | `conversationAPI.create/addMessage` 利用 | handoff payload のみ                        |
| streaming reset    | `chatSlice`              | controller local state                   | handoff 後は `chatSlice` 想定               |
| このターンの共通化 | title helper / mode enum | request builder / handoff payload        | handoff payload / allowed surface guard     |
| 未解決             | conversation persistence | `ChatView` への transport 一本化         | Chat 実行面との完全統合                     |

## 判断

- UI の見え方は mode 差分で残し、契約だけを shared types に揃える。
- Workspace と Skill Lifecycle は「会話本体」ではなく「会話へ渡す payload」を作る面として扱う。
- mode 差分の共通部分は `ChatHandoffPayload` と `ChatReviveSnapshot` へ集約する。
