# Phase 2: エクスポート設計書 — UT-SKILL-WIZARD-W2-seq-03b

## Before（現行 wizard/index.ts 実際の状態）

```typescript
export { StepIndicator, stepStateStyles } from "./StepIndicator";
export type { StepState, StepIndicatorProps } from "./StepIndicator";
export { DescribeStep } from "./DescribeStep"; // 削除対象
export type { DescribeStepProps } from "./DescribeStep"; // 削除対象
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
export type GenerationMode = "llm" | "template"; // 削除対象（インライン定義）
```

## After（変更後 wizard/index.ts）

```typescript
export { StepIndicator, stepStateStyles } from "./StepIndicator";
export type { StepState, StepIndicatorProps } from "./StepIndicator";
// DescribeStep / DescribeStepProps: 削除
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep"; // 追加
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
  GenerationMode, // 追加（GenerateStep.tsx から再転送）
} from "./GenerateStep";
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps, GeneratedSkill } from "./CompleteStep";
// GenerationMode インライン定義: 削除
```

## SkillInfoStep.tsx の変更

```typescript
// Before
interface SkillInfoStepProps {

// After
export interface SkillInfoStepProps {
```

## DescribeStep.tsx の変更（廃止処理）

```typescript
// Before
/**
 * @file DescribeStep.tsx

// After
/**
 * @file DescribeStep.tsx
 * @deprecated UT-SKILL-WIZARD-W2-seq-03b により廃止。SkillInfoStep を使用してください。
```
