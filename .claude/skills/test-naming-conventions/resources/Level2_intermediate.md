# Level 2: Intermediate

## 概要

テストの命名規則とドキュメンテーションを専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: describe構造 / 基本構造 / クラス/モジュール → メソッド → シナリオ / ファイル構成 / ファイル命名規則 / 基本パターン

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/describe-structure.md`: Describe Structureリソース（把握する知識: describe構造 / 基本構造 / クラス/モジュール → メソッド → シナリオ）
- `resources/file-organization.md`: File Organizationリソース（把握する知識: ファイル構成 / ファイル命名規則 / 基本パターン）
- `resources/naming-patterns.md`: Naming Patternsリソース（把握する知識: 命名パターン一覧 / Should形式 / 基本構文）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Test Naming Conventions / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/test-name-linter.mjs`: Test Name Linterスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/naming-guide.md`: Naming Guideテンプレート

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
