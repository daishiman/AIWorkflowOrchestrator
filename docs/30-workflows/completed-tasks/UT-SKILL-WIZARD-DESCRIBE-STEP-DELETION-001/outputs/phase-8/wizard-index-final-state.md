# wizard/index.ts 最終状態

## ファイル: apps/desktop/src/renderer/components/skill/wizard/index.ts

```typescript
export { StepIndicator, stepStateStyles } from "./StepIndicator";
export type { StepState, StepIndicatorProps } from "./StepIndicator";
export { SkillInfoStep } from "./SkillInfoStep";
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";
export { InterviewProgressBar } from "./InterviewProgressBar";
export type { InterviewProgressBarProps } from "./InterviewProgressBar";
export { ApplySummaryCard } from "./ApplySummaryCard";
export type { ApplySummaryCardProps } from "./ApplySummaryCard";
export { GenerateStep } from "./GenerateStep";
export type {
  GenerateStepProps,
  GenerationError,
  GenerationStage,
  GenerationErrorCode,
} from "./GenerateStep";
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps, GeneratedSkill } from "./CompleteStep";

/** LLM生成 or テンプレート生成のモード選択（TASK-SC-07） */
export type GenerationMode = "llm" | "template";
```

**確認**: `DescribeStep` / `DescribeStepProps` のエクスポートが含まれていない。
