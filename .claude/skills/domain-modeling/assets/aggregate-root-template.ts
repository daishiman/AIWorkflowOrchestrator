/**
 * Aggregate Root テンプレート
 *
 * 使用方法:
 *   1. このファイルをコピーして新しいAggregateを作成
 *   2. {{AggregateName}} を実際の集約名に置換
 *   3. 内部エンティティ、不変条件、ドメインイベントを実装
 */

// ドメインイベントインターフェース
export interface DomainEvent {
  readonly eventType: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
}

// 集約ルートID
export class {{AggregateName}}Id {
  private constructor(private readonly value: string) {}

  static generate(): {{AggregateName}}Id {
    return new {{AggregateName}}Id(crypto.randomUUID());
  }

  static fromString(value: string): {{AggregateName}}Id {
    if (!value) throw new Error("{{AggregateName}}Id cannot be empty");
    return new {{AggregateName}}Id(value);
  }

  equals(other: {{AggregateName}}Id): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// 集約ルート
export class {{AggregateName}} {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    private readonly id: {{AggregateName}}Id,
    // 内部エンティティやValue Object
    // private items: InternalItem[],
    // private status: Status,
  ) {
    this.validateInvariants();
  }

  // ファクトリメソッド
  static create(): {{AggregateName}} {
    const aggregate = new {{AggregateName}}({{AggregateName}}Id.generate());
    // 作成イベントを記録
    // aggregate.recordEvent(new {{AggregateName}}Created(aggregate.id));
    return aggregate;
  }

  // 復元用（リポジトリから）
  static reconstitute(id: {{AggregateName}}Id): {{AggregateName}} {
    return new {{AggregateName}}(id);
  }

  // ゲッター
  getId(): {{AggregateName}}Id {
    return this.id;
  }

  // ビジネスオペレーション
  // 外部からの変更は必ずAggregateRoot経由
  // performOperation(params): void {
  //   // ガード条件
  //   if (!this.canPerformOperation()) {
  //     throw new Error("Operation not allowed in current state");
  //   }
  //
  //   // 状態変更
  //   // this.status = newStatus;
  //
  //   // 不変条件の検証
  //   this.validateInvariants();
  //
  //   // イベント記録
  //   this.recordEvent(new OperationPerformed(this.id, params));
  // }

  // 集約全体の不変条件を検証
  private validateInvariants(): void {
    // 不変条件をここに実装
    // if (!this.invariantHolds()) {
    //   throw new Error("Invariant violated: description");
    // }
  }

  // ドメインイベント管理
  protected recordEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }

  // 等価性はIDで判定
  equals(other: {{AggregateName}}): boolean {
    return this.id.equals(other.id);
  }
}

// 内部エンティティの例（外部に公開しない）
// class InternalItem {
//   constructor(
//     private readonly itemId: ItemId,
//     private quantity: number,
//   ) {}
//
//   updateQuantity(newQuantity: number): void {
//     if (newQuantity < 0) {
//       throw new Error("Quantity cannot be negative");
//     }
//     this.quantity = newQuantity;
//   }
// }
