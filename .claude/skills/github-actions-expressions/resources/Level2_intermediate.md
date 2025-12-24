# Level 2: Intermediate

## 概要

GitHub Actionsのワークフローで使用できる式構文とコンテキストオブジェクトを専門とするスキル。 ${{ }}構文、演算子、リテラル、組み込み関数、および利用可能なすべてのコンテキスト（github, env, job, steps, runner, secrets, needs, matrix, inputs）を提供します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 組み込み関数 / 文字列関数 / contains / ブランチベースの条件付き実行 / メインブランチのみで実行 / 複数ブランチで実行
- 実務指針: ワークフローで条件付き実行（if:）を設定する時 / ステップ出力を参照したり、動的に値を生成する時 / コンテキスト情報（ブランチ名、コミットSHA、イベントタイプ）を使用する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/builtin-functions.md`: builtin-functions の詳細ガイド（把握する知識: 組み込み関数 / 文字列関数 / contains）
- `resources/conditional-patterns.md`: conditional-patterns のパターン集（把握する知識: ブランチベースの条件付き実行 / メインブランチのみで実行 / 複数ブランチで実行）
- `resources/context-objects.md`: context-objects の詳細ガイド（把握する知識: コンテキストオブジェクト / 主要コンテキスト一覧 / github コンテキスト）
- `resources/expression-syntax.md`: expression-syntax の詳細ガイド（把握する知識: 式の基本構文 / `${{ }}` 構文 / 式の省略形）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: GitHub Actions Expressions / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-expressions.mjs`: expressionsを検証するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/expression-examples.yaml`: expression-examples のテンプレート

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
