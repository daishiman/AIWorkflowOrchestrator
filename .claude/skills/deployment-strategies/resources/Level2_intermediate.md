# Level 2: Intermediate

## 概要

本番環境への安全なデプロイとリスク軽減を専門とするスキル。 Blue-Green、Canary、Rolling等のデプロイパターンとロールバック戦略を提供します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Blue-Green デプロイ / 概念 / 特徴 / ヘルスチェック設計 / ヘルスチェックの種類 / 1. Liveness Check（生存確認）
- 実務指針: デプロイ戦略を選択・設計する時 / ロールバック手順を定義する時 / 本番デプロイのリスクを最小化したい時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/deployment-patterns.md`: deployment-patterns のパターン集（把握する知識: Blue-Green デプロイ / 概念 / 特徴）
- `resources/health-checks.md`: health-checks の詳細ガイド（把握する知識: ヘルスチェック設計 / ヘルスチェックの種類 / 1. Liveness Check（生存確認））
- `resources/railway-deployment.md`: railway-deployment の詳細ガイド（把握する知識: デプロイフロー / 自動デプロイ / ゼロダウンタイムの仕組み）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: デプロイメント (Deployment)）
- `resources/rollback-strategies.md`: rollback-strategies の詳細ガイド（把握する知識: ロールバック戦略 / ロールバックの種類 / 1. 即時ロールバック）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Deployment Strategies / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/health-check.mjs`: ヘルスを検証するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/deployment-runbook.md`: deployment-runbook のテンプレート
- `templates/health-endpoint-template.ts`: health-endpoint-template のテンプレート
- `templates/rollback-checklist.md`: rollback-checklist のチェックリスト
- `templates/smoke-test-template.ts`: smoke-test-template のテンプレート

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
