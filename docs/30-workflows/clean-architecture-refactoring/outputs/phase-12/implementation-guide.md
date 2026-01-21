# Chat History Feature - 実装ガイド

## 概要

このドキュメントはClean Architectureリファクタリング後のchat-history機能の実装ガイドです。

- **Part 1**: 概念的説明（初学者・非技術者向け）
- **Part 2**: 技術的詳細（開発者・技術者向け）

---

# Part 1: 概念的説明

## 1. Clean Architectureとは？

### 日常の例えで理解する

Clean Architectureは「整理整頓された家」のようなものです。

**従来のコード（片付いていない部屋）:**

- 服、本、食器が同じ場所に置かれている
- 何かを探すのに時間がかかる
- 一つを動かすと他のものも崩れる

**Clean Architecture（整理整頓された家）:**

- 服はクローゼット、本は本棚、食器は食器棚
- 必要なものがすぐに見つかる
- 一つの棚を変えても他に影響しない

### レストランの例え

私たちのシステムを「レストラン」に例えてみましょう:

```
┌──────────────────────────────────────────┐
│            お客様（UI Layer）            │
│    メニューを見て注文を伝える            │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│         ウェイター（Application Layer）   │
│    注文を受けて、厨房に伝える            │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│           シェフ（Domain Layer）          │
│    レシピ通りに料理を作る                │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│    倉庫・冷蔵庫（Infrastructure Layer）   │
│    食材を保管・提供する                  │
└──────────────────────────────────────────┘
```

| レイヤー       | レストランでの役割     | システムでの役割           |
| -------------- | ---------------------- | -------------------------- |
| UI             | お客様がメニューを見る | 画面を表示、ボタンを押す   |
| Application    | ウェイターが注文を運ぶ | 操作を受けて処理を依頼     |
| Domain         | シェフがレシピ通り調理 | ビジネスルールを守って処理 |
| Infrastructure | 倉庫が食材を出し入れ   | データベースの読み書き     |

### なぜこの構造が大切？

**問題のあるレストラン（旧アーキテクチャ）:**

- シェフが直接倉庫に食材を取りに行く
- ウェイターがいないので混乱する
- 倉庫が変わるとシェフも変えなければならない

**問題を解決したレストラン（新アーキテクチャ）:**

- それぞれが自分の仕事に集中できる
- 倉庫が変わってもシェフのレシピは変わらない
- 新メニュー追加も簡単

---

## 2. chat-history機能で何が変わった？

### Before（リファクタリング前）

```
ChatHistoryService（なんでも屋）
├── データベース操作
├── ビジネスルール
├── データ変換
└── エラー処理
```

**問題点:**

- 1つのファイルが大きすぎて理解しにくい
- テストが難しい
- 変更すると他に影響が出やすい

### After（リファクタリング後）

```
Domain Layer（ルール担当）
├── ChatSession（会話のルール）
├── ChatMessage（メッセージのルール）
└── 値オブジェクト（データの検証）

Application Layer（指示担当）
├── CreateChatSessionUseCase（新規作成）
├── AddUserMessageUseCase（メッセージ追加）
└── SearchSessionsUseCase（検索）

Infrastructure Layer（保管担当）
└── Mappers（データ変換）
```

### ビジネス価値

| メリット             | 説明                                 |
| -------------------- | ------------------------------------ |
| バグが減る           | 各部品が小さくテストしやすい         |
| 開発スピードが上がる | 変更箇所が明確で影響範囲が限定される |
| 新人が理解しやすい   | 役割分担が明確                       |
| 将来の変更に強い     | データベースを変えても本体は無傷     |

---

## 3. 主要な概念

### エンティティ（Entity）

「固有のIDを持つもの」です。

- **ChatSession**: 会話全体を表す（ID付き）
- **ChatMessage**: 1つのメッセージを表す（ID付き）

例: 「山田さんとの2024年1月の会話」は固有のChatSession

### 値オブジェクト（Value Object）

「値そのもの」です。IDは持ちません。

- **ChatSessionTitle**: セッションのタイトル（「新規会話」など）
- **MessageContent**: メッセージの内容
- **UserId**: ユーザーのID

例: 「こんにちは」という文字列は、どの会話で使っても同じ「こんにちは」

### ユースケース（Use Case）

「1つの操作」を表します。

- **CreateChatSessionUseCase**: 新しい会話を始める
- **AddUserMessageUseCase**: メッセージを追加する
- **TogglePinnedUseCase**: ピン留めのON/OFF

---

## 4. まとめ

