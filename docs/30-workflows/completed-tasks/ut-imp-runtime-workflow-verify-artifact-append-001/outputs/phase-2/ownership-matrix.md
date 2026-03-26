# Phase 2 Ownership Matrix

| 項目                            | owner                        | 書き込み方法                                               | 読み取り consumer                                      |
| ------------------------------- | ---------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| `state.verifyResult`            | `SkillCreatorWorkflowEngine` | `recordExecuteResult()` / `recordVerifyFailure()` で上書き | `RuntimeSkillCreatorFacade.getWorkflowStateSnapshot()` |
| `phaseArtifacts.execute_result` | `SkillCreatorWorkflowEngine` | `appendArtifact()` で履歴追加                              | repeated failure の監査、resume consumer               |
| `phaseArtifacts.verify_result`  | `SkillCreatorWorkflowEngine` | `appendArtifact()` で pending/fail を都度追加              | facade test、履歴 consumer                             |
| `routeSnapshot` / `plan_result` | `SkillCreatorWorkflowEngine` | 既存 upsert 維持                                           | runtime provenance の参照用途                          |
| facade response                 | `RuntimeSkillCreatorFacade`  | 書き込みなし                                               | public bridge のみ                                     |

## 設計ルール

- `verify_result` は success/pending/fail を時系列で残し、failure 時も overwrite へ戻さない
- `state.verifyResult` と最新 `verify_result` artifact の payload は同値に保つ
- append 対象は `execute_result` と `verify_result` に限定し、既存 route/provenance の挙動は変えない
