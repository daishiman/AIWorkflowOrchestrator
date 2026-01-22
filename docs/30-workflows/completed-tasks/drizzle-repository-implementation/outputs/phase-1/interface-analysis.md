# Phase 1 - タスク1: インターフェース分析

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 1                                 |
| タスク番号 | 1                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## IChatSessionRepository インターフェース分析

**ファイルパス**: `packages/shared/src/features/chat-history/domain/repositories/IChatSessionRepository.ts`

### メソッド一覧

| No  | メソッド名     | 引数                                              | 戻り値                         | 責務                                                             |
| --- | -------------- | ------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------- |
| 1   | `findById`     | `id: ChatSessionId`                               | `Promise<ChatSession \| null>` | IDでセッションを取得。存在しない場合はnull                       |
| 2   | `findByUserId` | `userId: UserId, limit?: number, offset?: number` | `Promise<ChatSession[]>`       | ユーザーIDでセッション一覧を取得（ページネーション対応）         |
| 3   | `findPinned`   | `userId: UserId`                                  | `Promise<ChatSession[]>`       | ピン留めセッション一覧を取得（pinOrder順）                       |
| 4   | `search`       | `criteria: ChatSessionSearchCriteria`             | `Promise<ChatSession[]>`       | 検索条件でセッションを検索（キーワード、お気に入り、ピン留め等） |
| 5   | `save`         | `session: ChatSession`                            | `Promise<void>`                | セッションを保存（作成または更新 - Upsert）                      |
| 6   | `delete`       | `id: ChatSessionId`                               | `Promise<void>`                | セッションを削除                                                 |
| 7   | `exists`       | `id: ChatSessionId`                               | `Promise<boolean>`             | セッションの存在確認                                             |
| 8   | `countPinned`  | `userId: UserId`                                  | `Promise<number>`              | ピン留めセッション数をカウント                                   |

**メソッド総数**: 8メソッド

### 検索条件型定義

```typescript
interface ChatSessionSearchCriteria {
  userId: UserId;
  keyword?: string; // キーワード検索（タイトル対象）
  isFavorite?: boolean; // お気に入りフィルター
  isPinned?: boolean; // ピン留めフィルター
  limit?: number; // 取得件数
  offset?: number; // オフセット
}
```

---

## IChatMessageRepository インターフェース分析

**ファイルパス**: `packages/shared/src/features/chat-history/domain/repositories/IChatMessageRepository.ts`

### メソッド一覧

| No  | メソッド名              | 引数                                                        | 戻り値                         | 責務                                                 |
| --- | ----------------------- | ----------------------------------------------------------- | ------------------------------ | ---------------------------------------------------- |
| 1   | `findById`              | `id: ChatMessageId`                                         | `Promise<ChatMessage \| null>` | IDでメッセージを取得。存在しない場合はnull           |
| 2   | `findBySessionId`       | `sessionId: ChatSessionId, limit?: number, offset?: number` | `Promise<ChatMessage[]>`       | セッションIDでメッセージ一覧を取得（messageIndex順） |
| 3   | `findLatestBySessionId` | `sessionId: ChatSessionId`                                  | `Promise<ChatMessage \| null>` | セッション内の最新メッセージを取得                   |
| 4   | `countBySessionId`      | `sessionId: ChatSessionId`                                  | `Promise<number>`              | セッション内のメッセージ数を取得                     |
| 5   | `save`                  | `message: ChatMessage`                                      | `Promise<void>`                | メッセージを保存（作成または更新 - Upsert）          |
| 6   | `saveMany`              | `messages: ChatMessage[]`                                   | `Promise<void>`                | 複数メッセージを一括保存                             |
| 7   | `delete`                | `id: ChatMessageId`                                         | `Promise<void>`                | メッセージを削除                                     |
| 8   | `deleteBySessionId`     | `sessionId: ChatSessionId`                                  | `Promise<void>`                | セッションの全メッセージを削除                       |

**メソッド総数**: 8メソッド

---

## インターフェース依存関係

### Value Objects依存

| Value Object    | 使用箇所                           |
| --------------- | ---------------------------------- |
| `ChatSessionId` | Session検索、削除、Message関連操作 |
| `ChatMessageId` | Message検索、削除                  |
| `UserId`        | Session検索、ピン留め検索          |

### Entity依存

| Entity        | 使用箇所                      |
| ------------- | ----------------------------- |
| `ChatSession` | save入力、find系出力          |
| `ChatMessage` | save/saveMany入力、find系出力 |

---

## 実装上の考慮点

1. **Upsert操作**: `save`メソッドは作成と更新の両方をサポートする必要がある
2. **ソート順序**:
   - `findBySessionId`: `messageIndex`順
   - `findPinned`: `pinOrder`順
3. **ページネーション**: `limit`/`offset`パラメータによるページング対応
4. **キーワード検索**: `search`メソッドでタイトル対象の部分一致検索が必要
5. **一括操作**: `saveMany`でトランザクションを使用した一括insert/update

---

## 完了確認

- [x] IChatSessionRepository の全メソッド（8メソッド）が分析されている
- [x] IChatMessageRepository の全メソッド（8メソッド）が分析されている
- [x] 各メソッドの引数・戻り値・責務が一覧化されている
