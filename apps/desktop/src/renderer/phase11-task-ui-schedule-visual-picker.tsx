import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import clsx from "clsx";
import type {
  ConversationAnswers,
  SkillInfoFormData,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";
import { VisualCronPicker } from "./components/schedule/VisualCronPicker";
import { ConversationRoundStep } from "./components/skill/wizard";
import "./styles/globals.css";

type HarnessMode = "picker" | "wizard";
type PickerPreset = "empty" | "daily" | "weekly" | "monthly" | "custom";

const DEFAULT_FORM_DATA: SkillInfoFormData = {
  skillName: "",
  purpose: "スケジュール設定 UI の手動検証",
  category: "automation",
};

const DEFAULT_ANSWERS: ConversationAnswers = {
  q1: { selectedOptions: [], freeText: "" },
  q2: { selectedOptions: [], freeText: "" },
  q3: { selectedOptions: [], freeText: "", scheduleConfig: undefined },
  q4: { selectedOptions: [], freeText: "" },
  q5: { selectedOptions: [], freeText: "" },
  q6: { selectedOptions: [], freeText: "" },
};

const DEFAULT_SMART_DEFAULTS: SmartDefaultResult = {
  who: null,
  input: null,
  timing: "定期実行",
  output: null,
  tool: null,
  format: null,
};

function resolveMode(value: string | null): HarnessMode {
  return value === "wizard" ? "wizard" : "picker";
}

function resolvePickerPreset(value: string | null): PickerPreset {
  switch (value) {
    case "daily":
    case "weekly":
    case "monthly":
    case "custom":
    case "empty":
      return value;
    default:
      return "empty";
  }
}

function resolvePickerValue(preset: PickerPreset): string {
  switch (preset) {
    case "daily":
      return "0 9 * * *";
    case "weekly":
      return "0 9 * * 1,3,5";
    case "monthly":
      return "0 12 1 * *";
    case "custom":
      return "*/5 * * * *";
    case "empty":
    default:
      return "";
  }
}

function SurfaceCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section
      className={clsx(
        "rounded-[28px] border border-[var(--border-primary)]",
        "bg-[var(--bg-secondary)] shadow-[0_20px_70px_rgba(15,23,42,0.18)]",
      )}
    >
      <div className="border-b border-[var(--border-primary)] px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--status-primary)]">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function HarnessShell({
  title,
  description,
  children,
  testId,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  testId: string;
}): JSX.Element {
  return (
    <main
      data-testid={testId}
      className="min-h-screen bg-[var(--bg-primary)] px-6 py-8 text-[var(--text-primary)]"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-[28px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-8 py-7 shadow-[0_20px_70px_rgba(15,23,42,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--status-primary)]">
            Phase 11 Visual Audit
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
            {title}
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[var(--text-secondary)]">
            {description}
          </p>
        </header>

        {children}
      </div>
    </main>
  );
}

function PickerHarness(): JSX.Element {
  const searchParams = new URLSearchParams(window.location.search);
  const scenario = searchParams.get("scenario") ?? "picker";
  const preset = resolvePickerPreset(searchParams.get("preset"));
  const initialValue = searchParams.get("value") ?? resolvePickerValue(preset);
  const [cronExpression, setCronExpression] = useState(initialValue);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  return (
    <HarnessShell
      testId="phase11-schedule-picker-harness"
      title="TASK-UI-SCHEDULE-VISUAL-PICKER-001 / VisualCronPicker"
      description="VisualCronPicker の各状態を単独で再現するハーネス。スクリーンショットには実際の UI と補助ラベルを含めて、状態遷移が追えるようにしている。"
    >
      <SurfaceCard
        title={`TC-${scenario}`}
        description={`preset=${preset} / current=${cronExpression || "(empty)"}`}
      >
        <div className="space-y-4" data-testid="phase11-picker-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Current Stage
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {scenario}
              </p>
            </div>
            <div className="rounded-full border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-1 text-xs text-[var(--text-secondary)]">
              value: {cronExpression || "(empty)"}
            </div>
          </div>

          <VisualCronPicker
            value={cronExpression}
            onChange={setCronExpression}
            className="w-full"
          />
        </div>
      </SurfaceCard>
    </HarnessShell>
  );
}

function WizardHarness(): JSX.Element {
  const searchParams = new URLSearchParams(window.location.search);
  const scenario = searchParams.get("scenario") ?? "wizard";
  const [answers, setAnswers] = useState<ConversationAnswers>(DEFAULT_ANSWERS);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  return (
    <HarnessShell
      testId="phase11-schedule-wizard-harness"
      title="TASK-UI-SCHEDULE-VISUAL-PICKER-001 / ConversationRoundStep"
      description="スキルウィザード内の cronExpression / timezone バリデーションを直接再現するハーネス。定期実行の入力状態を初期表示にして、エラーと修正の両方を確認できる。"
    >
      <SurfaceCard
        title={`TC-${scenario}`}
        description="smartDefaults で Q3 を定期実行に初期化し、cron / timezone の検証状態を確認する。"
      >
        <div className="space-y-4" data-testid="phase11-wizard-card">
          <ConversationRoundStep
            formData={DEFAULT_FORM_DATA}
            smartDefaults={DEFAULT_SMART_DEFAULTS}
            answers={answers}
            onAnswersChange={setAnswers}
            onBack={() => undefined}
            onGenerate={() => undefined}
          />
        </div>
      </SurfaceCard>
    </HarnessShell>
  );
}

const root = document.getElementById("root");

if (!root) {
  throw new Error(
    "phase11 task ui schedule visual picker harness の root 要素が見つかりませんでした",
  );
}

const mode = resolveMode(
  new URLSearchParams(window.location.search).get("mode"),
);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {mode === "wizard" ? <WizardHarness /> : <PickerHarness />}
  </React.StrictMode>,
);
