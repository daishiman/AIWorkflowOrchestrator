# アーキテクチャ改善タスク仕様書

## タスク概要

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| タスク名   | login-only-auth アーキテクチャ改善                                  |
| 対象機能   | 認証画面（AuthView/AuthGuard/AccountSection）のアーキテクチャ最適化 |
| 優先度     | 低                                                                  |
| 見積もり   | 小規模                                                              |
| ステータス | 未実施                                                              |

## 背景と目的

Phase 5.5 Final Review Gate において、`.claude/agents/arch-police.md` エージェントによるアーキテクチャレビューで以下の改善点が指摘された：

1. **LoadingScreen の配置検討**（atoms/ への移動候補）
2. **アニメーション定義の抽出**
3. **コンポーネント責務の明確化**

これらの改善を行い、Atomic Design原則への準拠度を向上させる。

## 実施方針

### フェーズ構成

```
Phase 1: 現状分析・設計
Phase 2: LoadingScreen リファクタリング
Phase 3: アニメーション定義の抽出
Phase 4: コンポーネント責務の整理
Phase 5: アーキテクチャレビュー・検証
```

## Phase 1: 現状分析・設計

### 1.1 現状のコンポーネント構成

```
apps/desktop/src/renderer/components/
├── atoms/
│   ├── Button/
│   ├── Icon/
│   ├── Input/
│   ├── ProviderIcon/          # OAuth プロバイダーアイコン
│   └── Spinner/               # 汎用スピナー
├── molecules/
│   └── ...
├── organisms/
│   ├── AccountSection/        # アカウント設定セクション
│   └── GlassPanel/
├── AuthGuard/
│   ├── index.tsx             # 認証ガード
│   ├── LoadingScreen.tsx     # ローディング画面 ← 配置検討対象
│   └── types.ts
└── views/
    └── AuthView/             # 認証ビュー
```

### 1.2 LoadingScreen 配置検討

#### 現状の分析

**現在の位置**: `components/AuthGuard/LoadingScreen.tsx`

**コンポーネントの特性**:

- 状態を持たない（stateless）
- 外部依存: `Spinner`, `Icon` のみ
- 汎用的な「ローディング画面」として再利用可能
- アプリケーション固有のブランディング要素を含む

#### 配置オプション

| オプション | 配置先                  | メリット                                     | デメリット                                |
| ---------- | ----------------------- | -------------------------------------------- | ----------------------------------------- |
| A          | atoms/LoadingScreen     | 純粋なUI部品として再利用可能                 | アプリ固有のブランディングが atoms に入る |
| B          | molecules/LoadingScreen | アプリブランディングを含む複合コンポーネント | Spinner + Icon の組み合わせなので妥当     |
| C          | organisms/LoadingScreen | 画面全体を覆うレイアウト要素として           | organisms としては小さすぎる              |
| D          | 現状維持                | AuthGuard と密結合で意図が明確               | 再利用性が低い                            |

#### 推奨案

**オプション B: molecules/LoadingScreen** に移動

理由:

1. `Spinner` (atom) と `Icon` (atom) の組み合わせ → molecules が適切
2. アプリケーション固有のブランディングを含む → atoms より上位
3. 全画面表示だが、複数箇所で再利用可能 → organisms より下位
4. AuthGuard 以外でも使用できる汎用性を持つ

### 1.3 アニメーション定義の抽出

#### 現状の分析

現在、アニメーションは各コンポーネント内で個別に定義されている:

```tsx
// Spinner.tsx
<div className="animate-spin ..." />

// LoadingScreen.tsx
<div className="animate-pulse ..." />
```

#### 改善案

