# チャット履歴機能 - アーキテクチャ仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
> 更新日: 2026-01-26
> 関連タスク: ARCH-001 Clean Architecture Refactoring, UT-006 React Context DI実装

---

## 概要

チャット履歴機能はClean Architecture準拠の4層アーキテクチャで実装されている。
アーキテクチャ準拠率100%を達成し、Domain層の純粋性を維持している。

---

## レイヤー構成

チャット履歴機能は以下の4層構造で構成される。依存関係は上位から下位へ一方向に向かう。

| 層番号 | レイヤー名           | 構成要素                             | 説明                     |
| ------ | -------------------- | ------------------------------------ | ------------------------ |
| 1      | UI Layer             | React Components, Context, Hooks     | ユーザーインターフェース |
| 2      | Application Layer    | Use Cases, DTOs                      | アプリケーションロジック |
| 3      | Domain Layer         | Entities, Value Objects, Repository IF | ビジネスルール           |
| 4      | Infrastructure Layer | Drizzle Repositories, Mappers        | 外部システム連携         |

**依存方向**: UI → Application → Domain ← Infrastructure

---

## 依存関係ルール

| レイヤー       | 依存先              | 備考                       |
| -------------- | ------------------- | -------------------------- |
| Domain         | なし                | 純粋なビジネスロジック     |
| Application    | Domain              | Use CaseがDomainを使用     |
| Infrastructure | Domain, Application | 実装がインターフェース依存 |
| UI             | Application, Domain | DTOとUse Caseを使用        |

**重要**: 依存は常に内側（Domain）に向かう。Domainは何にも依存しない。

---

## ディレクトリ構成

### コアモジュール（packages/shared/src/core/）

| ファイル          | 説明                 |
| ----------------- | -------------------- |
| Result.ts         | Result型の定義 |
| errors/index.ts   | エラー型エクスポート |
| errors/AppError.ts | 基底エラークラス     |
| errors/DomainError.ts | ドメインエラー（抽象） |
| errors/UseCaseError.ts | Use Caseエラー      |

### チャット履歴機能（packages/shared/src/features/chat-history/）

#### Domainレイヤー

| ディレクトリ/ファイル            | 説明                   |
| -------------------------------- | ---------------------- |
| domain/entities/ChatSession.ts   | セッションエンティティ |
| domain/entities/ChatMessage.ts   | メッセージエンティティ |
| domain/value-objects/ChatSessionId.ts | セッションID値オブジェクト |
| domain/value-objects/ChatSessionTitle.ts | セッションタイトル値オブジェクト |
| domain/value-objects/UserId.ts   | ユーザーID値オブジェクト |
| domain/value-objects/ChatMessageId.ts | メッセージID値オブジェクト |
| domain/value-objects/MessageContent.ts | メッセージ内容値オブジェクト |
| domain/value-objects/MessageRole.ts | メッセージ役割値オブジェクト |
| domain/repositories/IChatSessionRepository.ts | セッションリポジトリインターフェース |
| domain/repositories/IChatMessageRepository.ts | メッセージリポジトリインターフェース |

#### Applicationレイヤー

| ディレクトリ/ファイル                    | 説明                 |
| ---------------------------------------- | -------------------- |
| application/dto/index.ts                 | DTOs定義             |
| application/use-cases/CreateChatSessionUseCase.ts | セッション作成Use Case |
| application/use-cases/AddUserMessageUseCase.ts | ユーザーメッセージ追加Use Case |
| application/use-cases/AddAssistantMessageUseCase.ts | AIメッセージ追加Use Case |
| application/use-cases/TogglePinnedUseCase.ts | ピン留めトグルUse Case |
| application/use-cases/SearchSessionsUseCase.ts | セッション検索Use Case |
| application/transformers.ts              | DTO変換              |

#### Infrastructureレイヤー

