---
name: .claude/skills/secret-management-architecture/SKILL.md
description: |
  Secret管理アーキテクチャ設計スキル。環境変数、Vault、KMS、Secrets Managerの

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/secret-management-architecture/resources/access-control-matrix-template.md`: Access Control Matrix Templateリソース
  - `.claude/skills/secret-management-architecture/resources/kubernetes-secrets-patterns.md`: Kubernetes Secrets Patternsリソース
  - `.claude/skills/secret-management-architecture/resources/secret-classification-framework.md`: Secret Classification Frameworkリソース
  - `.claude/skills/secret-management-architecture/resources/vault-integration-patterns.md`: Vault Integration Patternsリソース

  - `.claude/skills/secret-management-architecture/templates/env-example-template.md`: Env Exampleテンプレート
  - `.claude/skills/secret-management-architecture/templates/rotation-plan-template.md`: Rotation Planテンプレート
  - `.claude/skills/secret-management-architecture/templates/secret-inventory-template.md`: Secret Inventoryテンプレート

version: 1.0.0
---

# Secret Management Architecture

## 概要

このスキルは、機密情報を安全に管理するための構造的パターンと実装戦略を提供します。
プロジェクトの規模、環境の複雑さ、セキュリティ要件に応じた適切な管理方式の選択と、
階層的な Secret 管理設計を支援します。

## Secret 管理方式の選択基準

### 1. 環境変数ファイル方式

**適用条件**:

- 小規模プロジェクト（開発者 5 名以下）
- 環境数が少ない（dev/prod 程度）
- ローカル開発が中心
- Secret 数が少ない（20 個未満）

**メリット**:

- シンプルで理解しやすい
- セットアップが迅速
- 追加コストなし
- ローカル開発との親和性が高い

**デメリット**:

- スケーラビリティに欠ける
- 手動 Rotation 必要
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

- 必ず.gitignore に追加
- .env.example には機密情報を含めない
- 本番 Secret は別管理（クラウド Secrets Manager 等）推奨

### 2. クラウド Secrets Manager 方式

**適用条件**:

- 中規模以上プロジェクト（開発者 5 名以上）
- マルチ環境（dev/staging/prod/DR 等）
- クラウドネイティブアーキテクチャ
- 高いセキュリティ要件

**対応サービス**:

- AWS Secrets Manager
- Google Cloud Secret Manager
- Azure Key Vault
- Railway Secrets
- GitHub Secrets（CI/CD 専用）

**メリット**:

- 自動 Rotation 対応
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
    return process.env[name] || "";
  }
}
```

### 3. HashiCorp Vault 方式

**適用条件**:

- エンタープライズ環境
- マルチクラウド戦略
- 動的 Secret 生成が必要
- 高度な監査要件

**メリット**:

- 動的 Secret 生成
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

### 4. Kubernetes Secrets 方式

**適用条件**:

- Kubernetes 環境
- コンテナ化アプリケーション
- マイクロサービスアーキテクチャ

**メリット**:

- Kubernetes ネイティブ統合
- Pod レベルでの注入
- ネームスペース分離

**デメリット**:

- デフォルトでは暗号化なし（etcd 暗号化が必要）
- Rotation 機能が弱い
- Kubernetes 依存

**実装パターン**:
詳細は `resources/kubernetes-secrets-patterns.md` を参照

## 階層的 Secret 管理設計

### 3 層階層モデル

#### Layer 1: グローバル共通 Secret

**特性**:

- プロジェクト全体で共通
- すべての環境で同じ値
- 変更頻度: 低い

**例**:

- サードパーティ API 基本設定
- ログ集約サービスエンドポイント
- 共通暗号化設定

**管理方式**: 中央集約、厳格なアクセス制御

#### Layer 2: 環境固有 Secret

**特性**:

- 環境毎に異なる値（dev/staging/prod）
- 環境内で共通
- 変更頻度: 中程度

**例**:

- DATABASE_URL（環境毎に異なる DB）
- API_ENDPOINT（環境毎のエンドポイント）
- REDIS_URL（環境毎の Redis）

**管理方式**: 環境グループ機能、環境変数注入

#### Layer 3: サービス専用 Secret

**特性**:

- 特定サービスのみ使用
- 他サービスからアクセス不可
- 変更頻度: 高い

**例**:

- DISCORD_WEBHOOK_URL（Discord 連携サービス専用）
- STRIPE_SECRET_KEY（決済サービス専用）
- SENDGRID_API_KEY（メールサービス専用）

