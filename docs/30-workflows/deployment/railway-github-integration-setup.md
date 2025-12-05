# Railway GitHub連携による自動デプロイ設定ガイド

## 概要

Railway側のGitHub Integrationsを使用して、mainブランチへのpush時に自動デプロイを実行する設定手順です。

GitHub Actionsは品質チェック（CI）のみを実行し、実際のデプロイはRailway側で自動的に行われます。

---

## Railway側のGitHub連携設定

### Step 1: Railwayダッシュボードにアクセス

1. https://railway.app/dashboard を開く
2. 対象プロジェクト（AIWorkflowOrchestrator）を選択
3. サービスカード（backend）をクリック

### Step 2: GitHub連携の確認

1. サービス設定画面で **Settings** タブをクリック
2. **Source** セクションを確認

**正しく設定されている場合**:

```
Source: GitHub
Repository: daishiman/AIWorkflowOrchestrator
Branch: main
```

**設定されていない場合**:

1. **Connect Repo** をクリック
2. リポジトリ `daishiman/AIWorkflowOrchestrator` を選択
3. ブランチ `main` を選択
4. Root Directory: `apps/backend` を設定

### Step 3: 自動デプロイトリガーの設定

1. **Settings** タブ → **Deploy** セクション
2. 以下を確認・設定:

| 設定項目                | 値                                      | 説明                                 |
| ----------------------- | --------------------------------------- | ------------------------------------ |
| **Auto Deploy**         | ✅ ON                                   | mainブランチへのpush時に自動デプロイ |
| **Watch Paths**         | `apps/backend/**`, `packages/shared/**` | 変更監視対象                         |
| **Healthcheck Path**    | `/api/health`                           | ヘルスチェックエンドポイント         |
| **Healthcheck Timeout** | `100`                                   | タイムアウト（秒）                   |

### Step 4: ビルド設定の確認

1. **Settings** タブ → **Build** セクション
2. 以下を確認:

| 設定項目           | 値                   |
| ------------------ | -------------------- |
| **Root Directory** | `apps/backend`       |
| **Builder**        | NIXPACKS（自動検出） |

> **注意**: `railway.toml` がプロジェクトルートに存在する場合、そちらの設定が優先されます。

---

## 動作確認

### mainブランチにpushして確認

```bash
# 何か変更を加える（例: READMEの更新）
echo "# Test" >> apps/backend/README.md

# コミット
git add apps/backend/README.md
git commit -m "test: Trigger Railway auto-deploy"

# push
git push origin main
```

### Railwayダッシュボードで確認

1. サービスカード → **Deployments** タブ
2. 新しいデプロイが自動的に開始される
3. ステータスを確認:
   - 🟡 **Building** → ビルド中
   - 🟡 **Deploying** → デプロイ中
   - 🟢 **Active** → デプロイ成功

### ログ確認

1. デプロイメントをクリック
2. **Build Logs** でビルドログを確認
3. **Deploy Logs** でランタイムログを確認

---

## GitHub Actions vs Railway自動デプロイ

### 役割分担

| 項目               | GitHub Actions         | Railway     |
| ------------------ | ---------------------- | ----------- |
| **品質チェック**   | ✅ lint/test/typecheck | -           |
| **ビルド検証**     | ✅ ローカルビルド確認  | -           |
| **デプロイ実行**   | ❌ 実行しない          | ✅ 自動実行 |
| **ヘルスチェック** | ❌ 実行しない          | ✅ 自動実行 |

### メリット

| 項目             | 説明                                    |
| ---------------- | --------------------------------------- |
| **シンプル**     | Railway CLIの複雑な認証設定が不要       |
| **信頼性**       | RailwayのネイティブGit統合を使用        |
| **ログ統合**     | すべてのデプロイログがRailwayで一元管理 |
| **ロールバック** | Railway UIから簡単にロールバック可能    |

---

## トラブルシューティング

### 自動デプロイが実行されない

**確認項目**:

1. ✅ Auto Deployが有効になっているか
2. ✅ GitHub連携が正しく設定されているか
3. ✅ Watch Pathsに該当する変更があるか

**解決方法**:

- Railway Settings → Source → **Reconnect** して再接続

### デプロイは成功するがアプリが起動しない

**確認項目**:

1. Deploy Logsでエラーを確認
2. 環境変数が正しく設定されているか
3. `railway.toml` の設定を確認

**解決方法**:

```bash
# ローカルでビルドを確認
pnpm --filter @repo/shared build
pnpm --filter @repo/backend build
pnpm --filter @repo/backend start
```

### ヘルスチェックが失敗する

**確認項目**:

1. Healthcheck Pathが `/api/health` になっているか
2. ローカルで `curl http://localhost:3001/api/health` が動作するか

**解決方法**:

- Healthcheck Timeoutを100秒に延長
- ヘルスチェックを一時的に無効化してログを確認

---

## 次のステップ

設定完了後:

1. ✅ GitHub Actionsは品質チェックのみ実行
2. ✅ RailwayがmainブランチのpushでEOF自動デプロイ
3. ✅ デプロイステータスはRailway UIで確認

**参考リンク**:

- [Railway GitHub Integration](https://docs.railway.com/guides/github)
- [Railway Deployments](https://docs.railway.com/deploy/deployments)
