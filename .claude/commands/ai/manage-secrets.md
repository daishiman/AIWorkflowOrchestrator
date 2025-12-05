---
description: |
  機密情報（APIキー、シークレット、環境変数）を安全に管理し、
  ハードコードされたシークレットを検出して適切な管理手法を実装します。

  🤖 起動エージェント:
  - Phase 1-3: `.claude/agents/secret-mgr.md` - 機密情報管理専門エージェント

  📚 利用可能スキル（secret-mgrエージェントが参照）:
  - `.claude/skills/secret-management-architecture/SKILL.md` - Secret管理方式選択、アクセス制御
  - `.claude/skills/zero-trust-security/SKILL.md` - Zero Trust 5原則、RBAC/ABAC
  - `.claude/skills/gitignore-management/SKILL.md` - .gitignore設計、機密ファイルパターン
  - `.claude/skills/pre-commit-security/SKILL.md` - pre-commit hook、機密情報検出
  - `.claude/skills/encryption-key-lifecycle/SKILL.md` - 暗号化、鍵生成・保管・Rotation
  - `.claude/skills/environment-isolation/SKILL.md` - 環境分離、最小権限
  - `.claude/skills/railway-secrets-management/SKILL.md` - Railway Secrets、Turso Plugin
  - `.claude/skills/github-actions-security/SKILL.md` - GitHub Secrets、Environment保護

  ⚙️ このコマンドの設定:
  - argument-hint: なし（プロジェクト全体を分析）
  - allowed-tools: シークレット管理とファイル操作用
    • Read: コードスキャン、環境変数ファイル確認用
    • Write: .env.example、設定ファイル生成用
    • Grep: ハードコードシークレット検出用
  - model: sonnet（標準的なシークレット管理タスク）

  📋 成果物:
  - `.env.example`（環境変数テンプレート）
  - 更新された`.gitignore`
  - シークレット管理手順書

  🎯 検出対象:
  - ハードコードされたAPIキー・パスワード・トークン
  - 環境変数の不適切な管理
  - .gitignore漏れ

  トリガーキーワード: secret management, 機密情報管理, API key, 環境変数, .env, シークレット検出, credentials
allowed-tools:
  - Read
  - Write
  - Grep
model: sonnet
disable-model-invocation: false
---

# /ai:manage-secrets - 機密情報の安全な管理

**目的**: プロジェクト内の機密情報（APIキー、シークレット、パスワード、トークン等）を安全に管理し、ハードコードされたシークレットを検出して適切な管理手法を実装します。

**トリガーキーワード**: secret management, 機密情報管理, API key, 環境変数, .env, シークレット検出, ハードコード検出, credentials, token管理

---

## 📋 引数仕様

引数なし（プロジェクト全体を分析）

**使用例**:

```bash
/ai:manage-secrets
```

---

## 🎯 実行フロー（3フェーズ構造）

### Phase 1: 準備・スキャン

**エージェント起動**:

```
`.claude/agents/secret-mgr.md` を起動し、以下を依頼:
- プロジェクト構造の分析
- 既存のシークレット管理手法の確認
- ハードコードされたシークレットのスキャン
- 環境変数ファイルの検証
```

**スキル参照** (Phase 1):

