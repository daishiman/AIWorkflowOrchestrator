# Phase 1 Task 1: 既存SkillExecutor実装分析レポート

## 分析対象

- ファイル: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- 行数: 1149行
- TASK: TASK-3-1-A (SDK query()基本実装), TASK-3-1-B (Hooks), TASK-3-1-E (rememberChoice)

---

## execute() メソッドのフロー

```
execute(request, skill)
├── 同時実行数チェック (activeExecutions.size >= MAX_CONCURRENT_EXECUTIONS)
│   └── 超過時: MAX_CONCURRENT_EXCEEDED エラー返却
├── executionId 生成 (uuidv4)
├── AbortController 作成
├── ExecutionContext 登録 (activeExecutions Map に追加)
├── 状態更新: "running"
├── try:
│   ├── プロンプト構築 (buildPrompt)
│   ├── callSDKQuery() → query() API 呼び出し
│   ├── for await (message of stream())
│   │   ├── abortSignal チェック → break
│   │   └── handleStreamMessage() → IPC送信
│   ├── 完了通知送信 (type: "complete")
│   └── 状態更新: "completed"
├── catch:
│   └── handleExecutionError() → エラー変換・通知・ログ
└── finally:
    └── cleanup() → 60秒後にactiveExecutionsから削除
```

---

## リトライ機構追加ポイント

### 追加ポイント: callSDKQuery() の呼び出し部分

現在の execute() メソッドの L336-L341:

```
const response = await this.callSDKQuery(fullPrompt, { ... });
```

この呼び出しをリトライラッパー (`executeWithRetry()`) で包む。

### 理由

- query() API 呼び出しが一時的なエラーで失敗する可能性がある
- ストリーミング処理の前段階でリトライすることで、部分的なストリームの重複を回避
- AbortController が既に作成済みの段階でリトライするため、abort連携が自然

---

## 既存の categorizeError() と isRetryable() メソッド

### categorizeError() (L878-L900)

| 判定条件                                | 返却値              |
| --------------------------------------- | ------------------- |
| error.name === "AbortError"             | "timeout"           |
| error.message に "permission" 含む      | "permission_denied" |
| error.message に "network"/"fetch" 含む | "network"           |
| error.message に "SDK"/"API" 含む       | "sdk_error"         |
| その他                                  | "unknown"           |

- ErrorCategory型: "sdk_error" | "permission_denied" | "timeout" | "network" | "unknown"

### isRetryable() (L908-L920)

| 判定条件                           | 返却値 |
| ---------------------------------- | ------ |
| error.message に "network" 含む    | true   |
| error.message に "timeout" 含む    | true   |
| error.message に "econnreset" 含む | true   |
| その他                             | false  |

**課題**: 現在の isRetryable() は簡易的な文字列マッチのみで、以下が不足:

- HTTP ステータスコードベースの判定なし
- Retry-After ヘッダー対応なし
- エラーコード (ECONNREFUSED, ENOTFOUND, EAI_AGAIN) 対応なし
- 判定結果にエラー分類情報がない

---

## AbortController によるキャンセル機構

- L314: `const abortController = new AbortController()`
- L339: `signal: abortController.signal` → SDK query() に渡される
- L345-347: ストリーミングループ内で `abortController.signal.aborted` チェック
- abort() メソッド (L382-L406): abortController.abort() 呼び出し → 状態更新 → エラー通知

**リトライとの連携要件**:

- リトライ中の sleep() に AbortSignal を渡す
- abort() 呼び出し時にリトライを即座に中止する
- リトライループ各反復の先頭で abortSignal.aborted をチェックする

---

## ストリーミングメッセージの送信パターン

### sendStream() (L578-L586)

- `this.mainWindow.webContents.send("skill:stream", message)` で IPC 送信
- BrowserWindow 破棄チェック付き

### sendHooksStream() (L860-L870)

- try-catch でエラーをキャッチし、ログ出力のみで継続

**リトライイベント送信**: sendStream() パターンを使用してリトライ情報を送信する。SkillStreamMessage の新規 type "retry" を追加。

---

## 同時実行制御との関係

- MAX_CONCURRENT_EXECUTIONS = 5
- リトライはexecute()内部で行われるため、リトライ中も1つの実行スロットを占有し続ける
- リトライ中に新規execute()がMAX_CONCURRENTに達した場合、新規実行は拒否される
- これは意図された動作（リトライ中の実行は完了していないため）

---

## 発見事項

1. **SkillExecutor.ts はローカル型定義を使用**: @repo/shared の型とは別にローカルで SkillStreamMessageType 等を定義している
2. **既存の isRetryable() は新リトライ機構とは別物**: 既存はメッセージベースの簡易判定、新機構はHTTPステータス/エラーコードベース
3. **callSDKQuery() は dynamic import**: `@anthropic-ai/claude-agent-sdk` を動的にインポートしている
4. **型定義は SkillExecutor.ts 内にローカル定義**: packages/shared/src/types/skill.ts の型とは独立して定義されている
