# Level 2: Intermediate

## 概要

カール・ウィーガーズの要求工学理論に基づく体系的な要件定義スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 曖昧性検出パターンと除去技法 / 曖昧性の5つのパターン / 1. 量的曖昧性 / シナリオ網羅性チェック / 1. 正常系（Happy Path） / 2. 異常系（Error Cases）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/ambiguity-detection.md`: Ambiguity Detectionリソース（把握する知識: 曖昧性検出パターンと除去技法 / 曖昧性の5つのパターン / 1. 量的曖昧性）
- `resources/completeness-checklist.md`: Completeness Checklistリソース（把握する知識: シナリオ網羅性チェック / 1. 正常系（Happy Path） / 2. 異常系（Error Cases））
- `resources/quality-criteria.md`: Quality Criteriaリソース（把握する知識: 要件品質基準 / 5つの品質特性 / 1. 明確性（Clarity））
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件 / 技術スタック仕様書 / アーキテクチャ設計）
- `resources/triage-framework.md`: Triage Frameworkリソース（把握する知識: 要求トリアージフレームワーク / MoSCoW分類法 / Must have（必須））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Requirements Engineering / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-requirements.mjs`: Validate Requirementsスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/requirements-document.md`: Requirements Documentテンプレート

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
