import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { AuthKeySection } from "./index";

// --- mock: store ---
const mockAuthModeStatusValue: {
  hasCredentials: boolean;
  isValid: boolean;
  mode: string;
  message: string;
  lastCheckedAt: number;
} | null = {
  hasCredentials: false,
  isValid: false,
  mode: "api-key",
  message: "",
  lastCheckedAt: Date.now(),
};

vi.mock("../../../store", () => ({
  useAuthModeStatus: vi.fn(() => mockAuthModeStatusValue),
}));

// --- mock: window.electronAPI.authKey ---
const mockAuthKeyApi = {
  set: vi.fn(),
  exists: vi.fn(),
  validate: vi.fn(),
  delete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();

  mockAuthKeyApi.set.mockResolvedValue({ success: true });
  mockAuthKeyApi.exists.mockResolvedValue({ exists: false });
  mockAuthKeyApi.validate.mockResolvedValue({ valid: true });
  mockAuthKeyApi.delete.mockResolvedValue({ success: true });

  // Reset mockAuthModeStatusValue
  if (mockAuthModeStatusValue) {
    mockAuthModeStatusValue.hasCredentials = false;
    mockAuthModeStatusValue.isValid = false;
  }

  Object.defineProperty(window, "electronAPI", {
    value: { authKey: mockAuthKeyApi },
    writable: true,
    configurable: true,
  });
});

