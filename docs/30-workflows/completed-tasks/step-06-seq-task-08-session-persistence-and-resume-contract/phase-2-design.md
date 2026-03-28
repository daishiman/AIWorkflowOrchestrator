# Phase 2: 設計

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 2                                       |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

generic session 基盤を再利用しながら、workflow-specific snapshot、checkpoint topology、compatibility evaluator、stale write guard を設計する。

## 実行タスク

- workflow-specific persisted contract を設計する
- checkpoint topology を設計する
- compatibility evaluator を設計する
- repository / IPC / preload の境界を設計する

## 参照資料

| 資料名       | パス                                                                         | 説明                             |
| ------------ | ---------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件 | `phase-1-requirements.md`                                                    | save target / invalidation 要件  |
| Task02 index | `../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`      | state owner と source provenance |
| Task07 index | `../step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md` | route / handoff boundary         |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                        | 内容                               |
| ----------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| runtime foundation      | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`           | engine owner の正本                |
| runtime public IPC      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | public bridge と provenance source |
| runtime service details | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | facade / engine / handoff の分離   |

### 現行コードアンカー

| ファイル                                                               | 設計観点                                                                |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | serialized source。persist 対象の正本                                   |
| `apps/desktop/src/main/services/session/SessionPersistenceService.ts`  | generic CRUD、cleanup、stats。workflow repository が再利用する土台      |
| `apps/desktop/src/main/services/session/SessionStorage.ts`             | schema 拡張か wrapper store かを判断する場所                            |
| `apps/desktop/src/main/ipc/session-persistence-handler.ts`             | generic IPC envelope を流用するか、workflow 専用 handler を別に立てるか |
| `apps/desktop/src/main/ipc/index.ts`                                   | registration point                                                      |
| `apps/desktop/src/preload/index.ts` / `channels.ts`                    | public preload を増やす場合の 4 層整合点                                |
| `packages/shared/src/types/skillCreator.ts`                            | workflow-specific persisted type の配置候補                             |
| `packages/shared/src/types/agent.ts`                                   | generic store config / error code / storage schema の配置先             |

## 実行手順

### ステップ1: persisted contract を設計する

- `PersistedSession` は session list / LRU / summary 用に維持し、workflow-specific payload は別 contract に分離する。
- 新規 contract は `planId`、`phaseBoundary`、`workflowStateSnapshot`、`compatibilitySnapshot`、`checkpointHistory`、`revision`、`lease`、`invalidatedAt?` を持つ。
- `workflowStateSnapshot` には `awaitingUserInput`、`verifyResult`、`phaseArtifacts`、`resumeTokenEnvelope` を格納する。
- `compatibilitySnapshot` には `routeSnapshot`、`sourceProvenance`、`manifestCacheKey?`、`resourceDescriptorHash?`、`engineVersion` を格納する。

### ステップ2: checkpoint topology を設計する

- `review-ready`、`execute-complete`、`verify-fail`、`handoff-ready` を checkpoint 種別とする。
- `execute` 途中は checkpoint 化しない。
- `handoff-ready` checkpoint は `TerminalHandoffBundle` の再表示情報までを持ち、外部 CLI 実行状態は持たない。
- checkpoint history は最新 1 件必須、追加で直近 N 件保持は optional とする。初回は latest-only でよい。

### ステップ3: compatibility evaluator を設計する

- evaluator は `resumeTokenEnvelope.version`、`routeSnapshot.type`、`manifestCacheKey`、`resourceDescriptorHash`、`resolvedSkillCreatorRoot`、`lease` を比較する。
- 結果は `compatible`、`compatible_with_warning`、`incompatible`、`conflict` の 4 値とする。
- `routeSnapshot.type` 差分は `incompatible`。
- `revision` 差分または active lease 差分は `conflict`。
- `resolvedSkillCreatorRoot` だけが変化し hash/cached key が一致する場合は `compatible_with_warning`。

### ステップ4: repository / IPC 境界を設計する

- `SkillCreatorWorkflowSessionRepository` を main service として設け、`SessionPersistenceService` を内部依存にする。
- 初回は main 内部 repository 経由を正本とし、generic `session:persist:*` の public expose は据え置く。
- public preload を増やす場合は `skill-creator:*` namespace で追加し、`agent:resumeSession` と分離する。
- 4 層整合が必要な場合のみ `channels.ts`、preload、main handler、shared type を同 wave で更新する。

## 統合テスト連携

- Phase 4 で persisted contract、checkpoint topology、compatibility evaluator を test case へ変換する。
- repository test と IPC test を分け、generic session CRUD 回帰も残す。
- Phase 9 で public channel 増設の有無に応じた 4 層整合監査を行う。

## 成果物

| 成果物                           | パス                                                  | 説明                                      |
| -------------------------------- | ----------------------------------------------------- | ----------------------------------------- |
| 設計書                           | `phase-2-design.md`                                   | persisted contract / topology / evaluator |
| persistence compatibility matrix | `outputs/phase-2/persistence-compatibility-matrix.md` | 保存対象と compatibility rule             |
| checkpoint topology              | `outputs/phase-2/checkpoint-topology.md`              | checkpoint 種別と restore flow            |

## 完了条件

- [ ] workflow-specific persisted contract が generic session contract と分離されている
- [ ] checkpoint 種別と restore boundary が定義されている
- [ ] compatibility evaluator が allow / warning / reject / conflict を返せる
- [ ] Agent SDK session と Skill Creator workflow session の API 境界が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
