# Phase 12: ドキュメント更新履歴 — UT-HEALTH-POLICY-RUNTIME-INJECTION-001

## 更新ファイル一覧

### 実装 / テスト

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`

### Phase 11

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/ui-sanity-visual-review.md`
- `outputs/phase-11/phase11-capture-metadata.json`
- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/manual-test-tc01-05.md`
- `outputs/phase-11/manual-test-tc06-08.md`

### Phase 12

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`

### `.claude` / system spec

- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`

### Artifacts

- `outputs/artifacts.json`

## current / baseline

| 区分       | baseline                         | current                                              |
| ---------- | -------------------------------- | ---------------------------------------------------- |
| 対象タスク | 旧タスクの成果物                 | `UT-HEALTH-POLICY-RUNTIME-INJECTION-001`             |
| 実装       | healthPolicy DI 未接続           | DI 接続 + resolveHealthPolicy 生成を反映             |
| テスト     | degraded policy の統合テストなし | plan/execute/improve に追加                          |
| Phase 11   | 記録なし                         | NON_VISUAL + static verification + manual smoke 記録 |

## 変更理由

ワークフロー成果物と `.claude` の system spec を current facts に合わせて再同期した。
