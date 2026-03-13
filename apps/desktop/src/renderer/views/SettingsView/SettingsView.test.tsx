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

// Mock AuthModeSelector to avoid complex IPC dependencies
vi.mock("../../components/settings/AuthModeSelector", () => ({
  AuthModeSelector: ({
    currentMode,
    onModeChange,
    disabled,
  }: {
    currentMode: string;
    onModeChange: (mode: string) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="auth-mode-selector">
      <button
        data-testid="auth-mode-subscription"
        disabled={disabled}
        onClick={() => onModeChange("subscription")}
        aria-pressed={currentMode === "subscription"}
      >
        サブスクリプション
      </button>
      <button
        data-testid="auth-mode-api-key"
        disabled={disabled}
        onClick={() => onModeChange("api-key")}
        aria-pressed={currentMode === "api-key"}
      >
        APIキー
      </button>
    </div>
  ),
}));

vi.mock("../../components/settings/AuthKeySection", () => ({
  AuthKeySection: () => (
    <div data-testid="auth-key-section">AuthKeySection Mock</div>
  ),
}));

// Mock store state - flat structure matching actual store
const createMockState = (overrides = {}) => ({
  // SettingsSlice
  apiKey: "sk-test-key",
  autoSyncEnabled: true,
  themeMode: "system" as const,
  userProfile: {
    name: "Test User",
    email: "test@example.com",
    avatar: "",
    plan: "free" as const,
  },
  setApiKey: vi.fn(),
  setAutoSyncEnabled: vi.fn(),
  setThemeMode: vi.fn().mockResolvedValue(undefined),
  setUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  ...overrides,
});

// Default mock values for AuthMode individual selectors
const mockAuthModeValues = {
  mode: "subscription" as const,
  status: null as {
    mode: "subscription" | "api-key";
    isValid: boolean;
    hasCredentials: boolean;
    message: string;
    errorCode?: string;
    guidance?: string;
    lastCheckedAt: number;
  } | null,
  isLoading: false,
  setMode: vi.fn(),
  initializeAuthMode: vi.fn(),
};

vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
  // 個別セレクタ（P31対策）
  useAuthMode: vi.fn(() => mockAuthModeValues.mode),
  useAuthModeStatus: vi.fn(() => mockAuthModeValues.status),
  useAuthModeLoading: vi.fn(() => mockAuthModeValues.isLoading),
  useSetAuthMode: vi.fn(() => mockAuthModeValues.setMode),
  useInitializeAuthMode: vi.fn(() => mockAuthModeValues.initializeAuthMode),
  // 非推奨の合成Hook（後方互換性のため残す）
  useAuthModeStore: vi.fn(() => mockAuthModeValues),
}));

