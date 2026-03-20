# スキル実行IPCセキュリティ / core specification

> 親仕様書: [security-skill-ipc.md](security-skill-ipc.md)
> 役割: core specification

## 概要

本ドキュメントでは、スキル実行機能に関連するIPC通信のセキュリティ対策を定義する。パストラバーサル防止、コマンドインジェクション防止、ホワイトリストベースのチャンネル検証など、多層防御によりRenderer-Main間の通信を保護する。

---

## スキル管理IPCセキュリティ

**実装場所**: `apps/desktop/src/main/services/skill/SkillScanner.ts`

スキル管理機能では、ファイルシステムアクセスに関する追加のセキュリティ対策を実装する。

### パストラバーサル防止

| チェック項目       | 実装                                  | エラーコード            |
| ------------------ | ------------------------------------- | ----------------------- |
| パス正規化         | `path.normalize()` + `path.resolve()` | -                       |
| ベースパス検証     | `startsWith(basePath)`                | PATH_TRAVERSAL_DETECTED |
| `../` パターン検出 | 相対パスの上位参照を拒否              | PATH_TRAVERSAL_DETECTED |

**validatePath処理フロー**:

| ステップ | 処理内容               | 使用API                       | 説明                           |
| -------- | ---------------------- | ----------------------------- | ------------------------------ |
| 1        | パス正規化             | `path.normalize(targetPath)`  | 冗長な区切りや`.`を正規化      |
| 2        | 絶対パス変換           | `path.resolve(basePath, ...)` | ベースパス基準で絶対パスに変換 |
| 3        | ベースパス検証         | `resolved.startsWith(basePath)` | 解決後パスがベースパス配下か確認 |
| 4        | 違反時はエラースロー   | Error("PATH_TRAVERSAL_DETECTED") | パストラバーサル検出時に例外発生 |

この検証ロジックにより、`../`を含む相対パスや絶対パスでのベースパス外アクセスを防止する。

### シンボリックリンク検証

| チェック項目 | 実装                          | 対応                 |
| ------------ | ----------------------------- | -------------------- |
| リンク検出   | `fs.lstat().isSymbolicLink()` | リンク先を検証       |
| リンク先解決 | `fs.realpath()`               | ベースパス外なら除外 |
| 循環リンク   | 検出時は除外                  | エラーログを出力     |

### IPCチャネル検証

全てのスキル管理IPCハンドラは`validateIpcSender`を使用して呼び出し元を検証する。

| チャネル               | 検証項目                          |
| ---------------------- | --------------------------------- |
| `skill:list`           | sender検証 + パストラバーサル検証 |
| `skill:getImported`    | sender検証                        |
| `skill:import`         | sender検証 + skillName非空文字列検証（`trim()`含む）（UT-FIX-SKILL-IMPORT-INTERFACE-001 + UT-FIX-SKILL-IMPORT-RETURN-TYPE-001） |
| `skill:remove`         | sender検証 + skillName非空文字列検証（`trim()`含む） |
| `skill:get-detail`     | sender検証 + skillId非空文字列検証（`trim()`含む）（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001） |
| `skill:execute`        | sender検証 + `skillName`（正式）または`skillId`（後方互換）非空文字列検証（`trim()`含む）（UT-FIX-SKILL-EXECUTE-INTERFACE-001） |
| `skill:abort`          | sender検証 + executionId非空文字列検証（`trim()`含む）（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001） |
| `skill:get-status`     | sender検証 + executionId非空文字列検証（`trim()`含む）（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001） |
| `skill:analyze`        | sender検証 + skillName非空文字列検証（`trim()`含む）（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001） |
| `skill:improve`        | sender検証 + skillName非空文字列検証（`trim()`含む）（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001） |
| `skill:optimize`       | sender検証 + prompt非空文字列検証（`trim()`含む、VALIDATION_ERRORをthrow）（UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 再監査） |
| `skill:optimize:variants` | sender検証 + prompt非空文字列検証（`trim()`含む、VALIDATION_ERRORをthrow）（UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 再監査） |
| `skill:optimize:evaluate` | sender検証 + prompt非空文字列検証（`trim()`含む、VALIDATION_ERRORをthrow）（UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 再監査） |

