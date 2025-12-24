# Level 2: Intermediate

## 概要

コマンドのセキュリティ設計を専門とするスキル。 allowed-toolsによるツール制限、disable-model-invocationによる自動実行防止、 機密情報保護の実装方法を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: セキュリティガイドライン / allowed-tools でツール制限 / disable-model-invocation / Command Security Design / リソース構造 / リソース種別
- 実務指針: 破壊的な操作を行うコマンドを作成する時 / ツール使用を制限したい時 / 機密情報の誤コミットを防ぐチェックを実装する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/security-guidelines.md`: セキュリティガイドライン（把握する知識: セキュリティガイドライン / allowed-tools でツール制限 / disable-model-invocation）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Command Security Design / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/audit-security.mjs`: セキュリティ監査スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/secure-command.md`: セキュアコマンドテンプレート

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
