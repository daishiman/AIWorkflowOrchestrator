# Level 2: Intermediate

## 概要

GitHub Actions 条件付き実行の完全ガイド。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: イベントフィルタリングと条件付きトリガー / イベントフィルタリングの基礎 / ブランチフィルター / ステータス関数 / success() / always()
- 実務指針: ジョブやステップを特定条件下でのみ実行したい時 / 失敗時のクリーンアップ/通知を実装する時 / ブランチ/パス/イベント別に実行を制御する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/event-filtering.md`: event-filtering の詳細ガイド（把握する知識: イベントフィルタリングと条件付きトリガー / イベントフィルタリングの基礎 / ブランチフィルター）
- `resources/if-conditions.md`: if-conditions の詳細ガイド（把握する知識: ステータス関数 / success() / always()）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: GitHub Actions Conditional Execution / ステータス関数 / 一般的な if パターン）

### スクリプト運用
- `scripts/analyze-conditions.mjs`: conditionsを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/conditional-workflow.yaml`: conditional-workflow のテンプレート

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
