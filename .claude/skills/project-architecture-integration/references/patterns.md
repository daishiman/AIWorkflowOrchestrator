# 実装パターン集

## 概要

プロジェクトアーキテクチャ統合における具体的な実装パターンとアンチパターンを提供する。

## 推奨パターン

### 1. Barrel Export パターン

**目的**: フィーチャーの公開APIを明確にし、内部実装を隠蔽する

**実装**:

```typescript
// features/auth/index.ts
export { LoginForm, RegisterForm } from "./components";
export { useAuth, useUser } from "./hooks";
export { login, logout } from "./api";
export type { AuthUser, LoginCredentials } from "./types/auth.types";
```

**使用側**:

```typescript
// pages/login.tsx
import { LoginForm, useAuth } from "@/features/auth";
```

**メリット**:

- 公開APIが明確
- 内部実装の変更が容易
- インポートパスが簡潔

### 2. 依存性逆転パターン（DIP）

**目的**: 外側の層から内側の層への依存を排除

**問題**:

```typescript
// features/products/api/getProducts.ts
import { fetchJson } from "@/shared/utils/fetch"; // 外部依存

export const getProducts = async () => {
  return fetchJson("/api/products");
};
```

**解決策（依存性逆転）**:

```typescript
// features/products/types/repository.ts
export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
}

// features/products/api/productRepository.ts
import { fetchJson } from "@/shared/utils/fetch";
import type { ProductRepository } from "../types/repository";

export const createProductRepository = (): ProductRepository => ({
  getAll: async () => fetchJson("/api/products"),
  getById: async (id) => fetchJson(`/api/products/${id}`),
});

// features/products/hooks/useProducts.ts
export const useProducts = (repository: ProductRepository) => {
  return useQuery(["products"], () => repository.getAll());
};
```

**メリット**:

- ビジネスロジックがインフラから独立
- テスタビリティが向上
- 実装の差し替えが容易

### 3. フィーチャー分離パターン

**目的**: 各フィーチャーを独立したBounded Contextとして管理

**構造**:

```
features/auth/
├── api/
│   ├── login.ts
│   ├── logout.ts
│   └── register.ts
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── UserProfile.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── useAuthGuard.ts
├── types/
│   └── auth.types.ts
├── utils/
│   └── validatePassword.ts
└── index.ts
```

**ルール**:

- 各フィーチャーは独立して動作可能
- フィーチャー間の依存は shared/ を経由
- フィーチャー内は相対インポートを使用

**例**:

```typescript
// features/auth/components/LoginForm.tsx
import { useAuth } from "../hooks/useAuth"; // ✅ 同一フィーチャー内
import { Button } from "@/shared/ui/Button"; // ✅ shared/への依存
```

### 4. 共通ロジック抽出パターン

**目的**: 重複コードをshared/に集約し、DRYを維持

**問題（重複）**:

```typescript
// features/auth/utils/formatDate.ts
export const formatDate = (date: Date) => date.toLocaleDateString();

// features/products/utils/formatDate.ts
export const formatDate = (date: Date) => date.toLocaleDateString();
```

**解決策（共通化）**:

```typescript
// shared/utils/formatDate.ts
export const formatDate = (date: Date, locale = "ja-JP") => {
  return date.toLocaleDateString(locale);
};

// features/auth/components/LoginHistory.tsx
import { formatDate } from "@/shared/utils/formatDate";

// features/products/components/ProductList.tsx
import { formatDate } from "@/shared/utils/formatDate";
```

### 5. 型定義の階層化パターン

**目的**: 型定義を適切な場所に配置し、再利用性を高める

**階層**:

```
shared/types/
├── api.types.ts          # 共通API型
├── pagination.types.ts   # ページネーション型
└── error.types.ts        # エラー型

features/auth/types/
└── auth.types.ts         # 認証固有の型

features/products/types/
└── product.types.ts      # 商品固有の型
```

**例**:

```typescript
// shared/types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// features/auth/types/auth.types.ts
import type { ApiResponse } from "@/shared/types/api.types";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
}

export type LoginResponse = ApiResponse<{ user: AuthUser; token: string }>;
```

## アンチパターンと解決策

### 1. 循環依存アンチパターン

**問題**:

```typescript
// shared/utils/auth.ts
import { useAuth } from "@/features/auth"; // ❌ shared → features

export const checkAuth = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};
```

**解決策**:

```typescript
// features/auth/hooks/useAuth.ts に移動
export const useAuth = () => {
  // 認証ロジック
};

export const checkAuth = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

// または shared/types/ に型のみ定義
// shared/types/auth.types.ts
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
```

### 2. フィーチャー間直接依存アンチパターン

**問題**:

```typescript
// features/products/api/getProducts.ts
import { useAuth } from "@/features/auth/hooks/useAuth"; // ❌ features → features

export const getProducts = async () => {
  const { token } = useAuth();
  return fetchWithAuth("/api/products", token);
};
```

**解決策1（shared経由）**:

```typescript
// shared/hooks/useAuth.ts に認証フックを移動
export const useAuth = () => {
  // 認証ロジック（features/auth の実装を使用）
};

// features/products/api/getProducts.ts
import { useAuth } from "@/shared/hooks/useAuth"; // ✅ shared経由
```

