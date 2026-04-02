# Electron IPCセキュリティ / detail specification

> 親仕様書: [security-electron-ipc.md](security-electron-ipc.md)
> 役割: detail specification

## 実装例: skillCreatorAPI

**実装場所**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/skill-creator-api.ts`
- 標準 handler: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- runtime helper: `apps/desktop/src/main/ipc/creatorHandlers.ts`
- 共有型: `packages/shared/src/types/skillCreator.ts`

**公開 surface 構成**:

| グループ | 件数 | 代表チャネル | 備考 |
| --- | --- | --- | --- |
| 標準 Skill Creator invoke | 12 | `skill-creator:detect-mode`, `skill-creator:create`, `skill-creator:improve` | TASK-9B-H 系の基盤 |
| runtime public invoke | 3 | `skill-creator:plan`, `skill-creator:execute-plan`, `skill-creator:improve-skill` | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| push | 1 | `skill-creator:progress` | progress 通知 |

runtime public invoke の契約:

| 定数名 | チャンネル名 | request | response |
| --- | --- | --- | --- |
| `SKILL_CREATOR_PLAN` | `skill-creator:plan` | `SkillCreatorPlanRequest` | `IpcResult<RuntimeSkillCreatorPlanResponse>` |
| `SKILL_CREATOR_EXECUTE_PLAN` | `skill-creator:execute-plan` | `SkillCreatorExecutePlanRequest` | `IpcResult<SkillCreatorExecutePlanAck>` |
| `SKILL_CREATOR_IMPROVE_SKILL` | `skill-creator:improve-skill` | `SkillCreatorImproveSkillRequest` | `IpcResult<RuntimeSkillCreatorImproveResponse>` |
| `SKILL_CREATOR_APPLY_IMPROVEMENT` | `skill-creator:apply-improvement` | `{ skillName: string; suggestions: RuntimeSkillCreatorImproveSuggestion[] }` | `IpcResult<ApplyImprovementResult>` |

**セキュリティ検証パターン**:

標準 handler と runtime helper はどちらも `IPC_CHANNELS` + allowlist を前提にし、以下の順序で防御する。

1. **Sender検証**: `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })`
2. **引数バリデーション**:
   - 標準 handler: P42 + `validatePath()` / schema whitelist を用途別に適用
   - runtime helper: `prompt` / `planId` / `skillSpec` / `skillName` / `feedback` に P42 準拠の blank 判定を適用
3. **エラーサニタイズ**: `sanitizeErrorMessage()` で path / token / stack を除去
4. **Graceful Degradation**: `RuntimeSkillCreatorFacade` 未注入時も 3 チャンネルは登録し、`Runtime Skill Creator は現在利用できません` を返す

**runtime helper の戻り値契約**:

| ケース | 挙動 |
| --- | --- |
| sender 検証失敗 | `toIPCValidationError` を throw して reject |
| P42 バリデーション失敗 | `{ success: false, error: string }` |
| service 未注入 | `{ success: false, error: "Runtime Skill Creator は現在利用できません" }` |
| service 例外 | `sanitizeErrorMessage()` 後の文字列を `error` に返す |
| handoff | `{ success: true, data: { type: "terminal_handoff", bundle } }` |

**IPCセキュリティ要件**:

| 要件 | 実装 | 確認方法 |
| --- | --- | --- |
| ホワイトリスト（チャンネル） | `IPC_CHANNELS` + `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` | preload test |
| sender検証 | `validateIpcSender()` | security test |
| 型安全性 | `@repo/shared/types` の request/response 型 | typecheck |
| サンドボックス分離 | contextBridge 経由の `skillCreatorAPI` | preload 実装確認 |
| エラーサニタイズ | `sanitizeErrorMessage()` | path / token 非露出 test |
| runtime service 不在時の動作 | graceful degradation | `creatorHandlers.test.ts` |

`skill-creator:execute-plan` は `{ accepted: true, planId }` ack を正本とし、Renderer の状態更新は `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` snapshot relay へ分離する。

**関連タスク**:

- TASK-9B-H-SKILL-CREATOR-IPC（2026-02-12完了）
- UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001（current branch）

**関連未タスク（UT-9B-H-003教訓反映済み、2026-02-13）**:

| タスクID    | タスク名                                                | 教訓反映内容                   |
| ----------- | ------------------------------------------------------- | ------------------------------ |
| UT-9B-H-001 | IpcResult型の重複定義を@repo/sharedに統一               | L3型整合性、Prettier干渉リスク |
| UT-9B-H-002 | SkillCreator IPCハンドラーの引数検証をZodスキーマに移行 | Zodセキュリティ共存設計        |
| UT-9B-H-004 | SkillCreator設計書-実装整合性修正                       | TDDトレーサビリティ            |
| UT-9B-H-005 | Preload API二重公開パターン統一                         | L3横展開評価                   |

> 上記各未タスクは UT-9B-H-003（SkillCreator IPCセキュリティ強化）の苦戦箇所（lessons-learned.md v1.6.0）を反映済み。実施時にはセキュリティ検証パターン（validatePath/sanitizeErrorMessage/ALLOWED_SCHEMA_NAMES）との整合性を維持すること。

---

### IPC ハンドラライフサイクル管理

#### 二重登録防止パターン（UT-FIX-IPC-HANDLER-DOUBLE-REG-001）

macOS の `activate` イベントでウィンドウを再作成する際、IPC ハンドラの再登録前に
全ハンドラを解除する。

| ステップ | API                                  | 目的                                 |
| -------- | ------------------------------------ | ------------------------------------ |
| 1        | `unregisterAllIpcHandlers()`         | 全チャンネルのハンドラ・リスナー解除 |
| 2        | `createWindow()`                     | 新しい BrowserWindow を作成          |
| 3        | `registerAllIpcHandlers(mainWindow)` | 新しい参照で全ハンドラを再登録       |

**セキュリティ上の注意**: unregister → register の間に極めて短いハンドラ未登録期間が発生するが、ウィンドウが存在しないため Renderer からのリクエストは到達しない。仮にリクエストが到達した場合、`Error: No handler registered` が返され、フェイルセキュアとして機能する。

**Electron API の二重登録挙動の違い**:

| API                | 二重登録時の挙動                      | 解除 API                              |
| ------------------ | ------------------------------------- | ------------------------------------- |
| `ipcMain.handle()` | 例外送出（同一チャンネルに2つ目不可） | `ipcMain.removeHandler(channel)`      |
| `ipcMain.on()`     | 許可（リスナーが複数登録される）      | `ipcMain.removeAllListeners(channel)` |

**Graceful Degradation 戻り値契約**（TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001）:

`registerAllIpcHandlers(mainWindow)` は `IpcHandlerRegistrationResult` を返却する。各 `registerXxxHandlers` を `safeRegister()` で個別 try-catch し、1つの失敗が後続の登録を阻害しない。

| フィールド     | 型                              | 説明                                         |
| -------------- | ------------------------------- | -------------------------------------------- |
| `successCount` | `number`                        | 登録成功したハンドラグループ数               |
| `failureCount` | `number`                        | 登録失敗したハンドラグループ数               |
| `failures`     | `HandlerRegistrationFailure[]`  | 失敗詳細（`handlerName` / `errorMessage` / `errorCode: 4001`） |

**セキュリティ上の考慮**: 失敗したハンドラグループのチャンネルは未登録状態となる。そのチャンネルへの Renderer からのリクエストは `Error: No handler registered` が返され、フェイルセキュアとして機能する。失敗情報は `console.error` でログ出力されるが、ユーザーホーム配下の絶対パスは `~` にマスクして記録する。

#### Graceful Degradation 実装時の苦戦箇所（セキュリティ観点）

| ID | 課題 | セキュリティリスク | 解決策 |
|---|---|---|---|
| SEC-GD-1 | エラーメッセージにユーザーのホームディレクトリパスが含まれる | ログ経由でファイルシステム構造が漏洩する可能性 | `sanitizeRegistrationErrorMessage()` で `os.homedir()` パスを `~` にマスク。`escapeRegExp()` で正規表現メタ文字をエスケープ後にパターン生成 |
| SEC-GD-2 | `safeRegister` の失敗情報が `IpcHandlerRegistrationResult.failures` に蓄積される | 失敗情報に機密パスや内部構造が含まれる可能性 | 全失敗メッセージを `sanitizeRegistrationErrorMessage()` 経由で正規化してから `failures` 配列に格納 |
| SEC-GD-3 | 部分的なハンドラ登録失敗時に、未登録チャネルへの IPC 呼び出しが発生する | 未登録チャネルへの `ipcMain.handle` 呼び出しは「No handler registered」エラーを返すが、Renderer 側でのエラーハンドリングが必要 | Renderer 側の `safeInvoke` パターンが未登録チャネルエラーもキャッチするため、フェイルセキュア原則を維持 |

#### 同種課題向け4ステップ手順

1. **パスマスク**: エラーログに含まれるファイルパスを `sanitize` 関数で正規化する
2. **メタ文字エスケープ**: `os.homedir()` 等のパスを正規表現に使う前に `escapeRegExp()` を適用する
3. **フェイルセキュア確認**: ハンドラ未登録時に Renderer 側のエラーハンドリングが機能することを確認する
4. **ログレベル制御**: Infrastructure Error (4001) のログ出力を `electron-log` の `warn` レベルに制限し、ユーザーコンソールへの不要な出力を抑制する

**関連未タスク（TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 から派生）**:

| タスクID | 概要 | 優先度 | 指示書パス |
|---|---|---|---|
| UT-IMP-IPC-ERROR-SANITIZE-COMMON-001 | sanitizeErrorMessage の IPC ハンドラ横断共通化 | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-ipc-error-sanitize-common.md` |

