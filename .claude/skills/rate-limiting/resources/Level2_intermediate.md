# Level 2: Intermediate

## 概要

Rate Limitingとクォータ管理のベストプラクティスを提供します。 外部APIのレート制限を適切に処理し、サーバー側・クライアント側両方の 観点からRate Limitingを実装するためのパターンを提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Rate Limiting Algorithms（レート制限アルゴリズム） / アルゴリズム比較 / Token Bucket / Client-Side Rate Limit Handling（クライアント側のレート制限対応） / レート制限レスポンスの理解 / 標準ヘッダー
- 実務指針: APIのRate Limiting設計時 / DoS/DDoS攻撃対策の実装時 / 外部APIクライアントの実装時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/algorithms.md`: Rate Limiting Algorithms（レート制限アルゴリズム）（把握する知識: Rate Limiting Algorithms（レート制限アルゴリズム） / アルゴリズム比較 / Token Bucket）
- `resources/client-handling.md`: Client-Side Rate Limit Handling（クライアント側のレート制限対応）（把握する知識: Client-Side Rate Limit Handling（クライアント側のレート制限対応） / レート制限レスポンスの理解 / 標準ヘッダー）
- `resources/quota-management.md`: Quota Management（クォータ管理）（把握する知識: Quota Management（クォータ管理） / クォータ vs レート制限 / クォータ設計）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: Discord Bot 仕様）
- `resources/server-implementation.md`: Server-Side Rate Limiting（サーバー側レート制限）（把握する知識: Server-Side Rate Limiting（サーバー側レート制限） / 設計の考慮事項 / レート制限キー）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Rate Limiting / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/simulate-rate-limit.mjs`: Rate Limit Simulation Tool
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/rate-limiter-template.ts`: Rate Limiter Template

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
