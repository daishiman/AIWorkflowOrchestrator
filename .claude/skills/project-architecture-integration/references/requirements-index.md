# 要件仕様インデックス

## 概要

プロジェクト固有の技術スタック仕様と要求仕様を整理し、アーキテクチャ設計との整合性を確保する。

## プロジェクト要求仕様の参照先

### 主要ドキュメント

プロジェクトの要求仕様は `docs/00-requirements/` ディレクトリに集約されている。

```
docs/00-requirements/
├── Phase1-9/                    # フェーズ別要件定義
├── database/                    # データベース設計
├── workflows/                   # ワークフロー設計
└── technical-stack.md           # 技術スタック仕様
```

## 技術スタック仕様

### フロントエンド

**フレームワーク**: Next.js 15 (App Router)

- Server Components/Client Componentsの使い分け
- App Routerのディレクトリ構造（app/）
- Server Actionsの活用

**言語**: TypeScript 5.x

- 厳格な型チェック（strict mode）
- 型安全性の維持
- any型の使用を避ける

**スタイリング**: Tailwind CSS

- ユーティリティクラスによるスタイリング
- カスタムテーマ設定（tailwind.config.ts）
- レスポンシブデザイン対応

**状態管理**:

- Zustand（グローバル状態）
- React Query（サーバー状態）
- React Hook Form（フォーム状態）

### バックエンド

**フレームワーク**: Next.js API Routes / Server Actions

**データベース**: PostgreSQL with Prisma ORM

- スキーマ定義（schema.prisma）
- マイグレーション管理
- 型安全なクエリ

**認証**: NextAuth.js

- JWT/Session管理
- OAuth プロバイダー統合
- Role-Based Access Control (RBAC)

### デスクトップアプリ

**フレームワーク**: Electron

- Main Process / Renderer Processの分離
- IPC通信パターン
- セキュリティ設定（contextIsolation）

### テスト

**単体テスト**: Vitest

- コンポーネントテスト
- ユーティリティ関数テスト
- モックとスタブ

**E2Eテスト**: Playwright

- ブラウザ自動化
- クロスブラウザテスト
- CI/CD統合

### CI/CD

**プラットフォーム**: GitHub Actions

- Linting/Formatting自動化
- テスト自動実行
- ビルド・デプロイ自動化

**Linter/Formatter**:

- ESLint（静的解析）
- Prettier（コードフォーマット）
- TypeScript Compiler（型チェック）

## アーキテクチャとの整合性

### ディレクトリ構造とNext.js App Router

**App Router構造**:

```
apps/web/app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── products/
│   └── users/
├── api/
│   └── [...route]/
└── layout.tsx
```

**Features構造との対応**:

```
packages/shared/src/features/
├── auth/          → app/(auth)/で使用
├── products/      → app/(dashboard)/products/で使用
└── users/         → app/(dashboard)/users/で使用
```

### データベース設計との整合性

**Prismaスキーマとフィーチャーの対応**:

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role     @default(USER)
  // ...
}

model Product {
  id          String   @id @default(cuid())
  name        String
  price       Float
  // ...
}
```

**フィーチャーでの使用**:

```typescript
// features/auth/types/auth.types.ts
import type { User, Role } from "@prisma/client";

export type AuthUser = Pick<User, "id" | "email" | "role">;

// features/products/types/product.types.ts
import type { Product } from "@prisma/client";

export type ProductWithDetails = Product & {
  // 追加フィールド
};
```

### API設計との整合性

**REST API構造**:

```
/api/auth/
  ├── login        → features/auth/api/login.ts
  ├── logout       → features/auth/api/logout.ts
  └── register     → features/auth/api/register.ts

/api/products/
  ├── [GET]        → features/products/api/getProducts.ts
  ├── [POST]       → features/products/api/createProduct.ts
  └── [id]/
      ├── [GET]    → features/products/api/getProductById.ts
      ├── [PUT]    → features/products/api/updateProduct.ts
      └── [DELETE] → features/products/api/deleteProduct.ts
```

**API実装パターン**:

```typescript
// features/auth/api/login.ts
import type { LoginCredentials, LoginResponse } from "../types/auth.types";

