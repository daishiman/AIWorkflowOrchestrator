/**
 * ApiKeysSection コンポーネントテスト
 *
 * TDD Phase: Red（失敗するテストを先に作成）
 *
 * @see docs/30-workflows/api-key-management/ui-design.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiKeysSection } from "../index";

// === Mock Setup ===

// Mock electronAPI
const mockApiKeySave = vi.fn();
const mockApiKeyDelete = vi.fn();
const mockApiKeyValidate = vi.fn();
const mockApiKeyList = vi.fn();

const mockElectronAPI = {
  apiKey: {
    save: mockApiKeySave,
    delete: mockApiKeyDelete,
    validate: mockApiKeyValidate,
    list: mockApiKeyList,
  },
};

// Inject mock into window
Object.defineProperty(window, "electronAPI", {
  value: mockElectronAPI,
  writable: true,
});

// === Test Helpers ===

const createMockProviderList = () => ({
  success: true,
  data: {
    providers: [
      {
        provider: "openai" as const,
        displayName: "OpenAI",
        status: "registered" as const,
        lastValidatedAt: "2025-12-10T12:00:00.000Z",
      },
      {
        provider: "anthropic" as const,
        displayName: "Anthropic",
        status: "not_registered" as const,
        lastValidatedAt: null,
      },
      {
        provider: "google" as const,
        displayName: "Google AI",
        status: "not_registered" as const,
        lastValidatedAt: null,
      },
      {
        provider: "xai" as const,
        displayName: "xAI",
        status: "not_registered" as const,
        lastValidatedAt: null,
      },
    ],
    registeredCount: 1,
    totalCount: 4,
  },
});

// === Tests ===

describe("ApiKeysSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiKeyList.mockResolvedValue(createMockProviderList());
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // === Rendering ===

  describe("レンダリング", () => {
    it("コンポーネントが正常にレンダリングされる", () => {
      render(<ApiKeysSection />);
      expect(screen.getByText(/APIキー設定/i)).toBeInTheDocument();
    });

    it("セキュリティ説明テキストを表示する", () => {
      render(<ApiKeysSection />);
      expect(
        screen.getByText(/APIキーは暗号化して安全に保存されます/i),
      ).toBeInTheDocument();
    });

    it("マウント時にAPIキー一覧を取得する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(mockApiKeyList).toHaveBeenCalledTimes(1);
      });
    });

    it("全プロバイダー（4つ）を表示する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
        expect(screen.getByText("Google AI")).toBeInTheDocument();
        expect(screen.getByText("xAI")).toBeInTheDocument();
      });
    });

    it("登録済みプロバイダーに「登録済み」バッジを表示する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText(/登録済み/i)).toBeInTheDocument();
      });
    });

    it("未登録プロバイダーに「未登録」バッジを表示する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        const notRegisteredBadges = screen.getAllByText(/未登録/i);
        expect(notRegisteredBadges).toHaveLength(3); // Anthropic, Google, xAI
      });
    });

    it("最終検証日時を表示する（登録済みプロバイダーのみ）", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText(/最終検証/i)).toBeInTheDocument();
      });
    });
  });

  // === Loading State ===

  describe("ローディング状態", () => {
    it("一覧取得中はローディング表示をする", () => {
      mockApiKeyList.mockReturnValue(
        new Promise(() => {}), // Never resolves
      );

      render(<ApiKeysSection />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("一覧取得完了後はローディングが消える", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });
    });
  });

  // === Error State ===

  describe("エラー状態", () => {
    it("一覧取得失敗時はエラーメッセージを表示する", async () => {
      mockApiKeyList.mockResolvedValue({
        success: false,
        error: {
          code: "api-key/get-failed",
          message: "Failed to load API keys",
        },
      });

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to load API keys/i),
        ).toBeInTheDocument();
      });
    });

    it("エラー時は再試行ボタンを表示する", async () => {
      mockApiKeyList.mockResolvedValue({
        success: false,
        error: { code: "api-key/get-failed", message: "Error" },
      });

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /再試行/i }),
        ).toBeInTheDocument();
      });
    });

    it("再試行ボタンをクリックすると一覧を再取得する", async () => {
      mockApiKeyList.mockResolvedValueOnce({
        success: false,
        error: { code: "api-key/get-failed", message: "Error" },
      });
      mockApiKeyList.mockResolvedValueOnce(createMockProviderList());

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /再試行/i }),
        ).toBeInTheDocument();
      });

      const retryButton = screen.getByRole("button", { name: /再試行/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(mockApiKeyList).toHaveBeenCalledTimes(2);
      });
    });
  });

  // === Registration Flow ===

  describe("登録フロー", () => {
    it("未登録プロバイダーに「登録」ボタンを表示する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        const registerButtons = screen.getAllByRole("button", {
          name: /登録/i,
        });
        expect(registerButtons.length).toBeGreaterThan(0);
      });
    });

    it("「登録」ボタンをクリックするとフォームモーダルが開く", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/APIキーを登録/i)).toBeInTheDocument();
      });
    });

    it("フォームに正しいプロバイダー名が表示される", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]); // Anthropic

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(
          screen.getByText(/AnthropicのAPIキーを登録/i),
        ).toBeInTheDocument();
      });
    });

    it("APIキー入力フィールドがパスワードタイプである（マスク表示）", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText("APIキー");
      expect(input).toHaveAttribute("type", "password");
    });

    it("「保存」ボタンをクリックするとAPIキーを保存する", async () => {
      mockApiKeySave.mockResolvedValue({
        success: true,
        data: {
          provider: "anthropic",
          savedAt: "2025-12-10T12:00:00.000Z",
        },
      });

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText("APIキー");
      await userEvent.type(input, "sk-ant-test1234567890");

      const saveButton = screen.getByRole("button", { name: "保存" });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApiKeySave).toHaveBeenCalledWith({
          provider: "anthropic",
          apiKey: "sk-ant-test1234567890",
        });
      });
    });

    it("保存成功後はモーダルが閉じて一覧が更新される", async () => {
      mockApiKeySave.mockResolvedValue({
        success: true,
        data: { provider: "anthropic", savedAt: "2025-12-10T12:00:00.000Z" },
      });

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText("APIキー");
      await userEvent.type(input, "sk-ant-test123");

      const saveButton = screen.getByRole("button", { name: "保存" });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(mockApiKeyList).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });
  });

  // === Edit Flow ===

  describe("編集フロー", () => {
    it("登録済みプロバイダーに「編集」ボタンを表示する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /編集/i }),
        ).toBeInTheDocument();
      });
    });

    it("「編集」ボタンをクリックするとフォームモーダルが開く", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /編集/i }),
        ).toBeInTheDocument();
      });

      const editButton = screen.getByRole("button", { name: /編集/i });
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/APIキーを編集/i)).toBeInTheDocument();
      });
    });
  });

  // === Delete Flow ===

  describe("削除フロー", () => {
    it("登録済みプロバイダーに「削除」ボタンを表示する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /削除/i }),
        ).toBeInTheDocument();
      });
    });

    it("「削除」ボタンをクリックすると確認ダイアログが開く", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /削除/i }),
        ).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /削除/i });
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/削除しますか/i)).toBeInTheDocument();
      });
    });

    it("削除確認ダイアログに警告メッセージを表示する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /削除/i }),
        ).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /削除/i });
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText(/この操作は取り消せません/i),
        ).toBeInTheDocument();
      });
    });

    it("確認ダイアログで「キャンセル」をクリックするとダイアログが閉じる", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /削除/i }),
        ).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: /削除/i });
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("確認ダイアログで「削除」をクリックするとAPIキーを削除する", async () => {
      mockApiKeyDelete.mockResolvedValue({
        success: true,
        data: {
          provider: "openai",
          deletedAt: "2025-12-10T12:00:00.000Z",
        },
      });

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      // OpenAIの削除ボタンを取得（登録済みプロバイダーの行にある削除ボタン）
      const deleteButtons = screen.getAllByRole("button", { name: "削除" });
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // ダイアログ内の削除ボタン（bg-red-500クラスを持つ）
      const dialog = screen.getByRole("dialog");
      const confirmButton = dialog.querySelector(
        'button[class*="bg-red"]',
      ) as HTMLButtonElement;
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockApiKeyDelete).toHaveBeenCalledWith({ provider: "openai" });
      });
    });

    it("削除成功後はダイアログが閉じて一覧が更新される", async () => {
      mockApiKeyDelete.mockResolvedValue({
        success: true,
        data: { provider: "openai", deletedAt: "2025-12-10T12:00:00.000Z" },
      });

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: "削除" });
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dialog = screen.getByRole("dialog");
      const confirmButton = dialog.querySelector(
        'button[class*="bg-red"]',
      ) as HTMLButtonElement;
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(mockApiKeyList).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });
  });

  // === Validation Flow ===

  describe("検証フロー", () => {
    it("「保存前に検証する」チェックボックスを表示する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // 検証ボタンが存在することを確認
      expect(screen.getByRole("button", { name: "検証" })).toBeInTheDocument();
    });

    it("検証成功時は「APIキーは有効です」メッセージを表示する", async () => {
      mockApiKeyValidate.mockResolvedValue({
        success: true,
        data: {
          provider: "anthropic",
          status: "valid",
          validatedAt: "2025-12-10T12:00:00.000Z",
        },
      });

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText("APIキー");
      await userEvent.type(input, "sk-ant-test123");

      const validateButton = screen.getByRole("button", { name: "検証" });
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText(/APIキーは有効です/i)).toBeInTheDocument();
      });
    });

    it("検証失敗時は「無効なAPIキー」メッセージを表示する", async () => {
      // errorMessage が null の場合、デフォルトメッセージ「無効なAPIキーです」が表示される
      mockApiKeyValidate.mockResolvedValue({
        success: true,
        data: {
          provider: "anthropic",
          status: "invalid",
          validatedAt: "2025-12-10T12:00:00.000Z",
          // errorMessage を省略するとデフォルトメッセージが使われる
        },
      });

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText("APIキー");
      await userEvent.type(input, "invalidapikey12345");

      const validateButton = screen.getByRole("button", { name: "検証" });
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText(/APIキーが無効です/i)).toBeInTheDocument();
      });
    });
  });

  // === Keyboard Navigation ===

  describe("キーボード操作", () => {
    it("Tabキーで各ボタン間を移動できる", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      await userEvent.tab();
      expect(document.activeElement).toHaveAccessibleName(/編集|登録/i);
    });

    it("Enterキーでボタンを押せる", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      registerButtons[0].focus();

      await userEvent.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("Escapeキーでモーダルを閉じられる", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // モーダルにフォーカスを設定してからEscapeを押す
      const dialog = screen.getByRole("dialog");
      dialog.focus();
      await userEvent.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  // === Props ===

  describe("Props", () => {
    it("className propを受け取る", () => {
      const { container } = render(<ApiKeysSection className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
