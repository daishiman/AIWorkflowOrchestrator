# Phase 12 Documentation Changelog

## 変更ファイル

- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/index.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/phase-11-manual-test.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/phase-12-documentation.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/artifacts.json`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/artifacts.json`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/phase-11/manual-test-report.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/phase-11/manual-test-checklist.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/phase-11/discovered-issues.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/phase-12/system-spec-update-summary.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/phase-12/skill-feedback-report.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001/outputs/verification-report.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/keywords.json`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.agents/skills/aiworkflow-requirements/SKILL.md`
- `.agents/skills/aiworkflow-requirements/LOGS.md`
- `.agents/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.agents/skills/aiworkflow-requirements/indexes/keywords.json`
- `.agents/skills/task-specification-creator/SKILL.md`
- `.agents/skills/task-specification-creator/LOGS.md`
- `packages/shared/src/types/skill-wizard-label-map.ts`
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- `packages/shared/src/types/__tests__/skill-wizard-label-map.test.ts`

## 変更内容

- notion 専用の特別ケースを shared の変換表へ移管した
- 未登録値の原表記保持を追加した
- Phase 11 / 12 の証跡を current facts に合わせた
- root / outputs の artifacts parity を揃える前提を整えた
- skill / ledger / workflow の current facts を同 wave で更新する前提を固定した

## validator 実測

- `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-wizard-label-map.test.ts`: PASS
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx --maxWorkers 1`: PASS
- `pnpm --filter @repo/shared typecheck`: PASS
- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/shared build`: PASS
- `pnpm --filter @repo/desktop build`: PASS
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 --strict`: PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001`: PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001`: PASS（12/12）
- `diff -qr artifacts.json outputs/artifacts.json`: 差分なし

## 4点同期

- `index.md`
- `phase-11-manual-test.md`
- `phase-12-documentation.md`
- `artifacts.json` / `outputs/artifacts.json`

## 判定

- current facts 同期は進行済み
- 未タスクの新規 formalize は不要
- 追加の system spec 本文は不要
