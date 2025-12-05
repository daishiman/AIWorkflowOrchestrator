# SQLite/Turso Migration Updates Summary

This document summarizes the key changes made to adapt the database-migrations skill for SQLite/Turso usage.

## Completed Updates

### 1. SKILL.md

- ✅ Updated dialect references from PostgreSQL to SQLite
- ✅ Added SQLite-specific considerations section
- ✅ Updated commands: `generate` → `generate:sqlite`, `push` → `push:sqlite`
- ✅ Added SQLite ALTER TABLE limitations troubleshooting
- ✅ Updated performance debugging (EXPLAIN ANALYZE → EXPLAIN QUERY PLAN, VACUUM)
- ✅ Updated references (PostgreSQL docs → SQLite docs, added Turso docs)

### 2. drizzle-kit-commands.md (Partially Completed)

- ✅ Updated config examples for SQLite/Turso
- ✅ Changed connection strings (`postgres://` → `file:` or `libsql://`)
- ✅ Updated generate command to `generate:sqlite`
- ⏳ Remaining sections need updates (see below)

## Remaining Updates Needed

### 3. drizzle-kit-commands.md (Complete These)

**Sections to update:**

```bash
# Replace PostgreSQL-specific commands
DATABASE_URL=postgres://... → DATABASE_URL=file:./local.db
psql -c "SELECT..." → sqlite3 local.db "SELECT..."

# Update push command
pnpm drizzle-kit push → pnpm drizzle-kit push:sqlite

# Update migration examples
ALTER TABLE "users" → ALTER TABLE `users`  # Double quotes → backticks
DROP COLUMN → Table recreation pattern

# Remove CONCURRENTLY references
CREATE INDEX CONCURRENTLY → CREATE INDEX  # SQLite doesn't support CONCURRENTLY

# Update package.json scripts
"db:generate": "drizzle-kit generate:sqlite"
"db:push": "drizzle-kit push:sqlite"
```

### 4. migration-strategies.md

**Key Changes:**

````markdown
## SQLite-Specific Limitations

### ALTER TABLE Restrictions

SQLite does NOT support:

- DROP COLUMN
- ALTER COLUMN (type change, constraints)
- ADD CONSTRAINT (for some constraint types)

### Workaround: Table Recreation Pattern

```sql
-- 1. Create new table with desired schema
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  -- new schema
);

-- 2. Copy data
INSERT INTO users_new SELECT id, name FROM users;

-- 3. Drop old table
DROP TABLE users;

-- 4. Rename new table
ALTER TABLE users_new RENAME TO users;
```
````

### Batch Processing

Replace PostgreSQL DO $$ blocks with simple loops:

```javascript
// Use application code for batch operations
for (let offset = 0; offset < total; offset += batch_size) {
  await db.execute(
    sql`UPDATE users SET ... LIMIT ${batch_size} OFFSET ${offset}`,
  );
}
```

````

### 5. rollback-procedures.md

**Key Changes:**

```markdown
## Backup Strategies

### SQLite File Backup
```bash
# Simple file copy (database must be idle)
cp local.db local.db.backup

# Using SQLite .backup command
sqlite3 local.db ".backup local.db.backup"

# Using .dump for SQL export
sqlite3 local.db .dump > backup.sql
````

### Turso Backup

```bash
# Turso provides automatic backups
turso db list-backups <db-name>

# Create manual snapshot
turso db create-snapshot <db-name>

# Restore from snapshot
turso db restore <db-name> <snapshot-id>
```

### Replace pg_dump references

```bash
# OLD (PostgreSQL)
pg_dump $DATABASE_URL -F c -f backup.dump

# NEW (SQLite)
sqlite3 local.db ".backup backup.db"

# NEW (Turso)
turso db create-snapshot production-db
```

````

### 6. schema-change-patterns.md

**Key Changes:**

```markdown
## SQLite ALTER TABLE Limitations

### What SQLite DOES Support:
- ✅ ADD COLUMN
- ✅ RENAME TABLE
- ✅ RENAME COLUMN (SQLite 3.25.0+)

### What SQLite DOES NOT Support:
- ❌ DROP COLUMN
- ❌ ALTER COLUMN TYPE
- ❌ ADD CONSTRAINT (most types)
- ❌ DROP CONSTRAINT

### Column Deletion Pattern
```sql
-- Cannot use ALTER TABLE DROP COLUMN
-- Must use table recreation:

CREATE TABLE users_new AS
SELECT id, name, email  -- exclude deleted column
FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE INDEX users_email_idx ON users(email);
````

### Type Change Pattern

```sql
-- Cannot use ALTER COLUMN TYPE
-- Must use table recreation with CAST:

CREATE TABLE products_new (
  id INTEGER PRIMARY KEY,
  price REAL  -- Changed from INTEGER
);

INSERT INTO products_new
SELECT id, CAST(price AS REAL)
FROM products;

DROP TABLE products;
ALTER TABLE products_new RENAME TO products;
```

### Remove PostgreSQL-specific features:

- ENUM types → Use TEXT with CHECK constraints
- Arrays → Use JSON or separate tables
- JSONB → Use JSON (TEXT storage)

````

### 7. transition-period-patterns.md

**Key Changes:**

```markdown
## SQLite Trigger Syntax

### Column Rename Trigger (SQLite-compatible)
```sql
-- PostgreSQL trigger functions don't exist in SQLite
-- Use simplified AFTER triggers:

CREATE TRIGGER sync_user_name_insert
AFTER INSERT ON users
BEGIN
  UPDATE users
  SET full_name = NEW.name
  WHERE id = NEW.id AND full_name IS NULL;
END;

