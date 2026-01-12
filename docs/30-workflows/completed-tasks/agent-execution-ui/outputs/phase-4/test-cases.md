# テストケース一覧

## 概要

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | AGENT-004          |
| 機能名   | agent-execution-ui |
| Phase    | 4                  |
| 作成日   | 2026-01-12         |

---

## 1. agentSlice 実行状態テスト

### 1.1 startExecution

| ID     | テストケース                      | 入力                   | 期待結果                   |
| ------ | --------------------------------- | ---------------------- | -------------------------- |
| EX-001 | ステータスがexecutingに設定される | skill, executionId     | status === "executing"     |
| EX-002 | currentSkillが設定される          | mockSkill, "exec-123"  | currentSkill === mockSkill |
| EX-003 | startedAtが設定される             | skill, executionId     | startedAt !== null         |
| EX-004 | 前のメッセージがクリアされる      | 既存メッセージあり状態 | messages === []            |

### 1.2 stopExecution

| ID     | テストケース                          | 入力   | 期待結果                       |
| ------ | ------------------------------------- | ------ | ------------------------------ |
| EX-005 | ステータスがcancelledに設定される     | 実行中 | status === "cancelled"         |
| EX-006 | currentStreamingContentがクリアされる | 実行中 | currentStreamingContent === "" |

### 1.3 addUserMessage

| ID     | テストケース                   | 入力            | 期待結果              |
| ------ | ------------------------------ | --------------- | --------------------- |
| EX-007 | ユーザーメッセージが追加される | "Hello, agent!" | messages.length === 1 |
| EX-008 | タイムスタンプが自動設定される | "Test message"  | timestamp !== null    |

### 1.4 addAssistantMessage

| ID     | テストケース                       | 入力                  | 期待結果                         |
| ------ | ---------------------------------- | --------------------- | -------------------------------- |
| EX-009 | アシスタントメッセージが追加される | { content: "Hello!" } | messages[0].role === "assistant" |

### 1.5 appendStreamingContent

| ID     | テストケース                      | 入力              | 期待結果                                  |
| ------ | --------------------------------- | ----------------- | ----------------------------------------- |
| EX-010 | コンテンツが追加される            | "Hello ", "World" | currentStreamingContent === "Hello World" |
| EX-011 | ステータスがstreamingに設定される | "Content"         | status === "streaming"                    |

### 1.6 finalizeStreamingMessage

| ID     | テストケース                          | 入力                      | 期待結果                          |
| ------ | ------------------------------------- | ------------------------- | --------------------------------- |
| EX-012 | ストリーミング内容からメッセージ作成  | streamingContent: "Hello" | messages[0].content === "Hello"   |
| EX-013 | currentStreamingContentがクリアされる | 完了処理                  | currentStreamingContent === ""    |
| EX-014 | isStreamingがfalseに設定される        | 完了処理                  | messages[0].isStreaming === false |

### 1.7 setExecutionError

| ID     | テストケース                  | 入力            | 期待結果                  |
| ------ | ----------------------------- | --------------- | ------------------------- |
| EX-015 | エラーメッセージが設定される  | "Network error" | error === "Network error" |
| EX-016 | ステータスがerrorに設定される | "Error message" | status === "error"        |

### 1.8 clearMessages

| ID     | テストケース               | 入力           | 期待結果          |
| ------ | -------------------------- | -------------- | ----------------- |
| EX-017 | 全メッセージがクリアされる | メッセージあり | messages === []   |
| EX-018 | ステータスがidleにリセット | メッセージあり | status === "idle" |

### 1.9 resetExecutionState

| ID     | テストケース             | 入力       | 期待結果             |
| ------ | ------------------------ | ---------- | -------------------- |
| EX-019 | 全状態が初期値にリセット | 任意の状態 | 全フィールドが初期値 |

---

## 2. agentSlice Permission状態テスト

### 2.1 setPermissionRequest

