import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuestionCard } from "../QuestionCard";
import type {
  InterviewUserAnswer,
  SkillCreatorUserInputRequest,
} from "@repo/shared/src/types/skillCreator";

const baseRequest = (
  overrides: Partial<SkillCreatorUserInputRequest>,
): SkillCreatorUserInputRequest => ({
  requestId: "request-1",
  reason: "plan_review",
  title: "使用言語を選択してください",
  prompt: "スキルの実装言語を指定します",
  kind: "single_select",
  options: [
    { id: "typescript", label: "TypeScript", description: "推奨" },
    { id: "javascript", label: "JavaScript" },
  ],
  requestedAt: "2026-04-02T00:00:00Z",
  ...overrides,
});

describe("QuestionCard", () => {
  // T-01-1: 質問テキストとコンテキストが表示される
  it("request.title と request.prompt が表示される", () => {
    const request = baseRequest({});
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(screen.getByText("使用言語を選択してください")).toBeInTheDocument();
    expect(
      screen.getByText("スキルの実装言語を指定します"),
    ).toBeInTheDocument();
  });

  // T-01-2: single_select で選択肢が表示される
  it("single_select タイプで選択肢ボタンが表示される", () => {
    const request = baseRequest({
      title: "フレームワークを選択してください",
      prompt: "好みの UI フレームワークを選んでください",
      options: [
        { id: "react", label: "React" },
        { id: "vue", label: "Vue" },
        { id: "angular", label: "Angular" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Vue")).toBeInTheDocument();
    expect(screen.getByText("Angular")).toBeInTheDocument();
  });

  // T-02: single_select で「その他（自由入力）」が最後の選択肢として常に表示される
  it("single_select で「その他（自由入力）」が選択肢の最後に常に表示される", () => {
    const request = baseRequest({
      options: [
        { id: "typescript", label: "TypeScript" },
        { id: "javascript", label: "JavaScript" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    const buttons = screen.getAllByRole("button");
    const lastButton = buttons[buttons.length - 1];
    expect(lastButton).toHaveTextContent("その他（自由入力）");
  });

  // T-02b: multi_select でも「その他（自由入力）」が最後の選択肢として常に表示される
  it("multi_select で「その他（自由入力）」が選択肢の最後に常に表示される", () => {
    const request = baseRequest({
      kind: "multi_select",
      title: "機能を選んでください",
      prompt: "使いたい機能を複数選択してください",
      options: [
        { id: "auth", label: "認証" },
        { id: "db", label: "DB連携" },
        { id: "api", label: "API" },
      ],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    const buttons = screen.getAllByRole("button");
    // 送信ボタンを除いた選択肢ボタンの最後が「その他（自由入力）」
    const choiceButtons = buttons.filter(
      (btn) => !btn.textContent?.includes("送信"),
    );
    const lastChoiceButton = choiceButtons[choiceButtons.length - 1];
    expect(lastChoiceButton).toHaveTextContent("その他（自由入力）");
  });

  // T-03: ChoiceButton クリックで onAnswer コールバックが呼ばれる
  it("ChoiceButton クリックで onAnswer コールバックが呼ばれる", () => {
    const onAnswer = vi.fn<(answer: InterviewUserAnswer) => void>();
    const request = baseRequest({
      title: "選んでください",
      options: [{ id: "choice-a", label: "選択肢A" }],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("選択肢A"));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "single_select",
      selectedOptionId: "choice-a",
    });
  });

  // T-05: confirm タイプで「はい」「いいえ」が表示される
  it("confirm タイプで「はい」「いいえ」ボタンが表示される", () => {
    const request = baseRequest({
      kind: "confirm",
      title: "続けますか？",
      prompt: "この内容で進めてよいか確認してください。",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={() => {}} />);
    expect(screen.getByText("はい")).toBeInTheDocument();
    expect(screen.getByText("いいえ")).toBeInTheDocument();
  });

  // T-05b: confirm タイプで「はい」クリック時に confirmed=true が送信される
  it("confirm タイプで「はい」クリック時に confirmed=true が送信される", () => {
    const onAnswer = vi.fn<(answer: InterviewUserAnswer) => void>();
    const request = baseRequest({
      kind: "confirm",
      title: "続けますか？",
      prompt: "この内容で進めてよいか確認してください。",
      options: [],
    });
    render(<QuestionCard request={request} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByText("はい"));
    expect(onAnswer).toHaveBeenCalledWith({
      kind: "confirm",
      confirmed: true,
    });
  });
});
