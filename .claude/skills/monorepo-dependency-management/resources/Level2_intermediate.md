# Level 2: Intermediate

## 概要

モノレポ環境での依存関係管理、ワークスペース間の整合性維持を専門とするスキル。 pnpm workspaces、変更影響分析、パッケージ間バージョン同期の方法論を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 変更影響分析 / 影響分析の基本 / 依存グラフの理解 / ホイスティング制御 / pnpmのホイスティング動作 / デフォルト動作
- 実務指針: モノレポの初期セットアップを行う時 / ワークスペース間の依存関係を管理する時 / 変更の影響範囲を分析する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/change-impact-analysis.md`: 依存グラフ解析、影響を受けるパッケージ特定、テスト範囲決定、pnpm --filter活用（把握する知識: 変更影響分析 / 影響分析の基本 / 依存グラフの理解）
- `resources/dependency-hoisting.md`: shamefully-hoist設定、public-hoist-pattern、ホイスティングの最適化と問題回避（把握する知識: ホイスティング制御 / pnpmのホイスティング動作 / デフォルト動作）
- `resources/pnpm-workspace-setup.md`: pnpm-workspace.yaml設定、workspace:*プロトコル、内部依存定義、モノレポ構造設計（把握する知識: pnpm Workspaces設定 / 基本設定 / pnpm-workspace.yaml）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
- `resources/version-synchronization.md`: パッケージ間バージョン整合性維持、カタログ機能活用、統一バージョン管理（把握する知識: バージョン同期戦略 / pnpm Catalogs（推奨） / 基本設定）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Monorepo Dependency Management / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-workspace-deps.mjs`: ワークスペース依存関係分析（循環依存検出、依存グラフ可視化、影響範囲特定）
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/monorepo-setup-checklist.md`: モノレポ初期セットアップチェックリスト（構造設計から運用まで）

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
