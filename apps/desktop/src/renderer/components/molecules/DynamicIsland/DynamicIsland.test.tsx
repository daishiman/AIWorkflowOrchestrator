import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DynamicIsland } from "./index";

// Mock requestAnimationFrame
const mockRAF = vi.fn((cb: FrameRequestCallback) => {
  cb(0);
  return 0;
});

describe("DynamicIsland", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", mockRAF);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("レンダリング", () => {
    it("visible=falseで何も表示しない", () => {
      render(
        <DynamicIsland
          visible={false}
          status="processing"
          message="Loading..."
        />,
      );
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("visible=trueでステータスを表示する", async () => {
      render(
        <DynamicIsland
          visible={true}
          status="processing"
          message="Loading..."
        />,
      );

      // requestAnimationFrameをシミュレート
      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("メッセージを表示する", async () => {
      render(
        <DynamicIsland
          visible={true}
          status="processing"
          message="Loading..."
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("ステータス", () => {
    it("processing状態でスピナーを表示する", async () => {
      const { container } = render(
        <DynamicIsland
          visible={true}
          status="processing"
          message="Processing..."
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      // Spinnerコンポーネントはanimate-spinクラスを持つ
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("completed状態でチェックアイコンを表示する", async () => {
      const { container } = render(
        <DynamicIsland visible={true} status="completed" message="Done!" />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      // チェックアイコンはtext-green-400クラスを持つ
      const checkIcon = container.querySelector(".text-green-400");
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe("自動非表示", () => {
    it("completed状態でduration後に非表示になる", async () => {
      render(
        <DynamicIsland
          visible={true}
          status="completed"
          message="Done!"
          duration={3000}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(screen.getByRole("status")).toBeInTheDocument();

      // duration + アニメーション遅延を待つ
      await act(async () => {
        vi.advanceTimersByTime(3000 + 500);
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("processing状態では自動非表示にならない", async () => {
      render(
        <DynamicIsland
          visible={true}
          status="processing"
          message="Loading..."
          duration={3000}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("duration=0では自動非表示にならない", async () => {
      render(
        <DynamicIsland
          visible={true}
          status="completed"
          message="Done!"
          duration={0}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("visible変更", () => {
    it("visible=falseになるとアニメーション後に非表示", async () => {
      const { rerender } = render(
        <DynamicIsland
          visible={true}
          status="processing"
          message="Loading..."
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(screen.getByRole("status")).toBeInTheDocument();

      rerender(
        <DynamicIsland
          visible={false}
          status="processing"
          message="Loading..."
        />,
      );

      // アニメーション遅延を待つ
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("role=statusを持つ", async () => {
      render(
        <DynamicIsland
          visible={true}
          status="processing"
          message="Loading..."
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("aria-live=politeを持つ", async () => {
      render(
        <DynamicIsland
          visible={true}
          status="processing"
          message="Loading..."
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });

    it("aria-atomic=trueを持つ", async () => {
      render(
        <DynamicIsland
          visible={true}
          status="processing"
          message="Loading..."
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(16);
      });

      expect(screen.getByRole("status")).toHaveAttribute("aria-atomic", "true");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(DynamicIsland.displayName).toBe("DynamicIsland");
    });
  });
});
