# エクスポート設計書

タスクID: UT-SKILL-WIZARD-W2-seq-03b

## Before（変更前）

wizard/index.ts に含まれていた（または含まれるべきだった）エクスポート：

```ts
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
// ConfigureStep, ConfigureStepProps はファイル削除済みで既に不在
// WizardOptions は別途定義ファイルが存在したと想定
export { SkillInfoStep } from "./SkillInfoStep";
// SkillInfoStepProps の型エクスポートが欠落
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";
```

## After（変更後・現状）

```ts
export { StepIndicator, stepStateStyles } from "./StepIndicator";
export type { StepState, StepIndicatorProps } from "./StepIndicator";
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";
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
  GenerationMode,
  GenerationStage,
  GenerationErrorCode,
} from "./GenerateStep";
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps, GeneratedSkill } from "./CompleteStep";
```

## 設計方針

- 削除対象コンポーネントは index.ts からのみ除外し、ファイル自体は残存を許容（後続タスクで対応）
- `SkillInfoStepProps` は SkillInfoStep と同一ファイルから型エクスポートを追加
- `GenerationMode` は GenerateStep 内で定義・エクスポートされるものを維持（standalone 再エクスポートは廃止）
- 新規追加コンポーネント（InterviewProgressBar, ApplySummaryCard）もあわせてエクスポート済み
