# Chat Edit IPC/State/Runtime 契約一覧

## メタ情報

| 項目       | 値                                                                 |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 2（設計）                                                          |
| タスク ID  | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                        |
| 作成日     | 2026-03-14                                                         |
| ステータス | 設計中                                                             |
| 参照元     | chatEditHandlers.ts, workspace-chat-edit/types.ts, AuthModeService |

---

## 1. IPC 契約一覧

| チャンネル名                  | 引数                                                           | 戻り値                                  | 変更種別 | workspacePath 検証                   | 備考                                                          |
| ----------------------------- | -------------------------------------------------------------- | --------------------------------------- | -------- | ------------------------------------ | ------------------------------------------------------------- |
| `chat-edit:read-file`         | `{ filePath: string, workspacePath: string }`                  | `{ content: string, language: string }` | 維持     | 必須（既実装）                       | パストラバーサル防止済み                                      |
| `chat-edit:write-file`        | `{ filePath: string, content: string, workspacePath: string }` | `{ success: boolean }`                  | 維持     | 必須（既実装）                       | ".." / "//" を拒否                                            |
| `chat-edit:get-selection`     | `{ editorId: string }`                                         | `TextSelection \| null`                 | 廃止予定 | 不要                                 | Renderer 側管理に移行。State（chatEditSlice.selection）で代替 |
| `chat-edit:detect-language`   | `{ filePath: string, content?: string }`                       | `{ language: string }`                  | 維持     | 不要（パス検証のみ）                 | 拡張子ベースの言語推定                                        |
| `chat-edit:send-with-context` | `SendWithContextRequest`（拡張後）                             | `SendWithContextResponse`（拡張後）     | 修正     | 追加（workspacePath フィールド経由） | handoff 対応、RuntimeResolver 呼び出し追加                    |
| `chat-edit:stream-output`     | `{ resultId: string }`                                         | `AsyncIterable<StreamChunk>`            | 維持     | 不要                                 | 既存実装を変更しない                                          |

---

## 2. SendWithContextRequest 拡張契約

### 現状（変更前）

```typescript
interface SendWithContextRequest {
  contexts: FileContextInput[];
  command: EditCommand;
  message?: string;
  options?: SendOptions;
}
```

### 拡張後（変更後）

```typescript
interface SendWithContextRequest {
  contexts: FileContextInput[];
  command: EditCommand;
  message?: string;
  options?: SendOptions;
  /** 追加: ワークスペースルートの絶対パス。workspacePath 検証に使用する */
  workspacePath?: string;
}
```

### 補足

- `workspacePath` が未指定の場合はハンドラ側でデフォルトのワークスペースパスを使用する。
- パストラバーサル検証（".." と "//" の拒否）は `contexts[].filePath` に対して `workspacePath` を基準に適用する。
- `workspacePath` 自体も `validateWorkspacePath()` でホワイトリスト照合する。

---

## 3. SendWithContextResponse 拡張契約

### 現状（変更前）

```typescript
interface SendWithContextResponse {
  success: boolean;
  result?: GeneratedResult;
  error?: SendError;
}
```

### 拡張後（変更後）

```typescript
interface SendWithContextResponse {
  success: boolean;
  result?: GeneratedResult;
  error?: SendError;
  /** 追加: terminal モードへの handoff が発生した場合に true */
  handoff?: boolean;
  /** 追加: handoff 時にユーザーへ提示するガイダンス情報 */
  guidance?: HandoffGuidance;
}

interface HandoffGuidance {
  /** ユーザーが端末で実行すべきコマンド例 */
  terminalCommand: string;
  /** 現在のコンテキスト（選択範囲・ファイル）のサマリー文字列 */
  contextSummary: string;
  /** handoff が発生した理由（例: "API key not configured"） */
  reason: string;
}
```

### handoff 発生条件

