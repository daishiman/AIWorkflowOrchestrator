# T-01-4: 型定義設計書

## メタ情報

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| タスクID         | T-01-4                         |
| タスク名         | 型定義設計                     |
| 分類             | コード品質改善                 |
| 対象機能         | 認証関連コンポーネントの型定義 |
| 優先度           | 必須                           |
| ステータス       | 完了                           |
| 作成日           | 2025-12-09                     |
| 作成エージェント | @domain-modeler                |

---

## 1. 設計概要

### 1.1 目的

Phase 0で定義された要件（T-00-4）に基づき、型定義の厳密化設計を行う。

### 1.2 設計方針

1. **any型の排除**: `as unknown as`パターンを型ガードで置き換え
2. **型安全性**: コンパイル時のエラー検出を最大化
3. **Discriminated Union**: 状態の網羅性チェックを有効化
4. **型ガード**: 実行時の型チェックを型システムに統合

---

## 2. 型定義ファイル構成

### 2.1 新規ファイル作成

```
apps/desktop/src/renderer/components/AuthGuard/
├── index.tsx
├── AuthErrorBoundary.tsx
├── LoadingScreen.tsx
└── types.ts              # 新規作成
```

### 2.2 types.ts の内容

````typescript
// apps/desktop/src/renderer/components/AuthGuard/types.ts

import type { AuthUser } from "../../../../preload/types";

// ============================================================
// エクスポート型定義
// ============================================================

/**
 * 認証ガードの状態を表すDiscriminated Union
 *
 * 各状態の意味:
 * - checking: 認証状態を確認中
 * - authenticated: 認証済み（user情報を含む）
 * - unauthenticated: 未認証
 *
 * @example
 * ```typescript
 * const state: AuthGuardState = { status: "authenticated", user: currentUser };
 *
 * // switch文での網羅性チェック
 * switch (state.status) {
 *   case "checking":
 *     return <LoadingScreen />;
 *   case "authenticated":
 *     return children;
 *   case "unauthenticated":
 *     return <AuthView />;
 *   // TypeScriptがdefaultケースなしでも網羅的と判断
 * }
 * ```
 */
export type AuthGuardState =
  | { status: "checking" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };

/**
 * 認証エラーの型定義
 *
 * @example
 * ```typescript
 * const error: AuthError = {
 *   code: "NETWORK_ERROR",
 *   message: "ネットワーク接続を確認してください",
 *   originalError: new Error("fetch failed"),
 * };
 * ```
 */
export interface AuthError {
  /** エラーコード */
  code: AuthErrorCode;
  /** ユーザー向けエラーメッセージ */
  message: string;
  /** 元のエラーオブジェクト（デバッグ用） */
  originalError?: Error;
}

/**
 * 認証エラーコード
 *
 * - `NETWORK_ERROR`: ネットワーク接続の問題
 * - `AUTH_FAILED`: 認証処理の失敗
 * - `TIMEOUT`: リクエストのタイムアウト
 * - `SESSION_EXPIRED`: セッション有効期限切れ
 * - `PROVIDER_ERROR`: OAuthプロバイダーエラー
 * - `PROFILE_UPDATE_FAILED`: プロフィール更新失敗
 * - `LINK_PROVIDER_FAILED`: アカウント連携失敗
 * - `UNKNOWN`: 未分類のエラー
 */
export type AuthErrorCode =
  | "NETWORK_ERROR"
  | "AUTH_FAILED"
  | "TIMEOUT"
  | "SESSION_EXPIRED"
  | "PROVIDER_ERROR"
  | "PROFILE_UPDATE_FAILED"
  | "LINK_PROVIDER_FAILED"
  | "UNKNOWN";

// ============================================================
// 型ガード関数
// ============================================================

/**
 * 認証済み状態かどうかを判定する型ガード
 *
 * @param state - AuthGuardState
 * @returns 認証済みの場合true
 *
 * @example
 * ```typescript
 * if (isAuthenticated(state)) {
 *   // state.user にアクセス可能（型推論される）
 *   console.log(state.user.email);
 * }
 * ```
 */
export const isAuthenticated = (
  state: AuthGuardState,
): state is { status: "authenticated"; user: AuthUser } => {
  return state.status === "authenticated";
};

/**
 * 確認中状態かどうかを判定する型ガード
 *
 * @param state - AuthGuardState
 * @returns 確認中の場合true
 */
export const isChecking = (
  state: AuthGuardState,
): state is { status: "checking" } => {
  return state.status === "checking";
};

/**
 * 未認証状態かどうかを判定する型ガード
 *
 * @param state - AuthGuardState
 * @returns 未認証の場合true
 */
export const isUnauthenticated = (
  state: AuthGuardState,
): state is { status: "unauthenticated" } => {
  return state.status === "unauthenticated";
};

