# Phase 4 テストマトリクス - workspace-chat-edit-runtime-activation

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 4                                           |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 作成日     | 2026-03-14                                  |
| 依存成果物 | Phase 1〜3 成果物                           |

---

## 1. テスト設計方針

本タスクはデザインタスクであるため、テストは「設計の正しさを検証するためのテスト仕様」として定義する。
実際のテストコードは後続の実装タスクで作成する。

テスト対象:

- `handleSendWithContext` ハンドラ（workspacePath検証、エラーコード、handoff 分岐）
- `RuntimeResolver` （auth mode × API key の組み合わせ判定）
- `TerminalHandoffBuilder` （guidance 生成）
- `chatEditSlice` selection 管理
- contextBridge 経由の Preload 公開（M-01 対応）

---

## 2. selection テスト定義

### 2-1. Selection Success テスト

| TC-ID     | テスト名                          | 入力条件                                                                   | 期待結果                                                    | 種別   |
| --------- | --------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- | ------ |
| TC-SEL-01 | selection あり + context 送信成功 | contexts[0].selection = { startLine: 1, endLine: 5, selectedText: "code" } | ContextBuilder が selection セクションを生成する            | 成功系 |
| TC-SEL-02 | selection なし + 早期エラー返却   | contexts[0].selection = undefined + renderer 側で検証                      | SELECTION_REQUIRED エラー (retryable: false)                | 異常系 |
| TC-SEL-03 | 複数ファイル selection 付き       | contexts が 3 ファイル、各 selection あり                                  | 全ファイルの selection セクションを含む prompt が生成される | 成功系 |
| TC-SEL-04 | selection のみで context なし     | selection あり、content = "" (空)                                          | selection text だけでプロンプトが構築される                 | 境界値 |

### 2-2. Selection Unavailable テスト

| TC-ID     | テスト名                              | 入力条件               | 期待結果                                        | 種別   |
| --------- | ------------------------------------- | ---------------------- | ----------------------------------------------- | ------ |
| TC-SEL-05 | Monaco selection が空の場合           | selectedText = ""      | renderer が「選択範囲を決めてから続ける」を表示 | 異常系 |
| TC-SEL-06 | chatEditSlice.selection = null の場合 | 状態: selection = null | 「編集案を生成」CTA が disabled になっている    | 異常系 |

---

## 3. send-with-context テスト定義

### 3-1. Integrated Runtime Success テスト

| TC-ID      | テスト名                                                | 入力条件                                 | 期待結果                                      | 種別   |
| ---------- | ------------------------------------------------------- | ---------------------------------------- | --------------------------------------------- | ------ |
| TC-SEND-01 | integrated mode + API key あり + 成功                   | authMode=integrated, hasApiKey=true      | GeneratedResult が返却される、handoff: false  | 成功系 |
| TC-SEND-02 | integrated mode + API key あり + workspacePath 検証通過 | contexts の filePath が workspacePath 内 | 検証 PASS → LLM 実行                          | 成功系 |
| TC-SEND-03 | hybrid mode + integrated 優先成功                       | authMode=hybrid, hasApiKey=true          | integrated 経路で結果返却                     | 成功系 |
| TC-SEND-04 | diff preview 生成                                       | LLM 成功応答 + originalContent あり      | diffHunks が生成された GeneratedResult が返却 | 成功系 |

### 3-2. Missing API Key テスト

| TC-ID      | テスト名                                               | 入力条件                             | 期待結果                                            | 種別         |
| ---------- | ------------------------------------------------------ | ------------------------------------ | --------------------------------------------------- | ------------ |
| TC-SEND-05 | terminal mode → handoff guidance 返却                  | authMode=terminal                    | handoff: true + guidance.terminalCommand あり       | 成功系       |
| TC-SEND-06 | integrated mode + API key 未設定                       | authMode=integrated, hasApiKey=false | ACCESS_NOT_CONFIGURED + guidance                    | 異常系       |
| TC-SEND-07 | hybrid mode + integrated 失敗 → handoff                | authMode=hybrid, integrated 失敗     | terminal handoff guidance に自動フォールバック      | 異常系       |
| TC-SEND-08 | API key 未設定 + エラーメッセージに API key を含まない | hasApiKey=false + エラー生成         | エラーメッセージに API key 値が含まれない (masking) | セキュリティ |

### 3-3. Terminal Handoff Guidance テスト

| TC-ID      | テスト名                                          | 入力条件                                       | 期待結果                                            | 種別   |
| ---------- | ------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- | ------ |
| TC-HAND-01 | contextSummary に selection text が含まれる       | selection あり + handoff 発生                  | guidance.contextSummary に selectedText が含まれる  | 成功系 |
| TC-HAND-02 | contextSummary に file path が含まれる            | contexts[0].filePath = "/workspace/src/foo.ts" | guidance.contextSummary に "foo.ts" が含まれる      | 成功系 |
| TC-HAND-03 | contextSummary に workspacePath が含まれる        | workspacePath = "/workspace"                   | guidance.contextSummary に workspacePath が含まれる | 成功系 |
| TC-HAND-04 | terminalCommand が Claude Code 起動コマンドを含む | command.type = "refactor"                      | guidance.terminalCommand が "claude" コマンドを含む | 成功系 |

