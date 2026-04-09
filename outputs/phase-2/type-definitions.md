# Phase 2 タスク3: 型定義・Props 設計

## GenerationMode（wizard/index.ts に既存）

```typescript
export type GenerationMode = "llm" | "template";
```

## SkillCreateWizard 新規状態

```typescript
// ローカル state（新規追加）
const [generationMode, setGenerationMode] =
  useState<GenerationMode>("template");
const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(null);
const [llmDescription, setLlmDescription] = useState("");

// store hooks（新規使用）
const currentPlanId = useCurrentPlanId();
const setIsGenerating = useSetIsSkillGenerating();
const setGenerationProgress = useSetGenerationProgress();
const setGenerationError = useSetGenerationError();
const setCurrentPlanResult = useSetCurrentPlanResult();
const setCurrentPlanId = useSetCurrentPlanId();
```

## SkillCreatorRuntimeApi（C-1 回避）

```typescript
type SkillCreatorRuntimeApi = {
  planSkill?: (
    prompt: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<{ success: boolean; data?: PlanResult; error?: string }>;
  executePlan?: (
    planId: string,
    skillSpec: string, // 必須（C-1 回避: optional にしない）
    authMode?: string,
    apiKey?: string,
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  getWorkflowState?: (
    planId: string,
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
};
```

## GenerateStep Props（既に実装済み）

```typescript
// GenerateStep.tsx に既存
planResult?: PlanResult | null;
generationProgress?: string | null;
onExecutePlan?: () => void;
onCancelPlan?: () => void;
```
