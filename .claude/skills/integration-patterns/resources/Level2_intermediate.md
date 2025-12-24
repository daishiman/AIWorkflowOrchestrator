# Level 2: Intermediate

## 概要

MCPサーバーと外部システム間の統合パターンに関する専門知識。 同期・非同期通信、イベント駆動アーキテクチャ、データ同期パターンの設計指針を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 1. Message Queue パターン / 基本アーキテクチャ / プロデューサー実装 / イベント駆動設計ガイド / 1. イベント設計原則 / イベントの特性
- 実務指針: MCPサーバーと外部システムの連携設計時 / 非同期処理パターンの設計時 / イベント駆動統合の設計時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/async-patterns.md`: Message Queue/Pub-Sub/Sagaパターンの詳細と実装ガイド（把握する知識: 1. Message Queue パターン / 基本アーキテクチャ / プロデューサー実装）
- `resources/event-driven-guide.md`: Event Sourcing/CQRS/Webhookによるイベント駆動設計（把握する知識: イベント駆動設計ガイド / 1. イベント設計原則 / イベントの特性）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: Discord Bot 仕様）
- `resources/sync-patterns.md`: Request-Response/Aggregator/Gatewayパターンの詳細（把握する知識: 1. Request-Response パターン / 基本構造 / 実装パターン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 1. 同期統合パターン / Request-Response / Aggregator）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/review-integration-design.mjs`: 統合設計のアーキテクチャレビューと改善提案
- `scripts/validate-message-schema.mjs`: メッセージスキーマ定義の検証とバージョン互換性チェック
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/integration-design-template.md`: 統合パターン選択と設計ドキュメントテンプレート
- `templates/message-schema-template.json`: イベント/メッセージスキーマ定義テンプレート

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
