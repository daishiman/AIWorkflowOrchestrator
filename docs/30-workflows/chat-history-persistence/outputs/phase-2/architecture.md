# チャット履歴永続化機能 - アーキテクチャ設計書

## 1. 概要

本ドキュメントはチャット履歴永続化機能のアーキテクチャ設計を定義する。
Clean Architecture原則に基づいたレイヤー構成を採用している。

## 2. アーキテクチャ図

### 2.1 レイヤー構成

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│                    (React Components)                           │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ SessionList │  │ MessageList │  │  InputArea  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                            │                                    │
│                    ┌───────┴───────┐                            │
│                    │  Custom Hooks │                            │
│                    │ useChatHistory│                            │
│                    └───────────────┘                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                     Application Layer                           │
│                    (Service/Use Cases)                          │
│                            │                                    │
│              ┌─────────────┴─────────────┐                      │
│              │     ChatHistoryService    │                      │
│              │                           │                      │
│              │  - createSession()        │                      │
│              │  - addUserMessage()       │                      │
│              │  - addAssistantMessage()  │                      │
│              │  - searchSessions()       │                      │
│              │  - exportToMarkdown()     │                      │
│              │  - exportToJson()         │                      │
│              └───────────────────────────┘                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                      Domain Layer                               │
│                    (Entities/Types)                             │
│                            │                                    │
│     ┌──────────────────────┼──────────────────────┐             │
│     │                      │                      │             │
│  ┌──┴──────────┐   ┌───────┴───────┐   ┌─────────┴───┐         │
│  │ ChatSession │   │  ChatMessage  │   │  LlmMetadata │         │
│  └─────────────┘   └───────────────┘   └─────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                  Infrastructure Layer                           │
│                   (Repositories/DB)                             │
│                            │                                    │
│     ┌──────────────────────┼──────────────────────┐             │
│     │                      │                      │             │
│  ┌──┴────────────────┐  ┌──┴────────────────┐     │             │
│  │ ChatSessionRepo   │  │ ChatMessageRepo   │     │             │
│  └───────────────────┘  └───────────────────┘     │             │
│                            │                      │             │
│              ┌─────────────┴─────────────┐        │             │
│              │       Drizzle ORM         │        │             │
│              │   (chat-history.ts)       │        │             │
│              └───────────────────────────┘        │             │
│                            │                                    │
│              ┌─────────────┴─────────────┐                      │
│              │    SQLite (Turso/libSQL)  │                      │
│              └───────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 依存関係の方向

```
Presentation → Application → Domain ← Infrastructure
                   ↓
              Domain (共通依存)
```

**依存関係ルール:**

- 上位レイヤーは下位レイヤーに依存できる
- 下位レイヤーは上位レイヤーに依存できない
- Domain層は外部依存を持たない（純粋なTypeScript）
- Infrastructure層はDomain層のインターフェースを実装

## 3. パッケージ構成

```
packages/
└── shared/
    └── src/
        ├── db/
        │   └── schema/
        │       └── chat-history.ts        # Drizzleスキーマ定義
        │
        ├── types/
        │   ├── chat-session.ts            # ChatSession型
        │   ├── chat-message.ts            # ChatMessage型
        │   └── llm-metadata.ts            # LlmMetadata型
        │
        ├── repositories/
        │   ├── chat-session-repository.ts # セッションリポジトリ
        │   └── chat-message-repository.ts # メッセージリポジトリ
        │
        └── features/
            └── chat-history/
                ├── chat-history-service.ts     # ビジネスロジック
                ├── date-formatter.ts           # 日付フォーマッター
                ├── constants.ts                # 定数定義
                └── __tests__/
                    └── chat-history-service.test.ts  # テスト
```

## 4. 責務分離

### 4.1 Presentation Layer

