# Level 2: Intermediate

## 概要

HTTPプロトコルを正しく効率的に活用するためのベストプラクティス集。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Connection Management（コネクション管理） / HTTP/1.1 Keep-Alive / 基本概念 / Headers Best Practices（ヘッダー設計） / 主要ヘッダーカテゴリ / コンテンツヘッダー
- 実務指針: RESTful APIを設計・実装する時 / HTTPクライアントを実装する時 / API通信のパフォーマンスを最適化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/connection-management.md`: Keep-Alive、コネクションプーリング、HTTP/2最適化（把握する知識: Connection Management（コネクション管理） / HTTP/1.1 Keep-Alive / 基本概念）
- `resources/headers-best-practices.md`: 標準ヘッダー活用とカスタムヘッダー設計（把握する知識: Headers Best Practices（ヘッダー設計） / 主要ヘッダーカテゴリ / コンテンツヘッダー）
- `resources/idempotency.md`: 冪等性設計と冪等キー実装（把握する知識: Idempotency（冪等性） / HTTPメソッドと冪等性 / 冪等 vs 安全）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: REST API 設計原則）
- `resources/status-codes.md`: 2xx/4xx/5xxステータスコードの適切な使い分け（把握する知識: HTTP Status Codes（HTTPステータスコード） / ステータスコードカテゴリ / 2xx 成功系）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 対象エージェント / 含まれるリソース / 1. HTTP ステータスコード (resources/status-codes.md)）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-http-client.mjs`: httpclientを検証するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/http-client-template.ts`: http-client-template のテンプレート

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