describe("SettingsView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockAuthModeValues.mode = "subscription";
    mockAuthModeValues.status = null;
    mockAuthModeValues.isLoading = false;
    mockAuthModeValues.setMode = vi.fn();
    mockAuthModeValues.initializeAuthMode = vi.fn();
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

  describe("テーマ設定", () => {
    it("テーマ設定セクションを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("テーマ設定")).toBeInTheDocument();
    });

    it("テーマの4モードを表示する", () => {
      render(<SettingsView />);
      expect(
        screen.getByRole("radio", { name: /Kanagawa/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /ライト/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /ダーク/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /システム/i }),
      ).toBeInTheDocument();
    });

    it("テーマ変更時にsetThemeModeを呼び出す", async () => {
      const mockSetThemeMode = vi.fn().mockResolvedValue(undefined);
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ setThemeMode: mockSetThemeMode }),
        )) as never);

      render(<SettingsView />);
      fireEvent.click(screen.getByRole("radio", { name: /ダーク/i }));

      expect(mockSetThemeMode).toHaveBeenCalledWith("dark");
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

  describe("オンボーディング再表示導線", () => {
    it("callback が渡された場合は再表示ボタンを表示し、押下で呼び出す", () => {
      const handleOpenOnboarding = vi.fn();

      render(<SettingsView onOpenOnboarding={handleOpenOnboarding} />);

      fireEvent.click(
        screen.getByRole("button", { name: "はじめてガイドを再表示" }),
      );

      expect(handleOpenOnboarding).toHaveBeenCalledTimes(1);
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

  describe("認証方式設定", () => {
    it("認証方式設定セクションを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByText("Claude Agent SDK 認証方式")).toBeInTheDocument();
    });

    it("AuthModeSelectorコンポーネントをレンダリングする", () => {
      render(<SettingsView />);
      expect(screen.getByTestId("auth-mode-selector")).toBeInTheDocument();
    });

    it("サブスクリプションとAPIキーボタンを表示する", () => {
      render(<SettingsView />);
      expect(screen.getByTestId("auth-mode-subscription")).toBeInTheDocument();
      expect(screen.getByTestId("auth-mode-api-key")).toBeInTheDocument();
    });

    it("status message を表示する", () => {
      mockAuthModeValues.status = {
        mode: "api-key",
        isValid: false,
        hasCredentials: false,
        message: "APIキーが設定されていません",
        errorCode: "auth-mode/no-api-key",
        guidance: "設定画面でAPIキーを入力してください",
        lastCheckedAt: Date.now(),
      };

      render(<SettingsView />);

      expect(screen.getByTestId("auth-mode-status-message")).toHaveTextContent(
        "APIキーが設定されていません",
      );
      expect(screen.getByTestId("auth-mode-status-code")).toHaveTextContent(
        "auth-mode/no-api-key",
      );
      expect(screen.getByTestId("auth-mode-status-guidance")).toHaveTextContent(
        "設定画面でAPIキーを入力してください",
      );
    });

    it("auth-mode=api-key で AuthKeySection を表示する", () => {
      mockAuthModeValues.mode = "api-key";
      render(<SettingsView />);
      expect(screen.getByTestId("auth-key-section")).toBeInTheDocument();
    });

    it("auth-mode=subscription では AuthKeySection を表示しない", () => {
      mockAuthModeValues.mode = "subscription";
      render(<SettingsView />);
      expect(screen.queryByTestId("auth-key-section")).not.toBeInTheDocument();
    });
  });

  describe("無限ループ防止（P31対策）", () => {
    it("TC-SV-001: initializeAuthModeが1回だけ呼ばれる（rerenderしても増えない）", async () => {
      const mockInitializeAuthMode = vi.fn();
      const { useInitializeAuthMode } = await import("../../store");
      vi.mocked(useInitializeAuthMode).mockReturnValue(mockInitializeAuthMode);

      const { rerender } = render(<SettingsView />);

      // 最初のレンダリングで1回呼ばれる
      expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

      // rerenderしても追加で呼ばれない
      rerender(<SettingsView />);
      expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

      // 複数回rerenderしても変わらない
      rerender(<SettingsView className="test" />);
      rerender(<SettingsView />);
      expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);
    });

    it("TC-SV-002: stateの変更で再レンダリングしても初期化は再実行されない", async () => {
      const mockInitializeAuthMode = vi.fn();
      const mockSetMode = vi.fn();
      const {
        useInitializeAuthMode,
        useAuthMode,
        useAuthModeStatus,
        useSetAuthMode,
      } = await import("../../store");

      // 初期状態
      vi.mocked(useAuthMode).mockReturnValue("subscription");
      vi.mocked(useAuthModeStatus).mockReturnValue(null);
      vi.mocked(useSetAuthMode).mockReturnValue(mockSetMode);
      vi.mocked(useInitializeAuthMode).mockReturnValue(mockInitializeAuthMode);

      const { rerender } = render(<SettingsView />);
      expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);

      // mode が変更された状態をシミュレート
      vi.mocked(useAuthMode).mockReturnValue("api-key");
      vi.mocked(useAuthModeStatus).mockReturnValue({
        mode: "api-key",
        isValid: true,
        hasCredentials: true,
        message: "APIキーが設定されています",
        lastCheckedAt: Date.now(),
      });

      rerender(<SettingsView />);

      // state変更があっても initializeAuthMode は追加呼び出しされない
      expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);
    });
  });
});
