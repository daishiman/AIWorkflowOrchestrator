# アーキテクチャ要件書

## 概要

本文書は、チャット履歴機能のClean Architecture準拠リファクタリングにおけるアーキテクチャ要件を定義する。

**作成日**: 2026-01-18
**対象機能**: chat-history
**目標準拠率**: 100%

---

## 1. レイヤー構成

### 1.1 Domain Layer（ドメイン層）

**責務**: ビジネスルールとドメイン知識の表現

**配置場所**: `packages/shared/src/features/chat-history/domain/`

**構成要素**:

| 種別                 | 配置先           | 説明                                       |
| -------------------- | ---------------- | ------------------------------------------ |
| Entity               | `entities/`      | ビジネスロジックを持つドメインオブジェクト |
| Value Object         | `value-objects/` | 不変の値を表す小さなオブジェクト           |
| Repository Interface | `repositories/`  | データアクセスの抽象化                     |
| Domain Error         | `errors/`        | ドメイン固有のエラー定義                   |

**依存ルール**:

- 他のどのレイヤーにも依存しない
- 標準ライブラリのみ使用可能
- ORM、フレームワーク、外部ライブラリへの依存禁止

### 1.2 Application Layer（アプリケーション層）

**責務**: ユースケースの実装、ドメインオブジェクトの調整

**配置場所**: `packages/shared/src/features/chat-history/application/`

**構成要素**:

| 種別     | 配置先       | 説明                               |
| -------- | ------------ | ---------------------------------- |
| Use Case | `use-cases/` | 単一責務のアプリケーションロジック |
| DTO      | `dto/`       | レイヤー間データ転送オブジェクト   |

**依存ルール**:

- Domain層のみに依存可能
- Infrastructure層への依存禁止
- Presentation層への依存禁止

### 1.3 Infrastructure Layer（インフラストラクチャ層）

**責務**: 外部システム・フレームワークとの接続

**配置場所**: `packages/shared/src/infrastructure/`

**構成要素**:

| 種別           | 配置先                 | 説明                             |
| -------------- | ---------------------- | -------------------------------- |
| Repository実装 | `persistence/drizzle/` | Drizzle ORMを使用したリポジトリ  |
| Mapper         | `persistence/mappers/` | Entity ↔ DTO ↔ Persistence型変換 |

**依存ルール**:

- Domain層とApplication層に依存可能
- Presentation層への依存禁止

### 1.4 Presentation Layer（プレゼンテーション層）

**責務**: ユーザーインターフェースとのインタラクション

**配置場所**: `apps/desktop/src/contexts/`, `apps/desktop/src/hooks/`

**構成要素**:

| 種別        | 配置先      | 説明                          |
| ----------- | ----------- | ----------------------------- |
| Context     | `contexts/` | React Contextによる依存性注入 |
| Custom Hook | `hooks/`    | Use Caseへのアクセス提供      |

**依存ルール**:

- Application層のみに依存可能
- Domain層への直接依存禁止
- Infrastructure層への依存禁止

---

## 2. ディレクトリ構造

```
packages/shared/src/
├── core/
│   ├── Result.ts                    # 共通Result型
│   └── errors/
│       └── DomainError.ts           # 基底ドメインエラー
│
├── features/chat-history/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── ChatSession.ts       # セッションエンティティ
│   │   │   └── ChatMessage.ts       # メッセージエンティティ
│   │   ├── value-objects/
│   │   │   ├── ChatSessionId.ts     # セッションID値オブジェクト
│   │   │   ├── ChatSessionTitle.ts  # タイトル値オブジェクト
│   │   │   ├── MessageContent.ts    # メッセージ内容値オブジェクト
│   │   │   └── MessageRole.ts       # ロール値オブジェクト
│   │   ├── repositories/
│   │   │   ├── IChatSessionRepository.ts
│   │   │   └── IChatMessageRepository.ts
│   │   └── errors/
│   │       └── ChatHistoryErrors.ts # ドメインエラー定義
│   │
│   └── application/
│       ├── use-cases/
│       │   ├── CreateChatSessionUseCase.ts
│       │   ├── GetChatSessionUseCase.ts
│       │   ├── ListChatSessionsUseCase.ts
│       │   ├── UpdateChatSessionUseCase.ts
│       │   ├── DeleteChatSessionUseCase.ts
│       │   ├── AddUserMessageUseCase.ts
│       │   ├── AddAssistantMessageUseCase.ts
│       │   ├── GetMessagesUseCase.ts
│       │   ├── SearchSessionsUseCase.ts
│       │   ├── ExportToMarkdownUseCase.ts
│       │   └── ExportToJsonUseCase.ts
│       └── dto/
│           ├── ChatSessionDTO.ts
│           ├── ChatMessageDTO.ts
│           └── ExportResultDTO.ts
│
├── infrastructure/
│   └── persistence/
│       ├── drizzle/
│       │   ├── DrizzleChatSessionRepository.ts
│       │   └── DrizzleChatMessageRepository.ts
│       └── mappers/
│           ├── ChatSessionMapper.ts
│           └── ChatMessageMapper.ts
│
├── db/
│   └── schema/
│       └── chat-history.ts          # Drizzleスキーマ（既存維持）
│
└── types/                           # 削除予定（移行後）
    ├── chat-session.ts              # → domain/entities/ へ移行
    └── chat-message.ts              # → domain/entities/ へ移行

apps/desktop/src/
├── contexts/
│   └── ChatHistoryContext.tsx       # DIコンテナ
└── hooks/
    └── useChatHistory.ts            # カスタムフック
```

