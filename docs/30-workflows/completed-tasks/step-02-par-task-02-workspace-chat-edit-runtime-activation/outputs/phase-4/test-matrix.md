# Phase 4 テストマトリクス - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| Phase      | 4                                           |
| 成果物種別 | テストマトリクス                            |
| 作成日     | 2026-03-14                                  |
| 前提       | Phase 3 設計レビューレポート（判定: MINOR） |
| 後続       | Phase 5（実装）                             |

---

## テスト観点1: selection 取得テスト

### TC-04-01: selection 成功（Monaco で範囲選択あり）

| 項目               | 内容                                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-01                                                                                                                                                                                     |
| テスト分類         | unit                                                                                                                                                                                         |
| 対象コンポーネント | `chatEditHandlers.ts` の `handleSendWithContext`（request.selection 付きリクエスト処理）、`ContextBuilder.build()`（selection フィールドの反映）                                             |
| 前提条件           | `request.selection` に `{ startLine: 10, endLine: 20, selectedText: "const foo = 1;" }` が設定されている。`capabilityResolver` が `integratedRuntime` を返す。LLM adapter が成功を返す。     |
| 入力               | `SendWithContextRequest` の `selection` フィールドに有効な `TextSelection` オブジェクトを設定。`contexts[0].selection` も同じ TextSelection を設定する。                                     |
| 期待結果           | `ContextBuilder.buildFileSection()` がセクション文字列に `選択範囲: L10-L20` を含む。LLM へのプロンプトが `selectedText` の内容を優先的に使用している。レスポンスが `success: true` となる。 |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                         |
| 優先度             | P1                                                                                                                                                                                           |

---

### TC-04-02: selection 空（範囲選択なし）→ `INVALID_SELECTION` エラーコードが返る

| 項目               | 内容                                                                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-02                                                                                                                                                                                                                               |
| テスト分類         | unit                                                                                                                                                                                                                                   |
| 対象コンポーネント | `chatEditHandlers.ts` の `handleSendWithContext`（selection null チェックロジック）                                                                                                                                                    |
| 前提条件           | `request.selection` が `null` である。コマンドタイプが selection 必須の `refactor` または `generate-test` である。`capabilityResolver` が `integratedRuntime` を返す。                                                                 |
| 入力               | `SendWithContextRequest` の `selection: null`、`command.type: "refactor"`                                                                                                                                                              |
| 期待結果           | レスポンスが `{ success: false, error: { code: "INVALID_SELECTION", message: "...", retryable: false } }` を返す。LLM adapter は呼び出されない。                                                                                       |
| Phase 3 MINOR 対応 | **MINOR-01**: `INVALID_SELECTION` エラーコードを `ChatEditErrorCode` に追加し、selection が null のまま送信された場合にハンドラー側でエラーを返す設計。selection 必須コマンド（`refactor` / `generate-test` 等）を特定してテストする。 |
| 優先度             | P1                                                                                                                                                                                                                                     |

---

### TC-04-03: selection 取得中に Renderer が不正リクエスト → sender validation エラー

| 項目               | 内容                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-03                                                                                                                                                                |
| テスト分類         | unit                                                                                                                                                                    |
| 対象コンポーネント | `chatEditHandlers.ts` の `handleGetSelection`（sender validation ロジック）                                                                                             |
| 前提条件           | `validateIpcSender` がモック化され、不正な sender（`mainWindow` でないウィンドウ）からのリクエストに対して検証エラーをスローするよう設定されている。                    |
| 入力               | `handleGetSelection` を不正な sender（allowedWindows に含まれないウィンドウ）から呼び出す。                                                                             |
| 期待結果           | `validateIpcSender` が検証エラーをスローする。`handleGetSelection` が `null` を返す（設計方針: get-selection の sender 検証失敗はエラー扱いしない）。                   |
| Phase 3 MINOR 対応 | **MINOR-05**: 現行 `chatEditHandlers.ts` に sender validation が未実装。Phase 5 実装で追加される sender validation をテストで先行定義することで、TDD 原則で漏れを防ぐ。 |
| 優先度             | P2                                                                                                                                                                      |

