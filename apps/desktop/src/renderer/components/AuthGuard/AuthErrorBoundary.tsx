import React, { Component, ErrorInfo, ReactNode } from "react";
import { GlassPanel } from "../organisms/GlassPanel";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

/**
 * AuthErrorBoundaryコンポーネントのProps
 */
export interface AuthErrorBoundaryProps {
  /** 子コンポーネント */
  children: ReactNode;

  /**
   * リトライ時のコールバック
   * @default undefined
   */
  onRetry?: () => void;

  /**
   * カスタムフォールバックUI
   * @default 内部デフォルトUI
   */
  fallbackUI?: ReactNode;
}

/**
 * AuthErrorBoundaryの内部状態
 */
interface AuthErrorBoundaryState {
  /** エラーが発生したかどうか */
  hasError: boolean;

  /** 発生したエラーオブジェクト */
  error: Error | null;

  /** エラー情報（React提供） */
  errorInfo: ErrorInfo | null;
}

/**
 * 初期状態
 */
const initialState: AuthErrorBoundaryState = {
  hasError: false,
  error: null,
  errorInfo: null,
};

/**
 * 認証コンポーネント用Error Boundary
 *
 * 認証関連のエラーをキャッチし、ユーザーフレンドリーなエラー画面を表示する。
 * React Error Boundaryパターンを使用して、子コンポーネントのエラーを捕捉。
 *
 * @component
 * @example
 * ```tsx
 * <AuthErrorBoundary onRetry={() => window.location.reload()}>
 *   <AuthGuard>
 *     <ProtectedContent />
 *   </AuthGuard>
 * </AuthErrorBoundary>
 * ```
 */
export class AuthErrorBoundary extends Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  static displayName = "AuthErrorBoundary";

  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = initialState;
  }

  /**
   * エラー発生時に状態を更新する静的メソッド
   *
   * @param error - 発生したエラー
   * @returns 新しい状態
   */
  static getDerivedStateFromError(
    error: Error,
  ): Partial<AuthErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * エラー情報をログに出力
   *
   * @param error - 発生したエラー
   * @param errorInfo - Reactのエラー情報（コンポーネントスタック等）
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // コンソールにエラーを出力
    console.error("[AuthErrorBoundary] Error caught:", error);
    console.error(
      "[AuthErrorBoundary] Component stack:",
      errorInfo.componentStack,
    );

    // 状態にエラー情報を保存
    this.setState({ errorInfo });

    // TODO: 将来的なエラーレポーティングサービスへの送信
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, {
    //     extra: {
    //       componentStack: errorInfo.componentStack,
    //       boundary: 'AuthErrorBoundary',
    //     },
    //   });
    // }
  }

  /**
   * 再試行ボタンのクリックハンドラー
   */
  handleRetry = (): void => {
    // 状態をリセット
    this.setState(initialState);

    // 親コンポーネントへのコールバック
    this.props.onRetry?.();
  };

  /**
   * フォールバックUIをレンダリング
   */
  renderFallback(): ReactNode {
    // カスタムフォールバックUIが指定されている場合
    if (this.props.fallbackUI) {
      return this.props.fallbackUI;
    }

    // デフォルトのフォールバックUI
    return (
      <div
        className="h-screen w-screen flex items-center justify-center bg-[var(--bg-primary)]"
        role="alert"
        aria-live="assertive"
        aria-labelledby="error-title"
        aria-describedby="error-description"
      >
        <GlassPanel radius="lg" blur="md" className="p-8 max-w-md">
          <div className="text-center space-y-4">
            <Icon
              name="alert-triangle"
              size={48}
              className="mx-auto text-red-400"
              aria-hidden="true"
            />
            <h2 id="error-title" className="text-xl font-semibold text-white">
              エラーが発生しました
            </h2>
            <p id="error-description" className="text-white/60 text-sm">
              認証処理中にエラーが発生しました。再試行してください。
            </p>
            <Button variant="primary" onClick={this.handleRetry} type="button">
              再試行
            </Button>
          </div>
        </GlassPanel>
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}
