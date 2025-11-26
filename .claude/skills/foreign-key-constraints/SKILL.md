---
name: foreign-key-constraints
description: |
  C.J.デイトの『リレーショナルデータベース入門』に基づく外部キー制約と参照整合性の設計。
  CASCADE動作の戦略的選択、循環参照の回避、ソフトデリートとの整合性を提供。

  専門分野:
  - 参照整合性: 外部キー制約による関係の論理的一貫性保証
  - CASCADE動作: ON DELETE/UPDATE の戦略的選択とビジネスルールとの整合
  - 循環参照回避: 依存関係グラフ分析と設計パターン
  - ソフトデリート対応: deleted_atカラムとCASCADE動作の矛盾解決

  使用タイミング:
  - 外部キー関係の設計時
  - CASCADE動作の選択時
  - 循環参照の検出・解消時
  - ソフトデリートとハードデリートの設計判断時

  Use proactively when designing foreign key relationships, choosing cascade behaviors,
  or resolving conflicts between soft delete requirements and referential integrity.
version: 1.0.0
---

# Foreign Key Constraints Skill

## 概要

このスキルは、リレーショナルデータベースにおける外部キー制約と参照整合性の設計に関する
専門知識を提供します。C.J.デイトの理論に基づき、データの整合性を保証しながら、
ビジネス要件との整合性を実現します。

## 外部キー制約の基本

### 定義と目的

外部キー制約は、あるテーブルのカラムが別のテーブルの主キーを参照することを保証します。

**目的**:
1. **参照整合性**: 孤立レコードの防止
2. **データ品質**: 不正な参照の排除
3. **自己文書化**: テーブル間の関係を明示
4. **パフォーマンス**: クエリオプティマイザへのヒント

### Drizzle ORM での定義

```typescript
import { pgTable, uuid, varchar, timestamp, foreignKey } from 'drizzle-orm/pg-core';

// 親テーブル
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
});

// 子テーブル
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: varchar('status', { length: 20 }).notNull(),
});
```

## CASCADE動作の設計

### ON DELETE オプション

#### CASCADE

**動作**: 親削除時に子も自動削除

```typescript
userId: uuid('user_id')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' })
```

**適用場面**:
- 親が削除されたら子も不要な場合
- ユーザー削除時の関連データ（セッション、一時データ）
- 親子が強い所有関係にある場合

**注意点**:
- 監査ログ要件と矛盾する可能性
- 大量削除による長時間ロック

#### SET NULL

**動作**: 親削除時に子の外部キーをNULLに設定

```typescript
categoryId: uuid('category_id')
  .references(() => categories.id, { onDelete: 'set null' })
```

**適用場面**:
- 親との関連がオプショナルな場合
- 親削除後も子レコードを保持したい場合
- カテゴリ削除時の商品（未分類に変更）

**注意点**:
- 外部キーカラムがNULL許可である必要がある
- アプリケーション側でNULL処理が必要

#### RESTRICT（デフォルト）

**動作**: 子が存在する場合、親削除を禁止

```typescript
userId: uuid('user_id')
  .notNull()
  .references(() => users.id, { onDelete: 'restrict' })
```

**適用場面**:
- 親削除前に明示的な処理が必要な場合
- 監査ログ、履歴保持が必要な場合
- 誤削除防止が重要な場合

**注意点**:
- アプリケーション側で削除順序の管理が必要
- ソフトデリートと相性が良い

#### NO ACTION

**動作**: RESTRICTと類似（トランザクション終了時にチェック）

```typescript
userId: uuid('user_id')
  .notNull()
  .references(() => users.id, { onDelete: 'no action' })
```

**適用場面**:
- 遅延制約（DEFERRABLE）と組み合わせる場合
- トランザクション内で一時的に制約違反を許容する場合

### ON UPDATE オプション

#### CASCADE（推奨）

**動作**: 親の主キー更新時に子の外部キーも自動更新

```typescript
userId: uuid('user_id')
  .notNull()
  .references(() => users.id, { onUpdate: 'cascade' })
```

**注意**: 主キー更新は一般的に推奨されない（UUIDを使用）

### CASCADE動作選択フローチャート

```
親を削除する際、子レコードはどうすべきか？
├─ 子も削除すべき
│   └─ ON DELETE CASCADE
│
├─ 子を保持し、関連をNULLに
│   └─ ON DELETE SET NULL（外部キーNULL許可）
│
├─ 子を保持し、関連を維持
│   ├─ 監査/履歴要件あり？
│   │   ├─ Yes → ソフトデリート（deleted_at）+ ON DELETE RESTRICT
│   │   └─ No → ON DELETE RESTRICT + アプリ側で明示処理
│   │
│   └─ 親を論理削除のみ？
│       └─ ON DELETE RESTRICT + ソフトデリート
│
└─ デフォルト値に設定
    └─ ON DELETE SET DEFAULT（稀に使用）
```

