# System Spec Update Summary

## 現行正本の確認

| 観点                     | 正本ソース                                                                               | 本 task での扱い                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| workflow state owner     | `SkillCreatorWorkflowEngine`                                                             | persistence contract の起点として再利用                           |
| resume token envelope    | `packages/shared/src/types/skillCreator.ts` の current runtime contract                  | persisted checkpoint と分離して拡張方針を定義                     |
| generic session schema   | `packages/shared/src/types/agent.ts` の `PersistedSession` / `SessionStorageSchema`      | generic summary と workflow payload の境界を固定                  |
| source provenance source | `ResourceLoader.getBasePath()` と `resumeTokenEnvelope.sourceProvenance` の current fact | compatibility evaluator の入力として継承                          |
| public agent session API | `preload/index.ts` の `agent:resumeSession`                                              | 非流用。Skill Creator 側は `skill-creator:*` namespace 候補へ分離 |

## Step 1-A: 完了記録 / docs pack sync

- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/index.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/artifacts.json`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-1-requirements.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-2-design.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-3-design-review.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-4-test-creation.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-5-implementation.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-6-test-expansion.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-7-coverage-check.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-8-refactoring.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-9-quality-assurance.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-10-final-review.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-11-manual-test.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-12-documentation.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/phase-13-pr-creation.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/artifacts.json`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-1/spec-extraction-map.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-2/persistence-compatibility-matrix.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-2/checkpoint-topology.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-3/design-review-gate.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-3/skill-compliance-and-elegance-review.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-4/test-matrix.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-11/manual-test-checklist.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-11/manual-test-report.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-11/screenshot-plan.json`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-12/system-spec-update-summary.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-12/skill-feedback-report.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-13/local-check-result.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/phase-13/change-summary.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/outputs/verification-report.md`

## Step 1-B / 1-C: ステータスと関連タスクの扱い

- 本 task の status は `spec_created` を維持する。
- Task08 自体の close-out は task spec 側で完了し、実装 wave で shared types / session storage / preload/main wiring を引き継ぐ。
- 追加の unassigned task は新設しない。Task08 本文の非対象は既存 downstream wave に委譲し、`outputs/phase-12/unassigned-task-detection.md` は 0 件で閉じる。

## Step 2: aiworkflow-requirements 正本仕様の更新を実施

### 更新対象

- `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`
- `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md`

### 更新理由

- Task08 は public IPC をまだ追加していないが、persisted checkpoint / compatibility evaluator / revision / lease / `skill-creator:*` namespace rule を設計として固定した。
- `resumeTokenEnvelope` と persisted checkpoint の責務分離、source provenance の evaluator 入力化、checkpoint boundary 制約は architecture / services / lessons に反映が必要である。
- runtime orchestration 系 task のため、channel 追加がなくても owner / provenance / persistence 契約の整理が Step 2 対象になる。

### 未実装のため future wave に残す項目

- `packages/shared/src/types/skillCreator.ts` に public persisted contract を実装する
- `packages/shared/src/types/agent.ts` の generic session schema を拡張する
- `preload/channels.ts` / preload / main handler に Skill Creator workflow resume public channel を追加する
