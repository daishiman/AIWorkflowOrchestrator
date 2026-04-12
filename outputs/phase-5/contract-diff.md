# Phase 5: エクスポート差分 — UT-SKILL-WIZARD-W2-seq-03b

## wizard/index.ts 変更後の全エクスポート

```typescript
// ── StepIndicator ──
export { StepIndicator, stepStateStyles } from "./StepIndicator";
export type { StepState, StepIndicatorProps } from "./StepIndicator";

// ── SkillInfoStep（新）──
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep"; // 追加

// ── ConversationRoundStep ──
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";

// ── InterviewProgressBar ──
export { InterviewProgressBar } from "./InterviewProgressBar";
export type { InterviewProgressBarProps } from "./InterviewProgressBar";

// ── ApplySummaryCard ──
export { ApplySummaryCard } from "./ApplySummaryCard";
export type { ApplySummaryCardProps } from "./ApplySummaryCard";

// ── GenerateStep ──
export { GenerateStep } from "./GenerateStep";
export type {
  GenerateStepProps,
  GenerationError,
  GenerationStage,
  GenerationErrorCode,
  GenerationMode, // GenerateStep.tsx から再転送（SkillCreateWizard.tsx が参照）
} from "./GenerateStep";

// ── CompleteStep ──
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps, GeneratedSkill } from "./CompleteStep";
```

## 削除されたエクスポート

```typescript
// 以下3行を削除
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";

/** LLM生成 or テンプレート生成のモード選択（TASK-SC-07） */
export type GenerationMode = "llm" | "template";
```
