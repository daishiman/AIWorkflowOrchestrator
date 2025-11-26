---
name: secret-management-architecture
description: |
  Secret管理アーキテクチャ設計スキル。環境変数、Vault、KMS、Secrets Managerの
  選択基準と階層的管理パターンを提供します。

  使用タイミング:
  - プロジェクトのSecret管理方式を選択する時
  - 環境変数管理アーキテクチャを設計する時
  - Secret階層化と分類戦略を決定する時
  - クラウドSecret管理サービス統合を計画する時
  - Secret管理のスケーラビリティ要件を評価する時

  Use when designing secret management architecture, choosing between
  management approaches, or planning hierarchical secret organization.
version: 1.0.0
---

# Secret Management Architecture

## 概要

このスキルは、機密情報を安全に管理するための構造的パターンと実装戦略を提供します。
プロジェクトの規模、環境の複雑さ、セキュリティ要件に応じた適切な管理方式の選択と、
階層的なSecret管理設計を支援します。

## Secret管理方式の選択基準

### 1. 環境変数ファイル方式

**適用条件**:
- 小規模プロジェクト（開発者5名以下）
- 環境数が少ない（dev/prod程度）
- ローカル開発が中心
- Secret数が少ない（20個未満）

**メリット**:
- シンプルで理解しやすい
- セットアップが迅速
- 追加コストなし
- ローカル開発との親和性が高い

**デメリット**:
- スケーラビリティに欠ける
- 手動Rotation必要
- 監査証跡が弱い
- チーム間共有が困難

**実装パターン**:
```
project/
├── .env.example          # テンプレート（Gitコミット可）
├── .env.development      # ローカル開発用（Gitignore）
├── .env.staging          # ステージング用（Gitignore）
└── .env.production       # 本番用（Gitignore、別管理推奨）
```

**セキュリティ要件**:
- 必ず.gitignoreに追加
- .env.exampleには機密情報を含めない
- 本番Secretは別管理（クラウドSecrets Manager等）推奨

### 2. クラウドSecrets Manager方式

**適用条件**:
- 中規模以上プロジェクト（開発者5名以上）
- マルチ環境（dev/staging/prod/DR等）
- クラウドネイティブアーキテクチャ
- 高いセキュリティ要件

**対応サービス**:
- AWS Secrets Manager
- Google Cloud Secret Manager
- Azure Key Vault
- Railway Secrets
- GitHub Secrets（CI/CD専用）

**メリット**:
- 自動Rotation対応
- 完全な監査証跡
- アクセス制御の細分化
- 暗号化の自動管理
- 高可用性

**デメリット**:
- コスト発生
- セットアップ複雑
- サービス依存
- ネットワーク遅延

**実装パターン**:
```typescript
// Secret取得の統一インターフェース
interface ISecretManager {
  getSecret(name: string, env: Environment): Promise<string>;
  rotateSecret(name: string): Promise<void>;
}

// Railway Secrets実装例
class RailwaySecretManager implements ISecretManager {
  async getSecret(name: string, env: Environment): Promise<string> {
    // Railway環境変数から取得（自動注入）
    return process.env[name] || '';
  }
}
```

### 3. HashiCorp Vault方式

**適用条件**:
- エンタープライズ環境
- マルチクラウド戦略
- 動的Secret生成が必要
- 高度な監査要件

**メリット**:
- 動的Secret生成
- 最も強力なアクセス制御
- 完全な監査ログ
- マルチクラウド対応
- Secret versioning

**デメリット**:
- 高い運用コスト
- 学習曲線が急
- インフラ複雑化
- 専門知識が必要

**実装パターン**:
詳細は `resources/vault-integration-patterns.md` を参照

### 4. Kubernetes Secrets方式

**適用条件**:
- Kubernetes環境
- コンテナ化アプリケーション
- マイクロサービスアーキテクチャ

**メリット**:
- Kubernetesネイティブ統合
- Podレベルでの注入
- ネームスペース分離

**デメリット**:
- デフォルトでは暗号化なし（etcd暗号化が必要）
- Rotation機能が弱い
- Kubernetes依存

**実装パターン**:
詳細は `resources/kubernetes-secrets-patterns.md` を参照

## 階層的Secret管理設計

### 3層階層モデル

#### Layer 1: グローバル共通Secret
**特性**:
- プロジェクト全体で共通
- すべての環境で同じ値
- 変更頻度: 低い

**例**:
- サードパーティAPI基本設定
- ログ集約サービスエンドポイント
- 共通暗号化設定

**管理方式**: 中央集約、厳格なアクセス制御

#### Layer 2: 環境固有Secret
**特性**:
- 環境毎に異なる値（dev/staging/prod）
- 環境内で共通
- 変更頻度: 中程度

**例**:
- DATABASE_URL（環境毎に異なるDB）
- API_ENDPOINT（環境毎のエンドポイント）
- REDIS_URL（環境毎のRedis）

**管理方式**: 環境グループ機能、環境変数注入

#### Layer 3: サービス専用Secret
**特性**:
- 特定サービスのみ使用
- 他サービスからアクセス不可
- 変更頻度: 高い

