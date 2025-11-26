# HashiCorp Vault 統合パターン

## Vault概要

HashiCorp Vaultは、エンタープライズグレードのSecret管理ソリューションです。
動的Secret生成、きめ細かなアクセス制御、完全な監査ログを提供します。

## 統合アーキテクチャパターン

### パターン1: Direct API Integration

**構成**:
```
Application → Vault API → Secret取得
```

**実装例**:
```typescript
import * as vault from 'node-vault';

class VaultSecretManager {
  private client: vault.client;

  constructor() {
    this.client = vault({
      endpoint: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN,
    });
  }

  async getSecret(path: string): Promise<string> {
    const result = await this.client.read(path);
    return result.data.value;
  }

  async rotateSecret(path: string, newValue: string): Promise<void> {
    await this.client.write(path, { value: newValue });
  }
}
```

**メリット**: シンプル、低レイテンシ
**デメリット**: トークン管理が必要、アプリケーションがVault依存

### パターン2: Vault Agent Sidecar

**構成**:
```
Application → Vault Agent (local) → Vault Server
```

**メリット**: 自動認証、ローカルキャッシュ、トークン自動更新
**デメリット**: インフラ複雑化、Kubernetes等のオーケストレーター必要

### パターン3: Secrets Injection at Boot

**構成**:
```
Init Container → Vault → Secret取得 → 環境変数注入 → Application起動
```

**メリット**: アプリケーションがVault非依存、起動時のみアクセス
**デメリット**: Rotation時の再起動必要

## Vault Policy設計

### 最小権限ポリシー例

```hcl
# 開発者用ポリシー（dev環境のみ）
path "secret/data/dev/*" {
  capabilities = ["read", "list"]
}

# DevOps用ポリシー（全環境読み取り）
path "secret/data/*" {
  capabilities = ["read", "list"]
}

# アプリケーション用ポリシー（本番環境のみ、書き込み不可）
path "secret/data/prod/app/*" {
  capabilities = ["read"]
}
```

## 動的Secret生成パターン

### データベース認証情報の動的生成

**設定**:
```hcl
# Vault DB Secret Engine設定
vault write database/config/my-postgresql-database \
  plugin_name=postgresql-database-plugin \
  allowed_roles="readonly,readwrite" \
  connection_url="postgresql://{{username}}:{{password}}@postgres:5432/mydb"

# ロール定義
vault write database/roles/readonly \
  db_name=my-postgresql-database \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}' IN ROLE readonly;" \
  default_ttl="1h" \
  max_ttl="24h"
```

**使用**:
```typescript
// 動的認証情報の取得（1時間有効）
const dbCreds = await vault.read('database/creds/readonly');
const { username, password } = dbCreds.data;

// 自動的に1時間後に無効化される
```

**メリット**: 漏洩時の影響最小化、自動Rotation、監査証跡
**デメリット**: ネットワーク遅延、Vault可用性への依存

## 監査とコンプライアンス

### 監査ログ有効化

```hcl
# ファイル監査バックエンド
vault audit enable file file_path=/vault/logs/audit.log

# Syslog監査バックエンド
vault audit enable syslog tag="vault" facility="LOCAL7"
```

### 監査ログ分析

すべてのSecretアクセスが記録される:
- アクセス日時
- 要求者（認証トークンID）
- アクセスしたSecretパス
- 実行された操作（read/write/delete）
- 結果（成功/失敗）

## エラーハンドリング

### Vault接続失敗時の対策

```typescript
class ResilientVaultManager {
  async getSecret(path: string): Promise<string> {
    try {
      return await this.vault.read(path);
    } catch (error) {
      if (error.statusCode === 503) {
        // Vault一時的に利用不可 → キャッシュから取得
        return this.cachedSecrets.get(path);
      }
      throw error;
    }
  }
}
```

### リトライ戦略

- 指数バックオフ（1s, 2s, 4s）
- 最大3回リトライ
- サーキットブレーカー（連続5回失敗でオープン）

## 設計判断基準

### Vault導入を検討すべき条件
- [ ] Secret数が50個を超える
- [ ] 環境数が5個以上ある
- [ ] 動的Secret生成が必要
- [ ] 厳格な監査要件がある
- [ ] マルチクラウド戦略を採用している
- [ ] コンプライアンス要件（SOC2、HIPAA等）がある

### Vault導入を避けるべき条件
- [ ] 小規模プロジェクト（開発者5名未満）
- [ ] Secret数が20個未満
- [ ] シンプルな環境変数管理で十分
- [ ] 運用リソースが限定的
- [ ] クラウドネイティブでない（オンプレミスのみ）

## 参考リンク

- HashiCorp Vault公式ドキュメント: https://developer.hashicorp.com/vault
- Vault Best Practices: https://learn.hashicorp.com/vault
