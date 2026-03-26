# TASK-SDK-06: verify-and-improve-lifecycle-surface

## 概要

`skill-creator` runtime に verify / improve の detail surface を追加し、`execute -> verify -> improve -> apply -> re-verify` の閉ループを Task06 単独で説明できる仕様へ落とす。

## 目的

- Task02 が保持する `verifyResult` owner を崩さずに、renderer で読む surface を定義する
- Task04 が渡す phase summary と provenance summary を detail panel に拡張する
- Task05 の create 主導線と衝突しない再入場導線を定義する
- integrated / terminal handoff の 2 lane で verify / improve の境界を揃える

## 受け入れ基準

| ID   | 内容                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------- |
| AC-1 | verify と improve の役割が分離され、verify は gate、improve は提案生成として記述されている                             |
| AC-2 | source root / manifest / resource hash の provenance が result surface で追跡できる                                    |
| AC-3 | `pass` / `fail` / warning 相当の判定と次アクションが `verifyResult` から読める                                         |
| AC-4 | Task05 の mainline navigation と Task07 の governance を横取りしない                                                   |
| AC-5 | 初回スコープは Layer 1 / 2 verify に限定し、重い第2実行エンジンを作らない                                              |
| AC-6 | `improveSkillWithFeedback()` / `applyRuntimeImprovement()` / re-verify 起点の流れが 1 つの UI surface に統合されている |

## 最小読順

1. `../requirements-draft.md`
2. `../root-workflow-pack/index.md`
3. `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`
4. `../step-03-par-task-03-context-budget-and-resource-selection/index.md`
5. `../step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`
6. この `index.md`
7. `phase-1-requirements.md` / `phase-2-design.md` / `phase-5-implementation.md`

## 想定変更ポイント

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `packages/shared/src/types/skillCreator.ts`

## 非対象

- create 入口の一本化
- approval / disclosure / handoff hardening
- workflow session 永続化と resume invalidation
- Layer 3 / Layer 4 verify の導入

## 依存境界

| upstream / sibling | 前提として使う事実                                                       | Task06 で閉じる内容                         |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------- |
| Task02             | `verifyResult` / `routeSnapshot` / `sourceProvenance` の owner は engine | verify detail surface と re-entry 判断      |
| Task03             | provenance summary と degrade 情報の入力                                 | verify 対象の表示粒度                       |
| Task04             | phase summary / user input bridge / workflow state bridge                | detail panel と improve 操作導線            |
| Task05             | create 主導線                                                            | result surface から create へ戻る導線の境界 |
| Task07             | governance / handoff copy / disclosure                                   | verify fail 後の hardening 以外             |
| Task08             | session persistence / resume semantics                                   | re-verify 時点までの surface 契約           |

## 完了イメージ

- `verifyResult` が summary ではなく detail surface として読める
- improve 提案を選択適用した後、同じ workflow 文脈から re-verify 起点へ戻れる
- provenance が `resolvedSkillCreatorRoot` だけで終わらず、manifest / hash / route と結び付く
- Task05 と同時進行しても create 入口と result surface の責務が混ざらない

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
