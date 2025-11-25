# 依存性逆転の原則（DIP: Dependency Inversion Principle）

## 定義

> 「A. 上位モジュールは下位モジュールに依存してはならない。両者とも抽象に依存すべきである。
> B. 抽象は詳細に依存してはならない。詳細が抽象に依存すべきである。」
> - Robert C. Martin

## 核心概念

### 依存の「逆転」
- 従来: 上位モジュール → 下位モジュール（具象に依存）
- 逆転後: 上位モジュール → 抽象 ← 下位モジュール（抽象に依存）

### 目的
- **柔軟性**: 実装の差し替えが容易
- **テスタビリティ**: モックやスタブの注入が可能
- **独立性**: 上位ポリシーが下位の詳細から分離

## コード例

### 違反例

```typescript
// ❌ DIP違反: 上位が下位の具体的な実装に依存

// 下位モジュール（具体的な実装）
class MySQLDatabase {
  query(sql: string): any[] {
    // MySQL固有の実装
    return [];
  }
}

// 上位モジュール（ビジネスロジック）
class UserService {
  private database: MySQLDatabase;

  constructor() {
    // 具体的な実装に直接依存
    this.database = new MySQLDatabase();
  }

  getUsers(): User[] {
    return this.database.query('SELECT * FROM users');
  }
}

// 問題:
// 1. MySQLからPostgreSQLへの変更が困難
// 2. テスト時にモックに差し替えられない
// 3. UserServiceがデータベースの詳細を知っている
```

### 修正例

```typescript
// ✅ DIP準拠: 抽象を介した依存

// 抽象（インターフェース）
interface Database {
  query(sql: string): any[];
}

interface UserRepository {
  findAll(): User[];
  findById(id: string): User | null;
  save(user: User): void;
}

// 下位モジュール（抽象を実装）
class MySQLDatabase implements Database {
  query(sql: string): any[] {
    // MySQL固有の実装
    return [];
  }
}

class MySQLUserRepository implements UserRepository {
  constructor(private db: Database) {}

  findAll(): User[] {
    const rows = this.db.query('SELECT * FROM users');
    return rows.map(row => new User(row.id, row.name));
  }

  findById(id: string): User | null {
    const rows = this.db.query(`SELECT * FROM users WHERE id = '${id}'`);
    return rows[0] ? new User(rows[0].id, rows[0].name) : null;
  }

  save(user: User): void {
    // 保存ロジック
  }
}

// 上位モジュール（抽象に依存）
class UserService {
  constructor(private userRepository: UserRepository) {}

  getUsers(): User[] {
    return this.userRepository.findAll();
  }

  getUserById(id: string): User | null {
    return this.userRepository.findById(id);
  }
}

// 依存性注入（Composition Root）
const database = new MySQLDatabase();
const userRepository = new MySQLUserRepository(database);
const userService = new UserService(userRepository);
```

## 依存性注入パターン

### コンストラクタ注入（推奨）

```typescript
class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private paymentGateway: PaymentGateway,
    private notificationService: NotificationService
  ) {}
}
```

### セッター注入

```typescript
class OrderService {
  private orderRepository?: OrderRepository;

  setOrderRepository(repo: OrderRepository): void {
    this.orderRepository = repo;
  }
}
```

### インターフェース注入

```typescript
interface RepositoryInjection {
  injectRepository(repo: OrderRepository): void;
}

class OrderService implements RepositoryInjection {
  private orderRepository?: OrderRepository;

  injectRepository(repo: OrderRepository): void {
    this.orderRepository = repo;
  }
}
```

## Clean Architecture での適用

```
┌─────────────────────────────────────────────┐
│              Frameworks                      │
│  ┌───────────────────────────────────────┐  │
│  │         Interface Adapters            │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │          Use Cases              │  │  │
│  │  │  ┌───────────────────────────┐  │  │  │
│  │  │  │       Entities           │  │  │  │
│  │  │  │                          │  │  │  │
│  │  │  │  インターフェース定義    │  │  │  │
│  │  │  └───────────────────────────┘  │  │  │
│  │  │         ↑ 依存              │  │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │              ↑ 依存                   │  │
│  └───────────────────────────────────────┘  │
│                 ↑ 依存（逆転）               │
│  具体的な実装（Repository, Gateway等）       │
└─────────────────────────────────────────────┘
```

## 検出パターン

### 違反の兆候

1. **new による直接インスタンス化**: コンストラクタ内での具象クラス生成
2. **静的メソッドへの依存**: `Database.getInstance()`
3. **フレームワーク固有のimport**: 上位モジュールでORMをimport
4. **テスト困難**: モックへの差し替えが困難

### 静的分析

```bash
# コンストラクタ内でのnew
grep -rn "constructor.*{" src/ --include="*.ts" -A 5 | \
  grep "new\s\+[A-Z]"

# 上位モジュールでの下位import
grep -rn "import.*from.*infrastructure" src/core/
grep -rn "import.*from.*database" src/services/

# シングルトン・getInstance パターン
grep -rn "getInstance\|\.instance" src/ --include="*.ts"
```

## 実装ガイドライン

### インターフェースの配置

```
src/
├── core/
│   ├── entities/
│   └── interfaces/          # ← インターフェース定義
│       ├── IUserRepository.ts
│       └── IPaymentGateway.ts
├── infrastructure/          # ← 実装
│   ├── MySQLUserRepository.ts
│   └── StripePaymentGateway.ts
└── application/
    └── services/            # ← インターフェースに依存
        └── UserService.ts
```

### 命名規約

| パターン | 例 |
|---------|---|
| I-プレフィックス | `IUserRepository` |
| -able/-ible サフィックス | `Saveable`, `Readable` |
| 抽象名 | `UserRepository` (実装: `MySQLUserRepository`) |

## チェックリスト

- [ ] 上位モジュールが具体的な実装をimportしていないか
- [ ] インターフェースが上位モジュール側で定義されているか
- [ ] 依存性がコンストラクタで注入されているか
- [ ] コンストラクタ内でnewを使っていないか
- [ ] テスト時にモックに差し替え可能か