---

## 3. 依存関係ルール

### 3.1 許可される依存方向

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│                  (React Components)                      │
└─────────────────────────┬───────────────────────────────┘
                          │ Context/Hook経由
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│              (Use Cases, DTOs)                           │
└─────────────────────────┬───────────────────────────────┘
                          │ インターフェース経由
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│        (Entities, Value Objects, Repository Interfaces)  │
└─────────────────────────▲───────────────────────────────┘
                          │ 実装
┌─────────────────────────┴───────────────────────────────┐
│                  Infrastructure Layer                    │
│           (Repository実装, Mappers)                      │
└─────────────────────────────────────────────────────────┘
```

### 3.2 禁止される依存

| From         | To             | 理由                                     |
| ------------ | -------------- | ---------------------------------------- |
| Domain       | Application    | ドメインはアプリケーション知識を持たない |
| Domain       | Infrastructure | ドメインは技術詳細に依存しない           |
| Domain       | Presentation   | ドメインはUI知識を持たない               |
| Application  | Infrastructure | アプリケーションは技術詳細に依存しない   |
| Application  | Presentation   | アプリケーションはUI知識を持たない       |
| Presentation | Domain         | UIはドメインに直接アクセスしない         |
| Presentation | Infrastructure | UIは技術詳細に依存しない                 |

### 3.3 依存性注入ポイント

| 注入ポイント            | 注入先               | 注入される依存       |
| ----------------------- | -------------------- | -------------------- |
| ChatHistoryContext      | Use Case             | Repository実装       |
| Use Case コンストラクタ | Repository Interface | DrizzleXxxRepository |

---

## 4. 型分離ルール

### 4.1 Domain型

**目的**: ビジネスロジックを持つ純粋なエンティティ・値オブジェクト

**特徴**:

- classで実装
- ビジネスルールをメソッドとして持つ
- 不変条件をコンストラクタで保証
- インフラ技術に依存しない

**例**:

```typescript
// domain/entities/ChatSession.ts
export class ChatSession {
  private constructor(
    private readonly _id: ChatSessionId,
    private readonly _userId: string,
    private _title: ChatSessionTitle,
    private _isFavorite: boolean,
    private _isPinned: boolean,
    // ...
  ) {}

  static create(
    props: CreateChatSessionProps,
  ): Result<ChatSession, DomainError> {
    // ビジネスルールの検証
    if (!props.userId) {
      return Result.fail(new InvalidUserIdError());
    }
    // ...
  }

  updateTitle(newTitle: string): Result<void, DomainError> {
    const titleResult = ChatSessionTitle.create(newTitle);
    if (titleResult.isFailure) {
      return Result.fail(titleResult.error);
    }
    this._title = titleResult.value;
    return Result.ok();
  }

