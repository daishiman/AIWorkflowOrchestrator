# ドメインサービスパターン集

## 概要

よく使用されるドメインサービスのパターンを紹介します。
プロジェクトの要件に応じて適切なパターンを選択してください。

## 計算サービス

### パターン: 価格計算サービス

複雑な価格計算ロジックをカプセル化します。

```typescript
interface IPricingService {
  calculatePrice(order: Order, context: PricingContext): Money;
  calculateDiscount(order: Order, customer: Customer): Percentage;
  calculateTax(subtotal: Money, address: Address): Money;
}

class PricingService implements IPricingService {
  calculatePrice(order: Order, context: PricingContext): Money {
    const subtotal = order.subtotal;
    const discount = this.calculateDiscount(order, context.customer);
    const discountedPrice = subtotal.multiply(1 - discount.toDecimal());
    const tax = this.calculateTax(discountedPrice, context.shippingAddress);

    return discountedPrice.add(tax);
  }

  calculateDiscount(order: Order, customer: Customer): Percentage {
    let totalDiscount = Percentage.of(0);

    // 会員ランク割引
    totalDiscount = totalDiscount.add(
      this.getMemberDiscount(customer.rank)
    );

    // 数量割引
    if (order.totalQuantity >= 10) {
      totalDiscount = totalDiscount.add(Percentage.of(5));
    }

    // 最大割引率の制限
    return totalDiscount.min(Percentage.of(30));
  }

  calculateTax(subtotal: Money, address: Address): Money {
    const taxRate = this.getTaxRate(address);
    return subtotal.multiply(taxRate.toDecimal());
  }

  private getMemberDiscount(rank: CustomerRank): Percentage {
    const discountMap: Record<CustomerRank, number> = {
      [CustomerRank.PLATINUM]: 15,
      [CustomerRank.GOLD]: 10,
      [CustomerRank.SILVER]: 5,
      [CustomerRank.BRONZE]: 0,
    };
    return Percentage.of(discountMap[rank] ?? 0);
  }

  private getTaxRate(address: Address): Percentage {
    // 地域による税率
    return Percentage.of(10); // 簡略化
  }
}
```

### パターン: 配送料計算サービス

配送料金の計算ロジックをカプセル化します。

```typescript
interface IShippingCalculationService {
  calculate(params: ShippingCalculationParams): ShippingCost;
  estimateDeliveryDate(params: DeliveryEstimationParams): DateRange;
}

interface ShippingCalculationParams {
  origin: Address;
  destination: Address;
  items: ShippableItem[];
  method: ShippingMethod;
}

class ShippingCalculationService implements IShippingCalculationService {
  calculate(params: ShippingCalculationParams): ShippingCost {
    const { origin, destination, items, method } = params;

    // 基本料金
    const baseCost = method.baseCost;

    // 距離による追加料金
    const distance = this.calculateDistance(origin, destination);
    const distanceSurcharge = this.calculateDistanceSurcharge(distance, method);

    // 重量による追加料金
    const totalWeight = this.calculateTotalWeight(items);
    const weightSurcharge = this.calculateWeightSurcharge(totalWeight, method);

    // サイズによる追加料金
    const volumetricWeight = this.calculateVolumetricWeight(items);
    const sizeSurcharge = this.calculateSizeSurcharge(volumetricWeight, method);

    return ShippingCost.create({
      baseCost,
      distanceSurcharge,
      weightSurcharge,
      sizeSurcharge,
      method,
    });
  }

  estimateDeliveryDate(params: DeliveryEstimationParams): DateRange {
    const { origin, destination, method, orderDate } = params;

    const distance = this.calculateDistance(origin, destination);
    const baseDeliveryDays = method.baseDeliveryDays;
    const additionalDays = this.calculateAdditionalDays(distance);

    const minDays = baseDeliveryDays;
    const maxDays = baseDeliveryDays + additionalDays;

    const startDate = this.addBusinessDays(orderDate, minDays);
    const endDate = this.addBusinessDays(orderDate, maxDays);

    return DateRange.create(startDate, endDate);
  }

  private calculateDistance(from: Address, to: Address): number {
    // 距離計算ロジック
    return 100; // 簡略化
  }

  private calculateTotalWeight(items: ShippableItem[]): number {
    return items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  }

  private calculateVolumetricWeight(items: ShippableItem[]): number {
    return items.reduce((sum, item) => {
      const volume = item.length * item.width * item.height;
      return sum + (volume / 5000) * item.quantity; // 標準的な換算係数
    }, 0);
  }
}
```

