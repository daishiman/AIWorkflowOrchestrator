import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WatcherStatus } from "./WatcherStatus";

describe("WatcherStatus", () => {
  const defaultProps = {
    isRunning: false,
    watchPath: null,
    onStart: vi.fn(),
    onStop: vi.fn(),
  };

  describe("表示", () => {
    it("停止状態を正しく表示する", () => {
      render(<WatcherStatus {...defaultProps} />);

      expect(screen.getByText("停止")).toBeInTheDocument();
      expect(screen.getByText("ファイル監視")).toBeInTheDocument();
    });

    it("実行状態を正しく表示する", () => {
      render(<WatcherStatus {...defaultProps} isRunning={true} />);

      expect(screen.getByText("監視中")).toBeInTheDocument();
    });

    it("監視パスを表示する", () => {
      render(
        <WatcherStatus {...defaultProps} watchPath="/Users/test/Documents" />,
      );

      expect(
        screen.getByText("監視パス: /Users/test/Documents"),
      ).toBeInTheDocument();
    });

    it("監視パスがnullの場合は表示しない", () => {
      render(<WatcherStatus {...defaultProps} />);

      expect(screen.queryByText(/監視パス:/)).not.toBeInTheDocument();
    });
  });

  describe("ボタン", () => {
    it("停止状態では開始ボタンを表示", () => {
      render(<WatcherStatus {...defaultProps} />);

      expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
    });

    it("実行状態では停止ボタンを表示", () => {
      render(<WatcherStatus {...defaultProps} isRunning={true} />);

      expect(screen.getByRole("button", { name: "停止" })).toBeInTheDocument();
    });

    it("開始ボタンクリックでonStartを呼ぶ", () => {
      const onStart = vi.fn();
      render(<WatcherStatus {...defaultProps} onStart={onStart} />);

      fireEvent.click(screen.getByRole("button", { name: "開始" }));

      expect(onStart).toHaveBeenCalledTimes(1);
    });

    it("停止ボタンクリックでonStopを呼ぶ", () => {
      const onStop = vi.fn();
      render(
        <WatcherStatus {...defaultProps} isRunning={true} onStop={onStop} />,
      );

      fireEvent.click(screen.getByRole("button", { name: "停止" }));

      expect(onStop).toHaveBeenCalledTimes(1);
    });
  });
});
