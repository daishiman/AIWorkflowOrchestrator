# Level 2: Intermediate

## 概要

コマンド引数システム（$ARGUMENTS、位置引数）を専門とするスキル。 引数の渡し方、検証、デフォルト値、エラーメッセージ設計を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 引数システムリファレンス / $ARGUMENTS / 位置引数 ($1, $2, ...) / Command Arguments System / リソース構造 / リソース種別
- 実務指針: コマンドに引数を追加する時 / 引数検証ロジックを実装する時 / デフォルト値やエラーメッセージを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/arguments-reference.md`: コマンド引数システム完全リファレンス（把握する知識: 引数システムリファレンス / $ARGUMENTS / 位置引数 ($1, $2, ...)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Command Arguments System / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-arguments.mjs`: $ARGUMENTS・位置引数($1,$2...)・argument-hint整合性・引数検証ロジックの自動検証
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/command-with-args.md`: 引数付きコマンドテンプレート

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
