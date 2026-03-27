# Spec Extraction Map

Task07 は Skill Creator レーンに shared governance bundle を適用し、`integrated_api` / `terminal_handoff` / approval / disclosure / manual boundary を 1 つの説明可能な契約へ束ねる task である。

## Source Map

| source                                                                                    | 取り込む事実                                                           | Task07 への反映                                |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| `../requirements-draft.md`                                                                | API primary / handoff secondary、manual boundary、graceful degradation | lane priority と governance bundle を固定する  |
| `../root-workflow-pack/index.md`                                                          | Task07 は governance hardening、Task08 は persistence                  | Task08 へ前提だけ渡す                          |
| `../step-03-par-task-03-context-budget-and-resource-selection/index.md`                   | degrade signal と provenance は upstream で決定済み                    | Task07 では disclosure / handoff に適用する    |
| `../step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`                    | visible handoff と phase host は Task04 で前提化済み                   | Task07 は governance wording と接続だけを担う  |
| `../../completed-tasks/step-04-par-task-05-create-entry-mainline-unification/index.md`    | mainline host は Task05 の責務                                         | governance owner を Task05 へ渡さない          |
| `../../completed-tasks/step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md` | verify / improve host は Task06 の責務                                 | governance slot だけ渡し、authority は渡さない |
| `../../unassigned-task/UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001.md`                    | public IPC wiring drift が既知 gap                                     | Task07 scope で吸収する                        |

## System Spec Map

| spec                                                            | current fact                                                     | Task07 の設計判断                         |
| --------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------- |
| `workflow-ai-runtime-execution-responsibility-realignment.md`   | route authority は Main、same-wave sync が必要                   | route authority を Renderer へ移さない    |
| `ui-ux-agent-execution-core.md`                                 | `HandoffGuidance` と Manual Boundary MB-1〜MB-4 が canonical     | Skill Creator 独自 DTO を増やさない       |
| `api-ipc-system-core.md`                                        | `approval:*` / `execution:get-disclosure-info` は shared channel | Skill Creator 専用 channel を追加しない   |
| `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | consumer -> DTO mapping がある                                   | shared `HandoffGuidance` 再利用を固定する |

## Code Anchor Map

| code anchor                    | current fact                                           | Task07 の設計判断                                      |
| ------------------------------ | ------------------------------------------------------ | ------------------------------------------------------ |
| `RuntimePolicyResolver.ts`     | consumer token guard と degraded fallback が既にある   | route authority の正本とする                           |
| `RuntimeSkillCreatorFacade.ts` | handoff 時 early return する                           | plan / execute / improve で同じ governance を使う      |
| `TerminalHandoffBuilder.ts`    | `buildForSurface()` が shared `HandoffGuidance` を返す | Skill Creator でも同 DTO を使う                        |
| `ApprovalGate.ts`              | one-time token / TTL / single-use を enforcement       | approval owner を Main に固定する                      |
| `creatorHandlers.ts`           | public `skill-creator:*` invoke 境界                   | internal adapter と public surface の drift を解消する |
| `skill-creator-api.ts`         | approval / disclosure wrapper がない                   | shared governance surface との接続点を明記する         |
| `SkillLifecyclePanel.tsx`      | execute handoff が console-only TODO                   | visible handoff を必須化する                           |

## Non-goals

| 項目                                  | 理由                       |
| ------------------------------------- | -------------------------- |
| create entry の最終一本化             | Task05 の責務              |
| verify / improve detail surface       | Task06 の責務              |
| persistence / resume の durable shape | Task08 の責務              |
| advanced console 全体の UI 改修       | shared governance 側の責務 |
