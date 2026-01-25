# Workspace Chat Edit Main Process 要件定義書

## 概要

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| 作成日     | 2026-01-24                       |
| 対象       | Workspace Chat Edit Main Process |
| 関連Issue  | #469                             |
| ステータス | 完了                             |

---

## 1. 機能要件

### 1.1 FileService (REQ-F-001 ~ REQ-F-004)

ファイルの読み書きと言語検出を担当するサービス。

| 要件ID    | 機能           | 説明                         | 入力                       | 出力               |
| --------- | -------------- | ---------------------------- | -------------------------- | ------------------ |
| REQ-F-001 | readFile       | ファイル内容を読み取る       | filePath: string           | FileReadResult     |
| REQ-F-002 | writeFile      | ファイルに内容を書き込む     | filePath, content, options | FileWriteResult    |
| REQ-F-003 | detectLanguage | ファイルパスから言語を検出   | filePath: string           | string             |
| REQ-F-004 | createBackup   | ファイルのバックアップを作成 | filePath: string           | backupPath: string |

#### 制約条件

- 最大ファイルサイズ: 10MB（`MAX_FILE_SIZE = 10 * 1024 * 1024`）
- バックアップ形式: `{filename}.{timestamp}.bak`
- 対応エンコーディング: UTF-8

#### 型定義

```typescript
interface FileReadResult {
  success: boolean;
  content?: string;
  language?: string;
  fileSize?: number;
  error?: FileReadError;
}

interface FileReadError {
  code: "FILE_NOT_FOUND" | "PERMISSION_DENIED" | "READ_ERROR" | "TOO_LARGE";
  message: string;
}

interface FileWriteResult {
  success: boolean;
  backupPath?: string;
  error?: FileWriteError;
}

interface FileWriteError {
  code: "PERMISSION_DENIED" | "WRITE_ERROR" | "INVALID_PATH";
  message: string;
}

interface FileWriteOptions {
  createBackup?: boolean;
  encoding?: string;
}
```

---

### 1.2 ContextBuilder (REQ-F-005 ~ REQ-F-007)

ファイルコンテキストからLLMプロンプト用文字列を構築するサービス。

| 要件ID    | 機能          | 説明                                       | 入力               | 出力    |
| --------- | ------------- | ------------------------------------------ | ------------------ | ------- |
| REQ-F-005 | build         | FileContextからLLMプロンプト用文字列を構築 | FileContextInput[] | string  |
| REQ-F-006 | calculateSize | コンテキスト合計サイズを計算               | FileContextInput[] | number  |
| REQ-F-007 | validateSize  | サイズ制限チェック                         | FileContextInput[] | boolean |

#### 制約条件

- 最大コンテキストサイズ: 100KB（`MAX_CONTEXT_SIZE = 100 * 1024`）
- 最大ファイルコンテキスト数: 10（`MAX_FILE_CONTEXTS = 10`）
- Markdown形式で構築
- 選択範囲がある場合はハイライト

#### 型定義

```typescript
interface FileContextInput {
  filePath: string;
  content: string;
  selection?: TextSelection;
  language: string;
}

interface TextSelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  selectedText: string;
}
```

---

### 1.3 ChatEditService (REQ-F-008 ~ REQ-F-010)

LLMとの統合とコード編集生成を担当するサービス。

| 要件ID    | 機能            | 説明                                  | 入力                   | 出力                    |
| --------- | --------------- | ------------------------------------- | ---------------------- | ----------------------- |
| REQ-F-008 | sendWithContext | コンテキスト付きでLLMにリクエスト送信 | SendWithContextRequest | SendWithContextResponse |
| REQ-F-009 | buildPrompt     | コマンドタイプ別プロンプト生成        | EditCommand, context   | string                  |
| REQ-F-010 | parseResponse   | LLM応答をGeneratedResultに変換        | llmResponse            | GeneratedResult         |

#### コマンドタイプ

| タイプ          | 説明             |
| --------------- | ---------------- |
| `continue`      | 続きを書く       |
| `refactor`      | リファクタリング |
| `generate-test` | テスト生成       |
| `add-comment`   | コメント追加     |
| `custom`        | カスタム指示     |

