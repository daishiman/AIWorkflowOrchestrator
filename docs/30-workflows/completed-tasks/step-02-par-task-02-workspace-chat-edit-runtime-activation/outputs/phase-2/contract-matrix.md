# Phase 2 契約マトリクス - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| Phase      | 2                                           |
| 成果物種別 | 契約マトリクス                              |
| 作成日     | 2026-03-14                                  |
| 前提       | design-summary.md                           |
| 後続       | Phase 3（設計レビュー）                     |

---

## 1. IPC 契約テーブル

### 1-A. chat-edit:get-selection

| 項目         | 内容                                                                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| チャンネル名 | `chat-edit:get-selection`                                                                                                                                                         |
| 方向         | Renderer → Main                                                                                                                                                                   |
| 引数型       | なし                                                                                                                                                                              |
| 戻り値型     | `TextSelection \| null`                                                                                                                                                           |
| エラー型     | なし（null 返却で「未選択」を表現）                                                                                                                                               |
| 状態         | 非推奨化予定（Phase 5 で削除対象）                                                                                                                                                |
| 変更方針     | selection の authority は Renderer にあるため、Main が返すべき情報を持たない。IPC 呼び出し自体を廃止し、`SendWithContextRequest.selection` に Renderer から設定する設計へ移行する |

**TextSelection 型定義**:

| フィールド     | 型       | 説明                    |
| -------------- | -------- | ----------------------- |
| `startLine`    | `number` | 選択開始行（1-indexed） |
| `endLine`      | `number` | 選択終了行（1-indexed） |
| `selectedText` | `string` | 選択されたテキスト内容  |

### 1-B. chat-edit:send-with-context

| 項目         | 内容                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| チャンネル名 | `chat-edit:send-with-context`                                                                        |
| 方向         | Renderer → Main                                                                                      |
| 引数型       | `SendWithContextRequest`（下表参照）                                                                 |
| 戻り値型     | `SendWithContextResponse`（下表参照）                                                                |
| エラー型     | `SendWithContextError`（下表参照）                                                                   |
| sender 検証  | `validateIpcSender(event, 'chat-edit:send-with-context', { getAllowedWindows: () => [mainWindow] })` |

**SendWithContextRequest 型定義**（変更後）:

| フィールド  | 型                      | 必須 | 説明                                                 |
| ----------- | ----------------------- | ---- | ---------------------------------------------------- |
| `contexts`  | `FileContextInput[]`    | 必須 | 添付ファイルコンテキスト一覧（最大 10 件）           |
| `command`   | `EditCommand`           | 必須 | 編集コマンド（type / targetContextId / instruction） |
| `message`   | `string \| undefined`   | 任意 | ユーザー入力テキスト                                 |
| `selection` | `TextSelection \| null` | 任意 | Monaco Editor の選択範囲（新規追加フィールド）       |
| `options`   | `object \| undefined`   | 任意 | 実行オプション（providerId / modelId 上書き指定用）  |

**FileContextInput 型定義**:

| フィールド  | 型                      | 必須 | 説明                        |
| ----------- | ----------------------- | ---- | --------------------------- |
| `filePath`  | `string`                | 必須 | ファイルの絶対パス          |
| `content`   | `string`                | 必須 | ファイルの内容              |
| `language`  | `string`                | 必須 | 言語 ID（例: "typescript"） |
| `selection` | `TextSelection \| null` | 任意 | このファイル内の選択範囲    |

**EditCommand 型定義**:

| フィールド        | 型                    | 必須 | 説明                                                                 |
| ----------------- | --------------------- | ---- | -------------------------------------------------------------------- |
| `type`            | `EditCommandType`     | 必須 | `continue` / `refactor` / `generate-test` / `add-comment` / `custom` |
| `targetContextId` | `string`              | 必須 | 対象コンテキストの filePath                                          |
| `instruction`     | `string \| undefined` | 任意 | `custom` タイプ時の追加指示                                          |

**SendWithContextResponse 型定義**（成功時）:

| フィールド | 型                | 値     | 説明               |
| ---------- | ----------------- | ------ | ------------------ |
| `success`  | `true`            | `true` | 実行成功を示す     |
| `result`   | `GeneratedResult` | -      | LLM が生成した結果 |

**GeneratedResult 型定義**:

