# Level 2: Intermediate

## 概要

ドメイン駆動設計におけるドメインサービスの設計と実装を専門とするスキル。 エンティティや値オブジェクトに属さないドメインロジックを適切にモデル化します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ドメインサービスパターン集 / 計算サービス / パターン: 価格計算サービス / ドメインサービス vs アプリケーションサービス / 基本的な違い / ドメインサービス
- 実務指針: エンティティに属さないドメインロジックがある時 / 複数の集約をまたがる操作が必要な時 / ドメインポリシーや計算ロジックを実装する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/service-patterns.md`: service-patterns のパターン集（把握する知識: ドメインサービスパターン集 / 計算サービス / パターン: 価格計算サービス）
- `resources/service-vs-application.md`: service-vs-application の詳細ガイド（把握する知識: ドメインサービス vs アプリケーションサービス / 基本的な違い / ドメインサービス）
- `resources/when-to-use-domain-services.md`: when-to-use-domain-services の詳細ガイド（把握する知識: ドメインサービスの使いどころ / 基本的な判断フロー / ドメインサービスが必要な場面）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Domain Services / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-service-responsibilities.mjs`: serviceresponsibilitiesを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/domain-service-template.ts`: domain-service-template のテンプレート

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
