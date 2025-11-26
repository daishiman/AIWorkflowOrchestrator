# 同値分割

## 概要

同値分割（Equivalence Partitioning, EP）は、入力空間を「同じ動作をする」
グループに分割し、各グループから代表値を選んでテストする技法です。
テスト数を削減しながら効果的なカバレッジを実現します。

---

## 基本原則

### 同値クラスとは

同値クラス（Equivalence Class）は、システムが同じように処理する
入力値の集合です。

```
例: 年齢による区分

同値クラス:
├─ 無効: 負の数
├─ 有効: 子供（0-17歳）
├─ 有効: 成人（18-64歳）
├─ 有効: 高齢者（65歳以上）
└─ 無効: 非数値
```

### 同値分割の原則

1. **網羅性**: すべての入力が少なくとも1つのクラスに属する
2. **排他性**: 各入力は1つのクラスにのみ属する
3. **代表性**: クラス内の値は同じ動作をする

---

## 同値クラスの種類

### 有効同値クラス（Valid Equivalence Classes）

正常に処理されるべき入力

```
入力: メールアドレス

有効クラス:
├─ VE1: 標準形式（user@domain.com）
├─ VE2: サブドメイン（user@sub.domain.com）
└─ VE3: プラス記法（user+tag@domain.com）
```

### 無効同値クラス（Invalid Equivalence Classes）

エラーになるべき入力

```
入力: メールアドレス

無効クラス:
├─ IE1: @なし（userdomain.com）
├─ IE2: ドメインなし（user@）
├─ IE3: 空文字列（""）
├─ IE4: null/undefined
└─ IE5: 不正文字（user@domain!.com）
```

---

## 適用パターン

### 範囲による分割

```typescript
// 仕様: 成績評価
// A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: 0-59

// 同値クラス
const equivalenceClasses = [
  { score: -1, grade: 'Invalid', desc: '範囲外（負）' },
  { score: 30, grade: 'F', desc: 'F評価' },
  { score: 65, grade: 'D', desc: 'D評価' },
  { score: 75, grade: 'C', desc: 'C評価' },
  { score: 85, grade: 'B', desc: 'B評価' },
  { score: 95, grade: 'A', desc: 'A評価' },
  { score: 101, grade: 'Invalid', desc: '範囲外（超過）' },
];

it.each(equivalenceClasses)('score $score → $grade ($desc)', ({ score, grade }) => {
  expect(calculateGrade(score)).toBe(grade);
});
```

### タイプによる分割

```typescript
// 仕様: ファイルアップロード
// 許可: jpg, png, gif
// 禁止: その他

// 同値クラス
const equivalenceClasses = [
  { ext: 'jpg', valid: true, desc: 'JPEG画像' },
  { ext: 'png', valid: true, desc: 'PNG画像' },
  { ext: 'gif', valid: true, desc: 'GIF画像' },
  { ext: 'pdf', valid: false, desc: 'PDF（禁止）' },
  { ext: 'exe', valid: false, desc: '実行ファイル（禁止）' },
  { ext: '', valid: false, desc: '拡張子なし' },
];

it.each(equivalenceClasses)('$ext → $valid ($desc)', ({ ext, valid }) => {
  expect(isAllowedExtension(ext)).toBe(valid);
});
```

### 状態による分割

```typescript
// 仕様: 注文状態による操作
// pending: キャンセル可能
// processing: キャンセル不可
// shipped: キャンセル不可
// delivered: キャンセル不可

// 同値クラス
const equivalenceClasses = [
  { status: 'pending', canCancel: true, desc: '保留中' },
  { status: 'processing', canCancel: false, desc: '処理中' },
  { status: 'shipped', canCancel: false, desc: '発送済み' },
  { status: 'delivered', canCancel: false, desc: '配達完了' },
];

it.each(equivalenceClasses)('$status → canCancel=$canCancel', ({ status, canCancel }) => {
  const order = createOrder({ status });
  expect(order.canCancel()).toBe(canCancel);
});
```

