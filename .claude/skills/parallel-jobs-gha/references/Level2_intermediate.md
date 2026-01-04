# Level 2: Intermediate

## 概要

GitHub Actionsの並列ジョブ実行とジョブ依存関係管理のスキル。

references/・scripts/・assets/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: needs構文、outputs、artifacts、cache、matrix戦略、ジョブ依存関係グラフ、データ受け渡しパターン

### 判断基準と検証観点

- 回避事項: 循環依存、過剰な並列化、不要なartifacts、検証の省略

### リソース運用

- `references/data-passing.md`: ジョブ間のデータ受け渡し手法（outputs、artifacts、cache活用パターン）
- `references/job-dependencies.md`: needs構文による依存関係グラフと実行順序制御パターン

### スクリプト運用

- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/visualize-deps.mjs`: ワークフロー内ジョブ依存関係をMermaid形式で可視化

### テンプレート運用

- `assets/parallel-workflow.yaml`: 並列実行、依存関係、データ共有を含むGitHub Actionsワークフローテンプレート（5つの実装例）

### 成果物要件

- テンプレートの構成・必須項目を反映する
- YAML構文が有効であること
- ジョブ依存関係に循環参照がないこと

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
- [ ] ジョブ依存関係グラフを可視化した
