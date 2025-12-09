# コード品質改善タスク仕様書

## タスク概要

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| タスク名   | login-only-auth コード品質強化                                |
| 対象機能   | 認証画面（AuthView/AuthGuard/AccountSection）のコード品質向上 |
| 優先度     | 中                                                            |
| 見積もり   | 小規模                                                        |
| ステータス | 未実施                                                        |

## 背景と目的

Phase 5.5 Final Review Gate において、`@code-quality` エージェントによるコード品質レビューで以下の改善点が指摘された：

1. **JSDoc コメント不足**
2. **Error Boundary 未実装**
3. **エラーハンドリングの改善余地**
4. **型定義の厳密化**

これらの改善を行い、コードの保守性と可読性を向上させる。

## 実施方針

### フェーズ構成

```
Phase 1: 要件定義・設計
Phase 2: JSDoc コメント追加
Phase 3: Error Boundary 実装
Phase 4: エラーハンドリング改善
Phase 5: 型定義の厳密化
Phase 6: コードレビュー・検証
```

## Phase 1: 要件定義・設計

### 1.1 JSDoc コメント要件

#### 機能要件

| ID        | 要件                            | 優先度 |
| --------- | ------------------------------- | ------ |
| CQ-DOC-01 | 全パブリック関数にJSDocコメント | 必須   |
| CQ-DOC-02 | 全コンポーネントに概要コメント  | 必須   |
| CQ-DOC-03 | 複雑なロジックに説明コメント    | 推奨   |
| CQ-DOC-04 | @param, @returns タグの使用     | 必須   |

#### 対象ファイル

- `apps/desktop/src/renderer/components/AuthGuard/index.tsx`
- `apps/desktop/src/renderer/components/AuthGuard/LoadingScreen.tsx`
- `apps/desktop/src/renderer/views/AuthView/index.tsx`
- `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`
- `apps/desktop/src/renderer/components/atoms/ProviderIcon/index.tsx`

#### 設計例

````typescript
/**
 * 認証ガードコンポーネント
 *
 * アプリケーションへのアクセスを認証状態に基づいて制御する。
 * - checking: ローディング画面を表示
 * - authenticated: 子コンポーネントを表示
 * - unauthenticated: ログイン画面を表示
 *
 * @component
 * @example
 * ```tsx
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 * ```
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  // ...
};

/**
 * 認証状態を判定する
 *
 * @param isLoading - 読み込み中フラグ
 * @param isAuthenticated - 認証済みフラグ
 * @returns 現在の認証状態
 */
const getAuthState = (
  isLoading: boolean,
  isAuthenticated: boolean,
): AuthGuardState => {
  if (isLoading) return "checking";
  if (isAuthenticated) return "authenticated";
  return "unauthenticated";
};
````

### 1.2 Error Boundary 要件

#### 機能要件

| ID       | 要件                               | 優先度 |
| -------- | ---------------------------------- | ------ |
| CQ-EB-01 | 認証コンポーネント用Error Boundary | 必須   |
| CQ-EB-02 | エラー時のフォールバックUI         | 必須   |
| CQ-EB-03 | エラーログ出力                     | 必須   |
| CQ-EB-04 | リトライ機能                       | 推奨   |

#### 設計

```typescript
// apps/desktop/src/renderer/components/AuthGuard/AuthErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { GlassPanel } from "../organisms/GlassPanel";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 認証コンポーネント用Error Boundary
 *
 * 認証関連のエラーをキャッチし、ユーザーフレンドリーなエラー画面を表示する。
 *
 * @component
 */
export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[AuthErrorBoundary] Error caught:", error, errorInfo);
    // 将来的にはエラーレポーティングサービスに送信
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a]">
          <GlassPanel radius="lg" blur="md" className="p-8 max-w-md">
            <div className="text-center space-y-4">
              <Icon name="alert-triangle" size={48} className="mx-auto text-red-400" />
              <h2 className="text-xl font-semibold text-white">
                エラーが発生しました
              </h2>
              <p className="text-white/60 text-sm">
                認証処理中にエラーが発生しました。再試行してください。
              </p>
              <Button variant="primary" onClick={this.handleRetry}>
                再試行
              </Button>
            </div>
          </GlassPanel>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 1.3 エラーハンドリング改善要件

#### 機能要件

| ID        | 要件                             | 優先度 |
| --------- | -------------------------------- | ------ |
| CQ-ERR-01 | try-catch ブロックの適切な使用   | 必須   |
| CQ-ERR-02 | エラーメッセージの日本語化       | 必須   |
| CQ-ERR-03 | エラー種別ごとの処理分岐         | 推奨   |
| CQ-ERR-04 | ユーザーへの適切なフィードバック | 必須   |

#### 設計

```typescript
// apps/desktop/src/renderer/store/slices/authSlice.ts
// エラーハンドリング改善例

const handleAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    // 既知のエラータイプを判別
    if (error.message.includes("network")) {
      return "ネットワーク接続を確認してください";
    }
    if (error.message.includes("unauthorized")) {
      return "認証に失敗しました。再度ログインしてください";
    }
    if (error.message.includes("timeout")) {
      return "接続がタイムアウトしました。再試行してください";
    }
    return error.message;
  }
  return "予期しないエラーが発生しました";
};