| ID     | テストケース                          | 入力        | 期待結果                          |
| ------ | ------------------------------------- | ----------- | --------------------------------- |
| PM-001 | pendingPermissionが設定される         | mockRequest | pendingPermission === mockRequest |
| PM-002 | ステータスがawaiting_permissionになる | mockRequest | status === "awaiting_permission"  |
| PM-003 | nullでpendingPermissionがクリアされる | null        | pendingPermission === null        |

### 2.2 respondToPermission

| ID     | テストケース                      | 入力                 | 期待結果                   |
| ------ | --------------------------------- | -------------------- | -------------------------- |
| PM-004 | 許可時にpendingPermissionがクリア | approved: true       | pendingPermission === null |
| PM-005 | 拒否時にpendingPermissionがクリア | approved: false      | pendingPermission === null |
| PM-006 | ステータスがexecutingに戻る       | approved: true/false | status === "executing"     |

### 2.3 rememberPermissionChoice

| ID     | テストケース           | 入力            | 期待結果                            |
| ------ | ---------------------- | --------------- | ----------------------------------- |
| PM-007 | 許可選択が記憶される   | "Bash", true    | rememberedChoices["Bash"] === true  |
| PM-008 | 拒否選択が記憶される   | "Bash", false   | rememberedChoices["Bash"] === false |
| PM-009 | 前の選択が上書きされる | 2回目の呼び出し | 最新の値が保存                      |

### 2.4 getRememberedChoice

| ID     | テストケース            | 入力               | 期待結果   |
| ------ | ----------------------- | ------------------ | ---------- |
| PM-010 | 記憶済み選択が返される  | "Bash"（記憶済み） | true/false |
| PM-011 | 未記憶ツールはundefined | "Unknown"          | undefined  |

### 2.5 clearRememberedChoices

| ID     | テストケース         | 入力     | 期待結果                 |
| ------ | -------------------- | -------- | ------------------------ |
| PM-012 | 全記憶がクリアされる | 記憶あり | rememberedChoices === {} |

---

## 3. AgentChatInterface コンポーネントテスト

### 3.1 rendering

| ID     | テストケース                   | Props                         | 期待結果                 |
| ------ | ------------------------------ | ----------------------------- | ------------------------ |
| CI-001 | メッセージリストがレンダリング | messages, not streaming       | role="log" が存在        |
| CI-002 | ストリーミング中に出力表示     | streamingContent, isStreaming | ストリーミング内容が表示 |
| CI-003 | メッセージなし時に空状態表示   | messages: []                  | 空状態メッセージ表示     |

### 3.2 user messages

| ID     | テストケース                 | Props       | 期待結果                  |
| ------ | ---------------------------- | ----------- | ------------------------- |
| CI-004 | ユーザーメッセージのスタイル | userMessage | data-role="user" 存在     |
| CI-005 | ユーザーアバター表示         | userMessage | testid="user-avatar" 存在 |

### 3.3 assistant messages

| ID     | テストケース                     | Props            | 期待結果                       |
| ------ | -------------------------------- | ---------------- | ------------------------------ |
| CI-006 | アシスタントメッセージのスタイル | assistantMessage | data-role="assistant" 存在     |
| CI-007 | アシスタントアバター表示         | assistantMessage | testid="assistant-avatar" 存在 |
| CI-008 | Markdown内容がレンダリング       | markdownContent  | bold/italic 要素が存在         |

### 3.4 streaming

| ID     | テストケース                   | Props             | 期待結果                       |
| ------ | ------------------------------ | ----------------- | ------------------------------ |
| CI-009 | カーソル付きストリーミング表示 | isStreaming: true | testid="streaming-cursor" 存在 |
| CI-010 | 新コンテンツで自動スクロール   | content変更       | scrollIntoView が呼ばれる      |

### 3.5 accessibility

| ID     | テストケース             | Props | 期待結果                        |
| ------ | ------------------------ | ----- | ------------------------------- |
| CI-011 | 適切なaria-label         | any   | aria-label に "チャット" を含む |
| CI-012 | キーボードナビゲーション | any   | tabIndex="0"                    |