**解決策2（依存性注入）**:

```typescript
// features/products/api/getProducts.ts
export const getProducts = async (token: string) => {
  return fetchWithAuth("/api/products", token);
};

// pages/products.tsx
import { useAuth } from "@/features/auth";
import { getProducts } from "@/features/products";

const ProductsPage = () => {
  const { token } = useAuth();
  const { data } = useQuery(["products"], () => getProducts(token));
};
```

### 3. 巨大なフィーチャーアンチパターン

**問題**:

```
features/admin/
├── components/  (20+ files)
├── hooks/       (15+ files)
├── utils/       (10+ files)
└── types/       (8+ files)
```

**解決策（サブフィーチャー分割）**:

```
features/admin/
├── user-management/
│   ├── components/
│   ├── hooks/
│   └── types/
├── analytics/
│   ├── components/
│   ├── hooks/
│   └── types/
└── settings/
    ├── components/
    ├── hooks/
    └── types/
```

### 4. ドメインロジックの誤配置アンチパターン

**問題**:

```typescript
// shared/utils/validatePassword.ts ❌
export const validatePassword = (password: string) => {
  // パスワードポリシー（認証ドメインのロジック）
  const minLength = 8;
  const requiresSpecialChar = true;
  // ...
};
```

**解決策**:

```typescript
// features/auth/utils/validatePassword.ts ✅
export const validatePassword = (password: string) => {
  // 認証ドメインのロジック
  const minLength = 8;
  const requiresSpecialChar = true;
  // ...
};

// shared/utils/string.ts
// 汎用的な文字列検証のみ
export const hasSpecialChar = (str: string) => /[!@#$%^&*]/.test(str);
export const hasMinLength = (str: string, min: number) => str.length >= min;
```

### 5. 曖昧な命名アンチパターン

**問題**:

```
shared/
├── helpers/
├── common/
└── misc/
```

**解決策**:

```
shared/
├── ui/           # UIコンポーネント
├── utils/        # ユーティリティ関数
├── types/        # 型定義
├── hooks/        # カスタムフック
├── config/       # 設定
└── constants/    # 定数
```

## パターン適用のチェックリスト

### ファイル配置

- [ ] ドメイン依存性を判定した
- [ ] shared/ または features/ への配置が適切
- [ ] Bounded Context が明確に分離されている

### 依存関係

- [ ] 依存方向が正しい（外側→内側）
- [ ] 循環依存が存在しない
- [ ] フィーチャー間の直接依存がない

### コード品質

- [ ] Barrel Export で公開APIを定義している
- [ ] 重複コードがshared/に集約されている
- [ ] 型定義が適切な場所に配置されている

### 命名

- [ ] ディレクトリ名が明確で具体的
- [ ] ファイル名が役割を表している
- [ ] 型名が一貫したネーミング規則に従っている

## 実装例

### 例1: 認証フィーチャー

```typescript
// features/auth/index.ts
export { LoginForm, RegisterForm } from "./components";
export { useAuth, useAuthGuard } from "./hooks";
export { login, logout, register } from "./api";
export type { AuthUser, LoginCredentials } from "./types/auth.types";

// features/auth/types/auth.types.ts
export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// features/auth/hooks/useAuth.ts
import { create } from "zustand";
import type { AuthUser } from "../types/auth.types";

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// features/auth/components/LoginForm.tsx
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { login } from "../api/login";

export const LoginForm = () => {
  const { login: setAuth } = useAuth();

  const handleSubmit = async (credentials: LoginCredentials) => {
    const user = await login(credentials);
    setAuth(user);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="email" type="email" />
      <Input name="password" type="password" />
      <Button type="submit">Login</Button>
    </form>
  );
};
```

### 例2: 商品フィーチャー

```typescript
// features/products/index.ts
export { ProductList, ProductCard } from "./components";
export { useProducts, useProduct } from "./hooks";
export { getProducts, getProductById } from "./api";
export type { Product, ProductFilters } from "./types/product.types";

// features/products/types/product.types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

// features/products/hooks/useProducts.ts
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/getProducts";
import type { ProductFilters } from "../types/product.types";

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });
};

// features/products/components/ProductList.tsx
import { ProductCard } from "./ProductCard";
import { useProducts } from "../hooks/useProducts";
import { Spinner } from "@/shared/ui/Spinner";

export const ProductList = () => {
  const { data, isLoading } = useProducts();

  if (isLoading) return <Spinner />;

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

## まとめ

### 推奨パターン適用時のメリット

- **保守性**: 変更の影響範囲が明確
- **テスタビリティ**: 依存性注入により単体テスト容易
- **再利用性**: 共通コードの集約によりDRY維持
- **スケーラビリティ**: フィーチャー分離により並行開発可能

### アンチパターン回避のメリット

- **循環依存の回避**: ビルド時間の削減、予測可能な動作
- **明確な境界**: 責務の分離、変更の容易性
- **適切な配置**: コードの発見性向上、学習コスト削減

## 次のステップ

- **Hybrid Architecture 詳細**: [hybrid-architecture-guide.md](hybrid-architecture-guide.md)
- **Level 3（応用）**: [Level3_advanced.md](Level3_advanced.md)
- **検証スクリプト**: `scripts/check-architecture-compliance.mjs`