| ディレクトリ/ファイル                              | 説明                   |
| -------------------------------------------------- | ---------------------- |
| infrastructure/persistence/DrizzleChatSessionRepository.ts | セッションリポジトリ実装 |
| infrastructure/persistence/DrizzleChatMessageRepository.ts | メッセージリポジトリ実装 |
| infrastructure/persistence/index.ts                | エクスポート           |
| infrastructure/persistence/mappers/ChatSessionMapper.ts | セッション変換         |
| infrastructure/persistence/mappers/ChatMessageMapper.ts | メッセージ変換         |
| infrastructure/persistence/records/index.ts        | DB Record型            |
| infrastructure/persistence/__tests__/              | テストファイル群       |

---

## UI Layer

### React Context DI

チャット履歴機能のPresentation層におけるDependency Injectionパターン。

| コンポーネント          | パス                                                      | 責務                                |
| ----------------------- | --------------------------------------------------------- | ----------------------------------- |
| ChatHistoryContext      | apps/desktop/src/features/chat-history/context/           | Context型定義（5種Use Cases+isReady）|
| ChatHistoryProvider     | apps/desktop/src/features/chat-history/context/           | Use CasesのDI Provider              |
| useChatHistory          | apps/desktop/src/features/chat-history/hooks/             | Context取得Hook                     |
| MockChatHistoryProvider | apps/desktop/src/features/chat-history/context/__mocks__/ | テスト用MockProvider                |
| repositoriesファクトリー | apps/desktop/src/features/chat-history/repositories/      | Repository DIシングルトン            |

#### ChatHistoryContextValue

ChatHistoryContextが提供する値オブジェクトの構成を以下に示す。

| プロパティ          | 型                          | 説明                     |
| ------------------- | --------------------------- | ------------------------ |
| createSession       | CreateChatSessionUseCase    | セッション作成Use Case   |
| addUserMessage      | AddUserMessageUseCase       | ユーザーメッセージ追加   |
| addAssistantMessage | AddAssistantMessageUseCase  | AIメッセージ追加         |
| togglePinned        | TogglePinnedUseCase         | ピン留めトグル           |
| searchSessions      | SearchSessionsUseCase       | セッション検索           |
| isReady             | boolean                     | 初期化完了フラグ         |

#### Repository Factory（シングルトンDI）

Repository Factoryはシングルトンパターンで実装され、Main Processで一度だけ初期化される。

**初期化フロー**:
1. Main ProcessでcreateChatHistoryRepositories関数を呼び出し、drizzleDbインスタンスを渡して初期化
2. Renderer ProcessでgetChatHistoryRepositories関数を呼び出し、sessionRepositoryとmessageRepositoryを取得

| 関数                          | 説明                              |
| ----------------------------- | --------------------------------- |
| createChatHistoryRepositories | リポジトリ初期化（Main Process）  |
| getChatHistoryRepositories    | リポジトリ取得（Renderer Process）|
| isRepositoriesInitialized     | 初期化済み確認                    |
| resetRepositories             | リセット（テスト用）              |

#### App.tsx統合パターン

App.tsxでのChatHistoryProvider統合は以下の手順で行う。

1. ChatHistoryProviderとgetChatHistoryRepositoriesをインポート
2. getChatHistoryRepositories関数でsessionRepositoryとmessageRepositoryを取得
3. ChatHistoryProviderコンポーネントで両リポジトリをpropsとして渡す
4. 子コンポーネント（AuthGuard、Routes等）をProvider内に配置
5. 全ルートでuseChatHistory Hookが使用可能になる

#### 使用パターン

**本番環境**: App.tsx統合済みの状態で、任意のコンポーネントからuseChatHistory Hookを呼び出し、createSession、addUserMessage、isReady等のプロパティにアクセス可能。

**テスト環境**: MockChatHistoryProviderでテスト対象コンポーネントをラップし、overrides propsで必要なUse Caseをモック化して使用。

---

## Domain Layer

### エンティティ

#### ChatSession

