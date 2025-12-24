# Level 2: Intermediate

## 概要

Node.jsアプリケーションのログローテーション戦略を専門とするスキル。 PM2、logrotate、Winston等を活用した効率的なログ管理を設計します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: ログ集約ガイド / ログ集約の必要性 / ログ集約オプション / PM2ログローテーションガイド / pm2-logrotateモジュール / インストール
- 実務指針: ログローテーションを設定する時 / ディスク容量管理を最適化する時 / ログフォーマットを標準化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/log-aggregation.md`: 集中ログ管理オプション（ELK/Datadog/CloudWatch/Loki）、サービス選定基準（把握する知識: ログ集約ガイド / ログ集約の必要性 / ログ集約オプション）
- `resources/pm2-logrotate-guide.md`: pm2-logrotate設定、max_size/retain/compress、ecosystem.config.js統合（把握する知識: PM2ログローテーションガイド / pm2-logrotateモジュール / インストール）
- `resources/rotation-patterns.md`: サイズベース・時間ベース・ハイブリッド方式の選択基準と実装パターン（把握する知識: ログローテーションパターンガイド / ローテーション方式の比較 / サイズベースローテーション）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Log Rotation Strategies / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-log-usage.mjs`: ログ使用量分析（ディレクトリサイズ、世代数、圧縮率）
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/winston-rotation.template.ts`: Winston DailyRotateFile設定テンプレート（TypeScript）

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
