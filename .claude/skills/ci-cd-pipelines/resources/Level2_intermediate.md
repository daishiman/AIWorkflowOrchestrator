# Level 2: Intermediate

## 概要

ジーン・キムのDevOps原則に基づくCI/CDパイプライン設計と実装を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: キャッシュ戦略 / キャッシュの基本原則 / なぜキャッシュが重要か / GitHub Actions構文リファレンス / プルリクエストトリガー / プッシュトリガー
- 実務指針: GitHub Actionsワークフローを新規作成・最適化する時 / CI/CDパイプラインの品質ゲートを設計する時 / ビルド・テストの並列化による高速化が必要な時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/caching-strategies.md`: pnpm/pnpm/yarn依存関係キャッシュ、Next.js/Turboビルドキャッシュの実装パターンと10GB制限対策（把握する知識: キャッシュ戦略 / キャッシュの基本原則 / なぜキャッシュが重要か）
- `resources/github-actions-syntax.md`: GitHub Actions構文リファレンス（把握する知識: GitHub Actions構文リファレンス / プルリクエストトリガー / プッシュトリガー）
- `resources/parallelization.md`: 並列化とマトリクスビルド（把握する知識: 並列化とマトリクスビルド / 並列化の原則 / なぜ並列化が重要か）
- `resources/pipeline-patterns.md`: パイプラインアーキテクチャパターン（把握する知識: パイプラインアーキテクチャパターン / 基本パターン / 1. 線形パイプライン）
- `resources/quality-gates.md`: 静的チェック・テスト・セキュリティの3層品質ゲートとブランチ保護設定パターン（把握する知識: 品質ゲート設計 / 品質ゲートとは / 品質ゲートの階層）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: デプロイメント (Deployment)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: CI/CD Pipelines / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/validate-workflow.mjs`: GitHub Actions Workflow Validator

### テンプレート運用
- `templates/ci-workflow-template.yml`: CI Workflow Template
- `templates/deploy-workflow-template.yml`: Deploy Workflow Template
- `templates/reusable-workflow-template.yml`: Reusable Workflow Template

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
