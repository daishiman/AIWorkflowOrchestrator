# Level 2: Intermediate

## 概要

Claude Codeエージェントの構造設計を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 完全なテンプレート / 必須ルール / 2. フルパス形式 / ローカルエージェント仕様 / タスク実行仕様書生成ガイド / Claude Code 3層アーキテクチャ設計仕様書
- 実務指針: 新しいエージェントのYAML Frontmatterを設計する時 / 📚 依存スキルセクションを標準化する時 / システムプロンプト本文の構造を決定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/dependency-skill-format-guide.md`: 📚 依存スキル形式の詳細ルール（把握する知識: 完全なテンプレート / 必須ルール / 2. フルパス形式）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: ローカルエージェント仕様 / タスク実行仕様書生成ガイド / Claude Code 3層アーキテクチャ設計仕様書）
- `resources/skill-dependency-format-examples.md`: skill-dependency-format-examples の詳細ガイド（把握する知識: パターン別ガイド / 専門分野セクション / 使用タイミングセクション）
- `resources/yaml-description-rules.md`: yaml-description-rules の詳細ガイド（把握する知識: YAML Frontmatter Description規則 (v2.1.0統一フォーマット) / 必須要素 / 1. エージェントの基本説明（1-2行））
- `resources/yaml-frontmatter-guide.md`: YAML Frontmatter必須フィールド（name・description・tools・model・version）の最適化とトリガーキーワード設計ガイド（把握する知識: YAML Frontmatter設計ガイド / 必須フィールド / name（必須））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Agent Structure Design / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/validate-structure.mjs`: YAML Frontmatter構文・必須フィールド・必須セクション・ファイル構造の4項目を自動検証するNode.jsスクリプト

### テンプレート運用
- `templates/agent-template.md`: エージェントテンプレート

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