`skill:import` は `typeof skillName === "string"` かつ `skillName.trim() !== ""` を満たす場合のみ処理を継続する（UT-FIX-SKILL-IMPORT-INTERFACE-001）。

`skill:remove` は `typeof skillName === "string"` かつ `skillName.trim() !== ""` を満たす場合のみ処理を継続する（UT-FIX-SKILL-REMOVE-INTERFACE-001）。

`skill:execute` は `SkillExecutionRequest`（`skillName`, `prompt`）を正式契約として受理し、旧 `{ skillId, params }` は後方互換として維持する。ハンドラ層では `skillName` / `skillId` の入力検証を実施し、`prompt` の内容制約はサービス層・実行エンジン側の責務として扱う（UT-FIX-SKILL-EXECUTE-INTERFACE-001）。

`skill:list` / `skill:scan` / `skill:getImported` / `skill:get-detail` / `skill:execute` / `skill:analyze` / `skill:improve` / `skill:optimize*` は catch ブロックで `sanitizeErrorMessage()` を適用し、内部情報（path, host, token等）をマスクしてから Renderer へ返却する。非Error例外およびJSランタイム詳細エラーは `スキル処理でエラーが発生しました` に正規化する。

> **IPC修正時のチェックリスト**: IPC ハンドラー / Preload API を修正する場合は [ipc-contract-checklist.md](./ipc-contract-checklist.md) の6フェーズチェックリストに従う。P23/P32/P42/P44 パターンを統合した契約ドリフト防止ガイド。

> **Note**: TASK-FIX-4-1-IPC-CONSOLIDATIONにより、旧チャンネル名（`skill:list-available`, `skill:list-imported`）は削除されました。

### Skill API current canonical contract（TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001）

> **正本**: [interfaces-agent-sdk-skill-details.md](./interfaces-agent-sdk-skill-details.md)
>
> このタスクでは `skill:get-detail` / `skill:update` を object payload 標準で扱う。`skill:get-detail` / `skill:update` はどちらも `safeInvokeUnwrap` で reject/throw する前提で、Preload から `{ skillId }` / `{ skillName, updates }` を渡す。

| チャンネル        | 検証項目                                                       | エラー / 戻り値                                   |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| `skill:get-detail` | sender検証 + `{ skillId }` object payload + skillId非空文字列検証（`trim()`含む） | `VALIDATION_ERROR` / `skillId must be a non-empty string` |
| `skill:update`     | sender検証 + `{ skillName, updates }` object payload + skillName非空文字列検証（`trim()`含む） + updates object検証 | `VALIDATION_ERROR` / `skillName must be a non-empty string` |

補足:

- `skill:get-detail` の失敗応答は Preload 側で `safeInvokeUnwrap` により例外化し、`null` 返却で隠蔽しない。
- `skill:update` も `safeInvokeUnwrap` で wrapper 展開し、object payload を維持して P44（構造ドリフト）と P45（命名ドリフト）を同時に監視する。
- sync 対象は `packages/shared/src/types/skill.ts` または shared transport DTO、`apps/desktop/src/preload/skill-api.ts`、`apps/desktop/src/preload/types.ts`、`apps/desktop/src/main/ipc/skillHandlers.ts`、必要に応じて `packages/shared/src/ipc/channels.ts`。

---

## スキルインポートIPCチャネル（TASK-4-1）

**実装場所**: `apps/desktop/src/preload/channels.ts`

> **Note**: 本セクションはTASK-4-1時点のチャネル定義（8チャネル）を記録。現行 canonical は [interfaces-agent-sdk-skill-details.md](./interfaces-agent-sdk-skill-details.md) と下記の current canonical contract を参照する。

スキルインポート機能用のIPCチャネル定義（TASK-4-1時点: 8チャネル）:

**チャネル定数一覧**:

