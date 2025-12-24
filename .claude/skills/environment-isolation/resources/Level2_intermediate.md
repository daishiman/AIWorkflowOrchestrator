# Level 2: Intermediate

## 概要

環境分離とアクセス制御スキル。開発・ステージング・本番環境の 厳格な分離、環境間Secret共有の防止、最小権限の徹底を提供します。 使用タイミング:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Environment Validation Guide / 起動時検証 / 必須環境変数チェック / 環境変数管理 / Environment Isolation & Access Control / 環境分離の 4 レベル
- 実務指針: 環境分離戦略を設計する時 / dev/staging/prod環境のSecret管理を分離する時 / 環境間のアクセス制御を設定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/environment-validation.md`: environment-validation の詳細ガイド（把握する知識: Environment Validation Guide / 起動時検証 / 必須環境変数チェック）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 環境変数管理）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Environment Isolation & Access Control / 環境分離の 4 レベル / レベル 1: 物理的分離）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-environment.mjs`: environmentを検証するスクリプト
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
