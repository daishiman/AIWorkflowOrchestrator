import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthGuard } from "./index";

// Mock AuthView component
vi.mock("../../views/AuthView", () => ({
  AuthView: () => <div data-testid="auth-view">AuthView</div>,
}));

// Mock devMockAuth to prevent auto-login in tests
vi.mock("../../utils/devMockAuth", () => ({
  isDevMode: vi.fn(() => false),
  getMockAuthData: vi.fn(),
  logDevModeStatus: vi.fn(),
}));

// Mock store state factory
const createMockState = (overrides = {}) => ({
  isAuthenticated: false,
  isLoading: true,
  setDevModeAuth: vi.fn(),
  ...overrides,
});

// Mock the store
vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
}));

describe("AuthGuard", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe("AG-01: ローディング状態", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: true,
            isAuthenticated: false,
          }),
        )) as never);
    });

    it("isLoading=true の場合、ローディング画面を表示する", () => {
      render(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>,
      );

      // ローディング状態を示すrole="status"要素が存在する
      expect(screen.getByRole("status")).toBeInTheDocument();
      // 子コンポーネントは表示されない
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
      // AuthViewは表示されない
      expect(screen.queryByTestId("auth-view")).not.toBeInTheDocument();
    });

    it("ローディング中に「読み込み中...」テキストを表示する", () => {
      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });
  });

  describe("AG-02: 認証済み状態", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: false,
            isAuthenticated: true,
          }),
        )) as never);
    });

    it("isAuthenticated=true の場合、子コンポーネントを表示する", () => {
      render(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>,
      );

      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
      // AuthViewは表示されない
      expect(screen.queryByTestId("auth-view")).not.toBeInTheDocument();
    });

    it("複数の子要素を正しくレンダリングする", () => {
      render(
        <AuthGuard>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </AuthGuard>,
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
    });
  });

  describe("AG-03: 未認証状態", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: false,
            isAuthenticated: false,
          }),
        )) as never);
    });

    it("isAuthenticated=false の場合、AuthViewを表示する", () => {
      render(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>,
      );

      expect(screen.getByTestId("auth-view")).toBeInTheDocument();
      // 子コンポーネントは表示されない
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("AG-04: カスタムfallback", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: true,
            isAuthenticated: false,
          }),
        )) as never);
    });

    it("fallbackプロパティが指定された場合、カスタムローディング画面を表示する", () => {
      render(
        <AuthGuard
          fallback={<div data-testid="custom-loading">Custom Loading...</div>}
        >
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>,
      );

      expect(screen.getByTestId("custom-loading")).toBeInTheDocument();
      expect(screen.getByText("Custom Loading...")).toBeInTheDocument();
      // デフォルトのローディング画面は表示されない
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });
  });

  describe("AG-05: 認証状態の変更（未認証 → 認証済み）", () => {
    it("認証状態が変わると表示が切り替わる", async () => {
      const { useAppStore } = await import("../../store");

      // 初期状態: 未認証
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: false,
            isAuthenticated: false,
          }),
        )) as never);

      const { rerender } = render(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>,
      );

      // AuthViewが表示されている
      expect(screen.getByTestId("auth-view")).toBeInTheDocument();
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();

      // 状態を認証済みに変更
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: false,
            isAuthenticated: true,
          }),
        )) as never);

      // 再レンダリング
      rerender(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>,
      );

      // 子コンポーネントが表示される
      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("auth-view")).not.toBeInTheDocument();
    });
  });

  describe("AG-06: 認証状態の変更（認証済み → 未認証）", () => {
    it("ログアウト時にAuthViewに切り替わる", async () => {
      const { useAppStore } = await import("../../store");

      // 初期状態: 認証済み
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: false,
            isAuthenticated: true,
          }),
        )) as never);

      const { rerender } = render(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>,
      );

      // 子コンポーネントが表示されている
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(screen.queryByTestId("auth-view")).not.toBeInTheDocument();

      // 状態を未認証に変更（ログアウト）
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: false,
            isAuthenticated: false,
          }),
        )) as never);

      // 再レンダリング
      rerender(
        <AuthGuard>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGuard>,
      );

      // AuthViewが表示される
      await waitFor(() => {
        expect(screen.getByTestId("auth-view")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            isLoading: true,
            isAuthenticated: false,
          }),
        )) as never);
    });

    it("ローディング画面にrole='status'とaria-labelがある", () => {
      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>,
      );

      const loadingElement = screen.getByRole("status");
      expect(loadingElement).toHaveAttribute("aria-label", "認証確認中");
    });
  });
});
