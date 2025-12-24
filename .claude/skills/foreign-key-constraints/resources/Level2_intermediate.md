# Level 2: Intermediate

## 概要

C.J.デイトの『リレーショナルデータベース入門』に基づく外部キー制約と参照整合性の設計。 CASCADE動作の戦略的選択、循環参照の回避、ソフトデリートとの整合性を提供。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 1. ON DELETE CASCADE / 1.2 適用パターン / 1.3 注意点と対策 / データベース設計（Turso + Drizzle ORM） / 外部キー制約の基本 / 定義と目的
- 実務指針: 外部キー関係の設計時 / CASCADE動作の選択時 / 循環参照の検出・解消時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/cascade-patterns.md`: cascade-patterns のパターン集（把握する知識: 1. ON DELETE CASCADE / 1.2 適用パターン / 1.3 注意点と対策）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: データベース設計（Turso + Drizzle ORM））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 外部キー制約の基本 / 定義と目的 / Drizzle ORM での定義）

### スクリプト運用
- `scripts/check-fk-integrity.mjs`: fkintegrityを検証するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/fk-design-checklist.md`: fk-design-checklist のチェックリスト

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
