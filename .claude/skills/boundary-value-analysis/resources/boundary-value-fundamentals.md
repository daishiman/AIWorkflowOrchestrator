# 境界値分析の基礎

## 概要

境界値分析（Boundary Value Analysis, BVA）は、入力や出力の境界で
テストケースを設計する技法です。バグは境界値で発生しやすいため、
効率的なバグ検出が可能です。

---

## 基本原則

### なぜ境界値でバグが発生するか

1. **Off-by-oneエラー**:
   - `<` と `<=` の混同
   - ループの終了条件ミス
   - 配列インデックスのずれ

2. **丸め誤差**:
   - 浮動小数点の比較
   - 切り捨て/切り上げの境界

3. **条件の誤り**:
   - 条件式の境界設定ミス
   - 等号の有無

---

## 境界値の種類

### 2値境界（Two-Value Boundary）

最小限のテスト：境界値のみ

```
範囲: 1 ≤ x ≤ 10

テスト値:
- 1  (下限)
- 10 (上限)
```

### 3値境界（Three-Value Boundary）

標準的なテスト：境界と隣接値

```
範囲: 1 ≤ x ≤ 10

テスト値:
- 0  (下限-1: 無効)
- 1  (下限: 有効)
- 10 (上限: 有効)
- 11 (上限+1: 無効)
```

### 頑健性テスト（Robustness Testing）

より厳密なテスト：5値以上

```
範囲: 1 ≤ x ≤ 10

テスト値:
- 0  (下限-1: 無効)
- 1  (下限: 有効)
- 2  (下限+1: 有効)
- 5  (中央: 有効)
- 9  (上限-1: 有効)
- 10 (上限: 有効)
- 11 (上限+1: 無効)
```

---

## 適用パターン

### 数値範囲

```typescript
// 仕様: 1 ≤ quantity ≤ 100

// 境界値テスト
it.each([
  { quantity: 0, valid: false, desc: "下限未満" },
  { quantity: 1, valid: true, desc: "下限" },
  { quantity: 100, valid: true, desc: "上限" },
  { quantity: 101, valid: false, desc: "上限超過" },
])("validateQuantity($quantity) → $valid ($desc)", ({ quantity, valid }) => {
  expect(validateQuantity(quantity)).toBe(valid);
});
```

### 文字列長

```typescript
// 仕様: ユーザー名は3〜20文字

// 境界値テスト
it.each([
  { username: "ab", valid: false, desc: "2文字（下限-1）" },
  { username: "abc", valid: true, desc: "3文字（下限）" },
  { username: "a".repeat(20), valid: true, desc: "20文字（上限）" },
  { username: "a".repeat(21), valid: false, desc: "21文字（上限+1）" },
])("validateUsername($desc)", ({ username, valid }) => {
  expect(validateUsername(username)).toBe(valid);
});
```

### 日付範囲

```typescript
// 仕様: 予約は今日から30日後まで

// 境界値テスト
it.each([
  { offset: -1, valid: false, desc: "昨日" },
  { offset: 0, valid: true, desc: "今日" },
  { offset: 30, valid: true, desc: "30日後" },
  { offset: 31, valid: false, desc: "31日後" },
])("validateReservationDate($desc)", ({ offset, valid }) => {
  const date = addDays(new Date(), offset);
  expect(validateReservationDate(date)).toBe(valid);
});
```

### 配列サイズ

```typescript
// 仕様: カートには1〜10個の商品

// 境界値テスト
it.each([
  { items: [], valid: false, desc: "0個" },
  { items: [item], valid: true, desc: "1個" },
  { items: Array(10).fill(item), valid: true, desc: "10個" },
  { items: Array(11).fill(item), valid: false, desc: "11個" },
])("validateCart($desc)", ({ items, valid }) => {
  expect(validateCart(items)).toBe(valid);
});
```

---

## 特殊なケース

### 開区間と閉区間

```
閉区間 [1, 10]: 1 ≤ x ≤ 10
  → 境界値: 0, 1, 10, 11

開区間 (1, 10): 1 < x < 10
  → 境界値: 1, 2, 9, 10

半開区間 [1, 10): 1 ≤ x < 10
  → 境界値: 0, 1, 9, 10
```

### 浮動小数点

```typescript
// 浮動小数点の境界値は注意が必要
it("should handle floating point boundary", () => {
  // 直接比較を避ける
  expect(value).toBeCloseTo(10.0, 5);

  // または許容誤差を使用
  expect(Math.abs(value - 10.0)).toBeLessThan(0.00001);
});
```

### 特殊値

```typescript
// 数値の特殊値
it.each([
  { value: 0, desc: "ゼロ" },
  { value: -0, desc: "負のゼロ" },
  { value: Number.MIN_VALUE, desc: "最小正数" },
  { value: Number.MAX_VALUE, desc: "最大値" },
  { value: Number.MIN_SAFE_INTEGER, desc: "最小安全整数" },
  { value: Number.MAX_SAFE_INTEGER, desc: "最大安全整数" },
  { value: Infinity, desc: "正の無限大" },
  { value: -Infinity, desc: "負の無限大" },
  { value: NaN, desc: "非数" },
])("should handle $desc", ({ value }) => {
  // テスト
});
```

---

## 複数入力の境界値

### 単一障害仮定（Single Fault Assumption）

一度に1つの入力のみ境界値にする

```
入力: x (1-10), y (1-10)

テストケース:
1. x=0, y=5   (xが境界)
2. x=1, y=5   (xが境界)
3. x=10, y=5  (xが境界)
4. x=11, y=5  (xが境界)
5. x=5, y=0   (yが境界)
6. x=5, y=1   (yが境界)
7. x=5, y=10  (yが境界)
8. x=5, y=11  (yが境界)
9. x=5, y=5   (両方とも中央値)
```

### 多重障害仮定（Multiple Fault Assumption）

複数の入力で同時に境界値をテスト

```
入力: x (1-10), y (1-10)

境界値の組み合わせ:
(0,0), (0,1), (0,10), (0,11)
(1,0), (1,1), (1,10), (1,11)
...
(11,0), (11,1), (11,10), (11,11)
```

---

## チェックリスト

### 境界値の特定

- [ ] 数値範囲の上限/下限を特定したか？
- [ ] 開区間/閉区間を確認したか？
- [ ] 特殊値（0, null, 空）を考慮したか？

### テストケースの設計

- [ ] 境界値（境界上の値）をテストしたか？
- [ ] 境界の隣接値をテストしたか？
- [ ] 無効な境界値をテストしたか？

### 複数入力

- [ ] 単一障害仮定でテストしたか？
- [ ] 必要に応じて多重障害仮定も使用したか？
