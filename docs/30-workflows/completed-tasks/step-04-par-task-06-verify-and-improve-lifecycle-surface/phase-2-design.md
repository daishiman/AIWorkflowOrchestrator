# Phase 2: 設計

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

Task02 の engine owner と Task04 の bridge を前提に、verify detail surface、improve selection、apply result、re-verify 起点を実装へ渡せる topology に落とす。

## 実行タスク

- verify / improve surface topology を設計する
- shared type と IPC public surface の変更点を設計する
- provenance summary と re-entry state の表示境界を設計する
- validation matrix と sibling task 境界を設計する

## 設計一次結論

| 項目                       | 結論                                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点                   | 新規 owner を増やさず、Task02 の workflow state を renderer へ可視化する surface を足すこと                                                   |
| 依存関係・責務境界の問題点 | `ImprovementProposalPanel` は apply UI を持つが verify summary と provenance summary を持たず、Task04 summary host から detail へ降りていない |
| 価値とコストの不均衡       | verify detail surface は高価値だが standalone `skill-creator:verify` IPC を同時導入すると scope が過大になる                                  |
| 改善優先順位               | 1. detail DTO 2. panel topology 3. apply / re-verify flow 4. validation matrix                                                                |
| 4条件評価                  | 価値性・実現性・整合性・運用性は、state bridge 再利用と future scope 切り分けで満たせる                                                       |

## 参照資料

| 資料名         | パス                                                                                                                  | 説明                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 要件   | `phase-1-requirements.md`                                                                                             | AC と scope                         |
| Phase 1 抽出表 | `outputs/phase-1/spec-extraction-map.md`                                                                              | source / owner / gap                |
| Task04 抽出表  | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-1/spec-extraction-map.md`  | summary host から detail へ渡す境界 |
| Task02 抽出表  | `../completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-1/spec-extraction-map.md` | `verifyResult` owner の根拠         |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                                    | 内容                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Runtime public IPC 契約 | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                              | IPC / preload surface の設計基準                            |
| scoring gate workflow   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md` | detail panel / previous snapshot / score delta の再利用観点 |
| skill lifecycle detail  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`               | shared type と preload API の current pattern               |

### 現行コードアンカー

| ファイル                                                                  | 設計観点                                             |
| ------------------------------------------------------------------------- | ---------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`    | verify status / nextAction / provenance を出す owner |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`     | improve / apply の current flow                      |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                            | improve / apply validation と今後の bridge 追加候補  |
| `apps/desktop/src/preload/skill-creator-api.ts`                           | plan / execute / improve / apply の公開面            |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | detail panel host 候補                               |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                    | lifecycle UI state との接続点                        |
| `packages/shared/src/types/skillCreator.ts`                               | runtime detail DTO の追加候補                        |

## 実行手順

### ステップ1: surface topology を設計する

- Task04 の phase summary host から Task06 の detail panel へ `planId`, `currentPhase`, `verifyResult`, `routeSnapshot`, `sourceProvenance` を渡し、Task06 側では derived detail DTO の `route.*` へ整形して表示する
- detail panel は `summary header`, `verify section`, `improve section`, `apply result section`, `re-entry action section` の 5 区画に分ける
- renderer store は detail panel の表示状態だけを持ち、verify truth は engine owner のまま維持する

### ステップ2: shared type と DTO を設計する

- `packages/shared/src/types/skillCreator.ts` に runtime detail panel が読む DTO を追加する
- `RuntimeSkillCreatorImproveSuggestion` と `ApplyImprovementResult` は既存型を再利用する
- provenance summary は `resolvedSkillCreatorRoot`, `manifestPath`, `resourceDescriptorHash`, `manifestCacheKey`, `route.type`, `route.summary` を 1 セットで表示する

### ステップ3: apply / re-verify flow を設計する

- improve 提案選択は `ImprovementProposalPanel` を host とする
- apply 成功後は `ApplyImprovementResult` と latest provenance を同じ panel で表示する
- re-verify 起点は Task05 の create entry へ戻さず、現在の workflow 文脈から verify step を再実行する操作として置く
- terminal handoff では detail panel を閉じず、manual action の guidance を side panel として併記する

### ステップ4: validation matrix を設計する

- unit: DTO mapping / panel state / apply selection
- integration: IPC parity / preload wrapper / panel re-entry
- docs QA: sibling task boundary / provenance wording / non-goal drift

## 統合テスト連携

- Phase 4 で `outputs/phase-2/validation-matrix.md` を test matrix へ転写する
- IPC contract は `creatorHandlers.ts` / `skill-creator-api.ts` / shared type の 3 層で確認する

## 成果物

| 成果物            | パス                                               | 説明                                    |
| ----------------- | -------------------------------------------------- | --------------------------------------- |
| 設計書            | `phase-2-design.md`                                | Task06 topology と DTO 設計             |
| surface matrix    | `outputs/phase-2/verify-improve-surface-matrix.md` | concern ごとの owner / panel / boundary |
| validation matrix | `outputs/phase-2/validation-matrix.md`             | Phase 4 へ渡す検証観点                  |

## 完了条件

- [ ] verify detail surface の topology が定義されている
- [ ] shared type の追加先と再利用先が定義されている
- [ ] apply / re-verify の flow が定義されている
- [ ] provenance summary の表示項目が固定されている
- [ ] Task05 / Task07 / Task08 との境界が列挙されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3 で blocker / delegated item / Phase 4 focus を確定する。