| プロパティ | 型               | 説明               |
| ---------- | ---------------- | ------------------ |
| id         | ChatSessionId    | セッションID       |
| userId     | UserId           | ユーザーID         |
| title      | ChatSessionTitle | セッションタイトル |
| messages   | ChatMessage[]    | メッセージリスト   |
| isPinned   | boolean          | ピン留めフラグ     |
| isFavorite | boolean          | お気に入りフラグ   |
| pinOrder   | number \| null   | ピン留め順序       |
| createdAt  | Date             | 作成日時           |
| updatedAt  | Date             | 更新日時           |

**ファクトリメソッド**:

- `create(params)`: 新規作成（バリデーション付き）
- `reconstitute(params)`: DB復元（バリデーションなし）

**ビジネスメソッド**:

- `addMessage(message)`: メッセージ追加
- `updateTitle(title)`: タイトル更新
- `togglePinned()`: ピン留めトグル（上限10件チェック）
- `toggleFavorite()`: お気に入りトグル
- `getPreview()`: プレビュー文字列取得

#### ChatMessage

| プロパティ | 型             | 説明         |
| ---------- | -------------- | ------------ |
| id         | ChatMessageId  | メッセージID |
| sessionId  | ChatSessionId  | セッションID |
| role       | MessageRole    | 役割         |
| content    | MessageContent | 内容         |
| createdAt  | Date           | 作成日時     |

### 値オブジェクト

| 値オブジェクト   | バリデーション           | 備考                 |
| ---------------- | ------------------------ | -------------------- |
| ChatSessionId    | UUID形式                 | generate()で新規生成 |
| ChatSessionTitle | 3-255文字、空文字不可    |                      |
| UserId           | UUID形式                 |                      |
| ChatMessageId    | UUID形式                 | generate()で新規生成 |
| MessageContent   | 空文字不可、1-100000文字 |                      |
| MessageRole      | "user" \| "assistant"    |                      |

### リポジトリインターフェース

#### IChatSessionRepository

IChatSessionRepositoryインターフェースが提供するメソッドを以下に示す。

| メソッド               | 引数                  | 戻り値                            | 説明                   |
| ---------------------- | --------------------- | --------------------------------- | ---------------------- |
| findById               | id: ChatSessionId     | Promise(ChatSession \| null)      | IDでセッション取得     |
| findByUserId           | userId: UserId        | Promise(ChatSession[])            | ユーザーのセッション一覧 |
| findPinnedByUserId     | userId: UserId        | Promise(ChatSession[])            | ピン留めセッション一覧 |
| save                   | session: ChatSession  | Promise(Result(void, RepositoryError)) | セッション保存         |
| delete                 | id: ChatSessionId     | Promise(Result(void, RepositoryError)) | セッション削除         |
| search                 | query: SearchQuery    | Promise(SearchResult)             | 条件検索               |
| countPinnedByUserId    | userId: UserId        | Promise(number)                   | ピン留め数カウント     |

※ 戻り値の括弧表記は型パラメータを示す（例: Promise(T) = Promise\<T\>）

#### IChatMessageRepository

IChatMessageRepositoryインターフェースが提供するメソッドを以下に示す。

| メソッド         | 引数                     | 戻り値                            | 説明               |
| ---------------- | ------------------------ | --------------------------------- | ------------------ |
| findById         | id: ChatMessageId        | Promise(ChatMessage \| null)      | IDでメッセージ取得 |
| findBySessionId  | sessionId: ChatSessionId | Promise(ChatMessage[])            | セッション内メッセージ一覧 |
| save             | message: ChatMessage     | Promise(Result(void, RepositoryError)) | メッセージ保存     |
| delete           | id: ChatMessageId        | Promise(Result(void, RepositoryError)) | メッセージ削除     |

※ 戻り値の括弧表記は型パラメータを示す（例: Promise(T) = Promise\<T\>）

---

## Application Layer

### Use Cases

