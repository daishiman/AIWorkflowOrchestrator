# レベル2: 実務

## 概要

Composite Actions の実務的な設計と運用を整理する。

references/・scripts/・assets/ の活用を前提とした運用を整理します。

## 前提条件

- レベル1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: action.yml 基本構造 / 必須フィールド / 入力設計 / 出力設計 / エラーハンドリング / 再利用性

### 判断基準と検証観点

- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用

- `references/action-syntax.md`: Composite Action 構文リファレンス（把握する知識: action.yml 基本構造 / 必須フィールド）
- `references/best-practices.md`: Composite Actions ベストプラクティス（把握する知識: 設計原則 / 単一責任の原則 / 入力設計）
- `references/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Composite Actions / 基本構造 / 入出力設計）

### スクリプト運用

- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-action.mjs`: Composite Action 構文検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用

- `assets/composite-action/action.yml`: Composite Action テンプレート

### 成果物要件

- 判断根拠と次のアクションが明確な成果物を作る

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] 成果物要件を満たしている
