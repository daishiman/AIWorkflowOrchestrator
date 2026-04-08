/**
 * @file SkillCreateWizard.W2-seq-03a.test.tsx
 * @description W2-seq-03a 追加テスト
 * @task UT-SKILL-WIZARD-W2-seq-03a Phase 4
 *
 * テスト対象:
 * - inferSmartDefaults: 推論ルールのユニットテスト
 * - STEPS: ステップ名称の正確性
 * - legacy state 削除: テンプレートUI非表示 / SkillInfoStep 表示
 * - handleRetry: Step 0 復帰と formData 保持
 * - CompleteStep action cards: 今すぐ実行/エディタ/別作成
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  SkillCreateWizard,
  STEPS,
  inferSmartDefaults,
} from "../SkillCreateWizard";

// Store モック
const mockCreateSkill = vi.fn();

vi.mock("../../../store", () => ({
  useCreateSkill: () => mockCreateSkill,
  useIsSkillGenerating: () => false,
  useGenerationProgress: () => null,
  useGenerationError: () => null,
  useClearGenerationState: () => vi.fn(),
  useWorkflowSnapshot: () => null,
}));

vi.mock("../../../hooks/useStreamingProgress", () => ({
  useStreamingProgress: () => ({
    stage: "idle",
    percent: 0,
    message: "",
    previewContent: null,
    error: null,
    isGenerating: false,
  }),
}));

vi.mock("../../../hooks/useCancelGeneration", () => ({
  useCancelGeneration: () => ({
    cancelGeneration: vi.fn(),
    startGeneration: vi.fn(),
  }),
}));

// ── ヘルパー ─────────────────────────────────────────────────────────────────

/** Step 0 → Step 3（完了）まで遷移する */
async function navigateToComplete(
  onClose: ReturnType<typeof vi.fn>,
  purpose = "テストスキルの説明文字列",
) {
  render(<SkillCreateWizard onClose={onClose} />);
  fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
    target: { value: purpose },
  });
  fireEvent.click(screen.getByRole("button", { name: "自動化" }));
  fireEvent.click(screen.getByRole("button", { name: "次へ" }));
  fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "生成する" }));
  });
  await act(async () => {
    await mockCreateSkill.mock.results[0]?.value;
  });
}

// ── inferSmartDefaults ────────────────────────────────────────────────────────

describe("inferSmartDefaults", () => {
  it("目的に'Slack'を含む場合、tool='slack'を推論すること", () => {
    const result = inferSmartDefaults({
      skillName: "テスト",
      purpose: "Slack通知を送る",
      category: "automation",
    });
    expect(result.tool).toBe("slack");
  });

  it("目的に'毎日'を含む場合、timing='scheduled'を推論すること", () => {
    const result = inferSmartDefaults({
      skillName: "テスト",
      purpose: "毎日レポートを生成する",
      category: "automation",
    });
    expect(result.timing).toBe("scheduled");
  });

  it("category='code-support'の場合、format='code'を推論すること", () => {
    const result = inferSmartDefaults({
      skillName: "テスト",
      purpose: "コードレビューを行う",
      category: "code-support",
    });
    expect(result.format).toBe("code");
  });

  it("推論対象キーワードが含まれない場合、nullを返すこと", () => {
    const result = inferSmartDefaults({
      skillName: "テスト",
      purpose: "汎用的なタスク",
      category: null,
    });
    expect(result.tool).toBeNull();
    expect(result.timing).toBeNull();
    expect(result.format).toBeNull();
  });

  it("purpose が空文字の場合、全フィールドが null であること", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "",
      category: null,
    });
    expect(result.who).toBeNull();
    expect(result.input).toBeNull();
    expect(result.timing).toBeNull();
    expect(result.output).toBeNull();
    expect(result.tool).toBeNull();
    expect(result.format).toBeNull();
  });

  it("inferenceLog が空配列として存在すること（推論0件でも配列）", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "",
      category: null,
    });
    expect(Array.isArray(result.inferenceLog)).toBe(true);
    expect(result.inferenceLog).toHaveLength(0);
  });

  it("inferenceLog に推論根拠が記録されること", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "Slack通知を毎日送る",
      category: null,
    });
    expect(result.inferenceLog!.length).toBeGreaterThan(0);
  });

  it("目的に'GitHub'を含む場合、tool='github'を推論すること", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "GitHub PRを自動レビューする",
      category: null,
    });
    expect(result.tool).toBe("github");
  });

  it("目的に'Notion'を含む場合、tool='notion'を推論すること", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "Notionにページを作成する",
      category: null,
    });
    expect(result.tool).toBe("notion");
  });

  it("category='data-analysis'の場合、format='structured'を推論すること", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "データ分析を行う",
      category: "data-analysis",
    });
    expect(result.format).toBe("structured");
  });

  it("大文字小文字を区別する（小文字'slack'は一致しない）こと", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "slackで通知する",
      category: null,
    });
    expect(result.tool).toBeNull();
  });

  it("複数のツール名が含まれる場合、最初に一致したツールが採用される（Slack > GitHub）", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "Slack と GitHub を連携する",
      category: null,
    });
    expect(result.tool).toBe("slack"); // Slack が先に検出される
  });

  it("'毎日'と'リアルタイム'両方を含む場合、先勝ち（毎日）が採用される", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "毎日リアルタイムで監視する",
      category: null,
    });
    expect(result.timing).toBe("scheduled"); // 毎日が先勝ち
  });

  it("category が null の場合、format が null になること", () => {
    const result = inferSmartDefaults({
      skillName: "",
      purpose: "コードを書く",
      category: null,
    });
    expect(result.format).toBeNull();
  });
});

// ── STEPS ─────────────────────────────────────────────────────────────────────

