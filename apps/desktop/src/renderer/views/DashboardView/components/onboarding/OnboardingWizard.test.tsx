import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OnboardingWizard,
  type OnboardingWizardProps,
} from "./OnboardingWizard";
import type { OnboardingSkillCard } from "./constants";

const skillCards: OnboardingSkillCard[] = [
  {
    skillName: "aiworkflow-requirements",
    label: "仕様を見つける",
    description: "必要な要件や設計の正本をすばやく確認します。",
    icon: "search",
    availability: "available",
  },
  {
    skillName: "task-specification-creator",
    label: "タスクを分解",
    description: "実装前にフェーズと責務を整理して進めます。",
    icon: "file-text",
    availability: "available",
  },
];

function createProps(
  overrides: Partial<OnboardingWizardProps> = {},
): OnboardingWizardProps {
  return {
    defaultName: "",
    defaultTheme: "light",
    skillCards,
    onApplyTheme: vi.fn().mockResolvedValue(undefined),
    onSkip: vi.fn().mockResolvedValue(undefined),
    onComplete: vi.fn().mockResolvedValue(undefined),
    onFinished: vi.fn(),
    ...overrides,
  };
}

describe("OnboardingWizard", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("Step 1 では名前入力でプレビューが更新され、次へが有効になる", () => {
    render(<OnboardingWizard {...createProps()} />);

    const nextButton = screen.getByTestId("onboarding-primary-action");
    expect(nextButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("オンボーディングの名前入力"), {
      target: { value: "春子" },
    });

    expect(screen.getByTestId("onboarding-name-preview")).toHaveTextContent(
      "こんにちは、春子さん!",
    );
    expect(nextButton).toBeEnabled();
  });

  it("4ステップを完了すると payload を保存し、完了画面から自動で閉じる", async () => {
    vi.useFakeTimers();
    const props = createProps();
    render(<OnboardingWizard {...props} />);

    fireEvent.change(screen.getByLabelText("オンボーディングの名前入力"), {
      target: { value: "花子" },
    });
    fireEvent.click(screen.getByTestId("onboarding-primary-action"));

    fireEvent.click(screen.getByText("おすすめの映画を教えて"));
    fireEvent.click(screen.getByTestId("onboarding-primary-action"));

    fireEvent.click(
      screen.getByTestId(
        "onboarding-skill-card-aiworkflow-requirements",
      ),
    );
    fireEvent.click(screen.getByTestId("onboarding-primary-action"));

    const completeButton = screen.getByTestId("onboarding-primary-action");
    expect(completeButton).toBeDisabled();

    fireEvent.click(screen.getByTestId("onboarding-theme-card-dark"));
    expect(props.onApplyTheme).toHaveBeenCalledWith("dark");
    expect(completeButton).toBeEnabled();

    await act(async () => {
      fireEvent.click(completeButton);
    });

    expect(props.onComplete).toHaveBeenCalledWith({
      userName: "花子",
      selectedSkillName: "aiworkflow-requirements",
      theme: "dark",
    });

    expect(screen.getByTestId("onboarding-step-complete")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(props.onFinished).toHaveBeenCalledTimes(1);
  });

  it("Escape でスキップできる", async () => {
    const props = createProps();
    render(<OnboardingWizard {...props} />);

    await act(async () => {
      fireEvent.keyDown(screen.getByTestId("onboarding-wizard"), {
        key: "Escape",
      });
    });

    expect(props.onSkip).toHaveBeenCalledTimes(1);
  });

  it("Tab 循環でフォーカストラップを維持する", () => {
    render(<OnboardingWizard {...createProps()} />);

    const dialog = screen.getByTestId("onboarding-wizard");
    const input = screen.getByLabelText("オンボーディングの名前入力");
    const skipButton = screen.getByRole("button", { name: "あとで" });

    input.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(skipButton).toHaveFocus();

    skipButton.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(input).toHaveFocus();
  });
});
