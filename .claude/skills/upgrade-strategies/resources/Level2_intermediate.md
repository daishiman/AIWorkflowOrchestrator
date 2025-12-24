# Level 2: Intermediate

## 概要

依存関係の安全なアップグレード戦略と段階的更新手法を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 自動化パターン / Dependabot設定 / 基本設定 / ロールバック手順 / ロールバックの種類 / 1. 即時ロールバック（開発環境）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/automation-patterns.md`: Automation Patternsリソース（把握する知識: 自動化パターン / Dependabot設定 / 基本設定）
- `resources/rollback-procedures.md`: Rollback Proceduresリソース（把握する知識: ロールバック手順 / ロールバックの種類 / 1. 即時ロールバック（開発環境））
- `resources/strategy-selection-guide.md`: Strategy Selection Guideリソース（把握する知識: 戦略選択ガイド / 戦略選択マトリックス / 更新タイプ × 条件）
- `resources/tdd-integration.md`: Tdd Integrationリソース（把握する知識: TDD統合パターン / TDDアップグレードの原則 / Red-Green-Refactor サイクルの適用）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Upgrade Strategies / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-upgrades.mjs`: Check Upgradesスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/upgrade-plan-template.md`: Upgrade Planテンプレート

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
