# Phase 12: Documentation Changelog

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## workflow / evidence

| 区分              | 更新ファイル                                                                                                                                                 | 変更内容                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| workflow          | `index.md`                                                                                                                                                   | Phase 1-12 completed / Phase 13 blocked に同期 |
| workflow          | `artifacts.json`, `outputs/artifacts.json`                                                                                                                   | status / artifacts / AC を実績化               |
| phase spec        | `phase-11-manual-test.md`                                                                                                                                    | TC-11-01〜06 と画面カバレッジマトリクスを追加  |
| phase spec        | `phase-12-documentation.md`                                                                                                                                  | 先送り表現禁止と formalize 必須を明記          |
| phase11 output    | `manual-test-checklist.md`, `manual-test-result.md`, `manual-test-report.md`, `ui-sanity-visual-review.md`, `screenshot-plan.json`, `screenshot-coverage.md` | 実画面証跡へ置換                               |
| phase11 output    | `screenshots/*.png`, `screenshots/phase11-capture-metadata.json`                                                                                             | Playwright harness で実画面 6 件を再取得       |
| phase6/7/9 output | `coverage-report-after.txt`, `uncovered-lines.md`, `lint-result.txt`, `typecheck-result.txt`, `test-result.txt`                                              | artifacts 欠落を補完                           |

## harness / capture

| ファイル                                                                       | 変更内容                                                |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `apps/desktop/src/renderer/phase11-agentview-improve-route.html`               | Task04 専用 harness entry                               |
| `apps/desktop/src/renderer/phase11-agentview-improve-route.tsx`                | App 実画面用 mock / store bootstrap / onboarding bypass |
| `apps/desktop/scripts/capture-task-skill-lifecycle-routing-step03-phase11.mjs` | TC-11-01〜06 capture script                             |
| `apps/desktop/package.json`                                                    | `screenshot:skill-lifecycle-routing-step03` script 追加 |

## system spec

| ファイル                                                                                                       | 変更内容                                                                  |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                        | Task04 navigation contract 追加                                           |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                              | Task04 store/state 契約追加                                               |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`                      | AgentView CTA / SkillAnalysisView optional props 追加                     |
| `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md` | Task04 handoff を統合正本へ追加                                           |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                           | completed family 説明更新                                                 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle.md`                 | Task04 逆引き追加                                                         |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-ui.md`              | Task04 completed record 追加                                              |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                   | Task04 follow-up 8 件追加                                                 |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md`                    | Task04 教訓追加                                                           |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                 | index 更新                                                                |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md`                              | AgentView 改善 CTA バナー仕様と SkillAnalysisView round-trip props を追加 |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                                  | generate-index で再生成（Task04 追加差分を反映）                          |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                                                 | generate-index で再生成                                                   |

## skill improvement

| ファイル                                                                     | 変更内容                                              |
| ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| `.claude/skills/task-specification-creator/scripts/validate-phase-output.js` | artifacts / Phase11 補助成果物 / 先送り表現の検出追加 |
| `.claude/skills/task-specification-creator/LOGS.md`                          | 今回の validator 強化を記録                           |
| `.claude/skills/task-specification-creator/SKILL.md`                         | 変更履歴を更新                                        |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                             | Task04 system spec 同期を記録                         |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                            | 変更履歴を更新                                        |

## mirror sync

| 操作                                        | 結果                            |
| ------------------------------------------- | ------------------------------- |
| `.claude/skills/` → `.agents/skills/` rsync | 差分 0（`diff -rq` で確認済み） |

## unassigned task formalize

| 件数 | 反映先                               |
| ---- | ------------------------------------ |
| 9    | `docs/30-workflows/unassigned-task/` |