Clean Architectureは「整理整頓」の考え方です。

- **役割を分ける**: 各レイヤーが専門の仕事を持つ
- **依存の方向を守る**: 外側から内側への一方通行
- **変更に強くなる**: 一部を変えても全体は壊れない

これにより、chat-history機能は:

- テストカバレッジ84%以上
- アーキテクチャ準拠率100%
- 保守性の大幅向上

を達成しました。

---

# Part 2: 技術的詳細

## 1. アーキテクチャ概要

### レイヤー構成

```
┌─────────────────────────────────────────────────┐
│                    UI Layer                      │
│          (React Components, Context, Hooks)      │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│               Application Layer                  │
│               (Use Cases, DTOs)                  │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                 Domain Layer                     │
│    (Entities, Value Objects, Repository IF)      │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│             Infrastructure Layer                 │
│          (Drizzle Repositories, Mappers)         │
└─────────────────────────────────────────────────┘
```

### 依存関係ルール

```
Domain        → なし（純粋なビジネスロジック）
Application   → Domain
Infrastructure → Domain, Application
UI            → Application, Domain
```

**重要**: 依存は常に内側（Domain）に向かう。Domainは何にも依存しない。

### ディレクトリ構成

```
packages/shared/src/
├── core/
│   ├── Result.ts              # Result<T, E>型
│   └── errors/
│       ├── index.ts
│       ├── AppError.ts        # 基底エラークラス
│       ├── DomainError.ts     # ドメインエラー
│       └── UseCaseError.ts    # Use Caseエラー
└── features/chat-history/
    ├── domain/
    │   ├── entities/
    │   │   ├── ChatSession.ts
    │   │   └── ChatMessage.ts
    │   ├── value-objects/
    │   │   ├── ChatSessionId.ts
    │   │   ├── ChatSessionTitle.ts
    │   │   ├── UserId.ts
    │   │   ├── ChatMessageId.ts
    │   │   ├── MessageContent.ts
    │   │   └── MessageRole.ts
    │   └── repositories/
    │       ├── IChatSessionRepository.ts
    │       └── IChatMessageRepository.ts
    ├── application/
    │   ├── dto/
    │   │   └── index.ts
    │   ├── use-cases/
    │   │   ├── CreateChatSessionUseCase.ts
    │   │   ├── AddUserMessageUseCase.ts
    │   │   ├── AddAssistantMessageUseCase.ts
    │   │   ├── TogglePinnedUseCase.ts
    │   │   └── SearchSessionsUseCase.ts
    │   └── transformers.ts    # DTO変換
    └── infrastructure/
        └── persistence/
            ├── mappers/
            │   ├── ChatSessionMapper.ts
            │   └── ChatMessageMapper.ts
            └── records/
                └── index.ts   # DB Record型
```

---

## 2. Domain Layer詳細

### エンティティ

#### ChatSession

```typescript
export class ChatSession {
  private constructor(
    private readonly _id: ChatSessionId,
    private readonly _userId: UserId,
    private _title: ChatSessionTitle,
    private _messages: ChatMessage[],
    private _isPinned: boolean,
    private _isFavorite: boolean,
    private _pinOrder: number | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  // ファクトリメソッド（新規作成）
  static create(params: {
    userId: UserId;
    title?: ChatSessionTitle;
  }): Result<ChatSession, ValidationError>;

  // ファクトリメソッド（DBから復元）
  static reconstitute(params: {...}): ChatSession;

  // ビジネスロジック
  addMessage(message: ChatMessage): void;
  updateTitle(title: ChatSessionTitle): void;
  togglePinned(): Result<void, BusinessRuleError>;
  toggleFavorite(): void;
  getPreview(): string;

  // ゲッター
  get id(): ChatSessionId;
  get userId(): UserId;
  get title(): ChatSessionTitle;
  // ...
}
```

**ポイント:**

- コンストラクタはprivate（直接newできない）
- `create()`で新規作成、`reconstitute()`でDB復元
- ビジネスルールはエンティティ内にカプセル化

#### ChatMessage

```typescript
export class ChatMessage {
  private constructor(
    private readonly _id: ChatMessageId,
    private readonly _sessionId: ChatSessionId,
    private readonly _role: MessageRole,
    private readonly _content: MessageContent,
    private readonly _createdAt: Date,
  ) {}

  static create(params: {
    sessionId: ChatSessionId;
    role: MessageRole;
    content: MessageContent;
  }): Result<ChatMessage, ValidationError>;

  static reconstitute(params: {...}): ChatMessage;
}
```

