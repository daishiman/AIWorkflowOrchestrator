# Level 2: Intermediate

## 概要

GitHub Actions の environments を設計し、承認フローと保護ルールを安全に運用するスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Approval Workflows / 承認フローの基本 / 承認が必要になるタイミング / Environment Configuration / 環境の作成 / Repository Settings での設定

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/approval-workflows.md`: 承認者設定、待機タイマー、デプロイゲートの実装パターン（把握する知識: Approval Workflows / 承認フローの基本 / 承認が必要になるタイミング）
- `resources/environment-config.md`: 環境設定、保護ルール、シークレット管理の詳細ガイド（把握する知識: Environment Configuration / 環境の作成 / Repository Settings での設定）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: デプロイメント (Deployment)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 使用タイミング / テンプレート使用 / スクリプト実行）

### スクリプト運用
- `scripts/check-environment.mjs`: 環境ステータスと設定を確認する診断スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/deployment-workflow.yaml`: 複数環境への段階的デプロイの実装サンプル

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
