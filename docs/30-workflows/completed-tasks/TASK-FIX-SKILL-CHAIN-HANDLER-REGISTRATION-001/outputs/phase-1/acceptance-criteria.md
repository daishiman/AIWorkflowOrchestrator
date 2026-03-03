# 受入基準: TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001

## メタ情報

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| タスクID | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| Phase    | 1 — 要件定義                                  |
| 作成日   | 2026-03-03                                    |
| 形式     | Given/When/Then（BDD形式）                    |

## AC-01: registerAllIpcHandlers 呼び出し後に skill:chain:list が応答を返す

**対応要件:** FR-01, FR-02

```gherkin
Given アプリケーションが起動し registerAllIpcHandlers() が実行された状態
When  Renderer から skill:chain:list チャンネルに IPC リクエストを送信する
Then  Main Process がリクエストを受け付け、SkillChainDefinition[] を含む IpcResult を返す
And   レスポンスのステータスが success である
```

### 検証方法

- ユニットテスト: `registerAllIpcHandlers()` 実行後に `ipcMain.handle` が `skill:chain:list` チャンネルを持つことを確認
- 統合テスト: `useChainList` フック経由で chainList() が空配列（初期状態）を正常に返すことを確認

## AC-02: unregisterAllIpcHandlers 後にハンドラが存在しない

**対応要件:** FR-03

```gherkin
Given registerAllIpcHandlers() で skill:chain:* ハンドラが登録された状態
When  unregisterAllIpcHandlers() を実行する
Then  skill:chain:list ハンドラが解除されている
And   skill:chain:get ハンドラが解除されている
And   skill:chain:save ハンドラが解除されている
And   skill:chain:delete ハンドラが解除されている
And   skill:chain:execute ハンドラが解除されている
```

### 検証方法

- ユニットテスト: `unregisterAllIpcHandlers()` 実行後に `ipcMain.removeHandler` が5チャンネル分呼び出されたことを確認
- 注: 現行の `unregisterAllIpcHandlers()` は `Object.values(IPC_CHANNELS)` で全チャンネルを一括解除するため、skill:chain:\* は自動的に解除対象

## AC-03: chainId の3段バリデーションが動作する

**対応要件:** NFR-02

### AC-03a: 型チェック

```gherkin
Given skill:chain:get ハンドラが登録された状態
When  chainId に number 型の値 (123) を渡す
Then  VALIDATION_ERROR を返す
And   エラーメッセージに "chainId must be a non-empty string" を含む
```

### AC-03b: 空文字列チェック

```gherkin
Given skill:chain:get ハンドラが登録された状態
When  chainId に空文字列 ("") を渡す
Then  VALIDATION_ERROR を返す
And   エラーメッセージに "chainId must be a non-empty string" を含む
```

### AC-03c: トリム空文字列チェック

```gherkin
Given skill:chain:get ハンドラが登録された状態
When  chainId にスペースのみの文字列 ("   ") を渡す
Then  VALIDATION_ERROR を返す
And   エラーメッセージに "chainId must be a non-empty string" を含む
```

### 対象ハンドラ

- `skill:chain:get` — chainId パラメータ
- `skill:chain:delete` — chainId パラメータ
- `skill:chain:execute` — args.chainId パラメータ

### 検証方法

- 既存テスト（`skillHandlers.chain.test.ts`）で21件のテストが全PASS
- 本タスクの修正でバリデーションロジックは変更しないため、回帰テストとして機能

## AC-04: sender 検証が有効である

**対応要件:** NFR-03

```gherkin
Given skill:chain:list ハンドラが登録された状態
When  許可されたウィンドウ以外の送信元から IPC リクエストを送信する
Then  sender 検証に失敗し、リクエストが拒否される
```

```gherkin
Given skill:chain:list ハンドラが登録された状態
When  mainWindow から IPC リクエストを送信する
Then  sender 検証に成功し、正常なレスポンスを返す
```

### 対象チャンネル

- 5チャンネル全て（list, get, save, delete, execute）

### 検証方法

- 既存テスト: `skillHandlers.chain.test.ts` 内の `validateIpcSender` モック検証で確認済み
- 追加テスト: `registerAllIpcHandlers()` 経由での登録後も sender 検証が有効であることを確認

## AC-05: 二重登録時に例外が発生しない

**対応要件:** FR-04

```gherkin
Given registerAllIpcHandlers() が一度実行された状態
When  unregisterAllIpcHandlers() を実行し、再度 registerAllIpcHandlers() を実行する
Then  skill:chain:* ハンドラが正常に再登録される
And   例外が発生しない
```

```gherkin
Given registerAllIpcHandlers() が一度実行された状態
When  unregisterAllIpcHandlers() を実行せずに registerAllIpcHandlers() を再実行する
Then  ipcMain.handle の二重登録例外が発生する（既存の防止パターンでカバー）
```

### 検証方法

- ユニットテスト: 登録 → 解除 → 再登録のサイクルで例外が発生しないことを確認

## AC-06: ホワイトリスト登録チャンネルの配線網羅検証

**対応要件:** NFR-01

```gherkin
Given ALLOWED_INVOKE_CHANNELS に skill:chain:* 5チャンネルが含まれている
When  registerAllIpcHandlers() を実行する
Then  ALLOWED_INVOKE_CHANNELS に含まれる全チャンネルに対応するハンドラが登録されている
```

### 検証方法

- 回帰テスト: `ALLOWED_INVOKE_CHANNELS` の各要素に対して `ipcMain.handle` が呼ばれたことを検証
- 将来の配線漏れを検出するガードテストとして機能

## 受入基準マトリクス

| AC    | 対応要件     | テスト種別       | 優先度 |
| ----- | ------------ | ---------------- | ------ |
| AC-01 | FR-01, FR-02 | ユニット + 統合  | 高     |
| AC-02 | FR-03        | ユニット         | 高     |
| AC-03 | NFR-02       | ユニット（既存） | 中     |
| AC-04 | NFR-03       | ユニット（既存） | 中     |
| AC-05 | FR-04        | ユニット         | 高     |
| AC-06 | NFR-01       | ユニット（回帰） | 中     |
