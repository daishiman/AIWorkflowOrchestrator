# Level 2: Intermediate

## 概要

外部APIの一時的障害に対するリトライ戦略とサーキットブレーカーパターンを専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Bulkhead Pattern（バルクヘッドパターン） / なぜ必要か / 問題: リソース共有による障害連鎖 / Circuit Breaker（サーキットブレーカー） / 状態遷移 / Closed（閉じた状態 = 正常）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/bulkhead-pattern.md`: Bulkhead Patternリソース（把握する知識: Bulkhead Pattern（バルクヘッドパターン） / なぜ必要か / 問題: リソース共有による障害連鎖）
- `resources/circuit-breaker.md`: Circuit Breakerリソース（把握する知識: Circuit Breaker（サーキットブレーカー） / 状態遷移 / Closed（閉じた状態 = 正常））
- `resources/exponential-backoff.md`: Exponential Backoffリソース（把握する知識: Exponential Backoff（指数バックオフ） / 基本原則 / なぜ指数バックオフが必要か）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 非機能要件 / エラーハンドリング仕様 / ローカルエージェント仕様）
- `resources/timeout-strategies.md`: Timeout Strategiesリソース（把握する知識: Timeout Strategies（タイムアウト戦略） / タイムアウトの種類 / 1. 接続タイムアウト（Connection Timeout））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Retry Strategies / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-retry-config.mjs`: Analyze Retry Configスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/circuit-breaker-template.ts`: Circuit Breakerテンプレート
- `templates/retry-wrapper-template.ts`: Retry Wrapperテンプレート

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
