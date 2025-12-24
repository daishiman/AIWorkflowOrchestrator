# Level 2: Intermediate

## 概要

GitHub Actionsの並列ジョブ実行とジョブ依存関係管理のスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Data Passing Between Jobs - GitHub Actions / データ受け渡しの方法 / Outputsを使用したデータ受け渡し / Job Dependencies - GitHub Actions / needs構文の基本 / 単一依存関係

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/data-passing.md`: ジョブ間のデータ受け渡し手法（outputs、artifacts、cache活用パターン）（把握する知識: Data Passing Between Jobs - GitHub Actions / データ受け渡しの方法 / Outputsを使用したデータ受け渡し）
- `resources/job-dependencies.md`: needs構文による依存関係グラフと実行順序制御パターン（把握する知識: Job Dependencies - GitHub Actions / needs構文の基本 / 単一依存関係）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: データ受け渡しパターン（outputs、artifacts） / スクリプト実行 / 並列ジョブの基本パターン）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/visualize-deps.mjs`: ワークフロー内ジョブ依存関係をMermaid形式で可視化

### テンプレート運用
- `templates/parallel-workflow.yaml`: 並列実行、依存関係、データ共有を含むGitHub Actionsワークフローテンプレート

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
