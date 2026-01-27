# Phase 1: 受け入れ基準

## メタ情報

| 項目     | 値                       |
| -------- | ------------------------ |
| Phase    | 1                        |
| タスクID | TASK-5-1                 |
| タスク名 | SkillAPI 実装（Preload） |
| 作成日   | 2026-01-27               |

---

## AC-1: SkillAPI インターフェース

```gherkin
Scenario: SkillAPIインターフェースが正しく定義されている
  Given SkillAPI インターフェースが定義されている
  When TypeScript コンパイルを実行する
  Then コンパイルエラーがないこと
  And 全APIメソッドが型定義されていること

検証方法:
  - pnpm --filter @repo/desktop build でコンパイルエラーがないこと
  - SkillAPI インターフェースに以下のメソッドが含まれていること:
    - execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>
    - onStream: (callback: (message: SkillStreamMessage) => void) => () => void
    - abort: (executionId: string) => Promise<boolean>
    - getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>
    - onPermissionRequest: (callback: (request: SkillPermissionRequest) => void) => () => void
    - sendPermissionResponse: (response: SkillPermissionResponse) => Promise<{ success: boolean }>

検証結果: ✅ PASS
  - skill-api.ts:29-77 でインターフェース定義確認
  - 全6メソッドが型定義済み
```

---

## AC-2: スキル実行

```gherkin
Scenario: スキルを実行できる
  Given Renderer プロセスが起動している
  When window.skillAPI.execute(request) を呼び出す
  Then IPC経由でMain Processに実行リクエストが送信されること
  And executionId を含むレスポンスが返ること

検証方法:
  - 単体テストで safeInvoke が正しいチャネルで呼び出されることを確認
  - SKILL_EXECUTE チャネルが ALLOWED_INVOKE_CHANNELS に含まれていること
  - 型定義で SkillExecutionResponse に executionId が含まれていること

検証結果: ✅ PASS
  - skill-api.ts:113-114 で execute メソッド実装確認
  - channels.ts:379 で SKILL_EXECUTE がホワイトリストに登録
```

---

## AC-3: ストリーミング受信

```gherkin
Scenario: ストリーミングメッセージを受信できる
  Given スキルが実行中である
  When Main ProcessからストリーミングメッセージがIPCで送信される
  Then onStream で登録したコールバックが呼び出されること

検証方法:
  - safeOn が SKILL_STREAM チャネルでリスナーを登録すること
  - SKILL_STREAM チャネルが ALLOWED_ON_CHANNELS に含まれていること
  - コールバック関数に SkillStreamMessage 型のデータが渡されること

検証結果: ✅ PASS
  - skill-api.ts:116-117 で onStream メソッド実装確認
  - channels.ts:476 で SKILL_STREAM がホワイトリストに登録
```

---

## AC-4: 実行中断

```gherkin
Scenario: 実行中のスキルを中断できる
  Given スキルが実行中である
  When window.skillAPI.abort(executionId) を呼び出す
  Then IPC経由でMain Processに中断リクエストが送信されること
  And 中断成功時に true が返ること

検証方法:
  - safeInvoke が SKILL_ABORT チャネルで呼び出されること
  - SKILL_ABORT チャネルが ALLOWED_INVOKE_CHANNELS に含まれていること
  - 戻り値が Promise<boolean> 型であること

検証結果: ✅ PASS
  - skill-api.ts:119-120 で abort メソッド実装確認
  - channels.ts:380 で SKILL_ABORT がホワイトリストに登録
```

---

## AC-5: 実行状態取得

```gherkin
Scenario: 実行状態を取得できる
  Given スキル実行が開始されている
  When window.skillAPI.getExecutionStatus(executionId) を呼び出す
  Then 実行情報（ExecutionInfo）が返ること
  Or 存在しない場合は null が返ること

検証方法:
  - safeInvoke が SKILL_GET_STATUS チャネルで呼び出されること
  - SKILL_GET_STATUS チャネルが ALLOWED_INVOKE_CHANNELS に含まれていること
  - 戻り値が Promise<ExecutionInfo | null> 型であること

検証結果: ✅ PASS
  - skill-api.ts:122-123 で getExecutionStatus メソッド実装確認
  - channels.ts:381 で SKILL_GET_STATUS がホワイトリストに登録
```

