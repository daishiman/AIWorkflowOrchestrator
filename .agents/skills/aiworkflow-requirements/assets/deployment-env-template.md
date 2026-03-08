# [環境/デプロイ名] デプロイ・環境仕様

> デプロイ手順・環境設定の仕様定義
> カテゴリ: デプロイ
> 読み込み条件: [環境名] のデプロイ・環境構築時

---

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| バージョン | 1.0.0                              |
| 最終更新   | YYYY-MM-DD                         |
| 環境       | Development / Staging / Production |
| インフラ   | [使用インフラ]                     |

---

## 1. 環境概要

### 1.1 環境構成

| 環境        | 用途         | URL                 |
| ----------- | ------------ | ------------------- |
| Development | ローカル開発 | localhost:3000      |
| Staging     | テスト・検証 | staging.example.com |
| Production  | 本番         | app.example.com     |

### 1.2 インフラ構成

```
[Client] → [CDN] → [Load Balancer] → [App Server] → [Database]
                                            ↓
                                      [Cache/Redis]
```

---

## 2. 環境変数

### 2.1 必須環境変数

| 変数名       | 説明            | 例           | 必須 |
| ------------ | --------------- | ------------ | ---- |
| NODE_ENV     | 実行環境        | production   | ✓    |
| DATABASE_URL | DB接続文字列    | libsql://xxx | ✓    |
| API_SECRET   | APIシークレット | (secret)     | ✓    |

### 2.2 オプション環境変数

| 変数名    | 説明               | デフォルト | 用途           |
| --------- | ------------------ | ---------- | -------------- |
| LOG_LEVEL | ログレベル         | info       | ログ制御       |
| CACHE_TTL | キャッシュ有効期限 | 3600       | パフォーマンス |

### 2.3 環境別設定

| 変数名    | Development | Staging | Production |
| --------- | ----------- | ------- | ---------- |
| NODE_ENV  | development | staging | production |
| DEBUG     | true        | true    | false      |
| LOG_LEVEL | debug       | info    | warn       |

---

## 3. デプロイ手順

### 3.1 前提条件

| 項目         | 要件           |
| ------------ | -------------- |
| Node.js      | >= 20.x        |
| pnpm         | >= 8.x         |
| CI/CD        | GitHub Actions |
| インフラ権限 | [必要な権限]   |

### 3.2 デプロイフロー

```
[Push to main] → [CI Tests] → [Build] → [Deploy to Staging]
                                              ↓ (approval)
                                        [Deploy to Production]
```

### 3.3 デプロイコマンド

```bash
# ビルド
pnpm build

# Staging デプロイ
pnpm deploy:staging

# Production デプロイ（手動承認後）
pnpm deploy:production
```

---

## 4. CI/CD設定

### 4.1 GitHub Actions ワークフロー

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # デプロイスクリプト
```

### 4.2 環境シークレット

| シークレット名 | 用途         | 設定場所       |
| -------------- | ------------ | -------------- |
| DATABASE_URL   | DB接続       | GitHub Secrets |
| DEPLOY_TOKEN   | デプロイ認証 | GitHub Secrets |
| API_SECRET     | API認証      | GitHub Secrets |

---

## 5. 監視・アラート

### 5.1 監視項目

| 項目             | 閾値 | アラート条件         |
| ---------------- | ---- | -------------------- |
| CPU使用率        | 80%  | 5分間超過で警告      |
| メモリ使用率     | 85%  | 5分間超過で警告      |
| レスポンスタイム | 3秒  | P95で超過時警告      |
| エラー率         | 1%   | 超過で即座にアラート |

### 5.2 ログ設定

| ログ種別     | 保存先             | 保持期間 |
| ------------ | ------------------ | -------- |
| アプリログ   | CloudWatch/Datadog | 30日     |
| アクセスログ | S3                 | 90日     |
| エラーログ   | Sentry             | 90日     |

---

## 6. ロールバック手順

### 6.1 自動ロールバック条件

| 条件               | アクション             |
| ------------------ | ---------------------- |
| ヘルスチェック失敗 | 前バージョンに自動復帰 |
| エラー率5%超過     | 自動ロールバック       |

### 6.2 手動ロールバック

```bash
# 前バージョンへロールバック
pnpm rollback:production

# 特定バージョンへロールバック
pnpm rollback:production --version=v1.2.3
```

---

## 7. チェックリスト

### 7.1 デプロイ前

- [ ] 全テストが通過
- [ ] 環境変数の設定確認
- [ ] マイグレーションの確認
- [ ] 依存関係の更新確認

### 7.2 デプロイ後

- [ ] ヘルスチェック確認
- [ ] 主要機能の動作確認
- [ ] ログのエラー確認
- [ ] 監視ダッシュボード確認

---

## 8. 実装ファイル

| 種別               | パス                           |
| ------------------ | ------------------------------ |
| CI/CD定義          | `.github/workflows/deploy.yml` |
| デプロイスクリプト | `scripts/deploy.sh`            |
| 環境設定           | `.env.example`, `config/`      |

---

## 関連ドキュメント

| ドキュメント             | 説明               |
| ------------------------ | ------------------ |
| deployment.md            | デプロイ全体概要   |
| environment-variables.md | 環境変数詳細       |
| deployment-gha.md        | GitHub Actions詳細 |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
