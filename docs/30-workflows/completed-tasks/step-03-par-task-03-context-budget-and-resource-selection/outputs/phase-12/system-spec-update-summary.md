# System Spec Update Summary

## 現行正本の確認

| 観点                       | 正本ソース                                                                                                      | 本 task での扱い                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| manifest schema version    | `packages/shared/src/types/skillCreator.ts` の `WORKFLOW_MANIFEST_SCHEMA_VERSION = 1`                           | 変更なし。Task03 は既存 schema を前提に planner を組み立てる               |
| phase 単位の resource 指定 | `WorkflowManifestPhase.resourceIds?: string[]`                                                                  | planner の開始点として明文化した                                           |
| foundation snapshot        | `LoadedWorkflowManifest.sourcePath` / `manifestDir` / `manifestMtimeMs` / `resourceDescriptorHash` / `cacheKey` | Task01 由来の正本として再利用し、Task03 extension と分離した               |
| runtime execute response   | `RuntimeSkillCreatorExecuteResponse`                                                                            | public IPC 形状は変更しない方針を明記した                                  |
| leaf resource read         | `apps/desktop/src/main/services/skill/ResourceLoader.ts`                                                        | source authority ではなく leaf reader / compatibility adapter と位置づけた |

## Step 1: この wave で更新した task spec / docs pack

### Task03 本体

- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/index.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/phase-1-requirements.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/phase-2-design.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/phase-3-design-review.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/phase-5-implementation.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/phase-11-manual-test.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/phase-12-documentation.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/phase-13-pr-creation.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/artifacts.json`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/artifacts.json`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-1/spec-extraction-map.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-2/source-resolution-matrix.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-2/budget-degrade-matrix.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-3/design-review-gate.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-3/skill-compliance-and-elegance-review.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-11/manual-test-checklist.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-11/manual-test-report.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/system-spec-update-summary.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/skill-feedback-report.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-13/local-check-result.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/phase-13/change-summary.md`
- `docs/30-workflows/completed-tasks/step-03-par-task-03-context-budget-and-resource-selection/outputs/verification-report.md`

### lane / downstream への前提同期

- `docs/30-workflows/skill-creator-agent-sdk-lane/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/executor-guide.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/requirements-draft.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/root-workflow-pack/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/root-workflow-pack/phase-1-requirements.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/root-workflow-pack/phase-2-design.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-1-requirements.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-2-design.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-03-par-task-04-user-interaction-bridge-and-phase-ui/phase-1-requirements.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-03-par-task-04-user-interaction-bridge-and-phase-ui/phase-2-design.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-04-par-task-05-create-entry-mainline-unification/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-04-par-task-05-create-entry-mainline-unification/phase-1-requirements.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-04-par-task-05-create-entry-mainline-unification/phase-2-design.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-04-par-task-06-verify-and-improve-lifecycle-surface/phase-1-requirements.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-04-par-task-06-verify-and-improve-lifecycle-surface/phase-2-design.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-05-seq-task-07-execution-governance-and-handoff-alignment/phase-1-requirements.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-05-seq-task-07-execution-governance-and-handoff-alignment/phase-2-design.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-1-requirements.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-2-design.md`

## Step 2: aiworkflow-requirements 正本仕様を更新した

- 今回の差分は public IPC shape 追加ではないが、runtime の internal contract と provenance snapshot の current fact が増えているため、Step 2 を no-op にはしない。
- 同一 wave で、以下の正本仕様書を更新した。
  - `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`
  - `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`
  - `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
  - `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md`
  - `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
  - `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
- Step 2 更新ありとした根拠は次の 5 点。
  - `RuntimeSkillCreatorFacade` に `sourceResolver` / `resourcePlanner` / `resolvedResourceReader` / `ManifestLoader` を使う dynamic resource pipeline が追加された。
  - `SkillCreatorWorkflowSourceProvenance` に `candidateRoots` / `selectedRoots` / `selectedResourceIds` / `droppedResourceIds` / `structureSignature` / `degradeReasons` が追加された。
  - `planPromptConstants.ts` / `improvePromptConstants.ts` に operation 別 `PhaseResourceRequest[]` と context budget 定数が追加された。
  - `apps/desktop/src/main/services/skill/constants.ts` に `getSkillCreatorRootCandidates()` が追加され、`explicit -> env -> home -> repo` の root discovery 順が実装事実になった。
  - これらは public response を変えない一方で、runtime service detail / reference bundle / lessons / completed ledger / indexes が持つべき current fact である。

## 次 wave で Step 2 を reopen する条件

- `packages/shared/src/types/skillCreator.ts` に public field 追加が入る。
- `apps/desktop/src/main/services/runtime/ManifestLoader.ts` または Task03 pipeline の provenance field が増減する。
- `RuntimeSkillCreatorExecuteResponse` など IPC の公開レスポンス形状が変わる。
