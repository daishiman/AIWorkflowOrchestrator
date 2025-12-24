# Level 2: Intermediate

## 概要

コード静的解析によるセキュリティ脆弱性検出のベストプラクティスを提供します。 SAST（Static Application Security Testing）ツール、パターンベース検出、 データフロー分析によるSQLインジェクション、XSS、コマンドインジェクション、

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: インジェクション脆弱性検出パターン / SQLインジェクション / 検出パターン / Code Static Analysis Security / 1. SQLインジェクション検出
- 実務指針: コードレビュー時のセキュリティチェック / SQLインジェクション、XSS検出時 / センシティブデータ露出の検出時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/injection-patterns.md`: SQL/XSS/コマンドインジェクションの検出パターンと正規表現（把握する知識: インジェクション脆弱性検出パターン / SQLインジェクション / 検出パターン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Code Static Analysis Security / 1. SQLインジェクション検出 / 検出パターン）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/scan-sql-injection.mjs`: SQLインジェクション脆弱性の自動スキャンスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/sast-config-template.json`: ESLint Securityプラグイン等のSAST設定テンプレート

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
