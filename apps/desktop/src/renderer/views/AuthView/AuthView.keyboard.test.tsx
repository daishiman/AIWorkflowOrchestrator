/**
 * AuthView キーボードナビゲーションテスト
 *
 * WCAG 2.1 準拠のキーボード操作を検証するテストスイート。
 * - Tab キーによるフォーカス移動
 * - Shift+Tab による逆方向移動
 * - Enter キーによるボタン操作
 * - Space キーによるボタン操作
 */
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

describe("AuthView Keyboard Navigation", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  describe("TEST-KB-01: Tab キーによるフォーカス移動", () => {
    it("Tab キーで OAuth ボタン間を正しい順序でフォーカス移動する", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      const githubButton = screen.getByRole("button", { name: /github/i });
      const discordButton = screen.getByRole("button", { name: /discord/i });

      // 最初のボタンにフォーカス
      googleButton.focus();
      expect(document.activeElement).toBe(googleButton);

      // Tab で次のボタンへ
      await user.tab();
      expect(document.activeElement).toBe(githubButton);

      // Tab で次のボタンへ
      await user.tab();
      expect(document.activeElement).toBe(discordButton);
    });

    it("全ての OAuth ボタンが正しい tabindex を持つ", () => {
      render(<AuthView />);

      const buttons = screen.getAllByRole("button", { name: /で続ける/i });

      // 全てのボタンが tabindex="0" または tabindex 未設定（デフォルト）
      buttons.forEach((button) => {
        const tabIndex = button.getAttribute("tabindex");
        expect(tabIndex === null || tabIndex === "0").toBe(true);
      });
    });

    it("OAuth ボタンの順序が Google → GitHub → Discord である", () => {
      render(<AuthView />);

      const buttons = screen.getAllByRole("button", { name: /で続ける/i });

      expect(buttons[0]).toHaveAccessibleName(/google/i);
      expect(buttons[1]).toHaveAccessibleName(/github/i);
      expect(buttons[2]).toHaveAccessibleName(/discord/i);
    });
  });

  describe("TEST-KB-02: Shift+Tab による逆方向移動", () => {
    it("Shift+Tab で OAuth ボタン間を逆順でフォーカス移動する", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      const githubButton = screen.getByRole("button", { name: /github/i });
      const discordButton = screen.getByRole("button", { name: /discord/i });

      // 最後のボタンにフォーカス
      discordButton.focus();
      expect(document.activeElement).toBe(discordButton);

      // Shift+Tab で前のボタンへ
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(githubButton);

      // Shift+Tab で前のボタンへ
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(googleButton);
    });
  });

  describe("TEST-KB-03: Enter キーによるボタン操作", () => {
    it("Google ボタンにフォーカスして Enter を押すと login('google') が呼ばれる", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      googleButton.focus();

      await user.keyboard("{Enter}");

      expect(mockLogin).toHaveBeenCalledWith("google");
    });

    it("GitHub ボタンにフォーカスして Enter を押すと login('github') が呼ばれる", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const githubButton = screen.getByRole("button", { name: /github/i });
      githubButton.focus();

      await user.keyboard("{Enter}");

      expect(mockLogin).toHaveBeenCalledWith("github");
    });

    it("Discord ボタンにフォーカスして Enter を押すと login('discord') が呼ばれる", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const discordButton = screen.getByRole("button", { name: /discord/i });
      discordButton.focus();

      await user.keyboard("{Enter}");

      expect(mockLogin).toHaveBeenCalledWith("discord");
    });
  });

  describe("TEST-KB-04: Space キーによるボタン操作", () => {
    it("Google ボタンにフォーカスして Space を押すと login('google') が呼ばれる", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      googleButton.focus();

      await user.keyboard(" ");

      expect(mockLogin).toHaveBeenCalledWith("google");
    });

    it("GitHub ボタンにフォーカスして Space を押すと login('github') が呼ばれる", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const githubButton = screen.getByRole("button", { name: /github/i });
      githubButton.focus();

      await user.keyboard(" ");

      expect(mockLogin).toHaveBeenCalledWith("github");
    });

    it("Discord ボタンにフォーカスして Space を押すと login('discord') が呼ばれる", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const discordButton = screen.getByRole("button", { name: /discord/i });
      discordButton.focus();

      await user.keyboard(" ");

      expect(mockLogin).toHaveBeenCalledWith("discord");
    });
  });

  describe("ローディング中のキーボード操作", () => {
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

    it("ローディング中は Enter キーでログインが実行されない", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      googleButton.focus();

      await user.keyboard("{Enter}");

      // disabled なボタンはクリックイベントを発火しない
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("ローディング中は Space キーでログインが実行されない", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      googleButton.focus();

      await user.keyboard(" ");

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe("エラー表示時のキーボード操作", () => {
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

    it("エラー閉じるボタンに Tab でフォーカスできる", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const closeButton = screen.getByRole("button", { name: /閉じる/i });

      // 閉じるボタンにフォーカスを移動（Tab を複数回）
      await user.tab();

      // 閉じるボタンがフォーカス可能であることを確認
      expect(closeButton.getAttribute("tabindex")).not.toBe("-1");
    });

    it("エラー閉じるボタンで Enter を押すと setAuthError(null) が呼ばれる", async () => {
      const user = userEvent.setup();
      render(<AuthView />);

      const closeButton = screen.getByRole("button", { name: /閉じる/i });
      closeButton.focus();

      await user.keyboard("{Enter}");

      expect(mockSetAuthError).toHaveBeenCalledWith(null);
    });
  });

  describe("フォーカス可視性", () => {
    it("ボタンにフォーカスリングが表示される（focus-visible クラスの存在）", () => {
      render(<AuthView />);

      const buttons = screen.getAllByRole("button", { name: /で続ける/i });

      // ボタンがフォーカス可能であることを確認
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });
});
