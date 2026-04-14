/**
 * @file ApplySummaryCard.test.tsx
 * @description ApplySummaryCard ユニットテスト
 * @task UT-SKILL-WIZARD-W1-par-02b Phase 6
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ApplySummaryCard } from "../ApplySummaryCard";
import type {
  ConversationAnswers,
  SmartDefaultResult,
  SkillInfoFormData,
} from "@repo/shared/types/skillCreator";

const defaultAnswers: ConversationAnswers = {
  q1: { selectedOptions: [], freeText: "" },
  q2: { selectedOptions: [], freeText: "" },
  q3: { selectedOptions: [], freeText: "" },
  q4: { selectedOptions: [], freeText: "" },
  q5: { selectedOptions: [], freeText: "" },
  q6: { selectedOptions: [], freeText: "" },
};

const defaultSmartDefaults: SmartDefaultResult = {
  who: null,
  input: null,
  timing: null,
  output: null,
  tool: null,
  format: null,
};

const defaultFormData: SkillInfoFormData = {
  purpose: "テスト",
  category: [],
};

describe("ApplySummaryCard", () => {
  let mockOnDismiss: ReturnType<typeof vi.fn>;
  let mockOnConfirm: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnDismiss = vi.fn();
    mockOnConfirm = vi.fn();
  });

  it("section[aria-label=適用サマリー] が region として取得できる", () => {
    render(
      <ApplySummaryCard
        answers={defaultAnswers}
        smartDefaults={defaultSmartDefaults}
        formData={defaultFormData}
        onDismiss={mockOnDismiss}
        onConfirm={mockOnConfirm}
      />,
    );
    expect(
      screen.getByRole("region", { name: /サマリー|適用/ }),
    ).toBeInTheDocument();
  });

  it("×ボタンクリックで onDismiss が呼ばれる", () => {
    render(
      <ApplySummaryCard
        answers={defaultAnswers}
        smartDefaults={defaultSmartDefaults}
        formData={defaultFormData}
        onDismiss={mockOnDismiss}
        onConfirm={mockOnConfirm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /閉じる/ }));
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("「生成する」ボタンクリックで onConfirm が呼ばれる", () => {
    render(
      <ApplySummaryCard
        answers={defaultAnswers}
        smartDefaults={defaultSmartDefaults}
        formData={defaultFormData}
        onDismiss={mockOnDismiss}
        onConfirm={mockOnConfirm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "生成する" }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("全問回答済みのとき未回答デフォルトリストが表示されない", () => {
    const answeredAll: ConversationAnswers = {
      q1: { selectedOptions: ["自分のみ"], freeText: "" },
      q2: { selectedOptions: ["テキスト"], freeText: "" },
      q3: { selectedOptions: ["手動実行"], freeText: "" },
      q4: { selectedOptions: ["チャット返信"], freeText: "" },
      q5: { selectedOptions: ["なし"], freeText: "" },
      q6: { selectedOptions: ["Markdown"], freeText: "" },
    };
    const smartDefaults: SmartDefaultResult = {
      who: "自分のみ",
      input: "テキスト",
      timing: "手動実行",
      output: "チャット返信",
      tool: "なし",
      format: "Markdown",
    };
    render(
      <ApplySummaryCard
        answers={answeredAll}
        smartDefaults={smartDefaults}
        formData={defaultFormData}
        onDismiss={mockOnDismiss}
        onConfirm={mockOnConfirm}
      />,
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("未回答の問にスマートデフォルトがある場合リスト表示される", () => {
    const smartDefaults: SmartDefaultResult = {
      who: "自分のみ",
      input: null,
      timing: null,
      output: null,
      tool: null,
      format: "Markdown",
    };
    render(
      <ApplySummaryCard
        answers={defaultAnswers}
        smartDefaults={smartDefaults}
        formData={defaultFormData}
        onDismiss={mockOnDismiss}
        onConfirm={mockOnConfirm}
      />,
    );
    const card = screen.getByRole("region", { name: /サマリー|適用/ });
    expect(within(card).getByText(/自分のみ/)).toBeInTheDocument();
    expect(within(card).getByText(/Markdown/)).toBeInTheDocument();
  });

  it("category=external-integration かつ Q5 未回答のとき警告が表示される", () => {
    const formData = {
      ...defaultFormData,
      category: ["external-integration"],
    };
    render(
      <ApplySummaryCard
        answers={defaultAnswers}
        smartDefaults={defaultSmartDefaults}
        formData={formData}
        onDismiss={mockOnDismiss}
        onConfirm={mockOnConfirm}
      />,
    );
    expect(
      screen.getByText(/Q5.*必須|外部ツール連携.*必須/),
    ).toBeInTheDocument();
  });

  it("category=external-integration かつ Q5 回答済みのとき警告が表示されない", () => {
    const formData = {
      ...defaultFormData,
      category: ["external-integration"],
    };
    const answeredQ5: ConversationAnswers = {
      ...defaultAnswers,
      q5: { selectedOptions: ["Slack"], freeText: "" },
    };
    render(
      <ApplySummaryCard
        answers={answeredQ5}
        smartDefaults={defaultSmartDefaults}
        formData={formData}
        onDismiss={mockOnDismiss}
        onConfirm={mockOnConfirm}
      />,
    );
    expect(
      screen.queryByText(/Q5.*必須|外部ツール連携.*必須/),
    ).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 複数選択対応テスト（TC-U-20〜22）
  // ------------------------------------------
  it("TC-U-21: Q1 に複数選択があるとき未回答判定されない", () => {
    const answeredQ1: ConversationAnswers = {
      ...defaultAnswers,
      q1: { selectedOptions: ["自分のみ", "チームメンバー"], freeText: "" },
    };
    const smartDefaults: SmartDefaultResult = {
      who: "自分のみ",
      input: null,
      timing: null,
      output: null,
      tool: null,
      format: null,
    };
    render(
      <ApplySummaryCard
        answers={answeredQ1}
        smartDefaults={smartDefaults}
        formData={defaultFormData}
        onDismiss={mockOnDismiss}
        onConfirm={mockOnConfirm}
      />,
    );
    // Q1 は回答済みのため「利用者」のデフォルト値がリストに表示されない
    const card = screen.getByRole("region", { name: /サマリー|適用/ });
    expect(within(card).queryByText(/利用者/)).not.toBeInTheDocument();
  });

  it("TC-U-22: q5.selectedOptions に値があるとき isQ5Unanswered が false になる", () => {
    const formData = {
      ...defaultFormData,
      category: ["external-integration"],
    };
    const answeredQ5: ConversationAnswers = {
      ...defaultAnswers,
      q5: { selectedOptions: ["Slack"], freeText: "" },
    };
    render(
      <ApplySummaryCard
        answers={answeredQ5}
        smartDefaults={defaultSmartDefaults}
        formData={formData}
        onDismiss={mockOnDismiss}
        onConfirm={mockOnConfirm}
      />,
    );
    expect(
      screen.queryByText(/Q5.*必須|外部ツール連携.*必須/),
    ).not.toBeInTheDocument();
  });
});
