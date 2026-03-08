# チャット履歴 Use Case API仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
> 更新日: 2026-01-26
> 関連タスク: ARCH-001 Clean Architecture Refactoring

---

## 概要

チャット履歴機能のApplication LayerはUse Caseパターンで実装されている。
各Use Caseは単一責務を持ち、Result型でエラーを返却する。

---

## Use Cases

### CreateChatSessionUseCase

新規チャットセッションを作成する。

#### インターフェース

| 項目 | 説明 |
| --- | --- |
| クラス名 | CreateChatSessionUseCase |
| コンストラクタ依存 | IChatSessionRepository |
| 実行メソッド | execute(input: CreateChatSessionInput) |
| 戻り値 | Promise<Result<ChatSessionDTO, UseCaseError>> |

#### 入力

| パラメータ | 型     | 必須 | 説明                        |
| ---------- | ------ | ---- | --------------------------- |
| userId     | string | Yes   | ユーザーID（UUID形式）      |
| title      | string | No    | タイトル（3-255文字、省略時「新規チャット」） |

#### 出力

成功時は `Ok<ChatSessionDTO>` を返却する。ChatSessionDTOの構造は以下のとおり。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| id | string | セッションID |
| userId | string | ユーザーID |
| title | string | セッションタイトル |
| isPinned | boolean | ピン留め状態 |
| isFavorite | boolean | お気に入り状態 |
| pinOrder | number または null | ピン留め順序 |
| messageCount | number | メッセージ数 |
| preview | string | プレビューテキスト |
| createdAt | string | 作成日時（ISO 8601形式） |
| updatedAt | string | 更新日時（ISO 8601形式） |

#### エラー

| コード          | 説明               | HTTP Status |
| --------------- | ------------------ | ----------- |
| INVALID_USER_ID | ユーザーIDが無効   | 400         |
| INVALID_TITLE   | タイトルが無効     | 400         |
| REPOSITORY_ERROR| 保存に失敗         | 500         |

#### 使用パターン

1. CreateChatSessionUseCaseをsessionRepositoryを渡してインスタンス化する
2. executeメソッドにuserIdとtitle（任意）を含むオブジェクトを渡す
3. 戻り値のResult型に対してisOk()で成功判定を行う
4. 成功時はresult.valueでChatSessionDTOを取得
5. 失敗時はresult.errorでエラーコードとメッセージを取得

---

### AddUserMessageUseCase

ユーザーメッセージをセッションに追加する。

#### インターフェース

| 項目 | 説明 |
| --- | --- |
| クラス名 | AddUserMessageUseCase |
| コンストラクタ依存 | IChatSessionRepository, IChatMessageRepository |
| 実行メソッド | execute(input: AddUserMessageInput) |
| 戻り値 | Promise<Result<ChatMessageDTO, UseCaseError>> |

#### 入力

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| sessionId  | string | Yes   | セッションID（UUID形式） |
| content    | string | Yes   | メッセージ内容（1-100000文字） |

#### 出力

成功時は `Ok<ChatMessageDTO>` を返却する。ChatMessageDTOの構造は以下のとおり。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| id | string | メッセージID |
| sessionId | string | セッションID |
| role | "user" | ロール（固定値） |
| content | string | メッセージ内容 |
| createdAt | string | 作成日時（ISO 8601形式） |

#### エラー

| コード             | 説明                   | HTTP Status |
| ------------------ | ---------------------- | ----------- |
| INVALID_SESSION_ID | セッションIDが無効     | 400         |
| SESSION_NOT_FOUND  | セッションが存在しない | 404         |
| INVALID_CONTENT    | メッセージ内容が無効   | 400         |
| REPOSITORY_ERROR   | 保存に失敗             | 500         |

#### 使用パターン

1. AddUserMessageUseCaseをsessionRepositoryとmessageRepositoryを渡してインスタンス化する
2. executeメソッドにsessionIdとcontentを含むオブジェクトを渡す
3. 戻り値のResult型に対してisOk()で成功判定を行う
4. 成功時はresult.valueでChatMessageDTOを取得

---

### AddAssistantMessageUseCase

アシスタント（AI）メッセージをセッションに追加する。

#### インターフェース

| 項目 | 説明 |
| --- | --- |
| クラス名 | AddAssistantMessageUseCase |
| コンストラクタ依存 | IChatSessionRepository, IChatMessageRepository |
| 実行メソッド | execute(input: AddAssistantMessageInput) |
| 戻り値 | Promise<Result<ChatMessageDTO, UseCaseError>> |

