# Level 2: Intermediate

## 概要

GitHub ActionsにおけるDockerイメージのビルドとプッシュの専門知識。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: docker/build-push-action 完全構文リファレンス / 基本構文 / 必須パラメータ / コンテナレジストリ認証パターン / GitHub Container Registry (GHCR) / 標準認証（推奨）
- 実務指針: Dockerイメージをビルド・プッシュするワークフローを作成する時 / マルチプラットフォーム対応のイメージを構築する時 / コンテナレジストリへの認証を設定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/build-push-syntax.md`: build-push-syntax の詳細ガイド（把握する知識: docker/build-push-action 完全構文リファレンス / 基本構文 / 必須パラメータ）
- `resources/registry-auth.md`: registry-auth の詳細ガイド（把握する知識: コンテナレジストリ認証パターン / GitHub Container Registry (GHCR) / 標準認証（推奨））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Docker Build/Push Action / リソース構造 / クイックスタート）

### スクリプト運用
- `scripts/analyze-dockerfile.mjs`: dockerfileを分析するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/docker-workflow.yaml`: docker-workflow のテンプレート

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
