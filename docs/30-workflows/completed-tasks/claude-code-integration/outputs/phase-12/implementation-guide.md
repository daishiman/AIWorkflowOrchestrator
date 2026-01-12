# Claude Agent SDK統合 - 実装ガイド

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| 機能名     | Claude Agent SDK統合（AGENT-005） |
| 作成日     | 2026-01-12                        |
| 対象読者   | 開発者・技術者・学習者            |
| 関連タスク | SKILL-003（スキル管理機能）依存   |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. この機能は何をするものか

### 1.1 身近な例で考えてみよう

この機能は「AIアシスタントとの会話窓口」のようなものです。

```
┌─────────────────────────────────────────┐
│ あなた（ユーザー）                        │
│ 「この関数のバグを直してほしい」          │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 受付（Agent SDK統合）                     │
│ ・リクエストを受け取る                    │
│ ・危険な作業は確認を取る                  │
│ ・進捗をリアルタイムで伝える             │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ Claude（AIエンジン）                      │
│ ・コードを読んで理解する                  │
│ ・バグを見つけて修正案を出す              │
└─────────────────────────────────────────┘
```

電話の受付係のように、あなたの要望を受け取り、作業の進捗を教えて、危険なことをしそうになったら確認を取ってくれます。

### 1.2 なぜ必要なの？

AIに直接コードを触らせるのは便利ですが、危険もあります。

| 問題                         | 解決策                             |
| ---------------------------- | ---------------------------------- |
| ファイルを勝手に消されたら？ | 危険なコマンドは自動でブロック     |
| システムを壊されたら？       | 大事なファイルへのアクセスを制限   |
| 途中で止めたくなったら？     | キャンセルボタンでいつでも中断可能 |
| 何をしているかわからない     | リアルタイムで進捗を表示           |

### 1.3 今回作ったもの

| 日本語名       | 英語名             | 役割                                   |
| -------------- | ------------------ | -------------------------------------- |
| 実行マネージャ | ExecutionManager   | 複数の作業を同時に管理する（最大5個）  |
| 実行者         | AgentExecutor      | 1つの作業を担当、AIとやり取りする      |
| フック工場     | HooksFactory       | 作業の監視役、危険を検知したらストップ |
| 権限解決者     | PermissionResolver | 「これやっていい？」をユーザーに聞く   |
| 権限ルール     | PermissionRules    | 何を許可/禁止するかのルールブック      |

---

## 2. どうやって動くの？

### 2.1 全体の流れ

```
ステップ1: ユーザーが「このバグ直して」と指示
    ↓
ステップ2: 受付（IPC Handler）が受け取り、実行マネージャに依頼
    ↓
ステップ3: 実行者がClaude（AI）に作業を依頼
    ↓
ステップ4: Claudeがファイルを読んだり編集したりする
    ↓   ↑（リアルタイムで進捗を報告）
ステップ5: 危険なことをしようとしたら確認画面を出す
    ↓
ステップ6: 作業完了を報告
```

### 2.2 危険なコマンドのブロック

「rm -rf」のような危険なコマンドは自動でブロックされます。

| 危険パターン | 何が危ないか                     |
| ------------ | -------------------------------- | ---------------------------------------- |
| `rm -rf`     | ファイルを全部消してしまう       |
| `sudo`       | 管理者権限で何でもできる         |
| `chmod 777`  | ファイルを誰でも触れるようにする |
| `dd if=`     | ディスクを直接書き換える         |
| `mkfs`       | ディスクを初期化してしまう       |
| `:(){ :      | :& };:`                          | パソコンをフリーズさせる（フォークボム） |

---

## 3. 作ったものの全体像

```
┌───────────────────────────────────────────────────────────────┐
│                    画面（Renderer Process）                    │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────────┐ │
│  │ スキル選択  │ │ メッセージ   │ │ 「やっていい？」画面    │ │
│  └─────────────┘ └──────────────┘ └─────────────────────────┘ │
└──────────────────────────┬────────────────────────────────────┘
                           │ 窓口（IPC）
┌──────────────────────────┼────────────────────────────────────┐
│              中枢（Main Process）                              │
│  ┌───────────────────────┴───────────────────────────────────┐│
│  │                   実行マネージャ                           ││
│  │   作業1    作業2    作業3    作業4    作業5               ││
│  │    ↓        ↓        ↓        ↓        ↓                 ││
│  │  実行者   実行者   実行者   実行者   実行者               ││
│  └───────────────────────┬───────────────────────────────────┘│
│  ┌───────────────────────┴───────────────────────────────────┐│
│  │                  フック工場（監視役）                      ││
│  │  ・危険コマンド検知  ・進捗報告  ・権限確認                ││
│  └───────────────────────────────────────────────────────────┘│
└──────────────────────────┬────────────────────────────────────┘
                           │
┌──────────────────────────┴────────────────────────────────────┐
│                Claude Agent SDK（AIエンジン）                  │
└───────────────────────────────────────────────────────────────┘
```