---

## テスト観点2: send-with-context テスト（integrated runtime 経路）

### TC-04-10: integratedRuntime 有効・selection あり → suggestion text が正常に返る

| 項目               | 内容                                                                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID           | TC-04-10                                                                                                                                                                                                                                                                                                                                               |
| テスト分類         | integration                                                                                                                                                                                                                                                                                                                                            |
| 対象コンポーネント | `handleSendWithContext`（capability チェック → runtime 解決 → LLM 実行の全経路）、`ChatEditService.sendWithContext()`、`ContextBuilder.build()`                                                                                                                                                                                                        |
| 前提条件           | `capabilityResolver.resolve('chat-edit')` が `integratedRuntime` を返すようモック設定。`runtimeResolver` が有効な adapter を返すようモック設定。LLM adapter の `sendMessage` が成功レスポンス（`{ success: true, data: { message: "```typescript\nconst bar = 2;\n```" } }`）を返すようモック設定。`request.selection` に有効な TextSelection を設定。 |
| 入力               | `SendWithContextRequest` の `contexts[0]` にファイルコンテキスト、`selection` に `{ startLine: 5, endLine: 10, selectedText: "const foo = 1;" }`、`command.type: "refactor"`                                                                                                                                                                           |
| 期待結果           | レスポンスが `{ success: true, result: { generatedContent: "const bar = 2;", status: "pending", ... } }` を返す。LLM adapter が 1 回呼び出されている。`capabilityResolver.resolve` が `"chat-edit"` surface で 1 回呼び出されている。                                                                                                                  |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                                                                                                                                                                                   |
| 優先度             | P1                                                                                                                                                                                                                                                                                                                                                     |

---

### TC-04-11: integratedRuntime 有効・selection なし → INVALID_SELECTION エラー

| 項目               | 内容                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID           | TC-04-11                                                                                                                                         |
| テスト分類         | unit                                                                                                                                             |
| 対象コンポーネント | `handleSendWithContext`（selection null 時のフェイルファスト処理）                                                                               |
| 前提条件           | `capabilityResolver` が `integratedRuntime` を返す。`request.selection` が `null`。コマンドタイプが `refactor`（selection 必須）。               |
| 入力               | `SendWithContextRequest` の `selection: null`、`command.type: "refactor"`                                                                        |
| 期待結果           | `{ success: false, error: { code: "INVALID_SELECTION", retryable: false } }` を返す。LLM adapter は呼び出されない。                              |
| Phase 3 MINOR 対応 | **MINOR-01**: TC-04-02 と対になるテストケース。integratedRuntime が有効であっても selection が null の場合はフェイルファストすることを検証する。 |
| 優先度             | P1                                                                                                                                               |

---

### TC-04-12: integratedRuntime 有効・LLM timeout（30秒超過）→ LLM_TIMEOUT エラー + terminal handoff guidance

| 項目               | 内容                                                                                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-12                                                                                                                                                                                                                            |
| テスト分類         | unit                                                                                                                                                                                                                                |
| 対象コンポーネント | `handleSendWithContext`（LLM 呼び出しのタイムアウト制御ロジック）                                                                                                                                                                   |
| 前提条件           | `capabilityResolver` が `integratedRuntime` を返す。LLM adapter の `sendMessage` が 30,001ms 後にレスポンスを返す（タイムアウト超過）。Vitest の fake timers を使用。                                                               |
| 入力               | 正常な `SendWithContextRequest`（selection あり、contexts あり）                                                                                                                                                                    |
| 期待結果           | `Promise.race` によるタイムアウト検出後、`{ success: false, error: { code: "TIMEOUT", message: "...", retryable: true } }` を返す。`guidance` フィールドに terminal handoff の導線（terminal で実行する方法の案内）が含まれている。 |
| テスト実装上の注意 | P13 対策: `runAllTimers` ではなく `vi.advanceTimersByTime(30001)` を使用して 1 ステップずつ進める。                                                                                                                                 |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                                                                |
| 優先度             | P2                                                                                                                                                                                                                                  |

