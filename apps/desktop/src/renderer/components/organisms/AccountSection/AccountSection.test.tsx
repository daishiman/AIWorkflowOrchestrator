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
      expect(
        screen.getByRole("button", { name: /名前を編集/i }),
      ).toBeInTheDocument();
    });

    it("編集ボタンをクリックすると編集モードになる", async () => {
      render(<AccountSection />);
      const editButton = screen.getByRole("button", { name: /名前を編集/i });
      await userEvent.click(editButton);
      expect(
        screen.getByRole("textbox", { name: /表示名/i }),
      ).toBeInTheDocument();
    });

    it("表示名を変更して保存する", async () => {
      render(<AccountSection />);
      const editButton = screen.getByRole("button", { name: /名前を編集/i });
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
      const editButton = screen.getByRole("button", { name: /名前を編集/i });
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

  /**
   * Phase 2 TDD Red Phase: 未実装機能テスト
   *
   * これらのテストは設計レビュー(Phase 1.5)で指摘された未実装機能のテスト。
   * Phase 3実装完了まで失敗する（TDD Red状態）。
   *
   * 対象機能:
   * - unlinkProvider: OAuth連携解除
   * - uploadAvatar: アバター画像アップロード
   * - useProviderAvatar: プロバイダーアバター使用
   * - removeAvatar: アバター削除
   */
  describe("未実装機能（TDD Red Phase）", () => {
    const mockUnlinkProvider = vi.fn();
    const mockUploadAvatar = vi.fn();
    const mockUseProviderAvatar = vi.fn();
    const mockRemoveAvatar = vi.fn();

    const createMockStateWithNewFeatures = (overrides = {}) => ({
      ...createMockState(),
      unlinkProvider: mockUnlinkProvider,
      uploadAvatar: mockUploadAvatar,
      useProviderAvatar: mockUseProviderAvatar,
      removeAvatar: mockRemoveAvatar,
      ...overrides,
    });

    beforeEach(async () => {
      vi.clearAllMocks();
      const { useAppStore } = await import("../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (
          state: ReturnType<typeof createMockStateWithNewFeatures>,
        ) => unknown,
      ) => selector(createMockStateWithNewFeatures())) as never);
    });

    describe("連携解除", () => {
      it("連携解除ボタンを表示する（複数プロバイダー連携時）", async () => {
        const { useAppStore } = await import("../../../store");
        vi.mocked(useAppStore).mockImplementation(((
          selector: (
            state: ReturnType<typeof createMockStateWithNewFeatures>,
          ) => unknown,
        ) =>
          selector(
            createMockStateWithNewFeatures({
              linkedProviders: [
                mockLinkedProviders[0], // Google
                {
                  provider: "github" as const,
                  providerId: "github-id",
                  email: "test@github.com",
                  displayName: "Test GitHub",
                  avatarUrl: null,
                  linkedAt: "2024-12-01T00:00:00Z",
                },
              ],
            }),
          )) as never);

        render(<AccountSection />);
        // 連携解除ボタンが表示される
        expect(
          screen.getByRole("button", { name: /google.*解除/i }),
        ).toBeInTheDocument();
      });

      it("連携解除ボタンをクリックするとunlinkProviderが呼ばれる", async () => {
        const { useAppStore } = await import("../../../store");
        vi.mocked(useAppStore).mockImplementation(((
          selector: (
            state: ReturnType<typeof createMockStateWithNewFeatures>,
          ) => unknown,
        ) =>
          selector(
            createMockStateWithNewFeatures({
              linkedProviders: [
                mockLinkedProviders[0], // Google
                {
                  provider: "github" as const,
                  providerId: "github-id",
                  email: "test@github.com",
                  displayName: "Test GitHub",
                  avatarUrl: null,
                  linkedAt: "2024-12-01T00:00:00Z",
                },
              ],
            }),
          )) as never);

        render(<AccountSection />);
        const unlinkButton = screen.getByRole("button", {
          name: /github.*解除/i,
        });
        await userEvent.click(unlinkButton);
        // 確認ダイアログが表示される
        expect(
          screen.getByText(/本当に連携を解除しますか/i),
        ).toBeInTheDocument();
        // 確認ボタンをクリック
        const confirmButton = screen.getByRole("button", { name: /解除する/i });
        await userEvent.click(confirmButton);
        expect(mockUnlinkProvider).toHaveBeenCalledWith("github");
      });

      it("最後のプロバイダーは連携解除ボタンが非表示", async () => {
        const { useAppStore } = await import("../../../store");
        vi.mocked(useAppStore).mockImplementation(((
          selector: (
            state: ReturnType<typeof createMockStateWithNewFeatures>,
          ) => unknown,
        ) =>
          selector(
            createMockStateWithNewFeatures({
              linkedProviders: [mockLinkedProviders[0]], // Googleのみ
            }),
          )) as never);

        render(<AccountSection />);
        // 連携解除ボタンが存在しないことを確認
        expect(
          screen.queryByRole("button", { name: /解除/i }),
        ).not.toBeInTheDocument();
      });

      it("連携解除の確認ダイアログを表示する", async () => {
        const { useAppStore } = await import("../../../store");
        vi.mocked(useAppStore).mockImplementation(((
          selector: (
            state: ReturnType<typeof createMockStateWithNewFeatures>,
          ) => unknown,
        ) =>
          selector(
            createMockStateWithNewFeatures({
              linkedProviders: [
                mockLinkedProviders[0],
                {
                  provider: "github" as const,
                  providerId: "github-id",
                  email: "test@github.com",
                  displayName: "Test GitHub",
                  avatarUrl: null,
                  linkedAt: "2024-12-01T00:00:00Z",
                },
              ],
            }),
          )) as never);

        render(<AccountSection />);
        const unlinkButton = screen.getByRole("button", {
          name: /github.*解除/i,
        });
        await userEvent.click(unlinkButton);
        // 確認ダイアログが表示される
        expect(
          screen.getByText(/本当に連携を解除しますか/i),
        ).toBeInTheDocument();
      });
    });

    describe("アバターアップロード", () => {
      it("アバター編集ボタンを表示する", () => {
        render(<AccountSection />);
        expect(
          screen.getByRole("button", { name: /アバター.*編集/i }),
        ).toBeInTheDocument();
      });

      it("アバター編集メニューを開く", async () => {
        render(<AccountSection />);
        const avatarEditButton = screen.getByRole("button", {
          name: /アバター.*編集/i,
        });
        await userEvent.click(avatarEditButton);
        // メニューが表示される
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });

      it("アップロードオプションをクリックするとuploadAvatarが呼ばれる", async () => {
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
    });

    describe("プロバイダーアバター使用", () => {
      it("連携プロバイダーのアバターオプションを表示する", async () => {
        const { useAppStore } = await import("../../../store");
        vi.mocked(useAppStore).mockImplementation(((
          selector: (
            state: ReturnType<typeof createMockStateWithNewFeatures>,
          ) => unknown,
        ) =>
          selector(
            createMockStateWithNewFeatures({
              linkedProviders: [
                {
                  ...mockLinkedProviders[0],
                  avatarUrl: "https://google.com/avatar.png", // アバターあり
                },
              ],
            }),
          )) as never);

        render(<AccountSection />);
        const avatarEditButton = screen.getByRole("button", {
          name: /アバター.*編集/i,
        });
        await userEvent.click(avatarEditButton);

        // Googleのアバターを使用するオプション
        expect(
          screen.getByRole("menuitem", { name: /google.*使用/i }),
        ).toBeInTheDocument();
      });

      it("プロバイダーアバターオプションをクリックするとuseProviderAvatarが呼ばれる", async () => {
        const { useAppStore } = await import("../../../store");
        vi.mocked(useAppStore).mockImplementation(((
          selector: (
            state: ReturnType<typeof createMockStateWithNewFeatures>,
          ) => unknown,
        ) =>
          selector(
            createMockStateWithNewFeatures({
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

        const providerAvatarOption = screen.getByRole("menuitem", {
          name: /google.*使用/i,
        });
        await userEvent.click(providerAvatarOption);

        expect(mockUseProviderAvatar).toHaveBeenCalledWith("google");
      });

      it("アバターがないプロバイダーはオプションを表示しない", async () => {
        const { useAppStore } = await import("../../../store");
        vi.mocked(useAppStore).mockImplementation(((
          selector: (
            state: ReturnType<typeof createMockStateWithNewFeatures>,
          ) => unknown,
        ) =>
          selector(
            createMockStateWithNewFeatures({
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

        // Googleのアバターオプションが表示されない
        expect(
          screen.queryByRole("menuitem", { name: /google.*使用/i }),
        ).not.toBeInTheDocument();
      });
    });

    describe("アバター削除", () => {
      it("アバター削除オプションを表示する（アバターがある場合）", async () => {
        render(<AccountSection />);
        const avatarEditButton = screen.getByRole("button", {
          name: /アバター.*編集/i,
        });
        await userEvent.click(avatarEditButton);

        expect(
          screen.getByRole("menuitem", { name: /削除/i }),
        ).toBeInTheDocument();
      });

      it("アバター削除オプションをクリックするとremoveAvatarが呼ばれる", async () => {
        render(<AccountSection />);
        const avatarEditButton = screen.getByRole("button", {
          name: /アバター.*編集/i,
        });
        await userEvent.click(avatarEditButton);

        const removeOption = screen.getByRole("menuitem", { name: /削除/i });
        await userEvent.click(removeOption);

        // 確認ダイアログが表示される
        expect(screen.getByText(/本当に削除しますか/i)).toBeInTheDocument();
        // 確認ボタンをクリック
        const confirmButton = screen.getByRole("button", { name: /削除する/i });
        await userEvent.click(confirmButton);

        expect(mockRemoveAvatar).toHaveBeenCalled();
      });

      it("アバターがない場合は削除オプションが無効", async () => {
        const { useAppStore } = await import("../../../store");
        vi.mocked(useAppStore).mockImplementation(((
          selector: (
            state: ReturnType<typeof createMockStateWithNewFeatures>,
          ) => unknown,
        ) =>
          selector(
            createMockStateWithNewFeatures({
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

        const removeOption = screen.getByRole("menuitem", { name: /削除/i });
        expect(removeOption).toBeDisabled();
      });

      it("アバター削除の確認を求める", async () => {
        render(<AccountSection />);
        const avatarEditButton = screen.getByRole("button", {
          name: /アバター.*編集/i,
        });
        await userEvent.click(avatarEditButton);

        const removeOption = screen.getByRole("menuitem", { name: /削除/i });
        await userEvent.click(removeOption);

        // 確認ダイアログが表示される
        expect(screen.getByText(/本当に削除しますか/i)).toBeInTheDocument();
      });
    });
  });
});
