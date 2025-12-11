/**
 * ProfileSection 統合コンポーネントテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileSection } from "../index";

// Store モック
const mockProfile = {
  id: "user-123",
  displayName: "Test User",
  email: "test@example.com",
  avatarUrl: null,
  plan: "free" as const,
  timezone: "Asia/Tokyo",
  locale: "ja" as const,
  notificationSettings: {
    email: true,
    desktop: true,
    sound: true,
    workflowComplete: true,
    workflowError: true,
  },
  preferences: {},
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-12-01T00:00:00Z",
};

const createMockState = (overrides = {}) => ({
  profile: mockProfile,
  isLoading: false,
  ...overrides,
});

vi.mock("../../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
}));

// Window.electronAPI モック
const mockElectronAPI = {
  invoke: vi.fn().mockResolvedValue({ success: true }),
};
(window as unknown as { electronAPI: typeof mockElectronAPI }).electronAPI =
  mockElectronAPI;

describe("ProfileSection", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  describe("レンダリング", () => {
    it("ProfileSectionをレンダリングする", () => {
      render(<ProfileSection />);
      expect(screen.getByTestId("profile-section")).toBeInTheDocument();
    });

    it("地域設定セクションを含む", () => {
      render(<ProfileSection />);
      expect(screen.getByText("地域設定")).toBeInTheDocument();
    });

    it("通知設定セクションを含む", () => {
      render(<ProfileSection />);
      expect(screen.getByText("通知")).toBeInTheDocument();
    });

    it("データ管理セクションを含む", () => {
      render(<ProfileSection />);
      // ProfileExportImport が含まれていることを確認（エクスポートボタンの存在で確認）
      expect(
        screen.getByRole("button", { name: /エクスポート/i }),
      ).toBeInTheDocument();
    });
  });

  describe("プロフィール未ロード状態", () => {
    beforeEach(async () => {
      const { useAppStore } = await import("../../../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ profile: null }))) as never);
    });

    it("プロフィールがない場合ローディング表示", () => {
      render(<ProfileSection />);
      expect(screen.getByText(/プロフィールを読み込み中/i)).toBeInTheDocument();
    });
  });

  describe("折りたたみ状態", () => {
    it("collapsedでセクションを折りたためる", () => {
      render(<ProfileSection collapsed />);
      expect(screen.getByText(/プロフィール設定/i)).toBeInTheDocument();
      // 折りたたまれた状態では詳細は非表示
      expect(screen.queryByText("地域設定")).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("セクション全体にaria-labelがある", () => {
      render(<ProfileSection />);
      expect(
        screen.getByRole("region", { name: /プロフィール設定/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("classNameを追加できる", () => {
      render(<ProfileSection className="custom-class" />);
      expect(screen.getByTestId("profile-section")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(ProfileSection.displayName).toBe("ProfileSection");
    });
  });
});