#### 入力

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| sessionId  | string | Yes   | セッションID（UUID形式） |
| content    | string | Yes   | メッセージ内容（1-100000文字） |

#### 出力

成功時は `Ok<ChatMessageDTO>` を返却する。ChatMessageDTOの構造は以下のとおり。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| id | string | メッセージID |
| sessionId | string | セッションID |
| role | "assistant" | ロール（固定値） |
| content | string | メッセージ内容 |
| createdAt | string | 作成日時（ISO 8601形式） |

#### エラー

| コード             | 説明                   | HTTP Status |
| ------------------ | ---------------------- | ----------- |
| INVALID_SESSION_ID | セッションIDが無効     | 400         |
| SESSION_NOT_FOUND  | セッションが存在しない | 404         |
| INVALID_CONTENT    | メッセージ内容が無効   | 400         |
| REPOSITORY_ERROR   | 保存に失敗             | 500         |

---

### TogglePinnedUseCase

セッションのピン留め状態をトグルする。

#### インターフェース

| 項目 | 説明 |
| --- | --- |
| クラス名 | TogglePinnedUseCase |
| コンストラクタ依存 | IChatSessionRepository |
| 実行メソッド | execute(input: TogglePinnedInput) |
| 戻り値 | Promise<Result<ChatSessionDTO, UseCaseError>> |

#### 入力

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| sessionId  | string | Yes   | セッションID（UUID形式） |

#### 出力

成功時は `Ok<ChatSessionDTO>` を返却する（更新後のセッション情報）。

#### エラー

| コード                | 説明                     | HTTP Status |
| --------------------- | ------------------------ | ----------- |
| INVALID_SESSION_ID    | セッションIDが無効       | 400         |
| SESSION_NOT_FOUND     | セッションが存在しない   | 404         |
| PINNED_LIMIT_EXCEEDED | ピン留め上限（10件）超過 | 400         |
| REPOSITORY_ERROR      | 保存に失敗               | 500         |

#### ビジネスルール

- ピン留めは最大10件まで（BR-SESSION-002）
- 11件目をピン留めしようとするとエラー

#### 使用パターン

1. TogglePinnedUseCaseをsessionRepositoryを渡してインスタンス化する
2. executeメソッドにsessionIdを含むオブジェクトを渡す
3. 戻り値のResult型に対してisErr()でエラー判定を行う
4. エラーコードがPINNED_LIMIT_EXCEEDEDの場合は上限超過を通知する

---

### SearchSessionsUseCase

セッションをキーワード検索する。

#### インターフェース

| 項目 | 説明 |
| --- | --- |
| クラス名 | SearchSessionsUseCase |
| コンストラクタ依存 | IChatSessionRepository |
| 実行メソッド | execute(input: SearchSessionsInput) |
| 戻り値 | Promise<Result<SearchResultDTO, UseCaseError>> |

#### 入力

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| userId     | string | Yes   | ユーザーID（UUID形式）   |
| query      | string | Yes   | 検索クエリ               |
| limit      | number | No    | 取得件数（デフォルト20） |
| offset     | number | No    | オフセット（デフォルト0）|

#### 出力

成功時は `Ok<SearchResultDTO>` を返却する。SearchResultDTOの構造は以下のとおり。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| sessions | ChatSessionDTO[] | 検索結果のセッション配列 |
| total | number | 総件数 |
| hasMore | boolean | 追加データの有無 |

#### エラー

| コード          | 説明             | HTTP Status |
| --------------- | ---------------- | ----------- |
| INVALID_USER_ID | ユーザーIDが無効 | 400         |
| INVALID_QUERY   | 検索クエリが無効 | 400         |

---

## DTOs

### ChatSessionDTO

チャットセッションのデータ転送オブジェクト。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string | Yes | セッションID |
| userId | string | Yes | ユーザーID |
| title | string | Yes | セッションタイトル |
| isPinned | boolean | Yes | ピン留め状態 |
| isFavorite | boolean | Yes | お気に入り状態 |
| pinOrder | number または null | Yes | ピン留め順序（未ピン時はnull） |
| messageCount | number | Yes | メッセージ数 |
| preview | string | Yes | プレビューテキスト |
| createdAt | string | Yes | 作成日時（ISO 8601形式） |
| updatedAt | string | Yes | 更新日時（ISO 8601形式） |

