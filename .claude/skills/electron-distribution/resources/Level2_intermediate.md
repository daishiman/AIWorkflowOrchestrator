# Level 2: Intermediate

## 概要

Electronアプリケーションの配布・自動更新専門知識

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: electron-updater の仕組み / 更新フロー / 更新マニフェスト / デプロイメント (Deployment) / .claude/skills/electron-distribution/SKILL.md / 目的
- 実務指針: 自動更新機能を実装する時 / リリースフローを構築する時 / アプリストアに配布する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/auto-update.md`: 自動更新実装詳細（把握する知識: electron-updater の仕組み / 更新フロー / 更新マニフェスト）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: デプロイメント (Deployment)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: .claude/skills/electron-distribution/SKILL.md / 目的 / 対象者）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/release-helper.mjs`: releasehelperを処理するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/update-server.ts`: 更新サーバーテンプレート

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
