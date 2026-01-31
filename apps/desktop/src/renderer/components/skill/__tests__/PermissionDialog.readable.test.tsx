/**
 * @file PermissionDialog.readable.test.tsx
 * @description PermissionDialog 人間可読UI表示テスト
 * @phase Phase 4: テスト作成 + Phase 6: テスト拡充
 * @task task-imp-permission-readable-ui-001
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Storeモック
const mockRespondToSkillPermission = vi.fn();
let mockPendingPermission: {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
} | null = {
  executionId: "exec-001",
  requestId: "req-001",
  toolName: "Bash",
  args: { command: "ls -la" },
  reason: "ディレクトリ内容を確認するため",
};

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(() => ({
    pendingPermission: mockPendingPermission,
    respondToSkillPermission: mockRespondToSkillPermission,
  })),
}));

import { PermissionDialog } from "../PermissionDialog";

describe("PermissionDialog 人間可読UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPendingPermission = {
      executionId: "exec-001",
      requestId: "req-001",
      toolName: "Bash",
      args: { command: "ls -la" },
      reason: "ディレクトリ内容を確認するため",
    };
  });

  // ============================================================
  // 説明文表示テスト
  // ============================================================
  describe("人間可読説明文表示", () => {
    it("Bashコマンドの説明が表示される", () => {
      render(<PermissionDialog />);
      expect(
        screen.getByText("「ls -la」コマンドを実行します"),
      ).toBeInTheDocument();
    });

    it("Readファイルの説明が表示される", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Read",
        args: { file_path: "/tmp/file.txt" },
      };
      render(<PermissionDialog />);
      expect(
        screen.getByText("「/tmp/file.txt」ファイルを読み取ります"),
      ).toBeInTheDocument();
    });

    it("Writeファイルの説明が表示される", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Write",
        args: { file_path: "/tmp/output.txt" },
      };
      render(<PermissionDialog />);
      expect(
        screen.getByText("「/tmp/output.txt」ファイルに書き込みます"),
      ).toBeInTheDocument();
    });

    it("未定義ツールのデフォルト説明が表示される", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "CustomTool",
        args: { foo: "bar" },
      };
      render(<PermissionDialog />);
      expect(
        screen.getByText("「CustomTool」ツールの操作を実行します"),
      ).toBeInTheDocument();
    });

    it("WebSearchの説明が表示される", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "WebSearch",
        args: { query: "React hooks" },
      };
      render(<PermissionDialog />);
      expect(
        screen.getByText("「React hooks」で検索します"),
      ).toBeInTheDocument();
    });
  });

  // ============================================================
  // 詳細展開UIテスト
  // ============================================================
  describe("詳細展開UI", () => {
    it("デフォルトは展開状態（技術的詳細が表示、既存互換）", () => {
      render(<PermissionDialog />);
      expect(screen.getByText("詳細を隠す ▲")).toBeInTheDocument();
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("「詳細を隠す」クリックで折りたたまれる", () => {
      render(<PermissionDialog />);
      fireEvent.click(screen.getByText("詳細を隠す ▲"));
      expect(screen.getByText("詳細を表示 ▼")).toBeInTheDocument();
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });

    it("折りたたみ後に「詳細を表示」クリックで展開される", () => {
      render(<PermissionDialog />);
      fireEvent.click(screen.getByText("詳細を隠す ▲"));
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
      fireEvent.click(screen.getByText("詳細を表示 ▼"));
      expect(screen.getByRole("region")).toBeInTheDocument();
      expect(screen.getByText("詳細を隠す ▲")).toBeInTheDocument();
    });

    it("技術的詳細がデフォルト展開時にformatArgs出力を含む", () => {
      render(<PermissionDialog />);
      const region = screen.getByRole("region");
      expect(region).toBeInTheDocument();
      expect(region.querySelector("pre")).toBeInTheDocument();
    });

    it("連続クリックで状態が正しく切り替わる", () => {
      render(<PermissionDialog />);

      // デフォルト展開 → 5回クリック: 閉→開→閉→開→閉
      fireEvent.click(screen.getByText("詳細を隠す ▲"));
      expect(screen.getByText("詳細を表示 ▼")).toBeInTheDocument();
      fireEvent.click(screen.getByText("詳細を表示 ▼"));
      expect(screen.getByText("詳細を隠す ▲")).toBeInTheDocument();
      fireEvent.click(screen.getByText("詳細を隠す ▲"));
      expect(screen.getByText("詳細を表示 ▼")).toBeInTheDocument();
      fireEvent.click(screen.getByText("詳細を表示 ▼"));
      expect(screen.getByText("詳細を隠す ▲")).toBeInTheDocument();
      fireEvent.click(screen.getByText("詳細を隠す ▲"));
      expect(screen.getByText("詳細を表示 ▼")).toBeInTheDocument();
    });
  });

  // ============================================================
  // アクセシビリティテスト
  // ============================================================
  describe("アクセシビリティ", () => {
    it("aria-expanded属性がtrueで初期設定される（デフォルト展開）", () => {
      render(<PermissionDialog />);
      const toggleButton = screen.getByText("詳細を隠す ▲");
      expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    });

    it("折りたたみ後にaria-expanded属性がfalseになる", () => {
      render(<PermissionDialog />);
      fireEvent.click(screen.getByText("詳細を隠す ▲"));
      const collapsedButton = screen.getByText("詳細を表示 ▼");
      expect(collapsedButton).toHaveAttribute("aria-expanded", "false");
    });

    it("aria-controls属性が設定されている", () => {
      render(<PermissionDialog />);
      const toggleButton = screen.getByText("詳細を隠す ▲");
      expect(toggleButton).toHaveAttribute("aria-controls");
    });

    it("デフォルト展開時の詳細領域にrole=regionが設定されている", () => {
      render(<PermissionDialog />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("aria-controlsが詳細領域のIDを参照している", () => {
      render(<PermissionDialog />);
      const toggleButton = screen.getByText("詳細を隠す ▲");
      const controlsId = toggleButton.getAttribute("aria-controls");
      const region = screen.getByRole("region");
      expect(region.id).toBe(controlsId);
    });

    it("折りたたみボタンがフォーカス可能", () => {
      render(<PermissionDialog />);
      const toggleButton = screen.getByText("詳細を隠す ▲");
      toggleButton.focus();
      expect(document.activeElement).toBe(toggleButton);
    });
  });

  // ============================================================
  // エッジケーステスト
  // ============================================================
  describe("エッジケース", () => {
    it("長い説明文が正しく表示される", () => {
      const longCommand = "a".repeat(150);
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: longCommand },
      };
      render(<PermissionDialog />);
      // 100文字で切り詰めされた説明文が表示される
      expect(
        screen.getByText(`「${"a".repeat(100)}...」コマンドを実行します`),
      ).toBeInTheDocument();
    });

    it("空引数のツールでフォールバック説明が表示される", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: {},
      };
      render(<PermissionDialog />);
      expect(screen.getByText("コマンドを実行します")).toBeInTheDocument();
    });

    it("HTMLタグを含む引数が安全に表示される", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: "<script>alert(1)</script>" },
      };
      render(<PermissionDialog />);
      // ReactのJSXは自動エスケープする
      expect(
        screen.getByText("「<script>alert(1)</script>」コマンドを実行します"),
      ).toBeInTheDocument();
    });
  });
});
