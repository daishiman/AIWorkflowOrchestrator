# Level 2: Intermediate

## 概要

コマンドのドキュメンテーションを専門とするスキル。 セルフドキュメンティング構造、使用例、トラブルシューティング、 ユーザーフレンドリーな説明の作成方法を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ドキュメンテーションガイド / 自己文書化構造 / Purpose / Claude Code 3層アーキテクチャ設計仕様書 / Command Documentation Patterns / リソース構造
- 実務指針: コマンドのドキュメントを作成する時 / 使用例を充実させたい時 / トラブルシューティングセクションを追加する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/documentation-guide.md`: セルフドキュメンティング構造とMarkdownセクション構成ガイド（把握する知識: ドキュメンテーションガイド / 自己文書化構造 / Purpose）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: Claude Code 3層アーキテクチャ設計仕様書）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Command Documentation Patterns / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-docs.mjs`: コマンドドキュメントの完全性検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/command-documentation.md`: description/argument-hint/allowed-toolsを含むコマンドテンプレート

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