// 使用例
login: async (provider) => {
  set({ isLoading: true, authError: null });
  try {
    await window.electronAPI.auth.login(provider);
  } catch (error) {
    const errorMessage = handleAuthError(error);
    set({ authError: errorMessage, isLoading: false });
  }
},
```

### 1.4 型定義厳密化要件

#### 機能要件

| ID         | 要件                       | 優先度 |
| ---------- | -------------------------- | ------ |
| CQ-TYPE-01 | any型の排除                | 必須   |
| CQ-TYPE-02 | unknown型の適切な使用      | 必須   |
| CQ-TYPE-03 | 型ガード関数の追加         | 推奨   |
| CQ-TYPE-04 | Discriminated Union の活用 | 推奨   |

#### 設計

```typescript
// apps/desktop/src/renderer/components/AuthGuard/types.ts

/**
 * 認証状態の判別型
 */
export type AuthGuardState =
  | { status: "checking" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };

/**
 * 型ガード: 認証済み状態かどうか
 */
export const isAuthenticated = (
  state: AuthGuardState,
): state is { status: "authenticated"; user: AuthUser } => {
  return state.status === "authenticated";
};

/**
 * 認証エラーの型定義
 */
export interface AuthError {
  code: "NETWORK_ERROR" | "AUTH_FAILED" | "TIMEOUT" | "UNKNOWN";
  message: string;
  originalError?: Error;
}
```

## Phase 2: JSDoc コメント追加

### 2.1 実装手順

1. 各コンポーネントファイルを開く
2. コンポーネント定義にJSDocコメントを追加
3. パブリック関数に@param, @returnsを追加
4. 型定義にドキュメントを追加

### 2.2 チェックリスト

- [ ] AuthGuard/index.tsx にJSDoc追加
- [ ] AuthGuard/LoadingScreen.tsx にJSDoc追加
- [ ] AuthView/index.tsx にJSDoc追加
- [ ] AccountSection/index.tsx にJSDoc追加
- [ ] ProviderIcon/index.tsx にJSDoc追加
- [ ] 型定義ファイルにJSDoc追加

## Phase 3: Error Boundary 実装

### 3.1 ファイル構成

```
apps/desktop/src/renderer/components/AuthGuard/
├── index.tsx
├── AuthErrorBoundary.tsx     # 新規追加
├── AuthErrorBoundary.test.tsx # 新規追加
├── LoadingScreen.tsx
└── types.ts
```

### 3.2 実装手順

1. `AuthErrorBoundary.tsx` を作成
2. テストファイルを作成
3. `AuthGuard/index.tsx` でError Boundaryを使用
4. エラー発生時のフォールバックUIを確認

### 3.3 テストケース

| テストID | シナリオ                     | 期待結果               |
| -------- | ---------------------------- | ---------------------- |
| EB-01    | 子コンポーネントでエラー発生 | フォールバックUI表示   |
| EB-02    | 再試行ボタンクリック         | エラー状態リセット     |
| EB-03    | エラーログ出力               | コンソールにエラー記録 |

## Phase 4: エラーハンドリング改善

### 4.1 実装手順

1. `handleAuthError` ヘルパー関数を作成
2. authSlice内のエラー処理を統一
3. エラーメッセージの日本語化
4. ユーザーフィードバックの改善

### 4.2 チェックリスト

- [ ] login関数のエラーハンドリング
- [ ] logout関数のエラーハンドリング
- [ ] updateProfile関数のエラーハンドリング
- [ ] linkProvider関数のエラーハンドリング
- [ ] initializeAuth関数のエラーハンドリング

## Phase 5: 型定義の厳密化

### 5.1 実装手順

1. any型の使用箇所を特定
2. 適切な型に置き換え
3. 型ガード関数を追加
4. Discriminated Unionの活用

### 5.2 チェックリスト

- [ ] authSlice.ts の型見直し
- [ ] AuthGuard/types.ts の型追加
- [ ] preload/types.ts との整合性確認

## Phase 6: コードレビュー・検証

### 6.1 検証項目

| 項目               | 検証方法             | 担当エージェント |
| ------------------ | -------------------- | ---------------- |
| JSDoc品質          | コードレビュー       | @code-quality    |
| Error Boundary動作 | 単体テスト           | @unit-tester     |
| 型安全性           | TypeScript厳密モード | @code-quality    |
| エラーメッセージ   | UIレビュー           | @ui-designer     |

### 6.2 コード品質レビュー

```bash
# コード品質レビュー実行コマンド
/ai:analyze-code-quality apps/desktop/src/renderer/components/AuthGuard
/ai:analyze-code-quality apps/desktop/src/renderer/views/AuthView
```

## 完了条件

- [ ] 全対象ファイルにJSDocコメントが追加されている
- [ ] AuthErrorBoundary が実装されテストが通過している
- [ ] エラーハンドリングが統一され日本語化されている
- [ ] any型が排除されている
- [ ] `@code-quality` レビューで PASS 評価

## 関連ドキュメント

- `docs/30-workflows/login-only-auth/design-auth-guard.md`
- `docs/30-workflows/login-only-auth/design-auth-view.md`
- `apps/desktop/src/renderer/store/slices/authSlice.ts`
