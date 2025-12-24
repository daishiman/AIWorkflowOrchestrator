# Level 2: Intermediate

## 概要

GitHub Actions ワークフローテンプレートの選択、カスタマイズ、生成スキル

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: プロジェクトタイプ別テンプレート選択ガイド / 選択マトリックス / 1. Node.jsプロジェクト / タスク実行仕様書生成ガイド / ============================================================================= / 1. 組織テンプレート (Organization Templates)

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/project-type-selection.md`: Project Type Selectionリソース（把握する知識: プロジェクトタイプ別テンプレート選択ガイド / 選択マトリックス / 1. Node.jsプロジェクト）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: タスク実行仕様書生成ガイド / =============================================================================）
- `resources/template-types.md`: Template Typesリソース（把握する知識: 1. 組織テンプレート (Organization Templates) / 配置場所 / プロパティファイル (.properties.json)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Workflow Templates / スクリプト実行 / 📊 テンプレート選択マトリックス）

### スクリプト運用
- `scripts/generate-workflow.mjs`: Generate Workflowスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/cd-template.yaml`: CD（継続的デプロイ）テンプレート：環境別デプロイ、ヘルスチェック、通知統合
- `templates/ci-template.yaml`: CI（継続的統合）テンプレート：Lint、テスト、ビルド、複数バージョン対応
- `templates/docker-template.yaml`: Dockerテンプレート
- `templates/nodejs-template.yaml`: Nodejsテンプレート

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
