# Level 2: Intermediate Modular Architecture

## 概要

Level 1の基礎知識を踏まえ、より高度な設計パターン、インターフェース設計、依存性管理の実践的手法を学習する。

## 1. SOLID原則の完全理解

### 1.1 単一責任の原則（SRP）の深掘り

モジュールが変更される理由は1つのみであるべき。

**判断基準**: 「このモジュールはなぜ変更されるか？」を問う。

```typescript
// Bad: 複数の変更理由
class Employee {
  calculatePay(): number {} // 会計部門の要求で変更
  reportHours(): number {} // 人事部門の要求で変更
  save(): void {} // DBA の要求で変更
}

// Good: 責務を分離
class PayCalculator {
  calculatePay(employee: Employee): number {}
}

class HourReporter {
  reportHours(employee: Employee): number {}
}

class EmployeeRepository {
  save(employee: Employee): void {}
}
```

### 1.2 開放閉鎖の原則（OCP）

拡張に対して開いており、修正に対して閉じている。

```typescript
// Bad: 新しい形状を追加するたびに修正が必要
class AreaCalculator {
  calculateArea(shapes: any[]): number {
    let area = 0;
    for (const shape of shapes) {
      if (shape.type === "circle") {
        area += Math.PI * shape.radius ** 2;
      } else if (shape.type === "rectangle") {
        area += shape.width * shape.height;
      }
    }
    return area;
  }
}

// Good: 新しい形状を追加しても既存コードを修正しない
interface Shape {
  calculateArea(): number;
}

class Circle implements Shape {
  constructor(private radius: number) {}
  calculateArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number,
  ) {}
  calculateArea(): number {
    return this.width * this.height;
  }
}

class AreaCalculator {
  calculateArea(shapes: Shape[]): number {
    return shapes.reduce((sum, shape) => sum + shape.calculateArea(), 0);
  }
}
```

### 1.3 リスコフの置換原則（LSP）

サブタイプは基底タイプと置換可能であるべき。

```typescript
// Bad: LSP違反
class Rectangle {
  constructor(
    protected width: number,
    protected height: number,
  ) {}

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  setWidth(width: number): void {
    this.width = width;
    this.height = width; // 副作用: 高さも変わる
  }

  setHeight(height: number): void {
    this.width = height;
    this.height = height; // 副作用: 幅も変わる
  }
}

// Good: インターフェースで分離
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number,
  ) {}
  getArea(): number {
    return this.width * this.height;
  }
}

class Square implements Shape {
  constructor(private side: number) {}
  getArea(): number {
    return this.side * this.side;
  }
}
```

### 1.4 インターフェース分離の原則（ISP）

クライアントは使用しないメソッドへの依存を強制されるべきではない。

```typescript
// Bad: 太ったインターフェース
interface Worker {
  work(): void;
  eat(): void;
}

class HumanWorker implements Worker {
  work(): void {
    /* 仕事をする */
  }
  eat(): void {
    /* 食事をする */
  }
}

class RobotWorker implements Worker {
  work(): void {
    /* 仕事をする */
  }
  eat(): void {
    /* ロボットは食事をしない */ throw new Error();
  }
}

// Good: インターフェースを分離
interface Workable {
  work(): void;
}

interface Eatable {
  eat(): void;
}

class HumanWorker implements Workable, Eatable {
  work(): void {
    /* 仕事をする */
  }
  eat(): void {
    /* 食事をする */
  }
}

class RobotWorker implements Workable {
  work(): void {
    /* 仕事をする */
  }
}
```

### 1.5 依存性逆転の原則（DIP）の詳細

高レベルモジュールは低レベルモジュールに依存してはならず、両者は抽象に依存すべき。

```typescript
// Bad: 高レベルが低レベルに直接依存
class MySQLDatabase {
  save(data: any): void {
    /* MySQL固有の処理 */
  }
}

class UserService {
  private database = new MySQLDatabase();

  saveUser(user: User): void {
    this.database.save(user);
  }
}

// Good: 両者が抽象に依存
interface IDatabase {
  save(data: any): void;
}

class MySQLDatabase implements IDatabase {
  save(data: any): void {
    /* MySQL固有の処理 */
  }
}

class PostgreSQLDatabase implements IDatabase {
  save(data: any): void {
    /* PostgreSQL固有の処理 */
  }
}

class UserService {
  constructor(private database: IDatabase) {}

  saveUser(user: User): void {
    this.database.save(user);
  }
}
```

## 2. 高度なモジュール間通信

### 2.1 メディエーターパターン

モジュール間の複雑な通信を中央集権的に管理。