---

## 同値分割の手順

### ステップ1: 入力パラメータの特定

```
対象: createUser(name, email, age)

パラメータ:
- name: 文字列
- email: 文字列
- age: 数値
```

### ステップ2: 各パラメータの同値クラス定義

```
name:
├─ VE1: 有効な名前（1-50文字）
├─ IE1: 空文字列
├─ IE2: 51文字以上
└─ IE3: null/undefined

email:
├─ VE1: 有効なメール形式
├─ IE1: @なし
├─ IE2: ドメインなし
└─ IE3: 空/null

age:
├─ VE1: 有効な年齢（0-150）
├─ IE1: 負の数
├─ IE2: 151以上
└─ IE3: 非数値
```

### ステップ3: テストケースの選択

```typescript
// 各クラスから1つずつ代表値を選択
const testCases = [
  // 全て有効
  { name: 'John', email: 'john@example.com', age: 30, valid: true },

  // name無効
  { name: '', email: 'john@example.com', age: 30, valid: false },
  { name: 'a'.repeat(51), email: 'john@example.com', age: 30, valid: false },
  { name: null, email: 'john@example.com', age: 30, valid: false },

  // email無効
  { name: 'John', email: 'invalid', age: 30, valid: false },
  { name: 'John', email: '', age: 30, valid: false },

  // age無効
  { name: 'John', email: 'john@example.com', age: -1, valid: false },
  { name: 'John', email: 'john@example.com', age: 151, valid: false },
];
```

---

## 境界値分析との組み合わせ

```typescript
// 同値分割 + 境界値分析

// 同値クラス
// VE1: 0-17歳（未成年）
// VE2: 18-64歳（成人）
// VE3: 65-150歳（高齢者）

// 境界値を含むテストケース
const testCases = [
  // 無効クラスの境界
  { age: -1, category: 'invalid' },

  // VE1の境界
  { age: 0, category: 'minor' },
  { age: 17, category: 'minor' },

  // VE1/VE2の境界
  { age: 18, category: 'adult' },

  // VE2の代表値
  { age: 40, category: 'adult' },

  // VE2/VE3の境界
  { age: 64, category: 'adult' },
  { age: 65, category: 'senior' },

  // VE3の境界
  { age: 150, category: 'senior' },

  // 無効クラスの境界
  { age: 151, category: 'invalid' },
];
```

---

## アンチパターン

### ❌ 同値クラス内の複数テスト

```typescript
// 悪い例：同じクラス内で複数テスト
it.each([
  { age: 20 },
  { age: 25 },
  { age: 30 }, // 全て同じ「成人」クラス
  { age: 35 },
])('adult age $age', ({ age }) => { ... });

// 良い例：各クラスから1つ
it.each([
  { age: 10, category: 'minor' },   // 未成年クラス
  { age: 30, category: 'adult' },   // 成人クラス
  { age: 70, category: 'senior' },  // 高齢者クラス
])('$age → $category', ({ age, category }) => { ... });
```

### ❌ クラスの見落とし

```typescript
// 悪い例：nullを忘れている
const testCases = [
  { input: 'valid', expected: true },
  { input: '', expected: false },
  // null/undefinedが抜けている
];

// 良い例：全クラスを網羅
const testCases = [
  { input: 'valid', expected: true },
  { input: '', expected: false },
  { input: null, expected: false },
  { input: undefined, expected: false },
];
```

---

## チェックリスト

### 同値クラスの定義

- [ ] すべての有効クラスを特定したか？
- [ ] すべての無効クラスを特定したか？
- [ ] クラスは排他的か（重複なし）？
- [ ] クラスは網羅的か（漏れなし）？

### テストケースの選択

- [ ] 各有効クラスから最低1つテストしたか？
- [ ] 各無効クラスから最低1つテストしたか？
- [ ] 境界値も考慮したか？
