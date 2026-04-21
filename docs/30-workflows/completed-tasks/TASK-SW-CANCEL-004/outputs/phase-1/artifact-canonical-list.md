# Artifact Canonical List

## タスクID: TASK-SW-CANCEL-004

## Phase 別 Canonical Artifacts

| Phase | 成果物パス                                               |
| ----- | -------------------------------------------------------- |
| 1     | `outputs/phase-1/requirements-definition.md`             |
| 1     | `outputs/phase-1/current-implementation-audit.md`        |
| 1     | `outputs/phase-1/artifact-canonical-list.md`             |
| 2     | `outputs/phase-2/solution-design.md`                     |
| 2     | `outputs/phase-2/subagent-lane-plan.md`                  |
| 2     | `outputs/phase-2/validation-path.md`                     |
| 3     | `outputs/phase-3/design-review-result.md`                |
| 3     | `outputs/phase-3/solution-elegance-review.md`            |
| 3     | `outputs/phase-3/review-prompt.txt`                      |
| 4     | `outputs/phase-4/test-scenarios.md`                      |
| 4     | `outputs/phase-4/command-expectations.md`                |
| 5     | `outputs/phase-5/implementation-summary.md`              |
| 5     | `outputs/phase-5/confirmation-checklist.md`              |
| 6     | `outputs/phase-6/edge-case-expansion-plan.md`            |
| 7     | `outputs/phase-7/coverage-report.md`                     |
| 8     | `outputs/phase-8/refactor-decision-log.md`               |
| 9     | `outputs/phase-9/quality-gate-report.md`                 |
| 10    | `outputs/phase-10/final-review-result.md`                |
| 11    | `outputs/phase-11/manual-test-result.md`                 |
| 11    | `outputs/phase-11/manual-test-checklist.md`              |
| 11    | `outputs/phase-11/discovered-issues.md`                  |
| 12    | `outputs/phase-12/implementation-guide.md`               |
| 12    | `outputs/phase-12/system-spec-update-summary.md`         |
| 12    | `outputs/phase-12/documentation-changelog.md`            |
| 12    | `outputs/phase-12/unassigned-task-detection.md`          |
| 12    | `outputs/phase-12/skill-feedback-report.md`              |
| 12    | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 実装対象ファイル

| ファイル                                                                    | 変更種別                                        |
| --------------------------------------------------------------------------- | ----------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`          | 修正（Pattern B: startGeneration 呼び出し追加） |
| `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.e2e.test.ts` | 新規作成（E2E テスト）                          |
