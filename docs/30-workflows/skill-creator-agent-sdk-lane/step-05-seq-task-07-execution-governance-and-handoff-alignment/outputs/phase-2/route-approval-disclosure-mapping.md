# Route Approval Disclosure Mapping

## Runtime Flow

| step | actor        | input                                                            | output                                      | note                                    |
| ---- | ------------ | ---------------------------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| 1    | Renderer     | `skillCreatorAPI.planSkill/executePlan/improveSkillWithFeedback` | `skill-creator:*` invoke                    | public surface 入口                     |
| 2    | Main IPC     | `creatorHandlers.ts`                                             | normalized request                          | sender validation と payload validation |
| 3    | Main service | `RuntimePolicyResolver`                                          | `RuntimeDecision`                           | `integrated_api` or `terminal_handoff`  |
| 4A   | Main service | integrated path                                                  | LLM / executor / improve flow               | normal execution                        |
| 4B   | Main service | handoff path                                                     | `HandoffGuidance` / `TerminalHandoffBundle` | early return、silent fallback 不可      |
| 5    | Renderer     | response + shared governance surface                             | visible handoff / disclosure summary        | console-only 禁止                       |

## Channel Mapping

| concern                  | channel / API                   | direction        | owner                   | Skill Creator での扱い             |
| ------------------------ | ------------------------------- | ---------------- | ----------------------- | ---------------------------------- |
| plan / execute / improve | `skill-creator:*`               | Renderer -> Main | `creatorHandlers.ts`    | public runtime API                 |
| approval request         | `approval:request`              | Main -> Renderer | `approvalHandlers.ts`   | shared approval UI を利用          |
| approval respond         | `approval:respond`              | Renderer -> Main | `approvalHandlers.ts`   | shared approval 応答               |
| disclosure               | `execution:get-disclosure-info` | Renderer -> Main | `disclosureHandlers.ts` | Skill Creator surface から取得可能 |

## Renderer Consumption Slot

| slot               | source                                      | purpose                           | non-goal                     |
| ------------------ | ------------------------------------------- | --------------------------------- | ---------------------------- |
| visible handoff    | `HandoffGuidance` / `TerminalHandoffBundle` | user-operated fallback を表示する | reason 再生成                |
| disclosure summary | shared disclosure info                      | AI 利用情報を説明する             | approval token 管理          |
| approval action    | shared approval flow                        | 危険操作を確認する                | Skill Creator 専用 gate 実装 |
