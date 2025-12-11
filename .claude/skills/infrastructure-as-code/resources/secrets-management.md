# Secret管理ベストプラクティス

## Secretとは

外部に漏洩してはならない機密情報。

| 種別       | 例                                    |
| ---------- | ------------------------------------- |
| APIキー    | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` |
| トークン   | `DISCORD_TOKEN`, `GITHUB_TOKEN`       |
| 接続文字列 | `DATABASE_URL`                        |
| パスワード | `DB_PASSWORD`, `ADMIN_PASSWORD`       |

## 管理場所の選択

### GitHub Secrets

**用途**: CI/CDワークフロー

**設定方法**:

```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

**参照方法**:

```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

**スコープ**:

- Repository Secret: リポジトリ内のみ
- Environment Secret: 特定環境のみ
- Organization Secret: 組織全体

### Railway Secrets

**用途**: アプリケーション実行時

**設定方法**:

```bash
# CLI
railway variables set API_KEY=sk-xxx

# Dashboard
Service → Variables → Add Variable
```

**特徴**:

- 暗号化されて保存
- 実行時に環境変数として注入
- ログには表示されない（マスキング）

### Railway Plugins（自動注入）

**用途**: 統合サービスの接続情報

**例: Neon Plugin**

```
Neon Pluginを追加
→ DATABASE_URL が自動設定
→ 接続プーリングも自動構成
```

## Secretのライフサイクル

### 1. 生成

```
外部サービス
└── API Key / Token を発行
    └── コピー（一度しか表示されない場合あり）
```

### 2. 保存

```
開発者のローカル
└── .env.local（一時的）
    └── Railway / GitHub Secretsに登録
        └── .env.local から削除
```

### 3. 使用

```
CI/CD
└── GitHub Secrets → ワークフロー
    └── ${{ secrets.XXX }}

アプリケーション
└── Railway Variables → process.env
    └── process.env.XXX
```

### 4. ローテーション

```
定期的に（推奨: 90日ごと）
└── 新しいSecret生成
    └── 両方のSecretを一時的に有効化
        └── 新Secretに移行
            └── 古いSecretを無効化
```

### 5. 削除

```
使用終了時
└── すべての場所から削除
    └── アプリケーション
    └── CI/CD
    └── ドキュメント
```

## セキュリティプラクティス

### ✅ やるべきこと

1. **環境変数経由で使用**:

   ```typescript
   const apiKey = process.env.API_KEY;
   if (!apiKey) {
     throw new Error("API_KEY is required");
   }
   ```

2. **存在チェック**:

   ```typescript
   function getRequiredEnv(name: string): string {
     const value = process.env[name];
     if (!value) {
       throw new Error(`Environment variable ${name} is required`);
     }
     return value;
   }
   ```

3. **型安全な環境変数**:

   ```typescript
   // env.ts
   import { z } from "zod";

   const envSchema = z.object({
     DATABASE_URL: z.string().url(),
     OPENAI_API_KEY: z.string().startsWith("sk-"),
     NODE_ENV: z.enum(["development", "staging", "production"]),
   });

   export const env = envSchema.parse(process.env);
   ```

4. **最小権限の原則**:
   - 必要なスコープのみ付与
   - 読み取り専用で十分なら読み取り専用

5. **監査ログの確認**:
   - Secret使用履歴の定期確認
   - 異常なアクセスパターンの検出

### ❌ やってはいけないこと

1. **コードにハードコード**:

   ```typescript
   // ❌ 絶対にNG
   const apiKey = "sk-1234567890";
   ```

2. **ログに出力**:

   ```typescript
   // ❌ 危険
   console.log(`Using API key: ${apiKey}`);

   // ✅ 安全
   console.log("API key is configured");
   ```

3. **エラーメッセージに含める**:

   ```typescript
   // ❌ 危険
   throw new Error(`Auth failed with key: ${apiKey}`);

   // ✅ 安全
   throw new Error("Authentication failed");
   ```

4. **URLパラメータに含める**:

   ```typescript
   // ❌ 危険（URLはログに残る）
   fetch(`/api?key=${apiKey}`);

   // ✅ 安全
   fetch("/api", {
     headers: { Authorization: `Bearer ${apiKey}` },
   });
   ```

5. **コミット履歴に残す**:

   ```bash
   # ❌ 一度コミットするとgit history に残る
   # force push しても他のクローンには残る可能性

   # ✅ コミット前に確認
   git diff --staged | grep -i "api_key\|secret\|password\|token"
   ```

## Secret漏洩時の対応

### 検出時の即時対応

1. **Secretの無効化**:

   ```
   外部サービス → API Key → Revoke / Delete
   ```

2. **新Secretの生成**:

   ```
   外部サービス → API Key → Generate New
   ```

3. **すべての場所で更新**:

   ```
   Railway → Variables → Update
   GitHub → Secrets → Update
   ```

4. **影響範囲の確認**:
   - 不正使用の痕跡確認
   - 請求額の確認
   - ログの確認

### 事後対応

1. **原因分析**:
   - どこから漏洩したか
   - いつ漏洩したか
   - なぜ漏洩したか

2. **再発防止**:
   - コードレビューの強化
   - Secret検出ツールの導入
   - トレーニングの実施

## ツールによるSecret検出

### git-secrets

```bash
# インストール
brew install git-secrets

# リポジトリに設定
git secrets --install
git secrets --register-aws  # AWSパターン

# プッシュ前にチェック
git secrets --scan
```

### pre-commit hook

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
```

### GitHub Secret Scanning

```
Repository → Settings → Security → Secret scanning
→ Enable
```

## Secret検証テンプレート

### 起動時チェック

```typescript
// src/config/validate-env.ts
const requiredSecrets = ["DATABASE_URL", "OPENAI_API_KEY", "DISCORD_TOKEN"];

export function validateSecrets(): void {
  const missing = requiredSecrets.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required secrets: ${missing.join(", ")}`);
  }
}
```

### CI/CDでのチェック

```yaml
- name: Verify secrets are set
  run: |
    if [ -z "$DATABASE_URL" ]; then
      echo "❌ DATABASE_URL is not set"
      exit 1
    fi
    echo "✅ All required secrets are configured"
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```
