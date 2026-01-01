# Level 2: Intermediate

## 概要

GitHub Actions ワークフロー構文の完全リファレンス。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: pushイベント / pull_requestイベント / pull_requestのtypes / ジョブ基本構造 / runs-on オプション / GitHub-hosted ランナー
- 実務指針: ワークフローファイル(.github/workflows/*.yml)を作成・編集する時 / イベントトリガーを設定する時 / ジョブやステップの構文エラーを解決する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/event-triggers.md`: event-triggers の詳細ガイド（把握する知識: pushイベント / pull_requestイベント / pull_requestのtypes）
- `resources/jobs-and-steps.md`: jobs-and-steps の詳細ガイド（把握する知識: ジョブ基本構造 / runs-on オプション / GitHub-hosted ランナー）
- `resources/permissions-and-env.md`: permissions-and-env の詳細ガイド（把握する知識: パーミッション設定 / ジョブレベル / 全権限無効化）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: デプロイメント (Deployment)）
- `resources/workflow-syntax-reference.md`: workflow-syntax-reference のリファレンス（把握する知識: GitHub Actions Workflow Syntax Complete Reference / 目次 / トップレベル構文）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: GitHub Actions Workflow Syntax / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/validate-workflow.mjs`: ワークフローを検証するスクリプト

### テンプレート運用
- `templates/workflow-template.yaml`: workflow-template のテンプレート

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
