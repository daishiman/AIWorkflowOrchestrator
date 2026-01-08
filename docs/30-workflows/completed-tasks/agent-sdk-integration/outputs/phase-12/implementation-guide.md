# Claude Agent SDK 統合 実装ガイド

## メタ情報

| 項目         | 内容                     |
| ------------ | ------------------------ |
| ドキュメント | 実装ガイド               |
| 対象機能     | Claude Agent SDK統合基盤 |
| 作成日       | 2026-01-08               |
| バージョン   | 1.0.0                    |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. 比喩を使った説明

### 「AIと話す電話」として理解する

Claude Agent SDKの統合は、**「AIと話すための電話システム」**のようなものです。

```
あなた（ユーザー）
    ↓ 質問を入力
[電話機] ← これがReact UI（画面）
    ↓ 電話をかける
[電話交換機] ← これがIPC Handler（仲介役）
    ↓ 外部に接続
[クラウドのAI] ← これがClaude Agent SDK
    ↓ 回答を返す
[電話機] → 画面に表示
```

### なぜ「交換機」が必要なの？

デスクトップアプリには2つの「部屋」があります：

1. **見える部屋（Renderer Process）**: ボタンや画面など、あなたが触れる部分
2. **見えない部屋（Main Process）**: ファイル操作やネットワーク通信など、裏方の仕事

セキュリティのため、この2つの部屋は**直接話せません**。
だから「交換機（IPC Handler）」が間に入って、安全にメッセージを伝えます。

### セッションって何？

「セッション」は**会話の記憶**です。

例えば、友達と話しているとき：

- 「さっき言ったこと覚えてる？」と聞ける
- 話を途中で止めても、後で続きから話せる

セッションがあると、AIも同じように「前に何を話したか」を覚えていられます。

---

## 2. なぜこの設計にしたか

### 3層構造にした理由

| 層                  | 役割           | なぜ分けたか                             |
| ------------------- | -------------- | ---------------------------------------- |
| React UI (useAgent) | 画面表示・操作 | ユーザーが触る部分だけに集中させるため   |
| IPC Handler         | 仲介・検証     | セキュリティチェックを一箇所でするため   |
| AgentClient         | AI通信         | 通信ロジックを再利用できるようにするため |

**分ける利点**:

- 画面を担当する人は「どう通信するか」を知らなくていい
- 通信を担当する人は「画面をどう作るか」を知らなくていい
- 問題が起きたとき、どこが原因かすぐわかる

### エラー処理を手厚くした理由

AIとの通信は「電話」と同じで、時々つながらないことがあります：

- ネットワークが切れた
- AIが忙しくて応答できない
- 時間がかかりすぎた

だから、失敗したときに**自動で数回やり直す（リトライ）**機能を入れました。

---

## 3. 全体の流れ

### ユーザーの操作から結果表示まで

```
1. ユーザーが質問を入力
   ↓
2. 「送信」ボタンをクリック
   ↓
3. useAgentフックがquery()を呼び出す
   ↓
4. window.agentAPI経由でMain Processに送信
   ↓
5. AgentHandlerがリクエストを検証
   ↓
6. AgentClientがClaude SDKにクエリを送信
   ↓
7. AIからの回答がストリーミングで届く
   ↓
8. 各メッセージがIPC経由でRendererに送信
   ↓
9. useAgentがメッセージを蓄積・状態更新
   ↓
10. 画面にリアルタイムで回答が表示される
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      React UI                          │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              useAgent Hook                       │  │  │
│  │  │  - query(prompt, options)                        │  │  │
│  │  │  - abort()                                       │  │  │
│  │  │  - clearMessages()                               │  │  │
│  │  │  - State: messages, isLoading, error, status     │  │  │
│  │  └──────────────────────┬──────────────────────────┘  │  │
│  └─────────────────────────┼─────────────────────────────┘  │
│                            │ window.agentAPI                 │
└────────────────────────────┼────────────────────────────────┘
                             │ IPC (contextBridge)
┌────────────────────────────┼────────────────────────────────┐
│                      Main Process                            │
│  ┌─────────────────────────┴─────────────────────────────┐  │
│  │                  AgentHandler                          │  │
│  │  - handleQuery(event, request)                         │  │
│  │  - handleAbort()                                       │  │
│  │  - handleGetStatus()                                   │  │
│  │  - handleCreateSession() / resumeSession / destroy     │  │
│  │  - Zodバリデーション                                   │  │
│  └──────────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────────┴────────────────────────────┐  │
│  │                  AgentClient                           │  │
│  │  - initialize(): SDK初期化                             │  │
│  │  - query(prompt, onMessage, options): クエリ実行       │  │
│  │  - abort(): 実行中断                                   │  │
│  │  - Exponential Backoffリトライ                         │  │
│  └──────────────────────────┬────────────────────────────┘  │
│  ┌──────────────────────────┴────────────────────────────┐  │
│  │                  SessionManager                        │  │
│  │  - createSession(): セッション作成                     │  │
│  │  - resumeSession(id): セッション再開                   │  │
│  │  - destroySession(id): セッション破棄                  │  │
│  │  - LRU方式で最大10セッション管理                       │  │
│  └──────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────┴───────────────────────────────┐
│                    Claude Agent SDK                          │
│                  (Anthropic Cloud Service)                   │
└─────────────────────────────────────────────────────────────┘
```

