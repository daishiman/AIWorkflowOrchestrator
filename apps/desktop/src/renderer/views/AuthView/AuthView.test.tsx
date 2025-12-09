import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthView } from "./index";

// Mock store actions
const mockLogin = vi.fn();
const mockSetAuthError = vi.fn();

// Mock store state factory
const createMockState = (overrides = {}) => ({
  isLoading: false,
  authError: null,
  login: mockLogin,
  setAuthError: mockSetAuthError,
  ...overrides,
});

// Mock the store
vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
}));

describe("AuthView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  describe("AV-01: 初期表示", () => {
    it("3つのOAuthプロバイダーボタンを表示する", () => {
      render(<AuthView />);

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

    it("アプリ名を表示する", () => {
      render(<AuthView />);

      expect(screen.getByText("AIWorkflowOrchestrator")).toBeInTheDocument();
    });

    it("ログインメッセージを表示する", () => {
      render(<AuthView />);

      expect(screen.getByText("アカウント登録・ログイン")).toBeInTheDocument();
      expect(
        screen.getByText(/アカウントを連携してデータを同期/i),
      ).toBeInTheDocument();
    });

    it("ボタンテキストが「〇〇で続ける」になっている", () => {
      render(<AuthView />);

      expect(screen.getByText(/Googleで続ける/)).toBeInTheDocument();
      expect(screen.getByText(/GitHubで続ける/)).toBeInTheDocument();
      expect(screen.getByText(/Discordで続ける/)).toBeInTheDocument();
    });
  });

  describe("AV-02: Googleボタンクリック", () => {
    it("Googleボタンをクリックするとlogin('google')が呼ばれる", async () => {
      render(<AuthView />);

      const button = screen.getByRole("button", { name: /google/i });
      await userEvent.click(button);

      expect(mockLogin).toHaveBeenCalledWith("google");
    });
  });

  describe("AV-03: GitHubボタンクリック", () => {
    it("GitHubボタンをクリックするとlogin('github')が呼ばれる", async () => {
      render(<AuthView />);

      const button = screen.getByRole("button", { name: /github/i });
      await userEvent.click(button);

      expect(mockLogin).toHaveBeenCalledWith("github");
    });
  });

  describe("AV-04: Discordボタンクリック", () => {
    it("Discordボタンをクリックするとlogin('discord')が呼ばれる", async () => {
      render(<AuthView />);

      const button = screen.getByRole("button", { name: /discord/i });
      await userEvent.click(button);

      expect(mockLogin).toHaveBeenCalledWith("discord");
    });
  });

  describe("AV-05: ローディング状態", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: true,
          }),
        )) as never);
    });

    it("ローディング中はすべてのボタンが無効化される", () => {
      render(<AuthView />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      const githubButton = screen.getByRole("button", { name: /github/i });
      const discordButton = screen.getByRole("button", { name: /discord/i });

      expect(googleButton).toBeDisabled();
      expect(githubButton).toBeDisabled();
      expect(discordButton).toBeDisabled();
    });
  });

  describe("AV-06: エラー表示", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            authError: "認証エラーが発生しました",
          }),
        )) as never);
    });

    it("authErrorが存在する場合、エラーメッセージを表示する", () => {
      render(<AuthView />);

      expect(screen.getByText("認証エラーが発生しました")).toBeInTheDocument();
    });
  });

  describe("AV-07: エラー閉じるボタン", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            authError: "認証エラーが発生しました",
          }),
        )) as never);
    });

    it("エラー閉じるボタンをクリックするとsetAuthError(null)が呼ばれる", async () => {
      render(<AuthView />);

      const closeButton = screen.getByRole("button", { name: /閉じる/i });
      await userEvent.click(closeButton);

      expect(mockSetAuthError).toHaveBeenCalledWith(null);
    });
  });

  describe("アクセシビリティ", () => {
    it("各ボタンに適切なaria-labelがある", () => {
      render(<AuthView />);

      expect(
        screen.getByRole("button", { name: /googleで続ける/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /githubで続ける/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /discordで続ける/i }),
      ).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加できる", () => {
      const { container } = render(<AuthView className="custom-class" />);

      // 最外部のdiv要素にcustom-classが追加されている
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