**関連未タスク（UT-FIX-IPC-HANDLER-DOUBLE-REG-001 から派生）**:

| タスクID                             | タスク名                                             | 優先度 |
| ------------------------------------ | ---------------------------------------------------- | ------ |
| task-sec-ipc-lifecycle-audit-001     | Electron ライフサイクルイベント IPC リスナー管理監査 | 中     |
| task-imp-ipc-registration-verify-001 | IPC ハンドラ登録整合性自動検証テスト                 | 中     |

#### AUTH IPC登録一元化パターン（UT-IPC-AUTH-HANDLE-DUPLICATE-001）

`AUTH_*` 5チャネルの `ipcMain.handle` 登録は、以下の2箇所で宣言的に集約する。

| 対象                         | 実装方針                                            | セキュリティ要件                            |
| ---------------------------- | --------------------------------------------------- | ------------------------------------------- |
| 通常経路（Supabaseあり）     | `authHandlers.ts` で共通登録ヘルパーを経由して登録  | `withValidation` を必須適用                 |
| fallback経路（Supabaseなし） | `ipc/index.ts` で fallback ハンドラ配列をループ登録 | 既存エラー契約（`AUTH_ERROR_CODES.AUTH_NOT_CONFIGURED` / `auth/not-configured`）を維持 |

