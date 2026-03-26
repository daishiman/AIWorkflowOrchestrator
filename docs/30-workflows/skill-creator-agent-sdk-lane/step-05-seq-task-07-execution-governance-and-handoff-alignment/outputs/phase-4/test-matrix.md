# Test Matrix

| ID       | Layer          | Scenario                                              | Expected                                                 |
| -------- | -------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| TC-07-01 | Runtime policy | API key あり                                          | `integrated_api` を返す                                  |
| TC-07-02 | Runtime policy | API key なし + subscription 有効                      | `terminal_handoff` を返す                                |
| TC-07-03 | Runtime policy | consumer token を渡す                                 | reject する                                              |
| TC-07-04 | Runtime policy | degraded + subscription 無効                          | no-auth handoff になる                                   |
| TC-07-05 | Main service   | `RuntimeSkillCreatorFacade.execute()` handoff path    | executor を呼ばず early return する                      |
| TC-07-06 | Main service   | `TerminalHandoffBuilder.buildForSurface()`            | shared `HandoffGuidance` を返し prompt を sanitize する  |
| TC-07-07 | Main service   | `ApprovalGate.checkApproval()` expired / already_used | 期待 reason を返す                                       |
| TC-07-08 | Main IPC       | `creatorHandlers.ts` runtime invoke                   | validation 済み request で public surface から到達できる |
| TC-07-09 | Main IPC       | `approval:respond` / `execution:get-disclosure-info`  | shared channel が利用可能                                |
| TC-07-10 | Preload        | `channels.ts` allowlist / `skill-creator-api.ts`      | invoke / on の契約が揃う                                 |
| TC-07-11 | Renderer       | `SkillLifecyclePanel.tsx` execute handoff             | console-only で終わらず visible handoff になる           |
| TC-07-12 | Regression     | Task05 / Task06 host surface 併用                     | governance owner が Renderer へ移らない                  |
