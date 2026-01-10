# Code Complexity Metrics

## 循環的複雑度（Cyclomatic Complexity）

### 定義

**考案者**: Thomas J. McCabe（1976年）

**測定方法**: コード内の独立した実行経路数

**計算式**: `CC = E - N + 2P`

- E: エッジ（矢印）数
- N: ノード（円）数
- P: 連結成分数（通常1）

**簡易計算**: 分岐点（if、for、while、case）をカウント + 1

### 複雑度スコア解釈

| CC    | リスク   | 理解度   | テスト容易性 | 推奨アクション         |
| ----- | -------- | -------- | ------------ | ---------------------- |
| 1-5   | 低       | 高       | 簡単         | なし                   |
| 6-10  | 中       | 中       | 中程度       | モニタリング           |
| 11-20 | 高       | 低       | 困難         | リファクタリング推奨   |
| 21+   | 非常に高 | 非常に低 | 非常に困難   | 即座にリファクタリング |

### ESLintルール設定

```json
{
  "rules": {
    "complexity": ["warn", 10] // CC≤10を推奨
  }
}
```

**閾値決定要因**:

- チームスキル: 初級→15、中級→10、上級→8
- コードベース: レガシー→緩め、新規→厳格
- ドメイン: 複雑なビジネスロジック→やや緩め

### リファクタリング手法

**高CC関数の分割**:

```javascript
// Before: CC = 12
function processOrder(order) {
  if (order.status === "pending") {
    if (order.payment === "card") {
      if (order.amount > 1000) {
        // 処理1
      } else {
        // 処理2
      }
    } else if (order.payment === "cash") {
      // 処理3
    }
  } else if (order.status === "shipped") {
    // 処理4
  }
}

// After: CC = 3, 4, 3
function processOrder(order) {
  if (order.status === "pending") {
    return processPendingOrder(order);
  } else if (order.status === "shipped") {
    return processShippedOrder(order);
  }
}

function processPendingOrder(order) {
  if (order.payment === "card") {
    return processCardPayment(order);
  } else {
    return processCashPayment(order);
  }
}
```

## 認知的複雑度（Cognitive Complexity）

### 定義

**考案者**: SonarSource（2016年）

**測定方法**: 人間の理解コストを測定

**循環的複雑度との違い**:

- ネストを重視（深いネストほどペナルティ大）
- シーケンシャルな分岐は軽いペナルティ

### スコアリング

**基本ルール**:

- `if`、`for`、`while`: +1
- ネスト毎: +1追加
- `else if`、`catch`: +1
- `&&`、`||`、`??`: +1

**例**:

```javascript
// 循環的複雑度: 3
// 認知的複雑度: 4（ネスト考慮）
function example(a, b) {
  if (a > 0) {
    // +1
    if (b > 0) {
      // +2（+1 基本 +1 ネスト）
      return a + b;
    }
  }
  return 0;
}
```

### ESLint統合

**プラグイン**: `eslint-plugin-sonarjs`

```json
{
  "plugins": ["sonarjs"],
  "extends": ["plugin:sonarjs/recommended"],
  "rules": {
    "sonarjs/cognitive-complexity": ["error", 15]
  }
}
```

**推奨閾値**: ≤15

## ネスト深度（Nesting Depth）

### 定義

**測定**: コードブロック（if、for等）の入れ子レベル

### 影響

- 深度≤2: 理解しやすい
- 深度3-4: 複雑
- 深度≥5: 非常に複雑、リファクタリング必須

### ESLintルール

```json
{
  "rules": {
    "max-depth": ["error", 4]
  }
}
```

### リファクタリング

**Early Return**:

```javascript
// Before: 深度3
function process(data) {
  if (data) {
    if (data.valid) {
      if (data.amount > 0) {
        return calculate(data);
      }
    }
  }
  return null;
}

// After: 深度1
function process(data) {
  if (!data) return null;
  if (!data.valid) return null;
  if (data.amount <= 0) return null;
  return calculate(data);
}
```

## その他のメトリクス

### 関数長

**ESLintルール**:

```json
{
  "rules": {
    "max-lines-per-function": ["warn", 50]
  }
}
```

**根拠**: Robert C. Martin『Clean Code』

### ファイル長

```json
{
  "rules": {
    "max-lines": ["warn", 300]
  }
}
```

### パラメータ数

```json
{
  "rules": {
    "max-params": ["warn", 3]
  }
}
```

**超過時**: オブジェクトパラメータ化

## まとめ

**主要メトリクス**:

- 循環的複雑度: ≤10
- 認知的複雑度: ≤15
- ネスト深度: ≤4
- 関数長: ≤50行
- パラメータ数: ≤3

**適用**:

- プロジェクト特性に応じて調整
- 段階的厳格化
- 定期的レビュー
