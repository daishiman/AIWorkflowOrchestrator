/**
 * PermissionDialog リスクバッジ統合テスト
 *
 * TASK: task-imp-permission-tool-metadata-001
 * Phase 4: TDD Red - PermissionDialogのリスクバッジ表示テスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { PermissionDialog } from "../PermissionDialog";

// Store mock
let mockPendingPermission: {
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
} | null = null;
const mockRespondToSkillPermission = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: vi.fn(() => ({
    pendingPermission: mockPendingPermission,
    respondToSkillPermission: mockRespondToSkillPermission,
  })),
}));

describe("PermissionDialog リスクバッジ統合テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPendingPermission = {
      toolName: "Bash",
      args: { command: "ls -la" },
    };
  });

  describe("リスクバッジ表示", () => {
    it("Bashツールでリスクバッジ「High」が表示される", () => {
      mockPendingPermission = {
        toolName: "Bash",
        args: { command: "ls -la" },
      };
      render(<PermissionDialog />);
      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("Readツールでリスクバッジ「Low」が表示される", () => {
      mockPendingPermission = {
        toolName: "Read",
        args: { file_path: "/tmp/test.txt" },
      };
      render(<PermissionDialog />);
      expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("Writeツールでリスクバッジ「Medium」が表示される", () => {
      mockPendingPermission = {
        toolName: "Write",
        args: { file_path: "/tmp/test.txt" },
      };
      render(<PermissionDialog />);
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    it("未定義ツールでリスクバッジ「Medium」が表示される（デフォルト）", () => {
      mockPendingPermission = {
        toolName: "UnknownTool",
        args: {},
      };
      render(<PermissionDialog />);
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });
  });

  describe("色分けテスト", () => {
    it("Lowリスクのバッジに緑色系クラスが適用されている", () => {
      mockPendingPermission = {
        toolName: "Read",
        args: { file_path: "/tmp/test.txt" },
      };
      render(<PermissionDialog />);
      const badge = screen.getByText("Low");
      expect(badge.className).toContain("bg-green-100");
      expect(badge.className).toContain("text-green-800");
      expect(badge.className).toContain("border-green-200");
    });

    it("Mediumリスクのバッジに黄色系クラスが適用されている", () => {
      mockPendingPermission = {
        toolName: "Write",
        args: { file_path: "/tmp/test.txt" },
      };
      render(<PermissionDialog />);
      const badge = screen.getByText("Medium");
      expect(badge.className).toContain("bg-yellow-100");
      expect(badge.className).toContain("text-yellow-800");
      expect(badge.className).toContain("border-yellow-200");
    });

    it("Highリスクのバッジにオレンジ色系クラスが適用されている", () => {
      mockPendingPermission = {
        toolName: "Bash",
        args: { command: "ls -la" },
      };
      render(<PermissionDialog />);
      const badge = screen.getByText("High");
      expect(badge.className).toContain("bg-orange-100");
      expect(badge.className).toContain("text-orange-800");
      expect(badge.className).toContain("border-orange-200");
    });
  });

  describe("セキュリティ影響テキスト表示", () => {
    it("Bashのセキュリティ影響テキストが表示される", () => {
      mockPendingPermission = {
        toolName: "Bash",
        args: { command: "ls -la" },
      };
      render(<PermissionDialog />);
      expect(
        screen.getByText(
          "システムコマンドを実行します。任意のコード実行が可能です",
        ),
      ).toBeInTheDocument();
    });

    it("Readのセキュリティ影響テキストが表示される", () => {
      mockPendingPermission = {
        toolName: "Read",
        args: { file_path: "/tmp/test.txt" },
      };
      render(<PermissionDialog />);
      expect(
        screen.getByText("ファイルの内容を読み取ります"),
      ).toBeInTheDocument();
    });

    it("未定義ツールのデフォルトセキュリティ影響テキストが表示される", () => {
      mockPendingPermission = {
        toolName: "UnknownTool",
        args: {},
      };
      render(<PermissionDialog />);
      expect(screen.getByText("ツールを実行します")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("リスクバッジにaria-labelが設定されている", () => {
      mockPendingPermission = {
        toolName: "Bash",
        args: { command: "ls -la" },
      };
      render(<PermissionDialog />);
      const badge = screen.getByText("High");
      expect(badge).toHaveAttribute("aria-label", "リスクレベル: High");
    });

    it("Lowリスクバッジのaria-labelが正しい", () => {
      mockPendingPermission = {
        toolName: "Read",
        args: { file_path: "/tmp/test.txt" },
      };
      render(<PermissionDialog />);
      const badge = screen.getByText("Low");
      expect(badge).toHaveAttribute("aria-label", "リスクレベル: Low");
    });
  });

  describe("既存機能の回帰テスト", () => {
    it("3ボタン（拒否/1回許可/許可）が表示される", () => {
      render(<PermissionDialog />);
      expect(screen.getByText("拒否")).toBeInTheDocument();
      expect(screen.getByText("1回許可")).toBeInTheDocument();
      expect(screen.getByText("許可")).toBeInTheDocument();
    });

    it("人間可読説明文が表示される", () => {
      mockPendingPermission = {
        toolName: "Bash",
        args: { command: "ls -la" },
      };
      render(<PermissionDialog />);
      expect(
        screen.getByText("「ls -la」コマンドを実行します"),
      ).toBeInTheDocument();
    });

    it("詳細展開/折りたたみが動作する", () => {
      render(<PermissionDialog />);
      // 初期状態は展開
      expect(screen.getByText("詳細を隠す ▲")).toBeInTheDocument();
      // 折りたたむ
      fireEvent.click(screen.getByText("詳細を隠す ▲"));
      expect(screen.getByText("詳細を表示 ▼")).toBeInTheDocument();
    });

    it("拒否ボタンがrespondToSkillPermission(false, false)を呼ぶ", () => {
      render(<PermissionDialog />);
      fireEvent.click(screen.getByText("拒否"));
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(false, false);
    });

    it("1回許可ボタンがrespondToSkillPermission(true, false)を呼ぶ", () => {
      render(<PermissionDialog />);
      fireEvent.click(screen.getByText("1回許可"));
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(true, false);
    });

    it("許可ボタンがrespondToSkillPermission(true, false)を呼ぶ（rememberChoice未チェック時）", () => {
      render(<PermissionDialog />);
      fireEvent.click(screen.getByText("許可"));
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(true, false);
    });

    it("チェックボックスが表示される", () => {
      render(<PermissionDialog />);
      expect(
        screen.getByText("このセッション中は同様の操作を自動許可する"),
      ).toBeInTheDocument();
    });
  });
});