export const login = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};
```

## テスト戦略との整合性

### テストの配置

**単体テスト**:

```
features/auth/
├── __tests__/
│   ├── hooks/
│   │   └── useAuth.test.ts
│   └── utils/
│       └── validatePassword.test.ts
├── hooks/
│   └── useAuth.ts
└── utils/
    └── validatePassword.ts
```

**E2Eテスト**:

```
tests/e2e/
├── auth/
│   ├── login.spec.ts
│   └── register.spec.ts
└── products/
    ├── list.spec.ts
    └── create.spec.ts
```

### テスト実装パターン

**単体テスト例**:

```typescript
// features/auth/__tests__/utils/validatePassword.test.ts
import { describe, it, expect } from "vitest";
import { validatePassword } from "../../utils/validatePassword";

describe("validatePassword", () => {
  it("should accept valid password", () => {
    expect(validatePassword("SecureP@ssw0rd")).toBe(true);
  });

  it("should reject short password", () => {
    expect(validatePassword("short")).toBe(false);
  });
});
```

**E2Eテスト例**:

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";

test("should login successfully with valid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="email"]', "user@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
});
```

## エラーハンドリングとの整合性

### エラー処理パターン

**APIエラーハンドリング**:

```typescript
// shared/types/error.types.ts
export interface ApiError {
  status: number;
  message: string;
  code: string;
}

// features/auth/api/login.ts
import type { ApiError } from "@/shared/types/error.types";

export const login = async (credentials: LoginCredentials) => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw error;
    }

    return response.json();
  } catch (error) {
    // エラーログ記録
    console.error("Login error:", error);
    throw error;
  }
};
```

**フロントエンドエラーバウンダリ**:

```typescript
// shared/components/ErrorBoundary.tsx
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

## CI/CDとの整合性

### GitHub Actionsワークフロー

**Linting/Formatting**:

```yaml
# .github/workflows/lint.yml
name: Lint and Format

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm typecheck
```

**テスト実行**:

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e
```

## モノレポ構成との整合性

### パッケージ構造

```
.
├── apps/
│   ├── desktop/     # Electronデスクトップアプリ
│   └── web/         # Next.js Webアプリ
├── packages/
│   ├── shared/      # 共有ライブラリ
│   │   └── src/
│   │       ├── features/   # ドメイン機能
│   │       └── shared/     # 共通コード
│   └── ui/          # UIコンポーネントライブラリ
└── pnpm-workspace.yaml
```

### パッケージ間依存

```json
// apps/web/package.json
{
  "dependencies": {
    "@repo/shared": "workspace:*",
    "@repo/ui": "workspace:*"
  }
}

// packages/shared/package.json
{
  "name": "@repo/shared",
  "exports": {
    "./features/*": "./src/features/*/index.ts",
    "./shared/*": "./src/shared/*/index.ts"
  }
}
```

## 更新プロセス

### 要件仕様の同期

1. **新しい要求仕様の追加時**:
   - `docs/00-requirements/` に要件定義を追加
   - このインデックスファイルを更新
   - 関連するフィーチャーを作成/更新

2. **技術スタックの変更時**:
   - 変更内容をこのインデックスに反映
   - 影響を受けるフィーチャーを特定
   - アーキテクチャ準拠性を再検証

3. **アーキテクチャパターンの追加時**:
   - パターンを `patterns.md` に文書化
   - このインデックスに適用例を追加
   - テンプレートを `assets/` に追加

## チェックリスト

アーキテクチャ設計時に確認すべき項目:

- [ ] 技術スタック仕様に準拠している
- [ ] データベーススキーマとの整合性がある
- [ ] API設計パターンに従っている
- [ ] テスト戦略と一致している
- [ ] エラーハンドリングパターンを適用している
- [ ] CI/CDワークフローと整合している
- [ ] モノレポ構成を考慮している

## 参考リンク

- **プロジェクト要求仕様**: `docs/00-requirements/`
- **データベーススキーマ**: `prisma/schema.prisma`
- **APIルート**: `apps/web/app/api/`
- **CI/CDワークフロー**: `.github/workflows/`

## 次のステップ

- **基礎知識**: [basics.md](basics.md)
- **実装パターン**: [patterns.md](patterns.md)
- **Hybrid Architecture**: [hybrid-architecture-guide.md](hybrid-architecture-guide.md)
