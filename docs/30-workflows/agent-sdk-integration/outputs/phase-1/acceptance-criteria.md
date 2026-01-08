# Agent SDK統合 受け入れ基準

> Phase 1 成果物
> 作成日: 2026-01-08
> スキル: acceptance-criteria-writing

---

## 1. FR-001: Agent SDK初期化

### AC-001-1: 正常な初期化

```gherkin
Given: アプリケーションが起動され、ANTHROPIC_API_KEYが環境変数に設定されている
When: アプリケーションの初期化処理が実行される
Then: Agent SDKが正常に初期化される
And: 初期化完了ログが記録される
And: agent:getStatus で "initialized" ステータスが返される
```

### AC-001-2: API Key未設定時のエラー

```gherkin
Given: アプリケーションが起動され、ANTHROPIC_API_KEYが設定されていない
When: アプリケーションの初期化処理が実行される
Then: AgentInitializationError がスローされる
And: エラーメッセージ「ANTHROPIC_API_KEY is not configured」がログに記録される
And: agent:getStatus で "error" ステータスが返される
```

### AC-001-3: 初期化状態の確認

```gherkin
Given: Agent SDKの初期化処理が完了している
When: Renderer Processから agent:getStatus を呼び出す
Then: 以下の情報を含むステータスオブジェクトが返される:
  | フィールド | 型 | 説明 |
  | status | string | "initialized" / "initializing" / "error" / "not_initialized" |
  | error | string? | エラーメッセージ（エラー時のみ） |
  | timestamp | number | ステータス更新時刻 |
```

---

## 2. FR-002: スキル呼び出し機能（query API）

### AC-002-1: 正常なクエリ実行

```gherkin
Given: Agent SDKが初期化済みである
When: Renderer Processから agent:query を以下の引数で呼び出す:
  | 引数 | 値 |
  | prompt | "Hello, Claude" |
  | options.timeout | 30000 |
Then: ストリーミングレスポンスが agent:onMessage 経由で受信される
And: 各メッセージは SDKMessage 型に準拠している
And: 最終メッセージの isComplete が true である
```

### AC-002-2: タイムアウト時のエラー

```gherkin
Given: Agent SDKが初期化済みである
When: Renderer Processから agent:query を timeout: 1000 で呼び出す
And: SDKからの応答が1秒以内に完了しない
Then: AgentTimeoutError がスローされる
And: エラーメッセージに「timeout」が含まれる
And: 実行中の処理がキャンセルされる
```

### AC-002-3: SDK未初期化時のエラー

```gherkin
Given: Agent SDKが初期化されていない
When: Renderer Processから agent:query を呼び出す
Then: AgentInitializationError がスローされる
And: エラーメッセージ「Agent SDK is not initialized」が返される
```

### AC-002-4: ストリーミングメッセージの受信

```gherkin
Given: Agent SDKが初期化済みである
And: agent:onMessage のリスナーが登録されている
When: agent:query を実行する
Then: ストリーミング中、以下の形式でメッセージが配信される:
  | フィールド | 型 | 説明 |
  | type | string | メッセージタイプ |
  | content | string | メッセージ内容 |
  | timestamp | number | 受信時刻 |
  | isComplete | boolean | 完了フラグ |
```

---

## 3. FR-003: セッション管理機能

### AC-003-1: セッション作成

```gherkin
Given: Agent SDKが初期化済みである
When: Renderer Processから agent:createSession を呼び出す
Then: 新しいセッションIDが生成される
And: セッションIDは UUID v4 形式である
And: セッション状態がメモリに保存される
```

### AC-003-2: セッション再開

```gherkin
Given: セッションID "abc-123" が作成済みである
When: Renderer Processから agent:resumeSession を sessionId: "abc-123" で呼び出す
Then: 既存のセッションコンテキストが復元される
And: 以降のクエリは同じセッションで実行される
```

### AC-003-3: 存在しないセッションの再開

```gherkin
Given: セッションID "nonexistent" は存在しない
When: Renderer Processから agent:resumeSession を sessionId: "nonexistent" で呼び出す
Then: AgentSessionError がスローされる
And: エラーメッセージ「Session not found」が返される
```

### AC-003-4: セッション破棄

```gherkin
Given: セッションID "abc-123" が作成済みである
When: Renderer Processから agent:destroySession を sessionId: "abc-123" で呼び出す
Then: セッションがメモリから削除される
And: 同じセッションIDでの再開は AgentSessionError になる
```

---

## 4. FR-004: IPC通信インターフェース

### AC-004-1: contextBridge API公開

```gherkin
Given: アプリケーションが起動している
When: Renderer Processで window.agentAPI を参照する
Then: 以下のメソッドが公開されている:
  | メソッド | 引数 | 戻り値 |
  | query | (prompt: string, options?: QueryOptions) | Promise<void> |
  | abort | () | void |
  | getStatus | () | Promise<AgentStatus> |
  | createSession | () | Promise<string> |
  | resumeSession | (sessionId: string) | Promise<void> |
  | destroySession | (sessionId: string) | Promise<void> |
  | onMessage | (callback: (message: SDKMessage) => void) | () => void |
```

