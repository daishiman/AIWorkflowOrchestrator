---
name: .claude/skills/sql-anti-patterns/SKILL.md
description: |
  Bill Karwinの『SQLアンチパターン』に基づくデータベース設計の落とし穴と解決策。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/sql-anti-patterns/resources/anti-patterns-catalog.md`: Anti Patterns Catalogリソース

  - `.claude/skills/sql-anti-patterns/templates/schema-review-checklist.md`: Schema Review Checklistテンプレート

  - `.claude/skills/sql-anti-patterns/scripts/detect-anti-patterns.mjs`: Detect Anti Patternsスクリプト

version: 1.0.0
---

# SQL Anti-Patterns Skill

## 概要

このスキルは、Bill Karwin の『SQL アンチパターン』に基づく、データベース設計における
一般的な誤りとその解決策を提供します。これらのアンチパターンを認識し、回避することで、
保守性が高く、パフォーマンスの良いデータベースを設計できます。

## 主要アンチパターン

### 1. ジェイウォーク（Jaywalking）

**問題**: カンマ区切り値を単一カラムに格納する

```sql
-- アンチパターン
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100),
  tags VARCHAR(500)  -- "electronics,sale,featured"
);
```

**問題点**:

- 特定のタグで検索するのが困難（LIKE '%tag%' は非効率）
- タグの追加・削除が文字列操作になる
- 参照整合性を保証できない
- タグごとの集計が困難

**解決策**: 正規化された関連テーブル

```sql
-- 解決: 交差テーブルを使用
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  name VARCHAR(50) UNIQUE
);

CREATE TABLE product_tags (
  product_id INTEGER REFERENCES products(id),
  tag_id INTEGER REFERENCES tags(id),
  PRIMARY KEY (product_id, tag_id)
);
```

**判断基準**:

- [ ] カンマ区切り値を格納していないか？
- [ ] VARCHAR/TEXT に複数値を詰め込んでいないか？
- [ ] FIND_IN_SET や LIKE '%value%' を使用していないか？

---

### 2. EAV（Entity-Attribute-Value）

**問題**: 動的スキーマを実現するためにメタデータテーブルを使用

```sql
-- アンチパターン
CREATE TABLE entity_attributes (
  entity_id INTEGER,
  attribute_name VARCHAR(100),
  attribute_value TEXT,
  PRIMARY KEY (entity_id, attribute_name)
);

-- 使用例
INSERT INTO entity_attributes VALUES
(1, 'color', 'red'),
(1, 'size', 'large'),
(1, 'price', '99.99');
```

**問題点**:

- データ型の制約がない（すべて TEXT）
- 必須属性を強制できない
- 参照整合性が保証できない
- 集計クエリが複雑になる
- パフォーマンスが劣化する（ピボットが必要）

**解決策**: 目的に応じた適切な設計

**解決策 1: シングルテーブル継承（属性が少ない場合）**

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  -- 共通属性
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  -- タイプ別属性（NULL許可）
  color VARCHAR(50),      -- 衣類用
  size VARCHAR(20),       -- 衣類用
  wattage INTEGER,        -- 電化製品用
  voltage INTEGER         -- 電化製品用
);
```

**解決策 2: 具象テーブル継承（属性が多い場合）**

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

CREATE TABLE clothing (
  id INTEGER PRIMARY KEY REFERENCES products(id),
  color VARCHAR(50),
  size VARCHAR(20)
);

CREATE TABLE electronics (
  id INTEGER PRIMARY KEY REFERENCES products(id),
  wattage INTEGER,
  voltage INTEGER
);
```

**解決策 3: JSON（半構造化データが必要な場合）**

```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  attributes TEXT  -- JSON形式でタイプ別の追加属性を格納
);

-- SQLite JSON1拡張で型検証とクエリが可能
-- SELECT json_extract(attributes, '$.color') FROM products;
-- Zodスキーマで型検証
```

**判断基準**:

- [ ] 属性名をデータとして格納していないか？
- [ ] ピボットクエリが頻繁に必要か？
- [ ] データ型の検証ができているか？

---

### 3. Polymorphic Associations（多態的関連）

**問題**: 複数のテーブルへの外部キーを型判別カラムで切り替え

```sql
-- アンチパターン
CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  content TEXT,
  commentable_type VARCHAR(50),  -- 'Post', 'Photo', 'Video'
  commentable_id INTEGER          -- posts.id, photos.id, videos.id のいずれか
);
```

**問題点**:

- 外部キー制約を定義できない
- 参照整合性がデータベース層で保証されない
- JOIN が複雑になる
- 型の追加時にコード変更が必要

**解決策 1: 共通の親テーブル**

```sql
CREATE TABLE commentables (
  id INTEGER PRIMARY KEY,
  type VARCHAR(50) NOT NULL
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY REFERENCES commentables(id),
  title VARCHAR(200)
);

