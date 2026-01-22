# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 2                              |
| Phase名    | 設計                           |
| 前提Phase  | Phase 1（要件定義）            |
| 後続Phase  | Phase 3（設計レビューゲート）  |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | clean-architecture-refactoring |
| タスクID   | ARCH-001                       |

---

## 目的

Clean Architecture準拠の新しいディレクトリ構造・クラス設計を行う。

## 背景

Phase 1で定義したアーキテクチャ要件と移行戦略に基づき、具体的な設計を行う。設計はClean ArchitectureとDomain-Driven Designの原則に従い、テスト容易性と保守性を確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ドメインエンティティ設計

**目的**: Rich Domain Modelに基づくドメインエンティティを設計する

**実行手順**:

1. ChatSessionエンティティを設計する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/entities/ChatSession.ts
   export class ChatSession {
     private constructor(
       private readonly _id: ChatSessionId,
       private readonly _userId: UserId,
       private _title: ChatSessionTitle,
       private _preview: string,
       private _isFavorite: boolean,
       private _isPinned: boolean,
       private readonly _createdAt: Date,
       private _updatedAt: Date,
     ) {}

     // Factory Method
     static create(
       params: CreateChatSessionParams,
     ): Result<ChatSession, ChatSessionError>;

     // ビジネスロジック
     updateTitle(title: ChatSessionTitle): Result<void, ChatSessionError>;
     toggleFavorite(): void;
     togglePinned(): Result<void, PinLimitExceededError>;
     updatePreview(content: string): void;

     // Getters
     get id(): ChatSessionId;
     get userId(): UserId;
     get title(): ChatSessionTitle;
     // ... その他のゲッター
   }
   ```

2. ChatMessageエンティティを設計する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/entities/ChatMessage.ts
   export class ChatMessage {
     private constructor(
       private readonly _id: ChatMessageId,
       private readonly _sessionId: ChatSessionId,
       private readonly _role: MessageRole,
       private readonly _content: MessageContent,
       private readonly _messageIndex: number,
       private readonly _llmMetadata: LLMMetadata | null,
       private readonly _createdAt: Date,
     ) {}

     // Factory Method
     static createUserMessage(
       params: CreateUserMessageParams,
     ): Result<ChatMessage, MessageError>;
     static createAssistantMessage(
       params: CreateAssistantMessageParams,
     ): Result<ChatMessage, MessageError>;

     // Getters
     get id(): ChatMessageId;
     get sessionId(): ChatSessionId;
     get role(): MessageRole;
     get content(): MessageContent;
     // ... その他のゲッター
   }
   ```

**期待される成果物**:

- `outputs/phase-2/domain-entities-design.md` - エンティティ設計書

---

### タスク2: 値オブジェクト設計

**目的**: 不変条件を保証する値オブジェクトを設計する

**実行手順**:

1. ChatSessionId値オブジェクトを設計する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/value-objects/ChatSessionId.ts
   export class ChatSessionId {
     private constructor(private readonly _value: string) {}

     static create(value: string): Result<ChatSessionId, InvalidIdError>;
     static generate(): ChatSessionId;

     get value(): string;
     equals(other: ChatSessionId): boolean;
   }
   ```

2. ChatSessionTitle値オブジェクトを設計する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/value-objects/ChatSessionTitle.ts
   export class ChatSessionTitle {
     private static readonly MIN_LENGTH = 3;
     private static readonly MAX_LENGTH = 100;
     private static readonly DEFAULT_TITLE = "新しいチャット";

     private constructor(private readonly _value: string) {}

     static create(value: string): Result<ChatSessionTitle, InvalidTitleError>;
     static createDefault(): ChatSessionTitle;

     get value(): string;
     equals(other: ChatSessionTitle): boolean;
   }
   ```

