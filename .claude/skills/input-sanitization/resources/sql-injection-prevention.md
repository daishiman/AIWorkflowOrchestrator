# SQLインジェクション対策

## 概要

SQLインジェクション攻撃を防止するためのガイドです。
パラメータ化クエリ、ORM、入力検証の活用方法を解説します。

## SQLインジェクションの仕組み

### 攻撃の例

```typescript
// ❌ 脆弱なコード
const userId = "1' OR '1'='1";
const query = `SELECT * FROM users WHERE id = '${userId}'`;
// 実行されるSQL: SELECT * FROM users WHERE id = '1' OR '1'='1'
// → すべてのユーザーが返される

// さらに危険な例
const userId = "1'; DROP TABLE users; --";
const query = `SELECT * FROM users WHERE id = '${userId}'`;
// 実行されるSQL: SELECT * FROM users WHERE id = '1'; DROP TABLE users; --'
// → usersテーブルが削除される
```

## パラメータ化クエリ

### PostgreSQL (pg)

```typescript
import { Pool } from 'pg';

const pool = new Pool();

// ✅ パラメータ化クエリ
async function getUserById(userId: string): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
}

// ✅ 複数パラメータ
async function searchUsers(name: string, email: string): Promise<User[]> {
  const query = `
    SELECT * FROM users
    WHERE name ILIKE $1 AND email = $2
  `;
  const result = await pool.query(query, [`%${name}%`, email]);
  return result.rows;
}

// ✅ IN句
async function getUsersByIds(ids: string[]): Promise<User[]> {
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
  const query = `SELECT * FROM users WHERE id IN (${placeholders})`;
  const result = await pool.query(query, ids);
  return result.rows;
}
```

### MySQL

```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'mydb',
});

// ✅ プレースホルダー使用
async function getUserById(userId: string): Promise<User | null> {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  );
  return (rows as User[])[0] || null;
}

// ✅ 名前付きプレースホルダー
async function createUser(user: { name: string; email: string }): Promise<void> {
  await pool.execute(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [user.name, user.email]
  );
}
```

### SQLite

```typescript
import Database from 'better-sqlite3';

const db = new Database('mydb.sqlite');

// ✅ プレースホルダー
function getUserById(userId: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(userId) as User | undefined;
}

// ✅ 名前付きパラメータ
function createUser(user: { name: string; email: string }): void {
  const stmt = db.prepare('INSERT INTO users (name, email) VALUES (@name, @email)');
  stmt.run(user);
}
```

## ORM使用

