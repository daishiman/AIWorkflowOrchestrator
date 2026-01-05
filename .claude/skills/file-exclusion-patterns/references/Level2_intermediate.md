# Level 2: Intermediate

## 概要

ファイル監視システムにおける効率的な除外パターン設計の専門知識。 .gitignore互換のglob pattern、プラットフォーム固有の一時ファイル除外、 パフォーマンス最適化のための早期除外戦略を提供。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 標準除外パターンカタログ / カテゴリ別パターン一覧 / 1. パッケージマネージャー / File Exclusion Patterns / 核心概念 / Glob Patternの基本
- 実務指針: ファイル監視の除外パターンを設計する時 / .gitignoreからパターンを抽出・変換する時 / 一時ファイル・システムファイルを除外したい時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/standard-patterns.md`: standard-patterns のパターン集（把握する知識: 標準除外パターンカタログ / カテゴリ別パターン一覧 / 1. パッケージマネージャー）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: File Exclusion Patterns / 核心概念 / Glob Patternの基本）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/pattern-builder.ts`: pattern-builder のテンプレート

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
