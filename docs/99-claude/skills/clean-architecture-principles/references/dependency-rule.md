# 依存関係ルール詳細

## 基本原則

**「依存は常に外側から内側へのみ」**

これは Clean Architecture の最も重要な原則である。

## 依存の方向

```
Framework & Drivers (最外層)
         ↓
Interface Adapters
         ↓
    Use Cases
         ↓
     Entities (最内層)
```

## 何が依存とみなされるか

### コード依存

1. **import/require文**:

   ```typescript
   // ❌ 内側から外側への依存
   // entities/user.ts
   import { DrizzleORM } from "drizzle-orm"; // フレームワーク依存

   // ✅ 正しい依存方向
   // infrastructure/user-repository.ts
   import { User } from "../entities/user"; // 外側から内側へ
   ```

2. **型参照**:

   ```typescript
   // ❌ 内側が外側の型を参照
   // entities/user.ts
   type DBUser = InferSelectModel<typeof users>; // DB型への依存

   // ✅ 独自の型を定義
   // entities/user.ts
   interface User {
     id: string;
     name: string;
   }
   ```

3. **継承/実装**:

   ```typescript
   // ❌ 内側が外側のクラスを継承
   // entities/user.ts
   class User extends ORMModel {} // ORMクラスへの依存

   // ✅ 純粋なドメインモデル
   // entities/user.ts
   class User {
     constructor(
       public id: string,
       public name: string,
     ) {}
   }
   ```

### データ依存

- 外側のデータ形式が内側に漏出していないか
- 内側が外側のスキーマに依存していないか

## レイヤー間の通信

### 依存性逆転パターン

内側が外側の機能を必要とする場合:

1. **内側でインターフェースを定義**
2. **外側がインターフェースを実装**
3. **依存性注入で接続**

```typescript
// use-cases/interfaces/user-repository.ts（内側）
interface IUserRepository {
  findById(id: string): Promise<User>;
}

// infrastructure/user-repository-impl.ts（外側）
class UserRepositoryImpl implements IUserRepository {
  findById(id: string): Promise<User> {
    // DB操作
  }
}
```

## 違反検出方法

### インポート文の分析

```bash
# Entities層の外部依存検出
grep -r "import.*from.*framework\|import.*from.*infrastructure" src/entities/

# Use Cases層の不正な依存検出
grep -r "import.*from.*adapters\|import.*from.*framework" src/use-cases/
```

### 自動化チェック

- ESLint: eslint-plugin-import
- 依存関係分析ツール: madge, dependency-cruiser

## 違反への対処

1. **インターフェースの導入**: 依存を抽象に変更
2. **責務の再配置**: コードを適切なレイヤーに移動
3. **アダプターの作成**: 外部との橋渡し層を追加
