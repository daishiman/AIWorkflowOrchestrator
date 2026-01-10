# Environment Validation Guide

## 起動時検証

### 必須環境変数チェック

```typescript
const requiredVars = {
  development: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "LOG_LEVEL"],
  staging: [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "API_BASE_URL",
    "LOG_LEVEL",
    "NEXTAUTH_SECRET",
  ],
  production: [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "OPENAI_API_KEY",
    "NEXTAUTH_SECRET",
    "DISCORD_WEBHOOK_URL",
  ],
};

const env = process.env.NODE_ENV || "development";
const required = requiredVars[env];

for (const varName of required) {
  if (!process.env[varName]) {
    throw new Error(`Missing required variable: ${varName}`);
  }
}
```

### 環境混在チェック

```typescript
// 本番環境で開発パターンを検出
if (process.env.NODE_ENV === "production") {
  const devPatterns = ["dev", "test", "local", "example", "mock"];

  for (const [key, value] of Object.entries(process.env)) {
    if (devPatterns.some((p) => value?.toLowerCase().includes(p))) {
      throw new Error(`Production contains dev pattern in ${key}: ${value}`);
    }
  }
}
```

### Secret形式検証

```typescript
// NEXTAUTH_SECRET 長さチェック
if (process.env.NODE_ENV === "production") {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("NEXTAUTH_SECRET must be at least 32 characters");
  }
}
```

## 実行時検証

### データベース接続検証

```typescript
import { createClient } from "@libsql/client";

async function validateDatabaseConnection(): Promise<void> {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  try {
    await client.execute("SELECT 1");
    console.log("✅ Database connection validated");
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  } finally {
    client.close();
  }
}
```

### API Key検証

```typescript
async function validateAPIKey(): Promise<void> {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Invalid OPENAI_API_KEY: ${response.status}`);
  }

  console.log("✅ API Key validated");
}
```
