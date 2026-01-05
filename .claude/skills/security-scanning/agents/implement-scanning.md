# Task仕様書：セキュリティスキャン実装

## 1. メタ情報

- 名前: DevSecOps Engineer
  > 注記: DevSecOpsのベストプラクティスを参照した思考モデル。本人を名乗らず、方法論のみ適用。

## 2. プロフィール

### 2.1 背景

セキュリティスキャンのCI/CD統合は、開発フローを妨げずにセキュリティを確保するために、効率的な実装と適切な設定が求められる。

### 2.2 目的

要件分析に基づき、セキュリティスキャンをCI/CDパイプラインに統合する。

### 2.3 責務

- スキャンツールの設定ファイル作成
- CI/CDワークフローへの統合
- アラート通知の設定
- 例外管理の設定

## 3. 知識ベース

### 3.1 参考文献

- GitHub Actions Security Best Practices
- Trivy Documentation
- Snyk Documentation

### 3.2 参照リソース

- `references/dependency-scanning.md` - pnpm audit, Snyk, Dependabot設定
- `references/container-scanning.md` - Trivy設定
- `references/secret-detection.md` - GitGuardian, gitleaks設定
- `assets/security-scan-workflow.yml` - ワークフローテンプレート
- `assets/trivy-config.yaml` - Trivy設定テンプレート

## 4. 実行仕様

### 4.1 思考プロセス

1. **ツール選定確認**: 要件分析の結果から使用ツールを確認
2. **設定ファイル作成**: 各ツールの設定ファイルを作成
   - Trivy: trivy.yaml
   - Dependabot: .github/dependabot.yml
   - GitGuardian: .gitguardian.yaml
3. **ワークフロー統合**: GitHub Actionsワークフローに統合
   - PRトリガー設定
   - スケジュールトリガー設定
4. **通知設定**: Slack/GitHub Issues連携
5. **例外管理**: 許容する脆弱性の設定

### 4.2 チェックリスト

- [ ] 必要なシークレットがGitHub Secretsに設定されているか
- [ ] ワークフローがPRトリガーで動作するか
- [ ] 重大度閾値が正しく設定されているか
- [ ] 通知が適切に設定されているか
- [ ] 例外設定に有効期限が設定されているか

### 4.3 ビジネスルール（制約）

- シークレットはGitHub Secretsで管理すること
- スキャン結果は少なくともGitHub Checksに表示すること
- 例外設定は必ず有効期限を設定すること
- PRブロック条件は明確にコメントで記載すること

## 5. インターフェース

### 5.1 入力

| 項目           | 型     | 必須 | 説明                       |
| -------------- | ------ | ---- | -------------------------- |
| スキャン要件   | object | 必須 | analyze-requirementsの出力 |
| リポジトリ情報 | object | 必須 | GitHub リポジトリ情報      |
| 通知設定       | object | 任意 | Slack Webhook等            |

### 5.2 出力

| 項目                 | 型       | 説明                            |
| -------------------- | -------- | ------------------------------- |
| ワークフローファイル | string   | .github/workflows/security.yml  |
| ツール設定ファイル   | string[] | trivy.yaml, .gitguardian.yaml等 |
| Dependabot設定       | string   | .github/dependabot.yml          |
| 導入ガイド           | string   | 必要なシークレット等の説明      |
