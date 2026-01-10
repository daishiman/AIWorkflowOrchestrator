# 環境分離パターン

## 環境の種類と目的

### 開発環境 (Development)

```bash
# .env.development
NODE_ENV=development
DATABASE_URL=libsql://localhost:8080
API_BASE_URL=http://localhost:3000/api
LOG_LEVEL=debug
DEBUG=true
```

**特徴**:

- ローカル開発用
- デバッグ機能有効
- ホットリロード対応
- 本番データへのアクセス禁止

### ステージング環境 (Staging)

```bash
# .env.staging
NODE_ENV=staging
DATABASE_URL=${STAGING_DATABASE_URL}
API_BASE_URL=https://staging-api.example.com
LOG_LEVEL=info
DEBUG=false
```

**特徴**:

- 本番と同等の構成
- 本番リリース前の検証用
- テストデータ使用
- 制限されたアクセス

### 本番環境 (Production)

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=${PRODUCTION_DATABASE_URL}
API_BASE_URL=https://api.example.com
LOG_LEVEL=warn
DEBUG=false
```

**特徴**:

- 最高レベルのセキュリティ
- パフォーマンス最適化
- 監視・アラート有効
- 厳格なアクセス制御

## 環境変数スキーマ定義

### Zodによる型安全な環境変数

```typescript
import { z } from "zod";

// 環境変数スキーマ
const envSchema = z.object({
  // 必須変数
  NODE_ENV: z.enum(["development", "staging", "production", "test"]),
  DATABASE_URL: z.string().url(),

  // オプション（デフォルト値あり）
  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default("3000"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  // 環境固有
  API_BASE_URL: z.string().url().optional(),

  // シークレット（本番必須）
  JWT_SECRET: z.string().min(32).optional(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
});

// 環境別バリデーション
const validateEnv = () => {
  const env = envSchema.parse(process.env);

  // 本番環境での追加チェック
  if (env.NODE_ENV === "production") {
    if (!env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required in production");
    }
    if (!env.DATABASE_AUTH_TOKEN) {
      throw new Error("DATABASE_AUTH_TOKEN is required in production");
    }
  }

  return env;
};

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
```

## 設定ファイル構成パターン

### パターン1: 階層的設定

```
config/
├── default.ts       # 基本設定
├── development.ts   # 開発環境上書き
├── staging.ts       # ステージング上書き
├── production.ts    # 本番上書き
└── index.ts         # 設定エクスポート
```

```typescript
// config/index.ts
import defaultConfig from "./default";
import developmentConfig from "./development";
import stagingConfig from "./staging";
import productionConfig from "./production";

const configs = {
  development: { ...defaultConfig, ...developmentConfig },
  staging: { ...defaultConfig, ...stagingConfig },
  production: { ...defaultConfig, ...productionConfig },
};

export const config = configs[process.env.NODE_ENV || "development"];
```

### パターン2: 環境変数中心

```typescript
// config/env.ts
export const config = {
  app: {
    name: process.env.APP_NAME || "MyApp",
    port: parseInt(process.env.PORT || "3000", 10),
    env: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || "3600", 10),
  },
  features: {
    enableNewUI: process.env.FEATURE_NEW_UI === "true",
    enableBetaFeatures: process.env.FEATURE_BETA === "true",
  },
};
```

## シークレット管理

### 開発環境

```bash
# .env.local（.gitignore対象）
DATABASE_URL=libsql://localhost:8080
API_KEY=dev_test_key_12345
```

### ステージング/本番

```typescript
// シークレットマネージャー統合
class SecretManager {
  private cache: Map<string, string> = new Map();

  async getSecret(name: string): Promise<string> {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    // Railway Secret Reference
    // 環境変数から直接取得（Railway/Vercelが注入）
    const value = process.env[name];

    if (!value) {
      throw new Error(`Secret ${name} not found`);
    }

    this.cache.set(name, value);
    return value;
  }
}
```

## フィーチャーフラグパターン

```typescript
// features/flags.ts
interface FeatureFlags {
  newDashboard: boolean;
  experimentalApi: boolean;
  betaFeatures: boolean;
}

const getFeatureFlags = (): FeatureFlags => {
  const env = process.env.NODE_ENV;

  // 開発環境: 全機能有効
  if (env === "development") {
    return {
      newDashboard: true,
      experimentalApi: true,
      betaFeatures: true,
    };
  }

  // ステージング: 新機能テスト
  if (env === "staging") {
    return {
      newDashboard: process.env.FEATURE_NEW_DASHBOARD === "true",
      experimentalApi: true,
      betaFeatures: true,
    };
  }

  // 本番: 慎重にロールアウト
  return {
    newDashboard: process.env.FEATURE_NEW_DASHBOARD === "true",
    experimentalApi: false,
    betaFeatures: false,
  };
};

export const features = getFeatureFlags();
```

## 環境別データベース設定

```typescript
// db/connection.ts
import { createClient } from "@libsql/client";

const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV;

  switch (env) {
    case "development":
      return {
        url: "file:local.db", // ローカルファイル
      };

    case "test":
      return {
        url: ":memory:", // インメモリ
      };

    case "staging":
    case "production":
      return {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      };

    default:
      throw new Error(`Unknown environment: ${env}`);
  }
};

export const db = createClient(getDatabaseConfig());
```

## チェックリスト

### 環境セットアップ時

- [ ] .env.exampleが存在し、全変数が記載されている
- [ ] .envファイルが.gitignoreに含まれている
- [ ] 環境変数のスキーマバリデーションが実装されている
- [ ] 本番必須の変数が明確に定義されている

### デプロイ前

- [ ] 全必須環境変数が設定されている
- [ ] シークレットが適切に管理されている
- [ ] 環境固有の設定が正しく反映されている
- [ ] ヘルスチェックが環境変数を検証している