共通アニメーション定義を `tailwind.config.js` または CSS 変数で管理:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 2s linear infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
};
```

### 1.4 コンポーネント責務の整理

#### 責務マトリクス

| コンポーネント | 現在の責務                           | 理想的な責務                | 改善点                          |
| -------------- | ------------------------------------ | --------------------------- | ------------------------------- |
| AuthGuard      | 認証状態判定 + ルーティング          | 認証状態判定 + ルーティング | ✅ 適切                         |
| LoadingScreen  | ローディング表示                     | ローディング表示（汎用化）  | 移動検討                        |
| AuthView       | ログイン画面表示                     | ログイン画面表示            | ✅ 適切                         |
| AccountSection | プロフィール表示 + 編集 + ログアウト | 同左                        | ✅ 適切（やや大きいが許容範囲） |
| ProviderIcon   | アイコン表示                         | アイコン表示                | ✅ 適切                         |

## Phase 2: LoadingScreen リファクタリング

### 2.1 ファイル構成（変更後）

```
apps/desktop/src/renderer/components/
├── atoms/
│   ├── Spinner/
│   └── ...
├── molecules/
│   └── LoadingScreen/           # 新規追加
│       ├── index.tsx
│       └── LoadingScreen.test.tsx
├── AuthGuard/
│   ├── index.tsx               # LoadingScreen を molecules からインポート
│   └── types.ts
└── ...
```

### 2.2 実装設計

````typescript
// apps/desktop/src/renderer/components/molecules/LoadingScreen/index.tsx
import React from "react";
import clsx from "clsx";
import { Spinner } from "../../atoms/Spinner";
import { Icon, IconName } from "../../atoms/Icon";

export interface LoadingScreenProps {
  /** アプリケーションロゴのアイコン名 */
  logoIcon?: IconName;
  /** アプリケーション名 */
  appName?: string;
  /** ローディングメッセージ */
  message?: string;
  /** 背景色クラス */
  bgClassName?: string;
  /** カスタムクラス */
  className?: string;
}

/**
 * 全画面ローディング表示コンポーネント
 *
 * アプリケーションの初期化中やデータ読み込み中に使用する。
 * ブランディング要素（ロゴ、アプリ名）と共にスピナーを表示する。
 *
 * @component
 * @example
 * ```tsx
 * <LoadingScreen
 *   logoIcon="sparkles"
 *   appName="AIWorkflowOrchestrator"
 *   message="読み込み中..."
 * />
 * ```
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  logoIcon = "sparkles",
  appName = "AIWorkflowOrchestrator",
  message = "読み込み中...",
  bgClassName = "bg-[#0a0a0a]",
  className,
}) => {
  return (
    <div
      className={clsx(
        "h-screen w-screen flex flex-col items-center justify-center",
        bgClassName,
        className
      )}
      role="status"
      aria-label={message}
    >
      {/* アプリロゴ */}
      <div className="mb-8">
        <Icon name={logoIcon} size={64} className="text-blue-400" />
      </div>

      {/* アプリ名 */}
      <h1 className="text-2xl font-bold text-white mb-8">{appName}</h1>

      {/* スピナー */}
      <Spinner size="lg" className="text-blue-400" />

      {/* メッセージ */}
      <p className="mt-4 text-white/60 text-sm">{message}</p>
    </div>
  );
};

LoadingScreen.displayName = "LoadingScreen";
````

### 2.3 AuthGuard の更新

```typescript
// apps/desktop/src/renderer/components/AuthGuard/index.tsx
import { LoadingScreen } from "../molecules/LoadingScreen";

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  // ...
  switch (authState) {
    case "checking":
      return <>{fallback ?? <LoadingScreen />}</>;
    // ...
  }
};
```

### 2.4 テストの移動・更新

```
apps/desktop/src/renderer/components/molecules/LoadingScreen/
└── LoadingScreen.test.tsx
```

### 2.5 テストケース

| テストID | シナリオ           | 期待結果           |
| -------- | ------------------ | ------------------ |
| LS-01    | デフォルトprops    | デフォルト値で表示 |
| LS-02    | カスタムロゴ       | 指定アイコン表示   |
| LS-03    | カスタムメッセージ | 指定メッセージ表示 |
| LS-04    | aria-label         | 適切なラベル設定   |

## Phase 3: アニメーション定義の抽出

### 3.1 tailwind.config.js 更新

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        // 既存
        spin: "spin 1s linear infinite",
        // 追加
        "spin-slow": "spin 2s linear infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "fade-out": "fadeOut 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "pulse-gentle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
};
```