describe("STEPS", () => {
  it("STEPS配列が['スキル情報入力','詳細設定','生成','完了']であること", () => {
    expect(STEPS).toEqual(["スキル情報入力", "詳細設定", "生成", "完了"]);
  });

  it("STEPSの長さが4であること", () => {
    expect(STEPS).toHaveLength(4);
  });

  it("STEPS[0]が'スキル情報入力'であること", () => {
    expect(STEPS[0]).toBe("スキル情報入力");
  });

  it("STEPS[1]が'詳細設定'であること", () => {
    expect(STEPS[1]).toBe("詳細設定");
  });

  it("STEPS[2]が'生成'であること", () => {
    expect(STEPS[2]).toBe("生成");
  });

  it("STEPS[3]が'完了'であること", () => {
    expect(STEPS[3]).toBe("完了");
  });
});

// ── legacy state / prop 削除確認 ──────────────────────────────────────────────

describe("SkillCreateWizard（legacy state削除後）", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockCreateSkill.mockResolvedValue("/path/to/new-skill");
  });

  it("テンプレート生成の切り替えUIが存在しないこと", () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    expect(screen.queryByTestId("generation-mode-selector")).toBeNull();
  });

  it("旧 description UI が存在しないこと（SkillInfoStep が表示される）", () => {
    render(<SkillCreateWizard onClose={mockOnClose} />);
    expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
    expect(screen.queryByText("スキルの説明")).toBeNull();
  });

  it("GenerateStep に generationMode prop が渡されないこと（Step 2 レンダリング確認）", async () => {
    let resolvePromise: (value: string) => void;
    mockCreateSkill.mockReturnValue(
      new Promise<string>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    render(<SkillCreateWizard onClose={mockOnClose} />);
    fireEvent.change(screen.getByRole("textbox", { name: /目的/ }), {
      target: { value: "テストスキルの説明文" },
    });
    fireEvent.click(screen.getByRole("button", { name: "自動化" }));
    fireEvent.click(screen.getByRole("button", { name: "次へ" }));
    fireEvent.click(screen.getByRole("button", { name: "今すぐ生成する" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "生成する" }));
    });

    // GenerateStep が表示され、mode-selector が存在しないことを確認
    expect(screen.getByTestId("wizard-step-generate")).toBeInTheDocument();
    expect(screen.queryByTestId("generation-mode-selector")).toBeNull();

    await act(async () => {
      resolvePromise!("/path/to/skill");
    });
  });
});

// ── handleRetry ───────────────────────────────────────────────────────────────

describe("handleRetry", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockCreateSkill.mockResolvedValue("/path/to/new-skill");
  });

  it("CompleteStep の 👎 ボタンで Step 0 に戻ること", async () => {
    await navigateToComplete(mockOnClose);

    expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

    expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
  });

  it("Step 0 に戻った後も formData の目的が保持されること", async () => {
    const purpose = "テストスキルの説明文字列";
    await navigateToComplete(mockOnClose, purpose);

    fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

    const purposeTextarea = screen.getByRole("textbox", {
      name: /目的/,
    }) as HTMLTextAreaElement;
    expect(purposeTextarea.value).toBe(purpose);
  });

  it("Step 0 に戻った後 CompleteStep が非表示になること（skillPath リセット）", async () => {
    await navigateToComplete(mockOnClose);

    expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("complete-step-feedback-unsatisfied"));

    expect(screen.queryByTestId("complete-step-header")).toBeNull();
    expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
  });
});

// ── CompleteStep action cards ──────────────────────────────────────────────────

describe("CompleteStep action cards", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockCreateSkill.mockResolvedValue("/path/to/new-skill");
  });

  it("今すぐ実行するボタンが存在すること", async () => {
    await navigateToComplete(mockOnClose);
    expect(
      screen.getByTestId("complete-step-action-execute"),
    ).toBeInTheDocument();
  });

  it("エディタで開くボタンが存在すること", async () => {
    await navigateToComplete(mockOnClose);
    expect(
      screen.getByTestId("complete-step-action-open-editor"),
    ).toBeInTheDocument();
  });

  it("別のスキルを作るボタンが存在すること", async () => {
    await navigateToComplete(mockOnClose);
    expect(
      screen.getByTestId("complete-step-action-create-another"),
    ).toBeInTheDocument();
  });

  it("今すぐ実行するをクリックすると onClose が呼ばれること", async () => {
    await navigateToComplete(mockOnClose);
    fireEvent.click(screen.getByTestId("complete-step-action-execute"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("エディタで開くをクリックすると onClose が呼ばれること", async () => {
    await navigateToComplete(mockOnClose);
    fireEvent.click(screen.getByTestId("complete-step-action-open-editor"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("別のスキルを作るをクリックすると Step 0 に戻ること", async () => {
    await navigateToComplete(mockOnClose);
    fireEvent.click(screen.getByTestId("complete-step-action-create-another"));
    expect(screen.getByTestId("wizard-step-info")).toBeInTheDocument();
  });

  it("hasExternalIntegration=false の場合、外部連携チェックリストが表示されないこと", async () => {
    await navigateToComplete(mockOnClose);
    expect(screen.queryByTestId("complete-step-external-checklist")).toBeNull();
  });

  it("👍 ボタンが存在すること", async () => {
    await navigateToComplete(mockOnClose);
    expect(
      screen.getByTestId("complete-step-feedback-satisfied"),
    ).toBeInTheDocument();
  });

  it("👎 ボタンが存在すること", async () => {
    await navigateToComplete(mockOnClose);
    expect(
      screen.getByTestId("complete-step-feedback-unsatisfied"),
    ).toBeInTheDocument();
  });
});
