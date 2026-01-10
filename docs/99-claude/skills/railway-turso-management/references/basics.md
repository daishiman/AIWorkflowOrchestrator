# Railway + Turso 基礎ガイド

> **相対パス**: `references/basics.md`
> **読み込み条件**: 初回セットアップ時

---

## 1. Railway環境グループ

### 1.1 基本構成

| 環境グループ | 用途           | 分離レベル |
| ------------ | -------------- | ---------- |
| Base         | 共通設定の定義 | 低         |
| Development  | 開発者ローカル | 中         |
| Staging      | QA/テスト環境  | 高         |
| Production   | 本番環境       | 最高       |

### 1.2 継承関係

```
Base（共通設定）
  ├── Development（開発用オーバーライド）
  ├── Staging（ステージング用オーバーライド）
  └── Production（本番用オーバーライド）
```

---

## 2. Variables vs Secrets

### 2.1 分類基準

| 種別      | 対象               | 特徴                   |
| --------- | ------------------ | ---------------------- |
| Variables | 非機密設定値       | ログに表示可能         |
| Secrets   | 認証情報、トークン | 暗号化、ログマスキング |

### 2.2 分類の例

| 変数               | 種別      | 理由               |
| ------------------ | --------- | ------------------ |
| TURSO_DATABASE_URL | Variables | URLは非機密        |
| TURSO_AUTH_TOKEN   | Secrets   | 認証トークンは機密 |
| DATABASE_NAME      | Variables | 識別子は非機密     |
| API_SECRET_KEY     | Secrets   | 秘密鍵は機密       |

---

## 3. Turso統合の基礎

### 3.1 必要な接続情報

| 情報         | 取得方法                 | 格納先    |
| ------------ | ------------------------ | --------- |
| Database URL | `turso db show <name>`   | Variables |
| Auth Token   | `turso db tokens create` | Secrets   |

### 3.2 libSQLクライアント設定

```typescript
import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

---

## 4. Railway CLI活用

### 4.1 ローカル開発

```bash
# Railway環境変数を使用してローカル実行
railway run pnpm dev
```

### 4.2 変数管理

```bash
# Variables設定
railway variables set TURSO_DATABASE_URL="libsql://..."

# Secrets確認（値は表示されない）
railway variables
```

---

## 関連リソース

- **シークレット詳細**: See [secrets-guide.md](secrets-guide.md)
- **Turso統合詳細**: See [turso-integration.md](turso-integration.md)
