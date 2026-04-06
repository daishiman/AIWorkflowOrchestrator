# Phase 12: ドキュメント変更履歴

## workflow root 更新

| ファイル                                    | 変更内容                                             |
| ------------------------------------------- | ---------------------------------------------------- |
| `index.md`                                  | status と baseline path を current facts へ是正      |
| `phase-3-implementation-plan.md`            | baseline path を current facts へ是正                |
| `phase-7-baseline.md`                       | baseline path を current facts へ是正                |
| `phase-11-refactor.md`                      | screenshot contract / TC-ID / coverage matrix を追加 |
| `artifacts.json` / `outputs/artifacts.json` | phase 4-12 completed に同期                          |

## Phase 11 成果物更新

- `manual-test-result.md`
- `manual-test-report.md`
- `manual-test-checklist.md`
- `discovered-issues.md`
- `screenshot-plan.json`
- `screenshot-coverage.md`
- `ui-sanity-visual-review.md`
- `screenshots/phase11-capture-metadata.json`

## Phase 12 成果物更新

- `implementation-guide.md`
- `system-spec-update-summary.md`
- `documentation-changelog.md`
- `unassigned-task-detection.md`
- `skill-feedback-report.md`
- `thinking-method-audit.md`
- `phase12-task-spec-compliance-check.md`

## system spec 更新

- `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`

## validation current facts

| コマンド                                                                                                                   | 結果                              |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/components/organisms/OnboardingWizard/OnboardingWizard.test.tsx` | PASS (21/21)                      |
| `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer1`                                                  | 23 passed / 10 skipped / 2 failed |
| `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2`                                                  | 7 passed / 3 failed               |

## current / baseline の区別

- current issue: `SEM-006` 2件、visual diff 3件
- baseline-only pass: `TC-11-01`〜`TC-11-04`

## 4点同期

- `index.md` 同期済み
- `phase-*.md` 同期済み
- `artifacts.json` 同期済み
- `outputs/artifacts.json` 同期済み
