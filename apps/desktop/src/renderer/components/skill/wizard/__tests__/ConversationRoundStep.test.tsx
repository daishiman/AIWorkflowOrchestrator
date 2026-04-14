/**
 * @file ConversationRoundStep.test.tsx
 * @description ConversationRoundStep コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task UT-SKILL-WIZARD-W1-par-02b / TASK-CRON-SEMANTIC-VALIDATION-001
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import {
  ConversationRoundStep,
  applySmartDefaults,
} from "../ConversationRoundStep";
import type {
  SkillInfoFormData,
  ConversationAnswers,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";
import {
  SEMANTIC_LABEL_MAP,
  resolveSemanticLabel,
  type QuestionSemanticLabelMap,
} from "../../../../../../../../packages/shared/src/types/skill-wizard-label-map";

const defaultFormData: SkillInfoFormData = {
  skillName: "",
  purpose: "テスト目的",
  category: "automation",
};

const defaultAnswers: ConversationAnswers = {
  q1: { selectedOptions: [], freeText: "" },
  q2: { selectedOptions: [], freeText: "" },
  q3: { selectedOptions: [], freeText: "" },
  q4: { selectedOptions: [], freeText: "" },
  q5: { selectedOptions: [], freeText: "" },
  q6: { selectedOptions: [], freeText: "" },
};

const completeAnswers: ConversationAnswers = {
  q1: { selectedOptions: ["自分のみ"], freeText: "" },
  q2: { selectedOptions: ["テキスト"], freeText: "" },
  q3: {
    selectedOptions: ["定期実行"],
    freeText: "",
    scheduleConfig: {
      cronExpression: "0 9 * * 1-5",
      timezone: "Asia/Tokyo",
    },
  },
  q4: { selectedOptions: ["通知"], freeText: "" },
  q5: { selectedOptions: ["Slack"], freeText: "" },
  q6: { selectedOptions: ["Markdown"], freeText: "" },
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
        timing: "scheduled",
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

    it("smartDefaults.tool の slack が Q5 の初期選択に反映される", () => {
      const smartDefaults: SmartDefaultResult = {
        ...defaultSmartDefaults,
        tool: "slack",
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

      fireEvent.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      expect(screen.getByRole("button", { name: "Slack" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
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

    it("存在しない日付のcron式ではエラーが表示され、サマリーに進まない", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={{
            ...defaultAnswers,
            q3: {
              selectedOptions: ["定期実行"],
              freeText: "",
              scheduleConfig: {
                cronExpression: "0 9 31 2 *",
                timezone: "Asia/Tokyo",
              },
            },
          }}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /今すぐ生成する/ }));

      expect(screen.getByRole("alert")).toHaveTextContent(
        "指定した日付は存在しません",
      );
      expect(mockOnGenerate).not.toHaveBeenCalled();
      expect(
        screen.queryByRole("region", { name: /サマリー|適用/ }),
      ).not.toBeInTheDocument();
    });

    it("timezone が不正な場合にエラーが表示され、サマリーに進まない", () => {
      render(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={{
            ...defaultAnswers,
            q3: {
              selectedOptions: ["定期実行"],
              freeText: "",
              scheduleConfig: {
                cronExpression: "0 9 * * *",
                timezone: "Mars/Phobos",
              },
            },
          }}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /今すぐ生成する/ }));
      expect(screen.getByRole("alert")).toHaveTextContent(
        "無効なタイムゾーンです",
      );
      expect(mockOnGenerate).not.toHaveBeenCalled();
      expect(
        screen.queryByRole("region", { name: /サマリー|適用/ }),
      ).not.toBeInTheDocument();
    });

    it("「定期実行」を解除すると scheduleConfig がクリアされる（トグル方式）", () => {
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
      // 「定期実行」を再クリックして解除（トグル方式）
      fireEvent.click(screen.getByRole("button", { name: "定期実行" }));

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
  // 複数選択トグル動作
  // ------------------------------------------
  describe("複数選択トグル動作", () => {
    it("TC-U-02: Q1 ボタンをクリックすると selectedOptions に追加される", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q1.selectedOptions).toContain("自分のみ");
    });

    it("TC-U-03: Q1 で選択済みボタンを再クリックすると selectedOptions から除去される", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q1.selectedOptions).not.toContain("自分のみ");
      expect(latestAnswers.q1.selectedOptions).toHaveLength(0);
    });

    it("TC-U-04: Q1 で複数ボタンを同時選択できる", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      fireEvent.click(screen.getByRole("button", { name: "チームメンバー" }));
      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q1.selectedOptions).toHaveLength(2);
      expect(latestAnswers.q1.selectedOptions).toContain("自分のみ");
      expect(latestAnswers.q1.selectedOptions).toContain("チームメンバー");
    });

    it("TC-U-05: 選択されたボタンの aria-pressed が true になる", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("TC-U-06: 未選択ボタンの aria-pressed が false である", () => {
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
      expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("TC-U-07: あるボタンを選択したとき、他のボタンの aria-pressed は変化しない", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      expect(
        screen.getByRole("button", { name: "チームメンバー" }),
      ).toHaveAttribute("aria-pressed", "false");
      expect(screen.getByRole("button", { name: "社内全体" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      expect(
        screen.getByRole("button", { name: "外部ユーザー" }),
      ).toHaveAttribute("aria-pressed", "false");
    });
  });

  // ------------------------------------------
  // Q3 定期実行複数選択特殊処理
  // ------------------------------------------
  describe("Q3 定期実行複数選択特殊処理", () => {
    it("TC-U-09: 「定期実行」を解除すると ScheduleConfigInput が閉じる", () => {
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
      expect(screen.getByLabelText(/cron式/)).toBeInTheDocument();
      // 再クリックで解除
      fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
      expect(screen.queryByLabelText(/cron式/)).not.toBeInTheDocument();
    });

    it("TC-U-10: 「定期実行」と「手動実行」を同時選択しても ScheduleConfigInput が展開される", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "手動実行" }));
      expect(screen.getByLabelText(/cron式/)).toBeInTheDocument();
    });

    it("TC-U-11: 「手動実行」が選択中に「定期実行」を選択すると ScheduleConfigInput が展開される", () => {
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
      expect(screen.queryByLabelText(/cron式/)).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
      expect(screen.getByLabelText(/cron式/)).toBeInTheDocument();
    });

    it("TC-U-12: 「定期実行」+「手動実行」選択後に「定期実行」を解除すると ScheduleConfigInput が閉じる", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "手動実行" }));
      fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
      expect(screen.queryByLabelText(/cron式/)).not.toBeInTheDocument();
      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q3.scheduleConfig).toBeUndefined();
    });

    it("TC-U-16: cron 入力中に selectedOptions に「定期実行」が含まれる", () => {
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
      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q3.selectedOptions).toContain("定期実行");
    });
  });

  // ------------------------------------------
  // フェイルパス: selectedOptions 境界ケース
  // ------------------------------------------
  describe("フェイルパス: selectedOptions 境界ケース", () => {
    it("FP-01: selectedOptions が空のとき「選択済み」バッジが表示されない", () => {
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
      expect(screen.queryByText(/選択済み/)).not.toBeInTheDocument();
    });

    it("FP-06: Q3「定期実行」解除後に再選択すると scheduleConfig が復元される", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "定期実行" })); // 選択
      fireEvent.click(screen.getByRole("button", { name: "定期実行" })); // 解除
      fireEvent.click(screen.getByRole("button", { name: "定期実行" })); // 再選択
      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q3.scheduleConfig).toBeDefined();
      expect(latestAnswers.q3.selectedOptions).toContain("定期実行");
    });
  });

  // ------------------------------------------
  // 回帰ガード: 単一選択ユースケース
  // ------------------------------------------
  describe("回帰ガード: 単一選択ユースケース", () => {
    it("RG-01: 1ボタン選択後 selectedOptions に1要素が入る", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q1.selectedOptions).toEqual(["自分のみ"]);
    });

    it("RG-03: freeText 入力時は selectedOptions が空のまま", () => {
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
      const latestAnswers = (mockOnAnswersChange.mock.calls.at(-1)?.[0] ??
        defaultAnswers) as ConversationAnswers;
      expect(latestAnswers.q1.freeText).toBe("社内の担当者");
      expect(latestAnswers.q1.selectedOptions).toEqual([]);
    });

    it("RG-05: 複数選択後も「次のページ」で Page2 に遷移できる", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      fireEvent.click(screen.getByRole("button", { name: "チームメンバー" }));
      fireEvent.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
      expect(screen.getByText("Q4: 出力先（どこへ）")).toBeInTheDocument();
      expect(
        screen.queryByText("Q1: 利用者（誰が使うか）"),
      ).not.toBeInTheDocument();
    });
  });

  // ------------------------------------------
  // アクセシビリティ: aria-pressed 複数ボタン独立制御
  // ------------------------------------------
  describe("アクセシビリティ: aria-pressed 複数ボタン独立制御", () => {
    it("A11Y-03: 複数選択後は選択された複数ボタンがそれぞれ aria-pressed=true", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      fireEvent.click(screen.getByRole("button", { name: "チームメンバー" }));
      expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(
        screen.getByRole("button", { name: "チームメンバー" }),
      ).toHaveAttribute("aria-pressed", "true");
    });

    it("A11Y-04: 選択解除後は aria-pressed が false に戻る", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    it("A11Y-05: Q1 ボタン選択時に「選択済み」バッジが表示される", () => {
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
      expect(screen.queryAllByText(/選択済み/)).toHaveLength(0);
      fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
      expect(screen.getAllByText(/選択済み/).length).toBeGreaterThan(0);
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

  // ------------------------------------------
  // UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001: Q5「主ツール」バッジ表示（Phase 4 TDD Red）
  // ------------------------------------------
  describe("UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001: Q5「主ツール」バッジ表示", () => {
    const goToPage2 = () => {
      fireEvent.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
    };

    it("TC-1: Q5で2ツール選択時に先頭ツールに「主ツール」バッジが表示される（AC-1）", () => {
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
      goToPage2();
      fireEvent.click(screen.getByRole("button", { name: "Slack" }));
      fireEvent.click(screen.getByRole("button", { name: "GitHub" }));
      expect(screen.getByText("主ツール")).toBeInTheDocument();
      expect(
        within(screen.getByRole("button", { name: "Slack" })).getByText(
          "主ツール",
        ),
      ).toBeInTheDocument();
    });

    it("TC-2: Q5で2ツール選択時に2番目ツールにバッジが表示されない（AC-1）", () => {
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
      goToPage2();
      fireEvent.click(screen.getByRole("button", { name: "Slack" }));
      fireEvent.click(screen.getByRole("button", { name: "GitHub" }));
      expect(
        within(screen.getByRole("button", { name: "GitHub" })).queryByText(
          "主ツール",
        ),
      ).not.toBeInTheDocument();
    });

    it("TC-3: Q5で1ツールのみ選択時にバッジが表示されない（AC-2）", () => {
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
      goToPage2();
      fireEvent.click(screen.getByRole("button", { name: "Slack" }));
      expect(screen.queryByText("主ツール")).not.toBeInTheDocument();
    });

    it("TC-4: バッジのaria-labelに「主ツールとして使用される」が付与される（AC-3）", () => {
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
      goToPage2();
      fireEvent.click(screen.getByRole("button", { name: "Slack" }));
      fireEvent.click(screen.getByRole("button", { name: "GitHub" }));
      expect(
        screen.getByLabelText("主ツールとして使用される"),
      ).toBeInTheDocument();
    });

    it("TC-5: Q3で複数選択してもバッジが表示されない（副作用なし・AC-4）", () => {
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
      fireEvent.click(screen.getByRole("button", { name: "定期実行" }));
      expect(screen.queryByText("主ツール")).not.toBeInTheDocument();
    });

    it("TC-6: Q5で3ツール選択時も先頭のみバッジが表示される（AC-1拡張）", () => {
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
      goToPage2();
      fireEvent.click(screen.getByRole("button", { name: "Slack" }));
      fireEvent.click(screen.getByRole("button", { name: "GitHub" }));
      fireEvent.click(screen.getByRole("button", { name: "その他" }));
      expect(screen.getAllByText("主ツール")).toHaveLength(1);
      expect(
        within(screen.getByRole("button", { name: "Slack" })).getByText(
          "主ツール",
        ),
      ).toBeInTheDocument();
    });
  });

  // ------------------------------------------
  // UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001: 拡充テスト（Phase 6）
  // ------------------------------------------
  describe("UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001: 拡充テスト（Phase 6）", () => {
    const goToPage2 = () => {
      fireEvent.click(screen.getByRole("button", { name: /次のページ|次へ/ }));
    };

    it("FP-MSO-01: Q5で2ツール選択後に先頭を解除すると1件になりバッジが消える（AC-2）", () => {
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
      goToPage2();
      fireEvent.click(screen.getByRole("button", { name: "Slack" }));
      fireEvent.click(screen.getByRole("button", { name: "GitHub" }));
      // バッジ表示確認
      expect(screen.getByText("主ツール")).toBeInTheDocument();
      // Slack を解除して1件だけに（ボタン名は Slack のまま維持される）
      fireEvent.click(screen.getByRole("button", { name: "Slack" }));
      // バッジ消去確認
      expect(screen.queryByText("主ツール")).not.toBeInTheDocument();
    });

    it("FP-MSO-02: Q5で0件選択時にバッジが表示されない（AC-6）", () => {
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
      goToPage2();
      expect(screen.queryByText("主ツール")).not.toBeInTheDocument();
    });

    it("CMD-MSO-01: Q5でGitHubを最初に選択するとGitHubに主ツールバッジが付く", () => {
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
      goToPage2();
      fireEvent.click(screen.getByRole("button", { name: "GitHub" }));
      fireEvent.click(screen.getByRole("button", { name: "Slack" }));
      // 先頭選択はGitHub → GitHubに主ツールバッジ
      expect(
        within(screen.getByRole("button", { name: "GitHub" })).getByText(
          "主ツール",
        ),
      ).toBeInTheDocument();
      // Slackにはバッジなし
      expect(
        within(screen.getByRole("button", { name: "Slack" })).queryByText(
          "主ツール",
        ),
      ).not.toBeInTheDocument();
    });

    it("RG-MSO-Q4: Q4で複数選択してもバッジが表示されない（AC-4）", () => {
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
      goToPage2();
      fireEvent.click(screen.getByRole("button", { name: "チャット返信" }));
      fireEvent.click(screen.getByRole("button", { name: "ファイル保存" }));
      expect(screen.queryByText("主ツール")).not.toBeInTheDocument();
    });

    it("RG-MSO-Q6: Q6で複数選択してもバッジが表示されない（AC-4）", () => {
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
      goToPage2();
      fireEvent.click(screen.getByRole("button", { name: "Markdown" }));
      fireEvent.click(screen.getByRole("button", { name: "JSON" }));
      expect(screen.queryByText("主ツール")).not.toBeInTheDocument();
    });
  });
});

// ============================================================
// UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001
// resolveSemanticLabel / applySmartDefaults 単体テスト
// ============================================================

const emptyAnswers: ConversationAnswers = {
  q1: { selectedOptions: [], freeText: "" },
  q2: { selectedOptions: [], freeText: "" },
  q3: { selectedOptions: [], freeText: "" },
  q4: { selectedOptions: [], freeText: "" },
  q5: { selectedOptions: [], freeText: "" },
  q6: { selectedOptions: [], freeText: "" },
};

describe("resolveSemanticLabel / applySmartDefaults（semantic default 入力元拡張対応）", () => {
  // ------------------------------------------
  // TC-01〜TC-06: resolveSemanticLabel 正規化ロジック
  // ------------------------------------------
  describe("TC-01〜TC-06: 正規化ロジックの検証", () => {
    it("TC-01: q1 '自分だけ' が '自分のみ' に変換される", () => {
      // length: 4 ("自分だけ".length === 4)
      const result = resolveSemanticLabel("自分だけ", "q1");
      expect(result).toBe("自分のみ");
    });

    it("TC-02: q5 'slack' が 'Slack' に変換される", () => {
      // length: 5 ("slack".length === 5)
      const result = resolveSemanticLabel("slack", "q5");
      expect(result).toBe("Slack");
    });

    it("TC-03: q5 'github' が 'GitHub' に変換される", () => {
      // length: 6 ("github".length === 6)
      const result = resolveSemanticLabel("github", "q5");
      expect(result).toBe("GitHub");
    });

    it("TC-04: undefined 入力は undefined を返す", () => {
      const result = resolveSemanticLabel(undefined, "q1");
      expect(result).toBeUndefined();
    });

    it("TC-05: 未定義 questionId はフォールバックして値をそのまま返す", () => {
      // length: 2 ("任意".length === 2)
      const result = resolveSemanticLabel("任意", "q99");
      expect(result).toBe("任意");
    });

    it("TC-06: マッピング未定義の rawValue はそのまま返す", () => {
      // length: 5 ("存在しない".length === 5) + "値" = 6
      const result = resolveSemanticLabel("存在しない値", "q1");
      expect(result).toBe("存在しない値");
    });
  });

  // ------------------------------------------
  // TC-07: DI（依存性注入）の検証
  // ------------------------------------------
  describe("TC-07: DI（カスタム labelMap）の検証", () => {
    it("TC-07: カスタム labelMap を渡した場合に正しく変換される", () => {
      // length: 3 ("foo".length === 3)
      const customMap: QuestionSemanticLabelMap = {
        qX: { foo: "bar" },
      };
      const result = resolveSemanticLabel("foo", "qX", customMap);
      expect(result).toBe("bar");
    });
  });

  // ------------------------------------------
  // TC-08〜TC-10: applySmartDefaults の全フィールド検証
  // ------------------------------------------
  describe("TC-08〜TC-10: applySmartDefaults の変換検証", () => {
    it("TC-08: smartDefaults.who='自分だけ' が q1='自分のみ' に変換される", () => {
      const smartDefaults: SmartDefaultResult = {
        who: "自分だけ",
        input: null,
        timing: null,
        output: null,
        tool: null,
        format: null,
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q1.selectedOptions).toContain("自分のみ");
    });

    it("TC-09: smartDefaults.timing='scheduled' が q3='定期実行' に変換される", () => {
      const smartDefaults: SmartDefaultResult = {
        who: null,
        input: null,
        timing: "scheduled",
        output: null,
        tool: null,
        format: null,
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q3.selectedOptions).toContain("定期実行");
    });

    it("TC-10: smartDefaults.tool='slack' が q5='Slack' に変換される（回帰テスト）", () => {
      const smartDefaults: SmartDefaultResult = {
        who: null,
        input: null,
        timing: null,
        output: null,
        tool: "slack",
        format: null,
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q5.selectedOptions).toContain("Slack");
    });
  });

  // ------------------------------------------
  // TC-11: エッジケース
  // ------------------------------------------
  describe("TC-11: エッジケースのハンドリング", () => {
    it("TC-11: 空文字列入力は空文字列をそのまま返す", () => {
      // length: 0 ("".length === 0)
      const result = resolveSemanticLabel("", "q1");
      expect(result).toBe("");
    });
  });

  // ------------------------------------------
  // TC-12: SEMANTIC_LABEL_MAP の import 確認
  // ------------------------------------------
  describe("TC-12: SEMANTIC_LABEL_MAP の import 確認", () => {
    it("TC-12: SEMANTIC_LABEL_MAP が利用できる", () => {
      expect(SEMANTIC_LABEL_MAP).toBeDefined();
    });

    it("TC-12b: SEMANTIC_LABEL_MAP が q1〜q6 のキーを持つ", () => {
      expect(SEMANTIC_LABEL_MAP).toHaveProperty("q1");
      expect(SEMANTIC_LABEL_MAP).toHaveProperty("q3");
      expect(SEMANTIC_LABEL_MAP).toHaveProperty("q5");
    });
  });

  // ------------------------------------------
  // Phase 6: 英語入力・フォールバック動作検証
  // ------------------------------------------
  describe("Phase 6: 英語入力・略称のフォールバック動作", () => {
    it('英語入力 "myself only" はマップ未定義のためそのまま返す', () => {
      // length: 11 ("myself only".length === 11)
      const input = "myself only";
      expect(resolveSemanticLabel(input, "q1")).toBe("myself only");
    });

    it('英語入力 "just me" はマップ未定義のためそのまま返す', () => {
      // length: 7 ("just me".length === 7)
      const input = "just me";
      expect(resolveSemanticLabel(input, "q1")).toBe("just me");
    });

    it('英語入力 "daily" はマップ未定義のためそのまま返す', () => {
      // length: 5 ("daily".length === 5)
      const input = "daily";
      expect(resolveSemanticLabel(input, "q3")).toBe("daily");
    });

    it('英語入力 "weekly" はマップ未定義のためそのまま返す', () => {
      // length: 6 ("weekly".length === 6)
      const input = "weekly";
      expect(resolveSemanticLabel(input, "q6")).toBe("weekly");
    });

    it('表記揺れ "自分だけ" は q1 マッピングで "自分のみ" に変換される', () => {
      // length: 4 ("自分だけ".length === 4)
      const input = "自分だけ";
      expect(resolveSemanticLabel(input, "q1")).toBe("自分のみ");
    });

    it('正準形入力 "自分のみ" はそのまま返す（マップにないが同値）', () => {
      // length: 4 ("自分のみ".length === 4)
      const input = "自分のみ";
      // q1 map: { 自分だけ: "自分のみ" } → "自分のみ" はキーにないのでフォールバック
      expect(resolveSemanticLabel(input, "q1")).toBe("自分のみ");
    });
  });

  // ------------------------------------------
  // Phase 6: 異常系・境界値テスト
  // ------------------------------------------
  describe("Phase 6: 異常系・境界値入力のハンドリング", () => {
    it('数値文字列 "123" はそのまま返す', () => {
      // length: 3 ("123".length === 3)
      expect(resolveSemanticLabel("123", "q1")).toBe("123");
    });

    it('特殊文字 "@#$%" はそのまま返す', () => {
      // length: 4 ("@#$%".length === 4)
      expect(resolveSemanticLabel("@#$%", "q1")).toBe("@#$%");
    });

    it('全角スペース "　" はそのまま返す', () => {
      // 全角スペース (U+3000) length === 1
      expect(resolveSemanticLabel("　", "q1")).toBe("　");
    });

    it('全角半角混在 "自分only" はそのまま返す', () => {
      // length: 6 ("自分only".length === 6)
      expect(resolveSemanticLabel("自分only", "q1")).toBe("自分only");
    });

    it('英数字+日本語混在 "Daily毎日" はそのまま返す', () => {
      // length: 7 ("Daily毎日".length === 7)
      expect(resolveSemanticLabel("Daily毎日", "q3")).toBe("Daily毎日");
    });
  });

  // ------------------------------------------
  // Phase 6: applySmartDefaults 回帰テスト（q1〜q6 全エントリ）
  // ------------------------------------------
  describe("Phase 6: applySmartDefaults 回帰テスト（Phase 5 実装変更後）", () => {
    it("shared 外部化後も q6 format='週次' → freeText='週に1回' の変換が維持される", () => {
      // Q6 options: ["Markdown", "プレーンテキスト", "JSON", "箇条書き"]
      // "週に1回" は options にないため freeText に格納される
      const smartDefaults: SmartDefaultResult = {
        who: null,
        input: null,
        timing: null,
        output: null,
        tool: null,
        format: "週次",
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q6.freeText).toBe("週に1回");
    });

    it("smartDefaults.format='Markdown' が q6='Markdown' として選択される", () => {
      const smartDefaults: SmartDefaultResult = {
        who: null,
        input: null,
        timing: null,
        output: null,
        tool: null,
        format: "Markdown",
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q6.selectedOptions).toContain("Markdown");
      expect(result.q6.freeText).toBe("");
    });

    it("smartDefaults.format='JSON' が q6='JSON' として選択される", () => {
      const smartDefaults: SmartDefaultResult = {
        who: null,
        input: null,
        timing: null,
        output: null,
        tool: null,
        format: "JSON",
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q6.selectedOptions).toContain("JSON");
      expect(result.q6.freeText).toBe("");
    });

    it("who=null のとき q1 は空選択のまま（defaultValue なし）", () => {
      const smartDefaults: SmartDefaultResult = {
        who: null,
        input: null,
        timing: null,
        output: null,
        tool: null,
        format: null,
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q1.selectedOptions).toHaveLength(0);
      expect(result.q1.freeText).toBe("");
    });

    it("q5 tool='github' → 'GitHub' 変換が維持される", () => {
      const smartDefaults: SmartDefaultResult = {
        who: null,
        input: null,
        timing: null,
        output: null,
        tool: "github",
        format: null,
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q5.selectedOptions).toContain("GitHub");
    });

    it("smartDefaults.tool='Jira' は元の表記を保持して q5 自由入力に入る", () => {
      const smartDefaults: SmartDefaultResult = {
        who: null,
        input: null,
        timing: null,
        output: null,
        tool: "Jira",
        format: null,
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q5.selectedOptions).toHaveLength(0);
      expect(result.q5.freeText).toBe("Jira");
    });

    it("smartDefaults.tool='notion' が q5='その他' + freeText='Notion' に変換される", () => {
      const smartDefaults: SmartDefaultResult = {
        who: null,
        input: null,
        timing: null,
        output: null,
        tool: "notion",
        format: null,
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q5.selectedOptions).toContain("その他");
      expect(result.q5.freeText).toBe("Notion");
    });

    it("inferSmartDefaults が返す全フィールドを一括変換できる", () => {
      const smartDefaults: SmartDefaultResult = {
        who: "自分だけ",
        input: null,
        timing: "scheduled",
        output: null,
        tool: "slack",
        format: "週次",
      };
      const result = applySmartDefaults(emptyAnswers, smartDefaults);
      expect(result.q1.selectedOptions).toContain("自分のみ");
      expect(result.q3.selectedOptions).toContain("定期実行");
      expect(result.q5.selectedOptions).toContain("Slack");
      // "週次" → resolveSemanticLabel → "週に1回"（Q6 options にないため freeText に格納）
      expect(result.q6.freeText).toBe("週に1回");
    });
  });
});

// ============================================================
// TASK-SW-FIX-STATE-DETAIL-001: 問題12 internalAnswers リセット（TC-01/TC-02）
// ============================================================

describe("TASK-SW-FIX-STATE-DETAIL-001: 問題12 internalAnswers リセット", () => {
  let mockOnAnswersChange: ReturnType<typeof vi.fn>;
  let mockOnBack: ReturnType<typeof vi.fn>;
  let mockOnGenerate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAnswersChange = vi.fn();
    mockOnBack = vi.fn();
    mockOnGenerate = vi.fn();
  });

  it("TC-01: answersが空値に変化するとinternalAnswersがリセットされる（問題12修正）", async () => {
    const { rerender } = render(
      <ConversationRoundStep
        formData={defaultFormData}
        smartDefaults={defaultSmartDefaults}
        answers={completeAnswers}
        onAnswersChange={mockOnAnswersChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    // 初期状態: completeAnswers の選択が反映されている
    expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // answers を空値にリセット（リトライシミュレーション）
    await act(async () => {
      rerender(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={defaultAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
    });

    // internalAnswers がリセットされていること
    expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("TC-02: 通常フローでユーザーが操作してもinternalAnswersが保持される（回帰）", () => {
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

    // ユーザーが選択
    fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));

    // internalAnswers が保持されていること（リセットされていない）
    expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // onAnswersChange の最新呼び出しに選択が含まれること
    const lastAnswers = mockOnAnswersChange.mock.calls.at(
      -1,
    )?.[0] as ConversationAnswers;
    expect(lastAnswers.q1.selectedOptions).toContain("自分のみ");
  });

  it("TC-11: 非空のanswers変化ではinternalAnswersがリセットされない（境界）", async () => {
    const { rerender } = render(
      <ConversationRoundStep
        formData={defaultFormData}
        smartDefaults={defaultSmartDefaults}
        answers={defaultAnswers}
        onAnswersChange={mockOnAnswersChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    // ユーザーが選択
    fireEvent.click(screen.getByRole("button", { name: "自分のみ" }));
    expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // 非空のanswersで再レンダリング（選択内容を反映した props）
    const updatedAnswers: ConversationAnswers = {
      ...defaultAnswers,
      q1: { selectedOptions: ["自分のみ"], freeText: "" },
    };

    await act(async () => {
      rerender(
        <ConversationRoundStep
          formData={defaultFormData}
          smartDefaults={defaultSmartDefaults}
          answers={updatedAnswers}
          onAnswersChange={mockOnAnswersChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
    });

    // 非空のanswersなのでリセットされずinternalAnswersが保持されること
    expect(screen.getByRole("button", { name: "自分のみ" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
