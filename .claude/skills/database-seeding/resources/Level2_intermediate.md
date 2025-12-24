# Level 2: Intermediate

## 概要

データベースシーディング（初期データ投入）の専門スキル。 開発環境のセットアップ、テストデータ生成、本番初期データ管理を 安全かつ効率的に行うための知識を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: データ生成テクニック / Faker.jsの活用 / 基本的な使い方 / 環境分離ガイド / 環境の種類 / 環境定義
- 実務指針: 新規プロジェクトの初期データを設計する時 / 開発環境のテストデータを生成する時 / テスト用フィクスチャを作成する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/data-generation.md`: data-generation の詳細ガイド（把握する知識: データ生成テクニック / Faker.jsの活用 / 基本的な使い方）
- `resources/environment-separation.md`: environment-separation の詳細ガイド（把握する知識: 環境分離ガイド / 環境の種類 / 環境定義）
- `resources/seed-strategies.md`: seed-strategies の詳細ガイド（把握する知識: シード戦略パターン / シードの分類 / 1. マスターシード（Master Seed））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Database Seeding / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/seed-runner.mjs`: runnerをシードするスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/seed-file-template.ts`: seed-file-template のテンプレート

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