| 条件                                              | handoff 発生 | 説明                                        |
| ------------------------------------------------- | ------------ | ------------------------------------------- |
| `authMode === 'terminal'`                         | 常に発生     | terminal モードは AI 直接実行不可           |
| `authMode === 'integrated'` かつ API キー未設定   | 発生         | integrated モードでもキー未設定時は handoff |
| `authMode === 'hybrid'` かつ integrated 失敗      | 発生         | hybrid モードのフォールバックパス           |
| `authMode === 'integrated'` かつ API キー設定済み | 発生しない   | 正常実行パス                                |

---

## 4. 新エラーコード定義

| コード                  | 説明                                             | retryable | 備考                                     |
| ----------------------- | ------------------------------------------------ | --------- | ---------------------------------------- |
| `SELECTION_REQUIRED`    | 編集コマンドに選択範囲が必要だが未指定           | false     | `EditCommand.type` が selection 系の場合 |
| `ACCESS_NOT_CONFIGURED` | integrated モードだが API キーが設定されていない | false     | handoff への遷移トリガーにもなる         |
| `RATE_LIMIT`            | LLM プロバイダのレート制限に到達                 | true      | バックオフ後に再試行可能                 |
| `TIMEOUT`               | LLM リクエストがタイムアウト                     | true      | デフォルト 30 秒                         |
| `CONTEXT_TOO_LARGE`     | コンテキストがトークン上限を超過                 | false     | 既存コード                               |
| `PERMISSION_DENIED`     | workspacePath 外のファイルへのアクセス試行       | false     | 既存コード（パストラバーサル防止）       |
| `LLM_ERROR`             | LLM プロバイダからの汎用エラー                   | false     | 既存コード                               |

### SendError 型（変更なし）

```typescript
interface SendError {
  code: string; // 上表のコードを使用
  message: string;
  retryable: boolean;
}
```

---

## 5. RuntimeResolver 契約インターフェース

### インターフェース定義

```typescript
/**
 * 認証モードと API キー設定状況に基づいてランタイム解決戦略を決定する。
 * chatEditHandlers.ts の send-with-context ハンドラから呼び出される。
 */
interface RuntimeResolver {
  resolve(authMode: AuthMode, hasApiKey: boolean): RuntimeResolution;
}

type AuthMode = "integrated" | "terminal" | "hybrid";

type RuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff" }
  | { type: "hybrid"; adapter: LLMAdapter; fallbackToHandoff: boolean };
```

### 解決ロジック仕様

| authMode     | hasApiKey | 解決結果                                               |
| ------------ | --------- | ------------------------------------------------------ |
| `integrated` | true      | `{ type: 'integrated', adapter }`                      |
| `integrated` | false     | `{ type: 'handoff' }`                                  |
| `terminal`   | any       | `{ type: 'handoff' }`                                  |
| `hybrid`     | true      | `{ type: 'hybrid', adapter, fallbackToHandoff: true }` |
| `hybrid`     | false     | `{ type: 'handoff' }`                                  |

### LLMAdapter インターフェース（参照用）

```typescript
interface LLMAdapter {
  generate(request: GenerateRequest): Promise<GeneratedResult>;
  stream(request: GenerateRequest): AsyncIterable<StreamChunk>;
}
```

---

## 6. State 契約（chatEditSlice）

### スライス状態定義

```typescript
interface ChatEditState {
  /** 現在の選択範囲。chat-edit:get-selection 廃止後は Renderer が直接管理 */
  selection: TextSelection | null;

  /** AI 生成処理中フラグ。send-with-context 実行中に true */
  isGenerating: boolean;

  /** 最後に生成された結果。null は未生成または結果クリア後 */
  generatedResult: GeneratedResult | null;

  /** handoff 発生時のガイダンス。null は通常実行中または handoff 未発生 */
  handoffGuidance: HandoffGuidance | null;

  /** 最後に発生したエラー。null はエラーなし */
  error: SendError | null;
}
```

### 初期状態