検証基準:

- 5チャネル（login/logout/get-session/refresh/check-online）が過不足なく登録される
- `IPC_CHANNELS.AUTH_*` を直接 `ipcMain.handle` に重複記述しない
- 既存戻り値・エラーコードを変更しない

#### Profile / Avatar fallback 登録パターン（TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001）

Supabase 未設定時に `profile:*` / `avatar:*` の handler が未登録だと Renderer 側で `No handler registered` が発生するため、Auth と同様に fallback 登録を行う。

推奨実装は、shared error code 定義を参照する `createNotConfiguredResponse()` と、`ReadonlyArray` を登録する `registerFallbackHandlers()` を介した宣言的構成とする。

| 対象 | 実装方針 | セキュリティ要件 |
| ---- | -------- | ---------------- |
| `profile:*` 11チャネル | `registerProfileFallbackHandlers()` で `ReadonlyArray` をループ登録 | `success: false` の error envelope に正規化し、内部情報を返さない |
| `avatar:*` 3チャネル | `registerAvatarFallbackHandlers()` で `ReadonlyArray` をループ登録 | 通常経路と if/else 排他にし、二重登録を防ぐ |

検証基準:

- `channels.ts` の Profile 11 / Avatar 3 定義と fallback 配列件数が一致する
- `registerAllIpcHandlers()` の if/else 分岐で通常経路と fallback 経路が排他的である
- Renderer / Preload 側が `success: false` を安全に扱える

