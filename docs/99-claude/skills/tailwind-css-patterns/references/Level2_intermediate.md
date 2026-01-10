# Level 2: Intermediate

## 概要

Tailwind CSSを活用した効率的で保守性の高いスタイリングパターンの専門知識。 Class Variance Authority (CVA)、Tailwind Merge、レスポンシブデザイン、 ダークモード対応の実装パターンを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 基本使用法 / インストール / 基本構造 / ダークモード実装ガイド / 実装方法 / 1. クラスベース（推奨）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/cva-guide.md`: CVA Guideリソース（把握する知識: 基本使用法 / インストール / 基本構造）
- `resources/dark-mode-guide.md`: Dark Mode Guideリソース（把握する知識: ダークモード実装ガイド / 実装方法 / 1. クラスベース（推奨））
- `resources/responsive-patterns.md`: Responsive Patternsリソース（把握する知識: レスポンシブデザインパターン / ブレークポイント / デフォルトブレークポイント）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: .claude/skills/tailwind-css-patterns/SKILL.md / 目的 / 対象者）

### スクリプト運用
- `scripts/analyze-tailwind.mjs`: Analyze Tailwindスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/component-variants-template.tsx`: Component Variantsテンプレート
- `templates/tailwind-config-template.js`: Tailwind Configテンプレート

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
