# Workspace Chat Edit Main Process アーキテクチャ設計書

## 概要

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| 作成日     | 2026-01-24                       |
| 対象       | Workspace Chat Edit Main Process |
| 関連Issue  | #469                             |
| 前提Phase  | Phase 1（要件定義）              |
| ステータス | 完了                             |

---

## 1. コンポーネント構成

### 1.1 ディレクトリ構造

```
apps/desktop/src/
├── main/
│   ├── services/
│   │   └── chat-edit/
│   │       ├── FileService.ts        # ファイルI/O操作
│   │       ├── ContextBuilder.ts     # コンテキスト構築
│   │       ├── ChatEditService.ts    # LLM連携（Facade）
│   │       ├── types.ts              # Main Process用型定義
│   │       ├── constants.ts          # 定数定義
│   │       ├── index.ts              # エクスポート
│   │       └── __tests__/            # ユニットテスト
│   │           ├── FileService.test.ts
│   │           ├── ContextBuilder.test.ts
│   │           ├── ChatEditService.test.ts
│   │           └── integration.test.ts
│   └── ipc/
│       └── chatEditHandlers.ts       # IPCハンドラ
└── preload/
    └── channels.ts                   # チャンネル定義（更新）
```

### 1.2 コンポーネント責務

| コンポーネント   | 責務                                  |
| ---------------- | ------------------------------------- |
| FileService      | ファイル読み取り/書き込み/言語検出    |
| ContextBuilder   | LLMプロンプト用コンテキスト文字列構築 |
| ChatEditService  | LLM連携のFacade（統合サービス）       |
| chatEditHandlers | IPC通信のエントリポイント             |

---

## 2. 依存関係

### 2.1 依存関係図

```
┌─────────────────────────────────────────────────────────────┐
│                     Renderer Process                        │
│  window.electronAPI.chatEdit.{method}()                     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Preload Script                          │
│  contextBridge.exposeInMainWorld()                          │
│  safeInvoke() → ALLOWED_INVOKE_CHANNELS検証                 │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Main Process                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              chatEditHandlers                        │   │
│  │  validateIpcSender() → サービス呼び出し              │   │
│  └─────────────────────────────┬───────────────────────┘   │
│                                │                            │
│                                ▼                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           ChatEditService (Facade)                   │   │
│  │  sendWithContext() / buildPrompt() / parseResponse() │   │
│  └────────┬──────────────────┬─────────────────┬───────┘   │
│           │                  │                 │            │
│           ▼                  ▼                 ▼            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ FileService │    │ContextBuil │    │ LLMAdapter  │     │
│  │             │    │ der         │    │ (既存)      │     │
│  └──────┬──────┘    └─────────────┘    └─────────────┘     │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
    ┌───────────┐
    │ FileSystem│
    └───────────┘
```

### 2.2 依存関係ルール

| 依存元           | 依存先            | 許可理由             |
| ---------------- | ----------------- | -------------------- |
| chatEditHandlers | ChatEditService   | Facade呼び出し       |
| chatEditHandlers | FileService       | 直接ファイル操作     |
| chatEditHandlers | validateIpcSender | セキュリティ検証     |
| ChatEditService  | FileService       | ファイル読み取り     |
| ChatEditService  | ContextBuilder    | コンテキスト構築     |
| ChatEditService  | LLMAdapter        | LLM API呼び出し      |
| FileService      | fs/promises       | ファイルシステム操作 |
| ContextBuilder   | なし（純粋関数）  | -                    |

---

## 3. データフロー

### 3.1 ファイル読み取りフロー

```
Renderer                 Preload                  Main Process
   │                        │                          │
   │ chatEdit.readFile()    │                          │
   ├───────────────────────►│                          │
   │                        │ safeInvoke()             │
   │                        ├─────────────────────────►│
   │                        │                          │ validateIpcSender()
   │                        │                          │ fileService.readFile()
   │                        │                          │     │
   │                        │                          │     ▼
   │                        │                          │ fs.readFile()
   │                        │                          │◄────┘
   │                        │    FileReadResult        │
   │                        │◄─────────────────────────┤
   │  FileReadResult        │                          │
   │◄───────────────────────┤                          │
```

### 3.2 コンテキスト付き送信フロー