---

## AC-6: 権限確認リクエスト購読

```gherkin
Scenario: 権限確認リクエストを受信できる
  Given スキル実行中に権限確認が必要になった
  When Main Processから権限確認リクエストが送信される
  Then onPermissionRequest で登録したコールバックが呼び出されること

検証方法:
  - safeOn が SKILL_PERMISSION_REQUEST チャネルでリスナーを登録すること
  - SKILL_PERMISSION_REQUEST チャネルが ALLOWED_ON_CHANNELS に含まれていること
  - コールバック関数に SkillPermissionRequest 型のデータが渡されること

検証結果: ✅ PASS
  - skill-api.ts:127-133 で onPermissionRequest メソッド実装確認
  - channels.ts:481 で SKILL_PERMISSION_REQUEST がホワイトリストに登録
```

---

## AC-7: 権限確認応答送信

```gherkin
Scenario: 権限確認応答を送信できる
  Given 権限確認リクエストを受信した
  When window.skillAPI.sendPermissionResponse(response) を呼び出す
  Then IPC経由でMain Processに応答が送信されること
  And 送信結果が返ること

検証方法:
  - safeInvoke が SKILL_PERMISSION_RESPONSE チャネルで呼び出されること
  - SKILL_PERMISSION_RESPONSE チャネルが ALLOWED_INVOKE_CHANNELS に含まれていること
  - 戻り値が Promise<{ success: boolean }> 型であること

検証結果: ✅ PASS
  - skill-api.ts:135-138 で sendPermissionResponse メソッド実装確認
  - channels.ts:388 で SKILL_PERMISSION_RESPONSE がホワイトリストに登録
```

---

## AC-8: セキュリティ（ホワイトリスト検証）

```gherkin
Scenario: 許可されていないチャネルへのアクセスが拒否される
  Given 許可リストにないチャネルがある
  When そのチャネルに対してinvokeを試みる
  Then エラーが返されること

検証方法:
  - safeInvoke で許可されていないチャネルを呼び出すとエラーが発生すること
  - エラーメッセージに "is not allowed" が含まれていること
  - safeOn で許可されていないチャネルを登録しようとするとログ出力され、空のクリーンアップ関数が返ること

検証結果: ✅ PASS
  - skill-api.ts:83-85 で許可チェック実装確認
  - skill-api.ts:93-96 で許可チェック実装確認
```

---

## AC-9: window.skillAPI 公開

```gherkin
Scenario: skillAPIがグローバルに公開されている
  Given Electronアプリケーションが起動している
  When Renderer Process で window.skillAPI にアクセスする
  Then SkillAPI のメソッドが利用可能であること

検証方法:
  - contextBridge.exposeInMainWorld で skillAPI が公開されていること
  - contextIsolation: true 環境での公開を確認
  - 非isolated環境でのフォールバック対応を確認

検証結果: ✅ PASS
  - index.ts:539 で公開確認
  - index.ts:560 でフォールバック確認
```

---

## AC-10: クリーンアップ関数

```gherkin
Scenario: イベントリスナーを適切にクリーンアップできる
  Given onStream または onPermissionRequest でリスナーを登録している
  When 返されたクリーンアップ関数を呼び出す
  Then イベントリスナーが解除されること

検証方法:
  - safeOn が返す関数を呼び出すと ipcRenderer.removeListener が呼ばれること
  - メモリリークが発生しないこと

検証結果: ✅ PASS
  - skill-api.ts:104-106 でクリーンアップ関数実装確認
```

---

## 受け入れ基準サマリ

| AC    | シナリオ                       | 結果 |
| ----- | ------------------------------ | ---- |
| AC-1  | インターフェース定義           | PASS |
| AC-2  | スキル実行                     | PASS |
| AC-3  | ストリーミング受信             | PASS |
| AC-4  | 実行中断                       | PASS |
| AC-5  | 実行状態取得                   | PASS |
| AC-6  | 権限確認リクエスト購読         | PASS |
| AC-7  | 権限確認応答送信               | PASS |
| AC-8  | セキュリティ（ホワイトリスト） | PASS |
| AC-9  | window.skillAPI 公開           | PASS |
| AC-10 | クリーンアップ関数             | PASS |

**合計: 10/10 PASS (100%)**