```typescript
interface Mediator {
  notify(sender: Component, event: string): void;
}

abstract class Component {
  constructor(protected mediator: Mediator) {}
}

class ConcreteMediator implements Mediator {
  private component1: Component1;
  private component2: Component2;

  setComponents(c1: Component1, c2: Component2): void {
    this.component1 = c1;
    this.component2 = c2;
  }

  notify(sender: Component, event: string): void {
    if (event === "A") {
      this.component2.doSomething();
    }
  }
}
```

### 2.2 オブザーバーパターン

イベント駆動の疎結合通信。

```typescript
interface Observer {
  update(subject: Subject): void;
}

class Subject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    this.observers.splice(index, 1);
  }

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }
}
```

## 3. 依存性注入（DI）パターン

### 3.1 コンストラクタ注入

```typescript
class UserService {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
  ) {}
}
```

### 3.2 セッター注入

```typescript
class UserService {
  private userRepository: IUserRepository;

  setUserRepository(repository: IUserRepository): void {
    this.userRepository = repository;
  }
}
```

### 3.3 DIコンテナの活用

```typescript
// InversifyJS の例
import { Container, injectable, inject } from "inversify";

@injectable()
class UserRepository implements IUserRepository {
  // ...
}

@injectable()
class UserService {
  constructor(
    @inject("IUserRepository") private userRepository: IUserRepository,
  ) {}
}

const container = new Container();
container.bind<IUserRepository>("IUserRepository").to(UserRepository);
container.bind<UserService>(UserService).toSelf();

const userService = container.get<UserService>(UserService);
```

## 4. モジュール境界の設計

### 4.1 境界づけられたコンテキスト（Bounded Context）

DDDの概念を活用し、モジュール境界を明確化。

**例**: Eコマースシステム

```
Sales Context:
  - Product (販売の観点: 価格、在庫)
  - Order
  - Customer (購入者としての顧客)

Shipping Context:
  - Product (配送の観点: 重量、サイズ)
  - Shipment
  - Customer (配送先としての顧客)

Catalog Context:
  - Product (カタログの観点: 説明、画像)
  - Category
```

各コンテキストで同じ用語（Product、Customer）を使用しても、意味が異なる。

### 4.2 コンテキストマッピング

コンテキスト間の関係を定義。

- **Shared Kernel**: 共有される小さなコア
- **Customer-Supplier**: 上流と下流の関係
- **Conformist**: 下流が上流に従う
- **Anti-Corruption Layer**: 変換層で保護

## 5. レイヤーアーキテクチャの詳細

### 5.1 4層アーキテクチャ

```typescript
// Presentation Layer
class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: Request, res: Response): Promise<void> {
    const userData = req.body;
    const user = await this.userService.createUser(userData);
    res.json(user);
  }
}

// Application Layer
class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(userData: CreateUserDTO): Promise<User> {
    const user = new User(userData);
    user.validate();
    return await this.userRepository.save(user);
  }
}

// Domain Layer
class User {
  constructor(
    private id: string,
    private email: string,
    private name: string,
  ) {}

  validate(): void {
    if (!this.email.includes("@")) {
      throw new Error("Invalid email");
    }
  }
}

// Infrastructure Layer
class UserRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    // データベースへの保存
  }
}
```

## 6. インターフェース設計のベストプラクティス

### 6.1 公開APIの最小化

必要最小限のメソッドのみを公開する。

### 6.2 安定した抽象

インターフェースは変更頻度が低く、安定しているべき。

### 6.3 明示的な契約

型定義で契約を明確化。

```typescript
interface IOrderService {
  /**
   * 注文を作成する
   * @param order - 注文データ
   * @returns 作成された注文
   * @throws OrderValidationError - 注文が無効な場合
   */
  createOrder(order: CreateOrderDTO): Promise<Order>;
}
```

## 7. 循環依存の解消

### 7.1 インターフェースの導入

```typescript
// Before: 循環依存
class A {
  constructor(private b: B) {}
}

class B {
  constructor(private a: A) {}
}

// After: インターフェースで解決
interface IA {
  methodA(): void;
}

interface IB {
  methodB(): void;
}

class A implements IA {
  constructor(private b: IB) {}
  methodA(): void {}
}

class B implements IB {
  constructor(private a: IA) {}
  methodB(): void {}
}
```

### 7.2 メディエーターの導入

循環依存をメディエーターを通じた間接通信に置き換える。

## 8. 次のステップ

Level 2 をマスターしたら、次は以下を学習:

- **Level 3**: ヘキサゴナルアーキテクチャ、CQRS、イベントソーシング
- **interface-design.md**: インターフェース設計の詳細パターン
- **dip-patterns.md**: 依存性逆転の実践パターン