```
Renderer                 Preload                  Main Process
   │                        │                          │
   │ chatEdit.sendWith      │                          │
   │   Context(request)     │                          │
   ├───────────────────────►│                          │
   │                        │ safeInvoke()             │
   │                        ├─────────────────────────►│
   │                        │                          │ validateIpcSender()
   │                        │                          │
   │                        │                          │ chatEditService
   │                        │                          │   .sendWithContext()
   │                        │                          │     │
   │                        │                          │     ▼
   │                        │                          │ contextBuilder.build()
   │                        │                          │     │
   │                        │                          │     ▼
   │                        │                          │ buildPrompt()
   │                        │                          │     │
   │                        │                          │     ▼
   │                        │                          │ llmAdapter.send()
   │                        │                          │◄────┘
   │                        │                          │ parseResponse()
   │                        │                          │     │
   │                        │  SendWithContextResponse │     ▼
   │                        │◄─────────────────────────┤ GeneratedResult
   │ SendWithContext        │                          │
   │   Response             │                          │
   │◄───────────────────────┤                          │
```

---

## 4. 統合ポイント

### 4.1 IPC統合

| チャンネル                    | ハンドラ                                 |
| ----------------------------- | ---------------------------------------- |
| `chat-edit:read-file`         | `chatEditHandlers.handleReadFile`        |
| `chat-edit:write-file`        | `chatEditHandlers.handleWriteFile`       |
| `chat-edit:get-selection`     | `chatEditHandlers.handleGetSelection`    |
| `chat-edit:send-with-context` | `chatEditHandlers.handleSendWithContext` |

### 4.2 FileSystem統合

| 操作     | Node.js API             | サービスメソッド        |
| -------- | ----------------------- | ----------------------- |
| 読み取り | `fs.promises.readFile`  | `FileService.readFile`  |
| 書き込み | `fs.promises.writeFile` | `FileService.writeFile` |
| 統計情報 | `fs.promises.stat`      | `FileService.readFile`  |

### 4.3 LLM統合

| 操作       | LLMAdapter メソッド   | ChatEditService メソッド |
| ---------- | --------------------- | ------------------------ |
| チャット   | `LLMAdapter.send()`   | `sendWithContext()`      |
| ストリーム | `LLMAdapter.stream()` | 将来対応予定             |

### 4.4 セキュリティ統合

| 検証項目   | 実装箇所            | 検証方法                |
| ---------- | ------------------- | ----------------------- |
| IPC送信元  | chatEditHandlers    | validateIpcSender()     |
| チャンネル | preload/channels.ts | ALLOWED_INVOKE_CHANNELS |
| パス検証   | FileService         | path.resolve + 正規化   |

---

## 5. エラーハンドリング戦略

### 5.1 エラー分類

| エラータイプ   | 発生箇所         | 処理方法                   |
| -------------- | ---------------- | -------------------------- |
| IPC検証エラー  | chatEditHandlers | throw toIPCValidationError |
| ファイルエラー | FileService      | FileReadError/WriteError   |
| サイズ超過     | ContextBuilder   | CONTEXT_TOO_LARGE          |
| LLMエラー      | ChatEditService  | LLM_ERROR with retryable   |
| タイムアウト   | ChatEditService  | TIMEOUT with retryable     |

### 5.2 エラー伝播パス

```
FileSystem Error
     │
     ▼
FileService (FileReadError/FileWriteError にマッピング)
     │
     ▼
chatEditHandlers (そのまま返却)
     │
     ▼
Preload (Promise.reject)
     │
     ▼
Renderer (try/catch で処理)
```

---

## 6. テスト戦略

### 6.1 テスト構成

| テストタイプ   | 対象             | ファイル                 |
| -------------- | ---------------- | ------------------------ |
| ユニットテスト | FileService      | FileService.test.ts      |
| ユニットテスト | ContextBuilder   | ContextBuilder.test.ts   |
| ユニットテスト | ChatEditService  | ChatEditService.test.ts  |
| ユニットテスト | chatEditHandlers | chatEditHandlers.test.ts |
| 統合テスト     | E2Eフロー        | integration.test.ts      |

### 6.2 モック戦略

| 依存        | モック方法                 |
| ----------- | -------------------------- |
| fs/promises | vi.mock('fs/promises')     |
| LLMAdapter  | vi.mock('../adapters/llm') |
| IpcMain     | mockIpcMain with vi.fn()   |

---

## 7. 完了確認

- [x] コンポーネント構成が定義されている
- [x] 依存関係が明確になっている
- [x] データフローが設計されている
- [x] 統合ポイントが定義されている
- [x] エラーハンドリング戦略が定義されている
- [x] テスト戦略が定義されている
