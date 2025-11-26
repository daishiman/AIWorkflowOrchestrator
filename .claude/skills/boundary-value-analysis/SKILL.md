---
name: boundary-value-analysis
description: |
  境界値分析と同値分割を専門とするスキル。
  効果的なテストケース設計で最小限のテストで最大のカバレッジを実現します。

  専門分野:
  - 境界値分析: 境界値での系統的テスト
  - 同値分割: 入力空間の効率的な分割
  - エッジケース: 極端な値、空値、特殊ケース
  - テストケース最適化: 最小限のテストで最大のカバレッジ

  使用タイミング:
  - テストケースを設計する時
  - 入力の妥当性検証をテストする時
  - バグが境界値で発生した時
  - テスト数を最適化したい時

  Use proactively when designing test cases for validation logic.
version: 1.0.0
---

# Boundary Value Analysis

## 概要

境界値分析（BVA）と同値分割（EP）は、効率的なテストケース設計のための
体系的な技法です。最小限のテストで最大のバグ検出率を実現します。

**核心原則**:
- バグは境界値で発生しやすい
- 同値クラス内の値は同じ動作をする
- 効率的なテストは戦略的に設計する

**対象ユーザー**:
- ユニットテスター（@unit-tester）
- 品質エンジニア（@quality-engineer）
- ビジネスロジック実装者（@logic-dev）

## リソース構造

```
boundary-value-analysis/
├── SKILL.md                              # 本ファイル
├── resources/
│   ├── boundary-value-fundamentals.md    # 境界値分析の基礎
│   ├── equivalence-partitioning.md       # 同値分割
│   ├── edge-cases-catalog.md             # エッジケースカタログ
│   └── combination-strategies.md         # 組み合わせ戦略
├── scripts/
│   └── boundary-test-generator.mjs       # 境界値テストケース生成
└── templates/
    └── test-case-design-template.md      # テストケース設計テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 境界値分析の基礎
cat .claude/skills/boundary-value-analysis/resources/boundary-value-fundamentals.md

# 同値分割
cat .claude/skills/boundary-value-analysis/resources/equivalence-partitioning.md

# エッジケースカタログ
cat .claude/skills/boundary-value-analysis/resources/edge-cases-catalog.md

# 組み合わせ戦略
cat .claude/skills/boundary-value-analysis/resources/combination-strategies.md
```

### スクリプト実行

```bash
# 境界値テストケース生成
# 仕様から境界値テストケースとVitestテンプレートを自動生成

# 数値範囲
node .claude/skills/boundary-value-analysis/scripts/boundary-test-generator.mjs --range 1 100

# 文字列長
node .claude/skills/boundary-value-analysis/scripts/boundary-test-generator.mjs --type string --maxLength 255

# 配列サイズ
node .claude/skills/boundary-value-analysis/scripts/boundary-test-generator.mjs --type array --maxSize 10

# 日付範囲
node .claude/skills/boundary-value-analysis/scripts/boundary-test-generator.mjs --type date --from 2024-01-01 --to 2024-12-31
```

## クイックリファレンス

### 境界値分析の基本

```
範囲: 1 ≤ x ≤ 100

テストすべき境界値:
├─ 0    (下限-1: 無効)
├─ 1    (下限: 有効)
├─ 2    (下限+1: 有効)
├─ 99   (上限-1: 有効)
├─ 100  (上限: 有効)
└─ 101  (上限+1: 無効)
```

**詳細**: `resources/boundary-value-fundamentals.md`

### 同値分割の基本

```
入力: 年齢（0-150の整数）

同値クラス:
├─ 無効: 負の数（-∞ ~ -1）
├─ 有効: 子供（0 ~ 17）
├─ 有効: 成人（18 ~ 64）
├─ 有効: 高齢者（65 ~ 150）
└─ 無効: 範囲外（151 ~ +∞）
```

**詳細**: `resources/equivalence-partitioning.md`

## テストケース設計フロー

### ステップ1: 入力の特定

```
対象: validateAge(age: number): boolean

入力:
- age: 数値（整数を期待）
- 有効範囲: 0 ~ 150
```

### ステップ2: 同値クラスの定義

