# Level 2: Intermediate

## 概要

Railway Database管理スキル。Railway環境グループ、Variables vs Secrets、 Turso integration、Railway CLI統合、一時ファイルセキュリティを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Secrets vs Variables / Secrets（機密情報） / Variables（非機密設定） / Secrets(機密情報) / Variables(非機密設定) / デプロイメント (Deployment)
- 実務指針: RailwayプロジェクトのSecret管理を設計する時 / Railway環境グループを設定する時 / Turso integrationを設定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/railway-secrets-guide.md`: railway-secrets-guide のガイド（把握する知識: Secrets vs Variables / Secrets（機密情報） / Variables（非機密設定））
- `resources/railway-turso-guide.md`: Railway Turso 詳細ガイド（把握する知識: Secrets vs Variables / Secrets(機密情報) / Variables(非機密設定)）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: デプロイメント (Deployment)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Railway Turso Database Management / Railway Secrets vs Variables / Secrets(機密情報)）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- テンプレートはありません

### 成果物要件
- 判断根拠と次のアクションが明確な成果物を作る

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] 成果物要件を満たしている
