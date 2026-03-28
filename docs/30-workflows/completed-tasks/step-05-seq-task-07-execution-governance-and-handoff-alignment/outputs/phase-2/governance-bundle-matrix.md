# Governance Bundle Matrix

## Concern Matrix

| concern                     | owner                                                             | contract                                       | consumer                                | note                                             |
| --------------------------- | ----------------------------------------------------------------- | ---------------------------------------------- | --------------------------------------- | ------------------------------------------------ |
| route authority             | `RuntimePolicyResolver`                                           | `integrated_api` / `terminal_handoff` decision | `RuntimeSkillCreatorFacade`             | consumer token guard と degraded fallback を含む |
| handoff DTO                 | `TerminalHandoffBuilder` + `packages/shared/src/types/handoff.ts` | `HandoffGuidance`                              | `SkillLifecyclePanel`                   | shared canonical DTO を再利用                    |
| approval enforcement        | `ApprovalGate` + `approvalHandlers.ts`                            | one-time token / TTL / single-use              | shared approval UI / Skill Creator slot | Skill Creator 専用 token 管理を作らない          |
| disclosure info             | `disclosureHandlers.ts`                                           | `execution:get-disclosure-info`                | renderer summary surface                | approval と分離した説明責務                      |
| public Skill Creator invoke | `creatorHandlers.ts`                                              | `skill-creator:*` runtime API                  | `skill-creator-api.ts`                  | public surface の current path                   |

## Manual Boundary

| ID   | ルール                      | Task07 での適用                               |
| ---- | --------------------------- | --------------------------------------------- |
| MB-1 | auto-send 禁止              | handoff は copy / user-operated 実行のみ      |
| MB-2 | hidden injection 禁止       | prompt / context は可視 guidance として渡す   |
| MB-3 | headless execution 禁止     | renderer で勝手に実行継続しない               |
| MB-4 | credential passthrough 禁止 | consumer token / secret を handoff へ渡さない |

## Type Placement

| type                    | 配置先                                                   | 理由                                  |
| ----------------------- | -------------------------------------------------------- | ------------------------------------- |
| `HandoffGuidance`       | `packages/shared/src/types/handoff.ts`                   | shared DTO                            |
| `TerminalHandoffBundle` | `packages/shared/src/types/skillCreator.ts`              | Skill Creator runtime response と一体 |
| `ApprovalStatus`        | `apps/desktop/src/main/services/runtime/ApprovalGate.ts` | Main-only enforcement                 |
| disclosure response     | shared IPC result または handler 実装側                  | Skill Creator 専用型を増やさない      |
