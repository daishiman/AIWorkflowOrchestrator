# Level 2: Intermediate

## 概要

Infrastructure as Codeの原則に基づく構成管理の自動化を専門とするスキル。 環境変数管理、Secret管理、Railway統合を中心に、再現可能なインフラ構成を実現します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 環境変数設計パターン / 環境変数の分類 / 1. 機密情報 (Secrets) / Infrastructure as Code 原則 / IaCとは / 4つの核心原則
- 実務指針: Railway構成を設計・最適化する時 / 環境変数とSecretの管理戦略を設計する時 / 複数環境間の構成差分を最小化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/environment-variables.md`: 環境変数の分類（機密/環境固有/共通）と管理場所の設計パターン（把握する知識: 環境変数設計パターン / 環境変数の分類 / 1. 機密情報 (Secrets)）
- `resources/iac-principles.md`: IaCの4原則（宣言的定義/べき等性/バージョン管理/不変インフラ）（把握する知識: Infrastructure as Code 原則 / IaCとは / 4つの核心原則）
- `resources/railway-integration.md`: railway.json構成、Turso統合、環境変数設定の詳細（把握する知識: Railwayとは / railway.json 構成 / 基本構造）
- `resources/secrets-management.md`: GitHub Secrets/Railway Secretsによるセキュアなクレデンシャル管理（把握する知識: Secretとは / 管理場所の選択 / GitHub Secrets）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Infrastructure as Code / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-env.mjs`: .env.exampleと実際の環境変数の検証
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/env-example-template.txt`: .env.exampleファイル作成テンプレート
- `templates/railway-json-template.json`: railway.json（ビルド/デプロイ構成）テンプレート

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