---

### TC-04-13: integratedRuntime 有効・rate limit → RATE_LIMITED エラー + retry ガイダンス

| 項目               | 内容                                                                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-13                                                                                                                                                                                                             |
| テスト分類         | unit                                                                                                                                                                                                                 |
| 対象コンポーネント | `handleSendWithContext`（rate limit エラー処理とリトライロジック）、`ChatEditService.sendWithContext()`                                                                                                              |
| 前提条件           | `capabilityResolver` が `integratedRuntime` を返す。LLM adapter が `{ success: false, error: { message: "rate limit exceeded", retryAfter: 60 } }` を返す。                                                          |
| 入力               | 正常な `SendWithContextRequest`（selection あり）                                                                                                                                                                    |
| 期待結果           | `{ success: false, error: { code: "RATE_LIMIT", retryable: true, retryAfter: 60, guidance: "..." } }` を返す。リトライ上限（3 回）到達前は `retryable: true`、到達後は `retryable: false` に変化することを確認する。 |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                                                 |
| 優先度             | P2                                                                                                                                                                                                                   |

---

### TC-04-14: integratedRuntime 有効・large context（8000トークン超）→ CONTEXT_TOO_LARGE エラー

| 項目               | 内容                                                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-14                                                                                                                                                                                                                                                |
| テスト分類         | unit                                                                                                                                                                                                                                                    |
| 対象コンポーネント | `handleSendWithContext`（コンテキストサイズ検証ロジック）、`ContextBuilder.validateSize()`                                                                                                                                                              |
| 前提条件           | `capabilityResolver` が `integratedRuntime` を返す。`request.contexts` の合計サイズが 100KB（`MAX_CONTEXT_SIZE`）を超えるよう設定（例: 101KB のコンテンツを持つコンテキストを 1 件）。                                                                  |
| 入力               | `SendWithContextRequest` の `contexts[0].content` に 101KB 以上のテキストを設定（`"a".repeat(103 * 1024)` 相当）                                                                                                                                        |
| 期待結果           | `{ success: false, error: { code: "CONTEXT_TOO_LARGE", message: "Context size (...KB) exceeds 100KB limit", retryable: false } }` を返す。LLM adapter は呼び出されない。`capabilityResolver` は呼び出される（サイズチェックより先か後かは実装に依存）。 |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                                                                                    |
| 優先度             | P1                                                                                                                                                                                                                                                      |

---

## テスト観点3: send-with-context テスト（terminal handoff 経路）

### TC-04-20: APIキー未設定 → MISSING_API_KEY + terminal handoff guidance が返る

| 項目               | 内容                                                                                                                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-20                                                                                                                                                                                                                                                                    |
| テスト分類         | unit                                                                                                                                                                                                                                                                        |
| 対象コンポーネント | `handleSendWithContext`（`CredentialProvider` 失敗時のフェイルファスト処理）                                                                                                                                                                                                |
| 前提条件           | `capabilityResolver` が `integratedRuntime` を返す（API key があれば使えるはずの状態）。`runtimeResolver` または `CredentialProvider` が `{ success: false }` または例外をスローするようモック設定。                                                                        |
| 入力               | 正常な `SendWithContextRequest`（selection あり）                                                                                                                                                                                                                           |
| 期待結果           | `{ success: false, error: { code: "CREDENTIAL_MISSING", retryable: false, reason: "...", guidance: "Settings > API Key で [providerName] のキーを設定してください", handoff: { contextSummary: "...", suggestedCommand: "..." } } }` を返す。LLM adapter は呼び出されない。 |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                                                                                                        |
| 優先度             | P1                                                                                                                                                                                                                                                                          |