| 定数名                   | チャネル文字列               | 用途                     |
| ------------------------ | ---------------------------- | ------------------------ |
| SKILL_LIST               | skill:list                   | スキル一覧取得           |
| SKILL_SCAN               | skill:scan                   | ディレクトリスキャン     |
| SKILL_GET_IMPORTED       | skill:getImported            | インポート済み取得       |
| SKILL_UPDATE             | skill:update                 | 設定更新                 |
| SKILL_COMPLETE           | skill:complete               | 実行完了イベント         |
| SKILL_ERROR              | skill:error                  | エラーイベント           |
| SKILL_PERMISSION_REQUEST | skill:permission:request     | 権限リクエスト（Main起点）|
| SKILL_PERMISSION_RESPONSE| skill:permission:response    | 権限レスポンス（Renderer応答）|

**ホワイトリスト登録**:

| ホワイトリスト          | 登録チャネル                                                                 |
| ----------------------- | ---------------------------------------------------------------------------- |
| ALLOWED_INVOKE_CHANNELS | `skill:list`, `skill:scan`, `skill:getImported`, `skill:update`, `skill:permission:response` |
| ALLOWED_ON_CHANNELS     | `skill:complete`, `skill:error`, `skill:permission:request`                  |

**チャネル通信方向**:

| チャンネル                  | 方向  | 用途                           |
| --------------------------- | ----- | ------------------------------ |
| `skill:list`                | R→M   | 利用可能なスキル一覧取得       |
| `skill:scan`                | R→M   | スキルディレクトリスキャン     |
| `skill:getImported`         | R→M   | インポート済みスキル一覧取得   |
| `skill:update`              | R→M   | スキル設定更新                 |
| `skill:complete`            | M→R   | スキル実行完了イベント         |
| `skill:error`               | M→R   | スキルエラーイベント           |
| `skill:permission:request`  | M→R   | 権限リクエスト（Main起点）     |
| `skill:permission:response` | R→M   | 権限レスポンス（Renderer応答） |

**テストカバレッジ**: 60テスト（channels.skill-import.test.ts）

---

## Claude Code CLI連携セキュリティ

**実装場所**: `apps/desktop/src/main/claude-cli/`

### コマンドインジェクション防止

| チェック項目       | 実装                                 | 対応                 |
| ------------------ | ------------------------------------ | -------------------- |
| シェル経由実行禁止 | `spawn(cmd, args, { shell: false })` | インジェクション防止 |
| 引数の直接渡し     | 配列形式で引数渡し                   | 文字列連結回避       |
| 環境変数の制限     | 必要な変数のみ渡す                   | 情報漏洩防止         |

**spawn実行時のセキュリティオプション**:

| オプション | 設定値        | 効果                               |
| ---------- | ------------- | ---------------------------------- |
| shell      | false（必須） | シェル経由実行を禁止し、インジェクション防止 |
| cwd        | workingDir    | 作業ディレクトリを明示的に指定     |
| env        | filteredEnv   | 必要な環境変数のみに制限し情報漏洩防止 |

引数は配列形式（例: `["scriptPath", "--arg", "value"]`）で渡し、文字列連結によるインジェクションリスクを排除する。

### Zodスキーマによる入力検証

スクリプト実行リクエストの入力検証スキーマを以下の制約で定義する。

**executeScriptRequestスキーマ**:

| フィールド | 型              | 制約                                       | 必須 |
| ---------- | --------------- | ------------------------------------------ | ---- |
| skillName  | string          | 最小1文字、最大100文字                     | Yes  |
| scriptName | string          | 最小1文字、最大100文字、英数字と`_.-`のみ  | Yes  |
| args       | array of string | 各要素最大1000文字、配列最大50要素         | No   |
| cwd        | string          | 最大500文字                                | No   |
| timeoutMs  | number          | 正の数、最大3,600,000（1時間）             | No   |

scriptNameには正規表現`^[a-zA-Z0-9_.-]+$`を適用し、パストラバーサルやコマンドインジェクションに使用される特殊文字を拒否する。

### リソース制限

