---
description: |
  認証・認可システムを実装します。OAuth 2.0（GitHub/Google）または
  Credentials認証をサポートし、NextAuth.jsまたはPassport.jsベースの実装を提供します。

  🤖 起動エージェント:
  - Phase 1-3: `.claude/agents/auth-specialist.md` - 認証・認可実装専門

  📚 利用可能スキル（auth-specialistエージェントが参照）:
  - `.claude/skills/oauth2-flows/SKILL.md` - Authorization Code Flow、PKCE、Refresh Token
  - `.claude/skills/session-management/SKILL.md` - JWT/Database戦略、Cookie属性、トークンライフサイクル
  - `.claude/skills/rbac-implementation/SKILL.md` - ロール設計、権限モデル、ポリシーエンジン
  - `.claude/skills/nextauth-patterns/SKILL.md` - NextAuth.js v5設定、プロバイダー、アダプター
  - `.claude/skills/security-headers/SKILL.md` - CSP、HSTS、X-Frame-Options、CSRF/XSS対策

  ⚙️ このコマンドの設定:
  - argument-hint: "[provider: github|google|credentials]"（認証プロバイダー、デフォルト: credentials）
  - allowed-tools: 認証システム実装用
    • Read: プロジェクト構造確認、既存認証確認用
    • Write: 認証設定、APIルート生成用
    • Edit: 既存ファイル修正用
    • Bash: パッケージインストール、型チェック用
  - model: sonnet（標準的な認証実装タスク）

  📋 成果物:
  - `src/app/api/auth/[...nextauth]/route.ts`（認証APIルート）
  - `src/middleware.ts`（認証ミドルウェア）
  - `.env.example`（環境変数テンプレート）
  - 認証設定ドキュメント

  🎯 サポートプロバイダー:
  - credentials: ユーザー名/パスワード認証
  - github: GitHub OAuth 2.0
  - google: Google OAuth 2.0

  トリガーキーワード: authentication, authorization, 認証実装, OAuth, NextAuth, ログイン
argument-hint: "[provider: github|google|credentials]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
model: sonnet
---

# /ai:setup-auth - 認証・認可システムの実装

**目的**: プロジェクトに認証・認可システムを実装します。OAuth 2.0（GitHub/Google）またはCredentials認証をサポートし、セキュアな実装パターンを提供します。

**トリガーキーワード**: authentication, authorization, 認証実装, OAuth, NextAuth, Passport, ログイン, セッション管理, JWT, credentials

---

## 📋 引数仕様

- **$1 (provider)**: 認証プロバイダー
  - `credentials` (デフォルト): ユーザー名/パスワード認証
  - `github`: GitHub OAuth 2.0
  - `google`: Google OAuth 2.0

**使用例**:
```bash
/ai:setup-auth
/ai:setup-auth github
/ai:setup-auth google
/ai:setup-auth credentials
```

---

## 🎯 実行フロー（3フェーズ構造）

### Phase 1: 準備・要件分析

**エージェント起動**:
```
`.claude/agents/auth-specialist.md` を起動し、以下を依頼:
- プロバイダー: $1 (デフォルト: credentials)
- プロジェクト構造の分析（Next.js/Express/Fastify等）
- 既存認証実装の確認
- 必要な依存関係の特定
```

**スキル参照** (Phase 1):
- `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト構造理解
- `.claude/skills/nextauth-patterns/SKILL.md`: NextAuth.js実装パターン
- `.claude/skills/oauth2-flows/SKILL.md`: OAuth 2.0フロー設計

**期待成果物**:
- プロジェクトタイプの特定（Next.js/Express/Fastify等）
- 実装方針の決定（NextAuth.js/Passport.js等）
- 必要なパッケージリスト
- 実装ファイル構成

---

### Phase 2: 認証システム実装

**エージェント起動**:
```
`.claude/agents/auth-specialist.md` を起動し、以下を依頼:
- 依存関係のインストール
- 認証設定ファイルの作成
- 認証API/ルートの実装
- ミドルウェアの設定
- 環境変数テンプレート作成
```

**スキル参照** (Phase 2):
```
【GitHub/Google OAuth】
- `.claude/skills/oauth2-flows/SKILL.md`: OAuth 2.0フロー実装
- `.claude/skills/nextauth-patterns/SKILL.md`: NextAuth.js設定パターン

