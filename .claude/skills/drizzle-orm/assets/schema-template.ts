/**
 * Drizzle ORM スキーマテンプレート
 *
 * 使用方法:
 * 1. このテンプレートをコピーして新しいスキーマファイルを作成
 * 2. テーブル名とカラムを要件に応じて変更
 * 3. リレーションを必要に応じて追加
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations, InferSelectModel, InferInsertModel } from "drizzle-orm";

// =====================
// テーブル定義
// =====================

export const {{tableName}} = sqliteTable(
  "{{table_name}}",
  {
    // 主キー
    id: integer("id").primaryKey({ autoIncrement: true }),

    // 文字列カラム
    name: text("name").notNull(),
    description: text("description"),

    // 外部キー
    // parentId: integer("parent_id").references(() => parentTable.id),

    // タイムスタンプ
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }),

    // ソフトデリート
    // deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => ({
    // インデックス定義
    // nameIdx: index("idx_{{table_name}}_name").on(table.name),
  })
);

// =====================
// 型定義
// =====================

export type {{TypeName}} = InferSelectModel<typeof {{tableName}}>;
export type New{{TypeName}} = InferInsertModel<typeof {{tableName}}>;

// =====================
// リレーション定義
// =====================

// export const {{tableName}}Relations = relations({{tableName}}, ({ one, many }) => ({
//   parent: one(parentTable, {
//     fields: [{{tableName}}.parentId],
//     references: [parentTable.id],
//   }),
//   children: many(childTable),
// }));
