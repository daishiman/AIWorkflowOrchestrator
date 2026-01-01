# メッセージングパターン

> 相対パス: `references/messaging-patterns.md`
> 原典: Enterprise Integration Patterns (Gregor Hohpe)

---

## パターン概要

| パターン          | 用途             | 特徴               |
| ----------------- | ---------------- | ------------------ |
| Publish/Subscribe | ブロードキャスト | 1対多、疎結合      |
| Point-to-Point    | 直接配信         | 1対1、順序保証     |
| Request/Reply     | 同期通信         | レスポンス必要時   |
| Event Sourcing    | 状態管理         | 完全履歴、再生可能 |

---

## Publish/Subscribe

```
Producer → Topic → Consumer 1
                 → Consumer 2
                 → Consumer N
```

| 項目 | 説明                           |
| ---- | ------------------------------ |
| 用途 | イベント通知、ドメインイベント |
| 配信 | 全サブスクライバに配信         |
| 順序 | パーティション内で保証         |
| 適用 | Kafka, SNS, EventBridge        |

---

## Point-to-Point

```
Producer → Queue → Consumer
```

| 項目 | 説明                       |
| ---- | -------------------------- |
| 用途 | タスク分散、ワーカーキュー |
| 配信 | 1つのコンシューマのみ      |
| 順序 | FIFO（オプション）         |
| 適用 | SQS, RabbitMQ              |

---

## メッセージブローカー選定

| ブローカー    | 特徴                     | 適用場面             |
| ------------- | ------------------------ | -------------------- |
| Apache Kafka  | 高スループット、永続化   | ストリーミング、ログ |
| RabbitMQ      | 柔軟なルーティング       | 複雑なワークフロー   |
| AWS SQS/SNS   | マネージド、スケーラブル | AWSエコシステム      |
| Redis Streams | 低レイテンシ             | リアルタイム         |

---

## 配信保証

| レベル        | 説明          | トレードオフ             |
| ------------- | ------------- | ------------------------ |
| At-most-once  | 最大1回       | 欠損あり                 |
| At-least-once | 少なくとも1回 | 重複あり（要冪等性）     |
| Exactly-once  | 厳密に1回     | 高コスト、低スループット |

**推奨**: At-least-once + 冪等ハンドラ
