# T-01-1: JSDocコメント設計書

## メタ情報

| 項目             | 内容                   |
| ---------------- | ---------------------- |
| タスクID         | T-01-1                 |
| タスク名         | JSDocコメント設計      |
| 分類             | コード品質改善         |
| 対象機能         | 認証関連コンポーネント |
| 優先度           | 必須                   |
| ステータス       | 完了                   |
| 作成日           | 2025-12-09             |
| 作成エージェント | .claude/agents/api-doc-writer.md        |

---

## 1. 設計概要

### 1.1 目的

Phase 0で定義された要件（T-00-1）に基づき、JSDocコメントの具体的な設計を行う。

### 1.2 設計方針

1. **一貫性**: 全ファイルで統一されたJSDoc形式を使用
2. **実用性**: @exampleタグで実際の使用例を提供
3. **保守性**: 変更に強い最小限のドキュメント
4. **日本語優先**: 説明文は日本語で記述

---

## 2. JSDocテンプレート設計

### 2.1 コンポーネント用テンプレート

````typescript
/**
 * コンポーネント名（日本語で簡潔な説明）
 *
 * 詳細な説明（1-3行）:
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

### 2.2 Props/Interface用テンプレート

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

### 2.3 関数用テンプレート

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

### 2.4 型定義用テンプレート

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

## 3. ファイル別設計

### 3.1 AuthGuard/index.tsx

#### 型定義: AuthGuardState

```typescript
/**
 * 認証ガードの内部状態を表す型
 *
 * 各状態の意味:
 * - `checking`: 認証状態を確認中（ローディング表示）
 * - `authenticated`: 認証済み（子コンポーネントを表示）
 * - `unauthenticated`: 未認証（ログイン画面を表示）
 */
type AuthGuardState = "checking" | "authenticated" | "unauthenticated";
```

#### Interface: AuthGuardProps

```typescript
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
```

#### コンポーネント: AuthGuard

````typescript
/**
 * 認証ガードコンポーネント
 *
 * アプリケーションへのアクセスを認証状態に基づいて制御する。
 * - checking: ローディング画面（またはカスタムfallback）を表示
 * - authenticated: 子コンポーネントを表示
 * - unauthenticated: ログイン画面（AuthView）を表示
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
````

#### 関数: getAuthState

````typescript
/**
 * 現在の認証状態を判定する
 *
 * @returns 現在のAuthGuardState
 *
 * @example
 * ```typescript
 * const state = getAuthState();
 * // state: "checking" | "authenticated" | "unauthenticated"
 * ```
 */
const getAuthState = (): AuthGuardState => {
````

### 3.2 AuthGuard/LoadingScreen.tsx

````typescript
/**
 * 認証確認中のローディング画面
 *
 * 認証状態の確認中に表示されるスピナー付きの画面。
 * GlassPanelを使用したデザインで、アプリ全体の統一感を維持。
 *
 * @component
 * @example
 * ```tsx
 * // AuthGuard内部で使用
 * <LoadingScreen />
 * ```
 */
export const LoadingScreen: React.FC = () => {
````

### 3.3 AuthView/index.tsx

#### Interface: AuthViewProps

```typescript
/**
 * AuthViewコンポーネントのProps
 */
export interface AuthViewProps {
  /**
   * 認証成功時のコールバック
   * @default undefined
   */
  onAuthSuccess?: () => void;
}
```

#### 型定義: ProviderConfig

```typescript
/**
 * 認証プロバイダーの設定
 */
interface ProviderConfig {
  /** プロバイダーID（例: "google", "github"） */
  id: AuthProvider;
  /** 表示名（日本語） */
  name: string;
  /** ボタンの背景色クラス */
  bgColor: string;
  /** ホバー時の背景色クラス */
  hoverColor: string;
}
```

#### 定数: PROVIDERS

```typescript
/**
 * 利用可能な認証プロバイダー一覧
 *
 * 各プロバイダーの設定を配列で定義。
 * 表示順序はこの配列の順序に従う。
 */
