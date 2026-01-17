# Level 2: Intermediate

## 概要

依存関係の脆弱性スキャンとSCA（Software Composition Analysis）のベストプラクティスを提供します。 pnpm audit、Snyk、OSSスキャンツールを使用した既知脆弱性の検出、 CVE評価、CVSS スコアリング、修正可能性の評価、推移的依存関係の分析を行います。

references/・scripts/・assets/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: CVE評価ガイド / CVE (Common Vulnerabilities and Exposures) / CVSS (Common Vulnerability Scoring System) / セキュリティガイドライン / Dependency Security Scanning / 1. スキャンツールの選択

### 判断基準と検証観点

- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用

- `references/cve-evaluation-guide.md`: cve-evaluation-guide のガイド（把握する知識: CVE評価ガイド / CVE (Common Vulnerabilities and Exposures) / CVSS (Common Vulnerability Scoring System)）
- `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: セキュリティガイドライン）
- `references/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Dependency Security Scanning / 1. スキャンツールの選択 / Node.js/JavaScript）

### スクリプト運用

- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/run-dependency-scan.mjs`: 依存関係scanを実行するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### アセット運用

- `assets/scan-requirements-template.md`: 要件整理テンプレート
- `assets/dependency-audit-report-template.md`: 監査レポートテンプレート
- `assets/remediation-plan-template.md`: 修正計画テンプレート

### 成果物要件

- アセットの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. アセットを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] アセットで成果物の形式を揃えた