## 2. 各層の実装詳細

### 2.1 Shared Package (`packages/shared/src/agent/`)

#### AgentClient

```typescript
// agent-client.ts
export class AgentClient {
  private sdk: SDKInstance | null = null;
  private queryRunning: boolean = false;
  private abortController: AbortController | null = null;

  constructor(config: AgentClientConfig) {
    // API Keyの検証
    if (!config.apiKey) {
      throw new AgentInitializationError("API key is required");
    }
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    // 二重初期化防止
    if (this.sdk) return;
    this.sdk = new ClaudeSDK({ apiKey: this.config.apiKey });
  }

  async query(
    prompt: string,
    onMessage: (message: SDKMessage) => void,
    options?: QueryOptions,
  ): Promise<void> {
    // Exponential Backoffリトライ
    let attempt = 0;
    while (attempt <= this.config.maxRetries) {
      try {
        await this.executeQueryWithTimeout(
          prompt,
          onMessage,
          options,
          timeout,
          signal,
        );
        return;
      } catch (error) {
        if (
          error instanceof AgentAbortedError ||
          error instanceof AgentTimeoutError
        ) {
          throw error; // リトライ不可
        }
        attempt++;
        const delay = Math.min(
          this.config.initialRetryDelay * Math.pow(2, attempt - 1),
          this.config.maxRetryDelay,
        );
        await this.sleep(delay);
      }
    }
    throw new AgentQueryError(
      `Query failed after ${this.config.maxRetries} retries`,
    );
  }
}
```

#### SessionManager

```typescript
// session-manager.ts
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private readonly MAX_SESSIONS = 10;

  createSession(): string {
    this.enforceSessionLimit(); // LRU方式で古いセッションを削除
    const session: Session = {
      id: randomUUID(),
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      context: { messageIds: [] },
    };
    this.sessions.set(session.id, session);
    return session.id;
  }

  private enforceSessionLimit(): void {
    if (this.sessions.size >= this.MAX_SESSIONS) {
      // 最も古いセッションを削除
      let oldest = { id: "", lastAccessedAt: Infinity };
      for (const session of this.sessions.values()) {
        if (session.lastAccessedAt < oldest.lastAccessedAt) {
          oldest = session;
        }
      }
      this.sessions.delete(oldest.id);
    }
  }
}
```

### 2.2 Desktop App (`apps/desktop/src/main/agent/`)

#### AgentHandler

```typescript
// agent-handler.ts
export class AgentHandler {
  private agentClient: AgentClient;
  private sessionManager: SessionManager;

  async initialize(): Promise<void> {
    await this.agentClient.initialize();
    this.registerHandlers();
  }

  private registerHandlers(): void {
    ipcMain.handle("agent:query", async (event, request) => {
      // Zodバリデーション
      const parseResult = queryRequestSchema.safeParse(request);
      if (!parseResult.success) {
        throw new AgentValidationError(
          "Invalid request",
          parseResult.error.issues,
        );
      }
      // 既存クエリがあれば中断
      if (this.agentClient.isQueryRunning()) {
        this.agentClient.abort();
      }
      // クエリ実行（メッセージはIPC経由でRendererに送信）
      await this.agentClient.query(
        parseResult.data.prompt,
        (message) => event.sender.send("agent:message", message),
        parseResult.data.options,
      );
    });

    ipcMain.on("agent:abort", () => this.agentClient.abort());
  }
}
```

### 2.3 React Hook (`apps/desktop/src/renderer/hooks/`)

#### useAgent

