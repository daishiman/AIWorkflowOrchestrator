# Persistence Compatibility Matrix

## 保存対象マトリクス

| 保存対象                   | source of truth                     | persisted location                  | 必須     | compatibility rule                        |
| -------------------------- | ----------------------------------- | ----------------------------------- | -------- | ----------------------------------------- |
| `planId`                   | `SkillCreatorWorkflowStateSnapshot` | workflow-specific snapshot          | ✅       | 一致必須                                  |
| `currentPhase`             | `SkillCreatorWorkflowStateSnapshot` | workflow-specific snapshot          | ✅       | checkpoint type と整合必須                |
| `awaitingUserInput`        | `SkillCreatorWorkflowStateSnapshot` | workflow-specific snapshot          | 条件付き | `review-ready` で必須                     |
| `verifyResult`             | `SkillCreatorWorkflowStateSnapshot` | workflow-specific snapshot          | 条件付き | `verify-fail` / `execute-complete` で保持 |
| `phaseArtifacts`           | `SkillCreatorWorkflowStateSnapshot` | workflow-specific snapshot          | ✅       | `artifactCount` と整合必須                |
| `resumeTokenEnvelope`      | `SkillCreatorWorkflowStateSnapshot` | workflow-specific snapshot          | ✅       | version 一致必須                          |
| `routeSnapshot`            | `resumeTokenEnvelope` / state       | compatibility snapshot              | ✅       | `type` 差分は reject                      |
| `sourceProvenance`         | `resumeTokenEnvelope` / state       | compatibility snapshot              | ✅       | hash / cache key 差分は reject            |
| `manifestCacheKey`         | provenance extension                | compatibility snapshot              | 条件付き | 差分は reject                             |
| `resourceDescriptorHash`   | provenance extension                | compatibility snapshot              | 条件付き | 差分は reject                             |
| `resolvedSkillCreatorRoot` | provenance extension                | compatibility snapshot              | 条件付き | hash/cacheKey 一致時のみ warning allow    |
| `revision`                 | persistence repository              | workflow-specific snapshot metadata | ✅       | expected revision 不一致は conflict       |
| `lease`                    | persistence repository              | workflow-specific snapshot metadata | ✅       | active lease 他者保有は conflict          |

## compatibility evaluator 結果

| status                    | 意味                                      | 代表理由                         |
| ------------------------- | ----------------------------------------- | -------------------------------- |
| `compatible`              | そのまま restore してよい                 | 全 key 一致                      |
| `compatible_with_warning` | restore は許可するが UI に warning を出す | root relocation only             |
| `incompatible`            | restore 不可                              | version / route / hash mismatch  |
| `conflict`                | 現在の writer と競合                      | revision mismatch / active lease |

## invalidation rule

| ケース                                        | 結果                      |
| --------------------------------------------- | ------------------------- |
| `resumeTokenEnvelope.version` major 差分      | `incompatible`            |
| `routeSnapshot.type` 差分                     | `incompatible`            |
| `manifestCacheKey` 差分                       | `incompatible`            |
| `resourceDescriptorHash` 差分                 | `incompatible`            |
| `resolvedSkillCreatorRoot` のみ差分           | `compatible_with_warning` |
| 他 writer が active lease を保持              | `conflict`                |
| expected revision と stored revision が不一致 | `conflict`                |