#### 実装時の苦戦箇所（TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001）

| 苦戦箇所 | 再発条件 | 解決策 | 標準ルール |
| --- | --- | --- | --- |
| fallback 登録自体は安全でも、画面検証が不安定で問題露出を見落とす | App shell の初期化ノイズで対象エラー状態へ安定到達できない | 専用 harness で対象 view を直描画し、security 観点では `public contract` を維持したまま証跡を取る | 画面検証要求がある IPC タスクでは screenshot と contract test をセットで実施する |
| `error.message` を安全な transport 文言にしても UI 一貫性までは保証できない | Renderer が `error.code` を捨てて英語 message を直接表示する | Main では内部情報を出さない envelope を返し、UI 側の localized mapping 不足は未タスク化して追跡する | セキュリティ完了と UX 完了は別軸で管理し、責務を混同しない |

---

## 実装例: skillFileAPI（TASK-9A-B）

**実装場所**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/skill-api.ts`（`electronAPI.skill` のメソッドとして公開）
- ハンドラー: `apps/desktop/src/main/ipc/skillFileHandlers.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

**チャンネルホワイトリスト方式**:

`SKILL_FILE_CHANNELS`定数として、許可されたIPCチャンネルのみを定義する。invoke用7チャンネルを管理する。

| 定数名               | チャンネル名          | 用途                 |
| -------------------- | --------------------- | -------------------- |
| SKILL_READ_FILE      | `skill:readFile`      | ファイル読み込み     |
| SKILL_WRITE_FILE     | `skill:writeFile`     | ファイル書き込み     |
| SKILL_CREATE_FILE    | `skill:createFile`    | ファイル新規作成     |
| SKILL_DELETE_FILE    | `skill:deleteFile`    | ファイル削除         |
| SKILL_LIST_BACKUPS   | `skill:listBackups`   | バックアップ一覧取得 |
| SKILL_RESTORE_BACKUP | `skill:restoreBackup` | バックアップ復元     |
| SKILL_GET_FILE_TREE  | `skill:getFileTree`   | ファイルツリー取得   |

**実装場所**: `apps/desktop/src/preload/channels.ts`

**セキュリティ検証パターン（4層防御）**:

全7 invokeハンドラーで以下のセキュリティ検証を実施する:

1. **Sender検証**: `validateIpcSender(event, mainWindow)` で送信元BrowserWindowを検証。DevToolsからの呼び出しを検出・拒否
2. **引数バリデーション**: `typeof` 文字列チェック + `.trim()` による空文字列検出
3. **SkillFileManager内部検証**: `SkillFileManager.validatePath()` によるパストラバーサル/NULLバイト検出（`PathTraversalError`）
4. **エラーサニタイズ**: `isKnownSkillFileError(error)` でSkillFileManagerエラーを識別し安全なエラーメッセージを返却

**エラーサニタイズ仕様（isKnownSkillFileErrorパターン）**:

| 入力パターン             | 返却メッセージ                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------ |
| 引数バリデーションエラー | 各ハンドラー定義の英語エラーメッセージ（例: `skillName must be a non-empty string`） |
| `PathTraversalError`     | `"Path traversal detected: <path>"`                                                  |
| `SkillNotFoundError`     | `"Skill not found: <skillName>"`                                                     |
| `ReadonlySkillError`     | `"Cannot modify readonly skill: <skillName>"`                                        |
| `FileExistsError`        | `"File already exists: <relativePath>"`                                              |
| `FileNotFoundError`      | `"File not found: <relativePath>"`                                                   |
| Sender検証失敗           | `toIPCValidationError` で返却されるメッセージ（例: `"Unauthorized IPC call"`）       |
| 不明なエラー             | `"Internal error"`                                                                   |