```typescript
const initialChatEditState: ChatEditState = {
  selection: null,
  isGenerating: false,
  generatedResult: null,
  handoffGuidance: null,
  error: null,
};
```

### アクション一覧

| アクション名       | ペイロード              | 説明                                                                     |
| ------------------ | ----------------------- | ------------------------------------------------------------------------ |
| `setSelection`     | `TextSelection \| null` | 選択範囲を更新する                                                       |
| `startGenerating`  | なし                    | `isGenerating` を true に設定し、前回のエラーと handoffGuidance をクリア |
| `finishGenerating` | `GeneratedResult`       | `isGenerating` を false に設定し、`generatedResult` を更新               |
| `setHandoff`       | `HandoffGuidance`       | `isGenerating` を false に設定し、`handoffGuidance` を更新               |
| `setError`         | `SendError`             | `isGenerating` を false に設定し、`error` を更新                         |
| `clearResult`      | なし                    | `generatedResult`, `handoffGuidance`, `error` をリセット                 |

---

## 7. Security 契約

### 7-1. sender 検証

- 全 IPC チャンネルで `validateIpcSender(event, { getAllowedWindows: () => [mainWindow] })` を適用する。
- mainWindow 以外からの呼び出しは `PERMISSION_DENIED` エラーを返す。
- 検証コード例（既存パターン準拠）:

```typescript
ipcMain.handle(CHAT_EDIT_CHANNELS.SEND_WITH_CONTEXT, async (event, args) => {
  validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });
  // ... 処理
});
```

### 7-2. workspacePath 制約

| チャンネル                    | 適用状況                                                    |
| ----------------------------- | ----------------------------------------------------------- |
| `chat-edit:read-file`         | 既実装（維持）                                              |
| `chat-edit:write-file`        | 既実装（維持）                                              |
| `chat-edit:get-selection`     | 不要（廃止予定）                                            |
| `chat-edit:detect-language`   | 不要（ファイル書き込みなし）                                |
| `chat-edit:send-with-context` | 追加実装（contexts[].filePath を workspacePath 基準で検証） |
| `chat-edit:stream-output`     | 不要（resultId のみ）                                       |

### 7-3. secret masking

- API キー文字列をエラーメッセージ・ログに含めない。
- `ACCESS_NOT_CONFIGURED` エラーのメッセージ例:
  - 良い例: `"API key is not configured for integrated mode"`
  - 悪い例: `"API key sk-xxx is invalid"` （キー値を含めてはならない）
- `HandoffGuidance.terminalCommand` にも API キー値を埋め込まない。

### 7-4. path traversal 防止

- `".."` および `"//"` を含むパスは全チャンネルで拒否する（既実装ルールを継承）。
- `chat-edit:send-with-context` 追加時に `contexts[].filePath` に対して同検証を適用する。
- 検証エラー時は `PERMISSION_DENIED` コードで即時返却し、詳細な内部パスをエラーメッセージに含めない。

---

## 8. 変更影響範囲サマリー

| ファイル                       | 変更種別 | 変更内容                                                                                                                                     |
| ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `chatEditHandlers.ts`          | 修正     | `send-with-context` に RuntimeResolver 呼び出しと workspacePath 検証を追加                                                                   |
| `workspace-chat-edit/types.ts` | 修正     | `SendWithContextRequest` に `workspacePath?` 追加。`SendWithContextResponse` に `handoff?`, `guidance?` 追加。`HandoffGuidance` 型を新規追加 |
| `chatEditSlice.ts`             | 修正     | `handoffGuidance: HandoffGuidance \| null` フィールドと関連アクションを追加                                                                  |
| `RuntimeResolver.ts`           | 新規     | `RuntimeResolver` インターフェースと実装クラスを新規作成                                                                                     |
| `CHAT_EDIT_CHANNELS`           | 修正     | `GET_SELECTION` を廃止予定マーク（`@deprecated`）に変更                                                                                      |