---

## 4. workspacePath 制約テスト

| TC-ID    | テスト名                                       | 入力条件                                          | 期待結果                                     | 種別         |
| -------- | ---------------------------------------------- | ------------------------------------------------- | -------------------------------------------- | ------------ |
| TC-WS-01 | workspacePath 内のファイル → 許可              | filePath = workspacePath + "/src/foo.ts"          | 検証 PASS                                    | 成功系       |
| TC-WS-02 | workspacePath 外のファイル → 拒否              | filePath = "/etc/passwd"                          | PERMISSION_DENIED                            | セキュリティ |
| TC-WS-03 | workspacePath 未指定時はスキップ               | workspacePath = undefined                         | 検証スキップ → LLM 実行                      | 境界値       |
| TC-WS-04 | path traversal 攻撃を拒否                      | filePath = workspacePath + "/../../../etc/passwd" | PERMISSION_DENIED                            | セキュリティ |
| TC-WS-05 | workspacePath 自体のファイル                   | filePath = workspacePath (完全一致)               | 検証 PASS                                    | 境界値       |
| TC-WS-06 | sendWithContext の contexts 複数 + 1件が範囲外 | contexts[0]=範囲内, contexts[1]=範囲外            | PERMISSION_DENIED (最初の違反で早期リターン) | セキュリティ |

---

## 5. エラーコード別テスト

| TC-ID     | テスト名                   | 入力条件                              | 期待エラーコード      | retryable | 種別         |
| --------- | -------------------------- | ------------------------------------- | --------------------- | --------- | ------------ |
| TC-ERR-01 | SELECTION_REQUIRED         | renderer 側で selection = null を検出 | SELECTION_REQUIRED    | false     | 異常系       |
| TC-ERR-02 | ACCESS_NOT_CONFIGURED      | hasApiKey=false, authMode=integrated  | ACCESS_NOT_CONFIGURED | false     | 異常系       |
| TC-ERR-03 | RATE_LIMIT (retryable)     | LLM API が 429 を返す                 | RATE_LIMIT            | true      | 異常系       |
| TC-ERR-04 | TIMEOUT (retryable)        | LLM API が 30s で応答なし             | TIMEOUT               | true      | 異常系       |
| TC-ERR-05 | CONTEXT_TOO_LARGE (既実装) | contexts 合計 > 100KB                 | CONTEXT_TOO_LARGE     | false     | 異常系       |
| TC-ERR-06 | PERMISSION_DENIED (既実装) | workspacePath 外アクセス              | PERMISSION_DENIED     | false     | セキュリティ |
| TC-ERR-07 | LLM_ERROR                  | LLM API が 500 を返す                 | LLM_ERROR             | true      | 異常系       |

---

## 6. contextBridge テスト (M-01 対応)

| TC-ID      | テスト名                                      | 入力条件                               | 期待結果                                                 | 種別         |
| ---------- | --------------------------------------------- | -------------------------------------- | -------------------------------------------------------- | ------------ |
| TC-PREL-01 | contextBridge 経由で chatEditAPI が公開される | contextIsolation=true, sandbox=true    | `window.chatEditAPI` が Renderer からアクセス可能        | 成功系       |
| TC-PREL-02 | chatEditAPI.sendWithContext が IPC を呼び出す | Renderer が sendWithContext を呼び出す | ipcRenderer.invoke("chat-edit:send-with-context") が発火 | 成功系       |
| TC-PREL-03 | sender 検証が機能する                         | 不正な webContents から IPC 呼び出し   | ハンドラが拒否する                                       | セキュリティ |

---

## 7. 回帰テスト（既実装の維持確認）

| TC-ID     | テスト名                                | 対象                 | 確認内容                         |
| --------- | --------------------------------------- | -------------------- | -------------------------------- |
| TC-REG-01 | read-file の workspacePath 制約維持     | handleReadFile       | 既実装のテストが PASS であること |
| TC-REG-02 | write-file の workspacePath 制約維持    | handleWriteFile      | 既実装のテストが PASS であること |
| TC-REG-03 | detect-language の動作維持              | handleDetectLanguage | 既実装のテストが PASS であること |
| TC-REG-04 | ContextBuilder の build 動作維持        | ContextBuilder.build | 既実装のテストが PASS であること |
| TC-REG-05 | ChatEditService の sendWithContext 維持 | ChatEditService      | 既実装のテストが PASS であること |

---

## 8. 完了条件確認

- [x] 主要成功系テストが定義されている（TC-SEND-01〜04, TC-SEL-01, TC-HAND-01〜04）
- [x] 異常系テストが定義されている（TC-SEND-05〜08, TC-ERR-01〜07）
- [x] セキュリティテストが定義されている（TC-WS-02, TC-WS-04, TC-WS-06, TC-PREL-03）
- [x] 回帰テストが定義されている（TC-REG-01〜05）
- [x] M-01 (contextBridge) のテストが含まれている（TC-PREL-01〜03）