#### 型定義

```typescript
type EditCommandType =
  | "continue"
  | "refactor"
  | "generate-test"
  | "add-comment"
  | "custom";

interface EditCommand {
  type: EditCommandType;
  targetContextId: string;
  instruction?: string;
  options?: EditCommandOptions;
}

interface SendWithContextRequest {
  contexts: FileContextInput[];
  command: EditCommand;
  message: string;
  options?: SendOptions;
}

interface SendWithContextResponse {
  success: boolean;
  result?: GeneratedResult;
  error?: SendError;
}

interface SendError {
  code:
    | "CONTEXT_TOO_LARGE"
    | "LLM_ERROR"
    | "TIMEOUT"
    | "RATE_LIMIT"
    | "INVALID_COMMAND";
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
}

interface GeneratedResult {
  id: string;
  contextId: string;
  originalContent: string;
  generatedContent: string;
  diffHunks: DiffHunk[];
  status: GeneratedResultStatus;
  createdAt: Date;
  targetFilePath: string;
  command: EditCommand;
  llmMetadata?: LLMMetadata;
}
```

---

### 1.4 IPCハンドラ (REQ-F-011 ~ REQ-F-014)

Renderer ProcessからのIPCリクエストを処理するハンドラ。

| 要件ID    | チャンネル                    | 方向            | 説明                     | 認証    |
| --------- | ----------------------------- | --------------- | ------------------------ | ------- |
| REQ-F-011 | `chat-edit:read-file`         | Renderer → Main | ファイル読み取り         | IPC検証 |
| REQ-F-012 | `chat-edit:write-file`        | Renderer → Main | ファイル書き込み         | IPC検証 |
| REQ-F-013 | `chat-edit:get-selection`     | Renderer → Main | エディタ選択範囲取得     | IPC検証 |
| REQ-F-014 | `chat-edit:send-with-context` | Renderer → Main | コンテキスト付きチャット | IPC検証 |

#### ハンドラ登録場所

- `apps/desktop/src/main/ipc/chatEditHandlers.ts`
- `apps/desktop/src/preload/channels.ts` にホワイトリスト登録

---

## 2. 非機能要件

### 2.1 セキュリティ要件 (REQ-NF-001 ~ REQ-NF-004)

| 要件ID     | 要件                             | 対応方法                            |
| ---------- | -------------------------------- | ----------------------------------- |
| REQ-NF-001 | 全IPCハンドラでsender検証を実施  | validateIpcSender使用               |
| REQ-NF-002 | ファイルパストラバーサル防止     | path.resolve + 正規化検証           |
| REQ-NF-003 | ホワイトリストチャンネルのみ許可 | ALLOWED_INVOKE_CHANNELS登録         |
| REQ-NF-004 | 機密ファイルへのアクセス防止     | .env, credentials等のパス検証ルール |

#### validateIpcSender パターン

```typescript
import { validateIpcSender } from "../security/ipcSenderValidator";

ipcMain.handle("chat-edit:read-file", async (event, filePath: string) => {
  validateIpcSender(event);
  // ハンドラ処理
});
```

#### safeInvoke パターン

