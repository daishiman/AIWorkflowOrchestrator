/**
 * @file SkillCreateWizard.tsx
 * @description スキル作成ウィザード統合コンポーネント
 * @task TASK-10A-C, TASK-SC-07
 */

import React, { useEffect, useState } from "react";
import {
  StepIndicator,
  DescribeStep,
  ConfigureStep,
  GenerateStep,
  CompleteStep,
} from "./wizard";
import type { WizardOptions, GenerationMode } from "./wizard";
import type { PlanResult } from "../../store/slices/agentSlice";
import { useWizardStep } from "./hooks/useWizardStep";
import {
  useCreateSkill,
  useIsSkillGenerating,
  useGenerationProgress,
  useGenerationError,
  useCurrentPlanResult,
  useCurrentPlanId,
  useSetIsSkillGenerating,
  useSetGenerationProgress,
  useSetGenerationError,
  useSetCurrentPlanResult,
  useSetCurrentPlanId,
  useClearGenerationState,
} from "../../store";

const STEPS = ["説明入力", "設定", "生成", "完了"];

const DEFAULT_OPTIONS: WizardOptions = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
};

type SkillCreatorRuntimeApi = {
  planSkill?: (
    prompt: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<{ success: boolean; data?: PlanResult; error?: string }>;
  executePlan?: (
    planId: string,
    skillSpec: string,
    authMode?: string,
    apiKey?: string,
  ) => Promise<{
    success: boolean;
    data?: { skillName: string; skillPath: string };
    error?: string;
  }>;
};

const getSkillCreatorApi = (): SkillCreatorRuntimeApi => {
  const api = (
    window as Window & {
      electronAPI?: { skillCreator?: SkillCreatorRuntimeApi };
    }
  ).electronAPI?.skillCreator;
  return api ?? {};
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

  // Existing local state
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<WizardOptions>(DEFAULT_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [skillPath, setSkillPath] = useState<string | null>(null);

  // TASK-SC-07: LLM generation state
  const [generationMode, setGenerationMode] =
    useState<GenerationMode>("template");
  const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(
    null,
  );

  // Store hooks (TASK-SC-07)
  const isSkillGenerating = useIsSkillGenerating();
  const generationProgress = useGenerationProgress();
  const generationError = useGenerationError();
  const storePlanResult = useCurrentPlanResult();
  const storePlanId = useCurrentPlanId();
  const setStoreIsGenerating = useSetIsSkillGenerating();
  const setGenerationProgress = useSetGenerationProgress();
  const setGenerationError = useSetGenerationError();
  const setCurrentPlanResult = useSetCurrentPlanResult();
  const setCurrentPlanId = useSetCurrentPlanId();
  const clearGenerationState = useClearGenerationState();

  // TASK-SC-07: Cleanup store on unmount (P3)
  useEffect(() => {
    return () => {
      clearGenerationState();
    };
  }, [clearGenerationState]);

  // Existing template generation handler
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

  // TASK-SC-07: LLM plan generation (AC-2)
  const handleLlmGenerate = async () => {
    if (!description.trim()) return;
    if (isSkillGenerating) return;
    goToStep(2);
    setStoreIsGenerating(true);
    setGenerationProgress("計画を生成中...");
    setGenerationError(null);
    try {
      const api = getSkillCreatorApi();
      if (!api.planSkill) {
        throw new Error("planSkill API が利用できません");
      }
      const result = await api.planSkill(description);
      if (result.success && result.data) {
        setLocalPlanResult(result.data);
        setCurrentPlanResult(result.data);
        if (result.data.planId) {
          setCurrentPlanId(result.data.planId);
        }
      } else {
        setGenerationError(result.error ?? "計画生成に失敗しました");
      }
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : "計画生成に失敗しました",
      );
    } finally {
      setStoreIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // TASK-SC-07: Execute plan (AC-4, AC-10)
  const handleExecutePlan = async () => {
    if (!storePlanId || !localPlanResult) return;
    setStoreIsGenerating(true);
    setGenerationError(null);
    try {
      const api = getSkillCreatorApi();
      if (!api.executePlan) {
        throw new Error("executePlan API が利用できません");
      }
      const result = await api.executePlan(storePlanId, description);
      if (result.success && result.data) {
        setSkillPath(result.data.skillPath);
        setLocalPlanResult(null);
        clearGenerationState();
        goToStep(3);
      } else {
        setGenerationError(result.error ?? "スキル生成に失敗しました");
      }
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : "スキル生成に失敗しました",
      );
    } finally {
      setStoreIsGenerating(false);
    }
  };

  // TASK-SC-07: Cancel plan (AC-5, AC-10)
  const handleCancelPlan = () => {
    setLocalPlanResult(null);
    clearGenerationState();
    goToStep(0);
  };

  // TASK-SC-07: Route DescribeStep onNext based on mode (AC-2, AC-8)
  const handleDescribeNext = () => {
    if (generationMode === "llm") {
      void handleLlmGenerate();
    } else {
      goNext();
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
            generationMode={generationMode}
            onGenerationModeChange={setGenerationMode}
            onNext={handleDescribeNext}
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
          <GenerateStep
            isGenerating={isSkillGenerating || isGenerating}
            error={generationError ? new Error(generationError) : error}
            generationMode={generationMode}
            generationProgress={generationProgress}
            planResult={localPlanResult ?? storePlanResult}
            onExecutePlan={handleExecutePlan}
            onCancelPlan={handleCancelPlan}
          />
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