| フィールド         | 型                      | 説明                                |
| ------------------ | ----------------------- | ----------------------------------- |
| `id`               | `string`                | 結果の一意 ID（UUID）               |
| `contextId`        | `string`                | 対象コンテキストの filePath         |
| `originalContent`  | `string`                | 変更前の元コンテンツ                |
| `generatedContent` | `string`                | LLM が生成したコンテンツ            |
| `diffHunks`        | `DiffHunk[]`            | 差分ハンク一覧                      |
| `status`           | `GeneratedResultStatus` | `pending` / `approved` / `rejected` |
| `createdAt`        | `Date`                  | 生成日時                            |
| `targetFilePath`   | `string`                | 書き込み対象のファイルパス          |
| `command`          | `EditCommand`           | 実行されたコマンド                  |

**SendWithContextError 型定義**（エラー時）:

| フィールド | 型              | 値      | 説明           |
| ---------- | --------------- | ------- | -------------- |
| `success`  | `false`         | `false` | 実行失敗を示す |
| `error`    | `ChatEditError` | -       | エラー詳細     |

**ChatEditError 型定義**:

| フィールド   | 型                            | 必須 | 説明                                          |
| ------------ | ----------------------------- | ---- | --------------------------------------------- |
| `code`       | `ChatEditErrorCode`           | 必須 | エラーコード（下表参照）                      |
| `message`    | `string`                      | 必須 | エラーメッセージ（ユーザー向け）              |
| `retryable`  | `boolean`                     | 必須 | リトライ可能かどうか                          |
| `reason`     | `string \| undefined`         | 任意 | 詳細理由（fail-fast 時に設定）                |
| `guidance`   | `string \| undefined`         | 任意 | 次にユーザーが取るべき操作の説明              |
| `retryAfter` | `number \| undefined`         | 任意 | リトライ可能になるまでの秒数（rate limit 時） |
| `handoff`    | `HandoffContext \| undefined` | 任意 | terminal handoff 情報（terminalSurface 時）   |

**ChatEditErrorCode 一覧**:

| コード                    | retryable | 説明                                                   |
| ------------------------- | --------- | ------------------------------------------------------ |
| `CONTEXT_TOO_LARGE`       | `false`   | コンテキストサイズが 100KB を超過                      |
| `INVALID_COMMAND`         | `false`   | 無効なコマンドタイプ                                   |
| `CAPABILITY_UNAVAILABLE`  | `false`   | `integratedRuntime` capability なし（fail-fast）       |
| `CREDENTIAL_MISSING`      | `false`   | API key 未設定（fail-fast）                            |
| `PROVIDER_UNKNOWN`        | `false`   | provider 解決不能（fail-fast）                         |
| `ADAPTER_CREATION_FAILED` | `false`   | adapter 生成失敗                                       |
| `LLM_ERROR`               | `true`    | LLM API 呼び出しエラー                                 |
| `TIMEOUT`                 | `true`    | タイムアウト（30,000 ms）                              |
| `RATE_LIMIT`              | `true`    | レート制限超過（retry 上限 3 回到達で `false` に変更） |
| `PERMISSION_DENIED`       | `false`   | ファイルアクセス権限なし / workspacePath 外アクセス    |

**HandoffContext 型定義**:

| フィールド         | 型               | 説明                                                           |
| ------------------ | ---------------- | -------------------------------------------------------------- |
| `contextSummary`   | `string`         | 「N ファイル、合計 X KB」形式のサマリーテキスト                |
| `suggestedCommand` | `string`         | `claude --context "<file1>:<lang>:<lines>"` 形式の提案コマンド |
| `fileList`         | `string[]`       | handoff に含まれるファイルパスの一覧                           |
| `selectionInfo`    | `string \| null` | 選択範囲がある場合の説明テキスト（例: "src/App.tsx L10-25"）   |

### 1-C. chat-edit:read-file

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| チャンネル名 | `chat-edit:read-file`                                                                |
| 方向         | Renderer → Main                                                                      |
| 引数型       | `(filePath: string, workspacePath?: string \| null)`                                 |
| 戻り値型     | `FileReadResult`                                                                     |
| 変更         | 変更なし（既に正常動作）                                                             |
| セキュリティ | `isWithinWorkspace()` による workspacePath 検証、`hasPathTraversal()` による即時拒否 |

### 1-D. chat-edit:write-file

| 項目         | 内容                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| チャンネル名 | `chat-edit:write-file`                                                                            |
| 方向         | Renderer → Main                                                                                   |
| 引数型       | `(filePath: string, content: string, workspacePath?: string \| null, options?: FileWriteOptions)` |
| 戻り値型     | `FileWriteResult`                                                                                 |
| 変更         | 変更なし（既に正常動作）                                                                          |
| セキュリティ | `isWithinWorkspace()` による workspacePath 検証、`hasPathTraversal()` による即時拒否              |