---

# Part 2: 技術的な詳細（開発者向け）

## 1. アーキテクチャ概要

### 1.1 ファイル構成

```
apps/desktop/src/main/
├── ipc/
│   └── agentHandlers.ts      # IPCハンドラー登録
└── services/agent/
    ├── AgentExecutor.ts      # 単一実行の制御
    ├── ExecutionManager.ts   # 複数実行の管理
    ├── HooksFactory.ts       # Hooksオブジェクト生成
    ├── PermissionRules.ts    # 権限ルール変換
    └── index.ts              # バレルエクスポート

packages/shared/src/types/
└── agent-execution.ts        # 共有型定義
```

### 1.2 クラス構成

```
ExecutionManager（複数実行管理）
├── Map<executionId, AgentExecutor>
├── startExecution(): Promise<string>
├── stopExecution(): boolean
├── stopAllExecutions(): void
└── resolvePermission(): boolean
        │
        │ 1:N
        ▼
AgentExecutor（単一実行制御）
├── AbortController（キャンセル制御）
├── PermissionResolver（権限応答待機）
├── start(): Promise<void>
└── stop(): void
        │
        ├────────────────────┐
        ▼                    ▼
HooksFactory              PermissionResolver
├── createHooks()         ├── waitForResponse()
└── (PreToolUse,          └── resolveRequest()
     PostToolUse,
     PermissionRequest)
```

---

## 2. IPC通信フロー

### 2.1 実行開始フロー

```
Renderer                    Main                     SDK
   │                         │                        │
   │  agent:start(request)   │                        │
   │ ─────────────────────>  │                        │
   │                         │ ExecutionManager       │
   │                         │ .startExecution()      │
   │                         │                        │
   │                         │    AgentExecutor       │
   │                         │    .start()            │
   │                         │────────────────────────>
   │                         │                   query()
   │   agent:stream          │                        │
   │ <───────────────────────│<───────────────────────│
   │   (リアルタイム)        │      AsyncIterator     │
   │                         │                        │
   │   agent:status          │                        │
   │ <───────────────────────│                        │
   │   (completed)           │                        │
```

### 2.2 Permission確認フロー

```
Renderer                    Main                     SDK
   │                         │                        │
   │                         │<───PermissionRequest───│
   │                         │                        │
   │   agent:permission      │                        │
   │ <───────────────────────│                        │
   │   (ダイアログ表示)      │   PermissionResolver   │
   │                         │   .waitForResponse()   │
   │                         │   (待機中...)          │
   │                         │                        │
   │ agent:permission:res    │                        │
   │ ─────────────────────>  │                        │
   │   (ユーザー応答)        │   .resolveRequest()    │
   │                         │────────────────────────>
   │                         │   proceed: true/false  │
```

### 2.3 キャンセルフロー

```
Renderer                    Main                     SDK
   │                         │                        │
   │   agent:stop(execId)    │                        │
   │ ─────────────────────>  │                        │
   │                         │ AbortController        │
   │                         │ .abort()               │
   │                         │────────────────────────>
   │                         │   AbortSignal          │
   │                         │                        │
   │   agent:status          │                        │
   │ <───────────────────────│                        │
   │   (cancelled)           │                        │
```

---

## 3. 各コンポーネントの実装詳細

### 3.1 ExecutionManager

**なぜこの設計か**: 複数のAI実行を独立して管理するため。1つがエラーになっても他に影響しない。

```typescript
// ExecutionManager.ts
class ExecutionManager {
  // なぜMap: executionIdで高速アクセス（O(1)）
  // なぜprivate: 外部から直接操作させない
  private executions: Map<string, AgentExecutor> = new Map();

  async startExecution(
    request: AgentExecutionRequest,
    mainWindow: BrowserWindow,
  ): Promise<string> {
    // なぜ同時実行制限: リソース枯渇を防ぐ
    if (this.executions.size >= AGENT_DEFAULTS.MAX_CONCURRENT_EXECUTIONS) {
      throw new Error("Maximum concurrent executions reached");
    }

    const executionId = request.executionId ?? crypto.randomUUID();
    // なぜUUID: オフライン環境でも衝突しない一意性
    // ...
  }
}
```