| Use Case                   | 入力                      | 出力            | 責務                   |
| -------------------------- | ------------------------- | --------------- | ---------------------- |
| CreateChatSessionUseCase   | userId, title?            | ChatSessionDTO  | 新規セッション作成     |
| AddUserMessageUseCase      | sessionId, content        | ChatMessageDTO  | ユーザーメッセージ追加 |
| AddAssistantMessageUseCase | sessionId, content        | ChatMessageDTO  | AIメッセージ追加       |
| TogglePinnedUseCase        | sessionId                 | ChatSessionDTO  | ピン留めトグル         |
| SearchSessionsUseCase      | userId, query, pagination | SearchResultDTO | セッション検索         |

### DTOs

- **ChatSessionDTO**: セッション情報の転送オブジェクト
- **ChatMessageDTO**: メッセージ情報の転送オブジェクト
- **SearchResultDTO**: 検索結果の転送オブジェクト

---

## Infrastructure Layer

### Drizzle Repositories

SQLiteデータベースへの永続化を担当するリポジトリ実装。

#### DrizzleChatSessionRepository

`IChatSessionRepository`の具体実装。

| メソッド                            | 説明                                         |
| ----------------------------------- | -------------------------------------------- |
| findById(id)                        | IDでセッションを取得（deletedAt考慮）        |
| findByUserId(userId, limit, offset) | ユーザーのセッション一覧（ページネーション） |
| findPinned(userId)                  | ピン留めセッション一覧（pinOrder順）         |
| search(criteria)                    | 条件検索（keyword, isFavorite, isPinned）    |
| save(session)                       | 保存（upsert）                               |
| delete(id)                          | 物理削除                                     |
| exists(id)                          | 存在確認                                     |
| countPinned(userId)                 | ピン留め数カウント                           |

#### DrizzleChatMessageRepository

`IChatMessageRepository`の具体実装。

| メソッド                                  | 説明                       |
| ----------------------------------------- | -------------------------- |
| findById(id)                              | IDでメッセージを取得       |
| findBySessionId(sessionId, limit, offset) | セッションのメッセージ一覧 |
| findLatestBySessionId(sessionId)          | 最新メッセージ取得         |
| countBySessionId(sessionId)               | メッセージ数カウント       |
| save(message)                             | 保存（upsert）             |
| saveMany(messages)                        | 一括保存                   |
| delete(id)                                | 物理削除                   |
| deleteBySessionId(sessionId)              | セッション内全削除         |

#### エラーハンドリング

すべてのDBエラーはDatabaseErrorクラスにラップされる。DatabaseErrorは第1引数にエラーメッセージ（例: 「セッションの取得に失敗しました」）、第2引数に元のエラーオブジェクトを受け取る。

### Mappers

| Mapper            | 変換メソッド          | 説明               |
| ----------------- | --------------------- | ------------------ |
| ChatSessionMapper | toDomain(record)      | DB Record → Entity |
|                   | toPersistence(entity) | Entity → DB Record |
|                   | toDTO(entity)         | Entity → DTO       |
| ChatMessageMapper | toDomain(record)      | DB Record → Entity |
|                   | toPersistence(entity) | Entity → DB Record |
|                   | toDTO(entity)         | Entity → DTO       |

---

## エラーハンドリング

### Result型

Result型は成功（Ok）または失敗（Err）を表す直和型である。全てのUse CaseはResult型（型パラメータ: T=成功値, E=UseCaseError）を返却する。

### エラー階層

エラークラスは以下の継承関係を持つ。

| エラークラス      | 親クラス     | 説明                     | 主要プロパティ           |
| ----------------- | ------------ | ------------------------ | ------------------------ |
| AppError          | Error        | 基底エラー（抽象）       | message                  |
| DomainError       | AppError     | ドメインエラー（抽象）   | -                        |
| ValidationError   | DomainError  | バリデーションエラー     | -                        |
| BusinessRuleError | DomainError  | ビジネスルール違反       | -                        |
| InvalidIdError    | DomainError  | 不正なIDエラー           | -                        |
| UseCaseError      | AppError     | Use Caseエラー           | code, statusCode, data?  |