| 項目                   | 制限値   | 説明                       |
| ---------------------- | -------- | -------------------------- |
| 最大同時セッション数   | 10       | DoS防止                    |
| デフォルトタイムアウト | 30分     | プロセスハング防止         |
| 出力バッファ最大サイズ | 100MB    | メモリ枯渇防止             |
| 最大引数数             | 50       | コマンドライン長制限       |
| 引数最大長             | 1000文字 | バッファオーバーフロー防止 |

### プロセス終了保証

| 状況                 | 対応                               |
| -------------------- | ---------------------------------- |
| 正常終了             | exitコードを記録                   |
| タイムアウト         | SIGTERM送信 → 3秒待機 → SIGKILL    |
| 明示的終了要求       | SIGTERM送信 → graceful/force選択可 |
| アプリケーション終了 | 全子プロセスを確実に終了           |

**セキュリティテストカバレッジ**: 240テスト中25テストがセキュリティ関連

---

## Skill Execution Preload API セキュリティ

**実装場所**: `apps/desktop/src/preload/skill-api.ts`

### ホワイトリストパターン

| 機能                     | 実装                            | 効果                   |
| ------------------------ | ------------------------------- | ---------------------- |
| チャンネルホワイトリスト | `SKILL_INVOKE_CHANNELS`配列     | 未許可チャンネルを拒否 |
| イベントホワイトリスト   | `SKILL_ON_CHANNELS`配列         | 未許可イベントを拒否   |
| contextBridge            | `exposeInMainWorld('electronAPI', { skill: skillAPI })` | window直接割り当て禁止。TASK-FIX-5-1で`window.skillAPI`廃止→`window.electronAPI.skill`に統一 |
| 型安全性                 | TypeScript + SkillStreamChunk型 | 型チェックによる安全性 |

### スキル実行セキュリティレイヤー

| レイヤー      | 検証内容                           | 実装箇所             |
| ------------- | ---------------------------------- | -------------------- |
| Preload API   | チャンネルホワイトリスト           | skill-api.ts         |
| Main Process  | スキル存在確認、実行権限           | skill-ipc-handler.ts |
| SkillExecutor | 危険パターン、禁止パス、許可ツール | security.ts          |

### React Hook セキュリティ統合

`useSkillExecution` Hookは以下のセキュリティ機能を提供:

| 機能               | 実装                         | 効果             |
| ------------------ | ---------------------------- | ---------------- |
| 自動クリーンアップ | useEffect cleanup            | メモリリーク防止 |
| エラーバウンダリ   | try-catch + setError         | UIクラッシュ防止 |
| 中断処理           | AbortController連携          | リソース解放保証 |
| 状態整合性         | useRef + isExecuting状態管理 | 競合状態防止     |

`useSkillPermission` Hook（TASK-3-1-D）は以下のセキュリティ機能を提供:

| 機能               | 実装                         | 効果               |
| ------------------ | ---------------------------- | ------------------ |
| 自動クリーンアップ | useEffect cleanup            | リスナーリーク防止 |
| エラーハンドリング | try-catch + console.error    | IPC失敗時のUI継続  |
| 状態リセット       | respond後にnullリセット      | 二重応答防止       |
| requestId検証      | リクエストとレスポンス紐付け | 不正応答防止       |

**テストカバレッジ**: 192テスト

---

## Permission IPC Handler セキュリティ

**実装場所**: `apps/desktop/src/main/ipc/permission-handlers.ts`

### IPC sender検証

Permission IPC Handlerでは、ipcMain.handleの第1引数eventオブジェクトを使用してsender検証を行う。

**sender検証フロー**:

| ステップ | 処理内容               | 条件                                         | 結果                     |
| -------- | ---------------------- | -------------------------------------------- | ------------------------ |
| 1        | sender取得             | event.sender                                 | 呼び出し元webContents取得|
| 2        | メインウィンドウ比較   | event.sender === mainWindow.webContents      | 一致すれば続行           |
| 3        | 不一致時の処理         | 上記条件がfalse                              | 警告ログ出力、{ success: false }返却 |

この検証により、メインウィンドウ以外（悪意のあるRenderer Process等）からの不正なPermissionレスポンスを拒否する。

