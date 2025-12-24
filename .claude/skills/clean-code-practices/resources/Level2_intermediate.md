# Level 2: Intermediate

## 概要

ロバート・C・マーティン（Uncle Bob）の『Clean Code』に基づくコード品質プラクティスを専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: コメントとドキュメンテーション / 自己文書化コード / 原則 / DRY原則（Don't Repeat Yourself） / DRYが重要な理由 / 変更の容易さ
- 実務指針: コードの命名を改善したい時 / 関数が大きすぎると感じた時 / コードの重複を発見した時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/comments-and-documentation.md`: コメントとドキュメンテーション（把握する知識: コメントとドキュメンテーション / 自己文書化コード / 原則）
- `resources/dry-principle.md`: DRY原則（Do Not Repeat Yourself）（把握する知識: DRY原則（Don't Repeat Yourself） / DRYが重要な理由 / 変更の容易さ）
- `resources/meaningful-names.md`: 意図を明確にする命名・発音しやすい名前・検索しやすい名前の原則と変数/関数/クラス/ブール値の品詞別命名規則（把握する知識: 意味のある命名 / 命名の原則 / 1. 意図を明確にする）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件）
- `resources/small-functions.md`: 5-10行の理想サイズ・単一責任原則・抽象度の統一・パラメータ3つ以下の関数設計ガイドライン（把握する知識: 小さな関数の原則 / サイズのガイドライン / 理想的なサイズ）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Clean Code Practices / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/measure-code-quality.mjs`: コード品質測定スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/code-review-checklist.md`: コードレビューチェックリスト

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
