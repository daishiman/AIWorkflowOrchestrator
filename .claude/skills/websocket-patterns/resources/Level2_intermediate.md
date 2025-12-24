# Level 2: Intermediate

## 概要

WebSocketによる双方向リアルタイム通信パターンを専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 接続ライフサイクル管理 / 接続状態 / 状態定義 / ハートビート戦略 / ハートビートの目的 / Ping-Pong方式

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/connection-lifecycle.md`: Connection Lifecycleリソース（把握する知識: 接続ライフサイクル管理 / 接続状態 / 状態定義）
- `resources/heartbeat-strategies.md`: Heartbeat Strategiesリソース（把握する知識: ハートビート戦略 / ハートビートの目的 / Ping-Pong方式）
- `resources/message-queueing.md`: Message Queueingリソース（把握する知識: メッセージキューイング / キューの目的 / キュー設計）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: Discord Bot 仕様）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: WebSocket Patterns / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-websocket-config.mjs`: Analyze Websocket Configスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/websocket-client-template.ts`: Websocket Clientテンプレート

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