```typescript
const ALLOWED_INVOKE_CHANNELS = [
  "chat-edit:read-file",
  "chat-edit:write-file",
  "chat-edit:get-selection",
  "chat-edit:send-with-context",
];

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

### 2.2 パフォーマンス要件 (REQ-NF-005 ~ REQ-NF-007)

| 要件ID     | 要件                     | 目標値                   |
| ---------- | ------------------------ | ------------------------ |
| REQ-NF-005 | ファイル読み取り応答時間 | 1秒以内（10MBファイル）  |
| REQ-NF-006 | LLMリクエスト応答時間    | 30秒以内（タイムアウト） |
| REQ-NF-007 | コンテキスト構築時間     | 100ms以内（10ファイル）  |

### 2.3 品質要件 (REQ-NF-008 ~ REQ-NF-012)

| 要件ID     | 要件              | 目標値 |
| ---------- | ----------------- | ------ |
| REQ-NF-008 | Line Coverage     | ≥ 80%  |
| REQ-NF-009 | Branch Coverage   | ≥ 60%  |
| REQ-NF-010 | Function Coverage | ≥ 80%  |
| REQ-NF-011 | 型エラー          | 0件    |
| REQ-NF-012 | Lintエラー        | 0件    |

---

## 3. 受け入れ基準

### 3.1 FileService受け入れ基準

- [x] 存在するファイルの内容を読み取れる
- [x] 存在しないファイルでFILE_NOT_FOUNDエラーを返す
- [x] 10MBを超えるファイルでTOO_LARGEエラーを返す
- [x] パーミッションがないファイルでPERMISSION_DENIEDエラーを返す
- [x] ファイルに内容を書き込める
- [x] バックアップが正しく作成される（形式: `{filename}.{timestamp}.bak`）
- [x] 言語検出が拡張子に基づいて動作する

### 3.2 ContextBuilder受け入れ基準

- [x] 複数のFileContextからMarkdown形式で構築できる
- [x] 選択範囲がハイライトされる
- [x] コンテキストサイズが正しく計算される
- [x] 100KBを超える場合にvalidateSizeがfalseを返す
- [x] 10ファイルを超える場合に適切にエラーを返す

### 3.3 ChatEditService受け入れ基準

- [x] 各コマンドタイプ（continue, refactor, generate-test, add-comment, custom）で適切なプロンプトが生成される
- [x] LLM Adapter（apps/desktop/src/main/adapters/llm/）と統合できる
- [x] LLM応答をGeneratedResultに変換できる
- [x] 差分（DiffHunk）が正しく計算される
- [x] エラー時に適切なエラーレスポンス（SendError）を返す
- [x] タイムアウト（30秒）が正しく動作する
- [x] retryable=trueの場合にリトライ情報（retryAfterMs）が含まれる

### 3.4 IPCハンドラ受け入れ基準

- [x] 全チャンネルがALLOWED_INVOKE_CHANNELSホワイトリストに登録されている
- [x] 全ハンドラでvalidateIpcSenderが使用されている
- [x] 不正なsenderからのリクエストを拒否する
- [x] 正常なリクエストで期待される結果を返す
- [x] 入力バリデーションが全ハンドラで実装されている

---

## 4. 統合テスト連携

### 4.1 IPC接続要件

| チャンネル                    | 入力型                         | 出力型                    |
| ----------------------------- | ------------------------------ | ------------------------- |
| `chat-edit:read-file`         | `string`                       | `FileReadResult`          |
| `chat-edit:write-file`        | `{filePath, content, options}` | `FileWriteResult`         |
| `chat-edit:get-selection`     | `void`                         | `TextSelection \| null`   |
| `chat-edit:send-with-context` | `SendWithContextRequest`       | `SendWithContextResponse` |

### 4.2 認証フロー

```
Renderer Process
     │
     ▼
contextBridge.exposeInMainWorld('electronAPI', { ... })
     │
     ▼
safeInvoke(channel, ...args)  ← ALLOWED_INVOKE_CHANNELS検証
     │
     ▼
ipcRenderer.invoke(channel, ...args)
     │
     ▼
Main Process
     │
     ▼
ipcMain.handle(channel, handler)
     │
     ▼
validateIpcSender(event)  ← 送信元検証
     │
     ▼
ハンドラ処理（FileService/ContextBuilder/ChatEditService）
```

### 4.3 データフロー

```
[Renderer]                    [Main Process]                 [External]
    │                              │                             │
    │  chat-edit:read-file         │                             │
    ├─────────────────────────────►│                             │
    │                              │  FileService.readFile()     │
    │                              ├────────────────────────────►│ FileSystem
    │                              │◄────────────────────────────┤
    │  FileReadResult              │                             │
    │◄─────────────────────────────┤                             │
    │                              │                             │
    │  chat-edit:send-with-context │                             │
    ├─────────────────────────────►│                             │
    │                              │  ContextBuilder.build()     │
    │                              │  ChatEditService.sendWithContext()
    │                              ├────────────────────────────►│ LLM Adapter
    │                              │◄────────────────────────────┤
    │  SendWithContextResponse     │                             │
    │◄─────────────────────────────┤                             │
