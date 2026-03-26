# Phase 5: 実装

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 5                                       |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

workflow-specific snapshot 保存、compatibility evaluation、restore entrypoint を実装対象として確定する。

## 想定変更ポイント

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/session/SessionPersistenceService.ts`
- `apps/desktop/src/main/services/session/SessionStorage.ts`
- `apps/desktop/src/main/ipc/session-persistence-handler.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/preload/channels.ts`
- `packages/shared/src/types/skillCreator.ts`
- `packages/shared/src/types/agent.ts`

## 実装しないこと

- create / verify UI の主設計
- governance / approval / disclosure
- manifest 契約の再設計
- chat history domain model の全面再設計
- rewind / fork

## 実行タスク

- shared persisted contract を追加する
- workflow session repository を追加する
- compatibility evaluator を追加する
- public expose の有無を wiring で確定する

## 参照資料

| 資料名               | パス                                                  | 説明                      |
| -------------------- | ----------------------------------------------------- | ------------------------- |
| Phase 2 設計         | `phase-2-design.md`                                   | persisted contract の正本 |
| compatibility matrix | `outputs/phase-2/persistence-compatibility-matrix.md` | save target / rule        |
| checkpoint topology  | `outputs/phase-2/checkpoint-topology.md`              | checkpoint / restore flow |
| Phase 4 test matrix  | `outputs/phase-4/test-matrix.md`                      | 実装対象の test 観点      |

## 実行手順

### ステップ1: shared contract を追加する

- workflow-specific persisted type は `skillCreator.ts` を優先候補とし、generic persistence type は `agent.ts` に残す。
- generic `PersistedSession` は summary / LRU / title の責務を維持する。

### ステップ2: repository を追加する

- `SessionPersistenceService` を再利用する repository を追加する。
- `saveCheckpoint()`、`loadLatestCheckpoint()`、`invalidateCheckpoint()`、`evaluateResumeCompatibility()` 相当を定義する。

### ステップ3: restore entrypoint を追加する

- internal runtime entrypoint から restore する場合は `RuntimeSkillCreatorFacade` から engine へ hydrate する。
- public preload を増やす場合は `skill-creator:*` namespace で分離する。

### ステップ4: stale write を防ぐ

- revision と lease を保存し、expected revision 不一致を reject する。
- expired lease cleanup を restore 前に実行する。

## 統合テスト連携

- repository / evaluator / runtime integration を Phase 4 の suite 名に合わせて実装する。
- Phase 6 で drift / cleanup / coexistence の edge case を追加できるよう error code を安定化する。

## 実装完了の判断

- save target と invalidation 条件をコード上で一貫して説明できる
- `routeSnapshot` / `sourceProvenance` / `manifestCacheKey` を resume 判定へ渡せる
- generic session と workflow session の責務境界を維持できる
- `agent:resumeSession` と混同しない API になっている

## 成果物

| 成果物              | パス                        | 説明                        |
| ------------------- | --------------------------- | --------------------------- |
| implementation plan | `phase-5-implementation.md` | 実装対象、責務、wiring 方針 |

## 完了条件

- [ ] persisted contract の実装対象が定義されている
- [ ] repository / evaluator / restore entrypoint の責務が定義されている
- [ ] stale write guard が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
