# Level 2: Intermediate

## 概要

プロジェクトリスクの識別、評価、軽減戦略の体系的手法。 プロアクティブなリスク管理により、プロジェクトの成功確率を最大化します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: リスク分析フレームワーク / 1. 確率・影響度マトリクス / マトリクス構造 / リスク分析手法 / 確率・影響度マトリクス / 基本フレームワーク
- 実務指針: プロジェクト開始時のリスク評価 / スプリント計画でのリスク特定 / アーキテクチャ決定時の影響分析

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/risk-analysis-framework.md`: risk-analysis-framework の詳細ガイド（把握する知識: リスク分析フレームワーク / 1. 確率・影響度マトリクス / マトリクス構造）
- `resources/risk-analysis.md`: 確率・影響度マトリクス、EMV分析、モンテカルロシミュレーション等の分析手法詳細（把握する知識: リスク分析手法 / 確率・影響度マトリクス / 基本フレームワーク）
- `resources/risk-identification-guide.md`: risk-identification-guide のガイド（把握する知識: リスク識別ガイド / リスク識別の目的 / 1. ブレインストーミング手法）
- `resources/risk-identification.md`: リスク識別手法（ブレインストーミング、SWOT、チェックリスト、デルファイ法等）の詳細ガイド（把握する知識: リスク識別手法 / ブレインストーミング手法 / カテゴリー別リスク探索）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: いつ使うか / リスク管理フレームワーク / リスク識別）

### スクリプト運用
- `scripts/calculate-risk-score.mjs`: リスクスコア・EMV自動計算ツール（Node.js実行可能）
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/risk-register-template.md`: risk-register-template のテンプレート
- `templates/risk-register.md`: リスクレジスター標準テンプレート（評価、対応策、監視計画含む）

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
