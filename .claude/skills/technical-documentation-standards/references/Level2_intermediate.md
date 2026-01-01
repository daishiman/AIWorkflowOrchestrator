# Level 2: Intermediate

## 概要

IEEE 830、Documentation as Code、DRY原則に基づく技術文書化標準の専門スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 曖昧表現の検出と改善 / 程度を表す曖昧表現 / 条件を表す曖昧表現 / Documentation as Codeプラクティス / 基本原則 / 1. プレーンテキスト形式

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/clarity-checklist.md`: Clarity Checklistリソース（把握する知識: 曖昧表現の検出と改善 / 程度を表す曖昧表現 / 条件を表す曖昧表現）
- `resources/doc-as-code.md`: Doc As Codeリソース（把握する知識: Documentation as Codeプラクティス / 基本原則 / 1. プレーンテキスト形式）
- `resources/dry-for-documentation.md`: Dry For Documentationリソース（把握する知識: DRY原則の文書適用 / DRY原則の本質 / DRY違反のパターン）
- `resources/ieee-830-overview.md`: Ieee 830 Overviewリソース（把握する知識: IEEE 830準拠ガイド / IEEE 830の品質特性 / 1. 正確性（Correct））
- `resources/verification-patterns.md`: Verification Patternsリソース（把握する知識: 検証可能な記述パターン / 検証可能性の原則 / 検証可能な要件の特徴）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Technical Documentation Standards / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-dry-violations.mjs`: Check Dry Violationsスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/srs-template.md`: IEEE 830準拠のソフトウェア要件仕様書テンプレート（構造化・検証可能記述）

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
