# Level 2: Intermediate

## 概要

React Hooksの高度な使用パターンと最適化技術を専門とするスキル。 ダン・アブラモフの思想に基づき、予測可能で効率的な状態管理を実現します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 依存配列パターン / 基本原則 / 1. 完全性の原則 / Hooks選択ガイド / Hooks比較マトリクス / 状態管理Hooks
- 実務指針: React Hooksの最適な使い分けを判断する時 / useEffectの依存配列を設計する時 / パフォーマンス最適化のためのメモ化戦略を検討する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/dependency-array-patterns.md`: 完全性原則、ESLint準拠、無限ループと古いクロージャ問題の解決法（把握する知識: 依存配列パターン / 基本原則 / 1. 完全性の原則）
- `resources/hooks-selection-guide.md`: Hooks選択ガイド（把握する知識: Hooks選択ガイド / Hooks比較マトリクス / 状態管理Hooks）
- `resources/memoization-strategies.md`: useCallback/useMemo/React.memoの測定駆動最適化と効果的パターン（把握する知識: メモ化戦略 / 基本原則 / 測定優先の原則）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 技術スタック仕様書）
- `resources/use-reducer-patterns.md`: useReducerパターン（把握する知識: useReducerパターン / いつuseReducerを使うか / 適用基準）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: React Hooks Advanced / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-hooks-usage.mjs`: React Hooks使用状況分析スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/custom-hook-template.md`: カスタムフックテンプレート
- `templates/use-reducer-template.md`: useReducerテンプレート

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
