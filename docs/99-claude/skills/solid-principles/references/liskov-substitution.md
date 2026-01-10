# リスコフの置換原則（LSP: Liskov Substitution Principle）

## 定義

> 「S が T の派生型であれば、プログラム内で T 型のオブジェクトが使われている箇所は、
> プログラムの振る舞いを変更することなく S 型のオブジェクトで置換可能でなければならない」
>
> - Barbara Liskov

## 核心概念

### 置換可能性

- 派生クラスは基底クラスの契約（Contract）を完全に満たす
- クライアントコードが基底クラスと派生クラスを区別する必要がない
- 「is-a」関係が行動レベルでも成立する

### 契約の構成要素

1. **事前条件**: メソッド呼び出し前に満たすべき条件（緩和のみ可）
2. **事後条件**: メソッド実行後に保証される条件（強化のみ可）
3. **不変条件**: クラスが常に満たすべき条件

## コード例

### 違反例

```typescript
// ❌ LSP違反: 正方形は長方形の派生型として不適切
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
  constructor(side: number) {
    super(side, side);
  }

  // 契約違反: 幅を設定すると高さも変わる
  setWidth(width: number): void {
    this.width = width;
    this.height = width; // 予期しない副作用
  }

  setHeight(height: number): void {
    this.width = height;
    this.height = height; // 予期しない副作用
  }
}

// クライアントコードの問題
function increaseRectangleWidth(rect: Rectangle): void {
  const oldHeight = rect.getArea() / rect.getWidth();
  rect.setWidth(rect.getWidth() + 10);
  // Squareでは高さも変わり、期待した面積にならない
}
```

### 修正例

```typescript
// ✅ LSP準拠: 共通インターフェースを通じた設計

interface Shape {
  getArea(): number;
}

// 不変（Immutable）な設計
class Rectangle implements Shape {
  constructor(
    private readonly width: number,
    private readonly height: number,
  ) {}

  getArea(): number {
    return this.width * this.height;
  }

  withWidth(width: number): Rectangle {
    return new Rectangle(width, this.height);
  }

  withHeight(height: number): Rectangle {
    return new Rectangle(this.width, height);
  }
}

class Square implements Shape {
  constructor(private readonly side: number) {}

  getArea(): number {
    return this.side * this.side;
  }

  withSide(side: number): Square {
    return new Square(side);
  }
}
```

## 違反パターン

### 1. 例外を投げる派生クラス

```typescript
// ❌ 基底クラスにない例外を投げる
class Bird {
  fly(): void {
    console.log("Flying...");
  }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error("Penguins cannot fly"); // LSP違反
  }
}
```

### 2. 空の実装

```typescript
// ❌ 何もしない実装
class Document {
  save(): void {
    // 保存処理
  }
}

class ReadOnlyDocument extends Document {
  save(): void {
    // 何もしない（契約違反）
  }
}
```

### 3. 型チェックによる分岐

```typescript
// ❌ クライアントが型を意識している
function processShape(shape: Shape): void {
  if (shape instanceof Square) {
    // Squareだけ特別扱い = LSP違反の証拠
  }
}
```

## 検出方法

### 静的分析

```bash
# instanceof チェックを検出
grep -rn "instanceof" src/ --include="*.ts"

# 空のメソッド実装
grep -rn "{\s*}" src/ --include="*.ts" -A1 -B1

# NotImplementedError パターン
grep -rn "throw.*not.*implement\|throw.*unsupport" src/ --include="*.ts"
```

### コードレビュー質問

1. 派生クラスは基底クラスのすべての契約を満たしているか？
2. クライアントコードで型チェックが必要になっていないか？
3. 派生クラスが例外を追加していないか？

## 設計指針

### 正しい継承関係の判断

```
質問: 派生クラスは基底クラスの「すべての」振る舞いを持つか？
├─ はい → 継承は適切
└─ いいえ → コンポジションまたは別の抽象化を検討
```

### 契約による設計（Design by Contract）

1. **事前条件**: 派生クラスでより厳しくしてはならない
2. **事後条件**: 派生クラスでより緩くしてはならない
3. **不変条件**: 派生クラスでも維持しなければならない

## チェックリスト

- [ ] 派生クラスが基底クラスのすべてのメソッドを意味的に実装しているか
- [ ] 派生クラスが新たな例外を投げていないか
- [ ] クライアントコードで型による分岐がないか
- [ ] 空のメソッド実装やNotImplemented例外がないか
- [ ] 継承関係が「is-a」を行動レベルで満たしているか