---

## 4. AgentMessageInput コンポーネントテスト

### 4.1 input behavior

| ID     | テストケース       | 操作               | 期待結果                    |
| ------ | ------------------ | ------------------ | --------------------------- |
| MI-001 | 入力で値更新       | ユーザー入力       | onChange が各文字で呼ばれる |
| MI-002 | 送信後に入力クリア | 送信ボタンクリック | onChange("") が呼ばれる     |
| MI-003 | 実行中は無効化     | disabled: true     | input と button が disabled |

### 4.2 send behavior

| ID     | テストケース             | 操作           | 期待結果            |
| ------ | ------------------------ | -------------- | ------------------- |
| MI-004 | ボタンクリックで送信     | ボタンクリック | onSubmit が呼ばれる |
| MI-005 | Enterキーで送信          | Enter押下      | onSubmit が呼ばれる |
| MI-006 | 空メッセージは送信しない | 空で送信試行   | onSubmit 呼ばれない |
| MI-007 | Shift+Enterで改行        | Shift+Enter    | onSubmit 呼ばれない |

### 4.3 accessibility

| ID     | テストケース         | Props      | 期待結果                          |
| ------ | -------------------- | ---------- | --------------------------------- |
| MI-008 | 適切なaria-label     | default    | aria-label に "メッセージ" を含む |
| MI-009 | プレースホルダー表示 | カスタム値 | placeholder が設定される          |

---

## 5. AgentExecutionControls コンポーネントテスト

### 5.1 cancel button

| ID     | テストケース                       | Props              | 期待結果            |
| ------ | ---------------------------------- | ------------------ | ------------------- |
| EC-001 | 実行中にキャンセルボタン表示       | isExecuting: true  | ボタンが visible    |
| EC-002 | アイドル時にキャンセルボタン非表示 | isExecuting: false | ボタンが存在しない  |
| EC-003 | クリックでonCancel呼び出し         | isExecuting: true  | onCancel が呼ばれる |
| EC-004 | 非実行時はボタンなし               | isExecuting: false | ボタンが DOM にない |

### 5.2 clear button

| ID     | テストケース                  | Props/操作        | 期待結果           |
| ------ | ----------------------------- | ----------------- | ------------------ |
| EC-005 | クリアボタン表示              | hasMessages: true | ボタンが visible   |
| EC-006 | クリックで確認ダイアログ      | クリック          | alertdialog 表示   |
| EC-007 | 確認後にonClear呼び出し       | 確認クリック      | onClear が呼ばれる |
| EC-008 | キャンセル時はonClear呼ばない | キャンセル        | onClear 呼ばれない |

### 5.3 accessibility

| ID     | テストケース           | 操作/Props | 期待結果                    |
| ------ | ---------------------- | ---------- | --------------------------- |
| EC-009 | 適切なaria-label       | 両ボタン   | aria-label が設定されている |
| EC-010 | キーボードアクセス可能 | Enterキー  | onCancel が呼ばれる         |

---

## 6. PermissionDialog コンポーネントテスト

### 6.1 rendering

| ID     | テストケース            | Props               | 期待結果             |
| ------ | ----------------------- | ------------------- | -------------------- |
| PD-001 | nullでレンダリングなし  | request: null       | alertdialog なし     |
| PD-002 | requestでダイアログ表示 | request: mockReq    | alertdialog 存在     |
| PD-003 | ツール名表示            | request: mockReq    | "Bash" が表示        |
| PD-004 | ツール引数表示          | request: mockReq    | "npm install" が表示 |
| PD-005 | 理由表示（存在時）      | request: withReason | reason が表示        |

### 6.2 approve behavior