```
同値クラス:
EC1: age < 0       → 無効
EC2: 0 ≤ age ≤ 150 → 有効
EC3: age > 150     → 無効
EC4: 非数値        → 無効
```

### ステップ3: 境界値の特定

```
境界値:
BV1: -1   (EC1の境界)
BV2: 0    (EC1/EC2の境界)
BV3: 150  (EC2/EC3の境界)
BV4: 151  (EC3の境界)
```

### ステップ4: テストケースの生成

```typescript
it.each([
  // 同値クラス + 境界値
  { input: -1, expected: false, desc: '下限未満' },
  { input: 0, expected: true, desc: '下限' },
  { input: 75, expected: true, desc: '中央値' },
  { input: 150, expected: true, desc: '上限' },
  { input: 151, expected: false, desc: '上限超過' },
  { input: NaN, expected: false, desc: '非数値' },
])('validateAge($input) should return $expected ($desc)', ({ input, expected }) => {
  expect(validateAge(input)).toBe(expected);
});
```

## よくある境界値パターン

### 数値範囲

| パターン | テスト値 |
|---------|---------|
| `min ≤ x ≤ max` | min-1, min, max, max+1 |
| `min < x < max` | min, min+1, max-1, max |
| `x ≥ min` | min-1, min, min+1 |
| `x ≤ max` | max-1, max, max+1 |

### 文字列長

| パターン | テスト値 |
|---------|---------|
| `len = n` | n-1, n, n+1 |
| `len ≤ max` | 0, 1, max-1, max, max+1 |
| `min ≤ len ≤ max` | min-1, min, max, max+1 |

### 配列サイズ

| パターン | テスト値 |
|---------|---------|
| 空配列許可 | [], [1], [1,2,...n] |
| 空配列禁止 | [], [1], [1,2] |
| 最大n個 | [n-1個], [n個], [n+1個] |

## ベストプラクティス

### すべきこと

1. **境界を明確にする**:
   - 仕様から境界値を特定
   - 暗黙の境界も考慮

2. **同値クラスを網羅**:
   - 有効クラスから最低1つ
   - 無効クラスから最低1つ

3. **特殊値をテスト**:
   - null, undefined, NaN
   - 空文字列、空配列
   - 最大値、最小値

### 避けるべきこと

1. **ランダムな値のみ**:
   - 境界を見逃す
   - 再現性がない

2. **境界のみ**:
   - 同値クラスの代表値も必要
   - 中央値のテストも重要

3. **過度なテスト**:
   - 同値クラス内で複数テストは冗長
   - 効率的なテスト数を維持

## 選択ガイド

### 境界値分析を選ぶ場面

- 数値範囲の検証
- 文字列長の制限
- 配列サイズの制限
- 日付範囲のチェック

### 同値分割を選ぶ場面

- 入力タイプによる分岐
- カテゴリ分類
- 複数の有効パターン

### 両方を組み合わせる場面

- 複雑な検証ロジック
- 複数条件の組み合わせ
- 高品質なテストが必要

## 関連スキル

- **tdd-principles** (`.claude/skills/tdd-principles/SKILL.md`): TDDの基本原則
- **test-doubles** (`.claude/skills/test-doubles/SKILL.md`): テストダブル
- **test-naming-conventions** (`.claude/skills/test-naming-conventions/SKILL.md`): テスト命名規約
- **vitest-advanced** (`.claude/skills/vitest-advanced/SKILL.md`): Vitest高度な使い方

## 参考文献

- **『ソフトウェアテストの技法』** Boris Beizer著
- **『テスト技法』** Lee Copeland著
- **ISTQB Foundation Level Syllabus**

---

## 使用上の注意

### このスキルが得意なこと
- 境界値分析（2値、3値、堅牢性テスト）の適用
- 同値分割によるテストケース効率化
- エッジケースカタログからの網羅的テスト設計
- ペアワイズテスト等の組み合わせ戦略

### このスキルが行わないこと
- テストコードの具体的な実装（→ vitest-advanced）
- テストダブルの選択（→ test-doubles）
- テスト命名の詳細（→ test-naming-conventions）
- パフォーマンステスト/負荷テスト

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版作成 - 境界値分析と同値分割 |
