# Level 2: Intermediate

## 概要

スコット・アンブラーの『Refactoring Databases』に基づく、安全で可逆的なデータベースマイグレーション管理スキル。 Drizzle Kitを使用したスキーマ変更の計画、マイグレーション生成、本番適用、 ロールバック戦略、および移行期間（Transition Period）を含む包括的なワークフローを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 基本設定 / drizzle.config.ts (SQLite/Turso) / Turso用の設定例 / マイグレーション戦略 / マイグレーションの分類 / リスクレベル別
- 実務指針: スキーマを変更する時 / マイグレーションを生成・適用する時 / 破壊的変更に移行期間を設ける時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/drizzle-kit-commands.md`: drizzle-kit-commands の詳細ガイド（把握する知識: 基本設定 / drizzle.config.ts (SQLite/Turso) / Turso用の設定例）
- `resources/migration-strategies.md`: migration-strategies の詳細ガイド（把握する知識: マイグレーション戦略 / マイグレーションの分類 / リスクレベル別）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: データベース設計（Turso + Drizzle ORM））
- `resources/rollback-procedures.md`: rollback-procedures の詳細ガイド（把握する知識: ロールバック手順 (SQLite) / ロールバックの基本 / ロールバックが必要な状況）
- `resources/schema-change-patterns.md`: schema-change-patterns のパターン集（把握する知識: スキーマ変更パターン (SQLite) / カラム操作 / カラム追加）
- `resources/transition-period-patterns.md`: transition-period-patterns のパターン集（把握する知識: 移行期間パターン (SQLite) / 移行期間の原則 / 1. 新旧共存期間）
- `resources/zero-downtime-patterns.md`: zero-downtime-patterns のパターン集（把握する知識: ゼロダウンタイムマイグレーションパターン / 基本原則 / 後方互換性の維持）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Database Migrations / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-migration-safety.mjs`: マイグレーションsafetyを検証するスクリプト
- `scripts/generate-rollback.mjs`: rollbackを生成するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/migration-checklist.md`: migration-checklist のチェックリスト
- `templates/migration-plan-template.md`: migration-plan-template のテンプレート

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
