# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 1                                    |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

verify / improve / apply / re-verify を 1 本の lifecycle surface として扱う要件を固定し、Task02 の state owner と Task04 の state bridge を前提に Task06 の責務を明文化する。

## 実行タスク

- 真の論点を 1 文で固定する
- verify / improve / apply / re-entry の責務境界を分類する
- provenance 表示要件と verify 対象要件を固定する
- integrated / terminal handoff の lane 差分を整理する
- Task05 / Task07 / Task08 へ委譲する項目を切り出す

## 要件レビュー一次結論

| 項目                       | 結論                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 真の論点                   | Task06 の主問題は verify ロジックを増やすことではなく、既存 owner を使って detail surface を定義すること              |
| 依存関係・責務境界の問題点 | Task02 は `verifyResult` owner を固定したが public detail surface を持たず、Task04 は summary host までで止まっている |
| 価値とコストの不均衡       | provenance 付き result surface は高価値だが Layer 3 / 4 verify まで同時に閉じると scope が膨らむ                      |
| 改善優先順位               | 1. owner 維持 2. provenance 表示 3. improve / apply / re-entry 4. downstream boundary 固定                            |
| 4条件評価                  | 価値性: 高 / 実現性: 高 / 整合性: Task02-04 を再利用すれば維持可能 / 運用性: Task07-08 へ委譲を明記すれば維持可能     |

## 受け入れ基準

| ID   | 要件                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------- |
| AC-1 | verify は Layer 1 / 2 gate、improve は提案生成として別契約で定義されている                     |
| AC-2 | `verifyResult` と `sourceProvenance` を同じ surface 上で読める                                 |
| AC-3 | `pass` / `fail` / warning 相当の判定と `nextAction` を UI 上で判断できる                       |
| AC-4 | `applyRuntimeImprovement()` の結果から re-verify 起点へ戻れる                                  |
| AC-5 | Task05 の create 主導線と Task06 の result surface の責務が分離されている                      |
| AC-6 | terminal handoff は verify detail の代替ではなく、manual lane の guidance として説明されている |

## 参照資料

| 資料名       | パス                                                                       | 説明                                |
| ------------ | -------------------------------------------------------------------------- | ----------------------------------- |
| 要件草案     | `../requirements-draft.md`                                                 | verify / improve 閉ループ要件の正本 |
| 親 workflow  | `../root-workflow-pack/index.md`                                           | Task06 の依存順と境界               |
| 実行ガイド   | `../executor-guide.md`                                                     | sibling task との責務分離           |
| Task02 index | `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md` | owner baseline                      |
| Task03 index | `../step-03-par-task-03-context-budget-and-resource-selection/index.md`    | provenance input                    |
| Task04 index | `../step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`     | summary host と state bridge        |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                                    | 内容                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Runtime public IPC 契約    | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                              | runtime IPC / preload の前提                         |
| Runtime route / provenance | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`             | facade / route snapshot / provenance の current fact |
| scoring / previousAnalysis | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md` | detail surface で再利用する評価系 UX パターン        |
| skill lifecycle detail     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`               | `evaluatePrompt` / shared type 再利用観点            |

### 現行コードアンカー

| ファイル                                                                  | 観察点                                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`    | `verifyResult` / `routeSnapshot` / `sourceProvenance` の owner              |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`     | `improve()` / `applyImprovement()` の current contract                      |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                            | improve / apply の public IPC validation                                    |
| `apps/desktop/src/preload/skill-creator-api.ts`                           | renderer が呼べる public runtime surface                                    |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` | apply UI は存在するが verify detail を持たない                              |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                    | `currentAnalysis` / `previousAnalysis` はあるが runtime verify state はない |
| `packages/shared/src/types/skillCreator.ts`                               | runtime public response 型の配置先                                          |

## 実行手順

### ステップ0: 現行実装を固定する

- `SkillCreatorWorkflowEngine` の `verifyResult` と `sourceProvenance` の shape を記録する
- `RuntimeSkillCreatorFacade.improve()` と `applyImprovement()` の public contract を記録する
- `ImprovementProposalPanel` が現在扱える情報と未保持情報を切り分ける

### ステップ1: Task06 が閉じる責務を固定する

- verify detail surface
- improve suggestion selection
- apply result summary
- re-verify 起点
- provenance summary

### ステップ2: 非対象を固定する

- create 主導線は Task05 に残す
- approval / disclosure / handoff の hardening は Task07 に残す
- session persistence / resume invalidation は Task08 に残す
- verify execution engine の高度化は future scope に送る

### ステップ3: spec extraction map を出力する

- system spec source
- current code anchor
- fixed owner
- Task06 の設計判断
- delegated gap

## 統合テスト連携

- Phase 4 で `verify detail rendering` / `improve suggestion selection` / `apply result` / `re-entry` の 4 観点を test matrix 化する
- Phase 9 で IPC validation と shared type parity を再確認する

## 成果物

| 成果物              | パス                                     | 説明                                      |
| ------------------- | ---------------------------------------- | ----------------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | Task06 の要件固定                         |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | spec source / code anchor / delegated gap |

## 完了条件

- [ ] AC-1 から AC-6 までが本文で定義されている
- [ ] verify / improve / apply / re-entry の責務境界が分離されている
- [ ] provenance 表示要件が fixed されている
- [ ] Task05 / Task07 / Task08 へ委譲する項目が列挙されている
- [ ] `outputs/phase-1/spec-extraction-map.md` の作成対象が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2 で surface topology、state bridge、validation matrix を設計する。
