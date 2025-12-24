# Level 2: Intermediate

## 概要

エリック・エヴァンスのドメイン駆動設計（DDD）に基づくドメインモデリングを専門とするスキル。 Entity、Value Object、Aggregate、Repository Patternを活用して、 ビジネスロジックを中心に据えた堅牢なドメイン層を設計します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 集約パターンと境界設計 / 集約とは / 集約の設計原則 / DDDの戦術的パターン体系 / ビルディングブロック一覧 / 1. エンティティ (Entity)
- 実務指針: 新しいドメインモデルを設計する時 / エンティティと値オブジェクトの分類を決定する時 / 集約境界を定義する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/aggregate-patterns.md`: aggregate-patterns のパターン集（把握する知識: 集約パターンと境界設計 / 集約とは / 集約の設計原則）
- `resources/ddd-building-blocks.md`: ddd-building-blocks の詳細ガイド（把握する知識: DDDの戦術的パターン体系 / ビルディングブロック一覧 / 1. エンティティ (Entity)）
- `resources/entity-design-guide.md`: entity-design-guide のガイド（把握する知識: エンティティ設計ガイド / エンティティとは / エンティティの識別基準）
- `resources/repository-interface-design.md`: repository-interface-design の詳細ガイド（把握する知識: リポジトリインターフェース設計 / リポジトリパターンとは / 設計原則）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Domain-Driven Design / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-dependencies.mjs`: 依存関係を分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-domain-model.mjs`: domainmodelを検証するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/aggregate-template.ts`: aggregate-template のテンプレート
- `templates/entity-template.ts`: entity-template のテンプレート
- `templates/repository-interface-template.ts`: repository-interface-template のテンプレート

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