---

### TC-04-21: permission denied（ユーザー拒否）→ PERMISSION_DENIED + handoff guidance が返る

| 項目               | 内容                                                                                                                                                                                                                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-21                                                                                                                                                                                                                                                                                                                   |
| テスト分類         | unit                                                                                                                                                                                                                                                                                                                       |
| 対象コンポーネント | `handleSendWithContext`（`CAPABILITY_UNAVAILABLE` / `terminalSurface` 時の handoff 処理）                                                                                                                                                                                                                                  |
| 前提条件           | `capabilityResolver.resolve('chat-edit')` が `terminalSurface`（API key 不在 + terminal 可用状態）を返す。                                                                                                                                                                                                                 |
| 入力               | 正常な `SendWithContextRequest`（contexts あり、selection あり）                                                                                                                                                                                                                                                           |
| 期待結果           | `{ success: false, error: { code: "CAPABILITY_UNAVAILABLE", retryable: false, reason: "integrated_runtime_unavailable", guidance: "...", handoff: { contextSummary: "1 ファイル、合計 X KB", suggestedCommand: "claude --context ...", fileList: [...], selectionInfo: "..." } } }` を返す。LLM adapter は呼び出されない。 |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                                                                                                                                                       |
| 優先度             | P1                                                                                                                                                                                                                                                                                                                         |

---

### TC-04-22: integratedRuntime capability=false → terminal handoff が発動する

| 項目               | 内容                                                                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-22                                                                                                                                                                                                                                        |
| テスト分類         | unit                                                                                                                                                                                                                                            |
| 対象コンポーネント | `handleSendWithContext`（capability=none 時のフェイルファスト処理）                                                                                                                                                                             |
| 前提条件           | `capabilityResolver.resolve('chat-edit')` が `none`（API key 不在 + terminal 不可用）を返す。                                                                                                                                                   |
| 入力               | 正常な `SendWithContextRequest`（contexts あり）                                                                                                                                                                                                |
| 期待結果           | `{ success: false, error: { code: "CAPABILITY_UNAVAILABLE", retryable: false, reason: "...", guidance: "..." } }` を返す。`handoff` フィールドが `undefined` またはなし（terminal がないため handoff 情報なし）。LLM adapter は呼び出されない。 |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                                                                            |
| 優先度             | P1                                                                                                                                                                                                                                              |

---

## テスト観点4: security テスト

### TC-04-30: 不正 sender から chat-edit:send-with-context → UNAUTHORIZED エラー

| 項目               | 内容                                                                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-30                                                                                                                                                                                                                |
| テスト分類         | unit                                                                                                                                                                                                                    |
| 対象コンポーネント | `chatEditHandlers.ts` の `handleSendWithContext`（sender validation ガード）                                                                                                                                            |
| 前提条件           | `validateIpcSender` がモック化され、不正 sender に対して `toIPCValidationError` 相当のエラーをスローするよう設定。`mainWindow` 以外のウィンドウからのリクエストを想定。                                                 |
| 入力               | `handleSendWithContext` を不正 sender（allowedWindows に含まれないウィンドウ）から呼び出す。                                                                                                                            |
| 期待結果           | `validateIpcSender` がエラーをスローし、ハンドラーが `{ success: false, error: { code: "UNAUTHORIZED", ... } }` または例外伝播でリクエストを拒否する。LLM adapter は呼び出されない。capability チェックにも到達しない。 |
| テスト実装上の注意 | P48 対策: `mockValidateIpcSender.mock.calls[0][2].getAllowedWindows()` を明示的に呼び出し、callback の関数カバレッジを確保する。                                                                                        |
| Phase 3 MINOR 対応 | **MINOR-05**: sender validation が現行コードに未実装であるため、このテストは Phase 5 実装完了後に PASS する。TDD として先行作成する。                                                                                   |
| 優先度             | P1                                                                                                                                                                                                                      |

---

