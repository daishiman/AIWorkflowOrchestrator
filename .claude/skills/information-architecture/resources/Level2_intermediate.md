# Level 2: Intermediate

## 概要

ユーザーが必要な情報を素早く見つけられるドキュメント構造設計スキル。 階層設計、ナビゲーション、情報粒度管理の技術を提供。 使用タイミング:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ナビゲーションパターンガイド / ナビゲーションの目的 / グローバルナビゲーション / UI/UX ガイドライン / 統合システム設計仕様書：Universal AI Workflow Orchestrator / ドキュメント階層設計
- 実務指針: ドキュメント全体の構造を設計する時 / ナビゲーション設計を行う時 / 情報の粒度を決定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/navigation-patterns.md`: navigation-patterns のパターン集（把握する知識: ナビゲーションパターンガイド / ナビゲーションの目的 / グローバルナビゲーション）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: UI/UX ガイドライン / 統合システム設計仕様書：Universal AI Workflow Orchestrator）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: ドキュメント階層設計 / 階層設計原則 / 標準階層構造）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-links.mjs`: linksを検証するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/sitemap-template.md`: sitemap-template のテンプレート

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
