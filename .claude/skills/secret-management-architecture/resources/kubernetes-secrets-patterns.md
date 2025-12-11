# Kubernetes Secrets 実装パターン

## Kubernetes Secrets概要

Kubernetes Secretsは、パスワード、トークン、鍵などの機密情報を管理するための
Kubernetesネイティブのリソースです。Pod、環境変数、ボリュームとして注入可能です。

## Secret作成パターン

### パターン1: YAMLマニフェスト

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: production
type: Opaque
data:
  # Base64エンコードされた値
  database-url: cG9zdGdyZXNxbDovL3VzZXI6cGFzc0BkYjozMjMyL2RiCg==
  api-key: c2VjcmV0LWtleS0xMjM0NQo=
stringData:
  # プレーンテキスト（自動的にBase64エンコード）
  log-level: "info"
```

### パターン2: kubectlコマンド

```bash
# ファイルからSecret作成
kubectl create secret generic app-secrets \
  --from-file=database-url=./db-url.txt \
  --from-file=api-key=./api-key.txt \
  --namespace=production

# リテラル値からSecret作成
kubectl create secret generic app-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=api-key="secret-key" \
  --namespace=production
```

### パターン3: External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: app-secrets
  data:
    - secretKey: database-url
      remoteRef:
        key: secret/prod/database
        property: url
```

**メリット**: 外部Secret管理サービス（Vault、AWS Secrets Manager）との統合

## Secret注入パターン

### パターン1: 環境変数として注入

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: app
      image: myapp:latest
      env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: api-key
```

**メリット**: シンプル、アプリケーション変更不要
**デメリット**: 環境変数はプロセス情報で見える可能性

### パターン2: ボリュームとしてマウント

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
    - name: app
      image: myapp:latest
      volumeMounts:
        - name: secrets
          mountPath: "/etc/secrets"
          readOnly: true
  volumes:
    - name: secrets
      secret:
        secretName: app-secrets
```

**アクセス**:

```typescript
import fs from "fs/promises";

const dbUrl = await fs.readFile("/etc/secrets/database-url", "utf8");
const apiKey = await fs.readFile("/etc/secrets/api-key", "utf8");
```

**メリット**: ファイルパーミッション制御可能、環境変数より安全
**デメリット**: ファイルI/O必要、アプリケーション変更必要

### パターン3: Init Container での注入

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  initContainers:
    - name: secret-injector
      image: vault:latest
      command:
        [
          "sh",
          "-c",
          "vault kv get -field=value secret/prod/db > /secrets/db-url",
        ]
      volumeMounts:
        - name: secrets
          mountPath: "/secrets"
  containers:
    - name: app
      image: myapp:latest
      volumeMounts:
        - name: secrets
          mountPath: "/etc/secrets"
          readOnly: true
  volumes:
    - name: secrets
      emptyDir: {}
```

**メリット**: 外部Secret管理との統合、起動時のみアクセス
**デメリット**: 複雑、Rotation時の再起動必要

## 暗号化設定

### etcd暗号化の有効化

**重要**: デフォルトではKubernetes Secretsはetcdに平文で保存されます。
暗号化を有効にすることが推奨されます。

```yaml
# /etc/kubernetes/enc/encryption-config.yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: <BASE64_ENCODED_SECRET>
      - identity: {}
```

**API Server起動オプション**:

```bash
--encryption-provider-config=/etc/kubernetes/enc/encryption-config.yaml
```

### Sealed Secrets（GitOps向け）

```bash
# Sealed Secrets Controllerインストール
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.18.0/controller.yaml

# SealedSecretの作成（Gitコミット可能）
kubeseal --format=yaml < secret.yaml > sealed-secret.yaml
```

**メリット**: GitOpsフレンドリー、公開リポジトリにコミット可能
**デメリット**: 追加コンポーネント必要

## Secret Rotation戦略

### 手動Rotation

```bash
# 新しいSecretを作成
kubectl create secret generic app-secrets-v2 \
  --from-literal=api-key="new-secret-key" \
  --namespace=production

# Deploymentを更新して新Secretを参照
kubectl patch deployment app \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"app","env":[{"name":"API_KEY","valueFrom":{"secretKeyRef":{"name":"app-secrets-v2","key":"api-key"}}}]}]}}}}'

# 古いSecretを削除（移行完了後）
kubectl delete secret app-secrets --namespace=production
```

### 自動Rotation（External Secrets Operator使用）

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
spec:
  refreshInterval: 1h # 1時間毎に自動更新
  secretStoreRef:
    name: vault-backend
  target:
    name: app-secrets
    creationPolicy: Owner
  data:
    - secretKey: api-key
      remoteRef:
        key: secret/prod/api
        property: key
```

**メリット**: 完全自動、ダウンタイムなし
**デメリット**: External Secrets Operator必要

## ネームスペース分離

### 環境毎のネームスペース戦略

```yaml
# dev環境
apiVersion: v1
kind: Namespace
metadata:
  name: development

---
# prod環境
apiVersion: v1
kind: Namespace
metadata:
  name: production
```

**RBAC設定**:

```yaml
# 開発者はdevelopmentのみアクセス可
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: developer-secrets
  namespace: development
subjects:
  - kind: Group
    name: developers
roleRef:
  kind: Role
  name: secret-reader

---
# DevOpsはすべての環境にアクセス可
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: devops-secrets
subjects:
  - kind: Group
    name: devops
roleRef:
  kind: ClusterRole
  name: secret-admin
```

## 監査とログ

### Secret アクセスログ

Kubernetes Audit Policyで監視:

```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  - level: RequestResponse
    resources:
      - group: ""
        resources: ["secrets"]
    verbs: ["get", "list", "watch"]
```

すべてのSecret取得が記録され、異常なアクセスパターンを検知可能。

## トラブルシューティング

### よくある問題

**問題1**: SecretがPodに注入されない

- ネームスペースが一致しているか確認
- Secretが存在するか確認（`kubectl get secret -n <namespace>`）
- RBAC権限を確認

**問題2**: Base64デコードエラー

- `echo "value" | base64` で正しくエンコードされているか確認
- 改行文字に注意（`echo -n` を使用）

**問題3**: Secretが更新されない

- Podの再起動が必要（環境変数注入の場合）
- ボリュームマウントは自動更新（最大60秒遅延）

## セキュリティベストプラクティス

1. **etcd暗号化を有効化**: 必須
2. **RBAC最小権限**: Secret読み取りを必要最小限に制限
3. **ネームスペース分離**: 環境毎にネームスペース分割
4. **監査ログ有効化**: すべてのSecretアクセスを記録
5. **External Secrets使用**: 可能であればVault等と統合
6. **Secret Rotation**: 定期的な更新（30-90日）
7. **ImagePullSecrets**: プライベートレジストリ認証情報は専用Secret使用