### 3.2 使用例

```tsx
// 認証成功メッセージ
<div className="animate-fade-in">
  ログインしました
</div>

// エラーメッセージ
<div className="animate-slide-down">
  エラーが発生しました
</div>
```

## Phase 4: コンポーネント責務の整理

### 4.1 AccountSection の責務分割検討

現在の `AccountSection` は以下の機能を持つ:

1. 未認証時のログインボタン表示
2. 認証済み時のプロフィール表示
3. プロフィール編集
4. プロバイダー連携管理
5. ログアウト

#### 分割オプション

| オプション  | 構成                                            | メリット     | デメリット   |
| ----------- | ----------------------------------------------- | ------------ | ------------ |
| A: 現状維持 | 単一コンポーネント                              | シンプル     | やや肥大化   |
| B: 3分割    | LoginSection + ProfileSection + ProviderSection | 責務明確     | 複雑化       |
| C: 2分割    | LoginSection + AccountProfileSection            | バランス良い | 中程度の変更 |

#### 推奨案

**オプション A: 現状維持**

理由:

1. 現在のサイズは許容範囲内（約380行）
2. 内部で明確なセクション分けがされている
3. 追加の抽象化は過剰設計になる可能性
4. 今後機能追加時に再検討

### 4.2 エクスポート構造の整理

```typescript
// apps/desktop/src/renderer/components/index.ts
// atoms
export * from "./atoms/Button";
export * from "./atoms/Icon";
export * from "./atoms/Input";
export * from "./atoms/ProviderIcon";
export * from "./atoms/Spinner";

// molecules
export * from "./molecules/LoadingScreen";

// organisms
export * from "./organisms/AccountSection";
export * from "./organisms/GlassPanel";

// HOCs / Guards
export * from "./AuthGuard";
```

## Phase 5: アーキテクチャレビュー・検証

### 5.1 検証項目

| 項目                   | 検証方法       | 担当エージェント |
| ---------------------- | -------------- | ---------------- |
| Atomic Design準拠      | コードレビュー | .claude/agents/arch-police.md     |
| コンポーネント依存関係 | 依存グラフ確認 | .claude/agents/arch-police.md     |
| 再利用性               | 使用箇所の確認 | .claude/agents/code-quality.md    |
| テスト通過             | 自動テスト     | .claude/agents/unit-tester.md     |

### 5.2 アーキテクチャレビュー

```bash
# アーキテクチャレビュー実行コマンド
/ai:review-architecture scope: components/AuthGuard
/ai:review-architecture scope: components/molecules/LoadingScreen
```

### 5.3 依存関係の確認

```
LoadingScreen (molecule)
├── Spinner (atom)
└── Icon (atom)

AuthGuard (HOC)
├── LoadingScreen (molecule)
└── AuthView (view)

AccountSection (organism)
├── Button (atom)
├── Icon (atom)
├── Input (atom)
├── ProviderIcon (atom)
└── GlassPanel (organism)
```

## 完了条件

- [ ] LoadingScreen が molecules/ に移動されている
- [ ] 共通アニメーション定義が tailwind.config.js に追加されている
- [ ] エクスポート構造が整理されている
- [ ] 全テストが通過している
- [ ] `.claude/agents/arch-police.md` レビューで PASS 評価

## 関連ドキュメント

- `docs/30-workflows/login-only-auth/design-auth-guard.md`
- `docs/30-workflows/login-only-auth/design-auth-view.md`
- `apps/desktop/tailwind.config.js`
- `apps/desktop/src/renderer/components/index.ts`
