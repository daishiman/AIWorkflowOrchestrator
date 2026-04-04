# Phase 12: Documentation Changelog

## current / baseline 差分

| 項目                                      | baseline                                 | current                                                |
| ----------------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| `RuntimeSkillCreatorPlanResponse`         | `PlanResult \| terminal_handoff`         | `PlanResult \| PlanErrorResponse \| terminal_handoff`  |
| `RuntimeSkillCreatorImproveErrorResponse` | 既存だが docs 未反映                     | `plan` と同型の explicit error response を明示         |
| `plan()` degraded path                    | stub success `{skillName:"", agents:[]}` | explicit error `{success:false, error:{code,message}}` |
| `improve()` degraded path                 | stub `{improveId, suggestions:[]}`       | explicit error `{success:false, error:{code,message}}` |
| `execute()` degraded path                 | success path のみ                        | `success:false` + `error` を返却                       |
| governance audit 終了                     | early return で未記録                    | `onSessionEnd()` を degraded path で呼ぶ               |
| renderer plan handling                    | IPC wrapper チェックのみ                 | IPC wrapper + logical error type guard                 |
| reason code 定数                          | なし                                     | `DEGRADED_REASON_MESSAGES` in Facade                   |
| screenshot evidence                       | placeholder 参照                         | `TC-01/03/06` + `RT-02-01/02` 実画面 PNG               |