### 値オブジェクト

#### 基本パターン

```typescript
export class ChatSessionId {
  private constructor(private readonly _value: string) {}

  static create(value: string): Result<ChatSessionId, InvalidIdError> {
    if (!isValidUuid(value)) {
      return err(new InvalidIdError("無効なUUID形式です"));
    }
    return ok(new ChatSessionId(value));
  }

  static generate(): ChatSessionId {
    return new ChatSessionId(crypto.randomUUID());
  }

  get value(): string {
    return this._value;
  }

  equals(other: ChatSessionId): boolean {
    return this._value === other._value;
  }
}
```

**値オブジェクト一覧:**

| 値オブジェクト   | バリデーション           |
| ---------------- | ------------------------ |
| ChatSessionId    | UUID形式                 |
| ChatSessionTitle | 3-255文字、空文字不可    |
| UserId           | UUID形式                 |
| ChatMessageId    | UUID形式                 |
| MessageContent   | 空文字不可、1-100000文字 |
| MessageRole      | "user" \| "assistant"    |

### リポジトリインターフェース

```typescript
export interface IChatSessionRepository {
  findById(id: ChatSessionId): Promise<ChatSession | null>;
  findByUserId(userId: UserId): Promise<ChatSession[]>;
  findPinnedByUserId(userId: UserId): Promise<ChatSession[]>;
  save(session: ChatSession): Promise<Result<void, RepositoryError>>;
  delete(id: ChatSessionId): Promise<Result<void, RepositoryError>>;
  search(query: SearchQuery): Promise<SearchResult>;
  countPinnedByUserId(userId: UserId): Promise<number>;
}

export interface IChatMessageRepository {
  findById(id: ChatMessageId): Promise<ChatMessage | null>;
  findBySessionId(sessionId: ChatSessionId): Promise<ChatMessage[]>;
  save(message: ChatMessage): Promise<Result<void, RepositoryError>>;
  delete(id: ChatMessageId): Promise<Result<void, RepositoryError>>;
}
```

---

## 3. Application Layer詳細

### Use Case

#### 基本パターン

```typescript
export class CreateChatSessionUseCase {
  constructor(private readonly sessionRepository: IChatSessionRepository) {}

  async execute(
    input: CreateChatSessionInput,
  ): Promise<Result<ChatSessionDTO, UseCaseError>> {
    // 1. 値オブジェクト生成
    const userIdResult = UserId.create(input.userId);
    if (userIdResult.isErr()) {
      return err(
        new UseCaseError("INVALID_USER_ID", userIdResult.error.message),
      );
    }

    // 2. エンティティ生成
    const sessionResult = ChatSession.create({
      userId: userIdResult.value,
      title: input.title
        ? ChatSessionTitle.create(input.title).unwrapOr(undefined)
        : undefined,
    });
    if (sessionResult.isErr()) {
      return err(
        new UseCaseError("VALIDATION_ERROR", sessionResult.error.message),
      );
    }

    // 3. 永続化
    const saveResult = await this.sessionRepository.save(sessionResult.value);
    if (saveResult.isErr()) {
      return err(new UseCaseError("REPOSITORY_ERROR", "保存に失敗しました"));
    }

    // 4. DTO変換して返却
    return ok(toSessionDTO(sessionResult.value));
  }
}
```

#### Use Case一覧

| Use Case                   | 入力                      | 出力            | 処理                   |
| -------------------------- | ------------------------- | --------------- | ---------------------- |
| CreateChatSessionUseCase   | userId, title?            | ChatSessionDTO  | 新規セッション作成     |
| AddUserMessageUseCase      | sessionId, content        | ChatMessageDTO  | ユーザーメッセージ追加 |
| AddAssistantMessageUseCase | sessionId, content        | ChatMessageDTO  | AIメッセージ追加       |
| TogglePinnedUseCase        | sessionId                 | ChatSessionDTO  | ピン留めトグル         |
| SearchSessionsUseCase      | userId, query, pagination | SearchResultDTO | セッション検索         |

### DTO

```typescript
// ChatSessionDTO
export interface ChatSessionDTO {
  id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  isFavorite: boolean;
  pinOrder: number | null;
  messageCount: number;
  preview: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ChatMessageDTO
export interface ChatMessageDTO {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string; // ISO 8601
}

// SearchResultDTO
export interface SearchResultDTO {
  sessions: ChatSessionDTO[];
  total: number;
  hasMore: boolean;
}
```

### transformers.ts（DTO変換）

