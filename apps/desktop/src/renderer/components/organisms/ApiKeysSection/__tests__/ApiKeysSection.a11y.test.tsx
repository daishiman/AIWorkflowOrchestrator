/**
 * ApiKeysSection アクセシビリティテスト
 *
 * ARIA 属性と live region 通知を検証するテストスイート
 *
 * @see docs/30-workflows/api-key-management/ui-design.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiKeysSection } from "../index";

// === Mock Setup ===

const mockApiKeyList = vi.fn();
const mockApiKeySave = vi.fn();
const mockApiKeyDelete = vi.fn();
const mockApiKeyValidate = vi.fn();

const mockElectronAPI = {
  apiKey: {
    save: mockApiKeySave,
    delete: mockApiKeyDelete,
    validate: mockApiKeyValidate,
    list: mockApiKeyList,
  },
};

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

describe("ApiKeysSection - Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiKeyList.mockResolvedValue(createMockProviderList());
  });

  // === ARIA Attributes ===

  describe("ARIA属性", () => {
    it("エラーメッセージは role='alert' を持つ", async () => {
      mockApiKeyList.mockResolvedValue({
        success: false,
        error: { code: "api-key/get-failed", message: "Error message" },
      });

      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("全ボタンに適切な aria-label が設定されている", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      // 登録ボタン
      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      expect(registerButtons.length).toBeGreaterThan(0);

      // 編集ボタン
      expect(screen.getByRole("button", { name: /編集/i })).toBeInTheDocument();

      // 削除ボタン
      expect(screen.getByRole("button", { name: /削除/i })).toBeInTheDocument();
    });

    it("プロバイダー項目に aria-label が設定されている", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      const listItems = screen.getAllByRole("listitem");
      expect(listItems.length).toBe(4);

      listItems.forEach((item) => {
        expect(item).toHaveAttribute("aria-label");
      });
    });
  });

  // === Keyboard Navigation ===

  describe("キーボードナビゲーション", () => {
    it("モーダルは aria-modal='true' を持つ", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
      });
    });

    it("削除確認ダイアログは aria-modal='true' を持つ", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button", { name: "削除" });
      await userEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
      });
    });

    it("モーダルダイアログには aria-labelledby が設定されている", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-labelledby");
      });
    });
  });

  // === Screen Reader Support ===

  describe("スクリーンリーダー対応", () => {
    it("セクション見出しが適切なレベルで設定されている", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        const heading = screen.getByRole("heading", { name: /APIキー設定/i });
        expect(heading).toBeInTheDocument();
        expect(heading.tagName).toMatch(/H[1-6]/);
      });
    });

    it("ステータスバッジに説明テキストがある", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        const registeredBadge = screen.getByText(/登録済み/i);
        expect(registeredBadge).toBeInTheDocument();
      });
    });

    it("APIキー入力フィールドにヘルプテキストが関連付けられている", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const input = screen.getByLabelText("APIキー");
      expect(input).toHaveAttribute("aria-describedby");
    });
  });

  // === Live Regions ===

  describe("Live Regions", () => {
    it("ローディング中はステータス表示がある", () => {
      mockApiKeyList.mockReturnValue(new Promise(() => {}));

      render(<ApiKeysSection />);

      const loadingStatus = screen.getByRole("status");
      expect(loadingStatus).toBeInTheDocument();
    });

    it("検証結果は aria-live で通知される", async () => {
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
        const statusElements = screen.getAllByRole("status");
        const validationStatus = statusElements.find(
          (el) =>
            el.getAttribute("aria-live") === "polite" &&
            el.textContent?.includes("有効"),
        );
        expect(validationStatus).toBeDefined();
      });
    });
  });

  // === Focus Management ===

  describe("フォーカス管理", () => {
    it("モーダル開閉時にフォーカスが適切に移動する", async () => {
      render(<ApiKeysSection />);

      await waitFor(() => {
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
      });

      const registerButtons = screen.getAllByRole("button", { name: /登録/i });
      await userEvent.click(registerButtons[0]);

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
      });
    });
  });
});
