# アクセス制御パターン

> **責務**: RBAC/ABACベースのアクセス制御設計パターン
> **対象Task**: design-access-control

---

## 1. アクセス制御モデル

### 1.1 RBAC（Role-Based Access Control）

```
┌─────────────────────────────────────────────┐
│                  Users                       │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐   │
│  │ Alice │ │  Bob  │ │Charlie│ │Service│   │
│  └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘   │
└──────┼─────────┼─────────┼─────────┼────────┘
       ↓         ↓         ↓         ↓
┌─────────────────────────────────────────────┐
│                  Roles                       │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐  │
│  │  Admin  │ │ Reader  │ │Service-Account│  │
│  └────┬────┘ └────┬────┘ └──────┬───────┘  │
└───────┼───────────┼─────────────┼───────────┘
        ↓           ↓             ↓
┌─────────────────────────────────────────────┐
│               Permissions                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ Read │ │Write │ │Delete│ │Rotate│       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
└─────────────────────────────────────────────┘
```

### 1.2 ABAC（Attribute-Based Access Control）

```
┌─────────────────────────────────────────────┐
│              Policy Engine                   │
│                                              │
│  IF subject.role == "admin"                  │
│     AND resource.classification <= "high"    │
│     AND environment == "production"          │
│     AND time.hour BETWEEN 9 AND 18           │
│  THEN ALLOW                                  │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 2. ロール設計

### 2.1 標準ロール定義

| ロール          | 説明               | 権限                    |
| --------------- | ------------------ | ----------------------- |
| secret-admin    | シークレット管理者 | CRUD + Rotate + Audit   |
| secret-operator | 運用担当者         | Read + Rotate           |
| secret-reader   | 読み取り専用       | Read                    |
| secret-auditor  | 監査担当           | Read (logs only)        |
| service-account | サービス用         | Read (specific secrets) |

### 2.2 ロール階層

```
secret-admin
    ├── secret-operator
    │       └── secret-reader
    └── secret-auditor

service-account (独立、最小権限)
```

### 2.3 職務分離（SoD）

| 機能                 | Admin | Operator | Reader | Auditor |
| -------------------- | ----- | -------- | ------ | ------- |
| シークレット作成     | ✅    | ❌       | ❌     | ❌      |
| シークレット読み取り | ✅    | ✅       | ✅     | ❌      |
| シークレット更新     | ✅    | ❌       | ❌     | ❌      |
| シークレット削除     | ✅    | ❌       | ❌     | ❌      |
| ローテーション実行   | ✅    | ✅       | ❌     | ❌      |
| 監査ログ閲覧         | ✅    | ❌       | ❌     | ✅      |
| ポリシー変更         | ✅    | ❌       | ❌     | ❌      |

---

## 3. ポリシー設計

### 3.1 Vault Policy例

```hcl
# secret-admin policy
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "secret/metadata/*" {
  capabilities = ["list", "read", "delete"]
}

path "sys/policies/*" {
  capabilities = ["read", "list"]
}

# secret-reader policy
path "secret/data/{{identity.entity.aliases.auth_kubernetes.metadata.service_account_namespace}}/*" {
  capabilities = ["read", "list"]
}
```

### 3.2 AWS IAM Policy例

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:prod/*",
      "Condition": {
        "StringEquals": {
          "secretsmanager:ResourceTag/Environment": "production"
        }
      }
    }
  ]
}
```

---

## 4. 認証メカニズム

### 4.1 人間ユーザー認証

| 方式     | 説明             | 推奨ケース           |
| -------- | ---------------- | -------------------- |
| OIDC/SSO | 企業IdP連携      | エンタープライズ環境 |
| MFA      | 多要素認証       | 管理者アクセス       |
| LDAP     | ディレクトリ連携 | 既存AD環境           |

### 4.2 サービス認証

| 方式            | 説明                   | 推奨ケース     |
| --------------- | ---------------------- | -------------- |
| Kubernetes Auth | K8s ServiceAccount連携 | K8s環境        |
| IAM Role        | AWS IAMロール          | AWS環境        |
| AppRole         | Vault AppRole認証      | CI/CD          |
| Certificate     | mTLS証明書認証         | サービス間通信 |

---

## 5. ブレークグラス手順

### 5.1 緊急アクセス条件

| 条件             | 承認者             | 有効期間 |
| ---------------- | ------------------ | -------- |
| 本番インシデント | セキュリティ責任者 | 4時間    |
| ビジネス緊急     | 部門長 + IT責任者  | 2時間    |
| 災害復旧         | 経営層             | 8時間    |

### 5.2 ブレークグラスフロー

```
1. 緊急アクセス要求
   └→ チケット作成（理由記載必須）

2. 承認
   ├→ 自動: 事前承認済み担当者リスト
   └→ 手動: 承認者への通知と承認

3. 一時権限付与
   └→ 時間制限付きトークン発行

4. アクセス実行
   └→ 全操作を監査ログに記録

5. 権限自動失効
   └→ 有効期限後に自動無効化

6. 事後レビュー
   └→ アクセス内容の監査
```

---

## 6. 監査要件

### 6.1 ログ必須項目

| 項目      | 説明                            |
| --------- | ------------------------------- |
| timestamp | イベント発生時刻（UTC）         |
| actor     | 操作実行者（ユーザー/サービス） |
| action    | 実行されたアクション            |
| resource  | 対象シークレット                |
| result    | 成功/失敗                       |
| source_ip | アクセス元IP                    |
| reason    | アクセス理由（任意）            |

### 6.2 ログ保持期間

| ログ種別         | 保持期間 | 根拠             |
| ---------------- | -------- | ---------------- |
| アクセスログ     | 1年以上  | コンプライアンス |
| 変更ログ         | 3年以上  | 監査要件         |
| 緊急アクセスログ | 5年以上  | インシデント対応 |
