# Level 2: Intermediate

## 概要

ACID特性を保証するトランザクション設計と実装を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Atomicity（原子性） / 定義 / 重要性 / トランザクションモード比較表 / 1. BEGIN DEFERRED（デフォルト） / 動作

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/acid-properties.md`: Acid Propertiesリソース（把握する知識: Atomicity（原子性） / 定義 / 重要性）
- `resources/isolation-levels-detail.md`: Isolation Levels Detailリソース（把握する知識: トランザクションモード比較表 / 1. BEGIN DEFERRED（デフォルト） / 動作）
- `resources/isolation-levels.md`: Isolation Levelsリソース（把握する知識: 分離レベルガイド（SQLite版） / 分離レベルとは / SQLiteの特徴）
- `resources/locking-strategies.md`: Locking Strategiesリソース（把握する知識: ロック戦略 / ロックの必要性 / ロック種類）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: データベース設計（Turso + Drizzle ORM））
- `resources/rollback-patterns.md`: Rollback Patternsリソース（把握する知識: ロールバックパターン / ロールバックとは / 基本ロールバックパターン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Transaction Management / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-transaction.mjs`: Analyze Transactionスクリプト
- `scripts/detect-long-transactions.mjs`: Detect Long Transactionsスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/transaction-design-checklist.md`: Transaction Design Checklistテンプレート
- `templates/transaction-design-template.md`: Transaction Designテンプレート

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