| コンポーネント | 責務                                 |
| -------------- | ------------------------------------ |
| SessionList    | セッション一覧の表示とナビゲーション |
| MessageList    | メッセージ履歴の表示                 |
| InputArea      | ユーザー入力の受け付け               |
| useChatHistory | サービス層との橋渡し、状態管理       |

### 4.2 Application Layer

| コンポーネント     | 責務                                     |
| ------------------ | ---------------------------------------- |
| ChatHistoryService | ビジネスロジックの統合、ユースケース実行 |
| DateFormatter      | 日付フォーマット処理                     |

### 4.3 Domain Layer

| コンポーネント | 責務                         |
| -------------- | ---------------------------- |
| ChatSession    | セッションエンティティの定義 |
| ChatMessage    | メッセージエンティティの定義 |
| LlmMetadata    | LLMメタデータの定義          |

### 4.4 Infrastructure Layer

| コンポーネント        | 責務                        |
| --------------------- | --------------------------- |
| ChatSessionRepository | セッションのデータアクセス  |
| ChatMessageRepository | メッセージのデータアクセス  |
| Drizzle ORM           | SQLクエリ生成、型安全性保証 |

## 5. SOLID原則への準拠

### 5.1 Single Responsibility Principle (SRP)

- 各リポジトリは単一エンティティのCRUDのみ担当
- サービスはビジネスロジックのみ担当
- 日付フォーマットは専用クラスに分離

### 5.2 Open/Closed Principle (OCP)

- metadata/attachmentsフィールドによる拡張性確保
- 新しいエクスポート形式の追加が容易

### 5.3 Liskov Substitution Principle (LSP)

- リポジトリはインターフェースに準拠
- モック差し替えによるテスト容易性

### 5.4 Interface Segregation Principle (ISP)

- リポジトリは必要最小限のメソッドを公開
- 検索クエリは専用のインターフェースで定義

### 5.5 Dependency Inversion Principle (DIP)

- サービスはリポジトリのインターフェースに依存
- 具象実装はコンストラクタインジェクション

## 6. データフロー

### 6.1 メッセージ送信フロー

```
[User Input]
     │
     ▼
[InputArea Component]
     │
     ▼
[useChatHistory Hook]
     │
     ▼
[ChatHistoryService.addUserMessage()]
     │
     ├──▶ [ChatMessageRepository.save()]
     │         │
     │         ▼
     │    [Drizzle ORM → SQLite]
     │
     └──▶ [ChatSessionRepository.update()]
               │
               ▼
          [Drizzle ORM → SQLite]
```

### 6.2 検索フロー

```
[Search Input]
     │
     ▼
[SearchBar Component]
     │
     ▼
[useChatHistory Hook]
     │
     ▼
[ChatHistoryService.searchSessions()]
     │
     ▼
[ChatSessionRepository.search()]
     │
     ▼
[FTS5 Full-Text Search]
     │
     ▼
[Search Results]
```

## 7. テスト戦略

| レイヤー       | テスト手法                   | カバレッジ目標 |
| -------------- | ---------------------------- | -------------- |
| Application    | ユニットテスト（モック使用） | 80%以上        |
| Domain         | ユニットテスト（純粋な関数） | 90%以上        |
| Infrastructure | 統合テスト（インメモリDB）   | 70%以上        |
| Presentation   | コンポーネントテスト + E2E   | 60%以上        |

## 8. 実装状況

| レイヤー       | ファイル                                                | ステータス |
| -------------- | ------------------------------------------------------- | ---------- |
| Domain         | `packages/shared/src/types/chat-*.ts`                   | 完了       |
| Infrastructure | `packages/shared/src/repositories/chat-*-repository.ts` | 完了       |
| Application    | `packages/shared/src/features/chat-history/`            | 完了       |
| Presentation   | `apps/desktop/src/components/chat/`                     | 未実装     |

## 9. 将来の拡張

- **クラウド同期**: 同期サービス層の追加
- **暗号化**: 暗号化レイヤーの挿入
- **キャッシュ**: インメモリキャッシュ層の追加