### TC-04-31: workspacePath に path traversal 試行（`../../../etc/passwd`）→ INVALID_PATH エラー

| 項目                 | 内容                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID             | TC-04-31                                                                                                                                                             |
| テスト分類           | unit                                                                                                                                                                 |
| 対象コンポーネント   | `chatEditHandlers.ts` の `handleReadFile` および `handleWriteFile`（`hasPathTraversal()` ガード）                                                                    |
| 前提条件             | 正常な sender から呼び出す。`filePath` にパストラバーサルを含む文字列を指定。                                                                                        |
| 入力                 | `handleReadFile(event, "/workspace/../../../etc/passwd", "/workspace")` および `handleWriteFile(event, "/workspace/../../../etc/passwd", "content", "/workspace")`   |
| 期待結果             | `{ success: false, error: { code: "PERMISSION_DENIED", message: "Path traversal detected" } }` を返す。`fs.stat` / `fs.readFile` / `fs.writeFile` は呼び出されない。 |
| テストバリエーション | `"../../../etc/passwd"`（相対パス）、`"/workspace//etc/passwd"`（`//` 含む）、`"/workspace/sub/../../../etc/passwd"` の 3 パターンをそれぞれ検証する。               |
| Phase 3 MINOR 対応   | なし                                                                                                                                                                 |
| 優先度               | P1                                                                                                                                                                   |

---

### TC-04-32: response に secret（APIキー）が含まれる場合 → masked に変換されている

| 項目               | 内容                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID           | TC-04-32                                                                                                                                                                                                           |
| テスト分類         | unit                                                                                                                                                                                                               |
| 対象コンポーネント | `handleSendWithContext`（error sanitization ロジック）                                                                                                                                                             |
| 前提条件           | `capabilityResolver` が `integratedRuntime` を返す。LLM adapter がエラーをスローし、その `error.message` に API key（例: `"sk-ant-api03-xxxx"`）またはホームディレクトリパス（例: `/Users/user.name`）が含まれる。 |
| 入力               | LLM adapter が `{ success: false, error: { message: "Authentication failed with key: sk-ant-api03-xxxx" } }` を返す。                                                                                              |
| 期待結果           | Renderer へのレスポンスの `error.message` に `"sk-ant-api03-xxxx"` が含まれない（マスクまたは除去されている）。`{ code, message, retryable, reason, guidance }` のフィールドのみが含まれる。                       |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                                               |
| 優先度             | P1                                                                                                                                                                                                                 |

---

## テスト観点5: IPC 契約テスト（drift 防止）

### TC-04-40: Preload の chatEditApi.ts と Main の chatEditHandlers.ts の引数型が一致する

| 項目               | 内容                                                                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-40                                                                                                                                                                                                                               |
| テスト分類         | unit（型レベルのコンパイル検証）                                                                                                                                                                                                       |
| 対象コンポーネント | `chatEditApi.ts`（Preload 層）と `chatEditHandlers.ts`（Main 層）の IPC 契約整合性                                                                                                                                                     |
| 前提条件           | TypeScript コンパイルが通る状態。                                                                                                                                                                                                      |
| 入力               | `chatEditAPI.readFile(filePath)` が `handleReadFile(event, filePath, workspacePath?)` に対応していることを検証する。`chatEditAPI.sendWithContext(request)` の `request` 型が `SendWithContextRequest` 型と完全一致することを検証する。 |
| 期待結果           | `pnpm typecheck` が PASS する。Preload 側と Main 側で同じ `SendWithContextRequest` / `SendWithContextResponse` / `TextSelection` 型を使用していることをテストコード内でアサーションする（型互換性チェック）。                          |
| テスト実装上の注意 | MINOR-02 対応: `chatEditApi.ts` の `readFile` / `writeFile` が `workspacePath` 引数を渡さない設計であることを「明示的な契約」としてドキュメントコメントまたは型定義に記録することも確認する。                                          |
| Phase 3 MINOR 対応 | **MINOR-02**: Preload の `readFile` / `writeFile` が `workspacePath` を渡さない契約を確認する。                                                                                                                                        |
| 優先度             | P2                                                                                                                                                                                                                                     |