### 3.2 AgentExecutor

**なぜこの設計か**: AbortControllerパターンでWeb標準に準拠したキャンセル処理。

```typescript
// AgentExecutor.ts
class AgentExecutor {
  // なぜAbortController: Web標準のキャンセルパターン
  // なぜprivate: 外部から直接abortさせない（stop()経由にする）
  private abortController = new AbortController();

  async start(): Promise<void> {
    // なぜtry-finally: 成功/失敗問わずクリーンアップを保証
    try {
      // SDKのquery()を呼び出し
      const conversation = await query({
        prompt: this.request.prompt,
        options: {
          hooks: this.hooksFactory.createHooks(),
          signal: this.abortController.signal,
          // なぜsignal伝播: キャンセルをSDK内部に伝える
        },
      });

      // なぜfor await: ストリーミング処理の標準パターン
      for await (const message of conversation) {
        this.sendStreamMessage(message);
      }
    } finally {
      // なぜfinally: エラーでも完了通知を送る
      this.sendStatusUpdate("completed");
    }
  }
}
```

### 3.3 HooksFactory

**なぜこの設計か**: Hooks生成ロジックを分離し、テスタビリティを向上。

```typescript
// HooksFactory.ts
class HooksFactory {
  createHooks(): Options["hooks"] {
    return {
      // なぜPreToolUse: ツール実行前に危険検知できる
      preToolUse: async (input) => {
        if (this.isDangerousCommand(input)) {
          // なぜblockとerror: SDKに処理中断を指示
          return {
            block: true,
            error: "危険なコマンドがブロックされました",
          };
        }
        return { proceed: true };
      },

      // なぜPostToolUse: 実行後の状態をUIに通知
      postToolUse: async (input) => {
        this.sendToRenderer("agent:status", { ... });
        return { proceed: true };
      },

      // なぜPermissionRequest: ユーザー確認が必要な操作用
      permissionRequest: async (input) => {
        // RendererにPermission要求を送信
        this.mainWindow.webContents.send("agent:permission", {
          executionId: this.executionId,
          requestId: crypto.randomUUID(),
          toolName: input.toolName,
          args: input.args,
        });

        // なぜawait: ユーザー応答を待つ必要がある
        const response = await this.permissionResolver.waitForResponse(
          requestId,
          this.abortController.signal
        );

        return { proceed: response.approved };
      },
    };
  }

  // なぜ独立メソッド: 危険パターンの判定ロジックをテスト可能に
  private isDangerousCommand(input: HookInput): boolean {
    if (input.toolName !== "Bash") return false;
    const command = String(input.args.command || "");
    return DANGEROUS_PATTERNS.BASH_COMMANDS.some((pattern) =>
      command.includes(pattern)
    );
  }
}
```

### 3.4 PermissionResolver

**なぜこの設計か**: Promiseパターンで非同期の応答待機を実現。

```typescript
// HooksFactory.ts内のPermissionResolver
class PermissionResolver {
  // なぜMap: 複数の同時Permission要求に対応
  private pendingRequests = new Map<
    string,
    { resolve: (r: PermissionResponse) => void; reject: (e: Error) => void }
  >();

  waitForResponse(
    requestId: string,
    signal: AbortSignal,
  ): Promise<PermissionResponse> {
    return new Promise((resolve, reject) => {
      // なぜabort監視: キャンセル時にPromiseを解決する
      const abortHandler = () => {
        this.pendingRequests.delete(requestId);
        reject(new Error("Aborted"));
      };

      signal.addEventListener("abort", abortHandler, { once: true });
      this.pendingRequests.set(requestId, { resolve, reject });
    });
  }
}
```

---

## 4. セキュリティ設計

### 4.1 危険コマンドブロック

| パターン    | ブロック理由             | 検知場所        |
| ----------- | ------------------------ | --------------- | --------------- |
| `rm -rf`    | 再帰的削除               | PreToolUse Hook |
| `sudo`      | 特権昇格                 | PreToolUse Hook |
| `chmod 777` | 危険なパーミッション変更 | PreToolUse Hook |
| `dd if=`    | ディスクイメージ操作     | PreToolUse Hook |
| `mkfs`      | ファイルシステム作成     | PreToolUse Hook |
| `:(){ :     | :& };:`                  | フォークボム    | PreToolUse Hook |
| `> /dev/`   | デバイスへの書き込み     | PreToolUse Hook |

