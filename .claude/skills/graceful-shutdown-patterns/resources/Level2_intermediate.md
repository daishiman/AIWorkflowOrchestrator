# Level 2: Intermediate

## 概要

Node.jsアプリケーションのGraceful Shutdown実装を専門とするスキル。 Twelve-Factor Appの「廃棄容易性」原則に基づき、優雅なプロセス終了、 リソースクリーンアップ、接続ドレイン、タイムアウト処理を設計します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 接続ドレインガイド / 接続ドレインとは / HTTPサーバーのドレイン / リソースクリーンアップガイド / クリーンアップ対象一覧 / データベース接続のクリーンアップ
- 実務指針: アプリケーションの終了処理を設計する時 / リソースリークを防ぐクリーンアップを実装する時 / ゼロダウンタイムデプロイを実現する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/connection-draining.md`: connection-draining の詳細ガイド（把握する知識: 接続ドレインガイド / 接続ドレインとは / HTTPサーバーのドレイン）
- `resources/resource-cleanup.md`: resource-cleanup の詳細ガイド（把握する知識: リソースクリーンアップガイド / クリーンアップ対象一覧 / データベース接続のクリーンアップ）
- `resources/shutdown-sequence.md`: shutdown-sequence の詳細ガイド（把握する知識: シャットダウンシーケンスガイド / 完全なシャットダウンフロー / Step 1: シャットダウンフラグ設定）
- `resources/shutdown-strategies.md`: shutdown-strategies の詳細ガイド（把握する知識: シャットダウン戦略ガイド / 戦略の選択 / 即時シャットダウン vs グレースフルシャットダウン）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Graceful Shutdown Patterns / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/test-graceful-shutdown.mjs`: gracefulshutdownをテストするスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/graceful-shutdown.template.ts`: graceful-shutdown.template のテンプレート
- `templates/shutdown-manager.ts`: shutdown-manager のテンプレート

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