CREATE TABLE photos (
  id INTEGER PRIMARY KEY REFERENCES commentables(id),
  url VARCHAR(500)
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  commentable_id INTEGER REFERENCES commentables(id),
  content TEXT
);
```

**解決策 2: 個別の外部キーカラム**

```sql
CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  content TEXT,
  post_id INTEGER REFERENCES posts(id),
  photo_id INTEGER REFERENCES photos(id),
  video_id INTEGER REFERENCES videos(id),
  -- 1つだけNOT NULLになるようにCHECK制約
  CONSTRAINT single_parent CHECK (
    (CASE WHEN post_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN photo_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN video_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);
```

**解決策 3: 交差テーブル**

```sql
CREATE TABLE post_comments (
  post_id INTEGER REFERENCES posts(id),
  comment_id INTEGER REFERENCES comments(id),
  PRIMARY KEY (post_id, comment_id)
);

CREATE TABLE photo_comments (
  photo_id INTEGER REFERENCES photos(id),
  comment_id INTEGER REFERENCES comments(id),
  PRIMARY KEY (photo_id, comment_id)
);
```

**判断基準**:

- [ ] 型判別カラムを使用していないか？
- [ ] 外部キー制約が定義されているか？
- [ ] 参照整合性は DB 層で保証されているか？

---

### 4. マジックビーンズ（Active Record の誤用）

**問題**: ビジネスロジックがデータアクセス層に混在

**問題点**:

- テスト困難
- 関心の分離が崩れる
- トランザクション管理が複雑化

**解決策**: レイヤー分離

```typescript
// Domain層
class Order {
  calculateTotal(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal()),
      Money.zero(),
    );
  }
}

// Repository層
interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

// Infrastructure層
class DrizzleOrderRepository implements OrderRepository {
  async findById(id: OrderId): Promise<Order | null> {
    const row = await db.select().from(orders).where(eq(orders.id, id.value));
    return row ? OrderMapper.toDomain(row) : null;
  }
}
```

---

### 5. ID Required（過剰なサロゲートキー）

**問題**: すべてのテーブルに ID 列を追加する

```sql
-- アンチパターン: 交差テーブルに不要なID
CREATE TABLE product_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- 不要
  product_id INTEGER,
  tag_id INTEGER,
  UNIQUE (product_id, tag_id)
);
```

**解決策**: 複合主キーの使用

```sql
-- 解決: 複合主キー
CREATE TABLE product_tags (
  product_id INTEGER REFERENCES products(id),
  tag_id INTEGER REFERENCES tags(id),
  PRIMARY KEY (product_id, tag_id)
);
```

**判断基準**:

- [ ] 交差テーブルに不要なサロゲートキーがないか？
- [ ] 自然キーが適切な場合に使用されているか？

---

### 6. Fear of the Unknown（NULL 恐怖症）

**問題**: NULL を避けるために不適切なデフォルト値を使用

```sql
-- アンチパターン
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  middle_name VARCHAR(100) DEFAULT '',  -- NULLの代わりに空文字
  birth_date DATE DEFAULT '1900-01-01'  -- NULLの代わりにマジック値
);
```

**問題点**:

- 「値がない」と「空の値」の区別ができない
- マジック値はビジネスロジックを複雑にする
- 集計が不正確になる可能性

**解決策**: 適切な NULL 使用

```sql
-- 解決: NULLを適切に使用
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  middle_name VARCHAR(100),  -- NULL = ミドルネームなし
  birth_date DATE            -- NULL = 生年月日不明
);
```

**NULL 使用のガイドライン**:

- **NULL を使うべき場合**: 値が不明、該当なし、未入力
- **NOT NULL を使うべき場合**: 必須属性、計算に使用、ビジネスルール上必須

---

## アンチパターン検出チェックリスト

### スキーマレビュー時

- [ ] **ジェイウォーク**: カンマ区切り値、配列文字列がないか
- [ ] **EAV**: attribute_name/attribute_value パターンがないか
- [ ] **Polymorphic**: type 判別カラム + 汎用 ID がないか
- [ ] **ID Required**: 不要なサロゲートキーがないか
- [ ] **NULL 恐怖症**: 不適切なデフォルト値がないか

### クエリレビュー時

- [ ] **スパゲッティクエリ**: 過度に複雑な JOIN がないか
- [ ] **ランダム選択**: `ORDER BY RAND()` がないか
- [ ] **インプリシットカラム**: `SELECT *` がないか

## 関連スキル

- `.claude/skills/database-normalization/SKILL.md` - 正規化によるアンチパターン回避
- `.claude/skills/json-sqlite-patterns/SKILL.md` - SQLite JSON1拡張で EAV 回避
- `.claude/skills/foreign-key-constraints/SKILL.md` - 参照整合性確保

## 参照リソース

詳細な情報は以下のリソースを参照:

- `resources/anti-patterns-catalog.md` - 全アンチパターンカタログ
- `templates/schema-review-checklist.md` - スキーマレビューチェックリスト
- `scripts/detect-anti-patterns.mjs` - アンチパターン検出スクリプト
