# Level 2: Intermediate

## 概要

GitHub Actions の並行実行制御を設計し、レースコンディションを防止するスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Concurrency Syntax Reference / 基本構文 / concurrency オブジェクト / Race Conditions Prevention Guide / レースコンディションとは / 典型的な問題シナリオ

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/concurrency-syntax.md`: groupとcancel-in-progressの詳細構文リファレンス（把握する知識: Concurrency Syntax Reference / 基本構文 / concurrency オブジェクト）
- `resources/race-conditions.md`: レースコンディション防止パターンとベストプラクティス（把握する知識: Race Conditions Prevention Guide / レースコンディションとは / 典型的な問題シナリオ）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: レースコンディション防止パターン / スクリプト実行 / 並行実行制御の基本パターン）

### スクリプト運用
- `scripts/check-concurrency.mjs`: 並行実行設定の検証スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/concurrency-workflow.yaml`: 並行実行制御のワークフロー実装例

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
