# Level 2: Intermediate

## 概要

PM2エコシステム設定の設計と最適化を専門とするスキル。 Alexandre Strzelewiczの思想に基づき、ecosystem.config.js の 構成、実行モード選択、環境設定、監視設定を体系的に設計します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: PM2 設定構造ガイド / ecosystem.config.js 基本構造 / 必須項目 / PM2 環境変数管理ガイド / 環境変数の階層 / 基本構造
- 実務指針: PM2でNode.jsアプリケーションを管理する時 / ecosystem.config.jsを新規作成する時 / 既存PM2設定を最適化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/config-structure-guide.md`: ecosystem.config.js構造（apps配列、必須/推奨オプション、共通設定）（把握する知識: PM2 設定構造ガイド / ecosystem.config.js 基本構造 / 必須項目）
- `resources/environment-management.md`: env階層設計、env_production分離、機密情報外部化パターン（把握する知識: PM2 環境変数管理ガイド / 環境変数の階層 / 基本構造）
- `resources/execution-modes.md`: fork vs cluster選択基準、instances数決定、負荷タイプ別最適化（把握する知識: PM2 実行モード選択ガイド / Fork vs Cluster / Fork Mode）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: PM2 Ecosystem Configuration / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-ecosystem.mjs`: ecosystem.config.js構文検証と設定項目の整合性チェック
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/ecosystem.config.template.js`: PM2設定ファイルテンプレート（実行モード、再起動戦略、環境変数含む）

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