- `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト構造理解
- `.claude/skills/tool-permission-management/SKILL.md`: 権限管理パターン
- `.claude/skills/best-practices-curation/SKILL.md`: シークレット管理ベストプラクティス

**スキャン対象パターン**:

```regex
# 検出パターン例
- API keys: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi
- Passwords: /password\s*=\s*['"][^'"]+['"]/gi
- Tokens: /token\s*=\s*['"][^'"]+['"]/gi
- Private keys: /-----BEGIN (RSA |)PRIVATE KEY-----/
- AWS credentials: /AKIA[0-9A-Z]{16}/
- Database URLs: /libsql:\/\/[^'"]+/gi
- Turso tokens: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/
```

**期待成果物**:

- ハードコードされたシークレットのリスト
- 既存の環境変数ファイル分析結果
- シークレット管理の改善提案

---

### Phase 2: シークレット管理実装

**エージェント起動**:

```
`.claude/agents/secret-mgr.md` を起動し、以下を依頼:
- .env.example テンプレートの作成
- 検出されたシークレットの環境変数化
- .gitignore の更新
- シークレット管理手順書の作成
```

**スキル参照** (Phase 2):

- `.claude/skills/tool-permission-management/SKILL.md`: 権限分離パターン
- `.claude/skills/best-practices-curation/SKILL.md`: セキュリティベストプラクティス
- `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト統合

**実装内容**:

```
【.env.example の作成】
- すべての必要な環境変数をリストアップ
- 説明コメントを追加
- サンプル値を記載（本物のシークレットは含めない）

【.gitignore の更新】
- .env
- .env.local
- .env.production
- *.pem
- *.key
- secrets/*

【環境変数の読み込み実装】
- dotenv または @t3-oss/env-nextjs の設定
- 型安全な環境変数アクセス
- バリデーション実装
```

**環境変数の分類**:

```
【Public環境変数】
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=MyApp

【Private環境変数】
TURSO_DATABASE_URL=libsql://[db-name]-[org-name].turso.io
TURSO_AUTH_TOKEN=<your-turso-token>
API_SECRET_KEY=<your-secret-key>
JWT_SECRET=<your-jwt-secret>

【OAuth Credentials】
GITHUB_CLIENT_ID=<your-client-id>
GITHUB_CLIENT_SECRET=<your-client-secret>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>

【Third-party API Keys】
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
```

**期待成果物**:

- `.env.example`: 環境変数テンプレート
- `.gitignore`: 更新版
- `src/config/env.ts` または `src/env.mjs`: 型安全な環境変数アクセス
- ハードコードされたシークレットの除去

---

### Phase 3: ドキュメント生成・検証

**エージェント起動**:

```
`.claude/agents/secret-mgr.md` を起動し、以下を依頼:
- シークレット管理手順書の作成
- ローカル開発セットアップガイドの生成
- CI/CD環境でのシークレット管理ガイド
- 検証レポート作成
```

**スキル参照** (Phase 3):

- `.claude/skills/best-practices-curation/SKILL.md`: 運用ベストプラクティス
- `.claude/skills/tool-permission-management/SKILL.md`: 権限管理

**成果物**:

- `docs/security/secret-management.md`: シークレット管理手順書
  - 環境変数の設定方法
  - .envファイルのセットアップ
  - 本番環境でのシークレット管理
  - CI/CD環境でのシークレット設定
  - ローテーション手順
- `docs/setup/local-development.md`: ローカル開発セットアップガイド
  - .envファイルのコピーと設定
  - 必要なシークレットの取得方法
- `docs/security/secret-scan-report.md`: スキャンレポート
  - 検出されたハードコードシークレット
  - 修正済み項目
  - 推奨される追加対策

---

## 🔍 検証項目

実行後、以下を確認してください:

- [ ] .env.example が作成されている
- [ ] ハードコードされたシークレットが除去されている
- [ ] .gitignore が適切に更新されている
- [ ] 型安全な環境変数アクセスが実装されている
- [ ] シークレット管理手順書が生成されている
- [ ] Grepで再スキャンしてシークレットが残っていないことを確認

**再スキャンコマンド**:

```bash
# APIキーの検出
grep -r "api[_-]key.*=.*['\"]" src/

# パスワードの検出
grep -r "password.*=.*['\"]" src/

# トークンの検出
grep -r "token.*=.*['\"]" src/
```

---

## 📚 関連コマンド

- `/ai:rotate-secrets` - シークレットのローテーション
- `/ai:security-audit` - セキュリティ監査（シークレット検出含む）
- `/ai:setup-auth` - 認証システム実装（環境変数使用）

---

## 🎓 参考資料

**エージェント仕様**:

- `.claude/agents/secret-mgr.md`: シークレット管理エージェント

**スキル仕様**:

- `.claude/skills/tool-permission-management/SKILL.md`: 権限管理
- `.claude/skills/best-practices-curation/SKILL.md`: セキュリティベストプラクティス
- `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト統合

---

## 🔒 セキュリティベストプラクティス

### DO's ✅

- 環境変数で管理
- .env ファイルを .gitignore に追加
- .env.example でテンプレート提供
- 型安全な環境変数アクセス
- 定期的なシークレットローテーション
- 最小権限の原則

### DON'Ts ❌

- ハードコードされたシークレット
- コミット履歴にシークレットを含める
- .env ファイルをGitに追加
- 本番シークレットをログ出力
- 同じシークレットを複数環境で使用
- 不要な権限の付与

---

## 🚨 緊急対応

**シークレットがGitに含まれている場合**:

1. 即座にシークレットを無効化・ローテーション
2. Git履歴から削除（`git filter-branch` または BFG Repo-Cleaner）
3. 全チームメンバーに通知
4. 影響範囲の調査
5. 再発防止策の実施

**参考コマンド**:

```bash
# 次のコマンドで /ai:rotate-secrets を実行してください
/ai:rotate-secrets <secret-name>
```
