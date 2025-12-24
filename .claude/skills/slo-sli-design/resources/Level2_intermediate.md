# Level 2: Intermediate

## 概要

SLO/SLI設計とエラーバジェット管理の専門スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: エラーバジェット管理 / エラーバジェットの概念 / 基本的な考え方 / 非機能要件 / SLI設計ガイド / SLI設計の基本原則

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/error-budget-management.md`: Error Budget Managementリソース（把握する知識: エラーバジェット管理 / エラーバジェットの概念 / 基本的な考え方）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件）
- `resources/sli-design-guide.md`: Sli Design Guideリソース（把握する知識: SLI設計ガイド / SLI設計の基本原則 / 原則1: ユーザー中心）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: SLO/SLI Design - サービスレベル目標設計 / 核心概念 / 1. SLI/SLO/SLA の関係）

### スクリプト運用
- `scripts/calculate-error-budget.mjs`: Calculate Error Budgetスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/slo-definition-template.yaml`: Slo Definitionテンプレート

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
