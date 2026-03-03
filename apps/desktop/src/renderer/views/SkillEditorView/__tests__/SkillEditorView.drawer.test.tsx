/**
 * SkillEditorView モバイルドロワー テスト
 * UT-UI-05A-002: モバイルドロワー
 *
 * Phase 4 - TDD Red
 *
 * @module SkillEditorView/__tests__/SkillEditorView.drawer.test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillEditorView } from "../index";
import { setupSkillApiMocks } from "./helpers/test-factories";

// matchMedia mock helper
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe("SkillEditorView モバイルドロワー", () => {
  beforeEach(() => {
    setupSkillApiMocks();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("レスポンシブ切り替え", () => {
    it("767px 以下でハンバーガーボタンが表示され、ドロワーが閉じた状態になる", async () => {
      mockMatchMedia(true); // max-width: 767px matches
      await act(async () => {
        render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
      });

      // Hamburger button should be visible
      expect(screen.getByLabelText("ナビゲーション開く")).toBeInTheDocument();
      // Drawer should be closed (translated off-screen)
      const drawer = screen.getByTestId("mobile-drawer");
      expect(drawer.className).toContain("-translate-x-full");
    });

    it("768px 以上で2ペインレイアウトが表示される", async () => {
      mockMatchMedia(false); // max-width: 767px does NOT match
      await act(async () => {
        render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
      });

      // Hamburger button should NOT be visible
      expect(
        screen.queryByLabelText("ナビゲーション開く"),
      ).not.toBeInTheDocument();
      // FileTree should be directly visible
      expect(screen.getByRole("tree")).toBeInTheDocument();
    });
  });

  describe("ドロワー操作", () => {
    beforeEach(() => {
      mockMatchMedia(true); // mobile mode
    });

    it("ハンバーガーボタンクリックでドロワーが開く", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
      });

      const hamburger = screen.getByLabelText("ナビゲーション開く");
      await act(async () => {
        fireEvent.click(hamburger);
      });

      // Drawer should be visible with tree
      expect(screen.getByRole("tree")).toBeInTheDocument();
    });

    it("オーバーレイクリックでドロワーが閉じる", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
      });

      // Open drawer
      await act(async () => {
        fireEvent.click(screen.getByLabelText("ナビゲーション開く"));
      });

      // Click overlay
      const overlay = screen.getByTestId("drawer-overlay");
      await act(async () => {
        fireEvent.click(overlay);
      });

      // Drawer should be closed (translated off-screen)
      const drawer = screen.getByTestId("mobile-drawer");
      expect(drawer.className).toContain("-translate-x-full");
    });

    it("Escape キーでドロワーが閉じる", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
      });

      // Open drawer
      await act(async () => {
        fireEvent.click(screen.getByLabelText("ナビゲーション開く"));
      });

      // Press Escape
      await act(async () => {
        fireEvent.keyDown(document, { key: "Escape" });
      });

      // Drawer should be closed (translated off-screen)
      const drawer = screen.getByTestId("mobile-drawer");
      expect(drawer.className).toContain("-translate-x-full");
    });

    it("ファイル選択後にドロワーが自動的に閉じる", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
      });

      // Open drawer
      await act(async () => {
        fireEvent.click(screen.getByLabelText("ナビゲーション開く"));
      });

      // Select a file in the tree
      const treeItems = screen.getAllByRole("treeitem");
      await act(async () => {
        fireEvent.click(treeItems[0]);
      });

      // Drawer should be closed (translated off-screen)
      const drawer = screen.getByTestId("mobile-drawer");
      expect(drawer.className).toContain("-translate-x-full");
    });
  });

  describe("アクセシビリティ", () => {
    beforeEach(() => {
      mockMatchMedia(true);
    });

    it("ハンバーガーボタンに aria-expanded が正しく設定される", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
      });

      const hamburger = screen.getByLabelText("ナビゲーション開く");
      expect(hamburger).toHaveAttribute("aria-expanded", "false");

      await act(async () => {
        fireEvent.click(hamburger);
      });
      expect(hamburger).toHaveAttribute("aria-expanded", "true");
    });

    it("ドロワーにスライドインアニメーションクラスが適用される", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="test-skill" onClose={vi.fn()} />);
      });

      await act(async () => {
        fireEvent.click(screen.getByLabelText("ナビゲーション開く"));
      });

      // Check for transition classes on the drawer container
      const drawer = screen.getByTestId("mobile-drawer");
      expect(drawer.className).toMatch(/transition-transform|transform/);
    });
  });
});