| チェック項目   | 実装                                      | エラー時の挙動            |
| -------------- | ----------------------------------------- | ------------------------- |
| sender一致確認 | `event.sender === mainWindow.webContents` | `{ success: false }` 返却 |
| requestId検証  | `typeof response.requestId === 'string'`  | 無効なリクエスト無視      |
| approved検証   | `typeof response.approved === 'boolean'`  | 無効なリクエスト無視      |

### UIセキュリティ（XSS防止）

| 対策項目        | 実装                        | 効果               |
| --------------- | --------------------------- | ------------------ |
| textContent使用 | `<span>{toolName}</span>`   | HTML注入防止       |
| innerHTML不使用 | dangerouslySetInnerHTML禁止 | スクリプト注入防止 |
| 入力検証        | ツール名・理由の型チェック  | 不正データ表示防止 |

**テストカバレッジ**: 93テスト

---

## SkillAPI Preload実装（TASK-5-1）

**実装場所**: `apps/desktop/src/preload/skill-api.ts`

スキル実行関連のPreload APIインターフェース（SkillAPI）を実装し、Renderer ProcessからMain Processへのセキュアな通信を提供する。

### インターフェース定義

| メソッド               | 戻り値                          | 用途                         |
| ---------------------- | ------------------------------- | ---------------------------- |
| execute                | Promise<SkillExecutionResponse> | スキル実行開始               |
| onStream               | () => void                      | ストリームメッセージ受信購読 |
| abort                  | Promise<void>                   | 実行中断                     |
| getExecutionStatus     | Promise<ExecutionInfo \| null>  | 実行状態取得                 |
| list                   | Promise<SkillMetadata[]>        | 利用可能スキル一覧取得       |
| getImported            | Promise<ImportedSkill[]>        | インポート済みスキル一覧取得 |
| rescan                 | Promise<SkillMetadata[]>        | スキル再スキャン             |
| import                 | Promise<ImportedSkill>          | スキルインポート             |
| remove                 | Promise<RemoveResult>           | スキル削除                   |
| onPermissionRequest    | () => void                      | 権限確認リクエスト購読       |
| sendPermissionResponse | Promise<{ success: boolean }>   | 権限確認応答送信             |

### IPCチャネル定義

| チャネル                    | 方向  | 用途                   | ホワイトリスト          |
| --------------------------- | ----- | ---------------------- | ----------------------- |
| `skill:list`                | R→M   | 利用可能スキル一覧取得 | ALLOWED_INVOKE_CHANNELS |
| `skill:getImported`         | R→M   | インポート済み一覧取得 | ALLOWED_INVOKE_CHANNELS |
| `skill:scan`                | R→M   | スキル再スキャン       | ALLOWED_INVOKE_CHANNELS |
| `skill:import`              | R→M   | スキルインポート       | ALLOWED_INVOKE_CHANNELS |
| `skill:remove`              | R→M   | スキル削除             | ALLOWED_INVOKE_CHANNELS |
| `skill:execute`             | R→M   | スキル実行開始         | ALLOWED_INVOKE_CHANNELS |
| `skill:abort`               | R→M   | 実行中断               | ALLOWED_INVOKE_CHANNELS |
| `skill:get-status`          | R→M   | 実行状態取得           | ALLOWED_INVOKE_CHANNELS |
| `skill:stream`              | M→R   | ストリームメッセージ   | ALLOWED_ON_CHANNELS     |
| `skill:complete`            | M→R   | 実行完了イベント       | ALLOWED_ON_CHANNELS     |
| `skill:error`               | M→R   | 実行エラーイベント     | ALLOWED_ON_CHANNELS     |
| `skill:permission:request`  | M→R   | 権限確認リクエスト     | ALLOWED_ON_CHANNELS     |
| `skill:permission:response` | R→M   | 権限確認応答           | ALLOWED_INVOKE_CHANNELS |

### セキュリティ実装

| 機能                | 実装                                      | 効果                   |
| ------------------- | ----------------------------------------- | ---------------------- |
| safeInvoke パターン | チャネルホワイトリスト検証                | 未許可チャネルを拒否   |
| safeOn パターン     | イベントチャネルホワイトリスト検証        | 未許可イベントを拒否   |
| contextBridge       | `exposeInMainWorld('electronAPI', { skill: skillAPI })` | window直接割り当て禁止。TASK-FIX-5-1で統一 |
| クリーンアップ関数  | ipcRenderer.removeListener呼び出し        | メモリリーク防止       |

