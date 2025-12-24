# Level 2: Intermediate

## 概要

一貫性と拡張性を両立するデザインシステムの基盤設計を専門とするスキル。 Diana MounterやBrad Frostのデザインシステム思想に基づき、 デザイントークン管理、コンポーネント規約策定、Figma/コード統合を実現します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: コンポーネント階層設計ガイド / 階層モデル / 4層構造 / トークン階層モデル / なぜ3層構造が必要か / カテゴリ別トークン設計
- 実務指針: デザインシステムの新規構築時 / デザイントークンの定義・拡張時 / コンポーネントライブラリの規約策定時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/component-hierarchy.md`: component-hierarchy の詳細ガイド（把握する知識: コンポーネント階層設計ガイド / 階層モデル / 4層構造）
- `resources/design-tokens-guide.md`: design-tokens-guide のガイド（把握する知識: トークン階層モデル / なぜ3層構造が必要か / カテゴリ別トークン設計）
- `resources/figma-code-sync.md`: figma-code-sync の詳細ガイド（把握する知識: Figma連携戦略ガイド / Figma側の設定 / Variables構造）
- `resources/naming-conventions.md`: naming-conventions の詳細ガイド（把握する知識: 命名規則とファイル構造ガイド / コンポーネント命名規則 / 基本ルール）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: UI/UX ガイドライン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Design System Architecture / リソース構造 / リソース種別）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/validate-tokens.mjs`: tokensを検証するスクリプト

### テンプレート運用
- `templates/component-spec-template.md`: component-spec-template のテンプレート
- `templates/design-tokens-template.json`: design-tokens-template のテンプレート

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