```typescript
// useAgent.ts
export function useAgent(options?: UseAgentOptions): UseAgentReturn {
  const [messages, setMessages] = useState<SDKMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AgentStatus | null>(null);

  // メッセージ受信のサブスクライブ
  useEffect(() => {
    const unsubscribe = window.agentAPI.onMessage((message) => {
      setMessages((prev) => [...prev, message]);
      if (message.type === "complete") {
        setIsLoading(false);
      } else if (message.type === "error") {
        setError(message.content);
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const query = useCallback(
    async (prompt: string, queryOptions?: QueryOptions) => {
      setIsLoading(true);
      setError(null);
      try {
        await window.agentAPI.query(prompt, queryOptions);
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    },
    [],
  );

  return { messages, isLoading, error, status, query, abort, clearMessages };
}
```

## 3. エラーハンドリング

### エラー型階層

```
AgentError (基底クラス)
├── AgentInitializationError  - SDK初期化失敗
├── AgentQueryError           - クエリ実行失敗
├── AgentTimeoutError         - タイムアウト
├── AgentAbortedError         - ユーザー中断
├── AgentSessionError         - セッション操作失敗
└── AgentValidationError      - リクエスト検証失敗
```

### エラーコード

| コード                  | 説明                   |
| ----------------------- | ---------------------- |
| `INITIALIZATION_FAILED` | SDK初期化に失敗        |
| `QUERY_FAILED`          | クエリ実行に失敗       |
| `TIMEOUT`               | タイムアウト発生       |
| `ABORTED`               | ユーザーによる中断     |
| `SESSION_NOT_FOUND`     | セッションが存在しない |
| `SESSION_EXPIRED`       | セッションが期限切れ   |
| `VALIDATION_FAILED`     | リクエスト検証に失敗   |

## 4. 設定オプション

### AgentClientConfig

| オプション          | 型       | デフォルト | 説明                        |
| ------------------- | -------- | ---------- | --------------------------- |
| `apiKey`            | `string` | -          | **必須** Claude API Key     |
| `defaultTimeout`    | `number` | `30000`    | デフォルトタイムアウト (ms) |
| `maxRetries`        | `number` | `3`        | 最大リトライ回数            |
| `initialRetryDelay` | `number` | `1000`     | 初回リトライ待機時間 (ms)   |
| `maxRetryDelay`     | `number` | `4000`     | 最大リトライ待機時間 (ms)   |

### QueryOptions

| オプション     | 型       | 説明                       |
| -------------- | -------- | -------------------------- |
| `sessionId`    | `string` | セッションID（会話継続用） |
| `systemPrompt` | `string` | システムプロンプト         |
| `timeout`      | `number` | 個別タイムアウト設定 (ms)  |

---

## 5. 用語集

| 用語                | 読み方               | 意味                                                            |
| ------------------- | -------------------- | --------------------------------------------------------------- |
| IPC                 | アイピーシー         | Inter-Process Communication。プロセス間通信。                   |
| Renderer Process    | レンダラープロセス   | Electronで画面描画を担当するプロセス。                          |
| Main Process        | メインプロセス       | ElectronでOS機能にアクセスするプロセス。                        |
| contextBridge       | コンテキストブリッジ | Main/Renderer間の安全な通信を提供するElectron API。             |
| SDK                 | エスディーケー       | Software Development Kit。開発キット。                          |
| Exponential Backoff | 指数バックオフ       | リトライ間隔を指数関数的に増やす戦略。                          |
| LRU                 | エルアールユー       | Least Recently Used。最も長く使われていないものを削除する方式。 |
| Zod                 | ゾッド               | TypeScript向けスキーマ検証ライブラリ。                          |
| Hook                | フック               | Reactの状態管理・副作用処理のための関数。                       |

---

## 6. ファイル構成

```
packages/shared/src/agent/
├── index.ts           # Barrel export
├── types.ts           # 型定義
├── errors.ts          # エラークラス
├── validation.ts      # Zodスキーマ
├── agent-client.ts    # SDKクライアント
└── session-manager.ts # セッション管理

apps/desktop/src/main/agent/
├── index.ts           # Barrel export
└── agent-handler.ts   # IPCハンドラー

apps/desktop/src/renderer/hooks/
└── useAgent.ts        # React Hook
```

---

## 7. テストカバレッジ

| ファイル           | Statements | Branches | Functions |
| ------------------ | ---------- | -------- | --------- |
| agent-client.ts    | 100%       | 97.87%   | 100%      |
| session-manager.ts | 100%       | 100%     | 100%      |
| validation.ts      | 100%       | 100%     | 100%      |
| errors.ts          | 100%       | 100%     | 100%      |
| agent-handler.ts   | 93.26%     | 100%     | 100%      |
| useAgent.ts        | 97.19%     | 88.46%   | 100%      |

**総テスト数**: 164テスト
