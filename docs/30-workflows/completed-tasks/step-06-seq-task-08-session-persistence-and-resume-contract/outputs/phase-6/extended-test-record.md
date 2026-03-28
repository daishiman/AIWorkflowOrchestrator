# Phase 6: テスト拡充記録

## 実装日: 2026-03-28

## 追加テスト一覧

### ResumeCompatibilityEvaluator.test.ts (12 tests)

| ケース                              | 観点         | assertion                         |
| ----------------------------------- | ------------ | --------------------------------- |
| 全フィールド一致                    | baseline     | compatible                        |
| version major 差分 (RG-03)          | incompatible | version_mismatch                  |
| route type 差分 (RG-04)             | incompatible | route_type_mismatch               |
| resourceDescriptorHash 差分 (RG-05) | incompatible | resource_descriptor_hash_mismatch |
| manifestCacheKey 差分               | incompatible | manifest_cache_key_mismatch       |
| root のみ変更 (RG-06)               | warning      | root_relocation_warning           |
| 他者 active lease (RG-07)           | conflict     | active_lease_conflict             |
| 自分が lease owner                  | compatible   | no conflict                       |
| lease expired                       | compatible   | no conflict                       |
| invalidated checkpoint              | incompatible | checkpoint_not_found              |
| 複数 reason 同時発生                | incompatible | 3 reasons                         |
| incompatible > conflict 優先度      | incompatible | mixed reasons                     |

### SkillCreatorWorkflowSessionRepository.test.ts (19 tests)

| ケース                          | 観点         | assertion                |
| ------------------------------- | ------------ | ------------------------ |
| review-ready save/load (RG-01)  | persistence  | checkpoint 復元          |
| handoff-ready save/load (RG-02) | persistence  | bundle 復元              |
| execute-complete save/load      | persistence  | verify pending 復元      |
| revision increment              | persistence  | 1 → 2                    |
| revision mismatch (RG-08)       | stale write  | save rejected            |
| expectedRevision 必須           | stale write  | save rejected            |
| active lease conflict (RG-07)   | stale write  | save rejected            |
| expired lease                   | stale write  | save allowed             |
| invalidate → load               | invalidation | undefined                |
| nonexistent invalidate          | edge         | false                    |
| evaluate nonexistent            | evaluation   | incompatible             |
| evaluate matching               | evaluation   | compatible               |
| malformed payload evaluate      | evaluation   | missing_workflow_payload |
| listCheckpoints                 | filtering    | invalidated excluded     |
| cleanupExpiredLeases            | cleanup      | lease removed            |
| legacy session (RG-09)          | coexistence  | undefined                |
| malformed payload load          | coexistence  | undefined                |
| deleteCheckpoint (RG-10)        | cleanup      | undefined                |

### SkillCreatorWorkflowEngine.persistence.test.ts (8 tests)

| ケース                     | 観点          | assertion                        |
| -------------------------- | ------------- | -------------------------------- |
| review-ready hydrate       | hydration     | currentPhase + awaitingUserInput |
| hydrate → getWorkflowState | hydration     | state accessible                 |
| phaseArtifacts 復元        | hydration     | 2 artifacts                      |
| resumeTokenEnvelope 復元   | hydration     | version + planId                 |
| verify-fail hydrate        | hydration     | verifyResult.status=fail         |
| handoff-ready hydrate      | hydration     | handoffBundle.launcher           |
| serialize nonexistent      | serialization | empty array                      |
| serialize after hydrate    | serialization | 2 entries                        |

## 完了条件チェック

- [x] drift / conflict / cleanup / coexistence の edge case が列挙されている
- [x] warning と reject の差が test case で分離されている
- [x] 本Phase内の全タスクを100%実行完了
