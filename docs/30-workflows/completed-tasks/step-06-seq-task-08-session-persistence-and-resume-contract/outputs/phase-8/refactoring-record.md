# Phase 8: リファクタリング記録

## 実装日: 2026-03-28

## 用語整理

### generic / workflow 分離

| 用語                                      | 所属                  | 配置先                                      |
| ----------------------------------------- | --------------------- | ------------------------------------------- |
| `PersistedSession`                        | generic agent session | `packages/shared/src/types/agent.ts`        |
| `PersistedMessage`                        | generic agent session | `packages/shared/src/types/agent.ts`        |
| `SessionStorageSchema`                    | generic agent session | `packages/shared/src/types/agent.ts`        |
| `SkillCreatorPersistedWorkflowCheckpoint` | workflow-specific     | `packages/shared/src/types/skillCreator.ts` |
| `WorkflowSessionStorageSchema`            | workflow-specific     | `packages/shared/src/types/skillCreator.ts` |
| `SkillCreatorCompatibilitySnapshot`       | workflow-specific     | `packages/shared/src/types/skillCreator.ts` |

### checkpoint / session / resume token 分離

| 用語                  | 意味                                                    | 混同リスク                          |
| --------------------- | ------------------------------------------------------- | ----------------------------------- |
| `checkpoint`          | phase boundary で保存される workflow state の永続化単位 | session と混同しない                |
| `session`             | generic agent 対話のメタデータ (PersistedSession)       | checkpoint と混同しない             |
| `resumeTokenEnvelope` | engine 内部の resume 状態トークン (in-memory)           | persisted checkpoint と同一視しない |

### warning / conflict / invalidation 分離

| 用語                      | 意味                            | 代表理由                        |
| ------------------------- | ------------------------------- | ------------------------------- |
| `incompatible`            | 差分起因の restore 不可         | version / route / hash mismatch |
| `conflict`                | 同時書き込み起因の restore 不可 | revision / lease mismatch       |
| `compatible_with_warning` | restore 可だが UI に警告        | root relocation                 |
| `compatible`              | そのまま restore                | 全 key 一致                     |

## 完了条件チェック

- [x] generic / workflow の語が分離されている
- [x] checkpoint / token / session の語が分離されている
- [x] warning / conflict / invalidation の語が分離されている
- [x] 本Phase内の全タスクを100%実行完了