CREATE TRIGGER sync_user_name_update
AFTER UPDATE ON users
BEGIN
  UPDATE users
  SET full_name = NEW.name
  WHERE id = NEW.id AND NEW.name IS NOT NULL;
END;
````

### Limitations:

- No PL/pgSQL → Use simple SQL in triggers
- No `FOR EACH ROW` variable assignment → Use separate UPDATE statements
- No `RETURNS TRIGGER` → Use `BEGIN...END` blocks

### Table Split Pattern (SQLite)

```sql
-- Simpler than PostgreSQL, but similar concept
CREATE TRIGGER sync_to_profiles
AFTER INSERT ON users
BEGIN
  INSERT INTO user_profiles (user_id, bio, avatar_url)
  VALUES (NEW.id, NEW.bio, NEW.avatar_url);
END;
```

````

### 8. zero-downtime-patterns.md

**Key Changes:**

```markdown
## SQLite Zero-Downtime Considerations

### Key Differences from PostgreSQL:
1. **File-based**: SQLite uses a single file, simpler for atomic replacements
2. **No CONCURRENTLY**: Index creation is already lightweight
3. **Write lock**: Only one writer at a time (usually not an issue for single-user apps)

### Turso-Specific Features:
```bash
# Use Turso branches for zero-downtime migrations
turso db create-branch production-db migration-test

# Test migration on branch
turso db shell migration-test < migration.sql

# If successful, merge to production
turso db merge migration-test production-db
````

### Pattern Adjustments:

**Column Addition** (same as PostgreSQL):

```sql
ALTER TABLE users ADD COLUMN nickname TEXT;
-- No changes needed, already SQLite-compatible
```

**Column Deletion** (requires table recreation):

```sql
-- Step 1: Create new table schema
-- Step 2: Copy data (excluding old column)
-- Step 3: Swap tables atomically
BEGIN TRANSACTION;
  CREATE TABLE users_new (...);
  INSERT INTO users_new SELECT ... FROM users;
  DROP TABLE users;
  ALTER TABLE users_new RENAME TO users;
COMMIT;
```

**Remove PostgreSQL-specific patterns**:

- NOT VALID constraints → Not supported
- CONCURRENTLY → Not needed
- VALIDATE CONSTRAINT → Not supported

````

### 9. migration-plan-template.md & migration-checklist.md

**Key Changes:**

```markdown
# Replace all PostgreSQL commands with SQLite equivalents

## Backup Commands
```bash
# OLD
pg_dump $DATABASE_URL -F c -f backup.dump

# NEW (Local SQLite)
sqlite3 local.db ".backup backup_$(date +%Y%m%d_%H%M%S).db"

# NEW (Turso)
turso db create-snapshot production-db
````

## Schema Verification

```bash
# OLD
\d table_name
\di table_name*

# NEW
sqlite3 local.db ".schema users"
sqlite3 local.db ".indexes users"
```

## Integrity Checks

```sql
-- Add SQLite-specific checks
PRAGMA integrity_check;
PRAGMA foreign_key_check;
```

## Checklist Updates

- [ ] Verify Drizzle Kit is using `dialect: 'sqlite'`
- [ ] Check generated SQL for table recreation patterns (DROP/ALTER COLUMN)
- [ ] Confirm Turso auth token is set (production)
- [ ] Test with local SQLite before deploying to Turso
- [ ] Run VACUUM after large data operations

````

## Key SQL Syntax Differences

### Identifier Quoting
```sql
# PostgreSQL: Double quotes
"table_name" "column_name"

# SQLite: Backticks (or double quotes, but backticks preferred)
`table_name` `column_name`
````

### Connection Strings

```
# PostgreSQL
postgres://user:pass@host:5432/dbname

# SQLite Local
file:./local.db
file:/absolute/path/to/db.sqlite

# Turso (libSQL)
libsql://dbname-org.turso.io
```

### Data Types

```sql
# PostgreSQL SERIAL → SQLite INTEGER PRIMARY KEY (auto-increment)
# PostgreSQL UUID → SQLite TEXT or BLOB
# PostgreSQL TIMESTAMPTZ → SQLite TEXT or INTEGER (Unix timestamp)
# PostgreSQL JSONB → SQLite TEXT (JSON functions available)
```

## Drizzle ORM Schema Differences

```typescript
// PostgreSQL
import { pgTable, serial, uuid, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom(),
  createdAt: timestamp("created_at").defaultNow(),
});

// SQLite
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid")
    .notNull()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});
```

## Testing Checklist

Before deploying SQLite migrations:

- [ ] Test locally with `file:./test.db`
- [ ] Verify table recreation patterns work correctly
- [ ] Check foreign key constraints are maintained
- [ ] Test rollback procedures
- [ ] Confirm indexes are recreated
- [ ] Run PRAGMA integrity_check
- [ ] Test with Turso staging database
- [ ] Verify auth token and connection
- [ ] Check migration history in \_\_drizzle_migrations table

## Common Pitfalls

1. **Assuming PostgreSQL ALTER TABLE works** → Many operations require table recreation
2. **Using CONCURRENTLY** → Not supported, remove from SQL
3. **Complex triggers** → Keep triggers simple, no PL/pgSQL
4. **Large transactions** → SQLite can lock the entire database
5. **Connection pooling** → Not needed for single-file SQLite, but Turso supports it
6. **ENUM types** → Use TEXT with CHECK constraints instead

## Resources

- SQLite ALTER TABLE: https://www.sqlite.org/lang_altertable.html
- SQLite Data Types: https://www.sqlite.org/datatype3.html
- Turso Documentation: https://docs.turso.tech/
- Drizzle SQLite: https://orm.drizzle.team/docs/get-started-sqlite
