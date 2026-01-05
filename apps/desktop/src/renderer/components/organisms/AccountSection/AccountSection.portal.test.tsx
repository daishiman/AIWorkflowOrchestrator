/**
 * AccountSection Portal機能テスト - AUTH-UI-002
 *
 * Portal実装の詳細なテストスイート。
 * TDD Red Phase: WCAG 2.1 AA必須要件のテスト。
 *
 * テスト対象:
 * - Portal描画（document.body直下）
 * - position: fixed スタイル
 * - z-index: 9999
 * - メニュー外クリックで閉じる
 * - ARIA属性（aria-expanded, aria-haspopup, role="menu"）
 * - Escキーでメニューを閉じる
 * - フォーカス管理
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountSection } from "./index";

// Mock store
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockUpdateProfile = vi.fn();
const mockLinkProvider = vi.fn();
const mockUnlinkProvider = vi.fn();
const mockUploadAvatar = vi.fn();
const mockUseProviderAvatar = vi.fn();
const mockRemoveAvatar = vi.fn();
const mockDeleteAccount = vi.fn();
const mockSetAuthError = vi.fn();

const mockAuthUser = {
  id: "user-123",
  email: "test@example.com",
  displayName: "Test User",
  avatarUrl: "https://example.com/avatar.png",
  provider: "google" as const,
  createdAt: "2024-01-01T00:00:00Z",
  lastSignInAt: "2024-12-01T00:00:00Z",
};

const mockProfile = {
  id: "user-123",
  displayName: "Test User",
  email: "test@example.com",
  avatarUrl: "https://example.com/avatar.png",
  plan: "free" as const,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-12-01T00:00:00Z",
};

const mockLinkedProviders = [
  {
    provider: "google" as const,
    providerId: "google-id",
    email: "test@example.com",
    displayName: "Test User",
    avatarUrl: "https://google.com/avatar.png",
    linkedAt: "2024-01-01T00:00:00Z",
  },
];

const createMockState = (overrides = {}) => ({
  isAuthenticated: true,
  isLoading: false,
  authUser: mockAuthUser,
  profile: mockProfile,
  linkedProviders: mockLinkedProviders,
  isOffline: false,
  authError: null,
  login: mockLogin,
  logout: mockLogout,
  updateProfile: mockUpdateProfile,
  linkProvider: mockLinkProvider,
  unlinkProvider: mockUnlinkProvider,
  uploadAvatar: mockUploadAvatar,
  useProviderAvatar: mockUseProviderAvatar,
  removeAvatar: mockRemoveAvatar,
  deleteAccount: mockDeleteAccount,
  setAuthError: mockSetAuthError,
  ...overrides,
});

vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
}));

describe("AccountSection Portal機能テスト - AUTH-UI-002", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  afterEach(() => {
    // React Testing LibraryのcleanupがPortal要素を処理するため、
    // 手動でのクリーンアップは不要（競合を避ける）
  });

  describe("FR-001: Portal描画とz-index", () => {
    it("Portalでdocument.body直下にレンダリングされる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      // Portalでレンダリングされたメニューを取得
      const menu = document.body.querySelector('[role="menu"]');
      expect(menu).toBeInTheDocument();
      // document.bodyの直接の子または孫であることを確認
      expect(menu?.closest("body")).toBe(document.body);
    });

    it("メニューがfixed positionでレンダリングされる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const menu = screen.getByRole("menu");
      expect(menu).toHaveClass("fixed");
    });

    it("メニューがz-[9999]でレンダリングされる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const menu = document.body.querySelector('[role="menu"]');
      expect(menu).toHaveClass("z-[9999]");
    });

    it("メニュー位置がアバターボタンの下に計算される", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const menu = document.body.querySelector('[role="menu"]') as HTMLElement;
      expect(menu).toBeInTheDocument();
      // style属性に top と left が設定されていること
      expect(menu.style.top).toBeTruthy();
      expect(menu.style.left).toBeTruthy();
    });
  });

  describe("FR-002: メニュー開閉動作", () => {
    it("アバター編集ボタンをクリックするとメニューが開く", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();

      await userEvent.click(avatarEditButton);

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("メニューが開いている状態でアバター編集ボタンをクリックするとメニューが閉じる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      // メニューを開く
      await userEvent.click(avatarEditButton);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      // メニューを閉じる
      await userEvent.click(avatarEditButton);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("メニュー外クリックでメニューが閉じる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      // メニューを開く
      await userEvent.click(avatarEditButton);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      // メニュー外をクリック
      await userEvent.click(document.body);

      // メニューが閉じる
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("メニュー内のアクションを実行するとメニューが閉じる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      // メニューを開く
      await userEvent.click(avatarEditButton);

      // アップロードをクリック
      const uploadOption = screen.getByRole("menuitem", {
        name: /アップロード/i,
      });
      await userEvent.click(uploadOption);

      // メニューが閉じる
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("NFR-001: WCAG 2.1 AA準拠 - ARIA属性", () => {
    it("メニューコンテナにrole='menu'が設定されている", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const menu = screen.getByRole("menu");
      expect(menu).toBeInTheDocument();
    });

    it("メニューコンテナにaria-label='アバター編集メニュー'が設定されている", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const menu = screen.getByRole("menu");
      expect(menu).toHaveAttribute("aria-label", "アバター編集メニュー");
    });

    it("メニュー項目にrole='menuitem'が設定されている", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const menuItems = screen.getAllByRole("menuitem");
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it("アバター編集ボタンにaria-label='アバターを編集'が設定されている", () => {
      render(<AccountSection />);

      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });
      expect(avatarEditButton).toHaveAttribute("aria-label", "アバターを編集");
    });

    /**
     * TDD Red Phase: 未実装テスト
     * 設計レビューで指摘された必須ARIA属性
     */
    it("アバター編集ボタンにaria-expanded属性が設定されている（メニュー閉時: false）", () => {
      render(<AccountSection />);

      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });
      expect(avatarEditButton).toHaveAttribute("aria-expanded", "false");
    });

    it("アバター編集ボタンにaria-expanded属性が設定されている（メニュー開時: true）", async () => {
      render(<AccountSection />);

      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      expect(avatarEditButton).toHaveAttribute("aria-expanded", "true");
    });

    it("アバター編集ボタンにaria-haspopup='menu'が設定されている", () => {
      render(<AccountSection />);

      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });
      expect(avatarEditButton).toHaveAttribute("aria-haspopup", "menu");
    });
  });

  describe("NFR-001: WCAG 2.1 AA準拠 - キーボード操作", () => {
    /**
     * TDD Red Phase: 未実装テスト
     * 設計レビューで指摘された必須キーボード操作
     */
    it("Escキーでメニューが閉じる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      // メニューを開く
      await userEvent.click(avatarEditButton);
      expect(screen.getByRole("menu")).toBeInTheDocument();

      // Escキーを押す
      await userEvent.keyboard("{Escape}");

      // メニューが閉じる
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    it("Escキーでメニューを閉じた後、フォーカスがアバター編集ボタンに戻る", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      // メニューを開く
      await userEvent.click(avatarEditButton);

      // Escキーを押す
      await userEvent.keyboard("{Escape}");

      // フォーカスがボタンに戻る
      await waitFor(() => {
        expect(avatarEditButton).toHaveFocus();
      });
    });

    it("Enterキーでメニューを開くことができる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      // ボタンにフォーカス
      avatarEditButton.focus();

      // Enterキーを押す
      await userEvent.keyboard("{Enter}");

      // メニューが開く
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("Spaceキーでメニューを開くことができる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      // ボタンにフォーカス
      avatarEditButton.focus();

      // Spaceキーを押す
      await userEvent.keyboard(" ");

      // メニューが開く
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("メニューを開いた時に最初のメニュー項目にフォーカスが移動する", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      // メニューを開く
      await userEvent.click(avatarEditButton);

      const menuItems = screen.getAllByRole("menuitem");
      expect(menuItems.length).toBeGreaterThan(0);

      // 最初のメニュー項目にフォーカスが移動している
      // WAI-ARIA Menu Patternに準拠
      expect(menuItems[0]).toHaveFocus();
    });
  });

  describe("FR-003: メニュー機能", () => {
    it("アップロードボタンをクリックするとuploadAvatarが呼ばれる", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const uploadOption = screen.getByRole("menuitem", {
        name: /アップロード/i,
      });
      await userEvent.click(uploadOption);

      expect(mockUploadAvatar).toHaveBeenCalled();
    });

    it("プロバイダーアバター使用ボタンをクリックするとuseProviderAvatarが呼ばれる", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            profile: {
              ...mockProfile,
              avatarUrl: null, // カスタムアバターなし
            },
            linkedProviders: [
              {
                ...mockLinkedProviders[0],
                avatarUrl: "https://google.com/avatar.png",
              },
            ],
          }),
        )) as never);

      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const providerOption = screen.getByRole("menuitem", {
        name: /Google.*使用/i,
      });
      await userEvent.click(providerOption);

      expect(mockUseProviderAvatar).toHaveBeenCalledWith("google");
    });

    it("アバター削除ボタンをクリックすると確認ダイアログが表示される", async () => {
      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const deleteOption = screen.getByRole("menuitem", { name: /削除/i });
      await userEvent.click(deleteOption);

      // 確認ダイアログが表示される
      expect(screen.getByText(/本当に削除しますか/i)).toBeInTheDocument();
    });

    it("アバターがない場合、削除ボタンは無効", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            profile: {
              ...mockProfile,
              avatarUrl: null,
            },
            authUser: {
              ...mockAuthUser,
              avatarUrl: null,
            },
          }),
        )) as never);

      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      const deleteOption = screen.getByRole("menuitem", { name: /削除/i });
      expect(deleteOption).toBeDisabled();
    });
  });

  describe("境界値テスト", () => {
    it("連携プロバイダーがない場合、プロバイダーアバターオプションが表示されない", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            linkedProviders: [],
          }),
        )) as never);

      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      // プロバイダーオプションが表示されない
      expect(
        screen.queryByRole("menuitem", { name: /Google.*使用/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("menuitem", { name: /GitHub.*使用/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("menuitem", { name: /Discord.*使用/i }),
      ).not.toBeInTheDocument();
    });

    it("現在使用中のプロバイダーアバターはメニューに表示されない", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            profile: {
              ...mockProfile,
              avatarUrl: "https://google.com/avatar.png", // Googleアバター使用中
            },
            linkedProviders: [
              {
                ...mockLinkedProviders[0],
                avatarUrl: "https://google.com/avatar.png",
              },
              {
                provider: "github" as const,
                providerId: "github-id",
                email: "test@github.com",
                displayName: "Test GitHub",
                avatarUrl: "https://github.com/avatar.png",
                linkedAt: "2024-12-01T00:00:00Z",
              },
            ],
          }),
        )) as never);

      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      // Googleは表示されない（現在使用中）
      expect(
        screen.queryByRole("menuitem", { name: /Google.*使用/i }),
      ).not.toBeInTheDocument();
      // GitHubは表示される
      expect(
        screen.getByRole("menuitem", { name: /GitHub.*使用/i }),
      ).toBeInTheDocument();
    });

    it("プロバイダーのavatarUrlがnullの場合、そのプロバイダーは表示されない", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            profile: {
              ...mockProfile,
              avatarUrl: null,
            },
            linkedProviders: [
              {
                ...mockLinkedProviders[0],
                avatarUrl: null, // アバターなし
              },
            ],
          }),
        )) as never);

      render(<AccountSection />);
      const avatarEditButton = screen.getByRole("button", {
        name: /アバター.*編集/i,
      });

      await userEvent.click(avatarEditButton);

      // avatarUrlがnullのGoogleは表示されない
      expect(
        screen.queryByRole("menuitem", { name: /Google.*使用/i }),
      ).not.toBeInTheDocument();
    });
  });
});
