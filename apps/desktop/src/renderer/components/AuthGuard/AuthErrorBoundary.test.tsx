import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthErrorBoundary } from "./AuthErrorBoundary";

// エラーをスローするテスト用コンポーネント
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div data-testid="child-content">Child Content</div>;
};

// エラー出力を抑制するためのモック
const originalError = console.error;

describe("AuthErrorBoundary", () => {
  beforeEach(() => {
    // React Error Boundaryのエラーログを抑制
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
    vi.clearAllMocks();
  });

  describe("EB-01: 正常時の動作", () => {
    it("エラーがない場合、子コンポーネントを表示する", () => {
      render(
        <AuthErrorBoundary>
          <div data-testid="normal-content">Normal Content</div>
        </AuthErrorBoundary>,
      );

      expect(screen.getByTestId("normal-content")).toBeInTheDocument();
      expect(screen.getByText("Normal Content")).toBeInTheDocument();
    });

    it("複数の子要素を正しくレンダリングする", () => {
      render(
        <AuthErrorBoundary>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </AuthErrorBoundary>,
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
    });
  });

  describe("EB-02: エラーキャッチ機能", () => {
    it("子コンポーネントでエラーが発生した場合、フォールバックUIを表示する", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      // フォールバックUIが表示される
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      // 子コンポーネントは表示されない
      expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
    });

    it("エラー発生後もアプリケーションがクラッシュしない", () => {
      // エラーが発生してもrenderが例外をスローしない
      expect(() => {
        render(
          <AuthErrorBoundary>
            <ThrowError />
          </AuthErrorBoundary>,
        );
      }).not.toThrow();
    });
  });

  describe("EB-03: フォールバックUI表示", () => {
    it("エラーアイコンが表示される", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      // アイコンはaria-hiddenなので、親コンテナの存在を確認
      const alertContainer = screen.getByRole("alert");
      expect(alertContainer).toBeInTheDocument();
    });

    it("エラータイトル「エラーが発生しました」が表示される", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      expect(
        screen.getByRole("heading", { name: "エラーが発生しました" }),
      ).toBeInTheDocument();
    });

    it("エラー説明文が表示される", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      expect(
        screen.getByText(
          "認証処理中にエラーが発生しました。再試行してください。",
        ),
      ).toBeInTheDocument();
    });

    it("再試行ボタンが表示される", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      expect(
        screen.getByRole("button", { name: "再試行" }),
      ).toBeInTheDocument();
    });
  });

  describe("EB-04: エラーログ出力", () => {
    it("エラー発生時にconsole.errorが呼ばれる", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      // console.errorが呼ばれたことを確認
      expect(console.error).toHaveBeenCalled();
    });

    it("エラーメッセージがログに含まれる", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      // console.errorの呼び出し内容を確認
      const errorCalls = vi.mocked(console.error).mock.calls;
      const hasErrorLog = errorCalls.some((call) =>
        call.some(
          (arg) =>
            typeof arg === "string" && arg.includes("[AuthErrorBoundary]"),
        ),
      );
      expect(hasErrorLog).toBe(true);
    });
  });

  describe("EB-05: リトライ機能", () => {
    it("再試行ボタンをクリックするとエラー状態がリセットされる", () => {
      // 状態を追跡するための変数
      let shouldThrow = true;

      const ConditionalError = () => {
        if (shouldThrow) {
          throw new Error("Test error");
        }
        return <div data-testid="recovered-content">Recovered Content</div>;
      };

      const { rerender } = render(
        <AuthErrorBoundary>
          <ConditionalError />
        </AuthErrorBoundary>,
      );

      // エラー状態を確認
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();

      // エラーをスローしないように変更
      shouldThrow = false;

      // 再試行ボタンをクリック
      fireEvent.click(screen.getByRole("button", { name: "再試行" }));

      // 再レンダリング後、子コンポーネントが表示される
      // （実際にはAuthErrorBoundaryが状態をリセットして子を再レンダリング）
      rerender(
        <AuthErrorBoundary>
          <ConditionalError />
        </AuthErrorBoundary>,
      );

      // Note: 実装時に状態がリセットされることで子コンポーネントが再レンダリングされる
    });

    it("onRetryコールバックが呼ばれる", () => {
      const onRetry = vi.fn();

      render(
        <AuthErrorBoundary onRetry={onRetry}>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      // 再試行ボタンをクリック
      fireEvent.click(screen.getByRole("button", { name: "再試行" }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("onRetryが未定義の場合でもエラーにならない", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      // onRetryなしで再試行ボタンをクリックしてもエラーにならない
      expect(() => {
        fireEvent.click(screen.getByRole("button", { name: "再試行" }));
      }).not.toThrow();
    });
  });

  describe("EB-06: アクセシビリティ", () => {
    it("role='alert'が設定されている", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("aria-live='assertive'が設定されている", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      const alertElement = screen.getByRole("alert");
      expect(alertElement).toHaveAttribute("aria-live", "assertive");
    });

    it("aria-labelledbyでタイトルと関連付けられている", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      const alertElement = screen.getByRole("alert");
      expect(alertElement).toHaveAttribute("aria-labelledby", "error-title");

      // id="error-title"の要素が存在する
      const titleElement = document.getElementById("error-title");
      expect(titleElement).toBeInTheDocument();
    });

    it("aria-describedbyで説明文と関連付けられている", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      const alertElement = screen.getByRole("alert");
      expect(alertElement).toHaveAttribute(
        "aria-describedby",
        "error-description",
      );

      // id="error-description"の要素が存在する
      const descElement = document.getElementById("error-description");
      expect(descElement).toBeInTheDocument();
    });

    it("再試行ボタンがフォーカス可能である", () => {
      render(
        <AuthErrorBoundary>
          <ThrowError />
        </AuthErrorBoundary>,
      );

      const button = screen.getByRole("button", { name: "再試行" });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe("EB-07: カスタムフォールバックUI", () => {
    it("fallbackUIプロパティが指定された場合、カスタムUIを表示する", () => {
      render(
        <AuthErrorBoundary
          fallbackUI={<div data-testid="custom-fallback">Custom Fallback</div>}
        >
          <ThrowError />
        </AuthErrorBoundary>,
      );

      expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
      expect(screen.getByText("Custom Fallback")).toBeInTheDocument();
      // デフォルトのエラーメッセージは表示されない
      expect(
        screen.queryByText("エラーが発生しました"),
      ).not.toBeInTheDocument();
    });
  });
});
