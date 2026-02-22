import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { RelativeTime } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

describe("RelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-22T12:00:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  describe("auto フォーマット（デフォルト）", () => {
    it("1分未満は「たった今」と表示する", () => {
      const timestamp = new Date(Date.now() - 30 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} />);
      expect(screen.getByText("たった今")).toBeInTheDocument();
    });

    it("5分前は「5分前」と表示する", () => {
      const timestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} />);
      expect(screen.getByText("5分前")).toBeInTheDocument();
    });

    it("3時間前は「3時間前」と表示する", () => {
      const timestamp = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} />);
      expect(screen.getByText("3時間前")).toBeInTheDocument();
    });

    it("3日前は「3日前」と表示する", () => {
      const timestamp = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      render(<RelativeTime timestamp={timestamp} />);
      expect(screen.getByText("3日前")).toBeInTheDocument();
    });

    it("10日前は「YYYY/MM/DD」形式で表示する", () => {
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const timestamp = date.toISOString();
      render(<RelativeTime timestamp={timestamp} />);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      expect(screen.getByText(`${y}/${m}/${d}`)).toBeInTheDocument();
    });
  });

  describe("short フォーマット", () => {
    it("1分未満は「今」と表示する", () => {
      const timestamp = new Date(Date.now() - 30 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} format="short" />);
      expect(screen.getByText("今")).toBeInTheDocument();
    });

    it("5分前は「5m」と表示する", () => {
      const timestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} format="short" />);
      expect(screen.getByText("5m")).toBeInTheDocument();
    });

    it("3時間前は「3h」と表示する", () => {
      const timestamp = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} format="short" />);
      expect(screen.getByText("3h")).toBeInTheDocument();
    });

    it("3日前は「3d」と表示する", () => {
      const timestamp = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      render(<RelativeTime timestamp={timestamp} format="short" />);
      expect(screen.getByText("3d")).toBeInTheDocument();
    });

    it("10日前は「MM/DD」形式で表示する", () => {
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const timestamp = date.toISOString();
      render(<RelativeTime timestamp={timestamp} format="short" />);
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      expect(screen.getByText(`${m}/${d}`)).toBeInTheDocument();
    });
  });

  describe("long フォーマット", () => {
    it("1分未満は「たった今」と表示する", () => {
      const timestamp = new Date(Date.now() - 30 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} format="long" />);
      expect(screen.getByText("たった今")).toBeInTheDocument();
    });

    it("5分前は「5分前」と表示する", () => {
      const timestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} format="long" />);
      expect(screen.getByText("5分前")).toBeInTheDocument();
    });

    it("3時間前は「3時間前」と表示する", () => {
      const timestamp = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} format="long" />);
      expect(screen.getByText("3時間前")).toBeInTheDocument();
    });

    it("30時間前は「昨日」と表示する", () => {
      const timestamp = new Date(
        Date.now() - 30 * 60 * 60 * 1000,
      ).toISOString();
      render(<RelativeTime timestamp={timestamp} format="long" />);
      expect(screen.getByText("昨日")).toBeInTheDocument();
    });

    it("3日前は「3日前」と表示する", () => {
      const timestamp = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000,
      ).toISOString();
      render(<RelativeTime timestamp={timestamp} format="long" />);
      expect(screen.getByText("3日前")).toBeInTheDocument();
    });

    it("10日前は「YYYY年MM月DD日」形式で表示する", () => {
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const timestamp = date.toISOString();
      render(<RelativeTime timestamp={timestamp} format="long" />);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      expect(screen.getByText(`${y}年${m}月${d}日`)).toBeInTheDocument();
    });
  });

  describe("自動更新・クリーンアップ", () => {
    it("デフォルト間隔(60000ms)で表示が更新される", () => {
      const timestamp = new Date(Date.now() - 59 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} />);
      expect(screen.getByText("たった今")).toBeInTheDocument();

      // 60秒進める → 合計119秒前 → 「1分前」に変わる
      act(() => {
        vi.advanceTimersByTime(60000);
      });
      expect(screen.getByText("1分前")).toBeInTheDocument();
    });

    it("カスタムrefreshIntervalで表示が更新される", () => {
      const timestamp = new Date(Date.now() - 59 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} refreshInterval={30000} />);
      expect(screen.getByText("たった今")).toBeInTheDocument();

      // 30秒進める → 合計89秒前 → 「1分前」に変わる
      act(() => {
        vi.advanceTimersByTime(30000);
      });
      expect(screen.getByText("1分前")).toBeInTheDocument();
    });

    it("アンマウント時にclearIntervalが呼び出される", () => {
      const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
      const timestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { unmount } = render(<RelativeTime timestamp={timestamp} />);

      unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe("HTML要素・属性", () => {
    it("<time>要素としてレンダリングする", () => {
      const timestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} />);
      const el = screen.getByText("5分前");
      expect(el.tagName).toBe("TIME");
    });

    it("datetime属性にISO 8601形式の値を設定する", () => {
      const timestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      render(<RelativeTime timestamp={timestamp} />);
      const el = screen.getByText("5分前");
      expect(el).toHaveAttribute("datetime", timestamp);
    });

    it("showAbsoluteOnHover=true（デフォルト）でtitleに絶対時刻を設定する", () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      const timestamp = date.toISOString();
      render(<RelativeTime timestamp={timestamp} />);
      const el = screen.getByText("5分前");
      // ローカルタイムゾーンでの期待値を動的に計算
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const h = String(date.getHours()).padStart(2, "0");
      const min = String(date.getMinutes()).padStart(2, "0");
      const sec = String(date.getSeconds()).padStart(2, "0");
      const expected = `${y}/${m}/${d} ${h}:${min}:${sec}`;
      expect(el).toHaveAttribute("title", expected);
    });

    it("showAbsoluteOnHover=falseでtitle属性を設定しない", () => {
      const timestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      render(
        <RelativeTime timestamp={timestamp} showAbsoluteOnHover={false} />,
      );
      const el = screen.getByText("5分前");
      expect(el).not.toHaveAttribute("title");
    });
  });

  describe("エラーハンドリング", () => {
    it("空文字列のタイムスタンプでフォールバック表示する", () => {
      render(<RelativeTime timestamp="" />);
      expect(screen.getByText("\u2014")).toBeInTheDocument();
    });

    it("不正形式のタイムスタンプでフォールバック表示する", () => {
      render(<RelativeTime timestamp="invalid-date" />);
      expect(screen.getByText("\u2014")).toBeInTheDocument();
    });
  });

  describe("テーマ", () => {
    it("3テーマでレンダリングエラーなし", () => {
      const timestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const results = renderWithAllThemes(
        <RelativeTime timestamp={timestamp} />,
      );
      expect(results["kanagawa-dragon"]).toBeDefined();
      expect(results["light"]).toBeDefined();
      expect(results["dark"]).toBeDefined();
    });
  });
});