```

---

## 5. 既存実装参照

| 実装                  | パス                                                                    | 参照目的                |
| --------------------- | ----------------------------------------------------------------------- | ----------------------- |
| 型定義                | `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` | 型を再利用              |
| LLM Adapter           | `apps/desktop/src/main/adapters/llm/`                                   | LLM統合パターン参照     |
| skillHandlers（参考） | `apps/desktop/src/main/ipc/skillHandlers.ts`                            | IPCハンドラパターン参照 |
| channels.ts           | `apps/desktop/src/preload/channels.ts`                                  | チャンネル登録参照      |

---

## 6. システム仕様参照

| 参照資料                 | パス                                                                         |
| ------------------------ | ---------------------------------------------------------------------------- |
| APIエンドポイント        | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         |
| インターフェース（LLM）  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        |
| セキュリティ（Electron） | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

---

## 7. 要件一覧サマリー

### 機能要件（14項目）

| ID        | カテゴリ        | 要件                                 |
| --------- | --------------- | ------------------------------------ |
| REQ-F-001 | FileService     | readFile: ファイル内容を読み取る     |
| REQ-F-002 | FileService     | writeFile: ファイルに内容を書き込む  |
| REQ-F-003 | FileService     | detectLanguage: 言語を検出           |
| REQ-F-004 | FileService     | createBackup: バックアップを作成     |
| REQ-F-005 | ContextBuilder  | build: LLMプロンプト用文字列を構築   |
| REQ-F-006 | ContextBuilder  | calculateSize: サイズを計算          |
| REQ-F-007 | ContextBuilder  | validateSize: サイズ制限チェック     |
| REQ-F-008 | ChatEditService | sendWithContext: LLMにリクエスト送信 |
| REQ-F-009 | ChatEditService | buildPrompt: プロンプト生成          |
| REQ-F-010 | ChatEditService | parseResponse: LLM応答変換           |
| REQ-F-011 | IPCハンドラ     | chat-edit:read-file                  |
| REQ-F-012 | IPCハンドラ     | chat-edit:write-file                 |
| REQ-F-013 | IPCハンドラ     | chat-edit:get-selection              |
| REQ-F-014 | IPCハンドラ     | chat-edit:send-with-context          |

### 非機能要件（12項目）

| ID         | カテゴリ       | 要件                             |
| ---------- | -------------- | -------------------------------- |
| REQ-NF-001 | セキュリティ   | 全IPCハンドラでsender検証        |
| REQ-NF-002 | セキュリティ   | パストラバーサル防止             |
| REQ-NF-003 | セキュリティ   | ホワイトリストチャンネルのみ許可 |
| REQ-NF-004 | セキュリティ   | 機密ファイルアクセス防止         |
| REQ-NF-005 | パフォーマンス | ファイル読取 < 1秒               |
| REQ-NF-006 | パフォーマンス | LLMリクエスト < 30秒             |
| REQ-NF-007 | パフォーマンス | コンテキスト構築 < 100ms         |
| REQ-NF-008 | 品質           | Line Coverage ≥ 80%              |
| REQ-NF-009 | 品質           | Branch Coverage ≥ 60%            |
| REQ-NF-010 | 品質           | Function Coverage ≥ 80%          |
| REQ-NF-011 | 品質           | 型エラー 0件                     |
| REQ-NF-012 | 品質           | Lintエラー 0件                   |

---

## 8. 完了確認

- [x] 機能要件が明確に定義されている（14項目）
- [x] 非機能要件（セキュリティ、パフォーマンス、品質）が定義されている（12項目）
- [x] 受け入れ基準がチェックリスト形式で定義されている
- [x] システム仕様との整合性が確認されている
- [x] 接続要件（IPC/認証/データフロー）が明記されている
- [x] 既存型定義との整合性が確認されている