---

### TC-04-41: IPC チャンネル名が定数（IPC_CHANNELS）経由で使われている

| 項目               | 内容                                                                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-41                                                                                                                                                                                                                    |
| テスト分類         | unit（静的解析相当）                                                                                                                                                                                                        |
| 対象コンポーネント | `chatEditApi.ts`（Preload 層 CHANNELS 定数）、`chatEditHandlers.ts`（Main 層 CHAT_EDIT_CHANNELS 定数）                                                                                                                      |
| 前提条件           | コードベースが最新状態。                                                                                                                                                                                                    |
| 入力               | `chatEditApi.ts` の `ipcRenderer.invoke` 呼び出しが文字列リテラルではなく `CHANNELS` 定数を使用していることを確認する。`chatEditHandlers.ts` の `ipcMain.handle` が `CHAT_EDIT_CHANNELS` 定数を使用していることを確認する。 |
| 期待結果           | `grep -rn 'ipcRenderer.invoke.*"chat-edit' apps/desktop/src/preload/chatEditApi.ts` の結果が 0 件（文字列リテラル直接使用がない）。両定数の値が完全一致している（例: `"chat-edit:send-with-context"` が両ファイルで一致）。 |
| Phase 3 MINOR 対応 | P27 対策（ハードコード文字列禁止）                                                                                                                                                                                          |
| 優先度             | P2                                                                                                                                                                                                                          |

---

## テスト観点6: 回帰テスト（既存機能の維持）

### TC-04-50: workspacePath が指定なしの場合 → 従来のデフォルト動作を維持

| 項目                 | 内容                                                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID             | TC-04-50                                                                                                                                                                                                                             |
| テスト分類           | unit                                                                                                                                                                                                                                 |
| 対象コンポーネント   | `chatEditHandlers.ts` の `handleReadFile` および `handleWriteFile`（workspacePath 未指定時のデフォルト動作）、`normalizeWorkspacePath()` 関数                                                                                        |
| 前提条件             | 正常な sender から呼び出す。`workspacePath` が `undefined`、`null`、または空文字 `""` のいずれか。`filePath` が正常な絶対パス（パストラバーサルなし）。ファイルが実際に存在する状態をモックする。                                    |
| 入力                 | `handleReadFile(event, "/valid/absolute/path.ts")` （workspacePath 引数なし）                                                                                                                                                        |
| 期待結果             | `normalizeWorkspacePath(undefined)` が `null` を返す。workspace 境界チェックがスキップされる（`isWithinWorkspace` が呼び出されない）。ファイル読み込みが成功し、`{ success: true, content: "...", language: "typescript" }` を返す。 |
| テストバリエーション | `workspacePath: undefined`、`workspacePath: null`、`workspacePath: ""` の 3 パターンを検証する。                                                                                                                                     |
| Phase 3 MINOR 対応   | なし（後方互換性の確認）                                                                                                                                                                                                             |
| 優先度               | P1                                                                                                                                                                                                                                   |

---

### TC-04-51: ContextBuilder のサイズ制限ロジックが変更後も動作する

| 項目                 | 内容                                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID             | TC-04-51                                                                                                                                                                                     |
| テスト分類           | unit                                                                                                                                                                                         |
| 対象コンポーネント   | `ContextBuilder`（`validateSize()` および `calculateSize()` メソッド）                                                                                                                       |
| 前提条件             | なし（純粋関数のテスト）                                                                                                                                                                     |
| 入力                 | パターン A: 合計 50KB のコンテキスト（上限内）。パターン B: 合計 100KB ちょうどのコンテキスト（境界値）。パターン C: 合計 100KB + 1 byte のコンテキスト（上限超過）。                        |
| 期待結果             | パターン A: `validateSize()` が `true` を返す。パターン B: `validateSize()` が `true` を返す（等号を含む境界値）。パターン C: `validateSize()` が `false` を返す。                           |
| テストバリエーション | `build()` メソッドが selection 優先でコンテキスト文字列を構築していることも同時に確認する。selection あり: `selectedText` が出力に含まれる。selection なし: `content` 全体が出力に含まれる。 |
| Phase 3 MINOR 対応   | なし                                                                                                                                                                                         |
| 優先度               | P1                                                                                                                                                                                           |

