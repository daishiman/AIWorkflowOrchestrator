import React, { useEffect, useState } from "react";
import {
  StepIndicator,
  SkillInfoStep,
  ConversationRoundStep,
  CompleteStep,
} from "./wizard";
import type {
  ConversationAnswers,
  SkillInfoFormData,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";
import { inferSmartDefaults } from "@repo/shared/services/skillCreator";
import { useWizardStep } from "./hooks/useWizardStep";
import {
  useCreateSkill,
  useClearGenerationState,
  useWorkflowSnapshot,
} from "../../store";
import { ProvenanceWarningSummary } from "./ProvenanceWarningSummary";

export const STEPS = ["スキル情報入力", "詳細設定", "完了"];

const SKILL_GENERATION_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: false,
} as const;

const DEFAULT_FORM_DATA: SkillInfoFormData = {
  skillName: "",
  purpose: "",
  category: null,
};

const DEFAULT_ANSWERS: ConversationAnswers = {
  q1: { selectedOption: null, freeText: "" },
  q2: { selectedOption: null, freeText: "" },
  q3: { selectedOption: null, freeText: "", scheduleConfig: undefined },
  q4: { selectedOption: null, freeText: "" },
  q5: { selectedOption: null, freeText: "" },
  q6: { selectedOption: null, freeText: "" },
};

const DEFAULT_SMART_DEFAULTS: SmartDefaultResult = {
  who: null,
  input: null,
  timing: null,
  output: null,
  tool: null,
  format: null,
};

const trackEvent = (event: string, data?: unknown) => {
  console.log(event, data);
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
  const clearGenerationState = useClearGenerationState();
  const workflowSnapshot = useWorkflowSnapshot();

  const [formData, setFormData] =
    useState<SkillInfoFormData>(DEFAULT_FORM_DATA);
  const [answers, setAnswers] = useState<ConversationAnswers>(DEFAULT_ANSWERS);
  const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult | null>(
    null,
  );
  const [error, setError] = useState<Error | null>(null);
  const [skillPath, setSkillPath] = useState<string | null>(null);
  const [hasExternalIntegration, setHasExternalIntegration] = useState(false);
  const [externalToolName, setExternalToolName] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("wizard:start");
    return () => {
      clearGenerationState();
    };
  }, [clearGenerationState]);

  const handleStep0Next = () => {
    trackEvent("wizard:step0:complete", { formData });
    try {
      const defaults = inferSmartDefaults(formData);
      trackEvent("wizard:smartDefaults:result", { defaults });
      setSmartDefaults(defaults);
    } catch {
      trackEvent("wizard:smartDefaults:result", null);
      setSmartDefaults(null);
    }
    setError(null);
    goNext();
  };

  const handleGenerate = async (method: "complete" | "skip") => {
    trackEvent("wizard:step1:complete", { answers, method });
    setError(null);

    try {
      const path = await createSkill(
        formData.purpose,
        SKILL_GENERATION_OPTIONS,
      );
      if (!path) {
        setError(new Error("スキル生成に失敗しました"));
        return;
      }

      const integrationEnabled = formData.category === "external-integration";
      const tool = answers.q5.selectedOption;

      setSkillPath(path);
      setHasExternalIntegration(integrationEnabled);
      setExternalToolName(
        integrationEnabled && tool && tool !== "なし" ? tool : null,
      );

      goToStep(2);
      trackEvent("wizard:complete", { skillPath: path });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("スキル生成に失敗しました"),
      );
    }
  };

  const handleQualityFeedback = (satisfied: boolean) => {
    void satisfied;
  };

  const handleRetry = () => {
    clearGenerationState();
    setSkillPath(null);
    setHasExternalIntegration(false);
    setExternalToolName(null);
    setError(null);
    goToStep(0);
  };

  const handleCreateAnother = () => {
    clearGenerationState();
    setFormData(DEFAULT_FORM_DATA);
    setAnswers(DEFAULT_ANSWERS);
    setSmartDefaults(null);
    setSkillPath(null);
    setHasExternalIntegration(false);
    setExternalToolName(null);
    setError(null);
    goToStep(0);
  };

  return (
    <div
      ref={ref}
      data-testid="skill-create-wizard"
      data-route-kind="destination"
      data-step={currentStep}
      className="flex flex-col gap-6 p-6"
    >
      <ProvenanceWarningSummary
        sourceProvenance={workflowSnapshot?.sourceProvenance ?? null}
      />
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {currentStep === 0 && (
        <div data-testid="wizard-step-info">
          <SkillInfoStep
            formData={formData}
            onFormDataChange={setFormData}
            onNext={handleStep0Next}
          />
        </div>
      )}

      {currentStep === 1 && (
        <div data-testid="wizard-step-conversation-round">
          {error && (
            <div
              role="alert"
              className="rounded border border-red-300 p-3 text-sm text-red-700"
            >
              {error.message}
            </div>
          )}
          <ConversationRoundStep
            formData={formData}
            smartDefaults={smartDefaults ?? DEFAULT_SMART_DEFAULTS}
            answers={answers}
            onAnswersChange={setAnswers}
            onBack={goBack}
            onGenerate={handleGenerate}
          />
        </div>
      )}

      {currentStep === 2 && (
        <div data-testid="wizard-step-complete">
          <CompleteStep
            skillPath={skillPath}
            hasExternalIntegration={hasExternalIntegration}
            externalToolName={externalToolName}
            onExecuteNow={onClose}
            onOpenInEditor={onClose}
            onCreateAnother={handleCreateAnother}
            onQualityFeedback={handleQualityFeedback}
            onRetry={handleRetry}
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
});

SkillCreateWizard.displayName = "SkillCreateWizard";
