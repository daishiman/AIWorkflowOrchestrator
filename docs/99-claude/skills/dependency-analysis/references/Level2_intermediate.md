# Level 2: Intermediate

## 概要

ソフトウェアの依存関係分析と循環参照検出を専門とするスキル。 依存関係グラフの構築、循環依存の検出、安定度メトリクスの算出により、 アーキテクチャの健全性を評価します。

references/・scripts/・assets/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 循環依存の検出と解消 / 循環依存とは / 問題点 / 依存グラフ構築 / グラフの種類 / モジュール依存グラフ
- 実務指針: モジュール間の依存関係を可視化する時 / 循環参照を検出・解消する時 / アーキテクチャの安定性を評価する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `references/circular-dependency.md`: circular-dependency の詳細ガイド（把握する知識: 循環依存の検出と解消 / 循環依存とは / 問題点）
- `references/dependency-graph.md`: dependency-graph の詳細ガイド（把握する知識: 依存グラフ構築 / グラフの種類 / モジュール依存グラフ）
- `references/stability-metrics.md`: stability-metrics の詳細ガイド（把握する知識: 安定度メトリクス / 主要メトリクス / 1. Instability（不安定度））
- `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
- `references/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Dependency Analysis / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-dependencies.mjs`: 依存関係を分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### アセット運用
- `assets/dependency-analysis-checklist.md`: 要件整理チェックリスト
- `assets/dependency-report.md`: dependency-report のテンプレート
- `assets/graph-visualization-template.md`: 可視化テンプレート

### 成果物要件
- アセットの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. アセットを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] アセットで成果物の形式を揃えた
