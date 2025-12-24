# Level 2: Intermediate

## 概要

外部API統合における構造的パターンと腐敗防止層（Anti-Corruption Layer）の設計を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Adapter Pattern for API Clients / いつ使うか / 適用条件 / Anti-Corruption Layer (腐敗防止層) / なぜ必要か / 外部システムの「腐敗」とは
- 実務指針: 外部APIクライアントを設計する時 / 外部データを内部ドメインモデルに変換する時 / 腐敗防止層の境界を設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/adapter-pattern.md`: Adapter Pattern for API Clients（把握する知識: Adapter Pattern for API Clients / いつ使うか / 適用条件）
- `resources/anti-corruption-layer.md`: Anti-Corruption Layer (腐敗防止層)（把握する知識: Anti-Corruption Layer (腐敗防止層) / なぜ必要か / 外部システムの「腐敗」とは）
- `resources/data-transformer-patterns.md`: Data Transformer Patterns（把握する知識: Data Transformer Patterns / 基本パターン / 1. シンプル変換）
- `resources/facade-pattern.md`: Facade Pattern for API Integration（把握する知識: Facade Pattern for API Integration / いつ使うか / 適用条件）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: Discord Bot 仕様）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: API Client Patterns / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-api-client.mjs`: API Client Structure Validator
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/api-client-template.ts`: API Client Template
- `templates/transformer-template.ts`: Data Transformer Template

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