**IPCセキュリティ要件**:

| 要件                         | 実装                                    | 確認方法                           |
| ---------------------------- | --------------------------------------- | ---------------------------------- |
| ホワイトリスト（チャンネル） | `SKILL_FILE_CHANNELS`定数で管理         | 定義外チャンネルはエラー           |
| sender検証                   | `validateIpcSender()`                   | DevTools/外部からの拒否            |
| 型安全性                     | `IpcResult<T>`型で統一                  | TypeScript型チェック               |
| サンドボックス分離           | contextBridgeで公開                     | contextIsolation=true              |
| 引数検証                     | 各ハンドラーでtypeof + `.trim()`        | 空文字列/非文字列入力テスト        |
| パストラバーサル防止         | SkillFileManager内部の `validatePath()` | `PathTraversalError` スロー確認    |
| エラーサニタイズ             | `isKnownSkillFileError()` で識別返却    | スタック/パス/機密情報非露出テスト |

**テストカバレッジ**: skillFileAPI 関連 155テスト全PASS（2026-03-03、IPC/Service/Preload/Renderer）

**関連タスク**: TASK-9A-B（2026-02-19完了）, UT-UI-05A-GETFILETREE-001（2026-03-03完了）

**関連未タスク（TASK-9A-B Phase 12 検出）**:

| タスクID    | タスク名                                | 優先度 | 関連箇所                         |
| ----------- | --------------------------------------- | ------ | -------------------------------- |
| UT-9A-B-001 | IPC入力バリデーション標準化             | 中     | 引数バリデーションパターンの統一 |
| UT-9A-B-002 | IPCエラーサニタイズ共通ユーティリティ化 | 中     | isKnownSkillFileError の共通化   |

> 上記未タスクは skillFileHandlers.ts のバリデーション・エラーサニタイズパターンを他のIPCハンドラー（skillCreatorHandlers.ts 等）に横展開するための改善タスク。

---

## 実装例: skillShareAPI（TASK-9F）

スキル共有（インポート／エクスポート／ソース検証）の3チャネルに適用するセキュリティパターン。

### チャネル定数定義

| 定数名                   | チャネル名               | 方向         |
| ------------------------ | ------------------------ | ------------ |
| SKILL_IMPORT_FROM_SOURCE | `skill:importFromSource` | invoke (R→M) |
| SKILL_EXPORT             | `skill:export`           | invoke (R→M) |
| SKILL_VALIDATE_SOURCE    | `skill:validateSource`   | invoke (R→M) |

### セキュリティ検証4層構造

