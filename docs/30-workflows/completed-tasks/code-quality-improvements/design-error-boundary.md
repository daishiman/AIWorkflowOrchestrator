# T-01-2: Error Boundary設計書

## メタ情報

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| タスクID         | T-01-2                         |
| タスク名         | Error Boundary設計             |
| 分類             | コード品質改善                 |
| 対象機能         | 認証コンポーネントのエラー境界 |
| 優先度           | 必須                           |
| ステータス       | 完了                           |
| 作成日           | 2025-12-09                     |
| 作成エージェント | @arch-police                   |

---

## 1. 設計概要

### 1.1 目的

Phase 0で定義された要件（T-00-2）に基づき、AuthErrorBoundaryコンポーネントの詳細設計を行う。

### 1.2 設計方針

1. **React Error Boundary パターン**: クラスコンポーネントとして実装
2. **一貫したUI**: 既存デザインシステム（GlassPanel、Button）を使用
3. **アクセシビリティ**: ARIA属性による適切なエラー通知
4. **拡張性**: 将来のエラーレポーティングサービス連携を考慮

---

## 2. コンポーネント設計

### 2.1 ファイル構成

```
apps/desktop/src/renderer/components/AuthGuard/
├── index.tsx                    # AuthGuardコンポーネント（既存）
├── AuthErrorBoundary.tsx        # 新規作成
├── AuthErrorBoundary.test.tsx   # 新規作成（Phase 2で作成）
├── LoadingScreen.tsx            # ローディング画面（既存）
└── types.ts                     # 型定義（新規作成 - T-01-4と共有）
```

### 2.2 Props定義

```typescript
/**
 * AuthErrorBoundaryコンポーネントのProps
 */
export interface AuthErrorBoundaryProps {
  /** 子コンポーネント */
  children: React.ReactNode;

  /**
   * リトライ時のコールバック
   * @default undefined
   */
  onRetry?: () => void;

  /**
   * カスタムフォールバックUI
   * @default 内部デフォルトUI
   */
  fallbackUI?: React.ReactNode;
}
```

### 2.3 State定義

```typescript
/**
 * AuthErrorBoundaryの内部状態
 */
interface AuthErrorBoundaryState {
  /** エラーが発生したかどうか */
  hasError: boolean;

  /** 発生したエラーオブジェクト */
  error: Error | null;

  /** エラー情報（React提供） */
  errorInfo: React.ErrorInfo | null;
}
```

### 2.4 初期状態

```typescript
const initialState: AuthErrorBoundaryState = {
  hasError: false,
  error: null,
  errorInfo: null,
};
```

---

## 3. コンポーネント実装設計

### 3.1 クラス構造

````typescript
import React, { Component, ErrorInfo, ReactNode } from "react";
import { GlassPanel } from "../../organisms/GlassPanel";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";

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
  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
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
    console.error("[AuthErrorBoundary] Component stack:", errorInfo.componentStack);

    // 状態にエラー情報を保存
    this.setState({ errorInfo });

    // TODO: 将来的なエラーレポーティングサービスへの送信
    // Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
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
        className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a]"
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
            <h2
              id="error-title"
              className="text-xl font-semibold text-white"
            >
              エラーが発生しました
            </h2>
            <p
              id="error-description"
              className="text-white/60 text-sm"
            >
              認証処理中にエラーが発生しました。再試行してください。
            </p>
            <Button
              variant="primary"
              onClick={this.handleRetry}
              type="button"
            >
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
````

---

## 4. フォールバックUI設計

### 4.1 レイアウト仕様

