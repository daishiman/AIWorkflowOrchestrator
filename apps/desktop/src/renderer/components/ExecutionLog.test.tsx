import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExecutionLog } from "./ExecutionLog";

describe("ExecutionLog", () => {
  const mockLogs = [
    {
      id: "log-001",
      level: "info" as const,
      message: "Workflow started",
      createdAt: "2024-01-01T10:00:00.000Z",
    },
    {
      id: "log-002",
      level: "warn" as const,
      message: "Slow response detected",
      createdAt: "2024-01-01T10:00:01.000Z",
    },
    {
      id: "log-003",
      level: "error" as const,
      message: "Connection failed",
      createdAt: "2024-01-01T10:00:02.000Z",
    },
    {
      id: "log-004",
      level: "debug" as const,
      message: "Debug info",
      createdAt: "2024-01-01T10:00:03.000Z",
    },
  ];

  describe("表示", () => {
    it("ログエントリを表示する", () => {
      render(<ExecutionLog logs={mockLogs} />);

      expect(screen.getByText("Workflow started")).toBeInTheDocument();
      expect(screen.getByText("Slow response detected")).toBeInTheDocument();
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
      expect(screen.getByText("Debug info")).toBeInTheDocument();
    });

    it("空の場合はメッセージを表示する", () => {
      render(<ExecutionLog logs={[]} />);

      expect(screen.getByText("ログがありません")).toBeInTheDocument();
    });

    it("ローディング状態を表示する", () => {
      render(<ExecutionLog logs={[]} loading={true} />);

      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });
  });

  describe("ログレベル", () => {
    it("INFOレベルを表示する", () => {
      render(<ExecutionLog logs={[mockLogs[0]]} />);

      expect(screen.getByText("[info]")).toBeInTheDocument();
    });

    it("WARNレベルを表示する", () => {
      render(<ExecutionLog logs={[mockLogs[1]]} />);

      expect(screen.getByText("[warn]")).toBeInTheDocument();
    });

    it("ERRORレベルを表示する", () => {
      render(<ExecutionLog logs={[mockLogs[2]]} />);

      expect(screen.getByText("[error]")).toBeInTheDocument();
    });

    it("DEBUGレベルを表示する", () => {
      render(<ExecutionLog logs={[mockLogs[3]]} />);

      expect(screen.getByText("[debug]")).toBeInTheDocument();
    });
  });
});
