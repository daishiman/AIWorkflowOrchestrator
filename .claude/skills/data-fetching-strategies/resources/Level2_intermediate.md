# Level 2: Intermediate

## 概要

Reactにおけるデータフェッチとキャッシュのベストプラクティスを専門とするスキル。 SWR、React Queryを活用した効率的なサーバー状態管理を提供します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: キャッシュパターン / stale-while-revalidate戦略 / 基本概念 / エラー・ローディング状態管理 / 状態の種類 / 基本状態
- 実務指針: データフェッチライブラリを選定する時 / キャッシュ戦略を設計する時 / 楽観的更新を実装する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/caching-patterns.md`: caching-patterns のパターン集（把握する知識: キャッシュパターン / stale-while-revalidate戦略 / 基本概念）
- `resources/error-loading-states.md`: error-loading-states の詳細ガイド（把握する知識: エラー・ローディング状態管理 / 状態の種類 / 基本状態）
- `resources/library-comparison.md`: library-comparison の詳細ガイド（把握する知識: ライブラリ比較: SWR vs React Query / 比較表 / 基本情報）
- `resources/optimistic-updates.md`: optimistic-updates の詳細ガイド（把握する知識: 楽観的更新パターン / 基本フロー / React Query での実装）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Data Fetching Strategies / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-data-fetching.mjs`: datafetchingを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/react-query-hook-template.md`: react-query-hook-template のテンプレート
- `templates/swr-hook-template.md`: swr-hook-template のテンプレート

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