## ソフトデリートとの統合

### 問題

ソフトデリート（deleted_at）と CASCADE DELETE は矛盾します：
- CASCADE DELETE: 物理削除を伝播
- ソフトデリート: 論理削除のみ、物理レコードは保持

### 解決策

#### パターン1: ON DELETE RESTRICT + アプリケーション層でソフトデリート

```typescript
// スキーマ
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  deletedAt: timestamp('deleted_at'),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  deletedAt: timestamp('deleted_at'),
});

// アプリケーション層
class UserService {
  async softDelete(userId: string) {
    await db.transaction(async (tx) => {
      // 関連レコードをソフトデリート
      await tx.update(orders)
        .set({ deletedAt: new Date() })
        .where(eq(orders.userId, userId));

      // ユーザーをソフトデリート
      await tx.update(users)
        .set({ deletedAt: new Date() })
        .where(eq(users.id, userId));
    });
  }
}
```

#### パターン2: 履歴テーブル分離

```sql
-- アクティブテーブル（CASCADE DELETE可能）
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- 履歴テーブル（外部キーなし）
CREATE TABLE orders_history (
  id UUID PRIMARY KEY,
  original_order_id UUID,  -- 参照のみ、制約なし
  user_id UUID,            -- 参照のみ、制約なし
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### ソフトデリート対応インデックス

```typescript
// アクティブレコードのみインデックス
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  activeEmailIdx: index('idx_users_active_email')
    .on(table.email)
    .where(sql`deleted_at IS NULL`),
}));
```

## 循環参照の回避

### 検出方法

循環参照の例:
```
users → departments → managers → users
```

### 解決パターン

#### パターン1: 自己参照テーブル

```typescript
// 階層構造（部門の親子関係）
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  parentId: uuid('parent_id').references(() => departments.id),
});
```

#### パターン2: 関係の分離

```typescript
// 循環を避けるため、管理関係を別テーブルに
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  departmentId: uuid('department_id').references(() => departments.id),
});

export const departmentManagers = pgTable('department_managers', {
  departmentId: uuid('department_id').references(() => departments.id),
  managerId: uuid('manager_id').references(() => users.id),
  primary: primaryKey({ columns: [departmentId, managerId] }),
});
```

#### パターン3: NULL許可による打破

```typescript
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  // 初期作成時はNULL、後で設定
  managerId: uuid('manager_id').references(() => users.id),
});
```

## 外部キー命名規則

### 推奨パターン

```
fk_[子テーブル]_[親テーブル]
fk_[子テーブル]_[外部キーカラム]
```

### 例

```typescript
// 制約名を明示
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
}, (table) => ({
  userFk: foreignKey({
    name: 'fk_orders_users',
    columns: [table.userId],
    foreignColumns: [users.id],
  })
    .onDelete('restrict')
    .onUpdate('cascade'),
}));
```

## 設計判断チェックリスト

### 外部キー定義時

- [ ] すべての参照関係に外部キー制約が定義されているか？
- [ ] 外部キーカラムにインデックスが設定されているか？
- [ ] CASCADE動作がビジネスルールと整合しているか？
- [ ] 循環参照が発生していないか？

### ソフトデリート考慮

- [ ] ソフトデリート要件とCASCADE動作が矛盾していないか？
- [ ] 監査ログ要件がCASCADE DELETEで損なわれないか？
- [ ] アクティブレコードのみのインデックスが設定されているか？

### パフォーマンス考慮

- [ ] 大量削除によるロック影響が評価されているか？
- [ ] CASCADE伝播の深さが適切か？

## 関連スキル

- `.claude/skills/database-normalization/SKILL.md` - 正規化と外部キーの関係
- `.claude/skills/indexing-strategies/SKILL.md` - 外部キーのインデックス
- `.claude/skills/sql-anti-patterns/SKILL.md` - Polymorphic Associations回避

## 参照リソース

詳細な情報は以下のリソースを参照:
- `resources/cascade-patterns.md` - CASCADE動作パターン詳細
- `templates/fk-design-checklist.md` - 外部キー設計チェックリストテンプレート
- `scripts/check-fk-integrity.mjs` - 外部キー整合性チェックスクリプト
