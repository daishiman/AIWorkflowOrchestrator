/**
 * @file ConversationRoundStep.test.tsx
 * @description ConversationRoundStep コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task UT-SKILL-WIZARD-W1-par-02b
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ConversationRoundStep } from "../ConversationRoundStep";
import type {
  SkillInfoFormData,
  ConversationAnswers,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";

const defaultFormData: SkillInfoFormData = {
  skillName: "",
  purpose: "テスト目的",
  category: "automation",
};

const defaultAnswers: ConversationAnswers = {
  q1: { selectedOption: null, freeText: "" },
  q2: { selectedOption: null, freeText: "" },
  q3: { selectedOption: null, freeText: "" },
  q4: { selectedOption: null, freeText: "" },
  q5: { selectedOption: null, freeText: "" },
  q6: { selectedOption: null, freeText: "" },
};

const completeAnswers: ConversationAnswers = {
  q1: { selectedOption: "自分のみ", freeText: "" },
  q2: { selectedOption: "テキスト", freeText: "" },
  q3: {
    selectedOption: "定期実行",
    freeText: "",
    scheduleConfig: {
      cronExpression: "0 9 * * 1-5",
      timezone: "Asia/Tokyo",
    },
  },
  q4: { selectedOption: "通知", freeText: "" },
  q5: { selectedOption: "Slack", freeText: "" },
  q6: { selectedOption: "Markdown", freeText: "" },
};

const defaultSmartDefaults: SmartDefaultResult = {
  who: null,
  input: null,
  timing: null,
  output: null,
  tool: null,
  format: null,
};

describe("ConversationRoundStep", () => {
  let mockOnAnswersChange: ReturnType<typeof vi.fn>;
  let mockOnBack: ReturnType<typeof vi.fn>;
  let mockOnGenerate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAnswersChange = vi.fn();
    mockOnBack = vi.fn();
    mockOnGenerate = vi.fn();
  });

  // ------------------------------------------
  // 進捗バー表示
  // ------------------------------------------
  describe("進捗バー表示", () => {
    it("Page1 表示時に「質問 1/6」が表示される", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      expect(screen.getByText(/質問 1\/6/)).toBeInTheDocument();
    });

    it("「次のページ」クリック後に「質問 4/6」が表示される", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      expect(screen.getByText(/質問 1\/6/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      expect(screen.getByText(/質問 4\/6/)).toBeInTheDocument();
    });
  });

  // ------------------------------------------
  // スマートデフォルト
  // ------------------------------------------
  describe("スマートデフォルト表示", () => {
    it("smartDefaults が初期選択に反映される", () => {
      const smartDefaults: SmartDefaultResult = {
        who: "チームメンバー",
        input: null,
        timing: "定期実行",
        output: "通知",
        tool: null,
        format: null,
      };

      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={smartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );

      expect(
        screen.getByRole("button", { name: "チームメンバー" }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: "定期実行" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByLabelText(/cron式/)).toBeInTheDocument();
    });
  });

  // ------------------------------------------
  // ページング
  // ------------------------------------------
  describe("ページング", () => {
    it("初期表示で Q1〜Q3 が表示される（Page1）", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      expect(screen.getByText("Q1: 利用者（誰が使うか）")).toBeInTheDocument();
      expect(
        screen.getByText("Q2: 入力データ（何を渡すか）"),
      ).toBeInTheDocument();
      expect(screen.getByText("Q3: 実行タイミング")).toBeInTheDocument();
      expect(
        screen.queryByText("Q4: 出力先（どこへ）"),
      ).not.toBeInTheDocument();
    });

    it("「次のページ」クリックで Q4〜Q6 が表示される（Page2）", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      expect(screen.getByText("Q4: 出力先（どこへ）")).toBeInTheDocument();
      expect(screen.getByText("Q5: 外部ツール連携")).toBeInTheDocument();
      expect(screen.getByText("Q6: 出力フォーマット")).toBeInTheDocument();
      expect(
        screen.queryByText("Q1: 利用者（誰が使うか）"),
      ).not.toBeInTheDocument();
    });
  });

  // ------------------------------------------
  // Q3スケジュールUI展開
  // ------------------------------------------
  describe("Q3スケジュールUI展開", () => {
    it("Q3 で「定期実行」を選択するとスケジュールUIが展開される", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
      expect(screen.getByLabelText(/cron|スケジュール/i)).toBeInTheDocument();
      expect(screen.getByLabelText("タイムゾーン")).toBeInTheDocument();
    });

    it("Q3 で「手動実行」を選択するとスケジュールUIが表示されない", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "手動実行" }));
      expect(
        screen.queryByLabelText(/cron|スケジュール/i),
      ).not.toBeInTheDocument();
    });

    it("cron式が未入力のままフォーカスアウトするとエラーが表示される", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
      fireEvent.blur(screen.getByLabelText(/cron式/));
      expect(screen.getByRole("alert")).toHaveTextContent(
        "cron式を入力してください",
      );
    });

    it("cron式の数値が不正な場合にエラーが表示される", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
      fireEvent.change(screen.getByLabelText(/cron式/), {
        target: { value: "25 99 * * *" },
      });
      fireEvent.blur(screen.getByLabelText(/cron式/));
      expect(screen.getByRole("alert")).toHaveTextContent(
        "cron式の形式が正しくありません",
      );
    });

    it("定期実行から他の選択肢へ切り替えると scheduleConfig がクリアされる", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
      fireEvent.change(screen.getByLabelText(/cron式/), {
        target: { value: "0 9 * * 1-5" },
      });
      fireEvent.click(screen.getByRole("button", { name: "手動実行" }));

      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q3.scheduleConfig).toBeUndefined();
    });
  });

  // ------------------------------------------
  // 自由入力
  // ------------------------------------------
  describe("自由入力", () => {
    it("自由入力の変更が onAnswersChange に伝搬する", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );

      fireEvent.change(screen.getByLabelText("Q1 自由入力"), {
        target: { value: "社内の担当者" },
      });

      expect(mockOnAnswersChange).toHaveBeenCalled();
      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q1.freeText).toBe("社内の担当者");
    });
  });

  // ------------------------------------------
  // Q5必須バリデーション
  // ------------------------------------------
  describe("Q5必須バリデーション", () => {
    it("category=external-integration のとき Q5 に必須マークが表示される", () => {
      render(
        <ConversationRoundStep
          formData={{ ...defaultFormData, category: "external-integration" }}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      expect(screen.getByText(/Q5.*必須|必須.*Q5/)).toBeInTheDocument();
    });

    it("category=automation のとき Q5 に必須マークが表示されない", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      expect(screen.queryByText(/Q5.*必須|必須.*Q5/)).not.toBeInTheDocument();
    });
  });

  // ------------------------------------------
  // 適用サマリーカード
  // ------------------------------------------
  describe("適用サマリーカード", () => {
    it("「今すぐ生成する」クリックで適用サマリーカードが表示される", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      expect(
        screen.getByRole("region", { name: /サマリー|適用/ }),
      ).toBeInTheDocument();
    });

    it("スマートデフォルトが初期値に反映されるため、サマリーカードに未回答デフォルトは表示されない", () => {
      const smartDefaults: SmartDefaultResult = {
        who: "自分のみ",
        input: null,
        timing: null,
        output: null,
        tool: null,
        format: "Markdown",
      };
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={smartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      const card = screen.getByRole("region", { name: /サマリー|適用/ });
      expect(within(card).queryByRole("list")).not.toBeInTheDocument();
      expect(within(card).queryByText(/自分のみ/)).not.toBeInTheDocument();
      expect(within(card).queryByText(/Markdown/)).not.toBeInTheDocument();
    });

    it("サマリーカードの×ボタンでカードが閉じる", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      fireEvent.click(screen.getByRole("button", { name: /閉じる|×/ }));
      expect(
        screen.queryByRole("region", { name: /サマリー|適用/ }),
      ).not.toBeInTheDocument();
    });

    it("サマリーカードの「生成する」クリックで onGenerate('skip') が呼ばれる", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      fireEvent.click(screen.getByRole("button", { name: /^生成する$/ }));
      expect(mockOnGenerate).toHaveBeenCalledWith("skip");
    });

    it("全問回答済みのときサマリーカードの「生成する」クリックで onGenerate('complete') が呼ばれる", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={completeAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      fireEvent.click(screen.getByRole("button", { name: /^生成する$/ }));
      expect(mockOnGenerate).toHaveBeenCalledWith("complete");
    });
  });

  // ------------------------------------------
  // onBack コールバック
  // ------------------------------------------
  describe("onBack コールバック", () => {
    it("「戻る」ボタンクリック時に onBack が呼ばれる", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /戻る/ }));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });
});
