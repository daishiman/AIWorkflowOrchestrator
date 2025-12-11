---
name: websocket-patterns
description: |
  WebSocketによる双方向リアルタイム通信パターンを専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/websocket-patterns/resources/connection-lifecycle.md`: Connection Lifecycleリソース
  - `.claude/skills/websocket-patterns/resources/heartbeat-strategies.md`: Heartbeat Strategiesリソース
  - `.claude/skills/websocket-patterns/resources/message-queueing.md`: Message Queueingリソース

  - `.claude/skills/websocket-patterns/templates/websocket-client-template.ts`: Websocket Clientテンプレート

  - `.claude/skills/websocket-patterns/scripts/analyze-websocket-config.mjs`: Analyze Websocket Configスクリプト

version: 1.0.0
---

# WebSocket Patterns

## 概要

このスキルは、WebSocket による双方向リアルタイム通信パターンを提供します。
RFC 6455 に準拠し、信頼性の高いリアルタイム通信の設計を支援します。

**主要な価値**:

- ポーリングよりも低レイテンシで効率的な通信
- サーバーからのプッシュ型通知
- 接続断時の自動再接続
- メッセージの確実な配信

**対象ユーザー**:

- リアルタイム機能を実装するエージェント（@local-sync）
- 通知システムを構築する開発者
- ポーリングから WebSocket へ移行するプロジェクト

## リソース構造

```
websocket-patterns/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── connection-lifecycle.md                 # 接続ライフサイクル管理
│   ├── heartbeat-strategies.md                 # ハートビート設計
│   └── message-queueing.md                     # メッセージキューイング
├── scripts/
│   └── analyze-websocket-config.mjs            # 設定分析スクリプト
└── templates/
    └── websocket-client-template.ts            # WebSocketクライアントテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 接続ライフサイクル管理
cat .claude/skills/websocket-patterns/resources/connection-lifecycle.md

# ハートビート設計
cat .claude/skills/websocket-patterns/resources/heartbeat-strategies.md

# メッセージキューイング
cat .claude/skills/websocket-patterns/resources/message-queueing.md
```

### テンプレート参照

```bash
# WebSocketクライアントテンプレート
cat .claude/skills/websocket-patterns/templates/websocket-client-template.ts
```

### スクリプト実行

```bash
# WebSocket設定の分析（再接続、ハートビート、キュー設定の妥当性検証）
node .claude/skills/websocket-patterns/scripts/analyze-websocket-config.mjs <config-file>
```

## いつ使うか

### シナリオ 1: リアルタイム通知の実装

**状況**: サーバーからのイベントを即座にクライアントに通知したい

**適用条件**:

- [ ] 低レイテンシ（100ms 以下）が必要
- [ ] サーバーからのプッシュ型通知が必要
- [ ] 頻繁なデータ更新がある

**期待される成果**: WebSocket 接続による即座の通知

### シナリオ 2: ポーリングからの移行

**状況**: ポーリングによるサーバー負荷が問題になっている

**適用条件**:

- [ ] ポーリング間隔が短い（5 秒以下）
- [ ] 同時接続クライアントが多い
- [ ] サーバーリソースを削減したい

**期待される成果**: WebSocket 化によるリソース削減

### シナリオ 3: 接続安定性の向上

**状況**: WebSocket 接続が頻繁に切れる

**適用条件**:

- [ ] ネットワーク環境が不安定
- [ ] モバイルクライアントがある
- [ ] 長時間接続が必要

**期待される成果**: ハートビートと自動再接続による安定化

## 核心概念

### 1. 接続ライフサイクル

**目的**: WebSocket 接続の各段階を適切に管理

**状態遷移**:

```
Disconnected
    │
    │ connect()
    ▼
Connecting
    │
    ├─ 成功 → Connected
    │
    └─ 失敗 → Reconnecting
              │
              ├─ 成功 → Connected
              └─ 上限到達 → Disconnected
