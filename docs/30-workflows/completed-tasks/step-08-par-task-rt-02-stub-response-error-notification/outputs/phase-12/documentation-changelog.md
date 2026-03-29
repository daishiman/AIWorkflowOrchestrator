# Phase 12: Documentation Changelog

## current / baseline 差分

| 項目                              | baseline                                 | current                                                |
| --------------------------------- | ---------------------------------------- | ------------------------------------------------------ |
| `RuntimeSkillCreatorPlanResponse` | `PlanResult \| terminal_handoff`         | `PlanResult \| PlanErrorResponse \| terminal_handoff`  |
| `plan()` degraded path            | stub success `{skillName:"", agents:[]}` | explicit error `{success:false, error:{code,message}}` |
| `improve()` degraded path         | stub `{improveId, suggestions:[]}`       | explicit error `{success:false, error:{code,message}}` |
| renderer plan handling            | IPC wrapper チェックのみ                 | IPC wrapper + logical error type guard                 |
| reason code 定数                  | なし                                     | `DEGRADED_REASON_MESSAGES` in Facade                   |
