# Level 2: Intermediate

## 概要

Electronアプリケーションのビルド・パッケージング専門知識

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: コード署名ガイド / なぜコード署名が必要か / macOS署名 / 技術スタック仕様書 / .claude/skills/electron-packaging/SKILL.md / 目的
- 実務指針: Electronアプリをビルドする時 / 配布用パッケージを作成する時 / コード署名を設定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/code-signing.md`: コード署名ガイド（把握する知識: コード署名ガイド / なぜコード署名が必要か / macOS署名）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 技術スタック仕様書）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: .claude/skills/electron-packaging/SKILL.md / 目的 / 対象者）

### スクリプト運用
- `scripts/generate-icons.mjs`: iconsを生成するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/electron-builder.yml`: ビルド設定テンプレート

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