---

### TC-04-52: prompts.ts の 5コマンドタイプが全て正常に動作する

| 項目               | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-04-52                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| テスト分類         | unit                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 対象コンポーネント | `prompts.ts`（`isValidCommandType()` および `buildPromptFromTemplate()`）、`ChatEditService.buildPrompt()`                                                                                                                                                                                                                                                                                                                                               |
| 前提条件           | なし（純粋関数のテスト）                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 入力               | 5 コマンドタイプ（`continue` / `refactor` / `generate-test` / `add-comment` / `custom`）それぞれに対して `buildPromptFromTemplate(type, "context text", instruction?)` を呼び出す。                                                                                                                                                                                                                                                                      |
| 期待結果           | `isValidCommandType("continue")` が `true` を返す（全 5 タイプで同様）。`isValidCommandType("unknown")` が `false` を返す。`buildPromptFromTemplate("continue", "ctx")` の結果に `"ctx"` が含まれる。`buildPromptFromTemplate("custom", "ctx", "カスタム指示")` の結果に `"カスタム指示"` が含まれる。`buildPromptFromTemplate("custom", "ctx", undefined)` が `"{instruction}"` を未置換のまま含まないこと（または graceful fallback することを確認）。 |
| Phase 3 MINOR 対応 | なし                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 優先度             | P2                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

---

## テストカバレッジ目標

### カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 根拠                                                   |
| ----------------- | -------- | -------- | ------------------------------------------------------ |
| Line Coverage     | 80%      | **90%**  | Phase 3 設計レビューの推奨に準拠（§ 5-C より引き上げ） |
| Branch Coverage   | 60%      | **70%**  | Phase 3 設計レビューの推奨に準拠（§ 5-C より引き上げ） |
| Function Coverage | 80%      | **90%**  | Phase 3 設計レビューの推奨に準拠（§ 5-C より引き上げ） |

### 重点カバレッジ対象

#### Main Handler 層（`chatEditHandlers.ts`）

| 対象分岐                                  | 対応テスト         | 備考                                                               |
| ----------------------------------------- | ------------------ | ------------------------------------------------------------------ |
| capability 判定の 4 値                    | TC-04-10, 21, 22   | `integratedRuntime` / `terminalSurface` / `both` / `none` 全カバー |
| fail-fast 4 段階                          | TC-04-20, TC-04-10 | capability → credential → provider → adapter の各段階              |
| workspacePath 指定あり / なし / traversal | TC-04-31, TC-04-50 | 3 分岐を完全カバー                                                 |
| selection null チェック                   | TC-04-02, TC-04-11 | MINOR-01 対応                                                      |
| sender validation                         | TC-04-30, TC-04-03 | MINOR-05 対応（TDD 先行実装）                                      |
| コンテキストサイズ超過                    | TC-04-14           | `MAX_CONTEXT_SIZE` 境界値テストを含む                              |
| LLM エラー / タイムアウト / rate limit    | TC-04-12, TC-04-13 | retryable / non-retryable の両方                                   |

#### Service 層（`ChatEditService.ts`）

| 対象分岐                             | 対応テスト         | 備考                                 |
| ------------------------------------ | ------------------ | ------------------------------------ |
| LLM 成功 / 失敗の両パス              | TC-04-10, TC-04-12 | `sendWithContext` の両分岐           |
| コマンドタイプ検証                   | TC-04-52           | `isValidCommandType` の全 5 タイプ   |
| コンテキストサイズ検証               | TC-04-14, TC-04-51 | `validateSize` の境界値テスト        |
| selection 有無によるコンテキスト構築 | TC-04-01, TC-04-51 | `buildFileSection` の selection 分岐 |

