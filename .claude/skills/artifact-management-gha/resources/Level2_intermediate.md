# Level 2: Intermediate

## 概要

GitHub Actionsのアーティファクト管理スキル。 ビルド成果物のアップロード・ダウンロード、ジョブ間/ワークフロー間でのデータ共有、 保持期間設定、パス指定パターン、クリーンアップ戦略を提供。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: actions/download-artifact@v4 / 基本構文 / ダウンロードパターン / 保持期間とストレージ最適化 / 保持期間戦略 / デフォルト設定

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/download-artifact.md`: Download Artifact 詳細（把握する知識: actions/download-artifact@v4 / 基本構文 / ダウンロードパターン）
- `resources/retention-optimization.md`: 保持期間とストレージ最適化（把握する知識: 保持期間とストレージ最適化 / 保持期間戦略 / デフォルト設定）
- `resources/upload-artifact.md`: Upload Artifact 詳細（把握する知識: actions/upload-artifact@v4 / 基本構文 / パス指定パターン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Artifact Management (GitHub Actions) / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/cleanup-artifacts.mjs`: GitHub Actions Artifact Cleanup Script
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/artifact-workflow.yaml`: GitHub Actions Artifact Management ワークフロー例

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
