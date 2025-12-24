# Level 2: Intermediate

## 概要

ドキュメント構造設計、リソース分割、階層設計を専門とするスキル。 500行制約に基づく適切なファイル分割とトピックベース組織化により、 保守性と発見可能性の高いドキュメントアーキテクチャを実現します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: resources/ / scripts/ / templates/ / 階層設計ガイド / 設計原則 / 原則2: 階層の深さ制限
- 実務指針: リソースファイルの分割戦略を決定する時 / ドキュメントの階層構造を設計する時 / 情報の発見可能性を向上させる時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/directory-organization.md`: directory-organization の詳細ガイド（把握する知識: resources/ / scripts/ / templates/）
- `resources/hierarchy-design.md`: hierarchy-design の詳細ガイド（把握する知識: 階層設計ガイド / 設計原則 / 原則2: 階層の深さ制限）
- `resources/naming-conventions.md`: naming-conventions の詳細ガイド（把握する知識: 命名規則ガイド / ファイル命名パターン / パターン1: トピック別）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 技術スタック仕様書 / 用語集 (Glossary) / 統合システム設計仕様書：Universal AI Workflow Orchestrator）
- `resources/splitting-patterns.md`: splitting-patterns のパターン集（把握する知識: 4つの分割パターン / パターン1: トピック別分割 / パターン2: レベル別分割）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Documentation Architecture / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/analyze-structure.mjs`: structureを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/resource-structure.md`: resource-structure のテンプレート

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
