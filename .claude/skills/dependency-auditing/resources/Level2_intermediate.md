# Level 2: Intermediate

## 概要

セキュリティ脆弱性の検出、評価、対応戦略を専門とするスキル。 CVE/GHSA識別子の理解、重大度評価（CVSS）、修正優先度の決定方法論を提供します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: CI/CD統合パターン / GitHub Actions統合 / Dependabot設定 / CVSS重大度評価ガイド / CVSSスコアの構成要素 / Base Metrics（基本評価基準）
- 実務指針: 依存関係のセキュリティ監査を実施する時 / 脆弱性レポートを評価する時 / セキュリティパッチの適用優先度を決定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/ci-cd-integration.md`: ci-cd-integration の詳細ガイド（把握する知識: CI/CD統合パターン / GitHub Actions統合 / Dependabot設定）
- `resources/cvss-scoring-guide.md`: cvss-scoring-guide のガイド（把握する知識: CVSS重大度評価ガイド / CVSSスコアの構成要素 / Base Metrics（基本評価基準））
- `resources/remediation-strategies.md`: remediation-strategies の詳細ガイド（把握する知識: 脆弱性修正戦略 / 修正オプションの種類 / 1. パッケージのアップグレード）
- `resources/vulnerability-detection.md`: vulnerability-detection の詳細ガイド（把握する知識: 脆弱性検出方法 / パッケージマネージャー内蔵ツール / pnpm audit）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Dependency Auditing / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/security-audit.mjs`: セキュリティを監査するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/vulnerability-assessment-template.md`: vulnerability-assessment-template のテンプレート

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
