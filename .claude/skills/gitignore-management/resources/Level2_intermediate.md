# Level 2: Intermediate

## 概要

.gitignore設計と管理スキル。機密ファイルパターン、プロジェクト固有除外、 プラットフォーム別パターン、.gitignore検証手法を提供します。 使用タイミング:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: .gitignore Pattern Library / 環境変数パターン / Secret ファイルパターン / 環境変数管理 / .gitignore Management / 基本構造
- 実務指針: .gitignoreを新規作成する時 / .gitignoreに機密パターンを追加する時 / プロジェクト固有の除外パターンを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/pattern-library.md`: pattern-library の詳細ガイド（把握する知識: .gitignore Pattern Library / 環境変数パターン / Secret ファイルパターン）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 環境変数管理）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: .gitignore Management / 基本構造 / 配置場所）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-gitignore.mjs`: gitignoreを検証するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/gitignore-template.txt`: gitignore-template のテンプレート

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
