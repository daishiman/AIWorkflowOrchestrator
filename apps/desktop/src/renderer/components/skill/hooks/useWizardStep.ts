/**
 * @file useWizardStep.ts
 * @description ウィザードのステップ管理カスタムフック
 * @task TASK-10A-C Phase 8: リファクタリング
 */

import { useState, useCallback } from "react";

export interface UseWizardStepReturn {
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
}

export function useWizardStep(totalSteps: number): UseWizardStepReturn {
  const [currentStep, setCurrentStep] = useState(0);

  const goNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const goBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps],
  );

  return {
    currentStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    goNext,
    goBack,
    goToStep,
  };
}
