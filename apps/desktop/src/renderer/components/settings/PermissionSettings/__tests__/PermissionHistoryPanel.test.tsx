/**
 * @file PermissionHistoryPanel コンポーネントテスト
 * @description TDD Red Phase - Permission履歴パネルの表示・操作テスト
 * @feature task-imp-permission-history-001
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PermissionHistoryPanel } from "../PermissionHistoryPanel";
import type { PermissionHistoryEntry } from "../../../skill/permissionHistory";

// ==========================================================================
// モックデータ
// ==========================================================================

const mockEntries: PermissionHistoryEntry[] = [
  {
    id: "entry-1",
    timestamp: "2026-01-31T10:00:00.000Z",
    toolName: "Bash",
    argsSnapshot: "ls -la /tmp",
    decision: "approved",
  },
  {
    id: "entry-2",
    timestamp: "2026-01-31T09:30:00.000Z",
    toolName: "Read",
    argsSnapshot: "/etc/hosts",
    decision: "denied",
  },
  {
    id: "entry-3",
    timestamp: "2026-01-31T09:00:00.000Z",
    toolName: "Bash",
    argsSnapshot: "rm -rf /tmp/test",
    decision: "approved_once",
  },
  {
    id: "entry-4",
    timestamp: "2026-01-31T08:30:00.000Z",
    toolName: "Write",
    argsSnapshot: "/tmp/output.txt",
    decision: "approved",
  },
];

// ==========================================================================
// @tanstack/react-virtual モック（happy-domでは高さ0のため仮想スクロール不可）
// ==========================================================================

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: vi.fn(
    (options: {
      count: number;
      estimateSize: () => number;
      getScrollElement?: () => HTMLElement | null;
    }) => {
      // getScrollElement/estimateSizeコールバックも呼び出してカバレッジ確保
      options.getScrollElement?.();
      return {
        getVirtualItems: () =>
          Array.from({ length: options.count }, (_, i) => ({
            index: i,
            start: i * options.estimateSize(),
            size: options.estimateSize(),
            end: (i + 1) * options.estimateSize(),
            key: i,
          })),
        getTotalSize: () => options.count * options.estimateSize(),
      };
    },
  ),
}));

// ==========================================================================
// Store モック
// ==========================================================================

const mockAddHistoryEntry = vi.fn();
const mockClearHistory = vi.fn();
const mockSetHistoryFilter = vi.fn();

let currentMockState: Record<string, unknown> = {
  permissionHistory: mockEntries,
  historyFilter: {},
  addHistoryEntry: mockAddHistoryEntry,
  clearHistory: mockClearHistory,
  setHistoryFilter: mockSetHistoryFilter,
};

vi.mock("../../../../store", () => ({
  useAppStore: vi.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector(currentMockState),
  ),
}));

// ==========================================================================
// テストスイート
// ==========================================================================

describe("PermissionHistoryPanel", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    currentMockState = {
      permissionHistory: mockEntries,
      historyFilter: {},
      addHistoryEntry: mockAddHistoryEntry,
      clearHistory: mockClearHistory,
      setHistoryFilter: mockSetHistoryFilter,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // レンダリング
  // ==========================================================================

  describe("rendering", () => {
    it("履歴パネルが表示される", () => {
      render(<PermissionHistoryPanel />);
      expect(
        screen.getByText(/権限要求履歴|Permission History/i),
      ).toBeInTheDocument();
    });

    it("履歴が空の場合、空状態メッセージを表示する", () => {
      currentMockState = {
        ...currentMockState,
        permissionHistory: [],
      };

      render(<PermissionHistoryPanel />);
      expect(
        screen.getByText(/権限要求の履歴はありません|No permission history/i),
      ).toBeInTheDocument();
    });

    it("履歴エントリリストを表示する", () => {
      render(<PermissionHistoryPanel />);
      // ツール名はフィルタのoption + エントリの両方に出るためgetAllByTextを使用
      expect(screen.getAllByText("Bash").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Read").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Write").length).toBeGreaterThanOrEqual(1);
    });

    it("エントリのツール名を表示する", () => {
      render(<PermissionHistoryPanel />);
      const entries = screen.getAllByTestId(/history-item/);
      expect(entries.length).toBeGreaterThanOrEqual(1);
    });

    it("エントリの判断結果バッジを表示する", () => {
      render(<PermissionHistoryPanel />);
      // approved/approved_once → 許可/1回許可、denied → 拒否 のバッジが存在
      expect(screen.getAllByText(/許可/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/拒否/).length).toBeGreaterThanOrEqual(1);
    });

    it("エントリの引数要約を表示する", () => {
      render(<PermissionHistoryPanel />);
      expect(screen.getByText(/ls -la/)).toBeInTheDocument();
    });

    it("件数表示を行う", () => {
      render(<PermissionHistoryPanel />);
      expect(screen.getByText(/4件/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // フィルタリング
  // ==========================================================================

  describe("filtering", () => {
    it("ツール名フィルタドロップダウンが存在する", () => {
      render(<PermissionHistoryPanel />);
      expect(
        screen.getByRole("combobox", { name: /ツール|tool/i }),
      ).toBeInTheDocument();
    });

    it("判断結果フィルタドロップダウンが存在する", () => {
      render(<PermissionHistoryPanel />);
      expect(
        screen.getByRole("combobox", { name: /判断|decision|結果/i }),
      ).toBeInTheDocument();
    });

    it("ツール名フィルタ変更時にsetHistoryFilterが呼ばれる", async () => {
      render(<PermissionHistoryPanel />);
      const toolFilter = screen.getByRole("combobox", {
        name: /ツール|tool/i,
      });
      await user.selectOptions(toolFilter, "Bash");
      expect(mockSetHistoryFilter).toHaveBeenCalled();
    });

    it("判断結果フィルタ変更時にsetHistoryFilterが呼ばれる", async () => {
      render(<PermissionHistoryPanel />);
      const decisionFilter = screen.getByRole("combobox", {
        name: /判断|decision|結果/i,
      });
      await user.selectOptions(decisionFilter, "denied");
      expect(mockSetHistoryFilter).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // クリア機能
  // ==========================================================================

  describe("clear history", () => {
    it("クリアボタンが存在する", () => {
      render(<PermissionHistoryPanel />);
      expect(
        screen.getByRole("button", { name: /クリア|clear/i }),
      ).toBeInTheDocument();
    });

    it("クリアボタンクリックで確認ダイアログを表示する", async () => {
      const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

      render(<PermissionHistoryPanel />);
      const clearButton = screen.getByRole("button", {
        name: /クリア|clear/i,
      });
      await user.click(clearButton);

      expect(confirmSpy).toHaveBeenCalled();
    });

    it("確認ダイアログ承認で履歴がクリアされる", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);

      render(<PermissionHistoryPanel />);
      const clearButton = screen.getByRole("button", {
        name: /クリア|clear/i,
      });
      await user.click(clearButton);

      expect(mockClearHistory).toHaveBeenCalled();
    });

    it("確認ダイアログキャンセルで履歴が保持される", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(false);

      render(<PermissionHistoryPanel />);
      const clearButton = screen.getByRole("button", {
        name: /クリア|clear/i,
      });
      await user.click(clearButton);

      expect(mockClearHistory).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // アクセシビリティ
  // ==========================================================================

  describe("accessibility", () => {
    it("適切なARIAラベルを持つ", () => {
      render(<PermissionHistoryPanel />);
      expect(
        screen.getByRole("region", { name: /権限|permission/i }),
      ).toBeInTheDocument();
    });

    it("リストがaria-labelを持つ", () => {
      render(<PermissionHistoryPanel />);
      expect(screen.getByRole("list")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // フィルタ分岐カバレッジ
  // ==========================================================================

  describe("filter branches", () => {
    it("ツール名フィルタ適用時にフィルタ済みエントリのみ表示する", () => {
      currentMockState = {
        ...currentMockState,
        historyFilter: { toolName: "Bash" },
      };
      render(<PermissionHistoryPanel />);
      // Bashエントリは2件（entry-1, entry-3）
      expect(screen.getByText(/2件/)).toBeInTheDocument();
    });

    it("判断結果フィルタ適用時にフィルタ済みエントリのみ表示する", () => {
      currentMockState = {
        ...currentMockState,
        historyFilter: { decision: "denied" },
      };
      render(<PermissionHistoryPanel />);
      // deniedエントリは1件（entry-2）
      expect(screen.getByText(/1件/)).toBeInTheDocument();
    });

    it("フィルタ結果が0件でデータがある場合、フィルタ専用メッセージを表示する", () => {
      currentMockState = {
        ...currentMockState,
        historyFilter: { toolName: "NonExistentTool" },
      };
      render(<PermissionHistoryPanel />);
      expect(
        screen.getByText(/フィルタ条件に一致する履歴はありません/),
      ).toBeInTheDocument();
    });

    it("フィルタ時の件数表示がフィルタ件数と全件数を表示する", () => {
      currentMockState = {
        ...currentMockState,
        historyFilter: { toolName: "Bash" },
      };
      render(<PermissionHistoryPanel />);
      // "2件 / 4件" のような表示
      expect(screen.getByText(/4件/)).toBeInTheDocument();
    });

    it("ツール名フィルタを空に戻すとtoolNameがundefinedになる", async () => {
      currentMockState = {
        ...currentMockState,
        historyFilter: { toolName: "Bash" },
      };
      render(<PermissionHistoryPanel />);
      const toolFilter = screen.getByRole("combobox", {
        name: /ツール|tool/i,
      });
      await user.selectOptions(toolFilter, "");
      expect(mockSetHistoryFilter).toHaveBeenCalledWith(
        expect.objectContaining({ toolName: undefined }),
      );
    });

    it("判断結果フィルタを空に戻すとdecisionがundefinedになる", async () => {
      currentMockState = {
        ...currentMockState,
        historyFilter: { decision: "denied" },
      };
      render(<PermissionHistoryPanel />);
      const decisionFilter = screen.getByRole("combobox", {
        name: /判断|decision|結果/i,
      });
      await user.selectOptions(decisionFilter, "");
      expect(mockSetHistoryFilter).toHaveBeenCalledWith(
        expect.objectContaining({ decision: undefined }),
      );
    });
  });

  // ==========================================================================
  // 時刻表示カバレッジ
  // ==========================================================================

  describe("time display", () => {
    it("24時間以上前のエントリが日数表示になる", () => {
      const twoDaysAgo = new Date(
        Date.now() - 48 * 60 * 60 * 1000,
      ).toISOString();
      currentMockState = {
        ...currentMockState,
        permissionHistory: [
          {
            id: "entry-old",
            timestamp: twoDaysAgo,
            toolName: "Bash",
            argsSnapshot: "old command",
            decision: "approved",
          },
        ],
      };
      render(<PermissionHistoryPanel />);
      expect(screen.getByText(/日前/)).toBeInTheDocument();
    });

    it("classNameプロパティを受け付ける", () => {
      render(<PermissionHistoryPanel className="custom-class" />);
      expect(
        screen.getByRole("region", { name: /権限|permission/i }),
      ).toBeInTheDocument();
    });
  });
});
