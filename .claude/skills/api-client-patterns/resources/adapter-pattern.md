# Adapter Pattern for API Clients

## 概要

Adapterパターンは、外部APIのインターフェースを内部で期待するインターフェースに変換する構造的パターンです。
外部システムの「言語」を内部システムの「言語」に翻訳する役割を担います。

## いつ使うか

### 適用条件
- [ ] 外部APIのメソッド名やパラメータが内部規約と異なる
- [ ] 外部APIのレスポンス形式を内部形式に変換したい
- [ ] 外部API変更時の影響を局所化したい
- [ ] 複数の類似外部サービスを統一インターフェースで扱いたい

### 適用しない条件
- 外部APIと内部インターフェースがほぼ同一
- 一度限りの単純なAPI呼び出し
- 変換ロジックが不要な場合

## パターン構造

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Internal Code  │ ──▶  │     Adapter     │ ──▶  │   External API  │
│   (Consumer)    │      │  (Translator)   │      │    (Adaptee)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │                        │
        │ 内部インターフェース    │ 変換処理               │ 外部API呼び出し
        │ を使用                 │                        │
        ▼                        ▼                        ▼
   getUserById()          transformResponse()      GET /users/{id}
```

## 実装アプローチ

### 1. インターフェース定義

```typescript
// 内部で期待するインターフェース
interface UserRepository {
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// 内部ドメインモデル
interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}
```

### 2. Adapter実装

```typescript
// 外部APIの型（参考）
interface ExternalUserResponse {
  user_id: string;
  email_address: string;
  full_name: string;
  created_timestamp: number;
}

// Adapter実装
class ExternalApiUserAdapter implements UserRepository {
  constructor(private readonly apiClient: ExternalApiClient) {}

  async findById(id: string): Promise<User> {
    const response = await this.apiClient.get(`/users/${id}`);
    return this.transformToUser(response.data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const response = await this.apiClient.get('/users', { email });
    if (response.data.length === 0) return null;
    return this.transformToUser(response.data[0]);
  }

  async save(user: User): Promise<void> {
    const externalFormat = this.transformToExternal(user);
    await this.apiClient.put(`/users/${user.id}`, externalFormat);
  }

  // 外部形式 → 内部形式
  private transformToUser(external: ExternalUserResponse): User {
    return {
      id: external.user_id,
      email: external.email_address,
      displayName: external.full_name,
      createdAt: new Date(external.created_timestamp * 1000),
    };
  }

  // 内部形式 → 外部形式
  private transformToExternal(user: User): ExternalUserResponse {
    return {
      user_id: user.id,
      email_address: user.email,
      full_name: user.displayName,
      created_timestamp: Math.floor(user.createdAt.getTime() / 1000),
    };
  }
}
```

## 変換パターン

### フィールド名の変換

```typescript
// snake_case → camelCase
const transform = (external: Record<string, unknown>) => ({
  userId: external.user_id,
  emailAddress: external.email_address,
  createdAt: external.created_at,
});
```

### 型の変換

```typescript
// Unix timestamp → Date
const toDate = (timestamp: number): Date => new Date(timestamp * 1000);

// ISO string → Date
const isoToDate = (iso: string): Date => new Date(iso);

// number ID → string ID
const toStringId = (id: number): string => String(id);
```

### ネスト構造の変換

```typescript
// フラット → ネスト
const transformAddress = (external: ExternalUser) => ({
  address: {
    street: external.street_address,
    city: external.city_name,
    country: external.country_code,
  },
});

// ネスト → フラット
const flattenAddress = (user: User) => ({
  street_address: user.address.street,
  city_name: user.address.city,
  country_code: user.address.country,
});
```

### 配列の変換

```typescript
// 配列要素の変換
const transformUsers = (externals: ExternalUser[]): User[] =>
  externals.map(transformToUser);

// ページネーション構造の変換
const transformPaginated = (response: ExternalPaginatedResponse) => ({
  items: response.data.map(transformToUser),
  pagination: {
    currentPage: response.meta.page,
    totalPages: response.meta.total_pages,
    totalItems: response.meta.total_count,
  },
});
```

## エラー処理

### 外部エラーの変換

```typescript
class ApiAdapter {
  async fetchUser(id: string): Promise<User> {
    try {
      const response = await this.client.get(`/users/${id}`);
      return this.transform(response.data);
    } catch (error) {
      throw this.transformError(error);
    }
  }

  private transformError(error: unknown): Error {
    if (error instanceof ExternalApiError) {
      switch (error.status) {
        case 404:
          return new UserNotFoundError(`User not found`);
        case 401:
          return new AuthenticationError('Invalid credentials');
        case 429:
          return new RateLimitError('Too many requests');
        default:
          return new ExternalServiceError('External service error');
      }
    }
    return new UnknownError('Unknown error occurred');
  }
}
```

## テスト戦略

### Adapterのユニットテスト

```typescript
describe('ExternalApiUserAdapter', () => {
  describe('transformToUser', () => {
    it('should transform external format to internal User', () => {
      const external: ExternalUserResponse = {
        user_id: '123',
        email_address: 'test@example.com',
        full_name: 'Test User',
        created_timestamp: 1700000000,
      };

      const result = adapter['transformToUser'](external);

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date(1700000000 * 1000),
      });
    });
  });
});
```

## チェックリスト

### 設計時
- [ ] 内部インターフェースが外部APIに依存していないか？
- [ ] 変換ロジックがAdapter内に局所化されているか？
- [ ] エラー変換が適切に行われているか？

### 実装時
- [ ] 型安全な変換が実装されているか？
- [ ] 欠損フィールドのデフォルト処理があるか？
- [ ] 日付やタイムゾーンの変換が正しいか？

### テスト時
- [ ] 変換ロジックのユニットテストがあるか？
- [ ] エッジケース（null, undefined, 空配列）がテストされているか？
- [ ] エラー変換がテストされているか？

## アンチパターン

### ❌ 外部型の内部への漏洩

```typescript
// NG: 外部型を直接使用
class UserService {
  async getUser(id: string): Promise<ExternalUserResponse> {
    return this.api.get(`/users/${id}`);
  }
}
```

### ❌ 変換ロジックの散在

```typescript
// NG: 変換が複数箇所に散在
class Controller {
  async handler() {
    const response = await this.api.get('/users');
    // ここで変換
    const user = {
      id: response.user_id,
      // ...
    };
  }
}
```

### ❌ 過度な汎用化

```typescript
// NG: すべてのAPIに対応しようとする汎用Adapter
class GenericApiAdapter<TExternal, TInternal> {
  // 複雑で保守困難
}
```

## 関連パターン

- **Facade Pattern**: 複数のAdapterを統合
- **Factory Pattern**: Adapterのインスタンス化
- **Strategy Pattern**: 複数の変換戦略の切り替え
