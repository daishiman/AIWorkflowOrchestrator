# Level 2: Intermediate

## 概要

CI/CD パイプラインに統合するセキュリティスキャンの設計と実装を支援するスキルです。 依存関係の脆弱性検出、コンテナイメージスキャン、SBOM の生成を対象とします。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: コンテナスキャン / ツール比較 / Trivy / 依存関係スキャン / pnpm audit / セキュリティガイドライン

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/container-scanning.md`: Container Scanningリソース（把握する知識: コンテナスキャン / ツール比較 / Trivy）
- `resources/dependency-scanning.md`: Dependency Scanningリソース（把握する知識: 依存関係スキャン / ツール比較 / pnpm audit）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: セキュリティガイドライン）
- `resources/sbom-generation.md`: Sbom Generationリソース（把握する知識: SBOM生成 / 重要性 / 標準フォーマット）
- `resources/secret-detection.md`: Secret Detectionリソース（把握する知識: シークレット検出 / ツール比較 / TruffleHog）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: セキュリティスキャン / 対象読者 / スキャンの種類）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/scan-dependencies.mjs`: Scan Dependenciesスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/security-scan-workflow.yml`: Security Scan Workflowテンプレート
- `templates/trivy-config.yaml`: Trivy Configテンプレート

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
