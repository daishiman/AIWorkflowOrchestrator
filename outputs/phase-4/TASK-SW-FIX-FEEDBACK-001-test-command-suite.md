# Phase 4: テストコマンドスイート

## タスクID: TASK-SW-FIX-FEEDBACK-001

```bash
# CompleteStep テスト（TC-FEEDBACK-004〜007, 009, 011, 013）
cd apps/desktop
pnpm vitest run --reporter=verbose src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx

# SkillCreateWizard テスト（TC-FEEDBACK-003）
pnpm vitest run --reporter=verbose src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# LLM生成テスト（TC-FEEDBACK-001, 002）
pnpm vitest run --reporter=verbose src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
```
