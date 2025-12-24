# T-00-4: 型定義厳密化要件定義書

## メタ情報

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| タスクID         | T-00-4                         |
| タスク名         | 型定義厳密化要件定義           |
| 分類             | コード品質改善                 |
| 対象機能         | 認証関連コンポーネントの型定義 |
| 優先度           | 必須                           |
| ステータス       | 完了                           |
| 作成日           | 2025-12-09                     |
| 作成エージェント | .claude/agents/req-analyst.md                   |

---

## 1. 背景

### 1.1 現状分析

対象ファイルの型定義状況を調査した結果：

| ファイル                   | 問題箇所        | 内容                     |
| -------------------------- | --------------- | ------------------------ |
| `authSlice.ts:222-224`     | `as unknown as` | expiresAtの型キャスト    |
| `AccountSection/index.tsx` | 暗黙的any       | 一部のイベントハンドラー |
| `AuthGuard/index.tsx`      | -               | 問題なし（型定義済み）   |
| `AuthView/index.tsx`       | -               | 問題なし                 |
| `ProviderIcon/index.tsx`   | -               | 問題なし                 |

### 1.2 問題点

1. **`as unknown as`の使用**: `authSlice.ts`で型安全性を無視したキャストがある

   ```typescript
   const eventExpiresAt = (state as unknown as { expiresAt?: number })
     .expiresAt;
   ```

2. **型ガードの未使用**: 状態の判別に型ガードが活用されていない

3. **Discriminated Unionの未活用**: `AuthGuardState`が単純なUnion型で、型の絞り込みが弱い

### 1.3 目的

TypeScriptの型システムを最大限活用し、コンパイル時にエラーを検出できるようにする。

---

## 2. 機能要件

### 2.1 CQ-TYPE-01: any型の排除

**要件ID**: CQ-TYPE-01
**優先度**: 必須

| 項目 | 内容                                       |
| ---- | ------------------------------------------ |
| 説明 | `any`型、`as unknown as`キャストを排除する |
| 対象 | `authSlice.ts`の該当箇所                   |
| 方法 | 適切な型定義またはType Assertionで置き換え |

**問題箇所**:

```typescript
// authSlice.ts:222-224
const eventExpiresAt = (state as unknown as { expiresAt?: number }).expiresAt;
```

**改善案**:

```typescript
// Option 1: 型を拡張
interface AuthStateChangeEvent {
  authenticated: boolean;
  user?: AuthUser;
  tokens?: unknown;
  isOffline?: boolean;
  expiresAt?: number; // 追加
}

// Option 2: 型ガードを使用
const hasExpiresAt = (obj: unknown): obj is { expiresAt: number } => {
  return typeof obj === "object" && obj !== null && "expiresAt" in obj;
};
```

**受け入れ基準**:

- [ ] `any`型が使用されていない
- [ ] `as unknown as`が使用されていない
- [ ] TypeScript strictモードでエラーがない

### 2.2 CQ-TYPE-02: unknown型の適切な使用

**要件ID**: CQ-TYPE-02
**優先度**: 必須

| 項目 | 内容                                                |
| ---- | --------------------------------------------------- |
| 説明 | 外部からの入力は`unknown`で受け、型ガードで絞り込む |
| 対象 | エラーハンドリング、イベントハンドラー              |
| 方法 | 型ガード関数の作成                                  |

**受け入れ基準**:

- [ ] catch節のエラーは`unknown`型で受ける
- [ ] `unknown`から具体的な型への変換に型ガードを使用する

### 2.3 CQ-TYPE-03: 型ガード関数の追加

**要件ID**: CQ-TYPE-03
**優先度**: 推奨

| 項目 | 内容                                     |
| ---- | ---------------------------------------- |
| 説明 | 状態や入力の判定に型ガード関数を使用する |
| 対象 | AuthGuardState、AuthError                |
| 効果 | 型の絞り込みが自動的に行われる           |

**作成する型ガード**:

```typescript
/**
 * 認証済み状態かどうかを判定する型ガード
 */
const isAuthenticated = (
  state: AuthGuardState,
): state is AuthGuardState & { status: "authenticated" } => {
  return state.status === "authenticated";
};

/**
 * エラーオブジェクトかどうかを判定する型ガード
 */
const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * expiresAtプロパティを持つかどうかを判定する型ガード
 */
const hasExpiresAt = (obj: unknown): obj is { expiresAt: number } => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "expiresAt" in obj &&
    typeof (obj as { expiresAt: unknown }).expiresAt === "number"
  );
};
```

**受け入れ基準**:

- [ ] `isAuthenticated`型ガードが実装されている
- [ ] `isError`型ガードが実装されている
- [ ] `hasExpiresAt`型ガードが実装されている
- [ ] 型ガードにユニットテストがある

### 2.4 CQ-TYPE-04: Discriminated Unionの活用

**要件ID**: CQ-TYPE-04
**優先度**: 推奨

| 項目 | 内容                                        |
| ---- | ------------------------------------------- |
| 説明 | 状態を表す型にDiscriminated Unionを使用する |
| 対象 | AuthGuardState                              |
| 効果 | switch文での網羅性チェックが可能になる      |

**現状**:

```typescript
type AuthGuardState = "checking" | "authenticated" | "unauthenticated";
```

**改善案**:

```typescript
/**
 * 認証ガードの状態を表すDiscriminated Union
 */
type AuthGuardState =
  | { status: "checking" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };
```

**メリット**:

1. 各状態に必要なデータを型レベルで強制できる
2. switch文での網羅性チェック（exhaustiveness check）が有効になる
3. 型の絞り込みが自動的に行われる

