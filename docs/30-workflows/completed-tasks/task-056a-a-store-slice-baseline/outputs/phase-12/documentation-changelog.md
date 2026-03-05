# Phase 12 ドキュメント更新履歴

## 2026-03-05

### 追加

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/acceptance-criteria.md`
- `outputs/phase-1/scope-matrix.md`
- `outputs/phase-2/slice-inventory-design.md`
- `outputs/phase-2/slice-boundary-design.md`
- `outputs/phase-2/selector-policy-design.md`
- `outputs/phase-3/design-review-result.md`
- `outputs/phase-3/review-findings.md`
- `outputs/phase-4/test-specification.md`
- `outputs/phase-4/test-cases.md`
- `outputs/phase-4/test-run-plan.md`
- `outputs/phase-5/implementation-summary.md`
- `outputs/phase-5/slice-inventory.md`
- `outputs/phase-5/slice-boundary-matrix.md`
- `outputs/phase-6/test-expansion-summary.md`
- `outputs/phase-6/regression-cases.md`
- `outputs/phase-7/coverage-report.md`
- `outputs/phase-7/coverage-gate-result.md`
- `outputs/phase-8/refactoring-report.md`
- `outputs/phase-8/naming-diff.md`
- `outputs/phase-9/quality-report.md`
- `outputs/phase-9/security-checklist.md`
- `outputs/phase-10/final-review-result.md`
- `outputs/phase-10/rework-plan.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/evidence-index.md`
- `outputs/phase-11/screenshots/phase11-dashboard.png`
- `outputs/phase-11/screenshots/phase11-skill-center.png`
- `outputs/phase-11/screenshots/phase11-history-search.png`
- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/spec-update-summary.md`
- `outputs/phase-12/unassigned-task-detection.md`
- `outputs/phase-12/skill-feedback-report.md`

### 修正

- 件数基準を 17 -> 16（15 Slice + chatEditSlice）に統一
  - `outputs/phase-1/requirements-definition.md`
  - `outputs/phase-1/scope-matrix.md`
  - `outputs/phase-2/slice-inventory-design.md`
  - `outputs/phase-4/test-specification.md`
  - `outputs/phase-4/test-cases.md`
- Phase 11 証跡フォーマットを `TC-11-01〜03` に統一
  - `phase-11-manual-test.md`
  - `outputs/phase-11/manual-test-result.md`
  - `outputs/phase-11/evidence-index.md`
- Phase 11 スクリーンショットを再取得（16:18 JST）
  - `outputs/phase-11/screenshots/phase11-dashboard.png`
  - `outputs/phase-11/screenshots/phase11-skill-center.png`
  - `outputs/phase-11/screenshots/phase11-history-search.png`
- Phase 12 サマリー/未タスク検出を再監査結果に更新
  - `outputs/phase-12/spec-update-summary.md`
  - `outputs/phase-12/unassigned-task-detection.md`
- baseline負債段階削減の未タスクを追加
  - `docs/30-workflows/unassigned-task/task-imp-phase12-unassigned-baseline-reduction-001.md`
- workflowパス正規化ガードの未タスクを追加
  - `docs/30-workflows/unassigned-task/task-imp-phase12-workflow-path-canonicalization-001.md`

### システム仕様更新（Step 2実施）

- `/.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `/.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `/.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `/.claude/skills/aiworkflow-requirements/LOGS.md`
- `/.claude/skills/aiworkflow-requirements/SKILL.md`

### スキル改善更新

- `/.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `/.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `/.claude/skills/task-specification-creator/LOGS.md`
- `/.claude/skills/task-specification-creator/SKILL.md`
- `/.claude/skills/skill-creator/references/patterns.md`
- `/.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `/.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`
- `/.claude/skills/skill-creator/references/resource-map.md`
- `/.claude/skills/skill-creator/LOGS.md`
- `/.claude/skills/skill-creator/SKILL.md`

### インデックス再生成

- `/.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `/.claude/skills/aiworkflow-requirements/indexes/keywords.json`
- `index.md`（workflow再生成）
