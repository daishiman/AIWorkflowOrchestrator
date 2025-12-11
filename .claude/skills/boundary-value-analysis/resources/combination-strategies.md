# 組み合わせ戦略

## 概要

複数の入力パラメータがある場合、すべての組み合わせをテストすると
テスト数が爆発的に増加します。効率的な組み合わせ戦略を解説します。

---

## 組み合わせの爆発

### 問題

```
3つのパラメータ、各3値:
- 全組み合わせ: 3 × 3 × 3 = 27テスト

5つのパラメータ、各5値:
- 全組み合わせ: 5^5 = 3,125テスト

10パラメータ、各3値:
- 全組み合わせ: 3^10 = 59,049テスト
```

---

## 戦略1: 単一障害仮定

### 概念

一度に1つのパラメータのみを変化させる。

### 例

```
パラメータ:
- A: {a1, a2}
- B: {b1, b2}
- C: {c1, c2}

基準値: (a1, b1, c1)

テストケース:
1. (a1, b1, c1)  ← 基準
2. (a2, b1, c1)  ← Aを変化
3. (a1, b2, c1)  ← Bを変化
4. (a1, b1, c2)  ← Cを変化
```

### テスト数

```
全組み合わせ: 2 × 2 × 2 = 8
単一障害仮定: 1 + (2-1) × 3 = 4
```

---

## 戦略2: ペアワイズテスト

### 概念

すべてのパラメータのペア（2つの組み合わせ）を網羅する。

### 例

```
パラメータ:
- Browser: {Chrome, Firefox, Safari}
- OS: {Windows, Mac, Linux}
- Resolution: {1080p, 4K}

全組み合わせ: 3 × 3 × 2 = 18

ペアワイズ:
1. (Chrome, Windows, 1080p)
2. (Chrome, Mac, 4K)
3. (Chrome, Linux, 1080p)
4. (Firefox, Windows, 4K)
5. (Firefox, Mac, 1080p)
6. (Firefox, Linux, 4K)
7. (Safari, Windows, 1080p)
8. (Safari, Mac, 4K)
9. (Safari, Linux, 1080p)

→ 9テストで全ペアをカバー
```

### ペアワイズの効果

| パラメータ数 | 値の数 | 全組み合わせ | ペアワイズ |
| ------------ | ------ | ------------ | ---------- |
| 3            | 3      | 27           | 9          |
| 4            | 3      | 81           | 9          |
| 5            | 3      | 243          | 12         |
| 10           | 3      | 59,049       | 17         |
| 20           | 3      | 3.5億        | 20         |

### ツール

```bash
# PICTツール（Microsoft）
# https://github.com/Microsoft/pict

# 入力ファイル
cat > params.txt << EOF
Browser: Chrome, Firefox, Safari
OS: Windows, Mac, Linux
Resolution: 1080p, 4K
EOF

# 生成
pict params.txt
```

---

## 戦略3: デシジョンテーブル

### 概念

条件の組み合わせと対応するアクションを表形式で整理。

### 例

```
注文処理のルール:
- 会員かどうか
- 購入金額が5000円以上か
- 初回購入か

| 条件 | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
|------|----|----|----|----|----|----|----|----|
| 会員 | Y | Y | Y | Y | N | N | N | N |
| 5000円以上 | Y | Y | N | N | Y | Y | N | N |
| 初回購入 | Y | N | Y | N | Y | N | Y | N |
| 結果 |
| 10%割引 | ✓ | ✓ | - | - | - | - | - | - |
| 5%割引 | - | - | ✓ | ✓ | - | - | - | - |
| 送料無料 | ✓ | ✓ | ✓ | - | ✓ | - | - | - |
| ポイント2倍 | ✓ | - | ✓ | - | - | - | - | - |
```

### TypeScriptでの実装

