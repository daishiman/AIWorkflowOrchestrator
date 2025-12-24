# Level 2: Intermediate

## 概要

Composite Actionsのスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Composite Action 構文リファレンス / action.yml 基本構造 / 必須フィールド / 設計原則 / 単一責任の原則 / 入力の設計

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/action-syntax.md`: Composite Action 構文リファレンス（把握する知識: Composite Action 構文リファレンス / action.yml 基本構造 / 必須フィールド）
- `resources/best-practices.md`: Composite Actions ベストプラクティス（把握する知識: 設計原則 / 単一責任の原則 / 入力の設計）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Composite Actions / 基本的なaction.yml / 入力と出力）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-action.mjs`: Composite Action Validator
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- テンプレートはありません

### 成果物要件
- 判断根拠と次のアクションが明確な成果物を作る

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] 成果物要件を満たしている
