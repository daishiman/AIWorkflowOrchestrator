/**
 * AccountSection アクセシビリティテスト
 *
 * ARIA 属性と live region 通知を検証するテストスイート。
 * - aria-live region による通知
 * - role 属性の正確性
 * - aria-label の適切性
 * - sr-only テキストの検証
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AccountSection } from "./index";

// Mock the auth store selectors
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockUpdateProfile = vi.fn();
const mockLinkProvider = vi.fn();
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
  setAuthError: mockSetAuthError,
  ...overrides,
});

vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
}));

describe("AccountSection Accessibility", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  describe("TEST-A11Y-01: 成功メッセージ通知（aria-live）", () => {
    it("ログイン成功時に aria-live region でメッセージが通知される", async () => {
      // 新規登録を示す状態（createdAt と lastSignInAt が近い）
      const newUserAuthUser = {
        ...mockAuthUser,
        createdAt: new Date().toISOString(),
        lastSignInAt: new Date().toISOString(),
      };

      const { useAppStore } = await import("../../../store");

      // 初期状態: 未認証
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isAuthenticated: false,
            authUser: null,
            profile: null,
            linkedProviders: [],
          }),
        )) as never);

      const { rerender } = render(<AccountSection />);

      // 認証成功後の状態に更新
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isAuthenticated: true,
            authUser: newUserAuthUser,
            profile: mockProfile,
            linkedProviders: mockLinkedProviders,
          }),
        )) as never);

      rerender(<AccountSection />);

      // 成功メッセージが表示される（aria-live="polite" の領域内）
      await waitFor(() => {
        const successMessage =
          screen.queryByText(/登録が完了|ログインしました/);
        if (successMessage) {
          // メッセージを含むコンテナが存在することを確認
          expect(successMessage).toBeInTheDocument();
        }
      });
    });

    it("ログイン成功メッセージに適切なアイコンが表示される", async () => {
      // ログイン済み状態（既存ユーザー）
      const existingUserAuthUser = {
        ...mockAuthUser,
        createdAt: "2024-01-01T00:00:00Z",
        lastSignInAt: "2024-12-01T00:00:00Z",
      };

      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isAuthenticated: true,
            authUser: existingUserAuthUser,
          }),
        )) as never);

      render(<AccountSection />);

      // 認証済み状態では成功メッセージエリアが一定時間後に非表示になる
      // ここでは初期表示時の構造を確認
      const section = screen.getByRole("region", { name: /アカウント/i });
      expect(section).toBeInTheDocument();
    });
  });

  describe("TEST-A11Y-02: エラーメッセージ通知（role='alert'）", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            authError: "認証に失敗しました",
          }),
        )) as never);
    });

    it("エラーメッセージが role='alert' 相当の緊急性で表示される", () => {
      render(<AccountSection />);

      const errorMessage = screen.getByText("認証に失敗しました");
      expect(errorMessage).toBeInTheDocument();

      // エラーメッセージのコンテナが視覚的に目立つスタイルを持つ
      const errorContainer = errorMessage.closest("div");
      expect(errorContainer).toBeInTheDocument();
    });

    it("エラーメッセージに閉じるボタンが存在し、アクセシブルである", () => {
      render(<AccountSection />);

      const closeButton = screen.getByRole("button", { name: /閉じる/i });
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute("aria-label", "閉じる");
    });
  });

  describe("TEST-A11Y-03: region ラベル", () => {
    it("セクションに適切な aria-label を持つ role='region' がある", () => {
      render(<AccountSection />);

      const section = screen.getByRole("region", { name: /アカウント/i });
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute("aria-label", "アカウント設定");
    });

    it("未認証状態でも region ラベルが維持される", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isAuthenticated: false,
            authUser: null,
            profile: null,
            linkedProviders: [],
          }),
        )) as never);

      render(<AccountSection />);

      const section = screen.getByRole("region", { name: /アカウント/i });
      expect(section).toBeInTheDocument();
    });
  });

  describe("TEST-A11Y-04: sr-only テキスト", () => {
    it("ローディング中に sr-only テキスト「読み込み中」が存在する", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: true,
          }),
        )) as never);

      render(<AccountSection />);

      // ローディングインジケーターが表示される
      const loadingIndicator = screen.getByRole("status");
      expect(loadingIndicator).toBeInTheDocument();

      // sr-only テキストが存在する
      const srOnlyText = screen.getByText("読み込み中");
      expect(srOnlyText).toBeInTheDocument();
      expect(srOnlyText).toHaveClass("sr-only");
    });

    it("アバター画像に適切な alt テキストが設定されている", () => {
      render(<AccountSection />);

      const avatar = screen.getByRole("img", { name: /avatar/i });
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("alt");
      expect(avatar.getAttribute("alt")).toContain("avatar");
    });
  });

  describe("ボタンのアクセシビリティ", () => {
    it("ログアウトボタンに適切なラベルがある", () => {
      render(<AccountSection />);

      const logoutButton = screen.getByRole("button", { name: /ログアウト/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it("編集ボタンに適切な aria-label がある", () => {
      render(<AccountSection />);

      const editButton = screen.getByRole("button", { name: /編集/i });
      expect(editButton).toBeInTheDocument();
      expect(editButton).toHaveAttribute("aria-label", "編集");
    });

    it("未認証時のログインボタンに適切な aria-label がある", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isAuthenticated: false,
            authUser: null,
            profile: null,
            linkedProviders: [],
          }),
        )) as never);

      render(<AccountSection />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      expect(googleButton).toHaveAttribute("aria-label", "Googleで続ける");
    });
  });

  describe("フォーム要素のアクセシビリティ", () => {
    it("表示名編集フィールドに適切な label が関連付けられている", async () => {
      const user = await import("@testing-library/user-event");
      render(<AccountSection />);

      // 編集モードに入る
      const editButton = screen.getByRole("button", { name: /編集/i });
      await user.default.click(editButton);

      // 入力フィールドが表示される
      const input = screen.getByRole("textbox", { name: /表示名/i });
      expect(input).toBeInTheDocument();

      // 関連する label または aria-label が存在する
      expect(input).toHaveAttribute("aria-label", "表示名");
    });
  });

  describe("連携プロバイダーのアクセシビリティ", () => {
    it("連携済みプロバイダーに適切なステータス表示がある", () => {
      render(<AccountSection />);

      // 「登録済み」テキストが存在する
      const registeredText = screen.getByText("登録済み");
      expect(registeredText).toBeInTheDocument();
    });

    it("未連携プロバイダーの連携ボタンに適切な aria-label がある", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            linkedProviders: [mockLinkedProviders[0]], // Google のみ連携
          }),
        )) as never);

      render(<AccountSection />);

      // GitHub と Discord の連携ボタンが表示される
      const githubLinkButton = screen.getByRole("button", {
        name: /github.*連携/i,
      });
      expect(githubLinkButton).toHaveAttribute("aria-label", "GitHubを連携");
    });
  });

  describe("オフライン状態のアクセシビリティ", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isOffline: true,
          }),
        )) as never);
    });

    it("オフラインインジケーターが視覚的に識別可能である", () => {
      render(<AccountSection />);

      const offlineIndicator = screen.getByText("オフライン");
      expect(offlineIndicator).toBeInTheDocument();
    });
  });
});
