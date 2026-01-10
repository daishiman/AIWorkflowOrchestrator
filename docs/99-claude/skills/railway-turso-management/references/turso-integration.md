# Turso統合ガイド

> **相対パス**: `references/turso-integration.md`
> **読み込み条件**: Turso接続設定時

---

## 1. Tursoデータベース作成

### 1.1 CLI操作

```bash
# データベース作成
turso db create <db-name> --location <region>

# 情報確認
turso db show <db-name>

# トークン生成
turso db tokens create <db-name>
```

### 1.2 推奨リージョン

| リージョン | 用途             |
| ---------- | ---------------- |
| nrt        | 日本ユーザー向け |
| lax        | 北米西海岸       |
| iad        | 北米東海岸       |

---

## 2. libSQLクライアント設定

### 2.1 基本設定

```typescript
// lib/db.ts
import { createClient, type Client } from "@libsql/client";

export const db: Client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

### 2.2 エラーハンドリング

```typescript
export async function executeQuery<T>(
  sql: string,
  args?: unknown[],
): Promise<T[]> {
  try {
    const result = await db.execute({ sql, args });
    return result.rows as T[];
  } catch (error) {
    // エラーログ（トークン含まない）
    console.error("Query failed:", sql);
    throw error;
  }
}
```

### 2.3 接続テスト

```typescript
export async function checkConnection(): Promise<boolean> {
  try {
    await db.execute("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection failed");
    return false;
  }
}
```

---

## 3. 環境別設定

### 3.1 Railway Variables設定

| 環境        | TURSO_DATABASE_URL                 |
| ----------- | ---------------------------------- |
| Development | `libsql://dev-db-xxx.turso.io`     |
| Staging     | `libsql://staging-db-xxx.turso.io` |
| Production  | `libsql://prod-db-xxx.turso.io`    |

### 3.2 ローカル開発

```bash
# Railway経由でローカル実行（本番同等の環境変数）
railway run pnpm dev

# または.env.localファイル使用
cp .env.example .env.local
# TURSO_DATABASE_URL と TURSO_AUTH_TOKEN を設定
```

---

## 4. セキュリティ考慮事項

### 4.1 必須対策

| 対策                   | 実装方法                    |
| ---------------------- | --------------------------- |
| トークン分離           | URL と Token を別変数で管理 |
| エラーログ安全化       | トークンをログに含めない    |
| 環境変数バリデーション | 起動時に必須変数を確認      |

### 4.2 起動時チェック

```typescript
function validateEnv(): void {
  const required = ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
}
```

---

## 関連リソース

- **基礎ガイド**: See [basics.md](basics.md)
- **シークレット**: See [secrets-guide.md](secrets-guide.md)
