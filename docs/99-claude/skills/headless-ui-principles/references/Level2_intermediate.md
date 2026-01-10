# Level 2: Intermediate

## 概要

ヘッドレスUIアーキテクチャとスタイル非依存コンポーネント設計の専門知識。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: WAI-ARIA パターン実装ガイド / 主要なARIAパターン / 1. Dialog（モーダル） / アーキテクチャ層 / レイヤー構造 / 各層の責任
- 実務指針: カスタムデザインシステムを構築する時 / 完全なスタイル制御が必要な時 / 再利用可能なUI ロジックを抽出する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/aria-patterns.md`: WAI-ARIAパターン実装ガイド（把握する知識: WAI-ARIA パターン実装ガイド / 主要なARIAパターン / 1. Dialog（モーダル））
- `resources/headless-architecture.md`: ヘッドレスアーキテクチャ詳細（把握する知識: アーキテクチャ層 / レイヤー構造 / 各層の責任）
- `resources/library-comparison.md`: Radix UI/Headless UI/React Aria/Downshift/Ariakitの特徴・評価・選択ガイド（把握する知識: ヘッドレスUIライブラリ比較 / ライブラリ一覧 / 1. Radix UI）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: .claude/skills/headless-ui-principles/SKILL.md / 目的 / 対象者）

### スクリプト運用
- `scripts/check-a11y.mjs`: a11yを検証するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/headless-component-template.tsx`: コンポーネントテンプレート
- `templates/headless-hook-template.ts`: カスタムフックテンプレート

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
