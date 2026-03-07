/**
 * @file SkillCreateWizard.tsx
 * @description スキル作成ウィザード統合コンポーネント
 * @task TASK-10A-C
 */

import React, { useState } from "react";
import {
  StepIndicator,
  DescribeStep,
  ConfigureStep,
  GenerateStep,
  CompleteStep,
} from "./wizard";
import type { WizardOptions } from "./wizard";
import { useWizardStep } from "./hooks/useWizardStep";
import { useCreateSkill } from "../../store";

const STEPS = ["説明入力", "設定", "生成", "完了"];

const DEFAULT_OPTIONS: WizardOptions = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
};

export interface SkillCreateWizardProps {
  onClose: () => void;
}

export const SkillCreateWizard = React.forwardRef<
  HTMLDivElement,
  SkillCreateWizardProps
>(({ onClose }, ref) => {
  const { currentStep, goNext, goBack, goToStep } = useWizardStep(STEPS.length);
  const createSkill = useCreateSkill();
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<WizardOptions>(DEFAULT_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [skillPath, setSkillPath] = useState<string | null>(null);

  const handleGenerate = async () => {
    goToStep(2);
    setIsGenerating(true);
    setError(null);
    try {
      const path = await createSkill(description, options);
      if (path) {
        setSkillPath(path);
        goToStep(3);
      } else {
        setError(new Error("スキル生成に失敗しました"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("スキル生成に失敗しました"),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      ref={ref}
      data-testid="skill-create-wizard"
      data-step={currentStep}
      className="flex flex-col gap-6 p-6"
    >
      <StepIndicator steps={STEPS} currentStep={currentStep} />
      {currentStep === 0 && (
        <div data-testid="wizard-step-describe">
          <DescribeStep
            description={description}
            onDescriptionChange={setDescription}
            onNext={goNext}
          />
        </div>
      )}
      {currentStep === 1 && (
        <div data-testid="wizard-step-configure">
          <ConfigureStep
            options={options}
            onOptionsChange={setOptions}
            onBack={goBack}
            onGenerate={handleGenerate}
          />
        </div>
      )}
      {currentStep === 2 && (
        <div data-testid="wizard-step-generate">
          <GenerateStep isGenerating={isGenerating} error={error} />
        </div>
      )}
      {currentStep === 3 && (
        <div data-testid="wizard-step-complete">
          <CompleteStep skillPath={skillPath} onClose={onClose} />
        </div>
      )}
    </div>
  );
});
SkillCreateWizard.displayName = "SkillCreateWizard";
