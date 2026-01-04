# SQLインジェクション防止ガイド

> **相対パス**: `references/sql-injection-prevention.md`
> **対応仕様**: OWASP ASVS 5.3, CWE-89

---

## SQLインジェクションの種類

| 種類        | 説明                                   | 検出方法   |
| ----------- | -------------------------------------- | ---------- |
| In-band     | エラーメッセージやレスポンスで結果確認 | 直接的     |
| Blind       | レスポンスの変化で推測                 | 遅い       |
| Time-based  | 遅延で推測                             | 非常に遅い |
| Out-of-band | 外部サーバーへのリクエストで確認       | 高度       |

---

## パラメータ化クエリ（必須）

### 生SQL使用時

```typescript
// Bad: 文字列連結（絶対禁止）
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// Good: パラメータ化クエリ
// PostgreSQL (pg)
const result = await client.query("SELECT * FROM users WHERE id = $1", [
  userId,
]);

// MySQL (mysql2)
const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [
  userId,
]);

// SQLite (better-sqlite3)
const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
const user = stmt.get(userId);
```

### ORM使用時

```typescript
// Prisma（推奨）
const user = await prisma.user.findUnique({
  where: { id: userId },
});

// Drizzle ORM
const users = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.id, userId));

// TypeORM
const user = await userRepository.findOne({
  where: { id: userId },
});
```

---

## 動的クエリの安全な構築

### WHERE句の動的条件

```typescript
// Bad: 条件を文字列で結合
let query = "SELECT * FROM products WHERE 1=1";
if (category) query += ` AND category = '${category}'`; // 危険

// Good: パラメータ配列で管理
const conditions: string[] = [];
const params: unknown[] = [];

if (category) {
  conditions.push("category = $" + (params.length + 1));
  params.push(category);
}
if (minPrice) {
  conditions.push("price >= $" + (params.length + 1));
  params.push(minPrice);
}

const whereClause =
  conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

const query = `SELECT * FROM products ${whereClause}`;
const result = await client.query(query, params);
```

### ORDER BY（識別子）

```typescript
// 識別子はパラメータ化できない

// Bad: ユーザー入力をそのまま使用
const query = `SELECT * FROM users ORDER BY ${sortColumn}`;

// Good: Allowlistで検証
const ALLOWED_SORT_COLUMNS = ["name", "email", "created_at"] as const;
type SortColumn = (typeof ALLOWED_SORT_COLUMNS)[number];

function validateSortColumn(input: string): SortColumn {
  if (!ALLOWED_SORT_COLUMNS.includes(input as SortColumn)) {
    throw new Error("Invalid sort column");
  }
  return input as SortColumn;
}

const safeColumn = validateSortColumn(userInput);
const query = `SELECT * FROM users ORDER BY "${safeColumn}"`;
```

### LIKE検索

```typescript
// Special characters in LIKE: % _ [ ]

// Bad: エスケープなし
const query = `SELECT * FROM products WHERE name LIKE '%${search}%'`;

// Good: LIKEパターンのエスケープ
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}

const safePattern = `%${escapeLike(search)}%`;
const result = await client.query("SELECT * FROM products WHERE name LIKE $1", [
  safePattern,
]);
```

---

## ストアドプロシージャ

```sql
-- 安全なストアドプロシージャ
CREATE PROCEDURE get_user(IN user_id INT)
BEGIN
  SELECT * FROM users WHERE id = user_id;
END;

-- 危険なストアドプロシージャ（動的SQL）
CREATE PROCEDURE search_users(IN search_term VARCHAR(255))
BEGIN
  SET @sql = CONCAT('SELECT * FROM users WHERE name LIKE ''%', search_term, '%''');
  PREPARE stmt FROM @sql;
  EXECUTE stmt;  -- 脆弱
END;
```

---

## エラーハンドリング

```typescript
try {
  const result = await client.query(query, params);
  return result.rows;
} catch (error) {
  // 内部ログには詳細を記録
  logger.error("Database query failed", {
    error: error.message,
    query: query, // 注意: 本番環境では慎重に
  });

  // ユーザーには汎用メッセージを返す
  throw new AppError("Unable to process request", 500);
}
```

---

## 検証スキーマ例

```typescript
// データベースクエリ用入力スキーマ
const queryParamsSchema = z.object({
  id: z.string().uuid(),

  // 整数ID
  numericId: z.coerce.number().int().positive(),

  // ページネーション
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // ソート（Allowlist）
  sortBy: z.enum(["name", "email", "created_at"]).default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),

  // 検索（長さ制限）
  search: z.string().max(100).optional(),
});
```

---

## テストペイロード

| カテゴリ | ペイロード                      | 検出対象     |
| -------- | ------------------------------- | ------------ |
| Classic  | `' OR '1'='1`                   | 基本的なSQLi |
| Comment  | `' OR 1=1--`                    | コメント     |
| Union    | `' UNION SELECT * FROM users--` | Union-based  |
| Stacked  | `'; DROP TABLE users--`         | 複数クエリ   |
| Blind    | `' AND SLEEP(5)--`              | Time-based   |

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **実装パターン**: See [patterns.md](patterns.md)
