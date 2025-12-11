import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsView } from "./index";

// Mock AccountSection to avoid complex auth state dependencies
vi.mock("../../components/organisms/AccountSection", () => ({
  AccountSection: () => (
    <div data-testid="account-section">AccountSection Mock</div>
  ),
}));

// Mock ApiKeysSection to avoid complex IPC dependencies
vi.mock("../../components/organisms/ApiKeysSection", () => ({
  ApiKeysSection: () => (
    <div data-testid="api-keys-section" id="api-keys-settings-heading">
      <h3>APIキー設定</h3>
      <div>OpenAI</div>
      <div>Anthropic</div>
      <div>Google AI</div>
      <div>xAI</div>
    </div>
  ),
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

  describe("APIキー設定", () => {
    it("APIキー設定セクションを表示する", () => {
      render(<SettingsView />);
      // ApiKeysSectionコンポーネントが表示される
      expect(screen.getByText("APIキー設定")).toBeInTheDocument();
    });

    it("4つのプロバイダーを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("OpenAI")).toBeInTheDocument();
      expect(screen.getByText("Anthropic")).toBeInTheDocument();
      expect(screen.getByText("Google AI")).toBeInTheDocument();
      expect(screen.getByText("xAI")).toBeInTheDocument();
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

  describe("保存ボタン", () => {
    it("保存ボタンを表示する", () => {
      render(<SettingsView />);
      expect(
        screen.getByRole("button", { name: "設定を保存" }),
      ).toBeInTheDocument();
    });
  });

  describe("アカウント設定", () => {
    it("アカウントセクションを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("アカウント")).toBeInTheDocument();
    });

    it("AccountSectionコンポーネントをレンダリングする", () => {
      render(<SettingsView />);
      expect(screen.getByTestId("account-section")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("アカウント設定セクションにaria-labelledbyを持つ", () => {
      render(<SettingsView />);
      const section = screen.getByRole("region", { name: /アカウント/ });
      expect(section).toBeInTheDocument();
    });

    it("APIキー設定セクションにaria-labelledbyを持つ", () => {
      render(<SettingsView />);
      const section = screen.getByRole("region", { name: /APIキー設定/ });
      expect(section).toBeInTheDocument();
    });

    it("RAG設定セクションにaria-labelledbyを持つ", () => {
      render(<SettingsView />);
      const section = screen.getByRole("region", { name: /RAG設定/ });
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
