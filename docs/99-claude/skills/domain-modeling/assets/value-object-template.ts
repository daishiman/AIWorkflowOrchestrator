/**
 * Value Object テンプレート
 *
 * 使用方法:
 *   1. このファイルをコピーして新しいValue Objectを作成
 *   2. {{ValueObjectName}} を実際の名前に置換
 *   3. 属性とバリデーションを実装
 */

export class {{ValueObjectName}} {
  // readonly で不変性を保証
  private constructor(
    // 全属性をreadonlyで定義
    // public readonly field1: Type1,
    // public readonly field2: Type2,
  ) {
    this.validate();
    Object.freeze(this); // 完全な不変性
  }

  // ファクトリメソッド
  static create(
    // パラメータ
  ): {{ValueObjectName}} {
    return new {{ValueObjectName}}(
      // パラメータを渡す
    );
  }

  // バリデーション
  private validate(): void {
    // 不変条件を検証
    // if (invalidCondition) {
    //   throw new Error("Invalid {{ValueObjectName}}: reason");
    // }
  }

  // 等価性は全属性で判定
  equals(other: {{ValueObjectName}}): boolean {
    if (!(other instanceof {{ValueObjectName}})) {
      return false;
    }
    // 全属性を比較
    // return this.field1 === other.field1 && this.field2 === other.field2;
    return true; // 実装時に修正
  }

  // 操作は新しいインスタンスを返す（不変性）
  // withUpdatedField(newValue: Type): {{ValueObjectName}} {
  //   return new {{ValueObjectName}}(newValue, this.field2);
  // }

  // 文字列表現
  toString(): string {
    // return `${this.field1} (${this.field2})`;
    return "{{ValueObjectName}}";
  }

  // JSONシリアライズ用
  toJSON(): Record<string, unknown> {
    return {
      // field1: this.field1,
      // field2: this.field2,
    };
  }
}

// 使用例: Money
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {
    this.validate();
    Object.freeze(this);
  }

  static create(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error("Money amount cannot be negative");
    }
    if (!this.currency || this.currency.length !== 3) {
      throw new Error("Currency must be a 3-letter code");
    }
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