【Credentials認証】
- `.claude/skills/rbac-implementation/SKILL.md`: ロールベースアクセス制御
- `.claude/skills/best-practices-curation/SKILL.md`: パスワードハッシュ化等

【共通】
- `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト統合
```

**実装内容**:
```
【Next.js + NextAuth.js の場合】
- src/auth.ts または src/lib/auth.ts: 認証設定
- app/api/auth/[...nextauth]/route.ts: 認証APIルート
- middleware.ts: 認証ミドルウェア
- .env.example: 環境変数テンプレート

【Express/Fastify + Passport.js の場合】
- src/auth/passport.config.ts: Passport設定
- src/auth/strategies/: 認証ストラテジー
- src/middleware/auth.middleware.ts: 認証ミドルウェア
- .env.example: 環境変数テンプレート
```

**期待成果物**:
- 完全に動作する認証システム
- 環境変数テンプレート（.env.example）
- 認証ミドルウェア
- ログイン/ログアウトエンドポイント

---

### Phase 3: 検証・ドキュメント生成

**エージェント起動**:
```
`.claude/agents/auth-specialist.md` を起動し、以下を依頼:
- 実装の検証（型チェック、lint）
- セキュリティレビュー
- セットアップガイド作成
- 使用方法ドキュメント生成
```

**スキル参照** (Phase 3):
- `.claude/skills/best-practices-curation/SKILL.md`: セキュリティベストプラクティス
- `.claude/skills/tool-permission-management/SKILL.md`: 権限設定最適化

**成果物**:
- `docs/auth/setup-guide.md`: セットアップガイド
  - 環境変数の設定方法
  - プロバイダー設定手順（GitHub/Google OAuth等）
  - ローカル開発での動作確認方法
- `docs/auth/usage.md`: 使用方法ドキュメント
  - 認証フックの使用方法
  - 保護されたルートの作成方法
  - ロール/権限の管理方法

---

## 🔍 検証項目

実行後、以下を確認してください:

- [ ] 認証関連ファイルが適切に生成されている
- [ ] .env.example が作成されている
- [ ] TypeScript型エラーがない（`pnpm run type-check`）
- [ ] Lintエラーがない（`pnpm run lint`）
- [ ] セットアップガイドが `docs/auth/` に生成されている
- [ ] セキュリティベストプラクティスが適用されている

---

## 📚 関連コマンド

- `/ai:security-audit auth` - 認証システムのセキュリティ監査
- `/ai:manage-secrets` - 認証関連のシークレット管理
- `/ai:setup-rate-limiting` - ログインエンドポイントへのレート制限

---

## 🎓 参考資料

**エージェント仕様**:
- `.claude/agents/auth-specialist.md`: 認証専門エージェント

**スキル仕様**:
- `.claude/skills/oauth2-flows/SKILL.md`: OAuth 2.0フロー実装
- `.claude/skills/nextauth-patterns/SKILL.md`: NextAuth.jsパターン
- `.claude/skills/rbac-implementation/SKILL.md`: ロールベースアクセス制御
- `.claude/skills/best-practices-curation/SKILL.md`: セキュリティベストプラクティス

---

## ⚠️ 注意事項

1. **環境変数の設定**: 実装後、`.env`ファイルに必要な環境変数を設定してください
2. **OAuth プロバイダー設定**: GitHub/Googleの開発者コンソールでOAuthアプリを登録してください
3. **セッションシークレット**: 本番環境では必ず強力なランダム文字列を使用してください
4. **HTTPS必須**: 本番環境では必ずHTTPSを使用してください
