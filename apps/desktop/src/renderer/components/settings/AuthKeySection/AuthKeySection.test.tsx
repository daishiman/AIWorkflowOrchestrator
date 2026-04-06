/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
  waitFor,
} from "@testing-library/react";
import * as hookModule from "../../../hooks/useAuthKeyManagement";
import { AuthKeySection } from "./index";

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
  mockAuthKeyApi.exists.mockResolvedValue({ exists: false, source: "not-set" });
  mockAuthKeyApi.validate.mockResolvedValue({ valid: true });
  mockAuthKeyApi.delete.mockResolvedValue({ success: true });

  Object.defineProperty(window, "electronAPI", {
    value: { authKey: mockAuthKeyApi },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
});

describe("AuthKeySection", () => {
  describe("レンダリング", () => {
    it("正しくレンダリングされる", async () => {
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
      mockAuthKeyApi.exists.mockResolvedValue({
        exists: true,
        source: "saved",
      });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const badge = screen.getByTestId("auth-key-status-badge");
      expect(badge).toHaveTextContent("保存済み");
      expect(badge).toHaveAttribute("data-status", "saved");
    });

    it("環境変数fallback状態で黄バッジが表示される", async () => {
      mockAuthKeyApi.exists.mockResolvedValue({
        exists: true,
        source: "env-fallback",
      });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const badge = screen.getByTestId("auth-key-status-badge");
      expect(badge).toHaveTextContent("環境変数で設定済み");
      expect(badge).toHaveAttribute("data-status", "env-fallback");
    });

    it("未設定状態で赤バッジが表示される", async () => {
      mockAuthKeyApi.exists.mockResolvedValue({
        exists: false,
      });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const badge = screen.getByTestId("auth-key-status-badge");
      expect(badge).toHaveTextContent("未設定");
      expect(badge).toHaveAttribute("data-status", "not_set");
    });

    it("確認失敗状態で灰バッジが表示される", async () => {
      mockAuthKeyApi.exists.mockRejectedValue(new Error("IPC error"));

      await act(async () => {
        render(<AuthKeySection />);
      });

      const badge = screen.getByTestId("auth-key-status-badge");
      expect(badge).toHaveTextContent("確認失敗");
      expect(badge).toHaveAttribute("data-status", "check-failed");

      await waitFor(() => {
        expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
          "ステータスの確認に失敗しました",
        );
      });
    });
  });

  describe("APIキー保存フロー", () => {
    it("APIキー入力・保存フローが動作する", async () => {
      mockAuthKeyApi.set.mockResolvedValue({ success: true });
      mockAuthKeyApi.exists.mockResolvedValue({
        exists: false,
      });

      await act(async () => {
        render(<AuthKeySection />);
      });

      const input = screen.getByLabelText("Anthropic APIキー入力");
      const saveButton = screen.getByTestId("save-auth-key-button");

      await act(async () => {
        fireEvent.change(input, {
          target: { value: "sk-ant-test-key-123" },
        });
      });

      await act(async () => {
        fireEvent.click(saveButton);
      });

      expect(mockAuthKeyApi.set).toHaveBeenCalledWith("sk-ant-test-key-123");
      await waitFor(() => {
        expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
          "APIキーを保存しました",
        );
      });
      expect(input).toHaveValue("");
    });

    it("空のキーを保存しようとした場合に保存ボタンが disabled になる", async () => {
      await act(async () => {
        render(<AuthKeySection />);
      });

      const input = screen.getByLabelText("Anthropic APIキー入力");

      await act(async () => {
        fireEvent.change(input, { target: { value: "   " } });
      });

      const saveButton = screen.getByTestId("save-auth-key-button");
      expect(saveButton).toBeDisabled();

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
        fireEvent.change(input, { target: { value: "sk-invalid-key" } });
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("save-auth-key-button"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
          "Invalid API key format",
        );
      });
    });

    it("バリデーション失敗時にエラーメッセージが表示される", async () => {
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

      await waitFor(() => {
        expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
          "APIキーの形式が正しくありません",
        );
      });
      expect(mockAuthKeyApi.set).not.toHaveBeenCalled();
    });
  });

  describe("APIキー削除フロー", () => {
    it("APIキー削除フローが動作する", async () => {
      mockAuthKeyApi.exists
        .mockResolvedValueOnce({ exists: true, source: "saved" })
        .mockResolvedValueOnce({ exists: false });
      mockAuthKeyApi.delete.mockResolvedValue({ success: true });

      await act(async () => {
        render(<AuthKeySection />);
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("delete-auth-key-button"),
        ).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId("delete-auth-key-button");

      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(mockAuthKeyApi.delete).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
          "APIキーを削除しました",
        );
      });
    });

    it("削除後の再確認失敗時にエラーメッセージが表示される", async () => {
      mockAuthKeyApi.exists
        .mockResolvedValueOnce({ exists: true, source: "saved" })
        .mockRejectedValueOnce(new Error("refresh failed"));
      mockAuthKeyApi.delete.mockResolvedValue({ success: true });

      await act(async () => {
        render(<AuthKeySection />);
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("delete-auth-key-button"),
        ).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId("delete-auth-key-button"));
      });

      await waitFor(() => {
        expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
          "ステータスの再確認に失敗しました",
        );
      });
    });
  });

  describe("パスワードマスクトグル", () => {
    it("パスワードマスクトグルが動作する", async () => {
      await act(async () => {
        render(<AuthKeySection />);
      });

      const input = screen.getByLabelText("Anthropic APIキー入力");
      const toggleButton = screen.getByTestId("toggle-password-visibility");

      expect(input).toHaveAttribute("type", "password");

      await act(async () => {
        fireEvent.click(toggleButton);
      });
      expect(input).toHaveAttribute("type", "text");

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

      const section = screen.getByRole("group", { name: "APIキー管理" });
      expect(section).toBeInTheDocument();

      expect(
        screen.getByLabelText("Anthropic APIキー入力"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("パスワードを表示")).toBeInTheDocument();
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

      await waitFor(() => {
        expect(screen.getByTestId("auth-key-status-message")).toHaveTextContent(
          "ステータスの確認に失敗しました",
        );
      });
    });
  });

  // ============================================================
  // TC-06〜TC-10: フック統合・props 検証テスト
  // ============================================================

  describe("TC-06: onStatusChange props 受け取りテスト", () => {
    it("should accept onStatusChange prop without error", async () => {
      await act(async () => {
        render(<AuthKeySection onStatusChange={vi.fn()} />);
      });

      expect(screen.getByTestId("auth-key-section")).toBeInTheDocument();
    });
  });

  describe("TC-07: フック使用テスト", () => {
    it("should use useAuthKeyManagement hook for state management", async () => {
      const spy = vi.spyOn(hookModule, "useAuthKeyManagement");

      await act(async () => {
        render(<AuthKeySection />);
      });

      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });
  });

  describe("TC-08: パスワード表示切替ボタンの存在確認", () => {
    it("should render password toggle button", async () => {
      await act(async () => {
        render(<AuthKeySection />);
      });

      expect(
        screen.getByTestId("toggle-password-visibility"),
      ).toBeInTheDocument();
    });
  });

  describe("TC-10: configured 状態での削除ボタン表示", () => {
    it("should show delete button when status is configured with keySource=saved", async () => {
      mockAuthKeyApi.exists.mockResolvedValue({
        exists: true,
        source: "saved",
      });

      await act(async () => {
        render(<AuthKeySection />);
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("delete-auth-key-button"),
        ).toBeInTheDocument();
      });
    });
  });
});
