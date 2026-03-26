# Test Matrix

| ID       | Layer      | Scenario                                         | Expected                                                                          |
| -------- | ---------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| TC-04-01 | Main IPC   | `get-workflow-state(planId)` で snapshot を返す  | `currentPhase` / `awaitingUserInput?` / `verifyResult?` が canonical shape で返る |
| TC-04-02 | Main IPC   | stale `requestId` を submit                      | domain error または unchanged snapshot を返し、phase を進めない                   |
| TC-04-03 | Preload    | listener subscribe / unsubscribe                 | cleanup 後に event を受けない                                                     |
| TC-04-04 | Renderer   | `review` phase で `single_select` request を表示 | option が見え、submit 後に local draft が reset される                            |
| TC-04-05 | Renderer   | `free_text` request を表示                       | textarea が表示される                                                             |
| TC-04-06 | Renderer   | `secret` request を表示                          | password field を使い、値を log しない                                            |
| TC-04-07 | Renderer   | `confirm` request を表示                         | yes/no action で boolean を送る                                                   |
| TC-04-08 | Renderer   | execute handoff 発生                             | `TerminalHandoffCard` または等価 UI が visible                                    |
| TC-04-09 | Renderer   | provenance summary を表示                        | source root / warning note を summary 表示する                                    |
| TC-04-10 | Regression | 既存 `executePlan()` success path                | fetch / select 等の既存 success path が崩れない                                   |
| TC-04-11 | Regression | missing workflow handler                         | graceful degradation で user-facing error を返す                                  |
| TC-04-12 | Store      | snapshot cache 更新                              | canonical snapshot は store、answer draft は local に留まる                       |
