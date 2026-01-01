# Infrastructure as Code 原則

## IaCとは

Infrastructure as Code (IaC) は、インフラストラクチャ構成をコードとして管理する実践。
手動操作ではなく、コードによって環境を定義・プロビジョニング・管理する。

## 4つの核心原則

### 1. 宣言的定義 (Declarative Definition)

**概念**: 「どのように」ではなく「何が」あるべきかを定義

```json
// 宣言的: あるべき状態を定義
{
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

**利点**:

- 意図が明確
- 実装詳細の隠蔽
- 自動的な差分適用

**vs 命令的**:

```bash
# 命令的: 手順を記述（避けるべき）
railway up
railway variables set KEY=value
```

### 2. べき等性 (Idempotency)

**概念**: 何度実行しても同じ結果が得られる

```yaml
# べき等な操作
- name: Set environment variable
  railway_variable:
    name: NODE_ENV
    value: production
    state: present # 存在しなければ作成、存在すれば確認
```

**利点**:

- 安全な再実行
- エラー復旧が容易
- 自動化に適合

### 3. バージョン管理 (Version Control)

**概念**: すべての構成変更をGitで追跡

```
infrastructure/
├── railway.json          # Railway構成
├── .env.example          # 環境変数テンプレート
└── docs/
    └── env-vars.md       # 環境変数ドキュメント

git log --oneline railway.json
# a1b2c3d Update restart policy
# e4f5g6h Add health check
# i7j8k9l Initial configuration
```

**利点**:

- 変更履歴の追跡
- 差分レビュー（PR）
- ロールバック可能

### 4. 不変インフラ (Immutable Infrastructure)

**概念**: 変更ではなく再構築を優先

```
従来の可変アプローチ:
サーバー → 設定変更 → 設定変更 → 設定変更...
            (ドリフトが発生)

不変アプローチ:
コード → ビルド → デプロイ (新環境)
           ↓
       古い環境を削除
```

**利点**:

- 構成ドリフトの防止
- 再現可能な環境
- 一貫したデプロイ

## IaCの構成要素

### 構成ファイル

| ファイル     | 役割             | 例                  |
| ------------ | ---------------- | ------------------- |
| railway.json | デプロイ構成     | ビルド/起動コマンド |
| .env.example | 変数テンプレート | 必要な環境変数一覧  |
| Dockerfile   | コンテナ定義     | 実行環境            |

### 環境変数

| 種別     | 管理場所          | 例                        |
| -------- | ----------------- | ------------------------- |
| Secret   | Railway Secrets   | API_KEY, TURSO_AUTH_TOKEN |
| 環境固有 | Railway Variables | TURSO_DATABASE_URL        |
| 共通     | railway.json      | NODE_ENV                  |

### ワークフロー

```
開発者
  ↓
コード変更 (railway.json, .env.example)
  ↓
Pull Request
  ↓
レビュー & 承認
  ↓
マージ → 自動デプロイ
```

## Railway における IaC

### railway.json の役割

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Git 統合

```
GitHub リポジトリ
       ↓ (push to main)
Railway 自動検出
       ↓
railway.json 読み込み
       ↓
ビルド & デプロイ
```

### 環境変数の階層

```
1. Railway Service Variables (最高優先)
   ↓
2. Railway Project Variables
   ↓
3. Plugin 注入 (Turso DATABASE_URL等)
   ↓
4. デフォルト値 (railway.json)
```

## IaC 導入のステップ

### Step 1: 現状把握

```bash
# 現在の環境変数を確認
railway variables

# 現在のサービス構成を確認
railway status
```

### Step 2: コード化

```bash
# railway.json の作成
touch railway.json

# .env.example の作成
touch .env.example
```

### Step 3: バージョン管理

```bash
git add railway.json .env.example
git commit -m "feat: Add IaC configuration"
```

### Step 4: 自動化

```yaml
# GitHub Actions での検証
- name: Validate railway.json
  run: |
    if [ ! -f railway.json ]; then
      echo "❌ railway.json not found"
      exit 1
    fi
```

## アンチパターン

### 1. 管理画面依存

❌ **避けるべき**:

```
Railway Dashboard → Settings → Variables → 手動設定
```

✅ **推奨**:

```bash
# コードで管理
railway variables set KEY=value
# または railway.json で定義
```

### 2. 構成ドリフト

❌ **避けるべき**:

```
本番環境のみ手動で変更
→ ローカルや他環境と乖離
→ 再現不可能
```

✅ **推奨**:

```
コード変更 → PR → レビュー → 全環境に適用
```

### 3. Secret のハードコード

❌ **避けるべき**:

```javascript
const apiKey = "sk-1234567890abcdef";
```

✅ **推奨**:

```javascript
const apiKey = process.env.API_KEY;
```

## IaC 成熟度モデル

### Level 1: 手動

- 管理画面での手動操作
- ドキュメントなし
- 再現不可能

### Level 2: スクリプト化

- シェルスクリプトで自動化
- 部分的なドキュメント
- 限定的な再現性

### Level 3: 宣言的

- railway.json 等の設定ファイル
- 完全なドキュメント
- 再現可能

### Level 4: 完全自動化

- GitOps（Git操作で自動反映）
- 変更検出と自動ロールバック
- 監査ログ完備

## ベストプラクティスチェックリスト

- [ ] すべての構成がコードで定義されている
- [ ] 変更はPR経由でレビューされる
- [ ] Secretは環境変数経由で注入
- [ ] .env.exampleが最新状態
- [ ] デプロイは自動化されている
- [ ] ロールバック手順が明確
