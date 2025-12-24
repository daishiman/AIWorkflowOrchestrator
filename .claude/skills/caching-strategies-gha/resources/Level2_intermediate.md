# Level 2: Intermediate

## 概要

GitHub Actions ワークフロー高速化のためのキャッシング戦略。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: actions/cache 完全リファレンス / 基本構文 / `path` (必須) / キャッシュ最適化戦略 / キャッシュヒット率の最適化 / キーデザイン戦略
- 実務指針: ワークフローのビルド時間を短縮したい時 / 依存関係のインストール時間を削減したい時 / Dockerビルドを高速化したい時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/cache-action.md`: actions/cache 完全リファレンス（把握する知識: actions/cache 完全リファレンス / 基本構文 / `path` (必須)）
- `resources/cache-optimization.md`: キャッシュ最適化戦略（把握する知識: キャッシュ最適化戦略 / キャッシュヒット率の最適化 / キーデザイン戦略）
- `resources/cache-patterns.md`: 言語別キャッシュパターン（把握する知識: 言語別キャッシュパターン / Node.js / pnpm）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: GitHub Actions Caching Strategies / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/estimate-cache-size.mjs`: GitHub Actions キャッシュサイズ見積もりツール
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/cache-examples.yaml`: GitHub Actions キャッシュ設定例集

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