**受け入れ基準**:

- [ ] AuthGuardStateがDiscriminated Unionになっている
- [ ] 網羅性チェックが有効になっている
- [ ] 既存のコードが新しい型定義で動作する

---

## 3. any型使用箇所の詳細分析

### 3.1 authSlice.ts:222-224

**ファイル**: `apps/desktop/src/renderer/store/slices/authSlice.ts`
**行番号**: 222-224

**コード**:

```typescript
const eventExpiresAt = (state as unknown as { expiresAt?: number }).expiresAt;
```

**問題**:

- `state`の型が`onAuthStateChanged`のコールバック引数型と合っていない
- 無理やり型をキャストしている

**根本原因**:

- `onAuthStateChanged`イベントの型定義に`expiresAt`が含まれていない
- preload/types.tsの型定義が不完全

**改善方法**:

1. preload/types.tsの`AuthStateChangeEvent`型に`expiresAt`を追加
2. または型ガードを使用して安全にアクセス

---

## 4. 型定義ファイルの構成

### 4.1 新規ファイル

```
apps/desktop/src/renderer/components/AuthGuard/
├── index.tsx
├── LoadingScreen.tsx
└── types.ts         ← 新規作成
```

### 4.2 types.ts の内容

````typescript
import type { AuthUser } from "../../../../preload/types";

/**
 * 認証ガードの状態を表すDiscriminated Union
 *
 * 各状態の意味:
 * - checking: 認証状態を確認中
 * - authenticated: 認証済み（user情報を含む）
 * - unauthenticated: 未認証
 */
export type AuthGuardState =
  | { status: "checking" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };

/**
 * 認証エラーの型定義
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
  originalError?: Error;
}

/**
 * 認証エラーコード
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

/**
 * 認証済み状態かどうかを判定する型ガード
 *
 * @param state - AuthGuardState
 * @returns 認証済みの場合true
 *
 * @example
 * ```typescript
 * if (isAuthenticated(state)) {
 *   // state.user にアクセス可能
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
 * エラーオブジェクトかどうかを判定する型ガード
 *
 * @param error - unknown型のエラー
 * @returns Errorインスタンスの場合true
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * expiresAtプロパティを持つオブジェクトかどうかを判定する型ガード
 *
 * @param obj - unknown型のオブジェクト
 * @returns expiresAtを持つ場合true
 */
export const hasExpiresAt = (obj: unknown): obj is { expiresAt: number } => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "expiresAt" in obj &&
    typeof (obj as Record<string, unknown>).expiresAt === "number"
  );
};
````

---

## 5. 完了条件（受け入れ基準）

### 5.1 機能完了条件

- [ ] CQ-TYPE-01: `any`型、`as unknown as`が排除されている
- [ ] CQ-TYPE-02: `unknown`型が適切に使用されている
- [ ] CQ-TYPE-03: 型ガード関数が3つ以上実装されている
- [ ] CQ-TYPE-04: AuthGuardStateがDiscriminated Unionになっている（推奨）

### 5.2 品質完了条件

- [ ] TypeScript strictモードでエラーがない
- [ ] ESLint `@typescript-eslint/no-explicit-any`違反がない
- [ ] 型ガード関数にユニットテストがある

### 5.3 テストケース

| テストID | 関数              | 入力                                       | 期待結果 |
| -------- | ----------------- | ------------------------------------------ | -------- |
| TYPE-01  | `isAuthenticated` | `{ status: "authenticated", user: {...} }` | `true`   |
| TYPE-02  | `isAuthenticated` | `{ status: "checking" }`                   | `false`  |
| TYPE-03  | `isAuthenticated` | `{ status: "unauthenticated" }`            | `false`  |
| TYPE-04  | `isError`         | `new Error("test")`                        | `true`   |
| TYPE-05  | `isError`         | `"string error"`                           | `false`  |
| TYPE-06  | `isError`         | `null`                                     | `false`  |
| TYPE-07  | `hasExpiresAt`    | `{ expiresAt: 12345 }`                     | `true`   |
| TYPE-08  | `hasExpiresAt`    | `{ other: "value" }`                       | `false`  |
| TYPE-09  | `hasExpiresAt`    | `null`                                     | `false`  |

---

## 6. 実装上の注意点

### 6.1 Discriminated Union導入時の影響

AuthGuardStateをDiscriminated Unionに変更する場合、以下の影響がある：

1. **AuthGuard/index.tsx**: `getAuthState`関数の戻り値型が変わる
2. **関連コンポーネント**: 状態の比較方法が変わる

**移行方法**:

```typescript
// Before
const authState = getAuthState(); // "checking" | "authenticated" | ...
if (authState === "authenticated") { ... }

// After
const authState = getAuthState(); // { status: "..." }
if (authState.status === "authenticated") { ... }
// または
if (isAuthenticated(authState)) { ... }
```

### 6.2 段階的導入

1. まず型ガード関数を追加（破壊的変更なし）
2. `as unknown as`を型ガードで置き換え
3. Discriminated Unionへの移行（オプション）

---

## 7. 参照情報

### 7.1 関連ドキュメント

- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#type-guards)
- `docs/30-workflows/code-quality-improvements/task-login-only-auth-code-quality.md`

### 7.2 関連タスク

- T-01-4: 型定義設計
- T-02-2: 型ガードテスト作成
- T-03-4: 型定義実装

### 7.3 既存コード参照

- `apps/desktop/src/renderer/store/slices/authSlice.ts`
- `apps/desktop/src/renderer/components/AuthGuard/index.tsx`
- `apps/desktop/src/preload/types.ts` - preload型定義
