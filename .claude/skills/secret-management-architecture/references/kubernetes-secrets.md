# Kubernetes Secrets管理

> **責務**: Kubernetes環境でのシークレット管理パターン
> **対象Task**: integrate-backend

---

## 1. Kubernetes Secretsの基本

### 1.1 Secret種別

| 種別                                | 用途                   |
| ----------------------------------- | ---------------------- |
| Opaque                              | 汎用シークレット       |
| kubernetes.io/tls                   | TLS証明書              |
| kubernetes.io/dockerconfigjson      | コンテナレジストリ認証 |
| kubernetes.io/basic-auth            | Basic認証              |
| kubernetes.io/ssh-auth              | SSH認証                |
| kubernetes.io/service-account-token | ServiceAccountトークン |

### 1.2 制限事項

| 項目           | 制限                   | 備考           |
| -------------- | ---------------------- | -------------- |
| サイズ         | 1MB以下                | etcdの制約     |
| 暗号化         | デフォルトはBase64のみ | KMS暗号化推奨  |
| アクセス制御   | Namespace単位          | RBAC併用必須   |
| バージョン管理 | なし                   | 外部ツール推奨 |

---

## 2. セキュリティ強化

### 2.1 etcd暗号化

```yaml
# EncryptionConfiguration
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: <base64-encoded-key>
      - identity: {}
```

### 2.2 KMS Provider（推奨）

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - kms:
          name: aws-kms
          endpoint: unix:///var/run/kmsplugin/socket.sock
          cachesize: 1000
          timeout: 3s
      - identity: {}
```

---

## 3. 外部シークレット管理

### 3.1 External Secrets Operator

```
┌─────────────────────────────────────────────────┐
│            External Secrets Operator             │
│                                                  │
│  ExternalSecret ──→ Controller ──→ K8s Secret   │
│                         ↓                        │
│              SecretStore/ClusterSecretStore      │
│                         ↓                        │
│    ┌─────────┬─────────┬─────────┬─────────┐    │
│    │  Vault  │AWS SM   │Azure KV │GCP SM   │    │
│    └─────────┴─────────┴─────────┴─────────┘    │
└─────────────────────────────────────────────────┘
```

### 3.2 ClusterSecretStore設定

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: vault-backend
spec:
  provider:
    vault:
      server: "https://vault.example.com"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "external-secrets"
          serviceAccountRef:
            name: "external-secrets-sa"
```

### 3.3 ExternalSecret設定

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
  namespace: production
spec:
  refreshInterval: "15m"
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: app-secrets
    creationPolicy: Owner
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: secret/data/production/database
        property: password
    - secretKey: API_KEY
      remoteRef:
        key: secret/data/production/api
        property: key
```

---

## 4. Sealed Secrets

### 4.1 概要

```
┌─────────────────────────────────────────────────┐
│               Sealed Secrets                     │
│                                                  │
│  SealedSecret ──→ Controller ──→ K8s Secret     │
│  (Git管理可)        ↓                           │
│              Private Key (Cluster内)             │
└─────────────────────────────────────────────────┘
```

### 4.2 使用方法

```bash
# シークレットを暗号化（Gitにコミット可能）
kubeseal --format=yaml < secret.yaml > sealed-secret.yaml

# SealedSecretをデプロイ
kubectl apply -f sealed-secret.yaml
```

### 4.3 SealedSecret例

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: app-secrets
  namespace: production
spec:
  encryptedData:
    DB_PASSWORD: AgBy3i4OJSWK+...（暗号化された値）
    API_KEY: AgBy3i4OJSWK+...
```

---

## 5. SOPS + Age

### 5.1 概要

```
┌─────────────────────────────────────────────────┐
│                   SOPS + Age                     │
│                                                  │
│  暗号化ファイル ──→ SOPS ──→ K8s Secret         │
│  (Git管理可)         ↓                          │
│              Age Key (安全に保管)                │
└─────────────────────────────────────────────────┘
```

### 5.2 設定例

```yaml
# .sops.yaml
creation_rules:
  - path_regex: .*\.enc\.yaml$
    age: age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p
```

```yaml
# secrets.enc.yaml（暗号化後）
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
data:
  DB_PASSWORD: ENC[AES256_GCM,data:...,iv:...,tag:...]
```

---

## 6. ベストプラクティス

### 6.1 推奨構成

| 環境        | 推奨ソリューション       | 理由                   |
| ----------- | ------------------------ | ---------------------- |
| Production  | External Secrets + Vault | 動的シークレット、監査 |
| Staging     | External Secrets + Vault | 本番同等構成           |
| Development | Sealed Secrets / SOPS    | シンプル、Git管理      |

### 6.2 セキュリティチェックリスト

- [ ] etcd暗号化を有効化しているか
- [ ] RBACでSecretアクセスを制限しているか
- [ ] Secretを環境変数ではなくボリュームマウントで使用しているか
- [ ] 不要なSecretを定期的にクリーンアップしているか
- [ ] Secretの変更を監査ログに記録しているか
- [ ] ネットワークポリシーでSecret管理系のアクセスを制限しているか

### 6.3 アンチパターン

| アンチパターン                 | リスク               | 代替策               |
| ------------------------------ | -------------------- | -------------------- |
| ConfigMapにシークレット格納    | 暗号化なし           | Secretを使用         |
| 環境変数での受け渡し           | プロセス一覧で見える | ボリュームマウント   |
| イメージにシークレット埋め込み | 漏洩リスク大         | 外部シークレット管理 |
| 手動でのSecret作成             | 追跡困難             | GitOps + 自動化      |
