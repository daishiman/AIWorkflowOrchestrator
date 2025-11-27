---
name: workflow-security
description: |
  GitHub Actions ワークフローのセキュリティ強化スキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/workflow-security/resources/permission-hardening.md`: Permission Hardeningリソース
  - `.claude/skills/workflow-security/resources/supply-chain-security.md`: Supply Chain Securityリソース

  - `.claude/skills/workflow-security/templates/secure-workflow.yaml`: Secure Workflowテンプレート

  - `.claude/skills/workflow-security/scripts/audit-workflow.mjs`: Audit Workflowスクリプト

  専門分野:
  - 最小権限の原則（GITHUB_TOKEN権限の最小化）
  - サプライチェーン攻撃対策（アクションの固定、依存関係レビュー）
  - シークレット管理とトークンのスコープ制御
  - pull_request vs pull_request_targetの安全な使用
  - 環境保護とデプロイメント承認フロー

  使用タイミング:
  - セキュリティ脆弱性の検出時（トークン露出、過剰な権限、未検証のアクション）
  - ワークフローのセキュリティレビュー時
  - PRワークフローの作成時（pull_request_targetの使用）
  - サードパーティアクションの追加時
  - 本番環境へのデプロイワークフロー設計時

  Use proactively when implementing GitHub Actions workflows with security concerns,
  permission management, or supply chain protection.
version: 1.0.0
---

# GitHub Actions Workflow Security

## ディレクトリ構造

```
workflow-security/
├── SKILL.md                          # 本ファイル（セキュリティ概要）
├── resources/
│   ├── permission-hardening.md       # 権限最小化の詳細
│   └── supply-chain-security.md      # サプライチェーン対策
├── templates/
│   └── secure-workflow.yaml          # セキュア設定例
└── scripts/
    └── audit-workflow.mjs            # セキュリティ監査スクリプト
```

## コマンドリファレンス

```bash
# 権限強化の詳細
cat .claude/skills/workflow-security/resources/permission-hardening.md

# サプライチェーンセキュリティ
cat .claude/skills/workflow-security/resources/supply-chain-security.md

# セキュアなワークフロー例
cat .claude/skills/workflow-security/templates/secure-workflow.yaml

# ワークフローのセキュリティ監査
node .claude/skills/workflow-security/scripts/audit-workflow.mjs .github/workflows/ci.yml
```

## セキュリティチェックリスト

### 🔴 Critical（必須対応）

- [ ] **GITHUB_TOKEN 権限を最小化**: `permissions:`で明示的に制限
- [ ] **サードパーティアクションをコミット SHA で固定**: `uses: actions/checkout@a81bbbf`
- [ ] **pull_request_target の安全な使用**: untrusted コードを実行しない
- [ ] **シークレットを PR から保護**: `if: github.event_name != 'pull_request'`
- [ ] **本番環境に承認フロー設定**: `environment:`で保護

### 🟡 Important（推奨対応）

- [ ] 依存関係レビューの有効化（Dependabot）
- [ ] コードスキャンの統合（CodeQL、Trivy）
- [ ] OpenID Connect（OIDC）の使用
- [ ] ワークフロー実行ログの監視

### 🟢 Best Practice（最適化）

- [ ] Sigstore でアクション署名検証
- [ ] ネットワーク制限（self-hosted runners）
- [ ] 監査ログの保存
- [ ] 定期的なセキュリティレビュー（四半期）

## 主要なセキュリティ原則

### 1. 最小権限の原則

```yaml
permissions:
  contents: read # ソースコード読み取り専用
  pull-requests: write # PRコメントのみ書き込み
```

**リポジトリ設定**: Settings → Actions → "Read repository contents and packages permissions"

### 2. サプライチェーン攻撃対策

```yaml
# ❌ 危険: タグは変更可能
uses: actions/checkout@v4

# ✅ 安全: コミットSHAは不変
uses: actions/checkout@a81bbbf8298c0fa03ea29cdc473d45769f953675  # v4.1.1
```

### 3. PR ワークフローの安全な設計

```yaml
# ❌ 危険: untrustedコードが実行される
on: pull_request_target
steps:
  - uses: actions/checkout@v4
  - run: npm test  # 攻撃者のコード実行

# ✅ 安全: ベースブランチのコードのみ
on: pull_request_target
steps:
  - uses: actions/checkout@v4
    with:
      ref: ${{ github.base_ref }}
```

### 4. シークレット保護

```yaml
- name: Deploy
  if: github.event_name != 'pull_request'
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  run: aws s3 sync ./dist s3://bucket
```

## セキュリティ監査フロー

```
権限レビュー → アクション固定確認 → シークレット使用箇所チェック
  ↓              ↓                    ↓
pull_request_target検証 → 環境保護設定確認 → 監査レポート生成
```

## 関連スキル

| スキル名                        | パス                                                  | 関連性           |
| ------------------------------- | ----------------------------------------------------- | ---------------- |
| **github-actions-syntax**       | `.claude/skills/github-actions-syntax/SKILL.md`       | 構文基礎         |
| **secrets-management-gha**      | `.claude/skills/secrets-management-gha/SKILL.md`      | シークレット管理 |
| **deployment-environments-gha** | `.claude/skills/deployment-environments-gha/SKILL.md` | 環境保護         |
| **github-actions-expressions**  | `.claude/skills/github-actions-expressions/SKILL.md`  | セキュリティ制御 |
| **reusable-workflows**          | `.claude/skills/reusable-workflows/SKILL.md`          | 集中管理         |

## 使用上の注意

### 対処する問題

- 過剰な権限（`permissions: write-all`）
- サプライチェーン攻撃（タグベース参照）
- トークン露出（PR からのシークレットアクセス）
- untrusted コード実行（pull_request_target 誤用）
- 環境保護不足（本番デプロイ承認なし）

### 対処しない問題

- アプリケーションコード脆弱性（SAST/DAST 使用）
- インフラストラクチャセキュリティ（Terraform 等）
- コンテナイメージ脆弱性（Trivy 等）

### 推奨フロー

1. **新規作成**: テンプレート使用
2. **既存改善**: 監査スクリプト実行
3. **インシデント後**: チェックリスト全確認
4. **定期レビュー**: 四半期ごと監査

---

**メンテナンス**: 四半期ごと更新
**バージョン管理**: セキュリティ勧告の重大変更時にメジャーバージョンアップ
