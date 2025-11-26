# アクセス制御マトリクステンプレート

## アクセス制御マトリクス

| Secret名 | 重要度 | スコープ | Developer | DevOps | Security Admin | CI/CD | App Service | Rotation頻度 |
|---------|-------|---------|----------|--------|---------------|-------|------------|-------------|
| DB_PASSWORD_PROD | Critical | Environment | ❌ | 🔐 | ✅ | ❌ | ✅ | 30日 |
| DB_PASSWORD_DEV | Medium | Environment | ✅ | ✅ | ✅ | ❌ | ✅ | 不定期 |
| OPENAI_API_KEY_PROD | Critical | Service | ❌ | 🔐 | ✅ | ❌ | ✅ | 30日 |
| STRIPE_SECRET_KEY | Critical | Service | ❌ | 🔐 | ✅ | ❌ | ✅ | 30日 |
| DISCORD_WEBHOOK_URL | High | Service | ✅ | ✅ | ✅ | ✅ | ✅ | 90日 |
| NEXTAUTH_SECRET | Critical | Environment | ❌ | 🔐 | ✅ | ❌ | ✅ | 30日 |
| LOG_LEVEL | Low | Global | ✅ | ✅ | ✅ | ✅ | ✅ | 不定期 |
| API_BASE_URL | Low | Environment | ✅ | ✅ | ✅ | ✅ | ✅ | 不定期 |

**凡例**:
- ✅ : アクセス可能
- ❌ : アクセス不可
- 🔐 : 承認が必要

## ロール定義

### Developer（開発者）
- **アクセス範囲**: 開発環境のみ
- **権限**: 読み取り、書き込み
- **承認**: 不要
- **MFA**: 不要

### DevOps Engineer
- **アクセス範囲**: すべての環境
- **権限**: 読み取り、Rotation（staging）
- **承認**: 本番環境は必要
- **MFA**: 本番環境は必要

### Security Admin
- **アクセス範囲**: すべての環境
- **権限**: フルアクセス（読み取り、書き込み、Rotation、削除）
- **承認**: 不要
- **MFA**: 必要

### CI/CD Pipeline
- **アクセス範囲**: staging, production
- **権限**: 読み取りのみ
- **承認**: 不要
- **MFA**: 不要（サービスアカウント）

### Application Service
- **アクセス範囲**: 割り当てられた環境
- **権限**: 読み取りのみ
- **承認**: 不要
- **MFA**: 不要（サービスアカウント）

## 使用方法

1. このテンプレートをコピー
2. プロジェクトのすべてのSecretをリストアップ
3. 各Secretの重要度とスコープを分類
4. ロール毎のアクセス権限を設定
5. Rotation頻度を決定
6. チームに共有し、レビュー
7. Secret管理システムに実装
