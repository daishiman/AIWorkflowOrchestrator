# Level 2: Intermediate

## 概要

コンテナ化とDockerのベストプラクティスを専門とするスキル。 効率的なDockerfile、イメージ最適化、セキュリティ対策を提供します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Dockerfile 最適化 / ベースイメージ選択 / Node.js イメージ比較 / イメージセキュリティ / 非rootユーザー / なぜ重要か
- 実務指針: Dockerfileを作成・最適化する時 / コンテナイメージサイズを削減したい時 / コンテナセキュリティを強化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/dockerfile-optimization.md`: dockerfile-optimization の詳細ガイド（把握する知識: Dockerfile 最適化 / ベースイメージ選択 / Node.js イメージ比較）
- `resources/image-security.md`: image-security の詳細ガイド（把握する知識: イメージセキュリティ / 非rootユーザー / なぜ重要か）
- `resources/local-development.md`: local-development の詳細ガイド（把握する知識: ローカル開発環境 / docker-compose 基本 / 基本構成）
- `resources/multi-stage-builds.md`: multi-stage-builds の詳細ガイド（把握する知識: マルチステージビルド / 基本概念 / 従来のビルド）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Docker Best Practices / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-image.mjs`: imageを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/docker-compose-template.yml`: docker-compose-template のテンプレート
- `templates/nodejs-dockerfile-template.dockerfile`: nodejs-dockerfile-template のテンプレート

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
