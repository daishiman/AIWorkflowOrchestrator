# Level 2: Intermediate

## 概要

Drizzle ORMを活用したデータベース操作のベストプラクティスを提供するスキル。 型安全なスキーマ定義、クエリビルダーの効果的な使用、 パフォーマンスを考慮した実装パターンを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: パフォーマンスパターン / 接続プール管理 / libSQL/Turso接続設定 / クエリビルダーパターン / 基本操作 / SELECT
- 実務指針: Drizzle ORMでスキーマを定義する時 / 複雑なクエリを構築する時 / エンティティマッピングを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/performance-patterns.md`: パフォーマンスパターン（把握する知識: パフォーマンスパターン / 接続プール管理 / libSQL/Turso接続設定）
- `resources/query-builder-patterns.md`: クエリビルダーパターン（把握する知識: クエリビルダーパターン / 基本操作 / SELECT）
- `resources/relation-mapping.md`: リレーション設定とマッピング（把握する知識: リレーション設定とマッピング / Drizzle ORMのリレーション / リレーション定義）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 技術スタック仕様書 / データベース設計（Turso + Drizzle ORM））
- `resources/schema-definition.md`: スキーマ定義パターン（把握する知識: スキーマ定義パターン / Drizzle ORMスキーマの基本 / テーブル定義）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: ORM Best Practices / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-schema.mjs`: Drizzle ORMスキーマ定義の型安全性と整合性を検証
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/schema-template.md`: Drizzle ORMテーブルスキーマ定義のTypeScriptテンプレート（型定義、リレーション、インデックス含む）

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
