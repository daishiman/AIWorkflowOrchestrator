# Hybrid Architecture Guide

## 概要

shared/とfeatures/を組み合わせたハイブリッドアーキテクチャの設計指針。

## アーキテクチャ構造

### 基本構造

```
project/
├── shared/              # 共有コンポーネント（ドメイン非依存）
│   ├── ui/             # UIコンポーネント
│   ├── utils/          # ユーティリティ関数
│   ├── types/          # 型定義
│   ├── hooks/          # カスタムフック
│   ├── config/         # 設定
│   └── constants/      # 定数
│
├── features/           # ドメイン機能（ビジネスロジック）
│   ├── auth/          # 認証機能
│   │   ├── api/       # API呼び出し
│   │   ├── components/# 機能固有コンポーネント
│   │   ├── hooks/     # 機能固有フック
│   │   ├── types/     # 機能固有型
│   │   └── utils/     # 機能固有ユーティリティ
│   │
│   ├── user/          # ユーザー管理
│   └── products/      # 商品管理
│
├── pages/             # ページコンポーネント
├── tests/             # テスト
└── docs/              # ドキュメント
```

## shared/ ディレクトリ

### 目的

ドメインに依存しない、プロジェクト全体で再利用可能なコードを配置。

### サブディレクトリ

#### `shared/ui/`

**配置するもの**:

- 汎用UIコンポーネント（Button、Input、Card）
- レイアウトコンポーネント（Header、Footer、Sidebar）
- アニメーションコンポーネント

**例**:

```typescript
// shared/ui/Button.tsx
export const Button = ({ children, onClick, variant }: ButtonProps) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};
```

#### `shared/utils/`

**配置するもの**:

- 汎用ユーティリティ関数
- 日付・文字列・数値操作
- バリデーション関数

**例**:

```typescript
// shared/utils/formatDate.ts
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("ja-JP");
};
```

#### `shared/types/`

**配置するもの**:

- 共通型定義
- APIレスポンス型
- エンティティ型

**例**:

```typescript
// shared/types/ApiResponse.ts
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

#### `shared/hooks/`

**配置するもの**:

- 汎用カスタムフック
- API呼び出しフック
- 状態管理フック

**例**:

```typescript
// shared/hooks/useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // 実装
};
```

## features/ ディレクトリ

### 目的

ビジネスロジックとドメイン固有の機能を機能単位で分離。

### フィーチャー構造

```
features/auth/
├── api/
│   ├── login.ts        # ログインAPI
│   └── logout.ts       # ログアウトAPI
├── components/
│   ├── LoginForm.tsx   # ログインフォーム
│   └── RegisterForm.tsx# 登録フォーム
├── hooks/
│   ├── useAuth.ts      # 認証フック
│   └── useUser.ts      # ユーザー情報フック
├── types/
│   └── auth.types.ts   # 認証型定義
├── utils/
│   └── validatePassword.ts # パスワード検証
└── index.ts            # 公開API
```

### index.ts（Barrel Export）

```typescript
// features/auth/index.ts
export { LoginForm, RegisterForm } from "./components";
export { useAuth, useUser } from "./hooks";
export { login, logout } from "./api";
export type { AuthUser, LoginCredentials } from "./types/auth.types";
```

## 依存関係ルール

### ✅ 許可される依存

1. **features → shared**: OK

   ```typescript
   // features/auth/components/LoginForm.tsx
   import { Button } from "@/shared/ui/Button";
   ```

2. **features → features（同一フィーチャー内）**: OK

   ```typescript
   // features/auth/components/LoginForm.tsx
   import { useAuth } from "../hooks/useAuth";
   ```

3. **pages → features**: OK

   ```typescript
   // pages/login.tsx
   import { LoginForm } from "@/features/auth";
   ```

4. **pages → shared**: OK
   ```typescript
   // pages/dashboard.tsx
   import { Card } from "@/shared/ui/Card";
   ```

### ❌ 禁止される依存

1. **shared → features**: NG

   ```typescript
   // shared/utils/auth.ts
   import { useAuth } from "@/features/auth"; // ❌ 循環依存
   ```

2. **features → features（異なるフィーチャー間）**: NG

   ```typescript
   // features/products/api/getProducts.ts
   import { useAuth } from "@/features/auth"; // ❌ フィーチャー間依存
   ```

   **解決策**: sharedに共通ロジックを移動

## パス alias設定

### tsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/shared/*": ["shared/*"],
      "@/features/*": ["features/*"],
      "@/pages/*": ["pages/*"]
    }
  }
}
```

## ベストプラクティス

### ✅ すべきこと

1. **単一責任**: 各フィーチャーは1つのドメイン機能のみ
2. **明確な境界**: shared/とfeatures/の責任を明確に分離
3. **Barrel Export**: index.tsで公開APIを明示
4. **依存関係の一方向性**: 循環依存を避ける
5. **共通ロジックの共有化**: 重複コードはshared/に移動

### ❌ 避けるべきこと

1. **フィーチャー間の直接依存**: features/A → features/B
2. **shared/へのドメインロジック**: shared/に認証ロジックを配置
3. **巨大なフィーチャー**: 1つのフィーチャーが10ファイル超
4. **曖昧な命名**: utils/、helpers/などの汎用的な名前
5. **未使用のexport**: index.tsに未使用の公開APIを含める

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-24 | 初版作成 |