```

**詳細**: `resources/connection-lifecycle.md`

### 2. ハートビート（Ping-Pong）

**目的**: 接続の死活監視と維持

**原則**:

- クライアントから定期的に Ping を送信
- サーバーからの Pong を待機
- タイムアウトで接続断を検知

**推奨設定**:

```typescript
const HEARTBEAT_CONFIG = {
  interval: 30000, // 30秒間隔
  timeout: 10000, // 10秒タイムアウト
  maxMissed: 3, // 3回連続失敗で再接続
};
```

**詳細**: `resources/heartbeat-strategies.md`

### 3. メッセージキューイング

**目的**: 送信失敗時のメッセージ保全

**原則**:

- 送信待ちメッセージをキューに蓄積
- 接続復旧時に順次送信
- 重要メッセージの優先処理

**詳細**: `resources/message-queueing.md`

### 4. 再接続戦略

**目的**: 接続断からの自動復旧

**原則**:

- 指数バックオフで再接続を試行
- ジッターで同時再接続を回避
- 最大試行回数で諦める

**計算式**:

```typescript
delay = min((baseDelay * 2) ^ (attempt + jitter), maxDelay);
```

**詳細**: retry-strategies スキルと連携

## ワークフロー

### Phase 1: 要件分析

**ステップ**:

1. 通信パターンの特定（一方向 vs 双方向）
2. レイテンシ要件の確認
3. 接続数の見積もり

**判断基準**:

- [ ] WebSocket が最適な選択か？（SSE、Long Polling との比較）
- [ ] サーバー側の WebSocket サポートがあるか？

### Phase 2: 接続設計

**ステップ**:

1. 接続 URL とプロトコルの決定
2. 認証方式の選択（URL params、初期メッセージ）
3. ハートビート間隔の設定

**判断基準**:

- [ ] 認証トークンの受け渡し方法が決まっているか？
- [ ] ハートビート間隔がサーバー設定と整合しているか？

### Phase 3: メッセージ設計

**ステップ**:

1. メッセージフォーマットの定義（JSON）
2. メッセージタイプの設計
3. エラーハンドリングの設計

**判断基準**:

- [ ] メッセージスキーマが定義されているか？
- [ ] バージョニング戦略があるか？

### Phase 4: 実装とテスト

**ステップ**:

1. WebSocket クライアントの実装
2. 再接続ロジックのテスト
3. 負荷テスト

**判断基準**:

- [ ] 接続断時の動作が期待通りか？
- [ ] メモリリークがないか？

## ベストプラクティス

### すべきこと

1. **ハートビートの実装**:
   - サーバーとクライアント両方でタイムアウト監視
   - Ping-Pong 方式を推奨

2. **再接続の自動化**:
   - 指数バックオフとジッター
   - ネットワーク復旧の検知

3. **メッセージのバッファリング**:
   - 接続断中のメッセージを保存
   - 復旧時に順次送信

### 避けるべきこと

1. **即時再接続**:
   - サーバー負荷集中のリスク
   - バックオフなしの連続試行

2. **無限バッファ**:
   - メモリ枯渇のリスク
   - サイズ制限を設ける

3. **同期ブロッキング**:
   - メインスレッドのブロック
   - 非同期処理を徹底

## トラブルシューティング

### 問題 1: 接続が頻繁に切れる

**症状**: 数分ごとに再接続が発生

**原因**:

- サーバー側のアイドルタイムアウト
- プロキシによる接続切断

**解決策**:

1. ハートビート間隔を短くする（15-30 秒）
2. サーバーのタイムアウト設定を確認
3. プロキシ設定を確認

### 問題 2: メッセージが失われる

**症状**: 送信したメッセージがサーバーに届かない

**原因**:

- 接続断中の送信
- バッファオーバーフロー

**解決策**:

1. 送信前に接続状態を確認
2. メッセージキューを実装
3. ACK ベースの確認機構

### 問題 3: メモリリーク

**症状**: 長時間接続でメモリ使用量が増加

**原因**:

- イベントリスナーの未解除
- 無限バッファリング

**解決策**:

1. 接続終了時にリスナーを解除
2. バッファサイズに上限を設定

## 関連スキル

- **network-resilience** (`.claude/skills/network-resilience/SKILL.md`): オフライン対応、再接続戦略
- **retry-strategies** (`.claude/skills/retry-strategies/SKILL.md`): 指数バックオフ、ジッター

## 参考文献

- **RFC 6455**: The WebSocket Protocol
- **MDN Web Docs**: WebSocket API

## 変更履歴

| バージョン | 日付       | 変更内容                                                            |
| ---------- | ---------- | ------------------------------------------------------------------- |
| 1.0.0      | 2025-11-26 | 初版作成 - 接続ライフサイクル、ハートビート、メッセージキューイング |

## 使用上の注意

### このスキルが得意なこと

- WebSocket 接続の設計と実装
- ハートビートとタイムアウト管理
- 再接続戦略の設計

### このスキルが行わないこと

- WebSocket サーバーの実装（クライアント側のみ）
- HTTP ベースの通信（それは api-client-patterns スキル）
- メッセージブローカーの設計（それは別途設計が必要）