---

## 2. State 契約テーブル

### 2-A. chatEditSlice の状態フィールド

| フィールド名         | 型                           | 初期値  | 責務                                                                          | 変更     |
| -------------------- | ---------------------------- | ------- | ----------------------------------------------------------------------------- | -------- |
| `fileContexts`       | `FileContext[]`              | `[]`    | 添付されたファイルコンテキスト一覧を保持する                                  | 変更なし |
| `activeContextId`    | `string \| null`             | `null`  | アクティブなコンテキストの ID を保持する                                      | 変更なし |
| `currentSelection`   | `TextSelection \| null`      | `null`  | Monaco Editor の現在の選択範囲を保持する（Renderer が authority）             | 新規追加 |
| `generatedResults`   | `GeneratedResult[]`          | `[]`    | LLM が生成した結果の一覧を保持する                                            | 変更なし |
| `currentResultId`    | `string \| null`             | `null`  | 現在 diff preview で表示している結果 ID を保持する                            | 変更なし |
| `isLoading`          | `boolean`                    | `false` | LLM 実行中フラグ（`true` の間は CTA を無効化する）                            | 変更なし |
| `isDiffPreviewOpen`  | `boolean`                    | `false` | diff preview が表示中かどうかのフラグ                                         | 変更なし |
| `error`              | `string \| null`             | `null`  | 直近のエラーコードを保持する（表示用、詳細は別途管理）                        | 変更なし |
| `isDragging`         | `boolean`                    | `false` | ファイルドラッグ中フラグ                                                      | 変更なし |
| `chatEditCapability` | `AIAccessCapability \| null` | `null`  | Main Process から受信した現在の capability 値を保持する                       | 新規追加 |
| `handoffContext`     | `HandoffContext \| null`     | `null`  | terminal handoff 時のコンテキスト情報（suggestedCommand / contextSummary 等） | 新規追加 |

### 2-B. chatEditSlice のアクション一覧

| アクション名        | 引数型                                   | 返却型                             | 変更内容                                                                 |
| ------------------- | ---------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `addFileContext`    | `FileContextData`                        | `void`                             | 変更なし                                                                 |
| `removeFileContext` | `contextId: string`                      | `void`                             | 変更なし                                                                 |
| `clearAllContexts`  | なし                                     | `void`                             | 変更なし                                                                 |
| `setActiveContext`  | `contextId: string \| null`              | `void`                             | 変更なし                                                                 |
| `setSelection`      | `selection: TextSelection \| null`       | `void`                             | 新規追加（Monaco から selection を受け取り保持する）                     |
| `setCapability`     | `capability: AIAccessCapability \| null` | `void`                             | 新規追加（`ai:capability-changed` イベント受信時に更新する）             |
| `setHandoffContext` | `context: HandoffContext \| null`        | `void`                             | 新規追加（handoff CTA 表示に必要な情報を設定する）                       |
| `sendWithContext`   | `request: SendWithContextRequest`        | `Promise<SendWithContextResponse>` | 変更：IPC 呼び出し後に handoffContext / capability エラーを処理する      |
| `approveResult`     | `resultId: string`                       | `Promise<ApproveResultSummary>`    | 変更：`writeFile` 直接呼び出しを除去。承認意図の記録のみに責務を限定する |
| `rejectResult`      | `resultId: string`                       | `void`                             | 変更なし                                                                 |
| `clearResults`      | なし                                     | `void`                             | 変更なし                                                                 |

### 2-C. handoff 境界（window 直接参照の排除方針）

| 項目                      | 現状                                               | 変更後                                                                  |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| `approveResult` 内の IPC  | `window as unknown as {...}` で chatEditAPI を参照 | アクションから `writeFile` 呼び出しを除去する                           |
| `writeFile` の呼び出し元  | `chatEditSlice.approveResult`（Zustand action）    | `useChatEdit` フック（コンポーネント層）                                |
| `window.chatEditAPI` の型 | 型なし（`window as unknown as {...}` でキャスト）  | `global.d.ts` で `interface Window { chatEditAPI: ChatEditAPI }` を定義 |
| 呼び出し順序              | slice 内で IPC → 状態更新                          | フック内で IPC → 成功後に `approveResult` を dispatch                   |

---

## 3. Runtime 契約テーブル

### 3-A. integratedRuntime 実行経路

