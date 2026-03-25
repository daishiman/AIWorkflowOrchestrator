export { StepIndicator, stepStateStyles } from "./StepIndicator";
export type { StepState, StepIndicatorProps } from "./StepIndicator";
export { DescribeStep } from "./DescribeStep";
export type { DescribeStepProps } from "./DescribeStep";
export { ConfigureStep } from "./ConfigureStep";
export type { WizardOptions, ConfigureStepProps } from "./ConfigureStep";
export { GenerateStep } from "./GenerateStep";
export type { GenerateStepProps } from "./GenerateStep";
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps } from "./CompleteStep";

/** LLM生成 or テンプレート生成のモード選択（TASK-SC-07） */
export type GenerationMode = "llm" | "template";
