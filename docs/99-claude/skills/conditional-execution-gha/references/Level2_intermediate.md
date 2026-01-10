# レベル2: 実務

## 概要

GitHub Actions の条件付き実行を実務で運用するための指針を整理する。

references/・scripts/・assets/ の活用を前提とした運用を整理します。

## 前提条件

- レベル1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: イベントフィルタリング / ブランチ・パス制御 / status functions / success() / always() / failure()
- 実務指針: 条件付き実行で不要なジョブを抑制する時 / 失敗時のクリーンアップや通知を実装する時 / ブランチ別の実行制御を行う時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `references/event-filtering.md`: event filtering の詳細ガイド（把握する知識: イベントフィルタリング / ブランチ・パス制御）
- `references/if-conditions.md`: if 条件の詳細ガイド（把握する知識: status functions / success() / always() / failure()）
- `references/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Conditional Execution / 状態関数 / 一般的なifパターン）

### スクリプト運用
- `scripts/analyze-conditions.mjs`: 条件式を分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `assets/conditional-workflow.yaml`: 条件付き実行テンプレート

### 成果物要件
- 条件分岐の意図と影響範囲が明確である

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
