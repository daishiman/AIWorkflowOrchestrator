# Level 2: Intermediate

## 概要

ドメイン駆動設計におけるユビキタス言語の確立と適用を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 用語集の維持管理 / 用語集の構成要素 / 必須項目 / コードの命名規則 / 基本原則 / 1. ドメイン用語をそのまま使用

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/glossary-maintenance.md`: Glossary Maintenanceリソース（把握する知識: 用語集の維持管理 / 用語集の構成要素 / 必須項目）
- `resources/naming-conventions.md`: Naming Conventionsリソース（把握する知識: コードの命名規則 / 基本原則 / 1. ドメイン用語をそのまま使用）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 用語集 (Glossary)）
- `resources/terminology-extraction.md`: Terminology Extractionリソース（把握する知識: 用語抽出の手法 / 用語抽出の情報源 / 1. ドメインエキスパートとの対話）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Ubiquitous Language / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-terminology.mjs`: Analyze Terminologyスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/domain-glossary-template.md`: Domain Glossaryテンプレート

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
