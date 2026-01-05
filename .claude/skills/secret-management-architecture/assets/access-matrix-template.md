# アクセス制御マトリクステンプレート

> **用途**: RBAC/ABACアクセス権限の設計と文書化
> **対象**: アクセス制御設計

---

## 基本情報

| 項目         | 内容             |
| ------------ | ---------------- |
| プロジェクト | {{project_name}} |
| 作成日       | {{created_date}} |
| 更新日       | {{updated_date}} |
| 作成者       | {{author}}       |
| 承認者       | {{approver}}     |

---

## ロール定義

### 管理ロール

| ロールID | ロール名        | 説明               | 付与条件           |
| -------- | --------------- | ------------------ | ------------------ |
| R-001    | secret-admin    | シークレット管理者 | セキュリティチーム |
| R-002    | secret-operator | シークレット運用者 | SREチーム          |
| R-003    | secret-auditor  | 監査担当           | 監査チーム         |

### アプリケーションロール

| ロールID | ロール名     | 説明                   | 付与条件           |
| -------- | ------------ | ---------------------- | ------------------ |
| R-101    | app-backend  | バックエンドサービス   | K8s ServiceAccount |
| R-102    | app-frontend | フロントエンドサービス | K8s ServiceAccount |
| R-103    | app-worker   | ワーカーサービス       | K8s ServiceAccount |

---

## 権限定義

| 権限ID | 権限名 | 説明                 | 対象操作 |
| ------ | ------ | -------------------- | -------- |
| P-001  | create | シークレット作成     | Write    |
| P-002  | read   | シークレット読み取り | Read     |
| P-003  | update | シークレット更新     | Write    |
| P-004  | delete | シークレット削除     | Delete   |
| P-005  | rotate | ローテーション実行   | Write    |
| P-006  | audit  | 監査ログ閲覧         | Read     |
| P-007  | policy | ポリシー変更         | Admin    |

---

## アクセス制御マトリクス

### ロール × 権限マトリクス

| ロール          | create | read | update | delete | rotate | audit | policy |
| --------------- | ------ | ---- | ------ | ------ | ------ | ----- | ------ |
| secret-admin    | ✅     | ✅   | ✅     | ✅     | ✅     | ✅    | ✅     |
| secret-operator | ❌     | ✅   | ❌     | ❌     | ✅     | ❌    | ❌     |
| secret-auditor  | ❌     | ❌   | ❌     | ❌     | ❌     | ✅    | ❌     |
| app-backend     | ❌     | ✅   | ❌     | ❌     | ❌     | ❌    | ❌     |
| app-frontend    | ❌     | ✅   | ❌     | ❌     | ❌     | ❌    | ❌     |
| app-worker      | ❌     | ✅   | ❌     | ❌     | ❌     | ❌    | ❌     |

### ロール × シークレットマトリクス

| シークレット      | secret-admin | secret-operator | app-backend | app-frontend | app-worker |
| ----------------- | ------------ | --------------- | ----------- | ------------ | ---------- |
| db/primary        | CRUD         | R               | R           | -            | R          |
| db/replica        | CRUD         | R               | R           | -            | R          |
| api/stripe        | CRUD         | R               | R           | -            | -          |
| api/sendgrid      | CRUD         | R               | R           | -            | R          |
| jwt/signing-key   | CRUD         | R               | R           | -            | -          |
| encryption/master | CRUD         | -               | -           | -            | -          |

---

## 環境別制限

| 環境        | 追加制限                            |
| ----------- | ----------------------------------- |
| Production  | MFA必須、IPホワイトリスト、時間制限 |
| Staging     | VPN必須                             |
| Development | なし                                |

---

## 条件付きアクセス（ABAC）

### ポリシー例

```yaml
policies:
  - name: production-access
    description: 本番環境へのアクセス条件
    conditions:
      - environment: production
      - mfa: required
      - ip_range: ["10.0.0.0/8", "192.168.0.0/16"]
      - time_range:
          start: "09:00"
          end: "18:00"
          timezone: "Asia/Tokyo"
    actions: [read]

  - name: emergency-access
    description: 緊急時アクセス
    conditions:
      - incident_ticket: required
      - approval: security-team
      - max_duration: 4h
    actions: [read, update, rotate]
```

---

## レビュー履歴

| レビュー日 | レビュアー | 変更内容 | 承認 |
| ---------- | ---------- | -------- | ---- |
|            |            |          |      |

---

## 次回レビュー

| 項目       | 内容            |
| ---------- | --------------- |
| 予定日     | {{next_review}} |
| レビュアー | {{reviewer}}    |
| フォーカス | {{focus_areas}} |
