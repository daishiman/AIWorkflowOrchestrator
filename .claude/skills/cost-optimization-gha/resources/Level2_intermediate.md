# Level 2: Intermediate

## 概要

GitHub Actions ワークフローのコスト最適化戦略。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 実行時間削減戦略 / 主要な戦略 / 1. ジョブの並列化 / ランナーコスト最適化 / ランナー価格表 / GitHub-hosted ランナー
- 実務指針: GitHub Actions の実行コストを削減したい時 / 月次請求額を最適化したい時 / ランナーの使用時間を短縮したい時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/execution-time.md`: execution-time の詳細ガイド（把握する知識: 実行時間削減戦略 / 主要な戦略 / 1. ジョブの並列化）
- `resources/runner-costs.md`: runner-costs の詳細ガイド（把握する知識: ランナーコスト最適化 / ランナー価格表 / GitHub-hosted ランナー）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: GitHub Actions Cost Optimization / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/estimate-costs.mjs`: estimatecostsを処理するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/optimized-workflow.yaml`: optimized-workflow のテンプレート

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