| ステップ | コンポーネント                    | 処理内容                                                                    | fail-fast 条件                              |
| -------- | --------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------- |
| 1        | `AIAccessCapabilityResolver`      | `chat-edit` surface の capability を判定する                                | `none` または `terminalSurface` のみ → 中断 |
| 2        | `AIRuntimeResolver`               | providerId / modelId / adapter を解決する                                   | 解決不能 → 中断                             |
| 3        | `CredentialProvider`              | SecureStorage から API key を取得する                                       | key 不在 → 中断                             |
| 4        | `LLMAdapterFactory`               | provider + credential から adapter インスタンスを生成する（キャッシュ活用） | 生成失敗 → 中断                             |
| 5        | `ContextBuilder`                  | `request.contexts` と `request.selection` からコンテキスト文字列を構築する  | サイズ超過 → 中断                           |
| 6        | `ChatEditService.sendWithContext` | プロンプト生成 → LLM adapter 呼び出し → `GeneratedResult` を返す            | LLM エラー / timeout → retryable エラー     |

**adapter キャッシュポリシー**:

| invalidation トリガー  | 対象                     | 理由                             |
| ---------------------- | ------------------------ | -------------------------------- |
| API key 追加/削除/変更 | 全 provider の adapter   | stale credential での実行を防止  |
| capability 変更        | 全 adapter + capability  | stale runtime 状態での実行を防止 |
| selectedConfig 変更    | 対象 provider の adapter | provider / model 不一致を防止    |

### 3-B. terminalSurface handoff 経路

| ステップ | コンポーネント               | 処理内容                                                                  |
| -------- | ---------------------------- | ------------------------------------------------------------------------- |
| 1        | `AIAccessCapabilityResolver` | capability = `terminalSurface` または `none` と判定する                   |
| 2        | `ContextSummaryBuilder`      | `request.contexts` から handoff 用サマリーを生成する（N ファイル / X KB） |
| 3        | `handleSendWithContext`      | `CAPABILITY_UNAVAILABLE` エラー + `handoff` フィールドを返す              |
| 4        | Renderer（chatEditSlice）    | `setHandoffContext` を呼び出し handoff CTA を表示する                     |
| 5        | ユーザー操作                 | handoff CTA をクリック → suggestedCommand をコピーまたは terminal を開く  |

**handoff 境界ルール**:

| ルール                | 内容                                                               |
| --------------------- | ------------------------------------------------------------------ |
| auto-send 禁止        | `suggestedCommand` は UI に表示するのみ。terminal に自動送信しない |
| hidden injection 禁止 | terminal に暗黙のプロンプトを注入しない                            |
| silent fallback 禁止  | integrated runtime 失敗後に自動で terminal へ切り替えない          |
| user-operated 境界    | handoff 後の実行はすべてユーザー操作によって行われる               |

### 3-C. fallback 判定基準

| 判定フロー                                          | 結果                                                   |
| --------------------------------------------------- | ------------------------------------------------------ |
| capability = `integratedRuntime` または `both`      | integratedRuntime 経路を実行する                       |
| capability = `terminalSurface` のみ                 | handoff 経路を実行する                                 |
| capability = `none`                                 | `CAPABILITY_UNAVAILABLE` エラーを返す（guidance 付き） |
| integratedRuntime 経路 中に credential 不在         | `CREDENTIAL_MISSING` エラーを返す（fail-fast）         |
| integratedRuntime 経路 中に LLM エラー（retryable） | `LLM_ERROR` エラーを返す（retryable: true、最大 3 回） |
| retryable エラーが 3 回超過                         | retryable: false に変更して guidance を返す            |

---

## 4. Security 契約テーブル

### 4-A. sender validation 方針

| ハンドラー              | 検証方法                                                       | 検証失敗時の動作                 |
| ----------------------- | -------------------------------------------------------------- | -------------------------------- |
| `handleReadFile`        | `validateIpcSender(event, 'chat-edit:read-file', ...)`         | `PERMISSION_DENIED` エラーを返す |
| `handleWriteFile`       | `validateIpcSender(event, 'chat-edit:write-file', ...)`        | `PERMISSION_DENIED` エラーを返す |
| `handleGetSelection`    | `validateIpcSender(event, 'chat-edit:get-selection', ...)`     | null を返す（エラー扱いしない）  |
| `handleSendWithContext` | `validateIpcSender(event, 'chat-edit:send-with-context', ...)` | `PERMISSION_DENIED` エラーを返す |
| `handleDetectLanguage`  | `validateIpcSender(event, 'chat-edit:detect-language', ...)`   | `PERMISSION_DENIED` エラーを返す |

