# Level 2: Intermediate

## 概要

『Database Reliability Engineering』に基づく、データ損失を許さない堅牢なバックアップ・復旧戦略スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 多層防御バックアップ戦略 / Layer 1: 自動バックアップ / 目的 / 災害復旧計画（DR計画）ガイド / DR計画の構成要素 / 1. リスク評価
- 実務指針: バックアップ戦略を設計・レビューする時 / RPO/RTO要件を定義する時 / 復旧手順を文書化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/backup-strategy-layers.md`: 多層防御バックアップ戦略（把握する知識: 多層防御バックアップ戦略 / Layer 1: 自動バックアップ / 目的）
- `resources/disaster-recovery-planning.md`: 災害復旧計画（DR計画）ガイド（把握する知識: 災害復旧計画（DR計画）ガイド / DR計画の構成要素 / 1. リスク評価）
- `resources/recovery-procedures.md`: 3つのシナリオ別復旧手順（行単位誤削除・テーブル復旧・DB全体復旧）とPITR・エクスポート・整合性確認の実践ガイド（把握する知識: 復旧手順ガイド / 復旧シナリオ別手順 / シナリオ1: 行単位の誤削除）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: ローカルエージェント仕様 / デプロイメント (Deployment)）
- `resources/rpo-rto-design.md`: RPO/RTO設計ガイド（把握する知識: RPO/RTO設計ガイド / 基本概念 / RPO（Recovery Point Objective））
- `resources/turso-backup-guide.md`: Tursoバックアップガイド（把握する知識: Tursoバックアップガイド / Tursoのバックアップ機能 / 1. 自動バックアップ）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Backup & Recovery / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/verify-backup.mjs`: バックアップ検証スクリプト

### テンプレート運用
- `templates/backup-policy-template.md`: バックアップポリシー
- `templates/recovery-runbook-template.md`: 緊急連絡先・接続情報・復旧手順・チェックリストを含む実践的な復旧作業マニュアルテンプレート

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
