# Level 2: Intermediate

## 概要

コマンドのパフォーマンス最適化を専門とするスキル。 トークン効率化、並列実行の活用、モデル選択の最適化、 実行速度の改善方法を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 実行速度改善 / ボトルネック特定 / 改善手法 / モデル選択 / モデル比較 / 選択基準
- 実務指針: コマンドの実行速度を改善したい時 / トークン使用量を削減したい時 / 並列実行を活用したい時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/execution-speed.md`: キャッシング・早期リターン・遅延実行・バッチ処理による実行速度改善と<5秒目標の測定方法（把握する知識: 実行速度改善 / ボトルネック特定 / 改善手法）
- `resources/model-selection.md`: Haiku(単純)/Sonnet(標準)/Opus(複雑)の選択基準と90%コスト削減のHaiku活用戦略（把握する知識: モデル選択 / モデル比較 / 選択基準）
- `resources/parallel-execution.md`: 独立タスクの並列化条件判定とBranch/Wait/Combineパターンによる並列実行設計（把握する知識: 並列実行 / 基本パターン / Parallel Tasks）
- `resources/token-optimization.md`: description/本文圧縮で73%削減、不要情報削除と箇条書き活用によるトークン最適化技法（把握する知識: トークン最適化 / description圧縮 / 本文圧縮）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Command Performance Optimization / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/analyze-performance.mjs`: パフォーマンス分析スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/optimized-command-template.md`: 最適化コマンドテンプレート
- `templates/parallel-execution-template.md`: 並列実行テンプレート

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
