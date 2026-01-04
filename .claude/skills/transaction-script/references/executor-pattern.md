# Executorパターン

## 概要

Executorパターンは、プロジェクト固有のトランザクションスクリプト実装パターンです。
各機能のビジネスロジックを `execute()` メソッドを持つクラスとして実装します。

## 構造

```
features/
└── [機能名]/
    ├── schema.ts      # 入出力スキーマ（Zod）
    ├── executor.ts    # ビジネスロジック（Transaction Script）
    └── __tests__/     # テスト
        └── executor.test.ts
```

## インターフェース

```typescript
/**
 * ワークフロー実行の基本インターフェース
 */
interface IWorkflowExecutor<TInput, TOutput> {
  /**
   * ワークフローを実行する
   * @param input - 入力データ
   * @returns 実行結果
   */
  execute(input: TInput): Promise<TOutput>;
}
```

## 設計原則

### 1. 単一責任

各Executorは一つのビジネストランザクションのみを担当。

```typescript
// ✅ 良い例: 単一責任
class CreateOrderExecutor implements IWorkflowExecutor<CreateOrderInput, Order> {
  async execute(input: CreateOrderInput): Promise<Order> {
    // 注文作成のみ
  }
}

// ❌ 悪い例: 複数責任
class OrderExecutor {
  async create(input: CreateOrderInput): Promise<Order> { ... }
  async update(input: UpdateOrderInput): Promise<Order> { ... }
  async delete(orderId: string): Promise<void> { ... }
}
```

### 2. 依存性注入

外部依存はコンストラクタで注入。

```typescript
class CreateOrderExecutor implements IWorkflowExecutor<
  CreateOrderInput,
  Order
> {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    // リポジトリとサービスを使用
  }
}
```

### 3. スキーマによる検証

入出力をZodスキーマで定義。

```typescript
// schema.ts
import { z } from "zod";

export const createOrderInputSchema = z.object({
  userId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().positive(),
      }),
    )
    .min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

export const createOrderOutputSchema = z.object({
  orderId: z.string(),
  status: z.enum(["pending", "confirmed"]),
  totalAmount: z.number(),
});

export type CreateOrderOutput = z.infer<typeof createOrderOutputSchema>;
```

## 実行フロー

```
execute(input)
    │
    ├─ 1. 入力検証（Zodスキーマ）
    │
    ├─ 2. データ取得（リポジトリ）
    │
    ├─ 3. ビジネスロジック実行
    │
    ├─ 4. 永続化（リポジトリ）
    │
    ├─ 5. 副作用（通知等）
    │
    └─ 6. 結果返却
```

## 実装例

```typescript
// executor.ts
import {
  CreateOrderInput,
  CreateOrderOutput,
  createOrderInputSchema,
} from "./schema";

export class CreateOrderExecutor implements IWorkflowExecutor<
  CreateOrderInput,
  CreateOrderOutput
> {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly inventoryService: IInventoryService,
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    // 1. 入力検証
    const validatedInput = createOrderInputSchema.parse(input);

    // 2. データ取得
    const user = await this.userRepository.findById(validatedInput.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // 3. ビジネスロジック
    const items = validatedInput.items;
    const availability = await this.inventoryService.checkAvailability(items);

    if (!availability.allAvailable) {
      throw new BusinessError("Some items are not available");
    }

    const totalAmount = this.calculateTotal(items, availability.prices);

    // 4. 永続化
    const order = await this.orderRepository.create({
      userId: user.id,
      items,
      totalAmount,
      status: "pending",
    });

    // 5. 結果返却
    return {
      orderId: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
    };
  }

  private calculateTotal(items: OrderItem[], prices: PriceMap): number {
    return items.reduce((sum, item) => {
      return sum + prices[item.productId] * item.quantity;
    }, 0);
  }
}
```

## テスト戦略

```typescript
// __tests__/executor.test.ts
describe("CreateOrderExecutor", () => {
  let executor: CreateOrderExecutor;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockInventoryService: jest.Mocked<IInventoryService>;

  beforeEach(() => {
    mockOrderRepository = createMock<IOrderRepository>();
    mockUserRepository = createMock<IUserRepository>();
    mockInventoryService = createMock<IInventoryService>();

    executor = new CreateOrderExecutor(
      mockOrderRepository,
      mockUserRepository,
      mockInventoryService,
    );
  });

  it("should create order successfully", async () => {
    // Arrange
    mockUserRepository.findById.mockResolvedValue({ id: "user-1" });
    mockInventoryService.checkAvailability.mockResolvedValue({
      allAvailable: true,
      prices: { "product-1": 100 },
    });
    mockOrderRepository.create.mockResolvedValue({
      id: "order-1",
      status: "pending",
      totalAmount: 200,
    });

    // Act
    const result = await executor.execute({
      userId: "user-1",
      items: [{ productId: "product-1", quantity: 2 }],
    });

    // Assert
    expect(result.orderId).toBe("order-1");
    expect(result.totalAmount).toBe(200);
  });
});
```

## チェックリスト

### Executor設計時

- [ ] 単一のビジネストランザクションに限定しているか？
- [ ] 依存性はコンストラクタで注入されているか？
- [ ] 入出力スキーマは定義されているか？
- [ ] エラーケースは適切に処理されているか？

### Executor実装時

- [ ] 入力検証は最初に行われているか？
- [ ] ビジネスロジックは明確に分離されているか？
- [ ] 副作用（通知等）は最後に行われているか？
- [ ] テストは書かれているか？