| ID     | テストケース                   | 操作               | 期待結果                    |
| ------ | ------------------------------ | ------------------ | --------------------------- |
| PD-006 | 許可クリックでonApprove        | 許可ボタンクリック | onApprove(false) が呼ばれる |
| PD-007 | デフォルトrememberChoice=false | 許可ボタンクリック | onApprove(false)            |
| PD-008 | チェック時rememberChoice=true  | チェック後許可     | onApprove(true)             |

### 6.3 deny behavior

| ID     | テストケース                   | 操作               | 期待結果                 |
| ------ | ------------------------------ | ------------------ | ------------------------ |
| PD-009 | 拒否クリックでonDeny           | 拒否ボタンクリック | onDeny(false) が呼ばれる |
| PD-010 | デフォルトrememberChoice=false | 拒否ボタンクリック | onDeny(false)            |
| PD-011 | チェック時rememberChoice=true  | チェック後拒否     | onDeny(true)             |

### 6.4 remember checkbox

| ID     | テストケース     | 操作             | 期待結果            |
| ------ | ---------------- | ---------------- | ------------------- |
| PD-012 | デフォルトでオフ | 初期表示         | checkbox unchecked  |
| PD-013 | クリックでトグル | チェックボックス | checked ↔ unchecked |

### 6.5 accessibility

| ID     | テストケース         | Props | 期待結果                           |
| ------ | -------------------- | ----- | ---------------------------------- |
| PD-014 | 適切なダイアログrole | any   | role="alertdialog"                 |
| PD-015 | フォーカストラップ   | Tab   | フォーカスがダイアログ内に留まる   |
| PD-016 | 適切なaria属性       | any   | aria-modal="true", aria-labelledby |

---

## 7. AgentExecutionView コンポーネントテスト

### 7.1 rendering

| ID     | テストケース                 | 状態 | 期待結果                       |
| ------ | ---------------------------- | ---- | ------------------------------ |
| AV-001 | スキルヘッダー表示           | 初期 | "Test Skill" が表示            |
| AV-002 | チャットインターフェース表示 | 初期 | role="log" が存在              |
| AV-003 | メッセージ入力表示           | 初期 | textbox が存在                 |
| AV-004 | 実行コントロール表示         | 初期 | region="実行コントロール" 存在 |

### 7.2 navigation

| ID     | テストケース           | 操作               | 期待結果                |
| ------ | ---------------------- | ------------------ | ----------------------- |
| AV-005 | 戻るボタンでナビゲート | 戻るボタンクリック | navigate(-1) が呼ばれる |
| AV-006 | 現在のスキル名表示     | 初期表示           | "Test Skill" が表示     |

### 7.3 message flow

| ID     | テストケース         | 操作               | 期待結果                         |
| ------ | -------------------- | ------------------ | -------------------------------- |
| AV-007 | 送信でメッセージ追加 | 入力して送信       | addUserMessage, start が呼ばれる |
| AV-008 | 受信メッセージ表示   | メッセージ状態更新 | メッセージが表示                 |

### 7.4 execution control

| ID     | テストケース               | 操作                | 期待結果                       |
| ------ | -------------------------- | ------------------- | ------------------------------ |
| AV-009 | キャンセルで実行停止       | キャンセルクリック  | stopExecution, stop が呼ばれる |
| AV-010 | クリア確認後メッセージ削除 | クリア→確認クリック | clearMessages が呼ばれる       |

### 7.5 permission dialog

| ID     | テストケース              | 状態                | 期待結果                           |
| ------ | ------------------------- | ------------------- | ---------------------------------- |
| AV-011 | pending時にダイアログ表示 | awaiting_permission | alertdialog 存在, "Bash" 表示      |
| AV-012 | 許可で応答送信            | ダイアログで許可    | respondPermission(approved: true)  |
| AV-013 | 拒否で応答送信            | ダイアログで拒否    | respondPermission(approved: false) |

---

## 変更履歴

| Version | Date       | Author | Changes  |
| ------- | ---------- | ------ | -------- |
| 1.0.0   | 2026-01-12 | Claude | 初版作成 |