```typescript
export function toSessionDTO(session: ChatSession): ChatSessionDTO {
  return {
    id: session.id.value,
    userId: session.userId.value,
    title: session.title.value,
    isPinned: session.isPinned,
    isFavorite: session.isFavorite,
    pinOrder: session.pinOrder,
    messageCount: session.messages.length,
    preview: session.getPreview(),
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export function toMessageDTO(message: ChatMessage): ChatMessageDTO {
  return {
    id: message.id.value,
    sessionId: message.sessionId.value,
    role: message.role.value,
    content: message.content.value,
    createdAt: message.createdAt.toISOString(),
  };
}
```

---

## 4. Infrastructure Layer詳細

### Mapper

#### ChatSessionMapper

```typescript
export class ChatSessionMapper {
  // DB Record → Domain Entity
  static toDomain(
    record: ChatSessionRecord,
    messages: ChatMessage[] = [],
  ): Result<ChatSession, DomainError> {
    const idResult = ChatSessionId.create(record.id);
    const userIdResult = UserId.create(record.userId);
    const titleResult = ChatSessionTitle.create(record.title);

    if (idResult.isErr() || userIdResult.isErr() || titleResult.isErr()) {
      return err(new BusinessRuleError("MAPPING_ERROR", "無効なレコード"));
    }

    return ok(
      ChatSession.reconstitute({
        id: idResult.value,
        userId: userIdResult.value,
        title: titleResult.value,
        messages,
        isPinned: record.isPinned,
        isFavorite: record.isFavorite,
        pinOrder: record.pinOrder,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }),
    );
  }

  // Domain Entity → DB Record
  static toPersistence(session: ChatSession): ChatSessionRecord {
    return {
      id: session.id.value,
      userId: session.userId.value,
      title: session.title.value,
      isPinned: session.isPinned,
      isFavorite: session.isFavorite,
      pinOrder: session.pinOrder,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  // Domain Entity → DTO
  static toDTO(session: ChatSession): ChatSessionDTO {
    return toSessionDTO(session);
  }
}
```

### Record型

```typescript
export interface ChatSessionRecord {
  id: string;
  userId: string;
  title: string;
  isPinned: boolean;
  isFavorite: boolean;
  pinOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: Date;
}
```

---

## 5. エラーハンドリング

### Result型

```typescript
// 基本構造
type Result<T, E> = Ok<T> | Err<E>;

// 使用例
const result = ChatSession.create({ userId, title });

if (result.isOk()) {
  const session = result.value; // ChatSession
} else {
  const error = result.error; // ValidationError
}

// メソッドチェーン
const dto = result
  .map((session) => toSessionDTO(session))
  .mapErr((err) => new UseCaseError("VALIDATION", err.message));
```

### エラー階層

```
AppError (abstract)
├── DomainError (abstract)
│   ├── ValidationError
│   ├── BusinessRuleError
│   └── InvalidIdError
└── UseCaseError
    └── code: string
    └── statusCode: number
    └── data?: Record<string, unknown>
```

---

## 6. 新機能追加手順

### Step 1: Domain Layer

1. **値オブジェクトの追加**（必要な場合）

   ```typescript
   // domain/value-objects/NewValueObject.ts
   export class NewValueObject {
     static create(value: string): Result<NewValueObject, ValidationError>;
   }
   ```

2. **エンティティの更新/追加**

   ```typescript
   // domain/entities/NewEntity.ts
   export class NewEntity {
     static create(params): Result<NewEntity, ValidationError>;
     static reconstitute(params): NewEntity;
     // ビジネスメソッド
   }
   ```

3. **リポジトリインターフェースの更新**
   ```typescript
   // domain/repositories/INewEntityRepository.ts
   export interface INewEntityRepository {
     findById(id: NewEntityId): Promise<NewEntity | null>;
     save(entity: NewEntity): Promise<Result<void, RepositoryError>>;
   }
   ```

### Step 2: Application Layer

1. **DTOの追加**

   ```typescript
   // application/dto/index.ts
   export interface NewEntityDTO { ... }
   ```

2. **Use Caseの追加**

   ```typescript
   // application/use-cases/NewFeatureUseCase.ts
   export class NewFeatureUseCase {
     constructor(private readonly repository: INewEntityRepository) {}
     async execute(input): Promise<Result<NewEntityDTO, UseCaseError>>;
   }
   ```

3. **transformers.tsの更新**
   ```typescript
   export function toNewEntityDTO(entity: NewEntity): NewEntityDTO { ... }
   ```

### Step 3: Infrastructure Layer

