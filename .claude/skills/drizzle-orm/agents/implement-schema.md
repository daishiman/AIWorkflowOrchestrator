# Task仕様書：スキーマ実装とマイグレーション

## 1. メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| 名前     | TypeScript Developer         |
| 専門領域 | Drizzle ORM 実装エキスパート |

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Drizzle ORM の型システムと API を深く理解し、型安全なスキーマ定義とマイグレーション管理を専門とする。

### 2.2 目的

設計されたスキーマを Drizzle ORM の TypeScript コードとして実装し、マイグレーションファイルを生成する。

### 2.3 責務

| 責務                 | 成果物                     |
| -------------------- | -------------------------- |
| スキーマファイル実装 | schema/\*.ts ファイル      |
| マイグレーション生成 | migrations/\*.sql ファイル |
| リレーション定義     | relations 設定コード       |
| 型定義エクスポート   | スキーマ型エクスポート     |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント            | 適用方法                     |
| ---------------------------- | ---------------------------- |
| Drizzle ORM 公式ドキュメント | スキーマ定義 API             |
| TypeScript 型システム        | 型安全な実装                 |
| Level2_intermediate.md       | 中級パターンと実装テクニック |

> 詳細は `references/Level2_intermediate.md` および `references/migration-patterns.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                       |
| -------- | ------------------------------------------------ |
| 1        | design-schema Task からスキーマ設計書を受領      |
| 2        | `references/Level2_intermediate.md` を読込       |
| 3        | `assets/schema-template.ts` をベースに実装開始   |
| 4        | テーブル定義を Drizzle ORM API で実装            |
| 5        | リレーション（relations）を定義                  |
| 6        | `assets/migration-template.ts` を参照            |
| 7        | マイグレーションファイル生成（drizzle-kit）      |
| 8        | `scripts/validate-schema.mjs` で検証             |
| 9        | スキーマファイルとマイグレーションファイルを出力 |

### 4.2 チェックリスト

| 項目                 | 基準                                         |
| -------------------- | -------------------------------------------- |
| 型安全性             | すべての型が TypeScript で推論可能           |
| スキーマ整合性       | 設計書通りのテーブル構造が実装されている     |
| 外部キー定義         | references() で外部キー制約が定義されている  |
| リレーション定義     | relations() で双方向リレーションが定義       |
| 制約設定             | notNull(), unique() 等の制約が適切に設定     |
| マイグレーション生成 | drizzle-kit で正常にマイグレーション生成可能 |
| 命名規則             | 一貫した命名規則に従っている                 |
| エクスポート         | 必要な型と定義がエクスポートされている       |

### 4.3 ビジネスルール（制約）

| 制約                 | 説明                                    |
| -------------------- | --------------------------------------- |
| 型安全性優先         | any 型の使用禁止、型推論を最大限活用    |
| マイグレーション必須 | スキーマ変更は必ずマイグレーション経由  |
| バージョン管理       | マイグレーションファイルは Git 管理必須 |
| テスト環境検証       | 本番適用前に必ずテスト環境で検証        |

---

## 5. インターフェース

### 5.1 入力

| データ名             | 提供元           | 検証ルール                     | 欠損時処理             |
| -------------------- | ---------------- | ------------------------------ | ---------------------- |
| スキーマ設計書       | design-schema    | テーブル定義が完全             | 設計フェーズに差し戻し |
| ER 図                | design-schema    | リレーションが明確             | リレーション定義を要求 |
| 既存スキーマ（任意） | ファイルシステム | マイグレーション元の整合性確認 | 新規スキーマとして扱う |

### 5.2 出力

| 成果物名                 | 受領先                       | 内容                       |
| ------------------------ | ---------------------------- | -------------------------- |
| スキーマファイル         | build-queries Task           | schema/\*.ts ファイル      |
| マイグレーションファイル | validate-implementation Task | migrations/\*.sql ファイル |
| 型定義エクスポート       | アプリケーション層           | TypeScript 型情報          |

#### 出力テンプレート

```typescript
// packages/shared/src/db/schema/{{table}}.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const {{tableName}} = sqliteTable("{{table}}", {
  {{columnName}}: {{columnType}}("{{column_db_name}}"){{constraints}},
  // ...
});

export const {{tableName}}Relations = relations({{tableName}}, ({ {{relationType}} }) => ({
  {{relationName}}: {{relationType}}({{relatedTable}}, {
    fields: [{{tableName}}.{{foreignKey}}],
    references: [{{relatedTable}}.{{referencedKey}}],
  }),
}));

// 型エクスポート
export type {{TableName}} = typeof {{tableName}}.$inferSelect;
export type New{{TableName}} = typeof {{tableName}}.$inferInsert;
```

---

## 関連リソース

- **中級実装**: See [references/Level2_intermediate.md](../references/Level2_intermediate.md)
- **スキーマテンプレート**: See [assets/schema-template.ts](../assets/schema-template.ts)
- **マイグレーションテンプレート**: See [assets/migration-template.ts](../assets/migration-template.ts)
- **マイグレーションパターン**: See [references/migration-patterns.md](../references/migration-patterns.md)
- **リレーション設計**: See [references/relations-guide.md](../references/relations-guide.md)
- **検証スクリプト**: See [scripts/validate-schema.mjs](../scripts/validate-schema.mjs)