```typescript
interface TestCase {
  isMember: boolean;
  amount: number;
  isFirstPurchase: boolean;
  expectedDiscount: number;
  expectedFreeShipping: boolean;
  expectedDoublePoints: boolean;
}

const decisionTable: TestCase[] = [
  // R1: 会員、5000円以上、初回
  {
    isMember: true,
    amount: 6000,
    isFirstPurchase: true,
    expectedDiscount: 10,
    expectedFreeShipping: true,
    expectedDoublePoints: true,
  },
  // R2: 会員、5000円以上、初回でない
  {
    isMember: true,
    amount: 6000,
    isFirstPurchase: false,
    expectedDiscount: 10,
    expectedFreeShipping: true,
    expectedDoublePoints: false,
  },
  // ... 他のルール
];

it.each(decisionTable)("should apply correct rules", (testCase) => {
  const result = calculateOrder(testCase);
  expect(result.discount).toBe(testCase.expectedDiscount);
  expect(result.freeShipping).toBe(testCase.expectedFreeShipping);
  expect(result.doublePoints).toBe(testCase.expectedDoublePoints);
});
```

---

## 戦略4: 状態遷移テスト

### 概念

状態マシンの遷移をテスト。

### 例

```
注文状態:
[pending] → [processing] → [shipped] → [delivered]
     ↓           ↓
  [cancelled]  [cancelled]

遷移テスト:
1. pending → processing (正常)
2. processing → shipped (正常)
3. shipped → delivered (正常)
4. pending → cancelled (正常)
5. processing → cancelled (正常)
6. shipped → cancelled (エラー)
7. delivered → cancelled (エラー)
```

### TypeScriptでの実装

```typescript
const transitions = [
  // 有効な遷移
  { from: "pending", to: "processing", valid: true },
  { from: "processing", to: "shipped", valid: true },
  { from: "shipped", to: "delivered", valid: true },
  { from: "pending", to: "cancelled", valid: true },
  { from: "processing", to: "cancelled", valid: true },

  // 無効な遷移
  { from: "shipped", to: "cancelled", valid: false },
  { from: "delivered", to: "cancelled", valid: false },
  { from: "cancelled", to: "processing", valid: false },
];

it.each(transitions)("$from → $to should be $valid", ({ from, to, valid }) => {
  const order = createOrder({ status: from });

  if (valid) {
    expect(() => order.transitionTo(to)).not.toThrow();
    expect(order.status).toBe(to);
  } else {
    expect(() => order.transitionTo(to)).toThrow();
    expect(order.status).toBe(from);
  }
});
```

---

## 戦略の選択

### フローチャート

```
パラメータ数は？
├─ 2-3個 → 全組み合わせで可能
├─ 4-10個 → ペアワイズを検討
└─ 10個以上 → 必ずペアワイズ

条件分岐がある？
├─ Yes → デシジョンテーブル
└─ No → 他の戦略

状態遷移がある？
├─ Yes → 状態遷移テスト
└─ No → 他の戦略

相互作用は？
├─ ほぼなし → 単一障害仮定
└─ あり → ペアワイズ以上
```

### 比較表

| 戦略               | テスト数   | カバレッジ | 適用場面           |
| ------------------ | ---------- | ---------- | ------------------ |
| 全組み合わせ       | 最大       | 100%       | 小規模、重要な機能 |
| 単一障害仮定       | 最小       | 低         | 相互作用がない     |
| ペアワイズ         | 中         | 高         | 一般的なケース     |
| デシジョンテーブル | 中         | 高         | 複雑な条件分岐     |
| 状態遷移           | 状態数依存 | 高         | 状態マシン         |

---

## チェックリスト

### 戦略選択

- [ ] パラメータ数を把握したか？
- [ ] パラメータ間の相互作用を分析したか？
- [ ] 適切な戦略を選択したか？

### テストケース生成

- [ ] 境界値を含めたか？
- [ ] 無効な組み合わせも含めたか？
- [ ] 重要なシナリオは網羅したか？
