/**
 * @file SkillCreateWizard.test.tsx
 * @description SkillCreateWizard 統合コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 *
 * W2-seq-03a 新設計:
 * - 3ステップ構成（SkillInfoStep / ConversationRoundStep / CompleteStep）
 * - Step 0 → Step 1 で inferSmartDefaults を呼び出す
 * - Step 1 → Step 2 で createSkill を呼び出す
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  SkillCreateWizard,
  resolveExternalIntegration,
  inferSmartDefaults,
  STEPS,
} from "../SkillCreateWizard";
import type {
  ConversationAnswers,
  SmartDefaultResult,
} from "@repo/shared/types/skillCreator";

const mockCreateSkill = vi.fn();
const mockFetchSkills = vi.fn();
const mockClearGenerationState = vi.fn();
const mockUseWorkflowSnapshot = vi.fn(() => null);
const mockInferSmartDefaults = vi.fn();

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useFetchSkills: () => mockFetchSkills,
  useClearGenerationState: () => mockClearGenerationState,
  useWorkflowSnapshot: () => mockUseWorkflowSnapshot(),
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  useCurrentPlanId: () => null,
  useCurrentPlanResult: () => null,
  useSetIsSkillGenerating: () => vi.fn(),
  useSetGenerationProgress: () => vi.fn(),
  useSetGenerationError: () => vi.fn(),
  useSetCurrentPlanId: () => vi.fn(),
  useSetCurrentPlanResult: () => vi.fn(),
  useResetStreamingProgress: () => vi.fn(),
}));

vi.mock("../../../hooks/useStreamingProgress", () => ({
  useStreamingProgress: () => ({
    stage: "idle" as const,
    percent: 0,
    message: "",
    previewContent: null,
    error: null,
    isGenerating: false,
  }),
}));

vi.mock("../../../hooks/useCancelGeneration", () => ({
  useCancelGeneration: () => ({ cancelGeneration: vi.fn() }),
}));

vi.mock(
  "../../../../../../../packages/shared/src/services/skillCreator/index.ts",
  () => ({
    inferSmartDefaults: (...args: unknown[]) => mockInferSmartDefaults(...args),
  }),
);

const defaultSmartDefaults: SmartDefaultResult = {
  who: "チームメンバー",
  input: "テキスト",
  timing: "定期実行",
  output: "通知",
  tool: "Slack",
  format: "Markdown",
  inferenceLog: ["mock"],
};

function renderWizard(onClose = vi.fn()) {
  render(<SkillCreateWizard onClose={onClose} />);
  return onClose;
}

function fillStep0(
  purpose = "Slack通知を毎日送るための目的説明",
  category = "外部連携",
) {
  fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
    target: { value: purpose },
  });
  fireEvent.click(screen.getByRole("button", { name: category }));
}

async function advanceToStep1(purpose?: string) {
  fillStep0(purpose);
  fireEvent.click(screen.getByRole("button", { name: "次へ" }));
  await act(async () => {
    await Promise.resolve();
  });
}

async function advanceToComplete() {
  // "毎日" を含まないpurposeを使用する。
  // "毎日" を含むとSmartDefaultsが"定期実行"を選択し、cron式の空バリデーションが発動するため。
  await advanceToStep1("Slack通知を送るための目的説明");
  fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
  fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "生成する" }));
  });
  await act(async () => {
    await mockCreateSkill.mock.results[0]?.value;
  });
}

describe("SkillCreateWizard", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockCreateSkill.mockResolvedValue("/mock/skills/new-skill");
    mockInferSmartDefaults.mockReturnValue(defaultSmartDefaults);
    mockUseWorkflowSnapshot.mockReturnValue(null);
  });

  describe("初期表示", () => {
    it("Step 0（スキル情報入力）が最初に表示される", () => {
      renderWizard(mockOnClose);

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByText("目的・背景")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(screen.getByTestId("skill-create-wizard")).toHaveAttribute(
        "data-route-kind",
        "destination",
      );
    });
  });

  describe("ステップ遷移", () => {
    it("Step 0 → Step 1 で inferSmartDefaults が呼ばれ、結果が Step 1 に渡る", async () => {
      renderWizard(mockOnClose);

      fillStep0();
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        await Promise.resolve();
      });

      // Slack+毎日 → timing="scheduled"="定期実行" が自動選択される
      expect(screen.getByRole("button", { name: "定期実行" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(
        screen.getByRole("button", { name: "次のページ" }),
      ).toBeInTheDocument();
    });

    it("Step 1 から Step 0 に戻ると formData が保持される", async () => {
      renderWizard(mockOnClose);

      const purpose = "保持テストの入力データ";
      fillStep0(purpose);
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        await Promise.resolve();
      });

      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /目的/ })).toHaveValue(
        purpose,
      );
    });

    it("Step 1 の生成完了後に Step 2（CompleteStep）が表示される", async () => {
      renderWizard(mockOnClose);

      await advanceToComplete();

      expect(screen.getByTestId("wizard-step-complete")).toBeInTheDocument();
      expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-execute"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-open-editor"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-action-create-another"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-external-checklist"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("complete-step-external-checklist"),
      ).toHaveTextContent("Slack Webhook URL を設定する");
    });
  });

  describe("完了画面", () => {
    it("今すぐ実行する / エディタで開く で onClose が呼ばれる", async () => {
      renderWizard(mockOnClose);

      await advanceToComplete();

      fireEvent.click(screen.getByTestId("complete-step-action-execute"));
      fireEvent.click(screen.getByTestId("complete-step-action-open-editor"));

      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it("別のスキルを作るで Step 0 に戻り、入力がリセットされる", async () => {
      renderWizard(mockOnClose);

      await advanceToComplete();

      fireEvent.click(
        screen.getByTestId("complete-step-action-create-another"),
      );

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
      expect(screen.getByRole("textbox", { name: /目的/ })).toHaveValue("");
      expect(screen.queryByTestId("complete-step-header")).toBeNull();
    });

    it("👎 で Step 0 に戻り、formData が保持される", async () => {
      const purpose = "テストスキルの説明文字列";
      renderWizard(mockOnClose);

      fillStep0(purpose);
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        await Promise.resolve();
      });
      fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /目的/ })).toHaveValue(
        purpose,
      );
    });
  });

  // ============================================================
  // 外部連携の解決ロジック
  // ============================================================
  describe("resolveExternalIntegration", () => {
    const q5Answer = (value: ConversationAnswers["q5"]) => value;

    it("選択が空なら smartDefaultTool を外部連携の初期値として使う", () => {
      expect(
        resolveExternalIntegration(
          q5Answer({ selectedOptions: [], freeText: "" }),
          "github",
        ),
      ).toEqual({
        hasExternalIntegration: true,
        externalToolName: "GitHub",
      });
    });

    it("selectedOptions の先頭値を主ツールとして参照する", () => {
      expect(
        resolveExternalIntegration(
          q5Answer({ selectedOptions: ["Slack", "GitHub"], freeText: "" }),
          null,
        ),
      ).toEqual({
        hasExternalIntegration: true,
        externalToolName: "Slack",
      });
    });

    it("selectedOptions が『その他』かつ freeText が Notion の場合は Notion を採用する", () => {
      expect(
        resolveExternalIntegration(
          q5Answer({ selectedOptions: ["その他"], freeText: "Notion" }),
          null,
        ),
      ).toEqual({
        hasExternalIntegration: true,
        externalToolName: "Notion",
      });
    });

    it("先頭が「なし」の場合は後続選択より優先される", () => {
      expect(
        resolveExternalIntegration(
          q5Answer({ selectedOptions: ["なし", "Slack"], freeText: "" }),
          "notion",
        ),
      ).toEqual({
        hasExternalIntegration: false,
        externalToolName: null,
      });
    });
  });

  // ============================================================
  // IPC 呼び出し
  // ============================================================
  describe("IPC 呼び出し", () => {
    it("IPC 失敗時にエラーカードが表示される", async () => {
      mockCreateSkill.mockRejectedValue(new Error("生成失敗"));
      renderWizard(mockOnClose);

      await advanceToStep1("Slack通知を送るための目的説明");
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("生成失敗")).toBeInTheDocument();
    });

    it("createSkill が空文字を返した場合はフォールバックエラーが表示される", async () => {
      mockCreateSkill.mockResolvedValue("");
      renderWizard(mockOnClose);

      await advanceToStep1("Slack通知を送るための目的説明");
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
    });

    it("Q5 の複数選択は完了画面の外部連携チェックに反映される", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 0 → Step 1（SmartDefaults で Slack が Q5 に設定される）
      fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
        target: { value: "Slack と GitHub に通知する" },
      });
      fireEvent.click(screen.getByRole("button", { name: "外部連携" }));
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        await Promise.resolve();
      });

      // Page 2 へ進み、Q5 で GitHub を追加選択（Slack は SmartDefaults で選択済み）
      fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
      fireEvent.click(screen.getByRole("button", { name: "GitHub" }));

      // Step 2 -> 生成 -> 完了
      fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "生成する" }));
      });
      await act(async () => {
        await mockCreateSkill.mock.results[0]?.value;
      });

      expect(
        screen.getByTestId("complete-step-external-checklist"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Slack Webhook URL を設定する"),
      ).toBeInTheDocument();
    });
  });

  // ============================================================
  // TASK-SW-FIX-MODE-MGMT-001: LLM専用フロー検証（TC-01〜TC-05）
  // ============================================================
  describe("TASK-SW-FIX-MODE-MGMT-001: LLM専用フロー検証", () => {
    it("TC-01: Step 0にラジオボタン（テンプレートから作成/LLMで生成）が表示されないこと", () => {
      renderWizard(mockOnClose);
      expect(screen.queryByText("テンプレートから作成")).toBeNull();
      expect(screen.queryByText("LLMで生成")).toBeNull();
      expect(screen.queryByText("LLM で生成")).toBeNull();
    });

    it("TC-02: data-testid='generation-mode-selector'が存在しないこと", () => {
      renderWizard(mockOnClose);
      expect(screen.queryByTestId("generation-mode-selector")).toBeNull();
    });

    it("TC-03: Step 0の次へボタンクリックでStep 1（ConversationRoundStep）に遷移すること", async () => {
      renderWizard(mockOnClose);
      fillStep0();
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        await Promise.resolve();
      });
      expect(
        screen.getByTestId("wizard-step-conversation-round"),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("wizard-step-generate")).toBeNull();
    });

    it("TC-04: Step 0次へ後にStep 2（GenerateStep）が直接表示されないこと", async () => {
      renderWizard(mockOnClose);
      fillStep0();
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.queryByTestId("wizard-step-generate")).toBeNull();
      expect(
        screen.getByTestId("wizard-step-conversation-round"),
      ).toBeInTheDocument();
    });

    it("TC-05: Step 0→Step 1遷移後にgeneration-mode-selectorが存在しないこと", async () => {
      renderWizard(mockOnClose);
      expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
      fillStep0();
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));
      await act(async () => {
        await Promise.resolve();
      });
      expect(
        screen.getByTestId("wizard-step-conversation-round"),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("generation-mode-selector")).toBeNull();
    });
  });

  // ============================================================
  // STEPS 配列テスト（Phase 4: W2-seq-03a STEPS名変更確認）
  // ============================================================
  describe("STEPS 配列", () => {
    it("STEPS が ['スキル情報入力','詳細設定','生成','完了'] であること", () => {
      expect(STEPS).toEqual(["スキル情報入力", "詳細設定", "生成", "完了"]);
    });

    it("STEPS の長さが 4 であること", () => {
      expect(STEPS).toHaveLength(4);
    });
  });

  // ============================================================
  // inferSmartDefaults 単体テスト（Phase 4: TDD Red→Green）
  // ============================================================
  describe("inferSmartDefaults", () => {
    it("purpose に 'Slack' を含む場合、tool='slack' を推論すること", () => {
      const result: SmartDefaultResult = inferSmartDefaults({
        skillName: "テスト",
        purpose: "Slack通知を送る",
        category: "automation",
      });
      expect(result.tool).toBe("slack");
    });

    it("purpose に 'SLACK'（大文字）を含む場合も tool='slack' を推論すること", () => {
      const result = inferSmartDefaults({
        purpose: "SLACK通知を毎日送る",
        category: null,
      });
      expect(result.tool).toBe("slack");
    });

    it("purpose に 'github' を含む場合、tool='github' を推論すること", () => {
      const result = inferSmartDefaults({
        purpose: "GitHubのPRをレビューする",
        category: null,
      });
      expect(result.tool).toBe("github");
    });

    it("purpose に 'notion' を含む場合、tool='notion' を推論すること", () => {
      const result = inferSmartDefaults({
        purpose: "Notionページを更新する",
        category: null,
      });
      expect(result.tool).toBe("notion");
    });

    it("purpose に '毎日' を含む場合、timing='scheduled' を推論すること", () => {
      const result = inferSmartDefaults({
        purpose: "毎日レポートを生成する",
        category: null,
      });
      expect(result.timing).toBe("scheduled");
    });

    it("purpose に '定期' を含む場合、timing='scheduled' を推論すること", () => {
      const result = inferSmartDefaults({
        purpose: "定期的にデータを集計する",
        category: null,
      });
      expect(result.timing).toBe("scheduled");
    });

    it("purpose に 'リアルタイム' を含む場合、timing='realtime' を推論すること", () => {
      const result = inferSmartDefaults({
        purpose: "リアルタイムで通知する",
        category: null,
      });
      expect(result.timing).toBe("realtime");
    });

    it("category='code-support' の場合、format='code' を推論すること", () => {
      const result = inferSmartDefaults({
        purpose: "コードレビューを行う",
        category: "code-support",
      });
      expect(result.format).toBe("code");
    });

    it("category='data-analysis' の場合、format='structured' を推論すること", () => {
      const result = inferSmartDefaults({
        purpose: "データを分析する",
        category: "data-analysis",
      });
      expect(result.format).toBe("structured");
    });

    it("推論対象キーワードが含まれない場合、各フィールドが null を返すこと", () => {
      const result = inferSmartDefaults({
        purpose: "汎用的なタスク",
        category: null,
      });
      expect(result.tool).toBeNull();
      expect(result.timing).toBeNull();
      expect(result.format).toBeNull();
    });

    it("purpose が空文字の場合、全フィールドが null を返すこと", () => {
      const result = inferSmartDefaults({
        purpose: "",
        category: null,
      });
      expect(result.tool).toBeNull();
      expect(result.timing).toBeNull();
      expect(result.format).toBeNull();
    });

    it("inferenceLog が配列として返ること（推論0件でも）", () => {
      const result = inferSmartDefaults({
        purpose: "汎用タスク",
        category: null,
      });
      expect(Array.isArray(result.inferenceLog)).toBe(true);
    });

    it("Slack を推論した場合 inferenceLog に根拠が記録されること", () => {
      const result = inferSmartDefaults({
        purpose: "slack通知を送る",
        category: null,
      });
      expect(result.inferenceLog).toContain(
        "purpose に 'slack' を検出 → tool = 'slack'",
      );
    });
  });

  // ============================================================
  // TASK-SW-FIX-FEEDBACK-001: fetchSkills 呼び出し検証
  // ============================================================
  describe("fetchSkills統合 (TASK-SW-FIX-FEEDBACK-001)", () => {
    beforeEach(() => {
      mockFetchSkills.mockResolvedValue(undefined);
    });

    it("TC-FEEDBACK-003: [回帰] templateモード成功時、コンポーネントレベルの fetchSkills は呼ばれない（createSkill が内部処理）", async () => {
      renderWizard(mockOnClose);

      await advanceToComplete();

      // templateモードは createSkill の内部で fetchSkills が呼ばれる（storeのagentSlice）
      // コンポーネントから明示的に fetchSkills を呼ぶのは LLM モードのみ
      expect(mockFetchSkills).not.toHaveBeenCalled();
      // createSkill が1回呼ばれていること（createSkill内でfetchSkillsが呼ばれる）
      expect(mockCreateSkill).toHaveBeenCalledTimes(1);
    });
  });
});