/**
 * Errorインスタンスかどうかを判定する型ガード
 *
 * @param error - unknown型のエラー
 * @returns Errorインスタンスの場合true
 *
 * @example
 * ```typescript
 * try {
 *   throw new Error("test");
 * } catch (e) {
 *   if (isError(e)) {
 *     console.log(e.message); // e は Error 型
 *   }
 * }
 * ```
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * expiresAtプロパティを持つオブジェクトかどうかを判定する型ガード
 *
 * @param obj - unknown型のオブジェクト
 * @returns expiresAtを持つ場合true
 *
 * @example
 * ```typescript
 * if (hasExpiresAt(event)) {
 *   const expiryTime = event.expiresAt; // number 型
 * }
 * ```
 */
export const hasExpiresAt = (obj: unknown): obj is { expiresAt: number } => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "expiresAt" in obj &&
    typeof (obj as Record<string, unknown>).expiresAt === "number"
  );
};

// ============================================================
// 網羅性チェックヘルパー
// ============================================================

/**
 * switch文の網羅性チェック用ヘルパー
 *
 * TypeScriptの網羅性チェックを活用し、
 * すべてのケースが処理されていることをコンパイル時に保証する。
 *
 * @param _value - never型（すべてのケースが処理された後の値）
 * @throws 実行時に到達した場合はエラー
 *
 * @example
 * ```typescript
 * switch (state.status) {
 *   case "checking":
 *     return <Loading />;
 *   case "authenticated":
 *     return <Dashboard />;
 *   case "unauthenticated":
 *     return <Login />;
 *   default:
 *     return assertNever(state);
 * }
 * ```
 */
export const assertNever = (_value: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(_value)}`);
};
````

---

## 3. authSlice.ts の修正設計

### 3.1 問題箇所の特定

```typescript
// 現在のコード（authSlice.ts:222-224）
const eventExpiresAt = (state as unknown as { expiresAt?: number }).expiresAt;
```

### 3.2 修正方法

```typescript
// 修正後のコード
import { hasExpiresAt } from "../components/AuthGuard/types";

// onAuthStateChanged コールバック内
const handleAuthStateChange = (state: AuthStateChangeEvent) => {
  // 型ガードを使用して安全にアクセス
  const eventExpiresAt = hasExpiresAt(state) ? state.expiresAt : undefined;

  // または、preload/types.ts の AuthStateChangeEvent を拡張
  // その場合は型ガード不要
};
```

### 3.3 代替案: preload/types.ts の拡張

```typescript
// apps/desktop/src/preload/types.ts

/**
 * 認証状態変更イベント
 */
export interface AuthStateChangeEvent {
  authenticated: boolean;
  user?: AuthUser;
  tokens?: unknown;
  isOffline?: boolean;
  expiresAt?: number; // 追加
}
```

**推奨**: preload/types.ts を拡張する方法を採用。型ガードは汎用的なケース用に残す。

---

## 4. AuthGuard での Discriminated Union 適用

### 4.1 現在の実装

```typescript
// 現在のコード
type AuthGuardState = "checking" | "authenticated" | "unauthenticated";

const getAuthState = (): AuthGuardState => {
  if (isLoading) return "checking";
  if (isAuthenticated) return "authenticated";
  return "unauthenticated";
};
```

### 4.2 修正後の実装

```typescript
// 修正後のコード
import type { AuthGuardState } from "./types";
import { isAuthenticated, isChecking, assertNever } from "./types";

const getAuthState = (): AuthGuardState => {
  if (isLoading) {
    return { status: "checking" };
  }
  if (user) {
    return { status: "authenticated", user };
  }
  return { status: "unauthenticated" };
};

// 使用例
const state = getAuthState();

switch (state.status) {
  case "checking":
    return fallback ?? <LoadingScreen />;
  case "authenticated":
    // state.user に型安全にアクセス可能
    return children;
  case "unauthenticated":
    return <AuthView />;
  default:
    return assertNever(state);
}
```

### 4.3 段階的移行

Discriminated Unionへの移行は破壊的変更となるため、以下の段階で実施:

1. **Phase 1**: 型ガード関数を追加（破壊的変更なし）
2. **Phase 2**: `as unknown as`を型ガードで置き換え
3. **Phase 3**: Discriminated Unionへ移行（オプション、関連コードの修正が必要）

本タスクでは **Phase 1〜2** を実施し、**Phase 3** は別タスクとする。

---

## 5. 型安全性チェックリスト

### 5.1 TSConfig strictモード確認

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 5.2 ESLint型関連ルール

```javascript
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error"
  }
}
```

---

## 6. 完了条件

- [x] types.ts ファイル構成が設計されている
- [x] AuthGuardState Discriminated Union が設計されている
- [x] 3つの型ガード関数（isAuthenticated, isError, hasExpiresAt）が設計されている
- [x] authSlice.ts の `as unknown as` 修正方法が設計されている
- [x] 段階的移行計画が策定されている

---

## 7. 関連ドキュメント

- 要件定義: `docs/30-workflows/code-quality-improvements/requirements-type-safety.md`
- Error Boundary設計: `docs/30-workflows/code-quality-improvements/design-error-boundary.md`
- テスト設計: Phase 2で作成予定