**validateIpcSender の設定**:

- `getAllowedWindows: () => [mainWindow]`（mainWindow のみ許可）
- 検証失敗時は `toIPCValidationError` でエラーをスローする（P04-electron-security 準拠）

### 4-B. path traversal guard

| 検証対象            | 検証方法                                     | 拒否条件                               | エラーコード        |
| ------------------- | -------------------------------------------- | -------------------------------------- | ------------------- |
| `filePath`（read）  | `hasPathTraversal(filePath)`                 | `..` または `//` を含む                | `PERMISSION_DENIED` |
| `filePath`（write） | `hasPathTraversal(filePath)`                 | `..` または `//` を含む                | `PERMISSION_DENIED` |
| `filePath`（read）  | `path.isAbsolute(filePath)`                  | 絶対パスでない                         | `PERMISSION_DENIED` |
| `filePath`（write） | `path.isAbsolute(filePath)`                  | 絶対パスでない                         | `PERMISSION_DENIED` |
| workspacePath 境界  | `isWithinWorkspace(filePath, workspacePath)` | workspacePath 外のファイルへのアクセス | `PERMISSION_DENIED` |

**workspacePath の独立性**:

- workspacePath 検証は `AIAccessCapabilityResolver` の結果に依存しない
- capability が `none` であっても、read / write の基本的なパス検証は常に実行する
- `workspacePath` 未指定・null・空文字の場合はスキップ（後方互換性維持）

### 4-C. secret masking

| 対象情報                     | masking 方針                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| API key / credential         | Main Process 内に留め、Renderer に送信しない                                        |
| credential が含まれるエラー  | エラーメッセージから credential を除去してから Renderer に返す                      |
| ファイルパス（システム内部） | `CREDENTIAL_MISSING` / `ADAPTER_CREATION_FAILED` 等のエラーにファイルパスを含めない |
| スタックトレース             | Renderer へのエラーレスポンスにスタックトレースを含めない                           |

**error sanitization の実装方針**:

1. `error.message` に absolute path、home directory、API key を含む場合はマスクする（P55 対策）
2. `RegExp` を使ったパスマスク時は `escapeRegExp()` でメタ文字をエスケープする（P55 対策）
3. Renderer へは `{ code, message, retryable, reason, guidance }` のみを返す

### 4-D. workspacePath 制約

| 制約項目                     | 内容                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------- |
| 適用対象                     | `chat-edit:read-file` / `chat-edit:write-file`                                |
| 適用タイミング               | パストラバーサル検出後（トラバーサルが先、workspace チェックが後）            |
| workspacePath 未指定時の動作 | 検証スキップ（`null` / `undefined` / 空文字 の場合）                          |
| workspacePath 指定時の動作   | `path.resolve(workspacePath)` で正規化後に `isWithinWorkspace` で検証する     |
| capability との依存関係      | workspacePath 制約は capability 判定とは完全に独立している                    |
| sender 検証との関係          | sender 検証が先。sender 検証失敗時は workspacePath 検証に到達しない           |
| AI 実行（LLM）との関係       | `chat-edit:send-with-context` は LLM 実行の IPC。workspacePath 引数を持たない |

---

## 5. 変更影響サマリー

| ファイル                                                                        | 変更種別       | 変更内容                                                                                                                               |
| ------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                                            | 変更           | L836-842 の stubLLMAdapter を除去し、AIRuntimeResolver / AIAccessCapabilityResolver を DI する                                         |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`                            | 変更           | `handleSendWithContext` に capability チェックと runtime 解決ロジックを追加する                                                        |
| `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts` | 変更           | `currentSelection` / `chatEditCapability` / `handoffContext` フィールドを追加する。`approveResult` から `writeFile` 呼び出しを除去する |
| `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useChatEdit.ts`   | 変更または新規 | `writeFile` の呼び出しをフック層に移動する                                                                                             |
| `apps/desktop/src/preload/chatEditApi.ts`                                       | 変更           | `onCapabilityChanged` メソッドを追加する（`ai:capability-changed` イベントの購読）                                                     |
| `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`                   | 変更           | `LLMAdapter` の constructor DI を除去し、`sendWithContext` の引数に adapter を受け取る設計に変更する                                   |
| グローバル型定義（`window.d.ts` 等）                                            | 変更           | `interface Window { chatEditAPI: ChatEditAPI }` を追加する                                                                             |