## 検証サービス

### パターン: ビジネスルール検証サービス

複数のビジネスルールを検証します。

```typescript
interface IOrderValidationService {
  validate(order: Order, context: ValidationContext): ValidationResult;
}

interface ValidationContext {
  customer: Customer;
  inventory: InventoryStatus;
  currentTime: Date;
}

class OrderValidationService implements IOrderValidationService {
  private readonly rules: OrderValidationRule[] = [];

  constructor() {
    // ルールの登録
    this.rules.push(
      new CustomerActiveRule(),
      new CreditLimitRule(),
      new InventoryAvailabilityRule(),
      new OrderAmountRule(),
      new BusinessHoursRule()
    );
  }

  validate(order: Order, context: ValidationContext): ValidationResult {
    const errors: ValidationError[] = [];

    for (const rule of this.rules) {
      const result = rule.validate(order, context);
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }

    return errors.length === 0
      ? ValidationResult.valid()
      : ValidationResult.invalid(errors);
  }
}

// 個別のルールクラス
interface OrderValidationRule {
  validate(order: Order, context: ValidationContext): RuleValidationResult;
}

class CreditLimitRule implements OrderValidationRule {
  validate(order: Order, context: ValidationContext): RuleValidationResult {
    const { customer } = context;
    const orderTotal = order.total;

    if (customer.creditLimit.isLessThan(orderTotal)) {
      return RuleValidationResult.invalid(
        new ValidationError(
          'CREDIT_LIMIT_EXCEEDED',
          `与信限度（${customer.creditLimit.format()}）を超えています`
        )
      );
    }

    return RuleValidationResult.valid();
  }
}
```

## 変換サービス

### パターン: ドメイン間変換サービス

ドメインオブジェクト間の変換を行います。

```typescript
interface IOrderToInvoiceService {
  convert(order: Order, customer: Customer): Invoice;
}

class OrderToInvoiceService implements IOrderToInvoiceService {
  convert(order: Order, customer: Customer): Invoice {
    return Invoice.create({
      invoiceNumber: this.generateInvoiceNumber(),
      orderId: order.id,
      customerId: customer.id,
      customerName: customer.name,
      billingAddress: customer.billingAddress,
      lineItems: this.convertLineItems(order.items),
      subtotal: order.subtotal,
      discounts: this.convertDiscounts(order.appliedDiscounts),
      tax: this.calculateTax(order),
      total: order.total,
      issueDate: new Date(),
      dueDate: this.calculateDueDate(customer.paymentTerms),
      paymentTerms: customer.paymentTerms,
    });
  }

  private convertLineItems(orderItems: OrderItem[]): InvoiceLineItem[] {
    return orderItems.map((item, index) =>
      InvoiceLineItem.create({
        lineNumber: index + 1,
        description: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.subtotal,
      })
    );
  }

  private convertDiscounts(discounts: AppliedDiscount[]): InvoiceDiscount[] {
    return discounts.map(discount =>
      InvoiceDiscount.create({
        description: discount.description,
        amount: discount.amount,
      })
    );
  }

  private calculateTax(order: Order): Money {
    // 税金計算ロジック
    return order.subtotal.multiply(0.1);
  }

  private calculateDueDate(terms: PaymentTerms): Date {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + terms.days);
    return dueDate;
  }

  private generateInvoiceNumber(): InvoiceNumber {
    // 請求書番号生成ロジック
    return InvoiceNumber.generate();
  }
}
```

## 調整サービス

