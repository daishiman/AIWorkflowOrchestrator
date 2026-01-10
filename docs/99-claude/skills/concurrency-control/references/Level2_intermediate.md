# レベル2: 実務

## 概要

GitHub Actions の並行実行制御を実務で運用するための指針を整理する。

references/・scripts/・assets/ の活用を前提とした運用を整理します。

## 前提条件

- レベル1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: concurrency 構文 / group 設計 / cancel-in-progress / 競合シナリオ

### 判断基準と検証観点
- 回避事項: レースコンディションのパターンを無視しない

### リソース運用
- `references/concurrency-syntax.md`: concurrency 構文の参照（把握する知識: group / cancel-in-progress / 設定例）
- `references/race-conditions.md`: 競合パターンの整理（把握する知識: 競合原因 / 回避策 / 実運用例）
- `references/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 並行実行制御 / 基本設定 / 注意点）

### スクリプト運用
- `scripts/check-concurrency.mjs`: concurrency 設定検証スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `assets/concurrency-workflow.yaml`: 並行実行制御テンプレート

### 成果物要件
- 設定の意図と競合回避方針が明確である

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] 成果物要件を満たしている
