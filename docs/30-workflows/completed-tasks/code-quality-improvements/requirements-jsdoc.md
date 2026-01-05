# T-00-1: JSDoc要件定義書

## メタ情報

| 項目             | 内容                   |
| ---------------- | ---------------------- |
| タスクID         | T-00-1                 |
| タスク名         | JSDoc要件定義          |
| 分類             | コード品質改善         |
| 対象機能         | 認証関連コンポーネント |
| 優先度           | 必須                   |
| ステータス       | 完了                   |
| 作成日           | 2025-12-09             |
| 作成エージェント | .claude/agents/req-analyst.md           |

---

## 1. 背景

### 1.1 現状分析

対象ファイルの現状JSDocコメント状況を調査した結果：

| ファイル                      | 現状                                        | 評価 |
| ----------------------------- | ------------------------------------------- | ---- |
| `AuthGuard/index.tsx`         | コンポーネントに基本JSDocあり、関数にはなし | △    |
| `AuthGuard/LoadingScreen.tsx` | 基本JSDocのみ                               | △    |
| `AuthView/index.tsx`          | 基本JSDocあり                               | △    |
| `AccountSection/index.tsx`    | 基本JSDocあり、詳細なし                     | △    |
| `ProviderIcon/index.tsx`      | Propsに部分的JSDocあり                      | △    |

### 1.2 問題点

1. **@example タグの欠如**: 使用例が記載されておらず、コンポーネントの使い方が分かりにくい
2. **内部関数のドキュメント不足**: `getAuthState`等の内部関数にドキュメントがない
3. **Propsの説明が不完全**: 一部のPropsに説明がない
4. **戻り値の明示不足**: 関数の戻り値が明示されていない

---

## 2. 対象ファイル一覧

### 2.1 主要対象ファイル（5件）

| #   | ファイルパス                                                              | 種別           | 優先度 |
| --- | ------------------------------------------------------------------------- | -------------- | ------ |
| 1   | `apps/desktop/src/renderer/components/AuthGuard/index.tsx`                | コンポーネント | 必須   |
| 2   | `apps/desktop/src/renderer/components/AuthGuard/LoadingScreen.tsx`        | コンポーネント | 必須   |
| 3   | `apps/desktop/src/renderer/views/AuthView/index.tsx`                      | ビュー         | 必須   |
| 4   | `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx` | コンポーネント | 必須   |
| 5   | `apps/desktop/src/renderer/components/atoms/ProviderIcon/index.tsx`       | コンポーネント | 必須   |

### 2.2 追加対象ファイル（関連）

| #   | ファイルパス                                          | 種別  | 優先度 |
| --- | ----------------------------------------------------- | ----- | ------ |
| 6   | `apps/desktop/src/renderer/store/slices/authSlice.ts` | Store | 推奨   |

---

## 3. JSDocコメント形式要件

### 3.1 コンポーネント用JSDoc形式（CQ-DOC-01）

**要件ID**: CQ-DOC-01
**優先度**: 必須

````typescript
/**
 * コンポーネント名（日本語で簡潔な説明）
 *
 * より詳細な説明（複数行可）
 * - 主な機能や役割
 * - 状態による挙動の違い
 *
 * @component
 * @example
 * ```tsx
 * // 基本的な使用例
 * <ComponentName prop1="value" />
 *
 * // オプションを使用した例
 * <ComponentName
 *   prop1="value"
 *   optionalProp={customValue}
 * />
 * ```
 */
````

### 3.2 Props/Interface用JSDoc形式（CQ-DOC-02）

**要件ID**: CQ-DOC-02
**優先度**: 必須

```typescript
/**
 * コンポーネントのProps定義
 */
export interface ComponentProps {
  /** プロパティの説明（必須項目） */
  requiredProp: string;

  /**
   * オプショナルプロパティの説明
   * @default デフォルト値（ある場合）
   */
  optionalProp?: number;
}
```

### 3.3 関数用JSDoc形式（CQ-DOC-03）

**要件ID**: CQ-DOC-03
**優先度**: 必須

````typescript
/**
 * 関数の説明（何をするか）
 *
 * @param paramName - パラメータの説明
 * @returns 戻り値の説明
 * @throws エラーの説明（該当する場合）
 *
 * @example
 * ```typescript
 * const result = functionName(param);
 * // result: 期待される結果
 * ```
 */
````

### 3.4 型定義用JSDoc形式（CQ-DOC-04）

**要件ID**: CQ-DOC-04
**優先度**: 推奨

```typescript
/**
 * 型の説明
 *
 * 各状態の意味:
 * - `value1`: 状態1の説明
 * - `value2`: 状態2の説明
 */
type TypeName = "value1" | "value2" | "value3";
```

---

## 4. ファイル別要件

### 4.1 AuthGuard/index.tsx

| 対象                       | 現状                 | 要件                         | 優先度 |
| -------------------------- | -------------------- | ---------------------------- | ------ |
| `AuthGuardState` 型        | コメントなし→あり    | 各状態の意味を追加           | 必須   |
| `AuthGuardProps`           | 基本的なコメントあり | @example追加                 | 推奨   |
| `AuthGuard` コンポーネント | 基本的なコメントあり | @componentタグ、@example追加 | 必須   |
| `getAuthState` 関数        | コメントなし         | @param、@returns追加         | 必須   |

