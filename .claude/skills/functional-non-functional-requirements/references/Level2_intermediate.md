# Level 2: Intermediate

## 概要

機能要件と非機能要件の分類と定義スキル。要件を適切なカテゴリに分類し、 漏れなく体系的に管理するための方法論を提供します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 要件分類ガイド / 基本定義 / 機能要件（FR: Functional Requirements） / 非機能要件測定ガイド / 測定の基本原則 / SMART基準
- 実務指針: 要件を機能/非機能に分類する時 / 非機能要件を定義する時 / 品質特性を網羅的に確認する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/classification-guide.md`: classification-guide のガイド（把握する知識: 要件分類ガイド / 基本定義 / 機能要件（FR: Functional Requirements））
- `resources/measurement-guide.md`: measurement-guide のガイド（把握する知識: 非機能要件測定ガイド / 測定の基本原則 / SMART基準）
- `resources/nfr-templates.md`: nfr-templates の詳細ガイド（把握する知識: 非機能要件テンプレート集 / 基本テンプレート / NFR-XXX: [カテゴリ] - [要件名]）
- `resources/quality-attributes.md`: quality-attributes の詳細ガイド（把握する知識: 品質特性カタログ / FURPS+モデル / 1. パフォーマンス（Performance））
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Functional and Non-Functional Requirements / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-nfr-coverage.mjs`: nfrcoverageを検証するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/nfr-definition-template.md`: nfr-definition-template のテンプレート

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
