import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("AccountSection", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  describe("未認証状態", () => {
    beforeEach(async () => {
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
    });

    it("ログインボタンを表示する", () => {
      render(<AccountSection />);
      expect(
        screen.getByRole("button", { name: /google/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /github/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /discord/i }),
      ).toBeInTheDocument();
    });

    it("Googleログインボタンをクリックするとlogin('google')が呼ばれる", async () => {
      render(<AccountSection />);
      const button = screen.getByRole("button", { name: /google/i });
      await userEvent.click(button);
      expect(mockLogin).toHaveBeenCalledWith("google");
    });

    it("GitHubログインボタンをクリックするとlogin('github')が呼ばれる", async () => {
      render(<AccountSection />);
      const button = screen.getByRole("button", { name: /github/i });
      await userEvent.click(button);
      expect(mockLogin).toHaveBeenCalledWith("github");
    });

    it("Discordログインボタンをクリックするとlogin('discord')が呼ばれる", async () => {
      render(<AccountSection />);
      const button = screen.getByRole("button", { name: /discord/i });
      await userEvent.click(button);
      expect(mockLogin).toHaveBeenCalledWith("discord");
    });

    it("ログイン画面のメッセージを表示する", () => {
      render(<AccountSection />);
      expect(
        screen.getByText(/アカウントを連携してデータを同期/i),
      ).toBeInTheDocument();
    });

    it("ボタンテキストが「〇〇で続ける」になっている", () => {
      render(<AccountSection />);
      expect(screen.getByText(/Googleで続ける/)).toBeInTheDocument();
      expect(screen.getByText(/GitHubで続ける/)).toBeInTheDocument();
      expect(screen.getByText(/Discordで続ける/)).toBeInTheDocument();
    });
  });

  describe("認証済み状態", () => {
    it("ユーザープロフィールを表示する", () => {
      render(<AccountSection />);
      expect(screen.getByText("Test User")).toBeInTheDocument();
      // メールアドレスはプロファイルと連携プロバイダーの両方に表示される
      expect(screen.getAllByText("test@example.com").length).toBeGreaterThan(0);
    });

    it("アバター画像を表示する", () => {
      render(<AccountSection />);
      const avatar = screen.getByRole("img", { name: /avatar/i });
      expect(avatar).toHaveAttribute("src", "https://example.com/avatar.png");
    });

    it("プランを表示する", () => {
      render(<AccountSection />);
      expect(screen.getByText(/free/i)).toBeInTheDocument();
    });

    it("ログアウトボタンを表示する", () => {
      render(<AccountSection />);
      expect(
        screen.getByRole("button", { name: /ログアウト/i }),
      ).toBeInTheDocument();
    });

    it("ログアウトボタンをクリックするとlogoutが呼ばれる", async () => {
      render(<AccountSection />);
      const button = screen.getByRole("button", { name: /ログアウト/i });
      await userEvent.click(button);
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("プロフィール編集", () => {
    it("表示名の編集ボタンを表示する", () => {
      render(<AccountSection />);
      expect(screen.getByRole("button", { name: /編集/i })).toBeInTheDocument();
    });

    it("編集ボタンをクリックすると編集モードになる", async () => {
      render(<AccountSection />);
      const editButton = screen.getByRole("button", { name: /編集/i });
      await userEvent.click(editButton);
      expect(
        screen.getByRole("textbox", { name: /表示名/i }),
      ).toBeInTheDocument();
    });

    it("表示名を変更して保存する", async () => {
      render(<AccountSection />);
      const editButton = screen.getByRole("button", { name: /編集/i });
      await userEvent.click(editButton);

      const input = screen.getByRole("textbox", { name: /表示名/i });
      await userEvent.clear(input);
      await userEvent.type(input, "New Name");

      const saveButton = screen.getByRole("button", { name: /保存/i });
      await userEvent.click(saveButton);

      expect(mockUpdateProfile).toHaveBeenCalledWith({
        displayName: "New Name",
      });
    });

    it("キャンセルボタンで編集モードを終了する", async () => {
      render(<AccountSection />);
      const editButton = screen.getByRole("button", { name: /編集/i });
      await userEvent.click(editButton);

      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await userEvent.click(cancelButton);

      expect(
        screen.queryByRole("textbox", { name: /表示名/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("連携プロバイダー", () => {
    it("連携済みプロバイダーを表示する", () => {
      render(<AccountSection />);
      expect(screen.getByText(/google/i)).toBeInTheDocument();
    });

    it("連携済みプロバイダーに「登録済み」バッジが表示される", () => {
      render(<AccountSection />);
      expect(screen.getByText("登録済み")).toBeInTheDocument();
    });

    it("未連携プロバイダーの連携ボタンを表示する", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            linkedProviders: [mockLinkedProviders[0]],
          }),
        )) as never);

      render(<AccountSection />);
      expect(
        screen.getByRole("button", { name: /github.*連携/i }),
      ).toBeInTheDocument();
    });

    it("連携ボタンをクリックするとlinkProviderが呼ばれる", async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            linkedProviders: [mockLinkedProviders[0]],
          }),
        )) as never);

      render(<AccountSection />);
      const linkButton = screen.getByRole("button", { name: /github.*連携/i });
      await userEvent.click(linkButton);
      expect(mockLinkProvider).toHaveBeenCalledWith("github");
    });
  });

  describe("ローディング状態", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ isLoading: true }))) as never);
    });

    it("ローディング中はボタンを無効化する", () => {
      render(<AccountSection />);
      const logoutButton = screen.getByRole("button", { name: /ログアウト/i });
      expect(logoutButton).toBeDisabled();
    });

    it("ローディングインジケーターを表示する", () => {
      render(<AccountSection />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("オフライン状態", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ isOffline: true }))) as never);
    });

    it("オフライン表示を出す", () => {
      render(<AccountSection />);
      expect(screen.getByText(/オフライン/i)).toBeInTheDocument();
    });
  });

  describe("エラー状態", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ authError: "認証エラーが発生しました" }),
        )) as never);
    });

    it("エラーメッセージを表示する", () => {
      render(<AccountSection />);
      expect(screen.getByText("認証エラーが発生しました")).toBeInTheDocument();
    });

    it("エラーを閉じるボタンでsetAuthError(null)が呼ばれる", async () => {
      render(<AccountSection />);
      const closeButton = screen.getByRole("button", { name: /閉じる/i });
      await userEvent.click(closeButton);
      expect(mockSetAuthError).toHaveBeenCalledWith(null);
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なaria-labelを持つ", () => {
      render(<AccountSection />);
      expect(
        screen.getByRole("region", { name: /アカウント/i }),
      ).toBeInTheDocument();
    });

    it("アバターにalt属性がある", () => {
      render(<AccountSection />);
      const avatar = screen.getByRole("img", { name: /avatar/i });
      expect(avatar).toHaveAttribute("alt");
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加できる", () => {
      render(<AccountSection className="custom-class" />);
      const section = screen.getByRole("region", { name: /アカウント/i });
      expect(section).toHaveClass("custom-class");
    });
  });
});