1. **Mapperの追加**

   ```typescript
   // infrastructure/persistence/mappers/NewEntityMapper.ts
   export class NewEntityMapper {
     static toDomain(record): Result<NewEntity, DomainError>;
     static toPersistence(entity): NewEntityRecord;
     static toDTO(entity): NewEntityDTO;
   }
   ```

2. **リポジトリ実装の追加**（本番用）
   ```typescript
   // infrastructure/persistence/drizzle/NewEntityRepository.ts
   export class DrizzleNewEntityRepository implements INewEntityRepository {
     // 実装
   }
   ```

### Step 4: テスト追加

1. **ドメイン層テスト**
   - エンティティのテスト
   - 値オブジェクトのテスト

2. **Use Caseテスト**
   - モックリポジトリを使用
   - 正常系・異常系をカバー

3. **アーキテクチャテスト**
   - 依存関係ルールの検証を追加

---

## 7. トラブルシューティング

### よくあるエラー

#### 「INVALID_ID: 無効なUUID形式です」

**原因**: UUID以外の値をIDとして使用

**解決**:

```typescript
// ❌ 間違い
const id = ChatSessionId.create("my-session");

// ✅ 正解
const id = ChatSessionId.generate(); // 新規生成
const id = ChatSessionId.create("550e8400-e29b-41d4-a716-446655440000"); // UUID
```

#### 「PINNED_LIMIT_EXCEEDED: ピン留め上限に達しています」

**原因**: ピン留め上限（10件）を超えている

**解決**:

```typescript
// 事前にカウントを確認
const count = await repository.countPinnedByUserId(userId);
if (count >= 10) {
  // ユーザーに通知
}
```

#### 「MAPPING_ERROR: 無効なレコード」

**原因**: DBレコードの値がバリデーションを通過しない

**解決**:

- DBのデータ整合性を確認
- マイグレーションでデータを修正

### デバッグ方法

```typescript
// Result型のデバッグ
const result = someOperation();
console.log("isOk:", result.isOk());
if (result.isErr()) {
  console.log("error:", result.error);
}

// ドメインオブジェクトの確認
const session = ChatSession.create({ userId, title });
if (session.isOk()) {
  console.log(
    "session:",
    JSON.stringify({
      id: session.value.id.value,
      title: session.value.title.value,
    }),
  );
}
```

---

## 8. テスト

### ドメイン層テスト例

```typescript
describe("ChatSession", () => {
  it("should create a session with valid data", () => {
    const userId = UserId.generate();
    const title = ChatSessionTitle.create("テスト会話").unwrap();

    const result = ChatSession.create({ userId, title });

    expect(result.isOk()).toBe(true);
    expect(result.value.title.value).toBe("テスト会話");
  });

  it("should enforce pinned limit", async () => {
    const session = createSessionWithPinnedCount(10);
    const result = session.togglePinned();

    expect(result.isErr()).toBe(true);
    expect(result.error.code).toBe("PINNED_LIMIT_EXCEEDED");
  });
});
```

### Use Caseテスト例

```typescript
describe("CreateChatSessionUseCase", () => {
  let useCase: CreateChatSessionUseCase;
  let mockRepository: IChatSessionRepository;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn().mockResolvedValue(ok(undefined)),
      // ...
    };
    useCase = new CreateChatSessionUseCase(mockRepository);
  });

  it("should create a session", async () => {
    const result = await useCase.execute({
      userId: "550e8400-e29b-41d4-a716-446655440000",
      title: "新規会話",
    });

    expect(result.isOk()).toBe(true);
    expect(mockRepository.save).toHaveBeenCalled();
  });
});
```

---

## 9. 参考情報

### 関連ドキュメント

| ドキュメント               | パス                                                |
| -------------------------- | --------------------------------------------------- |
| 設計ドキュメント           | `outputs/phase-2/`                                  |
| ADR                        | `outputs/phase-2/adr-001-*.md`                      |
| テストレポート             | `outputs/phase-7/coverage-report.md`                |
| アーキテクチャ準拠レポート | `outputs/phase-9/architecture-compliance-report.md` |

### 品質指標

| 指標                 | 目標 | 達成値 |
| -------------------- | ---- | ------ |
| Line Coverage        | ≥80% | 84.1%  |
| Branch Coverage      | ≥60% | 93.57% |
| Function Coverage    | ≥80% | 90.23% |
| アーキテクチャ準拠率 | 100% | 100%   |

---

**作成日**: 2026-01-19
**作成者**: Claude Code
**バージョン**: 1.0.0
