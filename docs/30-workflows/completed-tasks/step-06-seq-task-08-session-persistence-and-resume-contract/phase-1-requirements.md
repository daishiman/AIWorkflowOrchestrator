# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 1                                       |
| 機能名 | session-persistence-and-resume-contract |
| 作成日 | 2026-03-26                              |

## 目的

`SkillCreatorWorkflowEngine` の state を、いつ・何を・どの条件で保存し、どの差分で resume を禁止するかを定義する。

## 実行タスク

- save target を定義する
- compatibility / invalidation 要件を定義する
- checkpoint boundary を定義する
- concurrent resume / stale write 要件を定義する

## 要件レビュー一次結論

| 項目                       | 結論                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点                   | resume そのものより、「resume してよい状態か」を明文化して silent failure と silent success を防ぐこと                               |
| 依存関係・責務境界の問題点 | Task02 は memory owner を定義したが persistent owner は未定義で、Task07 の route snapshot を resume 判定へどう反映するかが残っている |
| 価値とコストの不均衡       | generic session 基盤再利用は高価値だが、chat history や UI 再入場導線まで同時に抱えると責務が膨張する                                |
| 改善優先順位               | 1. save target 2. explicit invalidation 3. checkpoint boundary 4. stale write detection 5. public exposure judgement                 |
| 4条件評価                  | 価値性: 高 / 実現性: 高 / 整合性: Task02/07 を再利用可能 / 運用性: explicit invalidation があれば維持可能                            |

## 参照資料

| 資料名       | パス                                                                         | 説明                                 |
| ------------ | ---------------------------------------------------------------------------- | ------------------------------------ |
| 要件草案     | `../requirements-draft.md`                                                   | lane 全体の session persistence 背景 |
| 親 workflow  | `../root-workflow-pack/index.md`                                             | Task08 の責務境界                    |
| Task02 index | `../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`      | workflow state owner                 |
| Task07 index | `../step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md` | route / handoff boundary             |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                                            | 内容                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| runtime foundation       | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                               | workflow state owner の正本                         |
| runtime public IPC       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | runtime bridge / provenance source の current facts |
| runtime service details  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | `RuntimeSkillCreatorFacade` / engine / handoff      |
| lessons learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | provenance / owner 分離の教訓                       |
| Agent SDK sessions index | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                                     | Agent SDK session と別契約である前提                |

### 現行コードアンカー

| ファイル                                                               | 観察点                                                                           |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | memory owner はあるが persistence / restore は未実装                             |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | `getWorkflowStateSnapshot()` はあるが save / restore API ではない                |
| `apps/desktop/src/main/services/session/SessionPersistenceService.ts`  | generic `PersistedSession` / `PersistedMessage` 永続化、LRU cleanup を持つ       |
| `apps/desktop/src/main/services/session/SessionStorage.ts`             | store schema は `sessions` / `messages` / `metadata` の 3 要素                   |
| `apps/desktop/src/main/ipc/session-persistence-handler.ts`             | handler はあるが app registration 未接続                                         |
| `apps/desktop/src/preload/index.ts` / `channels.ts`                    | `agent:resumeSession` はあるが skill creator workflow 用 public API は存在しない |
| `packages/shared/src/types/agent.ts`                                   | generic persistence types は最小限で、workflow-specific payload を表現していない |

## 実行手順

### ステップ1: save target を固定する

- 保存対象は少なくとも `planId`、`currentPhase`、`awaitingUserInput`、`verifyResult`、`phaseArtifacts`、`resumeTokenEnvelope`、`routeSnapshot`、`sourceProvenance` を含める。
- `phaseArtifacts` は phase boundary で生成された要約成果物だけを checkpoint に含め、tool streaming 中の任意途中状態は対象外とする。
- `updatedAt`、`revision`、`ownerInstanceId`、`leaseExpiresAt` を save metadata に含める。

### ステップ2: compatibility / invalidation を固定する

- `resumeTokenEnvelope.version` major 差分は hard invalidate とする。
- `sourceProvenance.resourceDescriptorHash` または `manifestCacheKey` が変化した場合は hard invalidate とする。
- `resolvedSkillCreatorRoot` だけが変化し、`resourceDescriptorHash` と `manifestCacheKey` が一致する場合は warning 付き allow 候補とする。
- `routeSnapshot.type` が変化した場合は resume 不可とする。
- stale revision と expired lease は `resume_conflict` として reject する。

### ステップ3: checkpoint boundary を固定する

- checkpoint は `review`、`execute-complete`、`verify-fail`、`handoff-ready` の phase boundary に限定する。
- `execute` 途中の mid-stream resume、tool 単位 rewind、fork は scope 外とする。
- `handoff-ready` は bundle 再表示までを含み、CLI 自動再送は含めない。

### ステップ4: public exposure 境界を固定する

- Agent SDK session と Skill Creator workflow session を同一 public API に寄せない。
- 初回は internal repository と runtime bridge 内 restore で閉じ、public preload surface 追加は Phase 2 で条件付き判断とする。
- app 未接続の generic session handler をそのまま public 化せず、workflow-specific contract を挟む。

## 統合テスト連携

- Phase 4 で save/load、compatibility、route drift、lease conflict、handoff restore の test matrix を作る。
- Phase 7 で save target と invalidation reason の coverage を確認する。
- Phase 9 で silent resume、silent fallback、single-root 前提の残存を監査する。

## 成果物

| 成果物              | パス                                     | 説明                                |
| ------------------- | ---------------------------------------- | ----------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | Task08 の要件固定                   |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | spec source と code anchor の対応表 |

## 完了条件

- [ ] save target が列挙されている
- [ ] compatibility / invalidation rule が allow / reject ベースで定義されている
- [ ] checkpoint boundary が phase boundary 単位に限定されている
- [ ] Agent SDK session と混同しない public exposure 境界が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