describe("AuthKeySection", () => {
  describe("レンダリング", () => {
    it("api-key モードで正しくレンダリングされる", async () => {
      await act(async () => {
        render(<AuthKeySection />);
      });

      expect(screen.getByTestId("auth-key-section")).toBeInTheDocument();
      expect(screen.getByText("APIキーの状態:")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Anthropic APIキー入力"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("save-auth-key-button")).toBeInTheDocument();
    });
  });

  describe("ステータスバッジ", () => {
    it("保存済み状態で緑バッジが表示される", async () => {
      if (mockAuthModeStatusValue) {
        mockAuthModeStatusValue.hasCredentials = true;
      }
      mockAuthKeyApi.exists.mockResolvedValue({ exists: true });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const badge = screen.getByTestId("auth-key-status-badge");
      expect(badge).toHaveTextContent("保存済み");
      expect(badge).toHaveAttribute("data-status", "saved");
    });

    it("環境変数fallback状態で黄バッジが表示される", async () => {
      if (mockAuthModeStatusValue) {
        mockAuthModeStatusValue.hasCredentials = false;
      }
      mockAuthKeyApi.exists.mockResolvedValue({ exists: true });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const badge = screen.getByTestId("auth-key-status-badge");
      expect(badge).toHaveTextContent("環境変数で設定済み");
      expect(badge).toHaveAttribute("data-status", "env-fallback");
    });

    it("未設定状態で赤バッジが表示される", async () => {
      if (mockAuthModeStatusValue) {
        mockAuthModeStatusValue.hasCredentials = false;
      }
      mockAuthKeyApi.exists.mockResolvedValue({ exists: false });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const badge = screen.getByTestId("auth-key-status-badge");
      expect(badge).toHaveTextContent("未設定");
      expect(badge).toHaveAttribute("data-status", "not-set");
    });

    it("確認失敗状態で灰バッジが表示される", async () => {
      mockAuthKeyApi.exists.mockRejectedValue(new Error("IPC error"));

      await act(async () => {
        render(<AuthKeySection />);
      });

      const badge = screen.getByTestId("auth-key-status-badge");
      expect(badge).toHaveTextContent("確認失敗");
      expect(badge).toHaveAttribute("data-status", "check-failed");
    });
  });

  describe("APIキー保存フロー", () => {
    it("APIキー入力・保存フローが動作する", async () => {
      mockAuthKeyApi.set.mockResolvedValue({ success: true });
      mockAuthKeyApi.exists.mockResolvedValue({ exists: false });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const input = screen.getByLabelText("Anthropic APIキー入力");
      const saveButton = screen.getByTestId("save-auth-key-button");

      // 入力
      await act(async () => {
        fireEvent.change(input, { target: { value: "sk-ant-test-key-123" } });
      });

      // 保存
      await act(async () => {
        fireEvent.click(saveButton);
      });

      expect(mockAuthKeyApi.set).toHaveBeenCalledWith("sk-ant-test-key-123");
      expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
        "APIキーを保存しました",
      );
      // 入力値がクリアされている
      expect(input).toHaveValue("");
    });

    it("空のキーを保存しようとした場合にバリデーションエラーが表示される", async () => {
      await act(async () => {
        render(<AuthKeySection />);
      });

      const input = screen.getByLabelText("Anthropic APIキー入力");

      // スペースのみ入力（P42対策: .trim() バリデーション）
      await act(async () => {
        fireEvent.change(input, { target: { value: "   " } });
      });

      // 保存ボタンはdisabledになる（trim後空文字列）
      const saveButton = screen.getByTestId("save-auth-key-button");
      expect(saveButton).toBeDisabled();

      // 空文字列の場合
      await act(async () => {
        fireEvent.change(input, { target: { value: "" } });
      });
      expect(saveButton).toBeDisabled();

      expect(mockAuthKeyApi.set).not.toHaveBeenCalled();
    });

    it("保存失敗時にエラーメッセージが表示される", async () => {
      mockAuthKeyApi.set.mockResolvedValue({
        success: false,
        error: "Invalid API key format",
      });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const input = screen.getByLabelText("Anthropic APIキー入力");
      await act(async () => {
        fireEvent.change(input, { target: { value: "invalid-key" } });
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("save-auth-key-button"));
      });

      expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
        "Invalid API key format",
      );
    });
  });

  describe("APIキー削除フロー", () => {
    it("APIキー削除フローが動作する", async () => {
      if (mockAuthModeStatusValue) {
        mockAuthModeStatusValue.hasCredentials = true;
      }
      mockAuthKeyApi.exists.mockResolvedValue({ exists: true });
      mockAuthKeyApi.delete.mockResolvedValue({ success: true });

      await act(async () => {
        render(<AuthKeySection />);
      });

      // saved 状態なので削除ボタンが表示される
      const deleteButton = screen.getByTestId("delete-auth-key-button");
      expect(deleteButton).toBeInTheDocument();

      // 削除後のexistsはfalseを返す
      mockAuthKeyApi.exists.mockResolvedValue({ exists: false });
      if (mockAuthModeStatusValue) {
        mockAuthModeStatusValue.hasCredentials = false;
      }

      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(mockAuthKeyApi.delete).toHaveBeenCalled();
      expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
        "APIキーを削除しました",
      );
    });
  });

  describe("パスワードマスクトグル", () => {
    it("パスワードマスクトグルが動作する", async () => {
      await act(async () => {
        render(<AuthKeySection />);
      });

      const input = screen.getByLabelText("Anthropic APIキー入力");
      const toggleButton = screen.getByTestId("toggle-password-visibility");

      // 初期状態: password
      expect(input).toHaveAttribute("type", "password");

      // トグル: text
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      expect(input).toHaveAttribute("type", "text");

      // トグル: password
      await act(async () => {
        fireEvent.click(toggleButton);
      });
      expect(input).toHaveAttribute("type", "password");
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-label が適切に設定されている", async () => {
      await act(async () => {
        render(<AuthKeySection />);
      });

      // group role
      const section = screen.getByRole("group", { name: "APIキー管理" });
      expect(section).toBeInTheDocument();

      // input aria-label
      expect(
        screen.getByLabelText("Anthropic APIキー入力"),
      ).toBeInTheDocument();

      // toggle button aria-label
      expect(screen.getByLabelText("パスワードを表示")).toBeInTheDocument();

      // description
      expect(
        screen.getByText("APIキーはセキュアストレージに暗号化して保存されます"),
      ).toBeInTheDocument();
    });

    it("aria-describedby が入力フィールドに設定されている", async () => {
      await act(async () => {
        render(<AuthKeySection />);
      });

      const input = screen.getByLabelText("Anthropic APIキー入力");
      expect(input).toHaveAttribute("aria-describedby", "auth-key-description");
    });
  });

  describe("エッジケース", () => {
    it("authKey API が存在しない場合に check-failed になる", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: {},
        writable: true,
        configurable: true,
      });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const badge = screen.getByTestId("auth-key-status-badge");
      expect(badge).toHaveAttribute("data-status", "check-failed");
    });
  });
});
