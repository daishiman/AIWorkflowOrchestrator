# アーキテクチャ設計書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-LLM-HISTORY-001                   |
| 機能名     | llm-conversation-history-persistence |
| バージョン | 1.0.0                                |
| 作成日     | 2026-01-24                           |

---

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Renderer Process                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────────────────────────────┐ │
│  │ UI Components   │    │           Redux Store                   │ │
│  │                 │    │  ┌───────────────────────────────────┐  │ │
│  │ ConversationList│◄──►│  │ llmSlice (conversation state)    │  │ │
│  │ ChatPanel       │    │  │   - conversations: Summary[]     │  │ │
│  │                 │    │  │   - currentConversation          │  │ │
│  └────────┬────────┘    │  │   - isLoading, error             │  │ │
│           │             │  └───────────────────────────────────┘  │ │
│           │             └──────────────────────────────────────────┘ │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    IPC Bridge (preload)                       │   │
│  │  window.electronAPI.conversation.*                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │ IPC
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Main Process                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    IPC Handlers                               │   │
│  │  ipcMain.handle('conversation:*', ...)                        │   │
│  └────────────────────────────┬─────────────────────────────────┘   │
│                               │                                      │
│                               ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                ConversationRepository                         │   │
│  │                                                               │   │
│  │  - listConversations()    - getConversation()                │   │
│  │  - createConversation()   - updateConversation()             │   │
│  │  - deleteConversation()   - addMessage()                     │   │
│  │  - searchConversations()                                     │   │
│  └────────────────────────────┬─────────────────────────────────┘   │
│                               │                                      │
│                               ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    SQLite (better-sqlite3)                    │   │
│  │                                                               │   │
│  │  chat_sessions ◄───────────► chat_messages                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## レイヤー構成

### 1. UI Layer (Renderer Process)

| コンポーネント   | 責務                                 |
| ---------------- | ------------------------------------ |
| ConversationList | 会話一覧の表示、選択、削除操作       |
| ChatPanel        | 選択された会話のメッセージ表示・入力 |
| SearchInput      | 会話検索入力                         |

### 2. State Management Layer (Redux)

| Slice    | 責務                                    |
| -------- | --------------------------------------- |
| llmSlice | 会話・メッセージ状態、LLM設定状態の管理 |

### 3. IPC Layer (Preload Bridge)

| 役割     | 説明                                |
| -------- | ----------------------------------- |
| Preload  | RendererとMainの型安全な橋渡し      |
| Handlers | Main Process側でIPCリクエストを処理 |

### 4. Repository Layer (Main Process)

| Repository             | 責務                                |
| ---------------------- | ----------------------------------- |
| ConversationRepository | chat_sessions/chat_messagesへのCRUD |

### 5. Data Layer (SQLite)

| テーブル      | 説明               |
| ------------- | ------------------ |
| chat_sessions | 会話セッション情報 |
| chat_messages | 会話メッセージ     |

---

## データフロー

### 1. 会話一覧取得

```
1. アプリ起動 / ユーザー操作
2. Renderer: dispatch(loadConversations())
3. Renderer: await electronAPI.conversation.list({ userId })
4. Main: ipcMain.handle('conversation:list')
5. Main: ConversationRepository.listConversations()
6. Main: SQLite SELECT (chat_sessions)
7. Main: return ConversationSummary[]
8. Renderer: dispatch(setConversations(data))
9. UI: 一覧表示更新
```

### 2. 会話選択・メッセージ取得

```
1. ユーザー: 会話をクリック
2. Renderer: dispatch(selectConversation(id))
3. Renderer: await electronAPI.conversation.get({ id })
4. Main: ipcMain.handle('conversation:get')
5. Main: ConversationRepository.getConversation()
6. Main: SQLite SELECT (chat_sessions + chat_messages)
7. Main: return Conversation with Messages
8. Renderer: dispatch(setCurrentConversation(data))
9. UI: メッセージ履歴表示
```

### 3. メッセージ送信・保存

```
1. ユーザー: メッセージ入力・送信
2. Renderer: 楽観的更新（UIにメッセージ追加）
3. Renderer: await electronAPI.conversation.addMessage()
4. Main: ipcMain.handle('conversation:addMessage')
5. Main: ConversationRepository.addMessage()
6. Main: SQLite INSERT (chat_messages) + UPDATE (chat_sessions)
7. Main: return Message
8. Renderer: 確定（または失敗時にロールバック）
```

---

## 設計原則

### 1. オフラインファースト

- すべてのデータはローカルSQLiteに保存
- 将来のクラウド同期に備えた設計

### 2. 楽観的更新

- UIは即座に更新し、バックグラウンドでDB保存
- 失敗時はロールバック

### 3. 遅延読み込み

- 会話一覧はサマリー情報のみ
- メッセージは会話選択時にロード

### 4. 型安全

- 全レイヤーでTypeScript型を共有
- IPC通信でも型チェック

### 5. トランザクション

- 複数テーブルへの操作はトランザクション内で実行
- データ整合性を保証

---

## エラーハンドリング戦略

### Main Process → Renderer

```typescript
// 成功時
{ success: true, data: T }

// 失敗時
{ success: false, error: { code: string, message: string } }
```

### エラーコード

| コード           | 説明               |
| ---------------- | ------------------ |
| DB_ERROR         | データベースエラー |
| NOT_FOUND        | 会話が見つからない |
| VALIDATION_ERROR | 入力データ不正     |
| UNKNOWN          | 不明なエラー       |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