**例**:
- DISCORD_WEBHOOK_URL（Discord連携サービス専用）
- STRIPE_SECRET_KEY（決済サービス専用）
- SENDGRID_API_KEY（メールサービス専用）

**管理方式**: サービススコープ制限、最小権限アクセス

### Secret分類フレームワーク

#### 重要度分類

**Critical（最重要）**:
- 本番データベース認証情報
- 本番APIキー（課金対象）
- 暗号化マスターキー
- OAuth Client Secret（本番）

**High（重要）**:
- ステージング環境認証情報
- サードパーティAPI キー（無料枠）
- セッション暗号化キー

**Medium（中程度）**:
- 開発環境認証情報
- 内部API認証トークン
- ログ集約サービスキー

**Low（低）**:
- 非機密設定値
- 公開情報への参照
- デフォルト設定

#### スコープ分類

**Global（グローバル）**:
- すべてのサービスで使用
- 環境横断で共通
- 例: LOG_LEVEL、APP_NAME

**Environment（環境）**:
- 環境毎に異なる
- 環境内で共通
- 例: DATABASE_URL、API_BASE_URL

**Service（サービス）**:
- 特定サービスのみ
- 他サービスアクセス不可
- 例: DISCORD_WEBHOOK_URL、STRIPE_KEY

#### Rotation頻度分類

**頻繁（30日毎）**:
- 外部API キー（高リスク）
- データベースパスワード（本番）
- OAuth Secret

**定期（90日毎）**:
- 暗号化キー
- セッションSecret
- 内部API認証

**不定期（必要時）**:
- 開発環境Secret
- 設定値
- 侵害検知時の緊急Rotation

## アクセス制御マトリクス設計

### ロール定義

**人間ロール**:
- Developer: 開発環境Secretのみアクセス
- DevOps Engineer: すべての環境にアクセス（承認制）
- Security Admin: すべてのSecretへのフルアクセス

**システムロール**:
- CI/CD Pipeline: 必要最小限のSecret（GitHub Secrets経由）
- Application Service: 実行時必要なSecretのみ
- Monitoring Service: ログ・メトリクス用Secretのみ

### アクセス制御マトリクス例

| Secret名 | 重要度 | Developer | DevOps | Security Admin | CI/CD | App Service |
|---------|-------|----------|---------|---------------|-------|------------|
| DB_PASSWORD_PROD | Critical | ❌ | 🔐（承認） | ✅ | ❌ | ✅ |
| DB_PASSWORD_DEV | Medium | ✅ | ✅ | ✅ | ❌ | ✅ |
| API_KEY_STRIPE | Critical | ❌ | 🔐（承認） | ✅ | ❌ | ✅ |
| DISCORD_WEBHOOK | High | ✅ | ✅ | ✅ | ✅ | ✅ |
| LOG_LEVEL | Low | ✅ | ✅ | ✅ | ✅ | ✅ |

🔐 = 承認が必要

## 設計時の判断基準チェックリスト

### Secret管理方式選択
- [ ] プロジェクト規模（開発者数、環境数）を評価したか？
- [ ] Secret数と複雑度を確認したか？
- [ ] セキュリティ要件（コンプライアンス含む）を確認したか？
- [ ] 予算とリソース制約を考慮したか？
- [ ] 既存インフラとの統合性を評価したか？

### 階層設計
- [ ] Secretが3層（グローバル/環境/サービス）に分類されているか？
- [ ] 各層のアクセス権限が明確に定義されているか？
- [ ] クロススコープアクセスが最小化されているか？
- [ ] 環境間のSecret共有が防止されているか？

### アクセス制御
- [ ] すべてのロール（人間・システム）が定義されているか？
- [ ] 最小権限の原則が適用されているか？
- [ ] アクセス制御マトリクスが完全か？
- [ ] 承認プロセスが高リスクSecretに設定されているか？

### Rotation戦略
- [ ] 各Secretの重要度に応じたRotation頻度が定義されているか？
- [ ] Rotationプロセスがダウンタイムを発生させないか？
- [ ] ロールバック手順が明確か？
- [ ] 自動Rotation可能なSecretが特定されているか？

## 関連スキル

- `.claude/skills/zero-trust-security/SKILL.md` - アクセス制御設計の詳細
- `.claude/skills/encryption-key-lifecycle/SKILL.md` - 鍵ライフサイクル管理
- `.claude/skills/environment-isolation/SKILL.md` - 環境分離戦略
- `.claude/skills/railway-secrets-management/SKILL.md` - Railway統合
- `.claude/skills/github-actions-security/SKILL.md` - GitHub Actions統合

## リソースファイル

詳細な実装パターンは以下を参照:
- `resources/vault-integration-patterns.md` - HashiCorp Vault統合
- `resources/kubernetes-secrets-patterns.md` - Kubernetes Secrets実装
- `resources/secret-classification-framework.md` - Secret分類詳細
- `resources/access-control-matrix-template.md` - アクセス制御設計テンプレート

## テンプレート

- `templates/env-example-template.md` - .env.exampleファイルテンプレート
- `templates/secret-inventory-template.md` - Secret棚卸しテンプレート
- `templates/rotation-plan-template.md` - Rotation計画テンプレート
