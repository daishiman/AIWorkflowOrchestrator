# 開放閉鎖の原則（OCP: Open-Closed Principle）

## 定義

> 「ソフトウェアの実体（クラス、モジュール、関数など）は拡張に対して開いており、
> 修正に対して閉じていなければならない」
> - Bertrand Meyer

## 核心概念

### 開放と閉鎖
- **拡張に開放**: 新しい振る舞いを追加できる
- **修正に閉鎖**: 既存のコードを変更する必要がない

### 実現手段
1. **抽象化**: インターフェースや抽象クラスの活用
2. **ポリモーフィズム**: 実装の差し替えによる振る舞い変更
3. **依存性注入**: 具体的な実装の外部からの注入

## コード例

### 違反例

```typescript
// ❌ OCP違反: 新しい形状を追加するたびに修正が必要
class AreaCalculator {
  calculateArea(shape: any): number {
    if (shape.type === 'circle') {
      return Math.PI * shape.radius ** 2;
    } else if (shape.type === 'rectangle') {
      return shape.width * shape.height;
    } else if (shape.type === 'triangle') {
      // 新しい形状のたびにここを修正
      return (shape.base * shape.height) / 2;
    }
    throw new Error('Unknown shape');
  }
}
```

### 修正例

```typescript
// ✅ OCP準拠: 拡張に開放、修正に閉鎖

// 抽象インターフェース
interface Shape {
  area(): number;
}

// 具体的な実装（拡張）
class Circle implements Shape {
  constructor(private radius: number) {}

  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}

  area(): number {
    return this.width * this.height;
  }
}

// 新しい形状を追加（既存コードの修正不要）
class Triangle implements Shape {
  constructor(private base: number, private height: number) {}

  area(): number {
    return (this.base * this.height) / 2;
  }
}

// 計算機（修正不要で新しい形状に対応）
class AreaCalculator {
  calculateArea(shape: Shape): number {
    return shape.area();
  }

  calculateTotal(shapes: Shape[]): number {
    return shapes.reduce((sum, shape) => sum + shape.area(), 0);
  }
}
```

## 適用パターン

### Strategy パターン

```typescript
// 支払い処理の例
interface PaymentStrategy {
  pay(amount: number): void;
}

class CreditCardPayment implements PaymentStrategy {
  pay(amount: number): void {
    // クレジットカード決済
  }
}

class PayPalPayment implements PaymentStrategy {
  pay(amount: number): void {
    // PayPal決済
  }
}

// 新しい決済方法を追加しても PaymentProcessor は変更不要
class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  process(amount: number): void {
    this.strategy.pay(amount);
  }
}
```

### Template Method パターン

```typescript
// データエクスポートの例
abstract class DataExporter {
  // テンプレートメソッド（修正不要）
  export(data: any[]): string {
    const formatted = this.format(data);
    return this.serialize(formatted);
  }

  // 拡張ポイント
  protected abstract format(data: any[]): any;
  protected abstract serialize(data: any): string;
}

class JsonExporter extends DataExporter {
  protected format(data: any[]): any {
    return data;
  }

  protected serialize(data: any): string {
    return JSON.stringify(data);
  }
}

class CsvExporter extends DataExporter {
  protected format(data: any[]): any {
    // CSVフォーマットに変換
    return data;
  }

  protected serialize(data: any): string {
    // CSV文字列に変換
    return '';
  }
}
```

## 検出パターン

### 違反の兆候

1. **switch/if文の連鎖**: 型による分岐が複数箇所に存在
2. **頻繁な既存コード修正**: 新機能追加時に既存ファイルを変更
3. **typeフィールド**: オブジェクトに `type: string` が存在

### 静的分析

```bash
# switch文を含むファイル
grep -rn "switch\s*(" src/ --include="*.ts"

# 型判定パターン
grep -rn "\.type\s*===\|typeof\s" src/ --include="*.ts"
```

## 適用指針

### いつOCPを適用するか
- 同じ分岐が複数箇所に出現
- 新しいバリエーションの追加が予想される
- 変更が既存コードのテストを破壊する

### いつOCPを緩和するか
- 変更が予想されない安定した領域
- 過度な抽象化によるコード複雑化
- 単純なケース（2-3の固定バリエーション）

## チェックリスト

- [ ] 新機能追加時に既存コードの修正が不要か
- [ ] switch/if文が型による分岐をしていないか
- [ ] 拡張ポイント（インターフェース）が定義されているか
- [ ] 具体的な実装が抽象に依存しているか
