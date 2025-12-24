# Level 2: Intermediate

## 概要

セマンティックバージョニング（semver）に基づく依存関係変更の影響予測と対応戦略を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 破壊的変更の検出と対応 / 破壊的変更の種類 / 1. API変更 / バージョン移行戦略 / 移行戦略の種類 / 1. 段階的移行（Incremental Migration）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/breaking-change-detection.md`: Breaking Change Detectionリソース（把握する知識: 破壊的変更の検出と対応 / 破壊的変更の種類 / 1. API変更）
- `resources/migration-strategies.md`: Migration Strategiesリソース（把握する知識: バージョン移行戦略 / 移行戦略の種類 / 1. 段階的移行（Incremental Migration））
- `resources/semver-specification.md`: Semver Specificationリソース（把握する知識: セマンティックバージョニング 2.0.0 / バージョン形式 / 各要素の意味）
- `resources/version-range-patterns.md`: Version Range Patternsリソース（把握する知識: バージョン範囲指定パターン / パターン一覧 / 1. キャレット (^) - 推奨デフォルト）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Semantic Versioning / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-version-impact.mjs`: Analyze Version Impactスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/upgrade-assessment-template.md`: Upgrade Assessmentテンプレート

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
