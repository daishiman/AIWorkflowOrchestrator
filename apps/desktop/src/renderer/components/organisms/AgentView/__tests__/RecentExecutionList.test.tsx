/**
 * RecentExecutionList コンポーネントテスト（TASK-UI-03 Phase 4 - TDD Red）
 *
 * P39対策: happy-dom環境では userEvent 使用禁止。fireEvent のみ使用。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
// P39対策: userEvent は使用しない

// Red状態: コンポーネントはまだ実装されていない
import { RecentExecutionList } from "../RecentExecutionList";

/**
 * 実行サマリ型（Phase 5で agentSlice に追加予定）
 */
interface ExecutionSummary {
  executionId: string;
  skillName: string;
  skillDisplayName: string;
  status: "completed" | "failed" | "executing" | "cancelled";
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
}

describe("RecentExecutionList", () => {
  const createExecution = (
    id: string,
    status: ExecutionSummary["status"] = "completed",
    minutesAgo: number = 2,
  ): ExecutionSummary => ({
    executionId: id,
    skillName: `skill-${id}`,
    skillDisplayName: `スキル ${id}`,
    status,
    startedAt: new Date(Date.now() - minutesAgo * 60_000),
    completedAt:
      status === "executing"
        ? null
        : new Date(Date.now() - (minutesAgo - 1) * 60_000),
    duration: status === "executing" ? null : 60_000,
  });

  const defaultProps = {
    executions: [] as ExecutionSummary[],
    onSelectExecution: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("最大3件の表示（5件入力 -> 3件表示）", () => {
    const executions = [
      createExecution("1", "completed", 1),
      createExecution("2", "completed", 2),
      createExecution("3", "completed", 3),
      createExecution("4", "completed", 4),
      createExecution("5", "completed", 5),
    ];

    render(<RecentExecutionList {...defaultProps} executions={executions} />);

    const items = screen.getAllByTestId(/^execution-item-/);
    expect(items).toHaveLength(3);
  });

  it("空リストのメッセージ（「まだ実行履歴がありません」）", () => {
    render(<RecentExecutionList {...defaultProps} executions={[]} />);

    expect(screen.getByText("まだ実行履歴がありません")).toBeInTheDocument();
  });

  it("エントリクリックで onSelectExecution 発火", async () => {
    const onSelectExecution = vi.fn();
    const executions = [createExecution("1")];

    render(
      <RecentExecutionList
        {...defaultProps}
        executions={executions}
        onSelectExecution={onSelectExecution}
      />,
    );

    const item = screen.getByTestId("execution-item-1");
    await act(async () => {
      fireEvent.click(item);
    });

    expect(onSelectExecution).toHaveBeenCalledWith("1");
  });

  it("ステータスアイコンの表示（completed->check, failed->x, executing->spinner）", () => {
    const executions = [
      createExecution("1", "completed", 1),
      createExecution("2", "failed", 2),
      createExecution("3", "executing", 3),
    ];

    render(<RecentExecutionList {...defaultProps} executions={executions} />);

    expect(screen.getByTestId("status-icon-completed")).toBeInTheDocument();
    expect(screen.getByTestId("status-icon-failed")).toBeInTheDocument();
    expect(screen.getByTestId("status-icon-executing")).toBeInTheDocument();
  });

  it("相対時間の表示（「2分前」形式）", () => {
    const executions = [createExecution("1", "completed", 2)];

    render(<RecentExecutionList {...defaultProps} executions={executions} />);

    // 「2分前」のような相対時間テキストが表示されること
    expect(screen.getByText(/\d+分前/)).toBeInTheDocument();
  });

  // === Phase 6: テスト拡充 ===

  describe("境界値テスト", () => {
    it("maxItems=1 で1件のみ表示", () => {
      const executions = [
        createExecution("1", "completed", 1),
        createExecution("2", "completed", 2),
        createExecution("3", "completed", 3),
      ];

      render(
        <RecentExecutionList
          {...defaultProps}
          executions={executions}
          maxItems={1}
        />,
      );

      const items = screen.getAllByTestId(/^execution-item-/);
      expect(items).toHaveLength(1);
    });

    it("startedAtが現在時刻に近い場合（「たった今」表示）", () => {
      const recentExecution: ExecutionSummary = {
        executionId: "recent-1",
        skillName: "skill-recent",
        skillDisplayName: "最近のスキル",
        status: "completed",
        startedAt: new Date(Date.now() - 10_000), // 10秒前
        completedAt: new Date(),
        duration: 10_000,
      };

      render(
        <RecentExecutionList
          {...defaultProps}
          executions={[recentExecution]}
        />,
      );

      expect(screen.getByText("たった今")).toBeInTheDocument();
    });

    it("startedAtが24時間以上前（「X日前」表示）", () => {
      const oldExecution: ExecutionSummary = {
        executionId: "old-1",
        skillName: "skill-old",
        skillDisplayName: "古いスキル",
        status: "completed",
        startedAt: new Date(Date.now() - 25 * 60 * 60_000), // 25時間前
        completedAt: new Date(Date.now() - 24 * 60 * 60_000),
        duration: 60_000,
      };

      render(
        <RecentExecutionList {...defaultProps} executions={[oldExecution]} />,
      );

      expect(screen.getByText(/\d+日前/)).toBeInTheDocument();
    });

    it("durationがnullの場合でもクラッシュしない", () => {
      const executionNoDuration: ExecutionSummary = {
        executionId: "no-dur-1",
        skillName: "skill-no-dur",
        skillDisplayName: "実行中スキル",
        status: "executing",
        startedAt: new Date(Date.now() - 60_000),
        completedAt: null,
        duration: null,
      };

      expect(() => {
        render(
          <RecentExecutionList
            {...defaultProps}
            executions={[executionNoDuration]}
          />,
        );
      }).not.toThrow();
    });
  });

  describe("組み合わせテスト", () => {
    it("cancelledステータスのアイコン表示", () => {
      const executions = [createExecution("1", "cancelled", 1)];

      render(<RecentExecutionList {...defaultProps} executions={executions} />);

      expect(screen.getByTestId("status-icon-cancelled")).toBeInTheDocument();
    });

    it("キーボード操作（Enter）でonSelectExecution発火", async () => {
      const onSelectExecution = vi.fn();
      const executions = [createExecution("1")];

      render(
        <RecentExecutionList
          {...defaultProps}
          executions={executions}
          onSelectExecution={onSelectExecution}
        />,
      );

      const item = screen.getByTestId("execution-item-1");
      await act(async () => {
        fireEvent.keyDown(item, { key: "Enter", code: "Enter" });
      });

      expect(onSelectExecution).toHaveBeenCalledWith("1");
    });
  });
});
