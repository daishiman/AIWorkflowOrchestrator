# レベル2: 実務

## 概要

トークン使用量の最小化と必要情報の効率的抽出を実務で運用するための指針を整理する。

references/・scripts/・assets/ の活用を前提とした運用を整理します。

## 前提条件

- レベル1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: 圧縮テクニック / インデックス駆動設計 / 遅延読み込み / 重要度スコア
- 実務指針: トークン使用量の削減 / 大量情報の抽出 / コンテキスト汚染の防止

### 判断基準と検証観点

- 回避事項: 無関係な情報を混入させない

### リソース運用

- `references/compression-techniques.md`: 圧縮テクニックの詳細ガイド（把握する知識: 原則 / テクニック / 適用順序）
- `references/index-driven-design.md`: インデックス駆動設計の詳細ガイド（把握する知識: インデックス設計 / SKILL.mdの役割）
- `references/lazy-loading-patterns.md`: 遅延読み込みパターン集（把握する知識: 遅延読み込みパターン / 実装パターン）
- `references/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Context Optimization / リソース構造 / リソース種別）

### スクリプト運用

- `scripts/estimate-tokens.mjs`: トークン見積もりスクリプト
- `scripts/estimate-tokens.sh`: 簡易見積もりスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用

- `assets/context-summary-template.md`: コンテキスト整理テンプレート

### 成果物要件

- 判断根拠と次のアクションが明確な成果物を作る

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