### Prisma

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ 安全: Prismaは自動的にパラメータ化
async function getUserById(userId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

// ✅ 安全: 複雑なクエリも型安全
async function searchUsers(filters: {
  name?: string;
  email?: string;
  role?: string;
}): Promise<User[]> {
  return prisma.user.findMany({
    where: {
      name: filters.name ? { contains: filters.name } : undefined,
      email: filters.email,
      role: filters.role,
    },
  });
}

// ⚠️ 注意: $queryRawは手動でパラメータ化が必要
async function customQuery(userId: string): Promise<User[]> {
  // ✅ 安全: Prisma.sqlでパラメータ化
  return prisma.$queryRaw`
    SELECT * FROM users WHERE id = ${userId}
  `;
}

// ❌ 危険: 文字列連結
// return prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = '${userId}'`);
```

### Drizzle ORM

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, like, and } from 'drizzle-orm';
import { users } from './schema';

const db = drizzle(pool);

// ✅ 安全: 型安全なクエリ
async function getUserById(userId: string): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, userId));
  return result[0];
}

// ✅ 安全: 複合条件
async function searchUsers(name: string, email: string): Promise<User[]> {
  return db
    .select()
    .from(users)
    .where(and(like(users.name, `%${name}%`), eq(users.email, email)));
}
```

### TypeORM

```typescript
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/User';

// ✅ 安全: Repository APIを使用
async function getUserById(
  repo: Repository<User>,
  userId: string
): Promise<User | null> {
  return repo.findOne({ where: { id: userId } });
}

// ✅ 安全: QueryBuilderでパラメータ化
async function searchUsers(
  repo: Repository<User>,
  name: string
): Promise<User[]> {
  return repo
    .createQueryBuilder('user')
    .where('user.name LIKE :name', { name: `%${name}%` })
    .getMany();
}

// ⚠️ 注意: query()は手動でパラメータ化
async function customQuery(
  dataSource: DataSource,
  userId: string
): Promise<User[]> {
  // ✅ 安全: パラメータ配列を使用
  return dataSource.query('SELECT * FROM users WHERE id = $1', [userId]);
}
```

## 動的クエリの安全な構築

### 許可リストアプローチ

```typescript
// ✅ ソートカラムの許可リスト
const ALLOWED_SORT_COLUMNS = ['name', 'email', 'created_at'] as const;
type SortColumn = (typeof ALLOWED_SORT_COLUMNS)[number];

function isSortColumn(column: string): column is SortColumn {
  return ALLOWED_SORT_COLUMNS.includes(column as SortColumn);
}

async function getUsers(
  sortBy: string,
  order: 'ASC' | 'DESC' = 'ASC'
): Promise<User[]> {
  // カラム名を検証
  if (!isSortColumn(sortBy)) {
    throw new Error(`Invalid sort column: ${sortBy}`);
  }

  // ORDER BY は許可リストで検証済みなので直接埋め込み可能
  const query = `SELECT * FROM users ORDER BY ${sortBy} ${order}`;
  const result = await pool.query(query);
  return result.rows;
}
```

### 動的WHERE句の構築

```typescript
interface SearchFilters {
  name?: string;
  email?: string;
  role?: string;
  minAge?: number;
  maxAge?: number;
}

async function searchUsers(filters: SearchFilters): Promise<User[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (filters.name) {
    conditions.push(`name ILIKE $${paramIndex++}`);
    params.push(`%${filters.name}%`);
  }

  if (filters.email) {
    conditions.push(`email = $${paramIndex++}`);
    params.push(filters.email);
  }

  if (filters.role) {
    conditions.push(`role = $${paramIndex++}`);
    params.push(filters.role);
  }

  if (filters.minAge !== undefined) {
    conditions.push(`age >= $${paramIndex++}`);
    params.push(filters.minAge);
  }

  if (filters.maxAge !== undefined) {
    conditions.push(`age <= $${paramIndex++}`);
    params.push(filters.maxAge);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT * FROM users ${whereClause}`;

  const result = await pool.query(query, params);
  return result.rows;
}
```

## ストアドプロシージャ

```typescript
// PostgreSQL ストアドプロシージャ
// CREATE FUNCTION get_user_by_id(user_id UUID)
// RETURNS TABLE(id UUID, name TEXT, email TEXT)
// LANGUAGE plpgsql
// AS $$
// BEGIN
//   RETURN QUERY SELECT u.id, u.name, u.email FROM users u WHERE u.id = user_id;
// END;
// $$;

// ✅ ストアドプロシージャを呼び出し
async function getUserById(userId: string): Promise<User | null> {
  const result = await pool.query('SELECT * FROM get_user_by_id($1)', [userId]);
  return result.rows[0] || null;
}
```

## 入力検証

```typescript
import { z } from 'zod';

// ✅ Zodで入力を検証
const UserIdSchema = z.string().uuid();
const EmailSchema = z.string().email();

async function getUserByEmail(rawEmail: string): Promise<User | null> {
  // 入力検証
  const email = EmailSchema.parse(rawEmail);

  // 検証済みの値でクエリ実行
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

// ✅ 複合バリデーション
const SearchParamsSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

async function searchUsers(params: unknown): Promise<User[]> {
  const validated = SearchParamsSchema.parse(params);
  // ... クエリ実行
}
```

## エラーハンドリング

```typescript
// ❌ 危険: 詳細なエラー情報を返す
app.get('/user/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    // 攻撃者にSQL構文情報を与えてしまう
    res.status(500).json({ error: error.message });
  }
});

// ✅ 安全: 一般的なエラーメッセージを返す
app.get('/user/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    // ログには詳細を記録
    console.error('Database error:', error);
    // クライアントには一般的なメッセージ
    res.status(500).json({ error: 'An error occurred' });
  }
});
```

## データベース権限

```sql
-- アプリケーション用の制限付きユーザーを作成
CREATE USER app_user WITH PASSWORD 'secure_password';

-- 必要最小限の権限のみ付与
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_user;
GRANT SELECT, INSERT ON audit_logs TO app_user;

-- 危険な権限は付与しない
-- GRANT DROP, ALTER, CREATE, TRUNCATE は付与しない
```

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
