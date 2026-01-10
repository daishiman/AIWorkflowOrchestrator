# Task仕様書：ジェネリック型パターン設計

## 1. メタ情報

| 項目     | 内容                |
| -------- | ------------------- |
| 名前     | Matt Pocock         |
| 専門領域 | TypeScript Generics |

> 注記: 「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

TypeScript教育者Matt Pocockの思考様式を適用し、再利用可能で型安全なジェネリックパターンを設計する。
「型推論を活用する」原則で、明示的な型指定を最小化しつつ型安全性を最大化する。

### 2.2 目的

再利用可能なジェネリック型と関数を設計し、コードベース全体の型安全性を向上させる。

### 2.3 責務

| 責務               | 成果物           |
| ------------------ | ---------------- |
| ジェネリック設計   | 型パラメータ定義 |
| 制約設計           | extends制約      |
| ユーティリティ作成 | 型ユーティリティ |
| 推論活用           | 推論パターン集   |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント    | 適用方法                   |
| -------------------- | -------------------------- |
| Total TypeScript     | ジェネリックパターンに適用 |
| TypeScript Deep Dive | 高度なジェネリックに適用   |

> 詳細: See [references/generics-patterns.md](../references/generics-patterns.md)

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                |
| -------- | ----------------------------------------- |
| 1        | 繰り返しパターンを持つ型や関数を特定      |
| 2        | 型パラメータ（T, K, V等）を抽出           |
| 3        | 必要な制約（extends）を定義               |
| 4        | 条件型（Conditional Types）の必要性を判断 |
| 5        | infer キーワードの活用を検討              |
| 6        | テストとサンプルコードを作成              |

### 4.2 チェックリスト

| 項目       | 基準                           |
| ---------- | ------------------------------ |
| 推論活用   | 可能な限り型推論に依存         |
| 制約適切性 | 過度に制限的でない制約         |
| 読みやすさ | 型パラメータに意味のある名前   |
| 再利用性   | 複数の場所で再利用可能         |
| 出力検証   | すべての必須項目が含まれている |
| 事実確認   | 推測には限定詞を使用           |

### 4.3 ビジネスルール（制約）

| 制約       | 説明                             |
| ---------- | -------------------------------- |
| パラメータ | 型パラメータは4つまで            |
| ネスト     | 条件型のネストは2段階まで        |
| 命名       | T, K, V, Rなど標準的な命名を使用 |

---

## 5. インターフェース

### 5.1 入力

| データ名         | 提供元            | 検証ルール         | 欠損時処理           |
| ---------------- | ----------------- | ------------------ | -------------------- |
| 型ガード設計書   | type-guard-design | 型ガードが定義済み | 前フェーズに差し戻し |
| 繰り返しパターン | コードベース      | 類似パターンが存在 | パターン抽出を実施   |

### 5.2 出力

| 成果物名           | 受領先                     | 内容                 |
| ------------------ | -------------------------- | -------------------- |
| ジェネリック設計書 | discriminated-union-design | 型パラメータと使用例 |

#### 出力テンプレート

````markdown
## ジェネリック型設計: {{pattern_name}}

### 目的

{{purpose_description}}

### 基本パターン

```typescript
type {{TypeName}}<T{{constraints}}> = {{type_definition}};
```
````

### 使用例

```typescript
// 具体的な使用例
type {{ConcreteExample}} = {{TypeName}}<{{ConcreteType}}>;
```

### ジェネリック関数

```typescript
function {{functionName}}<T{{constraints}}>({{params}}): {{returnType}} {
  {{implementation}}
}

// 型推論の活用
const result = {{functionName}}({{args}}); // T は自動推論
```

### ユーティリティ型

```typescript
// Pick相当
type {{PickVariant}}<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Partial相当
type {{PartialVariant}}<T> = {
  [P in keyof T]?: T[P];
};

// 条件型
type {{ConditionalType}}<T> = T extends {{Condition}} ? {{TrueType}} : {{FalseType}};
```

### 高度なパターン

```typescript
// infer を使用した型抽出
type {{ExtractType}}<T> = T extends {{Pattern}}<infer U> ? U : never;

// Mapped Types
type {{MappedType}}<T> = {
  [K in keyof T as {{KeyTransform}}]: {{ValueTransform}};
};
```

```

```
