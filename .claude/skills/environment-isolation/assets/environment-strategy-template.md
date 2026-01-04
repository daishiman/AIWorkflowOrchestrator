# 環境分離戦略ドキュメント

## プロジェクト概要

- プロジェクト名: {{PROJECT_NAME}}
- 作成日: {{CREATED_DATE}}
- 最終更新: {{UPDATED_DATE}}
- 担当者: {{OWNER}}

## 1. 要件分析

### 1.1 プロジェクト規模

- 規模: {{SMALL|MEDIUM|LARGE}}
- 想定ユーザー数: {{USER_COUNT}}
- データの機密性: {{LOW|MEDIUM|HIGH|CRITICAL}}

### 1.2 コンプライアンス要件

- 適用される規制: {{GDPR|HIPAA|PCI-DSS|SOC2|NONE}}
- 監査要件: {{YES|NO}}
- データ主権: {{REGION_REQUIREMENTS}}

## 2. 採用する環境分離レベル

### レベル1: 物理的分離

- 採用: {{YES|NO}}
- 実装方式: {{CLOUD_ACCOUNT|VPC|N/A}}
- 理由: {{REASON}}

### レベル2: 論理的分離

- 採用: {{YES|NO}}
- 実装方式: {{KUBERNETES_NAMESPACE|RAILWAY_PROJECT|N/A}}
- 理由: {{REASON}}

### レベル3: データ分離（必須）

- 採用: YES
- 実装方式: {{DATABASE_INSTANCE|SCHEMA|TABLE}}
- 理由: すべてのプロジェクトで必須

### レベル4: アクセス分離（必須）

- 採用: YES
- 実装方式: {{IAM_ROLE|SERVICE_ACCOUNT|RBAC}}
- 理由: すべてのプロジェクトで必須

## 3. 環境構成

### 3.1 環境一覧

| 環境名      | 目的        | インフラ  | データベース    | ユーザーアクセス |
| ----------- | ----------- | --------- | --------------- | ---------------- |
| Development | {{PURPOSE}} | {{INFRA}} | {{DB_INSTANCE}} | {{ACCESS_LEVEL}} |
| Staging     | {{PURPOSE}} | {{INFRA}} | {{DB_INSTANCE}} | {{ACCESS_LEVEL}} |
| Production  | {{PURPOSE}} | {{INFRA}} | {{DB_INSTANCE}} | {{ACCESS_LEVEL}} |

### 3.2 環境間依存関係

```
{{DEPENDENCY_DIAGRAM}}
```

## 4. Secret管理方針

### 4.1 Development環境

- Secret管理方式: {{METHOD}}
- アクセス制御: {{ACCESS_CONTROL}}
- ローテーション頻度: {{ROTATION_FREQUENCY}}
- 許可されるデータ: {{DATA_POLICY}}

### 4.2 Staging環境

- Secret管理方式: {{METHOD}}
- アクセス制御: {{ACCESS_CONTROL}}
- ローテーション頻度: {{ROTATION_FREQUENCY}}
- 許可されるデータ: {{DATA_POLICY}}

### 4.3 Production環境

- Secret管理方式: {{METHOD}}
- アクセス制御: {{ACCESS_CONTROL}}
- ローテーション頻度: {{ROTATION_FREQUENCY}}
- 許可されるデータ: {{DATA_POLICY}}

## 5. アクセス制御マトリクス

| ロール/ユーザー  | Development     | Staging         | Production      |
| ---------------- | --------------- | --------------- | --------------- |
| Developer        | {{PERMISSIONS}} | {{PERMISSIONS}} | {{PERMISSIONS}} |
| DevOps Engineer  | {{PERMISSIONS}} | {{PERMISSIONS}} | {{PERMISSIONS}} |
| Security Officer | {{PERMISSIONS}} | {{PERMISSIONS}} | {{PERMISSIONS}} |
| Administrator    | {{PERMISSIONS}} | {{PERMISSIONS}} | {{PERMISSIONS}} |

## 6. ネットワーク分離ポリシー

### 6.1 許可される通信

```
{{ALLOWED_COMMUNICATION_DIAGRAM}}
```

### 6.2 禁止される通信

```
{{DENIED_COMMUNICATION_DIAGRAM}}
```

## 7. 検証基準

### 7.1 自動検証項目

- [ ] .env.local がGitignoreに含まれている
- [ ] すべての環境で必須環境変数が定義されている
- [ ] 本番環境のSecretが暗号化されている
- [ ] {{ADDITIONAL_CHECKS}}

### 7.2 手動検証項目

- [ ] 開発環境から本番データベースにアクセスできない
- [ ] 本番環境の管理コンソールにMFAが必須である
- [ ] Secret漏洩検知が有効である
- [ ] {{ADDITIONAL_CHECKS}}

## 8. リスク評価

### 8.1 Development環境

| リスク   | 影響度     | 発生確率        | 対策           |
| -------- | ---------- | --------------- | -------------- |
| {{RISK}} | {{IMPACT}} | {{PROBABILITY}} | {{MITIGATION}} |

### 8.2 Staging環境

| リスク   | 影響度     | 発生確率        | 対策           |
| -------- | ---------- | --------------- | -------------- |
| {{RISK}} | {{IMPACT}} | {{PROBABILITY}} | {{MITIGATION}} |

### 8.3 Production環境

| リスク   | 影響度     | 発生確率        | 対策           |
| -------- | ---------- | --------------- | -------------- |
| {{RISK}} | {{IMPACT}} | {{PROBABILITY}} | {{MITIGATION}} |

## 9. 実装ロードマップ

### Phase 1: 基本分離（必須）

- [ ] データベースインスタンスの分離
- [ ] アクセス制御の設定
- [ ] .env.exampleの作成
- [ ] 完了予定: {{DATE}}

### Phase 2: Secret管理強化

- [ ] Railway/GitHub Secretsの設定
- [ ] CI/CD統合
- [ ] ローテーションスケジュールの策定
- [ ] 完了予定: {{DATE}}

### Phase 3: 高度な分離（オプション）

- [ ] 物理的分離の実装
- [ ] ネットワーク分離の強化
- [ ] 監査ログの有効化
- [ ] 完了予定: {{DATE}}

## 10. 承認

- 戦略承認者: {{APPROVER}}
- 承認日: {{APPROVAL_DATE}}
- 次回レビュー予定: {{REVIEW_DATE}}