  toggleFavorite(): void {
    this._isFavorite = !this._isFavorite;
  }
}
```

### 4.2 DTO型

**目的**: レイヤー間のデータ転送用（プレーンオブジェクト）

**特徴**:

- interfaceまたはtype aliasで定義
- ビジネスロジックを持たない
- シリアライズ可能

**例**:

```typescript
// application/dto/ChatSessionDTO.ts
export interface ChatSessionDTO {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  pinOrder: number | null;
  lastMessagePreview: string | null;
}
```

### 4.3 Persistence型

**目的**: データベース固有の型（Drizzleスキーマから推論）

**特徴**:

- Drizzleスキーマの`$inferSelect`/`$inferInsert`で推論
- DBのカラム名（snake_case）を反映
- DB固有の制約を持つ

**例**:

```typescript
// db/schema/chat-history.ts（既存）
export type ChatSessionRecord = typeof chatSessions.$inferSelect;
export type NewChatSessionRecord = typeof chatSessions.$inferInsert;
```

### 4.4 Mapper

**目的**: 各型間の変換を明示的に定義

**例**:

```typescript
// infrastructure/persistence/mappers/ChatSessionMapper.ts
export class ChatSessionMapper {
  static toDomain(record: ChatSessionRecord): ChatSession {
    return ChatSession.reconstitute({
      id: ChatSessionId.create(record.id),
      userId: record.user_id,
      title: ChatSessionTitle.create(record.title),
      // ...
    });
  }

  static toDTO(entity: ChatSession): ChatSessionDTO {
    return {
      id: entity.id.value,
      userId: entity.userId,
      title: entity.title.value,
      // ...
    };
  }

  static toPersistence(entity: ChatSession): NewChatSessionRecord {
    return {
      id: entity.id.value,
      user_id: entity.userId,
      title: entity.title.value,
      // ...
    };
  }
}
```

---

## 5. Result型要件

### 5.1 Result型定義

**配置場所**: `packages/shared/src/core/Result.ts`

**要件**:

- 成功（`Ok<T>`）と失敗（`Err<E>`）を型安全に表現
- メソッドチェーンによる合成をサポート
- TypeScriptの型推論と互換性を持つ

**インターフェース**:

```typescript
interface Result<T, E = Error> {
  isSuccess: boolean;
  isFailure: boolean;
  value: T; // isSuccess時のみアクセス可能
  error: E; // isFailure時のみアクセス可能

  map<U>(fn: (value: T) => U): Result<U, E>;
  mapError<F>(fn: (error: E) => F): Result<T, F>;
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  unwrapOr(defaultValue: T): T;
  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U;
}
```

### 5.2 使用箇所

| レイヤー       | 使用場面                             |
| -------------- | ------------------------------------ |
| Domain         | エンティティ生成、ビジネスルール検証 |
| Application    | Use Case実行結果                     |
| Infrastructure | リポジトリ操作結果                   |

---

## 6. 統合テスト連携要件

### 6.1 レイヤー間インターフェース

| From         | To          | インターフェース                                   |
| ------------ | ----------- | -------------------------------------------------- |
| Application  | Domain      | `IChatSessionRepository`, `IChatMessageRepository` |
| Presentation | Application | Use Caseクラスの公開メソッド                       |

### 6.2 依存性注入ポイント

| コンポーネント | 注入方法                       | テスト時の代替     |
| -------------- | ------------------------------ | ------------------ |
| Repository     | コンストラクタインジェクション | InMemoryRepository |
| Use Case       | ChatHistoryContext経由         | MockUseCase        |

### 6.3 テスト容易性要件

- 各Use Caseは単体テスト可能（リポジトリをモック化）
- ドメインエンティティは純粋関数的にテスト可能
- UIコンポーネントはContextをモック化してテスト可能

---

## 7. 準拠チェックリスト

### 7.1 Domain層チェック

- [ ] エンティティがclassで実装されている
- [ ] 値オブジェクトが不変である
- [ ] ビジネスルールがエンティティ/値オブジェクトに集約されている
- [ ] リポジトリインターフェースがDomain層に配置されている
- [ ] ORM/フレームワークへのimportがない

### 7.2 Application層チェック

- [ ] Use Caseが単一責務である
- [ ] DTOがプレーンオブジェクトである
- [ ] Result型でエラーを表現している
- [ ] Infrastructure層へのimportがない

### 7.3 Infrastructure層チェック

- [ ] リポジトリ実装がインターフェースを実装している
- [ ] Mapperが型変換を担当している
- [ ] Presentation層へのimportがない

### 7.4 Presentation層チェック

- [ ] React ContextでDIを行っている
- [ ] カスタムHookでUse Caseにアクセスしている
- [ ] Domain層への直接importがない
- [ ] Infrastructure層への直接importがない

---

## 8. 参考資料

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Robert C. Martin
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/) - Eric Evans
- [Railway-Oriented Programming](https://fsharpforfunandprofit.com/rop/) - Scott Wlaschin