### AC-004-2: IPCチャネルの存在確認

```gherkin
Given: Main Processのハンドラが登録されている
When: 各IPCチャネルの存在を確認する
Then: 以下のチャネルがすべて登録されている:
  - agent:query
  - agent:abort
  - agent:getStatus
  - agent:createSession
  - agent:resumeSession
  - agent:destroySession
```

### AC-004-3: 引数バリデーション

```gherkin
Given: Agent SDKが初期化済みである
When: agent:query を prompt: null で呼び出す
Then: バリデーションエラーがスローされる
And: エラーメッセージ「Invalid argument: prompt is required」が返される
```

---

## 5. FR-005: エラーハンドリング

### AC-005-1: エラー種別の識別

```gherkin
Given: 各種エラーが発生する状況
When: エラーがスローされる
Then: エラーは以下のクラス階層に従う:
  | エラークラス | 親クラス | 発生条件 |
  | AgentError | Error | 基底クラス |
  | AgentInitializationError | AgentError | 初期化失敗 |
  | AgentQueryError | AgentError | クエリ実行失敗 |
  | AgentTimeoutError | AgentError | タイムアウト |
  | AgentAbortedError | AgentError | ユーザーキャンセル |
  | AgentSessionError | AgentError | セッション操作失敗 |
```

### AC-005-2: エラーログの記録

```gherkin
Given: エラーが発生する
When: エラーがキャッチされる
Then: 構造化ログに以下の情報が記録される:
  | フィールド | 型 | 説明 |
  | errorType | string | エラークラス名 |
  | message | string | エラーメッセージ |
  | timestamp | string | ISO 8601形式 |
  | context | object | 追加コンテキスト |
```

### AC-005-3: リトライ動作

```gherkin
Given: 一時的なネットワークエラーが発生する
When: agent:query を実行する
Then: 最大3回までリトライが実行される
And: リトライ間隔は指数バックオフ（1秒、2秒、4秒）
And: すべてのリトライが失敗した場合、最終エラーがスローされる
```

### AC-005-4: キャンセル処理

```gherkin
Given: agent:query が実行中である
When: agent:abort が呼び出される
Then: 実行中の処理が中断される
And: AgentAbortedError がスローされる
And: リソースが適切にクリーンアップされる
```

---

## 6. NFR-001: パフォーマンス

### AC-NFR-001-1: 初期化時間

```gherkin
Given: 正常なネットワーク環境である
When: Agent SDKを初期化する
Then: 初期化完了まで2秒以内である
```

### AC-NFR-001-2: IPC遅延

```gherkin
Given: Agent SDKが初期化済みである
When: agent:getStatus を100回連続で呼び出す
Then: 平均応答時間が50ms以下である
```

---

## 7. NFR-002: セキュリティ

### AC-NFR-002-1: API Key非公開

```gherkin
Given: アプリケーションが起動している
When: Renderer Processで以下を確認する:
  - window.agentAPI
  - window.process
  - window.require
Then: ANTHROPIC_API_KEY にアクセスできない
And: Node.js APIにアクセスできない
```

### AC-NFR-002-2: IPC送信元検証

```gherkin
Given: 不正な送信元からIPCリクエストが送信される
When: Main ProcessでIPCハンドラが呼び出される
Then: リクエストが拒否される
And: セキュリティ警告がログに記録される
```

---

## テストマトリクス

| AC ID        | 要件    | テスト種別  | 優先度 |
| ------------ | ------- | ----------- | ------ |
| AC-001-1     | FR-001  | Unit        | High   |
| AC-001-2     | FR-001  | Unit        | High   |
| AC-001-3     | FR-001  | Integration | Medium |
| AC-002-1     | FR-002  | Integration | High   |
| AC-002-2     | FR-002  | Unit        | High   |
| AC-002-3     | FR-002  | Unit        | High   |
| AC-002-4     | FR-002  | Integration | High   |
| AC-003-1     | FR-003  | Unit        | Medium |
| AC-003-2     | FR-003  | Unit        | Medium |
| AC-003-3     | FR-003  | Unit        | Medium |
| AC-003-4     | FR-003  | Unit        | Medium |
| AC-004-1     | FR-004  | Integration | High   |
| AC-004-2     | FR-004  | Unit        | High   |
| AC-004-3     | FR-004  | Unit        | High   |
| AC-005-1     | FR-005  | Unit        | High   |
| AC-005-2     | FR-005  | Unit        | Medium |
| AC-005-3     | FR-005  | Integration | Medium |
| AC-005-4     | FR-005  | Integration | High   |
| AC-NFR-001-1 | NFR-001 | Performance | Medium |
| AC-NFR-001-2 | NFR-001 | Performance | Low    |
| AC-NFR-002-1 | NFR-002 | Security    | High   |
| AC-NFR-002-2 | NFR-002 | Security    | High   |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-08 | 初版作成 |
