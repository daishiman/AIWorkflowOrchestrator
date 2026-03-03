/**
 * @file SkillCreateWizard.test.tsx
 * @description SkillCreateWizard 統合コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-C
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 * P27準拠: IPC_CHANNELS定数経由（ハードコード文字列禁止）
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillCreateWizard } from "../SkillCreateWizard";

// electronAPI.skill.create のモック
const mockCreate = vi.fn();

// window.electronAPI の元の値を保持
const originalElectronAPI = (window as Record<string, unknown>).electronAPI;

describe("SkillCreateWizard", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockCreate.mockResolvedValue({ path: "/path/to/new-skill" });

    // window.electronAPI.skill.create をプロパティ代入でモック
    // happy-dom 環境で vi.stubGlobal("window", ...) は window 全体を置換し
    // DOM 内部オブジェクトが破壊されるため使用不可
    (window as Record<string, unknown>).electronAPI = {
      skill: {
        create: mockCreate,
      },
    };
  });

  afterEach(() => {
    // 元の値を復元
    (window as Record<string, unknown>).electronAPI = originalElectronAPI;
  });

  // ============================================================
  // 初期表示
  // ============================================================
  describe("初期表示", () => {
    it("Step 1（説明入力）が最初に表示される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      expect(screen.getByText("スキルの説明")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("StepIndicator が表示される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute("aria-label", "ウィザードの進捗");
    });
  });

  // ============================================================
  // ステップ遷移
  // ============================================================
  describe("ステップ遷移", () => {
    it("説明入力後「次へ」クリックで Step 2（設定）に遷移する", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      expect(screen.getByText("タスク生成")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
    });

    it("Step 2 で「戻る」クリックで Step 1 に戻る", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> Step 1
      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByText("スキルの説明")).toBeInTheDocument();
    });

    it("Step 2 で「スキルを生成」クリックで IPC が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it("IPC 成功後に Step 4（完了）に遷移する", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成 -> 完了
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      await act(async () => {
        await mockCreate.mock.results[0]?.value;
      });

      expect(screen.getByText("スキルが作成されました")).toBeInTheDocument();
    });

    it("CompleteStep に生成されたパスが表示される", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成 -> 完了
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      await act(async () => {
        await mockCreate.mock.results[0]?.value;
      });

      expect(screen.getByText("/path/to/new-skill")).toBeInTheDocument();
    });
  });

  // ============================================================
  // IPC 呼び出し
  // ============================================================
  describe("IPC 呼び出し", () => {
    it("skill.create が description と options を正しく渡して呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル説明" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreate).toHaveBeenCalledWith({
        description: "テストスキル説明",
        options: {
          generateTasks: true,
          addAgents: false,
          addReferences: false,
        },
      });
    });

    it("IPC 失敗時にエラーメッセージが表示される", async () => {
      mockCreate.mockRejectedValue(new Error("生成失敗"));

      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成（失敗）
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      await act(async () => {
        try {
          await mockCreate.mock.results[0]?.value;
        } catch {
          // 期待されるエラー
        }
      });

      expect(screen.getByText("生成失敗")).toBeInTheDocument();
    });

    it("IPC 失敗時に Error 以外のオブジェクトでもフォールバックメッセージが表示される", async () => {
      mockCreate.mockRejectedValue("unknown error");

      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成（失敗）
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      await act(async () => {
        try {
          await mockCreate.mock.results[0]?.value;
        } catch {
          // 期待されるエラー
        }
      });

      expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
    });
  });

  // ============================================================
  // モーダル制御
  // ============================================================
  describe("モーダル制御", () => {
    it("Step 4 で「閉じる」クリックで onClose が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テストスキル" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> 生成 -> 完了
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      await act(async () => {
        await mockCreate.mock.results[0]?.value;
      });

      // Step 4: 閉じる
      fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // バリデーション
  // ============================================================
  describe("バリデーション", () => {
    it("説明が空のとき「次へ」ボタンが disabled", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      const button = screen.getByRole("button", { name: "次へ" });
      expect(button).toBeDisabled();
    });

    it("説明を入力すると「次へ」ボタンが enabled になる", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "入力テスト" },
      });

      const button = screen.getByRole("button", { name: "次へ" });
      expect(button).toBeEnabled();
    });

    it("スペースのみの入力では「次へ」ボタンが disabled のまま", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "   " },
      });

      const button = screen.getByRole("button", { name: "次へ" });
      expect(button).toBeDisabled();
    });
  });

  // ============================================================
  // Step 1 に戻った際の状態保持
  // ============================================================
  describe("状態保持", () => {
    it("Step 2 から Step 1 に戻った際に入力した説明が保持される", () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1: 説明入力
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "保持テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // Step 2 -> Step 1
      fireEvent.click(screen.getByRole("button", { name: "戻る" }));

      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("保持テスト");
    });
  });

  // ============================================================
  // Phase 6: オプション設定フロー
  // ============================================================
  describe("オプション設定フロー", () => {
    it("Step 2 でオプションを変更して生成すると正しいオプションが IPC に渡される", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // generateTasks のチェックを解除
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[0]); // generateTasks: true -> false

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreate).toHaveBeenCalledWith({
        description: "テスト",
        options: {
          generateTasks: false,
          addAgents: false,
          addReferences: false,
        },
      });
    });

    it("全オプション ON で生成しても IPC が呼ばれる", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      // addAgents, addReferences をチェック
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]); // addAgents ON
      fireEvent.click(checkboxes[2]); // addReferences ON

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // Phase 6: IPC パラメータ詳細検証
  // ============================================================
  describe("IPC パラメータ詳細検証", () => {
    it("skill.create が1回だけ呼ばれる（重複呼び出しなし）", async () => {
      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it("IPC 完了後に生成されたカスタムパスが CompleteStep に渡される", async () => {
      mockCreate.mockResolvedValue({ path: "/custom/generated/path" });

      render(<SkillCreateWizard onClose={mockOnClose} />);

      // Step 1 -> Step 2 -> 生成 -> 完了
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "テスト" },
      });
      fireEvent.click(screen.getByRole("button", { name: "次へ" }));

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
      });
      await act(async () => {
        await mockCreate.mock.results[0]?.value;
      });

      expect(screen.getByText("/custom/generated/path")).toBeInTheDocument();
    });
  });
});
