# Railway デプロイ詳細

## 概要

Railwayはゼロダウンタイムデプロイを自動的に実現するPaaS。
このドキュメントでは、Railway固有のデプロイ機能と設定を説明します。

## デプロイフロー

### 自動デプロイ

```
1. GitHub にプッシュ
   ↓
2. Railway が変更を検出
   ↓
3. 新コンテナをビルド
   ↓
4. 新コンテナを起動
   ↓
5. ヘルスチェック（設定時）
   ↓
6. トラフィックを新コンテナに切替
   ↓
7. 旧コンテナを停止
```

### ゼロダウンタイムの仕組み

```
時点1: [旧コンテナ] ← トラフィック

時点2: [旧コンテナ] ← トラフィック
       [新コンテナ] ← ビルド中

時点3: [旧コンテナ] ← トラフィック
       [新コンテナ] ← 起動・ヘルスチェック

時点4: [旧コンテナ]
       [新コンテナ] ← トラフィック（切替完了）

時点5: [新コンテナ] ← トラフィック（旧停止）
```

## railway.json 設定

### 基本設定

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### ヘルスチェック付き設定

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

### フルスタック Next.js 設定

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm db:generate && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

### Discord Bot 設定

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start:bot",
    "restartPolicyType": "ALWAYS"
  }
}
```

## 環境（Environments）

### 環境の種類

```
Production  ← 本番環境
Staging     ← ステージング環境
Development ← 開発環境（オプション）
```

### 環境の作成

```
Railway Dashboard → Project → Environments → New Environment
```

### 環境ごとの設定

| 環境 | NODE_ENV | LOG_LEVEL | 用途 |
|------|----------|-----------|------|
| Production | production | warn | 本番トラフィック |
| Staging | staging | info | 検証・テスト |

### ブランチデプロイ

```
main ブランチ → Production 環境
develop ブランチ → Staging 環境
```

**設定方法**:
```
Railway Dashboard → Service → Settings → Source → Branch
```

## ロールバック

### Dashboard からロールバック

```
1. Railway Dashboard にアクセス
2. プロジェクト → サービスを選択
3. Deployments タブ
4. ロールバック先のデプロイを選択
5. 三点メニュー → "Rollback to this deployment"
```

### CLI からロールバック

```bash
# デプロイ一覧を表示
railway deployments list

# 特定のデプロイにロールバック
railway rollback <deployment-id>
```

### ロールバック時の注意

1. **環境変数の変更**
   - ロールバックしてもenv変数は元に戻らない
   - 必要に応じて手動で変更

2. **データベースマイグレーション**
   - アプリはロールバックされるがDBは戻らない
   - 前方互換なマイグレーションを推奨

## デプロイの監視

### ログの確認

```bash
# リアルタイムログ
railway logs

# 過去のログ
railway logs --limit 100

# フィルタリング
railway logs | grep ERROR
```

### Dashboard での確認

```
Railway Dashboard → Service → Deployments
- Build ログ
- Runtime ログ
- メトリクス
```

## 手動デプロイ

### CLI からデプロイ

```bash
# プロジェクトにリンク
railway link

# デプロイ
railway up

# 特定の環境にデプロイ
railway up --environment staging
```

### GitHub Actions 連携

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Railway CLI
        run: pnpm i -g @railway/cli

      - name: Deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: railway up
```

## トラブルシューティング

### ビルド失敗

**症状**: デプロイがビルドフェーズで失敗

**確認事項**:
1. buildCommand が正しいか
2. package.json の scripts が存在するか
3. 依存関係が正しくインストールされるか

**対処法**:
```bash
# ローカルでビルドを確認
pnpm install --frozen-lockfile
pnpm build

# ビルドログを確認
railway logs --build
```

### 起動失敗

**症状**: ビルドは成功するがサービスが起動しない

**確認事項**:
1. startCommand が正しいか
2. 環境変数が設定されているか
3. ポートが正しく設定されているか

**対処法**:
```bash
# 環境変数を確認
railway variables

# ログを確認
railway logs
```

### ヘルスチェック失敗

**症状**: デプロイが完了しない、ヘルスチェックでタイムアウト

**確認事項**:
1. healthcheckPath が正しいか
2. エンドポイントが200を返すか
3. タイムアウトが十分か

**対処法**:
```bash
# エンドポイントを直接確認
curl https://your-app.railway.app/api/health

# タイムアウトを延長
# railway.json の healthcheckTimeout を増やす
```

### メモリ不足

**症状**: OOMエラーでサービスが再起動

**確認事項**:
1. メモリ使用量が適切か
2. メモリリークがないか

**対処法**:
```bash
# メトリクスを確認
Railway Dashboard → Service → Metrics

# リソースを増加
Railway Dashboard → Service → Settings → Resources
```

## ベストプラクティス

### デプロイ前

1. **ローカルでビルド確認**
   ```bash
   pnpm install --frozen-lockfile
   pnpm build
   ```

2. **ステージングで検証**
   - 本番と同じ設定で動作確認
   - スモークテスト実行

3. **マイグレーション確認**
   - DBマイグレーションが前方互換か
   - ロールバック可能か

### デプロイ中

1. **ログを監視**
   ```bash
   railway logs --follow
   ```

2. **メトリクスを確認**
   - エラー率
   - レスポンスタイム
   - リソース使用率

### デプロイ後

1. **スモークテスト実行**
   - 主要機能の動作確認
   - API応答確認

2. **アラートを確認**
   - エラー通知
   - パフォーマンスアラート

3. **ロールバック準備**
   - 問題発生時は即座にロールバック
   - ロールバック手順を把握

## 参考リンク

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [Railway Configuration Reference](https://docs.railway.app/reference/config-as-code)
