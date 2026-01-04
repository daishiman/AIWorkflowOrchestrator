# リファクタリングパターン集

## メソッドレベル

### Extract Method（メソッド抽出）

**目的**: 長いメソッドを分割し、意図を明確にする

**Before**:

```typescript
function printOwing(invoice: Invoice) {
  let outstanding = 0;

  console.log("***********************");
  console.log("**** Customer Owes ****");
  console.log("***********************");

  // 未払い金計算
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}
```

**After**:

```typescript
function printOwing(invoice: Invoice) {
  printBanner();
  const outstanding = calculateOutstanding(invoice);
  printDetails(invoice, outstanding);
}

function printBanner() {
  console.log("***********************");
  console.log("**** Customer Owes ****");
  console.log("***********************");
}

function calculateOutstanding(invoice: Invoice): number {
  return invoice.orders.reduce((sum, o) => sum + o.amount, 0);
}

function printDetails(invoice: Invoice, outstanding: number) {
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}
```

---

### Replace Temp with Query（一時変数をクエリに）

**目的**: 一時変数を削除し、メソッドに置き換える

**Before**:

```typescript
function getPrice() {
  const basePrice = quantity * itemPrice;
  if (basePrice > 1000) {
    return basePrice * 0.95;
  }
  return basePrice * 0.98;
}
```

**After**:

```typescript
function getPrice() {
  if (basePrice() > 1000) {
    return basePrice() * 0.95;
  }
  return basePrice() * 0.98;
}

function basePrice() {
  return quantity * itemPrice;
}
```

---

### Introduce Parameter Object（パラメータオブジェクト導入）

**目的**: 関連するパラメータをオブジェクトにまとめる

**Before**:

```typescript
function amountInvoiced(startDate: Date, endDate: Date) { ... }
function amountReceived(startDate: Date, endDate: Date) { ... }
function amountOverdue(startDate: Date, endDate: Date) { ... }
```

**After**:

```typescript
interface DateRange {
  start: Date;
  end: Date;
}

function amountInvoiced(range: DateRange) { ... }
function amountReceived(range: DateRange) { ... }
function amountOverdue(range: DateRange) { ... }
```

---

## 条件式

### Decompose Conditional（条件式の分解）

**目的**: 複雑な条件式を読みやすくする

**Before**:

```typescript
if (date.before(SUMMER_START) || date.after(SUMMER_END)) {
  charge = quantity * winterRate + winterServiceCharge;
} else {
  charge = quantity * summerRate;
}
```

**After**:

```typescript
if (isSummer(date)) {
  charge = summerCharge(quantity);
} else {
  charge = winterCharge(quantity);
}

function isSummer(date: Date): boolean {
  return !date.before(SUMMER_START) && !date.after(SUMMER_END);
}

function summerCharge(quantity: number): number {
  return quantity * summerRate;
}

function winterCharge(quantity: number): number {
  return quantity * winterRate + winterServiceCharge;
}
```

---

### Replace Nested Conditional with Guard Clauses

**目的**: ネストを減らし、メインロジックを明確にする

**Before**:

```typescript
function getPayAmount() {
  let result: number;
  if (isDead) {
    result = deadAmount();
  } else {
    if (isSeparated) {
      result = separatedAmount();
    } else {
      if (isRetired) {
        result = retiredAmount();
      } else {
        result = normalPayAmount();
      }
    }
  }
  return result;
}
```

**After**:

```typescript
function getPayAmount() {
  if (isDead) return deadAmount();
  if (isSeparated) return separatedAmount();
  if (isRetired) return retiredAmount();
  return normalPayAmount();
}
```

---

## クラスレベル

### Extract Class（クラス抽出）

**目的**: 責務を分割して単一責任原則を適用

**適用条件**:

- クラスに複数の責務がある
- 一部のフィールドが一緒に変更される
- メソッドの一部が特定のフィールドのみを使用

### Move Method（メソッド移動）

**目的**: メソッドを適切なクラスに移動

**適用条件**:

- 他クラスのデータを多く使用している（Feature Envy）
- メソッドが現在のクラスの他の要素をほぼ使用しない

### Pull Up Method（メソッドの引き上げ）

**目的**: 重複するメソッドを親クラスに移動

**適用条件**:

- 複数のサブクラスに同一のメソッドがある
- メソッドの実装が完全に同一

---

## パターン選択ガイド

| 問題                 | 推奨パターン                         |
| -------------------- | ------------------------------------ |
| 長いメソッド         | Extract Method                       |
| 重複コード           | Extract Method → Move to Superclass  |
| 長いパラメータリスト | Introduce Parameter Object           |
| 複雑な条件式         | Decompose Conditional, Guard Clauses |
| Feature Envy         | Move Method                          |
| 大きすぎるクラス     | Extract Class                        |
| 平行継承階層         | Move Method, Move Field              |
| データクラス         | Move behavior to data class          |