**管理方式**: サービススコープ制限、最小権限アクセス

### Secret 分類フレームワーク

#### 重要度分類

**Critical（最重要）**:

- 本番データベース認証情報
- 本番 API キー（課金対象）
- 暗号化マスターキー
- OAuth Client Secret（本番）

**High（重要）**:

- ステージング環境認証情報
- サードパーティ API キー（無料枠）
- セッション暗号化キー

**Medium（中程度）**:

- 開発環境認証情報
- 内部 API 認証トークン
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

#### Rotation 頻度分類

**頻繁（30 日毎）**:

- 外部 API キー（高リスク）
- データベースパスワード（本番）
- OAuth Secret

**定期（90 日毎）**:

- 暗号化キー
- セッション Secret
- 内部 API 認証

**不定期（必要時）**:

- 開発環境 Secret
- 設定値
- 侵害検知時の緊急 Rotation

## アクセス制御マトリクス設計

### ロール定義

**人間ロール**:

- Developer: 開発環境 Secret のみアクセス
- DevOps Engineer: すべての環境にアクセス（承認制）
- Security Admin: すべての Secret へのフルアクセス

**システムロール**:

- CI/CD Pipeline: 必要最小限の Secret（GitHub Secrets 経由）
- Application Service: 実行時必要な Secret のみ
- Monitoring Service: ログ・メトリクス用 Secret のみ

### アクセス制御マトリクス例

| Secret 名        | 重要度   | Developer | DevOps     | Security Admin | CI/CD | App Service |
| ---------------- | -------- | --------- | ---------- | -------------- | ----- | ----------- |
| DB_PASSWORD_PROD | Critical | ❌        | 🔐（承認） | ✅             | ❌    | ✅          |
| DB_PASSWORD_DEV  | Medium   | ✅        | ✅         | ✅             | ❌    | ✅          |
| API_KEY_STRIPE   | Critical | ❌        | 🔐（承認） | ✅             | ❌    | ✅          |
| DISCORD_WEBHOOK  | High     | ✅        | ✅         | ✅             | ✅    | ✅          |
| LOG_LEVEL        | Low      | ✅        | ✅         | ✅             | ✅    | ✅          |

🔐 = 承認が必要

## 設計時の判断基準チェックリスト

### Secret 管理方式選択

- [ ] プロジェクト規模（開発者数、環境数）を評価したか？
- [ ] Secret 数と複雑度を確認したか？
- [ ] セキュリティ要件（コンプライアンス含む）を確認したか？
- [ ] 予算とリソース制約を考慮したか？
- [ ] 既存インフラとの統合性を評価したか？

### 階層設計

- [ ] Secret が 3 層（グローバル/環境/サービス）に分類されているか？
- [ ] 各層のアクセス権限が明確に定義されているか？
- [ ] クロススコープアクセスが最小化されているか？
- [ ] 環境間の Secret 共有が防止されているか？

### アクセス制御

- [ ] すべてのロール（人間・システム）が定義されているか？
- [ ] 最小権限の原則が適用されているか？
- [ ] アクセス制御マトリクスが完全か？
- [ ] 承認プロセスが高リスク Secret に設定されているか？

### Rotation 戦略

- [ ] 各 Secret の重要度に応じた Rotation 頻度が定義されているか？
- [ ] Rotation プロセスがダウンタイムを発生させないか？
- [ ] ロールバック手順が明確か？
- [ ] 自動 Rotation 可能な Secret が特定されているか？

## 関連スキル

- `.claude/skills/zero-trust-security/SKILL.md` - アクセス制御設計の詳細
- `.claude/skills/encryption-key-lifecycle/SKILL.md` - 鍵ライフサイクル管理
- `.claude/skills/environment-isolation/SKILL.md` - 環境分離戦略
- `.claude/skills/railway-secrets-management/SKILL.md` - Railway 統合
- `.claude/skills/github-actions-security/SKILL.md` - GitHub Actions 統合

## リソースファイル

詳細な実装パターンは以下を参照:

- `resources/vault-integration-patterns.md` - HashiCorp Vault 統合
- `resources/kubernetes-secrets-patterns.md` - Kubernetes Secrets 実装
- `resources/secret-classification-framework.md` - Secret 分類詳細
- `resources/access-control-matrix-template.md` - アクセス制御設計テンプレート

## テンプレート

- `templates/env-example-template.md` - .env.example ファイルテンプレート
- `templates/secret-inventory-template.md` - Secret 棚卸しテンプレート
- `templates/rotation-plan-template.md` - Rotation 計画テンプレート
