# Level 2: Intermediate

## 概要

トークン使用量の最小化と必要情報の効率的抽出を専門とするスキル。 遅延読み込み、インデックス駆動設計、圧縮と精錬により、 コンテキストウィンドウを最適活用します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 圧縮テクニック / 原則 / テクニック / インデックス駆動設計 / SKILL.mdの役割 / 遅延読み込みパターン
- 実務指針: トークン使用量を削減する必要がある時 / 大量の情報を効率的に提供したい時 / コンテキスト汚染を防ぎたい時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/compression-techniques.md`: compression-techniques の詳細ガイド（把握する知識: 圧縮テクニック / 原則 / テクニック）
- `resources/index-driven-design.md`: index-driven-design の詳細ガイド（把握する知識: インデックス駆動設計 / 原則 / SKILL.mdの役割）
- `resources/lazy-loading-patterns.md`: lazy-loading-patterns のパターン集（把握する知識: 遅延読み込みパターン / 原則 / 実装パターン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Context Optimization / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/estimate-tokens.mjs`: estimatetokensを処理するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
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