```
┌─────────────────────────────────────────────────────────────┐
│                      (フルスクリーン)                         │
│              bg-[#0a0a0a] (ダークグレー背景)                  │
│                                                             │
│    ┌─────────────────────────────────────────────────┐      │
│    │              GlassPanel (max-w-md)              │      │
│    │                                                 │      │
│    │            ⚠️ (alert-triangle)                 │      │
│    │              size=48px                         │      │
│    │              text-red-400                      │      │
│    │                                                 │      │
│    │         エラーが発生しました                    │      │
│    │         text-xl font-semibold text-white       │      │
│    │                                                 │      │
│    │   認証処理中にエラーが発生しました。            │      │
│    │   再試行してください。                          │      │
│    │         text-white/60 text-sm                  │      │
│    │                                                 │      │
│    │              ┌──────────┐                      │      │
│    │              │  再試行  │ Button primary      │      │
│    │              └──────────┘                      │      │
│    │                                                 │      │
│    └─────────────────────────────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 スタイル定義

| 要素       | クラス                                                            | 説明                     |
| ---------- | ----------------------------------------------------------------- | ------------------------ |
| コンテナ   | `h-screen w-screen flex items-center justify-center bg-[#0a0a0a]` | フルスクリーン、中央配置 |
| パネル     | `p-8 max-w-md`                                                    | パディング32px、最大幅md |
| コンテンツ | `text-center space-y-4`                                           | 中央寄せ、要素間16px     |
| アイコン   | `mx-auto text-red-400`                                            | 中央配置、赤色           |
| タイトル   | `text-xl font-semibold text-white`                                | 20px、セミボールド、白   |
| 説明       | `text-white/60 text-sm`                                           | 14px、60%透明度の白      |
| ボタン     | `variant="primary"`                                               | プライマリスタイル       |

### 4.3 アクセシビリティ属性

| 属性               | 値                  | 目的                           |
| ------------------ | ------------------- | ------------------------------ |
| `role`             | `alert`             | エラー領域であることを示す     |
| `aria-live`        | `assertive`         | 即座にスクリーンリーダーに通知 |
| `aria-labelledby`  | `error-title`       | タイトル要素との関連付け       |
| `aria-describedby` | `error-description` | 説明文との関連付け             |
| `aria-hidden`      | `true`              | アイコンを読み上げから除外     |

---

## 5. AuthGuardとの統合設計

### 5.1 統合方法

```typescript
// apps/desktop/src/renderer/components/AuthGuard/index.tsx

import { AuthErrorBoundary } from "./AuthErrorBoundary";

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  return (
    <AuthErrorBoundary onRetry={() => window.location.reload()}>
      {/* 既存の実装 */}
    </AuthErrorBoundary>
  );
};
```

### 5.2 エクスポート構成

```typescript
// apps/desktop/src/renderer/components/AuthGuard/index.tsx

export { AuthGuard } from "./AuthGuard";
export { AuthErrorBoundary } from "./AuthErrorBoundary";
export type { AuthGuardProps, AuthErrorBoundaryProps } from "./types";
```

---

## 6. エラーログ形式

### 6.1 コンソール出力形式

```
[AuthErrorBoundary] Error caught: Error: Some error message
    at ComponentName (file.tsx:123)
    at AnotherComponent (another.tsx:45)
    ...

[AuthErrorBoundary] Component stack:
    at AuthGuard
    at App
    at Provider
```

### 6.2 将来のエラーレポーティング拡張ポイント

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  // 現在: コンソール出力のみ
  console.error("[AuthErrorBoundary] Error caught:", error);

  // 将来: Sentryへの送信（コメントアウト状態で準備）
  // if (typeof Sentry !== 'undefined') {
  //   Sentry.captureException(error, {
  //     extra: {
  //       componentStack: errorInfo.componentStack,
  //       boundary: 'AuthErrorBoundary',
  //     },
  //   });
  // }
}
```

---

## 7. 完了条件

- [x] コンポーネント構造が設計されている
- [x] Props/State定義が完了している
- [x] フォールバックUIレイアウトが定義されている
- [x] アクセシビリティ要件が設計に含まれている
- [x] AuthGuardとの統合方法が設計されている
- [x] エラーログ形式が定義されている

---

## 8. 関連ドキュメント

- 要件定義: `docs/30-workflows/code-quality-improvements/requirements-error-boundary.md`
- 型定義設計: `docs/30-workflows/code-quality-improvements/design-type-definitions.md`
- テスト設計: Phase 2で作成予定
