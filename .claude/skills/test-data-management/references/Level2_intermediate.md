# Level 2: Intermediate

## 概要

E2Eテストのためのテストデータ管理戦略。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: テストデータクリーンアップパターン / 目次 / クリーンアップの重要性 / データ分離技術 / データ分離の必要性 / テストデータSeeding戦略

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/cleanup-patterns.md`: Cleanup Patternsリソース（把握する知識: テストデータクリーンアップパターン / 目次 / クリーンアップの重要性）
- `resources/data-isolation-techniques.md`: Data Isolation Techniquesリソース（把握する知識: データ分離技術 / 目次 / データ分離の必要性）
- `resources/seeding-strategies.md`: Seeding Strategiesリソース（把握する知識: テストデータSeeding戦略 / 目次 / API経由のSeeding）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 核心概念 / 1. Seeding（データ準備）戦略 / 2. Teardown（クリーンアップ）戦略）

### スクリプト運用
- `scripts/generate-test-data.mjs`: Generate Test Dataスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/fixture-template.ts`: Fixtureテンプレート

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