| 層                          | 検証項目                                                  | 実装                                                                                   | 返却仕様                                                             |
| --------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1. Sender検証               | 送信元ウィンドウの正当性                                  | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })`         | 不正時: `toIPCValidationError(validation)` + `errorCode: "ERR_2004"` |
| 2. 構造バリデーション       | 引数がプレーンオブジェクトであること                      | `isPlainObject(value)` — `typeof === "object"` かつ `!== null` かつ `!Array.isArray()` | 不正時: `{ success: false, error: { code: "VALIDATION_ERROR" } }`    |
| 3. P42準拠3段バリデーション | 文字列フィールドの型・空文字列・trim空文字列              | `validateStringField(value, fieldName)`                                                | 不正時: バリデーションエラー                                         |
| 4. 許可値チェック           | source.type / destination.type が定義済み値に含まれること | `ALLOWED_SOURCE_TYPES.includes()` / `ALLOWED_DESTINATION_TYPES.includes()`             | 不正時: バリデーションエラー                                         |

### TASK-10A-E-A 追補: エラーコード整合

| 経路                | code               | errorCode  | セキュリティ意図                             |
| ------------------- | ------------------ | ---------- | -------------------------------------------- |
| 構造/P42/許可値違反 | `VALIDATION_ERROR` | `ERR_1001` | 不正入力を業務処理前に遮断                   |
| sender検証失敗      | `IPC_UNAUTHORIZED` | `ERR_2004` | 未許可window/DevTools経路を遮断              |
| unknown例外         | `INTERNAL_ERROR`   | `ERR_5001` | 内部情報を露出せず `Internal error` へ正規化 |

### TASK-10A-E-A 実装時の苦戦箇所（セキュリティ観点）

| 苦戦箇所                               | 再発条件                                                  | 解決策                                             | 標準ルール                                                      |
| -------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| sender検証より先に構造/P42検証を実行   | unauthorized 呼び出しが validation 系エラーへ誤分類される | `validateIpcSender` を1層目へ固定                  | セキュリティ検証順序は `sender -> 構造 -> P42 -> 許可値` を固定 |
| `code` と `errorCode` の責務境界が曖昧 | 返却値はあるが監査で契約不一致と判定される                | `code`（分類）/`errorCode`（追跡ID）を別列で仕様化 | エラー仕様は二軸同時更新を必須化                                |
| Step 2 判定後の仕様同期漏れ            | セキュリティ仕様更新済みでも成果物が「更新なし」で残る    | Step 2 実施時に summary/changelog を同時更新       | Step 2 完了条件に「2成果物同値化」を追加                        |

### 同種課題の簡潔解決手順（TASK-10A-E-A / 5ステップ）

1. チャネルごとの検証順序を `sender -> 構造 -> P42 -> 許可値` で固定する。
2. `code` と `errorCode` を分離し、3分類（`ERR_1001/2004/5001`）を先に決める。
3. Main/Preload/3仕様書（security/api-ipc/interfaces）の契約文言を同一ターンで同期する。
4. `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` を連続実行する。
5. Step 2 記録を `spec-update-summary` と `documentation-changelog` で同値に確定する。

### 許可値リスト

| フィールド         | 許可値                                   |
| ------------------ | ---------------------------------------- |
| `source.type`      | `"github"`, `"gist"`, `"url"`, `"local"` |
| `destination.type` | `"gist"`, `"local"`                      |

### チャネル別バリデーション詳細

| チャネル                 | バリデーション項目                                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `skill:importFromSource` | source オブジェクト検証 → source.type P42 3段 → source.type 許可値 → github時 repo 長さ制限（MAX_STRING_LENGTH: 10000）                      |
| `skill:export`           | args オブジェクト検証 → args.skillName P42 3段 → args.destination オブジェクト検証 → args.destination.type P42 3段 → destination.type 許可値 |
| `skill:validateSource`   | source オブジェクト検証 → source.type P42 3段                                                                                                |

### 実装時の苦戦箇所（TASK-9F）

| 苦戦箇所                       | 問題                                                                       | 解決策                                                                               |
| ------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Sender検証と構造検証の適用順序 | 先に構造検証を行うと unauthorized 呼び出しでも内部エラーパターンが混在する | `validateIpcSender` を最初に適用し、その後 `isPlainObject` / P42検証へ進む順序に固定 |
| P42 3段バリデーションの漏れ    | 一部フィールドで `trim()` 条件を見落とし、空白入力が通過しうる             | `validateStringField` 共通関数へ集約し、全3チャネルで同一関数を使用                  |
| 未タスク化の遅延               | セキュリティ改善候補が台帳未登録だと再発防止が弱い                         | Phase 10 MINOR を UT-9F 系へ変換し、`task-workflow.md` 残課題へ即時登録              |

### 同種課題の簡潔解決手順（4ステップ）

1. セキュリティ検証順序を `sender -> 構造 -> P42 -> 許可値` の固定パイプラインにする。
2. 文字列検証は共通関数化し、チャネルごとの差分をなくす。
3. セキュリティ改善項目は完了判定に混在させず、未タスクへ分離して追跡する。
4. 仕様更新後に `verify-unassigned-links` と `audit --diff-from HEAD` で台帳整合を確認する。

**関連タスク**: TASK-9F（2026-02-27完了）, TASK-10A-E-A（2026-03-05完了）

---

## 実装例: skillChainAPI（TASK-9D）

スキルチェーン（一覧取得・定義取得・保存・削除・実行）の5チャネルに適用するセキュリティパターン。

### チャネル定数定義

| 定数名              | チャネル名            | 方向          |
| ------------------- | --------------------- | ------------- |
| SKILL_CHAIN_LIST    | `skill:chain:list`    | invoke (R->M) |
| SKILL_CHAIN_GET     | `skill:chain:get`     | invoke (R->M) |
| SKILL_CHAIN_SAVE    | `skill:chain:save`    | invoke (R->M) |
| SKILL_CHAIN_DELETE  | `skill:chain:delete`  | invoke (R->M) |
| SKILL_CHAIN_EXECUTE | `skill:chain:execute` | invoke (R->M) |

### バリデーションルール

| チャネル              | バリデーション                                           |
| --------------------- | -------------------------------------------------------- |
| `skill:chain:list`    | Sender 検証のみ                                          |
| `skill:chain:get`     | `chainId` P42準拠3段バリデーション                       |
| `skill:chain:save`    | `chain` が object、`chain.name` P42準拠3段バリデーション |
| `skill:chain:delete`  | `chainId` P42準拠3段バリデーション                       |
| `skill:chain:execute` | `args` が object、`chainId` P42準拠3段バリデーション     |

### セキュリティ対策一覧

| skill:chain:list | skill:chain:get | skill:chain:save | skill:chain:delete | skill:chain:execute |
| ---------------- | --------------- | ---------------- | ------------------ | ------------------- |
| OK               | OK              | OK               | OK                 | OK                  |

全5ハンドラに以下を適用:

- `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })`
- P42準拠3段バリデーション（`validateStringArg` ヘルパー）
- エラーサニタイズ: `sanitizeErrorMessage(error)` → "Internal error"

**関連タスク**: TASK-9D

---

## 実装例: skillScheduleAPI（TASK-9G）

スキルスケジュール（一覧取得・追加・更新・削除・有効/無効切替）の5チャネルに適用するセキュリティパターン。

### チャネル定数定義

| 定数名                | チャネル名              | 方向          |
| --------------------- | ----------------------- | ------------- |
| SKILL_SCHEDULE_LIST   | `skill:schedule:list`   | invoke (R->M) |
| SKILL_SCHEDULE_ADD    | `skill:schedule:add`    | invoke (R->M) |
| SKILL_SCHEDULE_UPDATE | `skill:schedule:update` | invoke (R->M) |
| SKILL_SCHEDULE_DELETE | `skill:schedule:delete` | invoke (R->M) |
| SKILL_SCHEDULE_TOGGLE | `skill:schedule:toggle` | invoke (R->M) |

### バリデーションルール

| チャネル                | バリデーション                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `skill:schedule:list`   | Sender 検証のみ                                                                                                           |
| `skill:schedule:add`    | `skillName`/`prompt` P42準拠3段バリデーション、`schedule.type` 必須、cron 時は `cronExpression` 非空、interval 時は正の数 |
| `skill:schedule:update` | `id` P42準拠3段バリデーション                                                                                             |
| `skill:schedule:delete` | `id` P42準拠3段バリデーション                                                                                             |
| `skill:schedule:toggle` | `id` P42準拠3段バリデーション + 存在確認                                                                                  |

### セキュリティ対策一覧

| skill:schedule:list | skill:schedule:add | skill:schedule:update | skill:schedule:delete | skill:schedule:toggle |
| ------------------- | ------------------ | --------------------- | --------------------- | --------------------- |
| OK                  | OK                 | OK                    | OK                    | OK                    |

全5ハンドラに以下を適用:

- `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })`
- P42準拠3段バリデーション（`validateStringArg` ヘルパー）
- エラーサニタイズ: `toIpcErrorResponse(error)` → "Internal error"

**関連タスク**: TASK-9G（2026-02-27完了）

---