---

## ビジネスルール

| ルールID       | 内容                     | 検証場所     |
| -------------- | ------------------------ | ------------ |
| BR-SESSION-001 | タイトル3-255文字        | Value Object |
| BR-SESSION-002 | ピン留め上限10件         | Entity       |
| BR-MSG-001     | roleはuser/assistantのみ | Value Object |
| BR-MSG-002     | contentは空不可          | Value Object |

---

## 品質指標

| 指標                 | 目標  | 達成値 |
| -------------------- | ----- | ------ |
| アーキテクチャ準拠率 | 100%  | 100%   |
| Line Coverage        | ≥80%  | 84.1%  |
| Branch Coverage      | ≥60%  | 93.57% |
| Function Coverage    | ≥80%  | 90.23% |
| テスト数             | -     | 119    |
| 型エラー             | 0件   | 0件    |
| Lintエラー           | 0件   | 0件    |

---

## 設計原則

### SOLID原則の適用

| 原則                  | 適用箇所                              |
| --------------------- | ------------------------------------- |
| Single Responsibility | 各Use Caseが単一ユースケースを担当    |
| Open/Closed           | 新機能追加時はUse Case追加で対応      |
| Liskov Substitution   | InMemory/Drizzle Repositoryが置換可能 |
| Interface Segregation | SessionとMessageでRepository分離      |
| Dependency Inversion  | 抽象（Interface）への依存を実現       |

### その他のパターン

- **Rich Domain Model**: ビジネスロジックをエンティティ内にカプセル化
- **Factory Method**: create/reconstituteによるオブジェクト生成
- **Repository Pattern**: 永続化の抽象化
- **Mapper Pattern**: 層間のデータ変換

---

## 関連ドキュメント

- [API仕様](./api-chat-history.md) - Use Case API詳細
- [インターフェース仕様](./interfaces-chat-history.md) - 型定義・DB仕様
- [アーキテクチャパターン](./architecture-patterns.md) - 全体パターン
- [設計ドキュメント](../../../docs/30-workflows/clean-architecture-refactoring/outputs/phase-2/) - Phase 2成果物
- [Provider統合実装ガイド](../../../docs/30-workflows/chat-history-provider-integration/outputs/phase-12/implementation-guide.md) - App.tsx統合実装ガイド

---

## 完了タスク

### タスク: chat-history-provider-integration（2026-01-22完了）

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-007                                                             |
| 完了日       | 2026-01-22                                                         |
| ステータス   | **完了**                                                           |
| テスト数     | 97（自動テスト）+ 10（手動テスト項目）                             |
| 発見課題     | 0件（重大な課題なし）                                              |
| ドキュメント | `docs/30-workflows/chat-history-provider-integration/`             |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| 機能テスト         | 5        | 5    | 0    |
| エラーハンドリング | 2        | 2    | 0    |
| アクセシビリティ   | 3        | 3    | 0    |
| 自動テスト         | 97       | 97   | 0    |

#### 成果物

| 成果物             | パス                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/chat-history-provider-integration/outputs/phase-11/manual-test-result.md` |
| 実装ガイド         | `docs/30-workflows/chat-history-provider-integration/outputs/phase-12/implementation-guide.md` |
| ドキュメント更新履歴 | `docs/30-workflows/chat-history-provider-integration/outputs/phase-12/documentation-changelog.md` |

---

## 変更履歴

| Version | Date       | Changes                                                                 |
| ------- | ---------- | ----------------------------------------------------------------------- |
| 1.3.0   | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換                       |
| 1.2.0   | 2026-01-22 | App.tsx統合パターン・Repository Factory追加、UT-007完了記録追加          |
| 1.1.0   | 2026-01-22 | Drizzle Repository実装を追加                                             |
| 1.0.0   | 2026-01-19 | 初版作成（Clean Architecture移行完了）                                   |
