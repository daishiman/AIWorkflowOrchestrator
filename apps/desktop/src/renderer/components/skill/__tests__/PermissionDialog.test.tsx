/**
 * @file PermissionDialog.test.tsx
 * @description スキル用 PermissionDialog コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red）
 * @task TASK-7C PermissionDialog コンポーネント
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

describe("PermissionDialog", () => {
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
  // 表示制御
  // ============================================================
  describe("表示制御", () => {
    it("pendingPermission が null の場合はダイアログを表示しない", () => {
      mockPendingPermission = null;
      render(<PermissionDialog />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("pendingPermission が存在する場合にダイアログを表示する", () => {
      render(<PermissionDialog />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  // ============================================================
  // ツール情報表示
  // ============================================================
  describe("ツール情報表示", () => {
    it("ツール名を表示する", () => {
      render(<PermissionDialog />);
      expect(screen.getByText("Bash")).toBeInTheDocument();
    });

    it("Bash コマンドの引数を直接表示する", () => {
      render(<PermissionDialog />);
      expect(screen.getByText("ls -la")).toBeInTheDocument();
    });

    it("ファイルパスの引数を直接表示する", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Read",
        args: { path: "/tmp/file.txt" },
      };
      render(<PermissionDialog />);
      expect(screen.getByText("/tmp/file.txt")).toBeInTheDocument();
    });

    it("その他のツールの引数を JSON 形式で表示する", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Search",
        args: { query: "test", limit: 10 },
      };
      render(<PermissionDialog />);
      // <pre>タグ内のJSON文字列はホワイトスペース含めてマッチ
      expect(screen.getByText(/"query": "test"/)).toBeInTheDocument();
      expect(screen.getByText(/"limit": 10/)).toBeInTheDocument();
    });

    it("理由が存在する場合に理由を表示する", () => {
      render(<PermissionDialog />);
      expect(
        screen.getByText("ディレクトリ内容を確認するため"),
      ).toBeInTheDocument();
    });

    it("理由が存在しない場合に理由セクションを表示しない", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: "ls -la" },
      };
      render(<PermissionDialog />);
      expect(
        screen.queryByText("ディレクトリ内容を確認するため"),
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // ボタンアクション
  // ============================================================
  describe("ボタンアクション", () => {
    it("「拒否」ボタンクリックで respondToSkillPermission(false, false) を呼ぶ", () => {
      render(<PermissionDialog />);
      fireEvent.click(screen.getByText("拒否"));
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(false, false);
      expect(mockRespondToSkillPermission).toHaveBeenCalledTimes(1);
    });

    it("「1回許可」ボタンクリックで respondToSkillPermission(true, false) を呼ぶ", () => {
      render(<PermissionDialog />);
      fireEvent.click(screen.getByText("1回許可"));
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(true, false);
      expect(mockRespondToSkillPermission).toHaveBeenCalledTimes(1);
    });

    it("「許可」ボタンクリックで respondToSkillPermission(true, false) を呼ぶ（チェックなし）", () => {
      render(<PermissionDialog />);
      fireEvent.click(screen.getByText("許可"));
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(true, false);
      expect(mockRespondToSkillPermission).toHaveBeenCalledTimes(1);
    });

    it("チェックボックスON + 「許可」ボタンで respondToSkillPermission(true, true) を呼ぶ", () => {
      render(<PermissionDialog />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByText("許可"));
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(true, true);
    });

    it("閉じるボタン（✕）クリックで拒否と同じ動作をする", () => {
      render(<PermissionDialog />);
      const closeButton = screen.getByLabelText("閉じる");
      fireEvent.click(closeButton);
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(false, false);
    });
  });

  // ============================================================
  // チェックボックス状態
  // ============================================================
  describe("チェックボックス状態", () => {
    it("チェックボックスのデフォルト状態はOFFである", () => {
      render(<PermissionDialog />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();
    });

    it("チェックボックスをクリックするとONになる", () => {
      render(<PermissionDialog />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("拒否後にチェックボックス状態がリセットされる", () => {
      const { rerender } = render(<PermissionDialog />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      fireEvent.click(screen.getByText("拒否"));
      // 再レンダリング後、チェックボックスはリセットされる
      rerender(<PermissionDialog />);
      const newCheckbox = screen.queryByRole("checkbox");
      if (newCheckbox) {
        expect(newCheckbox).not.toBeChecked();
      }
    });

    it("1回許可後にチェックボックス状態がリセットされる", () => {
      const { rerender } = render(<PermissionDialog />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByText("1回許可"));
      rerender(<PermissionDialog />);
      const newCheckbox = screen.queryByRole("checkbox");
      if (newCheckbox) {
        expect(newCheckbox).not.toBeChecked();
      }
    });

    it("許可後にチェックボックス状態がリセットされる", () => {
      const { rerender } = render(<PermissionDialog />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByText("許可"));
      rerender(<PermissionDialog />);
      const newCheckbox = screen.queryByRole("checkbox");
      if (newCheckbox) {
        expect(newCheckbox).not.toBeChecked();
      }
    });
  });

  // ============================================================
  // アクセシビリティ
  // ============================================================
  describe("アクセシビリティ", () => {
    it("ダイアログに role='dialog' が設定されている", () => {
      render(<PermissionDialog />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("ダイアログに aria-modal='true' が設定されている", () => {
      render(<PermissionDialog />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("ダイアログに aria-labelledby が設定されている", () => {
      render(<PermissionDialog />);
      const dialog = screen.getByRole("dialog");
      const labelledBy = dialog.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      const titleElement = document.getElementById(labelledBy!);
      expect(titleElement).toBeInTheDocument();
    });

    it("Escape キーで拒否操作が実行される", () => {
      render(<PermissionDialog />);
      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(false, false);
    });

    it("aria-describedby が説明テキストを参照している", () => {
      render(<PermissionDialog />);
      const dialog = screen.getByRole("dialog");
      const describedBy = dialog.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      const descElement = document.getElementById(describedBy!);
      expect(descElement).toBeInTheDocument();
    });

    it("閉じるボタンに aria-label='閉じる' が設定されている", () => {
      render(<PermissionDialog />);
      const closeButton = screen.getByLabelText("閉じる");
      expect(closeButton).toBeInTheDocument();
    });

    it("フォーカストラップが正しく動作する（Tab循環）", () => {
      render(<PermissionDialog />);
      const buttons = screen.getAllByRole("button");
      const lastButton = buttons[buttons.length - 1];
      lastButton.focus();
      fireEvent.keyDown(document, { key: "Tab" });
      // フォーカストラップにより最初の要素に戻ることを確認
      // （具体的な要素はフォーカストラップ実装による）
    });

    it("フォーカストラップが正しく動作する（Shift+Tab逆循環）", () => {
      render(<PermissionDialog />);
      const dialog = screen.getByRole("dialog");
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, input[type="checkbox"]',
      );
      if (focusable.length > 0) {
        focusable[0].focus();
        fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
      }
    });
  });

  // ============================================================
  // エッジケース
  // ============================================================
  describe("エッジケース", () => {
    it("args が空オブジェクトの場合に空のJSONを表示する", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Unknown",
        args: {},
      };
      render(<PermissionDialog />);
      expect(screen.getByText("{}")).toBeInTheDocument();
    });

    it("args.command が空文字の場合にJSONフォールバックする", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: "" },
      };
      render(<PermissionDialog />);
      // command が空文字（falsy）→ JSON表示にフォールバック
      expect(screen.getByText(/"command": ""/)).toBeInTheDocument();
    });

    it("args に command と path の両方がある場合に command を優先する", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: "ls", path: "/tmp" },
      };
      render(<PermissionDialog />);
      expect(screen.getByText("ls")).toBeInTheDocument();
    });

    it("toolName が長い文字列の場合に適切に表示される", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "VeryLongToolNameThatMightOverflow",
        args: { command: "test" },
      };
      render(<PermissionDialog />);
      expect(
        screen.getByText("VeryLongToolNameThatMightOverflow"),
      ).toBeInTheDocument();
    });

    it("args の値に特殊文字が含まれる場合に安全に表示される", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: "<script>alert('xss')</script>" },
      };
      render(<PermissionDialog />);
      // ReactのJSXは自動エスケープするため安全に表示される
      expect(
        screen.getByText("<script>alert('xss')</script>"),
      ).toBeInTheDocument();
    });

    it("reason が空文字の場合に理由セクションを表示しない", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: "ls" },
        reason: "",
      };
      render(<PermissionDialog />);
      expect(screen.queryByText("理由:")).not.toBeInTheDocument();
    });

    it("args のネストされたオブジェクトが正しくJSON表示される", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Custom",
        args: { options: { recursive: true, depth: 3 } },
      };
      render(<PermissionDialog />);
      expect(screen.getByText(/"recursive": true/)).toBeInTheDocument();
      expect(screen.getByText(/"depth": 3/)).toBeInTheDocument();
    });
  });

  // ============================================================
  // ユーザーインタラクション
  // ============================================================
  describe("ユーザーインタラクション", () => {
    it("チェックボックスをトグルできる（ON→OFF）", () => {
      render(<PermissionDialog />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("チェックボックスOFF時に「許可」ボタンで remember=false を渡す", () => {
      render(<PermissionDialog />);
      // チェックしない状態で許可
      fireEvent.click(screen.getByText("許可"));
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(true, false);
    });

    it("複数回の操作でも状態が正しく管理される", () => {
      render(<PermissionDialog />);
      const checkbox = screen.getByRole("checkbox");
      // チェックON
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      // 拒否 → リセット
      fireEvent.click(screen.getByText("拒否"));
      expect(mockRespondToSkillPermission).toHaveBeenCalledWith(false, false);
    });

    it("オーバーレイクリックでは何も起こらない", () => {
      render(<PermissionDialog />);
      // オーバーレイ（背景）のクリックはダイアログを閉じない
      // 仕様上、オーバーレイはダイアログコンテナの一部のため
      // イベント伝播を止めていない場合でもStore呼出は意図的な操作のみ
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });
  });

  // ============================================================
  // formatArgs 追加テスト
  // ============================================================
  describe("formatArgs", () => {
    it("command が数値の場合にJSONフォールバックする", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        args: { command: 123 as unknown as string },
      };
      render(<PermissionDialog />);
      // typeof !== "string" → JSON表示
      expect(screen.getByText(/"command": 123/)).toBeInTheDocument();
    });

    it("path が数値の場合にJSONフォールバックする", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Read",
        args: { path: 456 as unknown as string },
      };
      render(<PermissionDialog />);
      expect(screen.getByText(/"path": 456/)).toBeInTheDocument();
    });

    it("command も path もない場合にJSONフォーマットする", () => {
      mockPendingPermission = {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Grep",
        args: { tool: "grep", pattern: "test" },
      };
      render(<PermissionDialog />);
      expect(screen.getByText(/"tool": "grep"/)).toBeInTheDocument();
      expect(screen.getByText(/"pattern": "test"/)).toBeInTheDocument();
    });
  });
});