### パターン: 複数集約の調整サービス

複数の集約を協調させる操作を行います。

```typescript
interface IOrderFulfillmentService {
  fulfill(order: Order, warehouse: Warehouse): FulfillmentResult;
}

class OrderFulfillmentService implements IOrderFulfillmentService {
  fulfill(order: Order, warehouse: Warehouse): FulfillmentResult {
    // 在庫引当
    const reservations = this.reserveInventory(order, warehouse);
    if (!reservations.isSuccessful) {
      return FulfillmentResult.failed(reservations.errors);
    }

    // 出荷指示作成
    const shipment = this.createShipment(order, reservations);

    // 注文ステータス更新
    order.markAsFulfilling();

    return FulfillmentResult.success(shipment);
  }

  private reserveInventory(
    order: Order,
    warehouse: Warehouse
  ): ReservationResult {
    const reservations: InventoryReservation[] = [];

    for (const item of order.items) {
      const stock = warehouse.getStockFor(item.productId);
      if (!stock || stock.available < item.quantity) {
        return ReservationResult.failed([
          new InsufficientStockError(item.productId, item.quantity),
        ]);
      }

      const reservation = stock.reserve(item.quantity, order.id);
      reservations.push(reservation);
    }

    return ReservationResult.success(reservations);
  }

  private createShipment(
    order: Order,
    reservations: ReservationResult
  ): Shipment {
    return Shipment.create({
      orderId: order.id,
      reservations: reservations.reservations,
      shippingAddress: order.shippingAddress,
      expectedDelivery: this.calculateExpectedDelivery(order),
    });
  }

  private calculateExpectedDelivery(order: Order): Date {
    // 配送予定日計算
    const date = new Date();
    date.setDate(date.getDate() + 3); // 簡略化
    return date;
  }
}
```

## ポリシーサービス

### パターン: ビジネスポリシーサービス

ビジネスポリシーを表現します。

```typescript
interface IReturnPolicyService {
  canReturn(order: Order, item: OrderItem, reason: ReturnReason): boolean;
  calculateRefund(item: OrderItem, returnedQuantity: number): Money;
  getReturnDeadline(order: Order): Date;
}

class ReturnPolicyService implements IReturnPolicyService {
  private readonly returnPeriodDays = 30;
  private readonly restockingFeeRate = Percentage.of(10);
  private readonly noRefundCategories = ['DIGITAL', 'PERISHABLE', 'CUSTOM'];

  canReturn(order: Order, item: OrderItem, reason: ReturnReason): boolean {
    // 返品期限チェック
    if (this.isReturnPeriodExpired(order)) {
      return false;
    }

    // カテゴリチェック
    if (this.noRefundCategories.includes(item.category)) {
      return false;
    }

    // 理由による制限
    if (reason === ReturnReason.CHANGED_MIND && item.isOpened) {
      return false;
    }

    return true;
  }

  calculateRefund(item: OrderItem, returnedQuantity: number): Money {
    const itemTotal = item.unitPrice.multiply(returnedQuantity);

    // 返品理由に関係なく再在庫化手数料を適用
    const restockingFee = itemTotal.multiply(this.restockingFeeRate.toDecimal());

    return itemTotal.subtract(restockingFee);
  }

  getReturnDeadline(order: Order): Date {
    const deadline = new Date(order.deliveredAt!);
    deadline.setDate(deadline.getDate() + this.returnPeriodDays);
    return deadline;
  }

  private isReturnPeriodExpired(order: Order): boolean {
    if (!order.deliveredAt) {
      return false;
    }
    const deadline = this.getReturnDeadline(order);
    return new Date() > deadline;
  }
}
```

## パターン選択ガイド

| 場面 | 推奨パターン |
|-----|------------|
| 価格・料金の計算 | 計算サービス |
| ビジネスルールの検証 | 検証サービス |
| ドメイン間のデータ変換 | 変換サービス |
| 複数集約の協調 | 調整サービス |
| ビジネスポリシーの表現 | ポリシーサービス |