### 4.2 IPC検証

```typescript
// agentHandlers.ts
ipcMain.handle(IPC_CHANNELS.AGENT_EXECUTION_START, async (event, request) => {
  // なぜvalidateIpcSender: 不正なウィンドウからの呼び出しを防ぐ
  const validation = validateIpcSender(event, channelName, {
    getAllowedWindows: () => [mainWindow],
  });

  if (!validation.valid) {
    throw toIPCValidationError(validation);
  }

  // なぜ入力検証: 不正なデータによるクラッシュを防ぐ
  if (!request?.prompt || typeof request.prompt !== "string") {
    throw { code: "VALIDATION_ERROR", message: "prompt is required" };
  }
});
```

---

## 5. テスト構成

| テストファイル           | テスト数 | カバー範囲                       |
| ------------------------ | -------- | -------------------------------- |
| HooksFactory.test.ts     | 20       | 危険コマンド検知、Hook動作       |
| AgentExecutor.test.ts    | 12       | 実行制御、キャンセル、エラー処理 |
| ExecutionManager.test.ts | 13       | 複数実行管理、同時実行制限       |
| agentHandlers.test.ts    | 16       | IPC通信、入力バリデーション      |
| integration.test.ts      | 8        | エンドツーエンドフロー           |
| **合計**                 | **69**   |                                  |

### 5.1 テスト実行コマンド

```bash
# Agent関連テストのみ実行
pnpm --filter @repo/desktop test apps/desktop/src/main/services/agent

# カバレッジ付きで実行
pnpm --filter @repo/desktop test --coverage apps/desktop/src/main/services/agent
```

---

## 6. 使用上の注意

### 6.1 SDK未接続での動作

現在`@anthropic-ai/claude-agent-sdk`は未リリースのため、モック実装で動作確認しています。

```typescript
// ❌ 使用禁止（実SDKがない）
import { query } from "@anthropic-ai/claude-agent-sdk";

// ⭕ 正しい使い方（モックで代替）
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn().mockResolvedValue(mockAsyncIterable([...])),
}));
```

### 6.2 同時実行制限

```typescript
// ❌ 制限を超えて実行しようとする
for (let i = 0; i < 10; i++) {
  await manager.startExecution(request, mainWindow); // 6個目以降はエラー
}

// ⭕ 制限を確認してから実行
if (manager.getActiveExecutions().length < 5) {
  await manager.startExecution(request, mainWindow);
}
```

---

## 7. 次のステップ

| タスクID | タスク名                   | 状態   |
| -------- | -------------------------- | ------ |
| -        | 実SDK接続時のE2Eテスト追加 | 未実施 |
| -        | パフォーマンス計測         | 未実施 |
| -        | 長時間実行テスト           | 未実施 |

---

## 8. 用語集

| 用語             | 読み方               | 説明                                                     |
| ---------------- | -------------------- | -------------------------------------------------------- |
| IPC              | アイピーシー         | Inter-Process Communication。プロセス間通信の仕組み      |
| Main Process     | メインプロセス       | Electronの中枢。ファイルやシステムにアクセスできる       |
| Renderer Process | レンダラープロセス   | 画面を表示するプロセス。Webブラウザのようなもの          |
| contextBridge    | コンテキストブリッジ | MainとRenderer間で安全に通信するための橋渡し役           |
| AbortController  | アボートコントローラ | 処理のキャンセルを制御するWeb標準のオブジェクト          |
| AbortSignal      | アボートシグナル     | キャンセルが発生したことを伝える信号                     |
| AsyncIterator    | アシンクイテレータ   | 非同期でデータを1つずつ取得する仕組み（for awaitで使う） |
| Hook             | フック               | 処理の途中に割り込んで何かをする仕組み                   |
| PreToolUse       | プレツールユーズ     | ツール実行前に呼ばれるフック                             |
| PostToolUse      | ポストツールユーズ   | ツール実行後に呼ばれるフック                             |
| UUID             | ユーユーアイディー   | Universally Unique Identifier。世界で唯一のID            |
| SDK              | エスディーケー       | Software Development Kit。開発用のツールセット           |
| Promise          | プロミス             | 「後で結果を返す」という約束。非同期処理の基本パターン   |
| Map              | マップ               | キーと値のペアを保存するデータ構造。検索が高速（O(1)）   |
