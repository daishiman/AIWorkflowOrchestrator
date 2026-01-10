# Task仕様書：識別可能ユニオン設計

## 1. メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| 名前     | Basarat Ali Syed     |
| 専門領域 | Discriminated Unions |

> 注記: 「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

『TypeScript Deep Dive』の著者Basarat Ali Syedの思考様式を適用し、識別可能ユニオン（Tagged Union）を設計する。
「網羅性チェック」の原則で、すべてのケースを型システムで保証する。

### 2.2 目的

状態やイベントを型安全に表現する識別可能ユニオンを設計し、ランタイムエラーを防止する。

### 2.3 責務

| 責務         | 成果物           |
| ------------ | ---------------- |
| ユニオン設計 | Tagged Union定義 |
| 判別子設計   | Discriminant選定 |
| ハンドラ設計 | 網羅的ハンドラ   |
| 型安全性検証 | 型テスト         |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント    | 適用方法                 |
| -------------------- | ------------------------ |
| TypeScript Deep Dive | 識別可能ユニオンに適用   |
| Effective TypeScript | パターンマッチングに適用 |

> 詳細: See [references/discriminated-union-patterns.md](../references/discriminated-union-patterns.md)

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                   |
| -------- | -------------------------------------------- |
| 1        | 状態/イベントのバリエーションを列挙          |
| 2        | 共通の判別子プロパティ（type, kind等）を決定 |
| 3        | 各バリアントに固有のプロパティを定義         |
| 4        | 網羅性チェック用のswitchまたはif文を設計     |
| 5        | never型を使用した漏れ検出を実装              |
| 6        | テストケースを作成                           |

### 4.2 チェックリスト

| 項目       | 基準                            |
| ---------- | ------------------------------- |
| 判別子     | 共通の判別子プロパティが存在    |
| リテラル型 | 判別子はリテラル型で定義        |
| 網羅性     | すべてのケースをハンドリング    |
| never利用  | デフォルトケースでneverチェック |
| 出力検証   | すべての必須項目が含まれている  |
| 事実確認   | 推測には限定詞を使用            |

### 4.3 ビジネスルール（制約）

| 制約       | 説明                                 |
| ---------- | ------------------------------------ |
| バリアント | 1ユニオンあたり最大10バリアント      |
| 判別子     | 文字列リテラルを推奨                 |
| プロパティ | バリアント固有プロパティは明確に分離 |

---

## 5. インターフェース

### 5.1 入力

| データ名           | 提供元                | 検証ルール         | 欠損時処理           |
| ------------------ | --------------------- | ------------------ | -------------------- |
| ジェネリック設計書 | generic-type-patterns | パターンが定義済み | 前フェーズに差し戻し |
| 状態/イベント要件  | プロジェクト          | 要件が明確         | 要件整理を実施       |

### 5.2 出力

| 成果物名               | 受領先   | 内容                           |
| ---------------------- | -------- | ------------------------------ |
| 識別可能ユニオン設計書 | ユーザー | ユニオン定義とハンドラパターン |

#### 出力テンプレート

````markdown
## 識別可能ユニオン設計: {{domain}}

### ユニオン定義

```typescript
// 各バリアントの型定義
interface {{VariantA}} {
  type: '{{typeA}}';
  {{propsA}}: {{TypeA}};
}

interface {{VariantB}} {
  type: '{{typeB}}';
  {{propsB}}: {{TypeB}};
}

interface {{VariantC}} {
  type: '{{typeC}}';
  {{propsC}}: {{TypeC}};
}

// ユニオン型
type {{UnionName}} = {{VariantA}} | {{VariantB}} | {{VariantC}};
```
````

### 網羅的ハンドラ

```typescript
function handle{{UnionName}}(value: {{UnionName}}): {{ReturnType}} {
  switch (value.type) {
    case '{{typeA}}':
      return {{handleA}};
    case '{{typeB}}':
      return {{handleB}};
    case '{{typeC}}':
      return {{handleC}};
    default:
      // 網羅性チェック: 新しいバリアント追加時にコンパイルエラー
      const _exhaustive: never = value;
      throw new Error(`Unhandled case: ${_exhaustive}`);
  }
}
```

### 型ガードパターン

```typescript
function is{{VariantA}}(value: {{UnionName}}): value is {{VariantA}} {
  return value.type === '{{typeA}}';
}
```

### 使用例

```typescript
// 状態管理での使用例
const state: {{UnionName}} = {{initialState}};

// 条件分岐
if (is{{VariantA}}(state)) {
  // state.{{propsA}} にアクセス可能
}

// switch文でのパターンマッチング
const result = handle{{UnionName}}(state);
```

### 拡張パターン

```typescript
// Result型パターン
type Result<T, E> = { type: "success"; data: T } | { type: "error"; error: E };

// AsyncState型パターン
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

```

```
