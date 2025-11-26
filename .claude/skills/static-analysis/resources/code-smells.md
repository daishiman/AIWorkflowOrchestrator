# Code Smells Detection

## コード臭（Code Smells）とは

**定義**: 問題を示唆するコードパターン（Martin Fowler『Refactoring』）

**特徴**:
- バグではないが、将来的問題の兆候
- リファクタリングの候補
- 保守性低下の警告

## 主要なCode Smells

### 1. 長すぎるメソッド（Long Method）

**検出**:
```json
{
  "rules": {
    "max-lines-per-function": ["warn", 50]
  }
}
```

**兆候**:
- 関数が50行超
- スクロールが必要
- 複数の責務を持つ

**リファクタリング**:
- Extract Method（メソッド抽出）
- 単一責任に分割

### 2. 長すぎるパラメータリスト（Long Parameter List）

**検出**:
```json
{
  "rules": {
    "max-params": ["warn", 3]
  }
}
```

**兆候**:
- パラメータ4個以上
- 関数呼び出しが長く複雑

**リファクタリング**:
```javascript
// Before
function createUser(name, email, age, address, phone) { }

// After: オブジェクトパラメータ化
function createUser({ name, email, age, address, phone }) { }
```

### 3. 重複コード（Duplicated Code）

**検出**:
```json
{
  "plugins": ["sonarjs"],
  "rules": {
    "sonarjs/no-duplicate-string": ["error", 3],
    "sonarjs/no-identical-functions": "error"
  }
}
```

**兆候**:
- 同じコードが複数箇所
- コピペが多い

**リファクタリング**:
- 共通関数に抽出
- DRY原則適用

### 4. 深すぎるネスト（Deep Nesting）

**検出**:
```json
{
  "rules": {
    "max-depth": ["error", 4]
  }
}
```

**兆候**:
- if/forが5段以上ネスト
- インデントが深い

**リファクタリング**:
- Early Return
- Guard Clauses

### 5. 大きすぎるクラス（Large Class）

**検出**:
```json
{
  "rules": {
    "max-lines": ["warn", 300]
  }
}
```

**兆候**:
- クラスが300行超
- 多数のメソッド/プロパティ

**リファクタリング**:
- クラス分割
- 単一責任原則適用

### 6. 長すぎる条件式（Long Conditional）

**検出**:
```json
{
  "rules": {
    "max-len": "off",  // Prettierに委譲
    "sonarjs/max-switch-cases": ["error", 10]
  }
}
```

**兆候**:
- if条件が複雑
- switchのcase多数

**リファクタリング**:
```javascript
// Before
if (status === 'pending' || status === 'processing' || status === 'queued') { }

// After
const inProgressStatuses = ['pending', 'processing', 'queued'];
if (inProgressStatuses.includes(status)) { }
```

### 7. デッドコード（Dead Code）

**検出**:
```json
{
  "rules": {
    "no-unused-vars": "error",
    "no-unreachable": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

**兆候**:
- 未使用変数/関数
- 到達不可能コード

**リファクタリング**: 削除

### 8. マジックナンバー（Magic Numbers）

**検出**:
```json
{
  "rules": {
    "no-magic-numbers": ["warn", {
      "ignore": [0, 1, -1],
      "ignoreArrayIndexes": true
    }]
  }
}
```

**兆候**:
- 意味不明な数値リテラル

**リファクタリング**:
```javascript
// Before
if (user.age > 18) { }

// After
const ADULT_AGE = 18;
if (user.age > ADULT_AGE) { }
```

### 9. 過度なコメント（Excessive Comments）

**兆候**:
- コードの行数 < コメント行数
- コードを説明するコメント

**リファクタリング**:
```javascript
// Before
// ユーザーの年齢が18歳以上かチェック
if (user.age > 18) { }

// After: 自己説明的コード
if (isAdult(user)) { }
function isAdult(user) { return user.age >= ADULT_AGE; }
```

### 10. グローバル変数乱用（Global Variables）

**検出**:
```json
{
  "rules": {
    "no-global-assign": "error",
    "no-implicit-globals": "error"
  }
}
```

**リファクタリング**:
- モジュールスコープ化
- 依存性注入

## ESLint Plugin: SonarJS

### インストール

```bash
pnpm add -D eslint-plugin-sonarjs
```

### 設定

```json
{
  "plugins": ["sonarjs"],
  "extends": ["plugin:sonarjs/recommended"],
  "rules": {
    "sonarjs/cognitive-complexity": ["error", 15],
    "sonarjs/no-duplicate-string": ["error", 3],
    "sonarjs/no-identical-functions": "error",
    "sonarjs/no-collapsible-if": "error"
  }
}
```

### 主要ルール

- `cognitive-complexity`: 認知的複雑度
- `no-duplicate-string`: 重複文字列
- `no-identical-functions`: 重複関数
- `no-collapsible-if`: ネスト可能なif
- `prefer-immediate-return`: 即座のreturn推奨

## まとめ

**検出優先度**:
1. デッドコード（即座削除）
2. 長すぎるメソッド（リファクタリング）
3. 重複コード（DRY適用）
4. 深すぎるネスト（Early Return）

**自動化**:
- ESLint + SonarJSプラグイン
- コミットフックで自動検出
- CI/CDで強制