### 4.2 AuthGuard/LoadingScreen.tsx

| 対象                           | 現状            | 要件                     | 優先度 |
| ------------------------------ | --------------- | ------------------------ | ------ |
| `LoadingScreen` コンポーネント | 1行コメントのみ | @component、詳細説明追加 | 必須   |

### 4.3 AuthView/index.tsx

| 対象                      | 現状                 | 要件             | 優先度 |
| ------------------------- | -------------------- | ---------------- | ------ |
| `AuthViewProps`           | 基本的なコメントあり | そのまま維持     | -      |
| `ProviderConfig`          | コメントなし         | 追加             | 推奨   |
| `PROVIDERS` 定数          | コメントなし         | 追加             | 推奨   |
| `AuthView` コンポーネント | 基本的なコメントあり | @example追加     | 推奨   |
| `handleLogin` 関数        | コメントなし         | @param、説明追加 | 推奨   |
| `handleCloseError` 関数   | コメントなし         | 説明追加         | 推奨   |

### 4.4 AccountSection/index.tsx

| 対象                            | 現状                 | 要件                     | 優先度 |
| ------------------------------- | -------------------- | ------------------------ | ------ |
| `AccountSectionProps`           | コメントなし         | 追加                     | 必須   |
| `AuthResultType`                | コメントなし         | 追加                     | 必須   |
| `PROVIDERS` 定数                | コメントなし         | 追加                     | 推奨   |
| `AccountSection` コンポーネント | 基本的なコメントあり | @component、@example追加 | 必須   |
| 各ハンドラー関数                | コメントなし         | 重要なもののみ追加       | 推奨   |

### 4.5 ProviderIcon/index.tsx

| 対象                          | 現状                 | 要件         | 優先度 |
| ----------------------------- | -------------------- | ------------ | ------ |
| `ProviderIconProps`           | 部分的にあり         | そのまま維持 | -      |
| `ProviderIcon` コンポーネント | 基本的なコメントあり | @example追加 | 推奨   |

---

## 5. 完了条件（受け入れ基準）

### 5.1 必須条件

- [ ] 全5ファイルにコンポーネントレベルのJSDocがある
- [ ] すべてのパブリックProps Interfaceにドキュメントがある
- [ ] すべてのパブリック関数に@param、@returnsがある
- [ ] 最低1つの@exampleがコンポーネントごとにある

### 5.2 推奨条件

- [ ] 内部型定義にもドキュメントがある
- [ ] 複雑なロジックに説明コメントがある
- [ ] 定数配列（PROVIDERS等）に説明がある

### 5.3 検証方法

```bash
# TypeScript/ESLintでJSDocの構文エラーがないことを確認
pnpm --filter @repo/desktop lint

# JSDocの存在確認（手動レビュー）
# 各ファイルをエディタで開き、要件を満たしているか確認
```

---

## 6. JSDocサンプル（AuthGuard用）

### 6.1 AuthGuard完成イメージ

````typescript
/**
 * 認証ガードの内部状態を表す型
 *
 * 各状態の意味:
 * - `checking`: 認証状態を確認中（ローディング）
 * - `authenticated`: 認証済み（子コンポーネントを表示）
 * - `unauthenticated`: 未認証（ログイン画面を表示）
 */
type AuthGuardState = "checking" | "authenticated" | "unauthenticated";

/**
 * AuthGuardコンポーネントのProps
 */
export interface AuthGuardProps {
  /** 認証済み時に表示する子コンポーネント */
  children: React.ReactNode;

  /**
   * ローディング中に表示するカスタムコンポーネント
   * @default LoadingScreen
   */
  fallback?: React.ReactNode;
}

/**
 * 認証ガードコンポーネント
 *
 * アプリケーションへのアクセスを認証状態に基づいて制御する。
 * 認証状態に応じて以下のように表示を切り替える:
 * - checking: ローディング画面（またはカスタムfallback）
 * - authenticated: 子コンポーネント
 * - unauthenticated: ログイン画面（AuthView）
 *
 * @component
 * @example
 * ```tsx
 * // 基本的な使用方法
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * // カスタムローディング画面を使用
 * <AuthGuard fallback={<CustomLoader />}>
 *   <Dashboard />
 * </AuthGuard>
 * ```
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  // ...
};

/**
 * 現在の認証状態を判定する
 *
 * @returns 現在のAuthGuardState
 */
const getAuthState = (): AuthGuardState => {
  // ...
};
````

---

## 7. 参照情報

### 7.1 関連ドキュメント

- [JSDoc公式ドキュメント](https://jsdoc.app/)
- [TypeScript JSDocリファレンス](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- `docs/30-workflows/code-quality-improvements/task-login-only-auth-code-quality.md`

### 7.2 関連タスク

- T-01-1: JSDocコメント設計
- T-03-1: JSDocコメント実装
