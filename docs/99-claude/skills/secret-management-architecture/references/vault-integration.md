# Vault統合パターン

> **責務**: HashiCorp Vault統合の設計パターンとベストプラクティス
> **対象Task**: integrate-backend

---

## 1. Vault概要

### 1.1 主要コンポーネント

```
┌─────────────────────────────────────────────────┐
│                  Vault Server                    │
│  ┌─────────────────────────────────────────┐    │
│  │             Secrets Engines              │    │
│  │  KV │ Database │ PKI │ Transit │ AWS    │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │             Auth Methods                 │    │
│  │  K8s │ OIDC │ AppRole │ LDAP │ Token    │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │             Storage Backend              │    │
│  │  Consul │ Raft │ S3 │ DynamoDB          │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 1.2 Secrets Engine選択ガイド

| Secrets Engine | 用途                | 推奨ケース           |
| -------------- | ------------------- | -------------------- |
| KV v2          | 静的シークレット    | API キー、設定値     |
| Database       | 動的DB認証情報      | DB接続、短命トークン |
| PKI            | 証明書発行          | mTLS、サービス間認証 |
| Transit        | 暗号化as a Service  | データ暗号化         |
| AWS            | AWS認証情報動的生成 | AWS API アクセス     |

---

## 2. Kubernetes統合

### 2.1 Kubernetes認証設定

```yaml
# Vault Kubernetes Auth設定
apiVersion: v1
kind: ConfigMap
metadata:
  name: vault-config
data:
  vault-agent-config.hcl: |
    auto_auth {
      method "kubernetes" {
        mount_path = "auth/kubernetes"
        config = {
          role = "app-role"
        }
      }
      sink "file" {
        config = {
          path = "/vault/token"
        }
      }
    }
```

### 2.2 Vault Agent Injector

```yaml
# Pod Annotation for Vault Agent Injection
apiVersion: v1
kind: Pod
metadata:
  annotations:
    vault.hashicorp.com/agent-inject: "true"
    vault.hashicorp.com/role: "app-role"
    vault.hashicorp.com/agent-inject-secret-db: "secret/data/db"
    vault.hashicorp.com/agent-inject-template-db: |
      {{- with secret "secret/data/db" -}}
      DB_HOST={{ .Data.data.host }}
      DB_USER={{ .Data.data.username }}
      DB_PASS={{ .Data.data.password }}
      {{- end }}
```

### 2.3 External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-secret
spec:
  refreshInterval: "1h"
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: db-credentials
  data:
    - secretKey: username
      remoteRef:
        key: secret/data/db
        property: username
    - secretKey: password
      remoteRef:
        key: secret/data/db
        property: password
```

---

## 3. 高可用性構成

### 3.1 Raft Storage HA構成

```
┌─────────────────────────────────────────────────┐
│                Vault Cluster (Raft)              │
│                                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │   Node 1  │  │   Node 2  │  │   Node 3  │   │
│  │  (Leader) │  │ (Follower)│  │ (Follower)│   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘   │
│        └──────────────┼──────────────┘          │
│                       ↓                          │
│              Raft Consensus                      │
└─────────────────────────────────────────────────┘
```

### 3.2 推奨構成

| 環境        | ノード数 | Storage     | Auto-Unseal        |
| ----------- | -------- | ----------- | ------------------ |
| Production  | 5        | Raft/Consul | AWS KMS / GCP CKMS |
| Staging     | 3        | Raft        | AWS KMS            |
| Development | 1        | File        | -                  |

---

## 4. ポリシー設計

### 4.1 パス設計

```
secret/
├── data/
│   ├── production/
│   │   ├── database/
│   │   ├── api-keys/
│   │   └── certificates/
│   ├── staging/
│   │   └── ...
│   └── development/
│       └── ...
└── metadata/
    └── ...
```

### 4.2 ポリシーテンプレート

```hcl
# アプリケーション用ポリシー（テンプレート化）
path "secret/data/{{identity.entity.aliases.auth_kubernetes.metadata.service_account_namespace}}/*" {
  capabilities = ["read", "list"]
}

# 環境変数ベースのアクセス制御
path "secret/data/{{identity.entity.metadata.environment}}/*" {
  capabilities = ["read"]
}
```

---

## 5. 動的シークレット

### 5.1 Database Secrets Engine

```hcl
# PostgreSQL 設定
resource "vault_database_secret_backend_connection" "postgres" {
  backend       = vault_mount.db.path
  name          = "postgres"
  allowed_roles = ["app-role"]

  postgresql {
    connection_url = "postgresql://{{username}}:{{password}}@db:5432/app"
  }
}

resource "vault_database_secret_backend_role" "app" {
  backend     = vault_mount.db.path
  name        = "app-role"
  db_name     = "postgres"

  creation_statements = [
    "CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';",
    "GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";"
  ]

  default_ttl = 3600    # 1時間
  max_ttl     = 86400   # 24時間
}
```

### 5.2 動的シークレットのメリット

| 観点           | 静的シークレット | 動的シークレット |
| -------------- | ---------------- | ---------------- |
| 漏洩リスク     | 高（長期間有効） | 低（短命）       |
| ローテーション | 手動/自動化必要  | 自動（TTL）      |
| 監査           | 共有認証情報     | 個別追跡可能     |
| 複雑性         | 低               | 中               |

---

## 6. 運用ベストプラクティス

### 6.1 監視設定

| メトリクス                | 説明                 | アラート閾値 |
| ------------------------- | -------------------- | ------------ |
| vault.runtime.gc_pause_ns | GCポーズ時間         | > 100ms      |
| vault.core.handle_request | リクエスト処理時間   | p99 > 100ms  |
| vault.token.count         | アクティブトークン数 | 急増時       |
| vault.expire.num_leases   | アクティブリース数   | > 閾値       |

### 6.2 バックアップ戦略

| 方式          | 頻度   | 保持期間 | 用途     |
| ------------- | ------ | -------- | -------- |
| Raft Snapshot | 毎時   | 7日      | 通常復旧 |
| Full Backup   | 日次   | 30日     | 災害復旧 |
| Config Export | 変更時 | 無期限   | 設定管理 |

### 6.3 Unseal Key管理

| 方式            | 説明                  | 推奨ケース       |
| --------------- | --------------------- | ---------------- |
| Shamir's Secret | 複数キーで分割        | 小規模環境       |
| Auto-Unseal     | KMS/HSM連携           | 本番環境（推奨） |
| Recovery Keys   | Auto-Unseal時の緊急用 | 災害復旧         |