3. MessageContent値オブジェクトを設計する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/value-objects/MessageContent.ts
   export class MessageContent {
     private static readonly MAX_LENGTH = 100000;

     private constructor(private readonly _value: string) {}

     static create(value: string): Result<MessageContent, InvalidContentError>;

     get value(): string;
     get preview(): string; // 先頭30文字
     equals(other: MessageContent): boolean;
   }
   ```

4. その他の値オブジェクトを設計する:
   - `ChatMessageId`
   - `UserId`
   - `MessageRole` (user | assistant)
   - `LLMMetadata`

**期待される成果物**:

- `outputs/phase-2/value-objects-design.md` - 値オブジェクト設計書

---

### タスク3: Use Case設計

**目的**: 単一責務のUse Caseクラスを設計する

**実行手順**:

1. CreateChatSessionUseCaseを設計する:

   ```typescript
   // packages/shared/src/features/chat-history/application/use-cases/CreateChatSessionUseCase.ts
   export interface CreateChatSessionInput {
     userId: string;
     title?: string;
   }

   export interface CreateChatSessionOutput {
     session: ChatSessionDTO;
   }

   export class CreateChatSessionUseCase {
     constructor(private readonly sessionRepository: IChatSessionRepository) {}

     async execute(
       input: CreateChatSessionInput,
     ): Promise<Result<CreateChatSessionOutput, UseCaseError>>;
   }
   ```

2. AddMessageUseCaseを設計する:

   ```typescript
   // packages/shared/src/features/chat-history/application/use-cases/AddMessageUseCase.ts
   export interface AddMessageInput {
     sessionId: string;
     role: "user" | "assistant";
     content: string;
     llmMetadata?: LLMMetadataDTO;
   }

   export interface AddMessageOutput {
     message: ChatMessageDTO;
     updatedSession: ChatSessionDTO;
   }

   export class AddMessageUseCase {
     constructor(
       private readonly sessionRepository: IChatSessionRepository,
       private readonly messageRepository: IChatMessageRepository,
     ) {}

     async execute(
       input: AddMessageInput,
     ): Promise<Result<AddMessageOutput, UseCaseError>>;
   }
   ```

3. その他のUse Caseを設計する:
   - `SearchSessionsUseCase`
   - `ExportSessionUseCase`
   - `UpdateSessionUseCase`
   - `DeleteSessionUseCase`
   - `ToggleFavoriteUseCase`
   - `TogglePinnedUseCase`
   - `GetSessionWithMessagesUseCase`
   - `ListSessionsUseCase`

**期待される成果物**:

- `outputs/phase-2/use-cases-design.md` - Use Case設計書

---

### タスク4: リポジトリインターフェース設計

**目的**: Domain層に配置するリポジトリインターフェースを設計する

**実行手順**:

1. IChatSessionRepositoryを設計する:

   ```typescript
   // packages/shared/src/features/chat-history/domain/repositories/IChatSessionRepository.ts
   export interface IChatSessionRepository {
     findById(id: ChatSessionId): Promise<ChatSession | null>;
     findByUserId(
       userId: UserId,
       options?: FindSessionsOptions,
     ): Promise<ChatSession[]>;
     save(session: ChatSession): Promise<void>;
     delete(id: ChatSessionId): Promise<void>;
     searchByKeyword(userId: UserId, keyword: string): Promise<ChatSession[]>;
     countPinned(userId: UserId): Promise<number>;
   }
   ```

2. IChatMessageRepositoryを設計する:
   ```typescript
   // packages/shared/src/features/chat-history/domain/repositories/IChatMessageRepository.ts
   export interface IChatMessageRepository {
     findById(id: ChatMessageId): Promise<ChatMessage | null>;
     findBySessionId(
       sessionId: ChatSessionId,
       options?: FindMessagesOptions,
     ): Promise<ChatMessage[]>;
     save(message: ChatMessage): Promise<void>;
     delete(id: ChatMessageId): Promise<void>;
     deleteBySessionId(sessionId: ChatSessionId): Promise<void>;
     getNextMessageIndex(sessionId: ChatSessionId): Promise<number>;
   }
   ```

**期待される成果物**:

- `outputs/phase-2/repository-interfaces-design.md` - リポジトリインターフェース設計書

---

### タスク5: マッパー・インフラ層設計

**目的**: Domain層とPersistence層を分離するマッパーを設計する

**実行手順**:

1. ChatSessionMapperを設計する:

   ```typescript
   // packages/shared/src/infrastructure/persistence/mappers/ChatSessionMapper.ts
   export class ChatSessionMapper {
     static toDomain(
       record: ChatSessionRecord,
     ): Result<ChatSession, MappingError>;
     static toPersistence(session: ChatSession): ChatSessionInsert;
     static toDTO(session: ChatSession): ChatSessionDTO;
   }
   ```

2. ChatMessageMapperを設計する:

   ```typescript
   // packages/shared/src/infrastructure/persistence/mappers/ChatMessageMapper.ts
   export class ChatMessageMapper {
     static toDomain(
       record: ChatMessageRecord,
     ): Result<ChatMessage, MappingError>;
     static toPersistence(message: ChatMessage): ChatMessageInsert;
     static toDTO(message: ChatMessage): ChatMessageDTO;
   }
   ```

3. Drizzleリポジトリ実装を設計する:

   ```typescript
   // packages/shared/src/infrastructure/persistence/drizzle/DrizzleChatSessionRepository.ts
   export class DrizzleChatSessionRepository implements IChatSessionRepository {
     constructor(private readonly db: DrizzleDB) {}

     // IChatSessionRepositoryの全メソッドを実装
   }
   ```

**期待される成果物**:

- `outputs/phase-2/infrastructure-design.md` - インフラ層設計書

---

### タスク6: DI・Context設計

**目的**: UI層からの依存性注入パターンを設計する

**実行手順**:

1. ChatHistoryContextを設計する:

   ```typescript
   // apps/desktop/src/contexts/ChatHistoryContext.tsx
   interface ChatHistoryContextValue {
     // Use Cases
     createSession: (
       input: CreateChatSessionInput,
     ) => Promise<Result<ChatSessionDTO, Error>>;
     addMessage: (
       input: AddMessageInput,
     ) => Promise<Result<ChatMessageDTO, Error>>;
     searchSessions: (
       keyword: string,
     ) => Promise<Result<ChatSessionDTO[], Error>>;
     // ... その他のUse Case

     // 状態
     currentSession: ChatSessionDTO | null;
     sessions: ChatSessionDTO[];
     isLoading: boolean;
     error: Error | null;
   }

   export const ChatHistoryContext =
     createContext<ChatHistoryContextValue | null>(null);
   ```

2. useChatHistoryフックを設計する:

   ```typescript
   // apps/desktop/src/hooks/useChatHistory.ts
   export function useChatHistory(): ChatHistoryContextValue {
     const context = useContext(ChatHistoryContext);
     if (!context) {
       throw new Error(
         "useChatHistory must be used within ChatHistoryProvider",
       );
     }
     return context;
   }
   ```

3. ChatHistoryProviderを設計する:
   ```typescript
   // apps/desktop/src/contexts/ChatHistoryProvider.tsx
   export function ChatHistoryProvider({ children }: { children: ReactNode }) {
     // リポジトリとUse Caseのインスタンス化
     // 状態管理
     // Contextへの提供
   }
   ```

**期待される成果物**:

- `outputs/phase-2/di-context-design.md` - DI・Context設計書

---

### タスク7: Result型設計

**目的**: Railway-Oriented Programming用のResult型を設計する

**実行手順**:

1. Result型を設計する:

   ```typescript
   // packages/shared/src/core/Result.ts
   export type Result<T, E> = Ok<T> | Err<E>;

   export class Ok<T> {
     readonly ok = true;
     constructor(readonly value: T) {}

     map<U>(fn: (value: T) => U): Result<U, never>;
     flatMap<U, E2>(fn: (value: T) => Result<U, E2>): Result<U, E2>;
     getOrElse(defaultValue: T): T;
     getOrThrow(): T;
   }

   export class Err<E> {
     readonly ok = false;
     constructor(readonly error: E) {}

     map<U>(fn: (value: never) => U): Result<never, E>;
     flatMap<U, E2>(fn: (value: never) => Result<U, E2>): Result<never, E>;
     getOrElse<T>(defaultValue: T): T;
     getOrThrow(): never;
   }

   export const ok = <T>(value: T): Ok<T> => new Ok(value);
   export const err = <E>(error: E): Err<E> => new Err(error);
   ```

2. エラー型階層を設計する:

   ```typescript
   // packages/shared/src/core/errors/index.ts
   export abstract class DomainError extends Error {
     abstract readonly code: string;
   }

   export class ChatSessionError extends DomainError {
     /* ... */
   }
   export class ChatMessageError extends DomainError {
     /* ... */
   }
   export class RepositoryError extends DomainError {
     /* ... */
   }
   export class UseCaseError extends DomainError {
     /* ... */
   }
   ```

**期待される成果物**:

- `outputs/phase-2/result-type-design.md` - Result型設計書

---

### タスク8: アーキテクチャ図・ADR作成

**目的**: 設計を文書化し、アーキテクチャ決定記録を作成する

**実行手順**:

1. レイヤー図を作成する（Mermaid形式）:

   ```mermaid
   graph TB
     subgraph "Presentation Layer"
       UI[React Components]
       Context[ChatHistoryContext]
       Hooks[useChatHistory]
     end

     subgraph "Application Layer"
       UC[Use Cases]
       DTO[DTOs]
     end

     subgraph "Domain Layer"
       Entity[Entities]
       VO[Value Objects]
       RepoInterface[Repository Interfaces]
     end

     subgraph "Infrastructure Layer"
       RepoImpl[Repository Implementations]
       Mapper[Mappers]
       DB[(SQLite/Drizzle)]
     end

     UI --> Context
     Context --> Hooks
     Hooks --> UC
     UC --> Entity
     UC --> RepoInterface
     RepoImpl --> RepoInterface
     RepoImpl --> Mapper
     Mapper --> Entity
     Mapper --> DB
   ```

2. ADR-001を作成する（Clean Architecture採用決定）:
   - タイトル: Clean Architecture採用
   - ステータス: 採用
   - コンテキスト: 現状の問題点
   - 決定: Clean Architectureの採用
   - 結果: 期待される効果とトレードオフ

**期待される成果物**:

- `outputs/phase-2/architecture-design.md` - アーキテクチャ設計書（図含む）
- `outputs/phase-2/adr-001-clean-architecture-adoption.md` - ADR

---

## 参照資料

| 参照資料             | パス                                               | 内容                  |
| -------------------- | -------------------------------------------------- | --------------------- |
| Phase 1成果物        | `outputs/phase-1/`                                 | 要件定義成果物        |
| 現状分析レポート     | `outputs/phase-1/current-architecture-analysis.md` | 違反箇所の詳細分析    |
| アーキテクチャ要件書 | `outputs/phase-1/architecture-requirements.md`     | 新アーキテクチャ要件  |
| 移行戦略書           | `outputs/phase-1/migration-strategy.md`            | Strangler Fig適用計画 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                       |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 既存Repository/Service仕様 |
| アーキテクチャパターン       | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | 既存設計パターン           |
| データベース実装             | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM仕様            |

---

## 成果物

| 成果物                           | パス                                                     | 内容                         |
| -------------------------------- | -------------------------------------------------------- | ---------------------------- |
| エンティティ設計書               | `outputs/phase-2/domain-entities-design.md`              | ChatSession/ChatMessage設計  |
| 値オブジェクト設計書             | `outputs/phase-2/value-objects-design.md`                | 値オブジェクト設計           |
| Use Case設計書                   | `outputs/phase-2/use-cases-design.md`                    | Use Case設計                 |
| リポジトリインターフェース設計書 | `outputs/phase-2/repository-interfaces-design.md`        | リポジトリIF設計             |
| インフラ層設計書                 | `outputs/phase-2/infrastructure-design.md`               | マッパー・リポジトリ実装設計 |
| DI・Context設計書                | `outputs/phase-2/di-context-design.md`                   | React Context DI設計         |
| Result型設計書                   | `outputs/phase-2/result-type-design.md`                  | Result型・エラー型設計       |
| アーキテクチャ設計書             | `outputs/phase-2/architecture-design.md`                 | 全体設計・レイヤー図         |
| ADR-001                          | `outputs/phase-2/adr-001-clean-architecture-adoption.md` | アーキテクチャ決定記録       |

---

## 統合テスト連携

依存関係ルール・インターフェース設計を設計に反映すること:

- レイヤー間の依存方向が正しいことを設計で保証
- インターフェースを介した疎結合設計
- テストダブル（モック/スタブ）注入ポイントの明確化
- 各レイヤーの単体テスト可能性の確保

---

## 完了条件

- [ ] 全エンティティの設計が完了している
- [ ] 全値オブジェクトの設計が完了している
- [ ] 全Use Caseの設計が完了している
- [ ] リポジトリインターフェースの設計が完了している
- [ ] マッパー・リポジトリ実装の設計が完了している
- [ ] React Context/Hook DIパターンの設計が完了している
- [ ] Result型・エラー型階層の設計が完了している
- [ ] アーキテクチャ図（Mermaid）が作成されている
- [ ] ADR-001が作成されている
- [ ] 全成果物が `outputs/phase-2/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 2ステータスを更新

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/clean-architecture-refactoring/phase-3-design-review.md`