**safeInvoke検証フロー**:

| ステップ | 処理内容             | 条件                                      | 結果                 |
| -------- | -------------------- | ----------------------------------------- | -------------------- |
| 1        | チャネル検証         | ALLOWED_INVOKE_CHANNELS.includes(channel) | true: 続行           |
| 2        | 不許可時             | 上記条件がfalse                           | Promise.reject発生   |
| 3        | IPC呼び出し          | 検証通過後                                | ipcRenderer.invoke() |

**safeOn検証フロー**:

| ステップ | 処理内容             | 条件                                   | 結果               |
| -------- | -------------------- | -------------------------------------- | ------------------ |
| 1        | チャネル検証         | ALLOWED_ON_CHANNELS.includes(channel)  | true: 続行         |
| 2        | 不許可時             | 上記条件がfalse                        | 空のクリーンアップ |
| 3        | リスナー登録         | 検証通過後                             | ipcRenderer.on()   |
| 4        | クリーンアップ関数   | 返却値                                 | removeListener呼出 |

### 実装ファイル

| ファイル                                               | 行数 | 内容               |
| ------------------------------------------------------ | ---- | ------------------ |
| `apps/desktop/src/preload/skill-api.ts`                | 144  | SkillAPI実装       |
| `apps/desktop/src/preload/channels.ts`                 | -    | チャネル定義       |
| `apps/desktop/src/preload/index.ts`                    | -    | contextBridge公開  |

**テストカバレッジ**: 67テスト（skill-api.test.ts: 37、skill-api.permission.test.ts: 30）

---

## TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 完了記録（2026-03-19）

**タスク**: SKILL_UPDATE / SKILL_GET_DETAIL IPC層不整合修正

### skill:update バリデーション契約（P42準拠3段バリデーション）

| 検証項目   | 実装                                                                          | エラーコード     |
| ---------- | ----------------------------------------------------------------------------- | ---------------- |
| skillName型 | `typeof skillName !== "string"`                                            | VALIDATION_ERROR |
| 空文字列   | `skillName === ""`                                                          | VALIDATION_ERROR |
| トリム空文字| `skillName.trim() === ""`                                                  | VALIDATION_ERROR |
| updates型  | `typeof updates !== "object" || updates === null || Array.isArray(updates)` | VALIDATION_ERROR |

**引数命名（P45準拠）**: ハンドラ引数は `skillName`（スキル名）と `updates`（更新内容）で統一。`skillId` 命名との乖離なし。

**Preload呼び出し形式**: `safeInvokeUnwrap(IPC_CHANNELS.SKILL_UPDATE, { skillName, updates })` — object payload 標準（P44対策）。

### skill:get-detail / skill:update Preload API 契約同期完了

- `skill:get-detail` / `skill:update` を Preload API から公開し、`safeInvokeUnwrap` 前提へ統一
- `safeInvokeUnwrap` で reject/throw する前提。`null` 返却で隠蔽しない
- 引数: `{ skillId: string }` / `{ skillName: string, updates: Record<string, unknown> }` の object payload（P44対策）
- P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を Main / Preload の両層に実装済み

### 修正ファイル一覧

| ファイル | 変更内容 |
| -------- | -------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | `skill:update` ハンドラ追加、`skill:get-detail` / `skill:update` の P42 バリデーション整合、P45 引数命名統一 |
| `apps/desktop/src/preload/skill-api.ts` | `getDetail()` / `update()` の Preload API 公開（`safeInvokeUnwrap` + 早期バリデーション） |
| `apps/desktop/src/preload/channels.ts` | skill:get-detail を ALLOWED_INVOKE_CHANNELS に追加 |
| `packages/shared/src/ipc/channels.ts` | `SKILL_GET_DETAIL` / `SKILL_UPDATE` の shared channel 定数を追加 |