### ChatMessageDTO

チャットメッセージのデータ転送オブジェクト。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string | Yes | メッセージID |
| sessionId | string | Yes | セッションID |
| role | "user" または "assistant" | Yes | メッセージロール |
| content | string | Yes | メッセージ内容 |
| createdAt | string | Yes | 作成日時（ISO 8601形式） |

### SearchResultDTO

検索結果のデータ転送オブジェクト。

| プロパティ | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| sessions | ChatSessionDTO[] | Yes | 検索結果のセッション配列 |
| total | number | Yes | 総件数 |
| hasMore | boolean | Yes | 追加データの有無 |

---

## リポジトリインターフェース

### IChatSessionRepository

チャットセッションの永続化を担当するリポジトリインターフェース。

| メソッド | パラメータ | 戻り値 | 説明 |
| --- | --- | --- | --- |
| findById | id: ChatSessionId | Promise<ChatSession または null> | IDでセッション取得 |
| findByUserId | userId: UserId | Promise<ChatSession[]> | ユーザーの全セッション取得 |
| findPinnedByUserId | userId: UserId | Promise<ChatSession[]> | ユーザーのピン留めセッション取得 |
| save | session: ChatSession | Promise<Result<void, RepositoryError>> | セッション保存 |
| delete | id: ChatSessionId | Promise<Result<void, RepositoryError>> | セッション削除 |
| search | query: SearchQuery | Promise<SearchResult> | セッション検索 |
| countPinnedByUserId | userId: UserId | Promise<number> | ピン留め数カウント |

### IChatMessageRepository

チャットメッセージの永続化を担当するリポジトリインターフェース。

| メソッド | パラメータ | 戻り値 | 説明 |
| --- | --- | --- | --- |
| findById | id: ChatMessageId | Promise<ChatMessage または null> | IDでメッセージ取得 |
| findBySessionId | sessionId: ChatSessionId | Promise<ChatMessage[]> | セッションの全メッセージ取得 |
| save | message: ChatMessage | Promise<Result<void, RepositoryError>> | メッセージ保存 |
| delete | id: ChatMessageId | Promise<Result<void, RepositoryError>> | メッセージ削除 |

---

## エラーハンドリングパターン

### Result型の使用

Use Case実行結果はResult型で返却される。Result型には以下の3つの処理パターンがある。

**パターン1: isOk/isErrメソッド**

isOk()メソッドで成功判定を行い、成功時はvalueプロパティでデータを取得、失敗時はerrorプロパティでエラー情報を取得する。

**パターン2: matchメソッド**

okハンドラとerrハンドラを含むオブジェクトを渡し、成功・失敗それぞれの処理を定義する。

**パターン3: map/mapErrメソッド**

mapメソッドで成功値を変換し、mapErrメソッドでエラー値を変換する。チェーン可能。

### UseCaseError構造

Use Caseで発生するエラーの基底クラス。AppErrorを継承する。

| プロパティ | 型 | 説明 |
| --- | --- | --- |
| code | string | エラーコード |
| statusCode | number | HTTPステータスコード |
| data | Record<string, unknown> または undefined | 追加データ（任意） |

コンストラクタは以下のパラメータを受け取る。

| パラメータ | 型 | 必須 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| code | string | Yes | - | エラーコード |
| message | string | Yes | - | エラーメッセージ |
| statusCode | number | No | 400 | HTTPステータスコード |
| data | Record<string, unknown> | No | undefined | 追加データ |

---

## 将来の拡張

### 未実装Use Cases（予定）

| Use Case               | 説明                   |
| ---------------------- | ---------------------- |
| UpdateSessionTitleUseCase | タイトル更新        |
| ToggleFavoriteUseCase  | お気に入りトグル       |
| DeleteSessionUseCase   | セッション削除         |
| ExportSessionUseCase   | Markdown/JSONエクスポート |
| GetSessionDetailUseCase| セッション詳細取得     |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-01-26 | 1.1.0 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
| 2026-01-19 | 1.0.0 | 初版作成 |

---

## 関連ドキュメント

- [アーキテクチャ仕様](./architecture-chat-history.md) - 全体構成
- [インターフェース仕様](./interfaces-chat-history.md) - 型定義・DB仕様
- [実装ガイド](../../../docs/30-workflows/clean-architecture-refactoring/outputs/phase-12/implementation-guide.md) - 実装詳細