#### IPC 契約層（`chatEditApi.ts` と `chatEditHandlers.ts`）

| 対象                             | 対応テスト | 備考                                           |
| -------------------------------- | ---------- | ---------------------------------------------- |
| チャンネル名定数使用             | TC-04-41   | P27 対策（ハードコード文字列禁止）             |
| 引数型の一致                     | TC-04-40   | MINOR-02 / P44 対策                            |
| `getAllowedWindows` コールバック | TC-04-30   | P48 対策（callback の Function Coverage 確保） |

### テスト実装時の留意事項

1. **P39 対策**: happy-dom 環境では `userEvent` を使用せず `fireEvent` を使用する。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む。
2. **P13 対策**: TC-04-12（timeout テスト）では `vi.runAllTimers()` ではなく `vi.advanceTimersByTime(30001)` を使用して 1 ステップずつ進める。
3. **P48 対策**: TC-04-30（sender validation テスト）では `mockValidateIpcSender.mock.calls[0][2].getAllowedWindows()` を明示的に呼び出し、callback の Function Coverage を確保する。
4. **P9 対策**: `capabilityResolver` / `runtimeResolver` / `credentialProvider` / `llmAdapter` の各モックは `beforeEach` でリセットし、テスト間の状態漏洩を防ぐ。
5. **MINOR-01 先行実装（TDD）**: `INVALID_SELECTION` エラーコードのテスト（TC-04-02, TC-04-11）は Phase 5 実装前に作成し、実装完了後に PASS することで TDD サイクルを維持する。
6. **MINOR-05 先行実装（TDD）**: sender validation のテスト（TC-04-30, TC-04-03）は Phase 5 実装前に作成し、実装完了後に PASS することで sender validation の漏れを防ぐ。

---

## テストケース一覧（優先度順サマリー）

| テストID | 優先度 | 分類        | 対象                               | MINOR 対応 |
| -------- | ------ | ----------- | ---------------------------------- | ---------- |
| TC-04-01 | P1     | unit        | selection 成功（選択あり）         | -          |
| TC-04-02 | P1     | unit        | selection 空 → INVALID_SELECTION   | MINOR-01   |
| TC-04-10 | P1     | integration | integratedRuntime 経路 正常系      | -          |
| TC-04-11 | P1     | unit        | integratedRuntime + selection null | MINOR-01   |
| TC-04-14 | P1     | unit        | CONTEXT_TOO_LARGE                  | -          |
| TC-04-20 | P1     | unit        | CREDENTIAL_MISSING + handoff       | -          |
| TC-04-21 | P1     | unit        | terminalSurface → handoff          | -          |
| TC-04-22 | P1     | unit        | capability=none → ブロック         | -          |
| TC-04-30 | P1     | unit        | 不正 sender 拒否                   | MINOR-05   |
| TC-04-31 | P1     | unit        | path traversal 拒否                | -          |
| TC-04-32 | P1     | unit        | secret masking                     | -          |
| TC-04-50 | P1     | unit        | workspacePath 未指定デフォルト動作 | -          |
| TC-04-51 | P1     | unit        | ContextBuilder サイズ制限          | -          |
| TC-04-03 | P2     | unit        | get-selection sender validation    | MINOR-05   |
| TC-04-12 | P2     | unit        | LLM timeout 30秒                   | -          |
| TC-04-13 | P2     | unit        | rate limit + retry                 | -          |
| TC-04-40 | P2     | unit        | IPC 引数型一致                     | MINOR-02   |
| TC-04-41 | P2     | unit        | IPC チャンネル名定数使用           | -          |
| TC-04-52 | P2     | unit        | prompts.ts 5コマンドタイプ         | -          |
