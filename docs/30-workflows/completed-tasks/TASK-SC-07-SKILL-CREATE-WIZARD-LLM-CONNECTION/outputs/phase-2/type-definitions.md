# Phase 2: 型定義設計

- `GenerationMode = "llm" | "template"` (wizard/index.ts)
- DescribeStepProps: +generationMode?, +onGenerationModeChange?
- GenerateStepProps: +generationMode?, +generationProgress?, +planResult?, +onExecutePlan?, +onCancelPlan?
- SkillCreateWizard: +generationMode(useState), +localPlanResult(useState), +store hooks
