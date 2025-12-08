import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsView } from "./index";

// Mock useTheme hook
const mockSetTheme = vi.fn();
vi.mock("../../hooks/useTheme", () => ({
  useTheme: () => ({
    themeMode: "system" as const,
    resolvedTheme: "dark" as const,
    setTheme: mockSetTheme,
    isDark: true,
  }),
}));

// Mock store state - flat structure matching actual store
const createMockState = (overrides = {}) => ({
  // SettingsSlice
  apiKey: "sk-test-key",
  autoSyncEnabled: true,
  userProfile: {
    name: "Test User",
    email: "test@example.com",
    avatar: "",
    plan: "free" as const,
  },
  setApiKey: vi.fn(),
  setAutoSyncEnabled: vi.fn(),
  setUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  ...overrides,
});

vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
}));

describe("SettingsView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  describe("レンダリング", () => {
    it("設定ビューをレンダリングする", () => {
      render(<SettingsView />);
      expect(screen.getByTestId("settings-view")).toBeInTheDocument();
    });

    it("ヘッダーを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("設定")).toBeInTheDocument();
      expect(
        screen.getByText("Knowledge Studioの設定を管理します"),
      ).toBeInTheDocument();
    });

    it("h1見出しを含む", () => {
      render(<SettingsView />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("設定");
    });
  });

  describe("API設定", () => {
    it("API設定セクションを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("API設定")).toBeInTheDocument();
    });

    it("APIキー入力フィールドを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("APIキー")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("sk-...")).toBeInTheDocument();
    });

    it("APIキー変更でsetApiKeyを呼び出す", async () => {
      const mockSetApiKey = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ setApiKey: mockSetApiKey }))) as never);

      render(<SettingsView />);
      const input = screen.getByPlaceholderText("sk-...");
      fireEvent.change(input, { target: { value: "sk-new-key" } });
      expect(mockSetApiKey).toHaveBeenCalledWith("sk-new-key");
    });
  });

  describe("RAG設定", () => {
    it("RAG設定セクションを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("RAG設定")).toBeInTheDocument();
    });

    it("RAGチェックボックスを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("RAGを有効にする")).toBeInTheDocument();
    });

    it("自動同期チェックボックスを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("自動同期を有効にする")).toBeInTheDocument();
    });

    it("自動同期トグルでsetAutoSyncEnabledを呼び出す", async () => {
      const mockSetAutoSyncEnabled = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ setAutoSyncEnabled: mockSetAutoSyncEnabled }),
        )) as never);

      render(<SettingsView />);
      const checkbox = screen.getByRole("checkbox", {
        name: /自動同期を有効にする/,
      });
      fireEvent.click(checkbox);
      expect(mockSetAutoSyncEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe("外観設定", () => {
    it("外観設定セクションを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("外観設定")).toBeInTheDocument();
    });

    it("テーマボタンを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("ライト")).toBeInTheDocument();
      expect(screen.getByText("ダーク")).toBeInTheDocument();
      expect(screen.getByText("システム")).toBeInTheDocument();
    });
  });

  describe("保存ボタン", () => {
    it("保存ボタンを表示する", () => {
      render(<SettingsView />);
      expect(
        screen.getByRole("button", { name: "設定を保存" }),
      ).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("API設定セクションにaria-labelledbyを持つ", () => {
      render(<SettingsView />);
      const section = screen.getByRole("region", { name: /API設定/ });
      expect(section).toBeInTheDocument();
    });

    it("RAG設定セクションにaria-labelledbyを持つ", () => {
      render(<SettingsView />);
      const section = screen.getByRole("region", { name: /RAG設定/ });
      expect(section).toBeInTheDocument();
    });

    it("外観設定セクションにaria-labelledbyを持つ", () => {
      render(<SettingsView />);
      const section = screen.getByRole("region", { name: /外観設定/ });
      expect(section).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<SettingsView className="custom-class" />);
      expect(screen.getByTestId("settings-view")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(SettingsView.displayName).toBe("SettingsView");
    });
  });
});
