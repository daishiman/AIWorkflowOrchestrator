# Level 2: Intermediate

## 概要

マーティン・ファウラーの『リファクタリング』に基づくコード改善技術を専門とするスキル。 外部から見た振る舞いを変えずに、内部構造を改善する体系的手法を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: コードスメルカタログ / メソッドレベルのスメル / 1. Long Method（長大なメソッド） / Decompose Conditional / 適用条件 / 手順
- 実務指針: メソッドが30行を超える場合 / 同じロジックが複数箇所に重複している場合 / 複雑な条件式（ネスト3段階以上）がある場合

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/code-smells-catalog.md`: コードスメルカタログ（把握する知識: コードスメルカタログ / メソッドレベルのスメル / 1. Long Method（長大なメソッド））
- `resources/decompose-conditional.md`: Decompose Conditional（把握する知識: Decompose Conditional / 適用条件 / 手順）
- `resources/extract-method.md`: Extract Method（把握する知識: Extract Method / 適用条件 / 判断プロセス）
- `resources/introduce-parameter-object.md`: Introduce Parameter Object（把握する知識: Introduce Parameter Object / 適用条件 / 手順）
- `resources/replace-temp-with-query.md`: Replace Temp with Query（把握する知識: Replace Temp with Query / 適用条件 / 手順）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Refactoring Techniques / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/detect-code-smells.mjs`: コードスメル検出スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/refactoring-checklist.md`: リファクタリングチェックリスト

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
