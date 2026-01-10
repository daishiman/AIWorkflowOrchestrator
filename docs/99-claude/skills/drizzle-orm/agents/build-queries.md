# Task仕様書：クエリ構築と最適化

## 1. メタ情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| 名前     | Query Optimization Expert  |
| 専門領域 | 型安全なクエリ構築と最適化 |

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Drizzle ORM の型安全なクエリビルダーを活用し、パフォーマンスと保守性を両立したクエリ設計を専門とする。

### 2.2 目的

実装されたスキーマを基に、型安全で効率的なクエリを構築し、パフォーマンスを最適化する。

### 2.3 責務

| 責務                     | 成果物                  |
| ------------------------ | ----------------------- |
| クエリ実装               | CRUD 操作の型安全な実装 |
| リレーショナルクエリ設計 | JOIN とサブクエリの実装 |
| インデックス戦略         | インデックス設計提案    |
| パフォーマンス最適化     | クエリチューニング      |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント              | 適用方法               |
| ------------------------------ | ---------------------- |
| Drizzle ORM 公式ドキュメント   | クエリビルダー API     |
| SQL パフォーマンスチューニング | インデックスと実行計画 |
| Level3_advanced.md             | 高度なクエリパターン   |

> 詳細は `references/Level3_advanced.md` および `references/query-patterns.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                                 |
| -------- | ---------------------------------------------------------- |
| 1        | implement-schema Task からスキーマファイルを受領           |
| 2        | `references/Level3_advanced.md` を読込                     |
| 3        | `assets/query-template.ts` をベースに実装開始              |
| 4        | 基本的な CRUD 操作を実装（SELECT, INSERT, UPDATE, DELETE） |
| 5        | `references/query-patterns.md` を参照                      |
| 6        | リレーショナルクエリを実装（JOIN, サブクエリ）             |
| 7        | `references/index-strategies.md` でインデックス計画        |
| 8        | トランザクション処理を実装                                 |
| 9        | パフォーマンステストと最適化                               |

### 4.2 チェックリスト

| 項目                 | 基準                                            |
| -------------------- | ----------------------------------------------- |
| 型安全性             | すべてのクエリが TypeScript で型推論される      |
| CRUD 完全性          | 必要な CRUD 操作がすべて実装されている          |
| リレーション処理     | JOIN が適切に実装され、N+1 問題が回避されている |
| エラーハンドリング   | 適切なエラーハンドリングが実装されている        |
| トランザクション境界 | トランザクション境界が明確に定義されている      |
| インデックス活用     | WHERE 句のカラムに適切なインデックスが設定      |
| クエリパフォーマンス | 実行計画が効率的（EXPLAIN で確認）              |
| NULL 安全性          | NULL 許容カラムの扱いが適切                     |

### 4.3 ビジネスルール（制約）

| 制約                 | 説明                                             |
| -------------------- | ------------------------------------------------ |
| 型安全性優先         | クエリ結果の型が静的に保証される                 |
| N+1 問題回避         | リレーション読み込みは明示的に最適化             |
| トランザクション必須 | データ整合性が必要な操作は必ずトランザクション内 |
| インデックス計画     | パフォーマンスクリティカルなクエリは事前検証     |

---

## 5. インターフェース

### 5.1 入力

| データ名         | 提供元             | 検証ルール             | 欠損時処理             |
| ---------------- | ------------------ | ---------------------- | ---------------------- |
| スキーマファイル | implement-schema   | 型定義が完全           | スキーマ実装に差し戻し |
| クエリ要件       | アプリケーション層 | 必要なクエリ操作が明確 | 要件の明確化を依頼     |

### 5.2 出力

| 成果物名               | 受領先                       | 内容                     |
| ---------------------- | ---------------------------- | ------------------------ |
| クエリ実装ファイル     | アプリケーション層           | 型安全なクエリ関数       |
| インデックス設計提案   | validate-implementation Task | インデックス追加提案     |
| パフォーマンスレポート | validate-implementation Task | クエリパフォーマンス分析 |

#### 出力テンプレート

```typescript
// packages/shared/src/db/queries/{{entity}}.ts
import { db } from "../client";
import { {{tableName}} } from "../schema/{{table}}";
import { eq, and, or, desc } from "drizzle-orm";

// 型安全な SELECT
export async function get{{EntityName}}ById(id: number) {
  return await db
    .select()
    .from({{tableName}})
    .where(eq({{tableName}}.id, id))
    .limit(1);
}

// 型安全な INSERT
export async function create{{EntityName}}(data: New{{EntityName}}) {
  return await db.insert({{tableName}}).values(data).returning();
}

// 型安全な UPDATE
export async function update{{EntityName}}(
  id: number,
  data: Partial<New{{EntityName}}>
) {
  return await db
    .update({{tableName}})
    .set(data)
    .where(eq({{tableName}}.id, id))
    .returning();
}

// 型安全な DELETE
export async function delete{{EntityName}}(id: number) {
  return await db
    .delete({{tableName}})
    .where(eq({{tableName}}.id, id))
    .returning();
}

// リレーショナルクエリ
export async function get{{EntityName}}WithRelations(id: number) {
  return await db.query.{{tableName}}.findFirst({
    where: eq({{tableName}}.id, id),
    with: {
      {{relationName}}: true,
    },
  });
}

// トランザクション
export async function create{{EntityName}}WithRelation(
  entityData: New{{EntityName}},
  relationData: New{{RelationName}}
) {
  return await db.transaction(async (tx) => {
    const [entity] = await tx.insert({{tableName}}).values(entityData).returning();
    const [relation] = await tx
      .insert({{relatedTable}})
      .values({ ...relationData, {{foreignKey}}: entity.id })
      .returning();
    return { entity, relation };
  });
}
```

---

## 関連リソース

- **高度なパターン**: See [references/Level3_advanced.md](../references/Level3_advanced.md)
- **クエリパターン**: See [references/query-patterns.md](../references/query-patterns.md)
- **リレーショナルクエリ**: See [references/relational-queries.md](../references/relational-queries.md)
- **インデックス戦略**: See [references/index-strategies.md](../references/index-strategies.md)
- **トランザクション**: See [references/transaction-patterns.md](../references/transaction-patterns.md)
- **クエリテンプレート**: See [assets/query-template.ts](../assets/query-template.ts)
