# Phase 1: API契約確認

## Preload API シグネチャ (skill-creator-api.ts)

- `planSkill(prompt: string, authMode?: AuthMode, apiKey?: string | null)` → `IpcResult<RuntimeSkillCreatorPlanResponse>`
- `executePlan(planId: string, skillSpec: string, authMode?: AuthMode, apiKey?: string | null)` → `IpcResult<RuntimeSkillCreatorExecuteResult>`

## PlanResult型 (agentSlice.ts L34-39)

```ts
interface PlanResult {
  type: "integrated_api" | "terminal_handoff";
  planId?: string;
  estimatedSteps?: number;
  guidance?: { reason: string; command: string };
}
```

## Store Hooks (store/index.ts)

useIsSkillGenerating, useGenerationProgress, useGenerationError, useCurrentPlanResult, useCurrentPlanId, useSetIsSkillGenerating, useSetGenerationProgress, useSetGenerationError, useSetCurrentPlanResult, useSetCurrentPlanId, useClearGenerationState