const PROVIDERS: ProviderConfig[] = [
```

#### コンポーネント: AuthView

````typescript
/**
 * ログイン画面コンポーネント
 *
 * ソーシャルログイン（OAuth）を提供する画面。
 * - 複数のプロバイダー（Google、GitHub、Discord）に対応
 * - エラー表示とローディング状態の管理
 * - GlassPanelを使用したモダンなUI
 *
 * @component
 * @example
 * ```tsx
 * // 基本的な使用方法
 * <AuthView />
 *
 * // 認証成功時のコールバック付き
 * <AuthView onAuthSuccess={() => navigate('/dashboard')} />
 * ```
 */
export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
````

#### 関数: handleLogin

````typescript
/**
 * ログインボタンクリック時のハンドラー
 *
 * @param provider - 選択された認証プロバイダー
 *
 * @example
 * ```typescript
 * handleLogin("google"); // Googleでログイン
 * handleLogin("github"); // GitHubでログイン
 * ```
 */
const handleLogin = async (provider: AuthProvider): Promise<void> => {
````

### 3.4 AccountSection/index.tsx

#### Interface: AccountSectionProps

```typescript
/**
 * AccountSectionコンポーネントのProps
 */
export interface AccountSectionProps {
  /** 追加のCSSクラス */
  className?: string;
}
```

#### 型定義: AuthResultType

```typescript
/**
 * 認証操作の結果タイプ
 *
 * - `success`: 操作成功
 * - `error`: 操作失敗（エラー発生）
 * - `cancelled`: ユーザーによるキャンセル
 */
type AuthResultType = "success" | "error" | "cancelled";
```

#### コンポーネント: AccountSection

````typescript
/**
 * アカウント管理セクション
 *
 * ユーザーのアカウント情報を表示し、以下の機能を提供する:
 * - プロフィール情報の表示（アバター、名前、メール）
 * - ソーシャルアカウント連携状態の表示と管理
 * - ログアウト機能
 *
 * @component
 * @example
 * ```tsx
 * // 設定画面での使用
 * <AccountSection className="mt-4" />
 * ```
 */
export const AccountSection: React.FC<AccountSectionProps> = ({ className }) => {
````

### 3.5 ProviderIcon/index.tsx

#### Interface: ProviderIconProps

```typescript
/**
 * ProviderIconコンポーネントのProps
 */
export interface ProviderIconProps {
  /** 認証プロバイダーの種類 */
  provider: AuthProvider;

  /**
   * アイコンのサイズ（ピクセル）
   * @default 24
   */
  size?: number;

  /** 追加のCSSクラス */
  className?: string;
}
```

#### コンポーネント: ProviderIcon

````typescript
/**
 * 認証プロバイダーのアイコン
 *
 * 各認証プロバイダー（Google、GitHub、Discord）に対応した
 * SVGアイコンを表示する。
 *
 * @component
 * @example
 * ```tsx
 * // 基本的な使用
 * <ProviderIcon provider="google" />
 *
 * // サイズ指定
 * <ProviderIcon provider="github" size={32} />
 *
 * // スタイル追加
 * <ProviderIcon provider="discord" className="text-white" />
 * ```
 */
export const ProviderIcon: React.FC<ProviderIconProps> = ({
````

---

## 4. タグ使用ガイドライン

### 4.1 必須タグ

| タグ         | 用途                | 対象                 |
| ------------ | ------------------- | -------------------- |
| `@component` | Reactコンポーネント | 全コンポーネント     |
| `@param`     | 関数パラメータ      | パラメータを持つ関数 |
| `@returns`   | 戻り値              | 戻り値を持つ関数     |
| `@example`   | 使用例              | 全コンポーネント     |
| `@default`   | デフォルト値        | オプショナルProps    |

### 4.2 オプションタグ

| タグ          | 用途           | 使用条件                 |
| ------------- | -------------- | ------------------------ |
| `@throws`     | 例外           | 例外をスローする可能性   |
| `@see`        | 関連リンク     | 関連ドキュメントがある時 |
| `@since`      | 追加バージョン | バージョン管理時         |
| `@deprecated` | 非推奨         | 廃止予定の機能           |

---

## 5. 完了条件

- [x] 全5ファイルのJSDoc設計が完了
- [x] コンポーネント・関数・型すべてにテンプレートが定義されている
- [x] @exampleタグの使用例が含まれている
- [x] 日本語での説明が含まれている

---

## 6. 関連ドキュメント

- 要件定義: `docs/30-workflows/code-quality-improvements/requirements-jsdoc.md`
- テスト設計: `docs/30-workflows/code-quality-improvements/design-jsdoc-tests.md`（後続タスク）
