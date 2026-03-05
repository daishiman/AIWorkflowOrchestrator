# Electron IPCセキュリティ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [security-api-electron.md](./security-api-electron.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                       |
| ---------- | ---------- | ---------------------------------------------- |
| v1.12.3    | 2026-03-05 | TASK-UI-01-STORE-IPC-ARCHITECTURE 反映: `history:search/get-stats` と `notification:*` のセキュリティ契約を追加。`validateIpcSender` + P42検証 + `sanitizeErrorMessage` の適用境界を `historyAPI` セクションへ統合 |
| v1.12.2    | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: `skill:execute` の認証失敗コード伝搬（`errorCode`）と Renderer 側 preflight ガード（`auth-key:exists`）の運用境界を追加。実行前停止と sender検証順序の整合を明文化 |
| v1.12.1    | 2026-03-03 | UT-UI-05A-GETFILETREE-001 完了同期: skillFileAPI セクションを `skill:getFileTree` 含む 7 invoke チャネルへ更新。ホワイトリスト/4層防御/エラーサニタイズの適用範囲を拡張し、関連タスクを TASK-9A-B + UT-UI-05A-GETFILETREE-001 に更新 |
| v1.12.0    | 2026-03-02 | TASK-UI-05B仕様整合: skillChainAPI（TASK-9D、5ch、validateIpcSender + P42準拠3段バリデーション + sanitizeErrorMessage）とskillScheduleAPI（TASK-9G、5ch、既存セクション欠落の補完）のセキュリティ実装パターンを追加 |
| v1.11.1    | 2026-02-28 | TASK-9E追補: セキュリティ観点の苦戦箇所3件（sender検証順序、path境界判定、契約境界混同）と同種課題向け4ステップ手順を追加 |
| v1.11.0    | 2026-02-28 | TASK-9E反映: `skill:fork` セキュリティ実装パターンを追加。`validateIpcSender`、P42準拠3段バリデーション、`SkillForker.validatePath` の境界検証（prefix一致すり抜け防止）、エラーサニタイズを仕様化 |
| v1.10.0    | 2026-02-27 | TASK-9H反映: skillDebugAPI セキュリティ実装パターン追加（validateIpcSender + P42準拠3段バリデーション + vmサンドボックス式評価 + セッションID整合検証）。7チャネル（invoke 6 + event 1）を仕様化 |
| v1.11.0    | 2026-02-28 | TASK-9I反映: skillDocsAPI セキュリティ実装パターン追加（sender 検証 + P42準拠3段バリデーション + 許可値チェック + パストラバーサル二重防御 + エラー正規化）。4チャンネル、64テストPASS |
| v1.11.1    | 2026-02-28 | TASK-9J追補: 「実装時の苦戦箇所」セクションを追加。P42検証分散・許可値チェック漏れ・内部エラー露出リスクの再発防止ルールを明文化 |
| v1.11.0    | 2026-02-28 | TASK-9J反映: skillAnalyticsAPI セキュリティ実装パターン追加（validateIpcSender + validateStringArg共通化 + 許可値リスト + toIpcErrorResponse正規化）。5チャンネル、37テストPASS |
| v1.10.0    | 2026-02-27 | TASK-9G反映: skillScheduleAPI セキュリティ実装パターン追加（sender 検証 + P42準拠3段バリデーション + schedule種別ごとの必須検証 + 内部エラー正規化）。5チャンネル、163テストPASS（desktop 158 + shared 5） |
| v1.9.0     | 2026-02-27 | TASK-9F反映: skillShareAPIセキュリティ実装パターン追加（validateIpcSender + isPlainObject構造検証 + P42準拠3段バリデーション + 許可値チェック）。3チャンネル、92テスト全PASS |
| v1.8.0     | 2026-02-25 | UT-IPC-AUTH-HANDLE-DUPLICATE-001反映: AUTH IPC登録一元化パターンを追加。重複登録式の宣言的集約と fallback 経路の追跡性維持を明文化 |
| v1.7.0     | 2026-02-21 | 契約ドリフト防止（P44/P45対策）セクション追加: ipc-contract-checklist.md参照・3箇所同時更新ルール・3段バリデーション検証テーブルを明文化 |
| v1.6.0     | 2026-02-21 | UT-FIX-SKILL-IMPORT-INTERFACE-001反映: Skill API（`skill:import`/`skill:remove`）の引数検証パターンを `skillName` 非空文字列（`trim()`含む）へ統一し、契約ドリフト対策を明文化 |
| v1.5.0     | 2026-02-19 | TASK-9A-B: skillFileAPIセキュリティ実装パターン追加（validateIpcSender + 引数バリデーション + SkillFileManager内部検証 + isKnownSkillFileErrorエラーサニタイズ）。6チャンネル、65テスト全PASS |
| v1.4.0     | 2026-02-14 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラライフサイクル管理セクション追加（二重登録防止パターン） |
| v1.3.1     | 2026-02-12 | UT-9B-H-003仕様追補: skillCreatorHandlers.ts 実装に合わせ、エラーサニタイズ仕様（既定文言/パス・機密情報マスク）と schemaName ホワイトリスト検証の返却値を明記 |
| v1.3.0     | 2026-02-12 | UT-9B-H-003: SkillCreator IPCセキュリティ強化完了。validatePath（パストラバーサル防止）、sanitizeErrorMessage（内部情報漏洩防止）、ALLOWED_SCHEMA_NAMES（スキーマ名ホワイトリスト）追加。116テスト全PASS |
| v1.2.0     | 2026-02-12 | TASK-9B-H: skillCreatorAPIセキュリティ実装例追加。6チャンネル、Sender検証、エラーサニタイズ仕様 |
| v1.1.0     | 2026-01-26 | コードブロックを表形式・文章に変換（ガイドライン準拠） |
| v1.0.0     | -          | 初版作成                                       |

---

## セキュリティ設定

**BrowserWindow設定の必須項目**:

| 設定                        | 推奨値 | 理由                               |
| --------------------------- | ------ | ---------------------------------- |
| nodeIntegration             | false  | Rendererからのシステムアクセス防止 |
| contextIsolation            | true   | preloadスクリプトの分離            |
| sandbox                     | true   | Chromiumサンドボックスの有効化     |
| webSecurity                 | true   | Same-Originポリシーの強制          |
| allowRunningInsecureContent | false  | HTTP上のコンテンツ実行防止         |

---

## Content Security Policy (CSP)

**実装場所**: `apps/desktop/src/main/infrastructure/security/csp.ts`

| 環境 | script-src                           | unsafe-eval | 用途               |
| ---- | ------------------------------------ | ----------- | ------------------ |
| 本番 | 'self'                               | 禁止        | 厳格なセキュリティ |
| 開発 | 'self' 'unsafe-inline' 'unsafe-eval' | 許可        | HMR対応            |

**共通設定**:

- `object-src 'none'`: プラグイン無効化
- `frame-ancestors 'none'`: クリックジャッキング対策
- `upgrade-insecure-requests`: HTTP→HTTPS自動変換

---

## IPC通信のセキュリティ

**preloadスクリプトでのAPI公開**:

- contextBridgeを使用して限定的なAPIのみ公開する
- チャンネル名はホワイトリストで管理する
- 引数のバリデーションをMain側で実施する
- センシティブな操作にはユーザー確認ダイアログを表示する

**IPC sender検証**:

**実装場所**: `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`

1. webContentsに対応するBrowserWindowの存在確認
2. DevToolsからの呼び出し検出・拒否
3. 許可されたウィンドウリストとの照合

**禁止事項**:

- ipcRenderer全体の公開
- nodeモジュールの直接公開
- ファイルシステムへの無制限アクセス
- シェルコマンドの無制限実行

### Skill API 引数検証パターン（UT-FIX-SKILL-IMPORT-INTERFACE-001）

`skill:import` / `skill:remove` は Renderer から単一文字列 `skillName` を受け取る契約に統一する。

| チャンネル | 検証条件 | エラー |
| --- | --- | --- |
| `skill:import` | `typeof skillName === "string"` かつ `skillName.trim() !== ""` | `VALIDATION_ERROR` / `skillName must be a non-empty string` |
| `skill:remove` | `typeof skillName === "string"` かつ `skillName.trim() !== ""` | `VALIDATION_ERROR` / `skillName must be a non-empty string` |

補足:
- 検証は Main ハンドラーで実施し、Preload/Renderer の呼び出し契約と一致させる。
- 旧形式（`{ skillIds: string[] }` / `{ skillId: string }`）は受け付けない。

#### 契約ドリフト防止（P44/P45対策）

IPC ハンドラの引数形式が Preload 側と乖離する「契約ドリフト」を防止するため：

- 新規ハンドラ作成時: [ipc-contract-checklist.md](./ipc-contract-checklist.md) Phase 1-6 を実施
- 引数形式変更時: P23/P32 準拠で3箇所同時更新（ハンドラ・Preload API・テスト）
- バリデーション: P42準拠3段バリデーション必須

| 検証項目 | 確認方法 |
|---------|---------|
| 引数形式一致 | ハンドラ型定義 vs Preload `safeInvoke` 呼び出し |
| 引数名セマンティクス | 実際の値が `skillId` か `skillName` か確認 |
| バリデーション網羅 | `typeof` + `=== ""` + `.trim() === ""` の3段 |

---

### Skill Fork API セキュリティパターン（TASK-9E）

`skill:fork` は Skill API ドメインのフォーク専用チャネルとして実装する。`skill-creator:fork` と混同せず、送信元検証・入力検証・パス境界検証を多層で適用する。

| セキュリティ観点 | 実装 | 確認ポイント |
| --- | --- | --- |
| Sender検証 | `validateIpcSender(event, IPC_CHANNELS.SKILL_FORK, { getAllowedWindows: () => [mainWindow] })` | DevTools/未許可windowからの呼び出し拒否 |
| 入力検証（P42） | `sourceSkill`/`newName` は `typeof` + 空文字 + `trim()` 3段検証、`copy*` は boolean、`modifyAllowedTools` は非空文字列配列 | IPC契約とPreload契約の一致 |
| サービス境界検証 | `SkillForker.validatePath()` で `path.relative` ベースの境界判定を実施（`/skills` と `/skills-evil` の prefix 衝突を拒否） | パストラバーサル/境界外書き込み防止 |
| 例外情報保護 | `sanitizeErrorMessage(error)` で内部パス/スタック情報をマスクして返却 | 機密情報・内部構造の漏洩防止 |
| ハンドラー解除 | `unregisterSkillHandlers()` で `removeHandler(IPC_CHANNELS.SKILL_FORK)` を実施 | 再登録時の重複ハンドラ防止 |

### 実装時の苦戦箇所（TASK-9E）

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| sender検証順序のばらつき | 入力検証を先に行うと unauthorized 呼び出しでも内部エラー系の返却が混在した | `validateIpcSender` を最初に固定し、その後に P42 検証を適用 |
| path境界判定のすり抜け | `startsWith` 判定だけでは `/skills-evil` を境界内と誤判定しうる | `path.relative` による境界判定へ統一し、仕様書にも境界検証方式を明記 |
| `skill:fork` / `skill-creator:fork` 混同 | 類似チャネル名によりレビュー時の対象範囲がぶれた | Security/API/Interface の3仕様で責務境界を同時追記し、契約を分離管理 |

### 同種課題の簡潔解決手順（4ステップ）

1. セキュリティ検証順序を `sender -> P42 -> 境界検証 -> サニタイズ` で固定する。  
2. path検証は prefix 比較を避け、`path.relative` で境界判定する。  
3. 近似チャネルは責務境界表を API/Interface/Security に同時反映する。  
4. 仕様更新後にセキュリティ系テストと `verify-all-specs` を連続実行する。  

---

## 実装例: historyAPI / notificationAPI（TASK-UI-01）

**実装場所**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- preload API: `apps/desktop/src/preload/api/notification-api.ts`
- preload統合: `apps/desktop/src/preload/index.ts`
- Mainハンドラー: `apps/desktop/src/main/ipc/historySearchHandlers.ts`, `apps/desktop/src/main/ipc/notificationHandlers.ts`
- エラーサニタイズ: `apps/desktop/src/main/ipc/sanitizeErrorMessage.ts`

### 対象チャンネル

| 種別 | チャンネル | 用途 |
| --- | --- | --- |
| history | `history:search` | 履歴検索 |
| history | `history:get-stats` | 履歴統計 |
| notification | `notification:get-history` | 通知履歴取得 |
| notification | `notification:mark-read` | 通知既読化 |
| notification | `notification:mark-all-read` | 通知全既読化 |
| notification | `notification:clear` | 通知履歴削除 |
| notification | `notification:new` | Main -> Renderer のイベント通知 |

### セキュリティ要件

| 要件 | 実装 | 確認方法 |
| --- | --- | --- |
| sender検証 | `validateIpcSender(event, channel, { getAllowedWindows })` | 不正送信元で `IPC_FORBIDDEN/UNAUTHORIZED` を返却 |
| invoke/on ホワイトリスト | `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` | `channels.ui-01-store-ipc-architecture.test.ts` |
| P42 入力検証 | `notificationId`, `query` を `typeof -> 空文字 -> trim` で検証 | handler テストで異常系確認 |
| 許可値検証 | `filter` を `all/chat/file/skill` へ制限 | invalid filter で `VALIDATION_ERROR` |
| エラー情報保護 | `sanitizeErrorMessage` でパス/スタック/機密値をマスク | 異常系テスト + 手動確認 |

### 実装時の補足

- `notification:new` はイベント専用のため `ALLOWED_ON_CHANNELS` のみ許可する。
- `history:search` は空/空白クエリを「全件検索」として許容し、`filter` のみ厳格に制限する。
- ハンドラー登録は `registerAllIpcHandlers` から一元実行し、未登録による機能未有効化を防止する。

---

## 実装例: slideSettingsAPI

**実装場所**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- preload: `apps/desktop/src/preload/index.ts`
- Store: `apps/desktop/src/main/settings/slideSettingsStore.ts`
- ハンドラー: `apps/desktop/src/main/ipc/slideSettingsHandlers.ts`

**パストラバーサル防止の実装**:

悪意あるパス入力を検出するため、`detectPathTraversal`関数を実装する。入力パスをUnicode正規化（NFC）およびURLデコードした上で、既知の攻撃パターンと照合する。

**検出対象パターン**:

| パターン    | 説明                           |
| ----------- | ------------------------------ |
| `..`        | 基本的な親ディレクトリ参照     |
| `%2e%2e`    | URLエンコードされた`..`        |
| `%2e.`      | 部分エンコード（前半）         |
| `.%2e`      | 部分エンコード（後半）         |
| `..%c0%af`  | UTF-8オーバーロング表現        |
| `\0`        | NULLバイトインジェクション     |

**処理フロー**:

1. 入力パスをUnicode NFC正規化
2. URLデコードを実行
3. 両方の形式でパターン照合
4. いずれかにマッチした場合は`true`を返却（攻撃検出）

**実装場所**: `apps/desktop/src/main/settings/slideSettingsStore.ts`

**IPCセキュリティ要件**:

| 要件             | 実装                          | 確認方法                 |
| ---------------- | ----------------------------- | ------------------------ |
| ホワイトリスト   | `SLIDE_SETTINGS_CHANNELS`定数 | 定義外チャンネルはエラー |
| sender検証       | `validateIpcSender()`         | DevTools/外部からの拒否  |
| パストラバーサル | `detectPathTraversal()`       | 32テストケースで検証     |
| 書き込み権限     | `fs.accessSync(W_OK)`         | 権限なしパスでエラー     |
| Unicode正規化    | `normalize("NFC")`            | Unicode攻撃パターン検出  |

**テストカバレッジ**: 156テスト（94.30% Line Coverage）

**関連タスク**: slide-directory-settings（2026-01-14完了）

---

## 実装例: skillCreatorAPI

**実装場所**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/skill-creator-api.ts`
- ハンドラー: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

**チャンネルホワイトリスト方式**:

`SKILL_CREATOR_CHANNELS`定数として、許可されたIPCチャンネルのみを定義する。invoke用5チャンネル、on用1チャンネルの計6チャンネルを管理する。

| 定数名                        | チャンネル名                    | 用途             | ホワイトリスト   |
| ----------------------------- | ------------------------------- | ---------------- | ---------------- |
| SKILL_CREATOR_DETECT_MODE     | `skill-creator:detect-mode`     | モード自動判定   | ALLOWED_INVOKE   |
| SKILL_CREATOR_CREATE          | `skill-creator:create`          | スキル新規作成   | ALLOWED_INVOKE   |
| SKILL_CREATOR_EXECUTE_TASKS   | `skill-creator:execute-tasks`   | タスク群実行     | ALLOWED_INVOKE   |
| SKILL_CREATOR_VALIDATE        | `skill-creator:validate`        | スキル検証       | ALLOWED_INVOKE   |
| SKILL_CREATOR_VALIDATE_SCHEMA | `skill-creator:validate-schema` | スキーマ検証     | ALLOWED_INVOKE   |
| SKILL_CREATOR_PROGRESS        | `skill-creator:progress`        | 進捗通知         | ALLOWED_ON       |

**実装場所**: `apps/desktop/src/preload/channels.ts`

**セキュリティ検証パターン**:

全5 invokeハンドラーで以下のセキュリティ検証を実施する:

1. **Sender検証**: `validateIpcSender(event, mainWindow)` で送信元BrowserWindowを検証。DevToolsからの呼び出しを検出・拒否
2. **引数バリデーション**: typeof手動チェック + `validatePath()` によるパストラバーサル/NULLバイト/UNCパス検証
3. **スキーマ名ホワイトリスト**: `ALLOWED_SCHEMA_NAMES`（`task-spec`/`skill-spec`/`mode`）以外を拒否
4. **エラーサニタイズ**: `sanitizeErrorMessage()` でスタックトレース・ファイルパス・機密文字列（token/key/password/secret）をマスクして返却

**エラーサニタイズ仕様**:

| 入力パターン                 | 返却メッセージ |
| ---------------------------- | -------------- |
| 引数バリデーションエラー     | 各ハンドラー定義の日本語エラーメッセージを返却 |
| パストラバーサル検出         | `"無効なパスが指定されました: <paramName>"` |
| schemaNameホワイトリスト違反 | `"無効なスキーマ名が指定されました: <schemaName>"` |
| Sender検証失敗               | `"Unauthorized IPC sender"` |
| Errorオブジェクト            | `sanitizeErrorMessage()` でサニタイズした `error.message` |
| Error以外のthrown value      | `"スキル作成処理でエラーが発生しました"` |

**IPCセキュリティ要件**:

| 要件                    | 実装                               | 確認方法                            |
| ----------------------- | ---------------------------------- | ----------------------------------- |
| ホワイトリスト（チャンネル） | `SKILL_CREATOR_CHANNELS`定数で管理 | 定義外チャンネルはエラー            |
| sender検証              | `validateIpcSender()`              | DevTools/外部からの拒否             |
| 型安全性                | `IpcResult<T>`型で統一             | TypeScript型チェック                |
| サンドボックス分離      | contextBridgeで公開                | contextIsolation=true               |
| 引数検証                | 各ハンドラーでtypeof + `validatePath()` | バリデーションテスト            |
| ホワイトリスト（schemaName） | `ALLOWED_SCHEMA_NAMES` で検証     | 不正値入力テスト                     |
| エラーサニタイズ        | `sanitizeErrorMessage()` でマスク返却 | スタック/パス/機密情報非露出テスト |

**関連タスク**: TASK-9B-H-SKILL-CREATOR-IPC（2026-02-12完了）

**関連未タスク（UT-9B-H-003教訓反映済み、2026-02-13）**:

| タスクID     | タスク名                                                    | 教訓反映内容                         |
| ------------ | ----------------------------------------------------------- | ------------------------------------ |
| UT-9B-H-001 | IpcResult型の重複定義を@repo/sharedに統一                   | L3型整合性、Prettier干渉リスク       |
| UT-9B-H-002 | SkillCreator IPCハンドラーの引数検証をZodスキーマに移行     | Zodセキュリティ共存設計              |
| UT-9B-H-004 | SkillCreator設計書-実装整合性修正                           | TDDトレーサビリティ                  |
| UT-9B-H-005 | Preload API二重公開パターン統一                             | L3横展開評価                         |

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

| API                | 二重登録時の挙動                       | 解除 API                              |
| ------------------ | -------------------------------------- | ------------------------------------- |
| `ipcMain.handle()` | 例外送出（同一チャンネルに2つ目不可）  | `ipcMain.removeHandler(channel)`      |
| `ipcMain.on()`     | 許可（リスナーが複数登録される）       | `ipcMain.removeAllListeners(channel)` |

**関連未タスク（UT-FIX-IPC-HANDLER-DOUBLE-REG-001 から派生）**:

| タスクID                             | タスク名                                          | 優先度 |
| ------------------------------------ | ------------------------------------------------- | ------ |
| task-sec-ipc-lifecycle-audit-001     | Electron ライフサイクルイベント IPC リスナー管理監査 | 中     |
| task-imp-ipc-registration-verify-001 | IPC ハンドラ登録整合性自動検証テスト               | 中     |

#### AUTH IPC登録一元化パターン（UT-IPC-AUTH-HANDLE-DUPLICATE-001）

`AUTH_*` 5チャネルの `ipcMain.handle` 登録は、以下の2箇所で宣言的に集約する。

| 対象 | 実装方針 | セキュリティ要件 |
| --- | --- | --- |
| 通常経路（Supabaseあり） | `authHandlers.ts` で共通登録ヘルパーを経由して登録 | `withValidation` を必須適用 |
| fallback経路（Supabaseなし） | `ipc/index.ts` で fallback ハンドラ配列をループ登録 | 既存エラー契約（AUTH_NOT_CONFIGURED）を維持 |

検証基準:

- 5チャネル（login/logout/get-session/refresh/check-online）が過不足なく登録される
- `IPC_CHANNELS.AUTH_*` を直接 `ipcMain.handle` に重複記述しない
- 既存戻り値・エラーコードを変更しない

---

## 実装例: skillFileAPI（TASK-9A-B）

**実装場所**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/skill-api.ts`（`electronAPI.skill` のメソッドとして公開）
- ハンドラー: `apps/desktop/src/main/ipc/skillFileHandlers.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

**チャンネルホワイトリスト方式**:

`SKILL_FILE_CHANNELS`定数として、許可されたIPCチャンネルのみを定義する。invoke用7チャンネルを管理する。

| 定数名                      | チャンネル名            | 用途                 |
| --------------------------- | ----------------------- | -------------------- |
| SKILL_READ_FILE             | `skill:readFile`        | ファイル読み込み     |
| SKILL_WRITE_FILE            | `skill:writeFile`       | ファイル書き込み     |
| SKILL_CREATE_FILE           | `skill:createFile`      | ファイル新規作成     |
| SKILL_DELETE_FILE           | `skill:deleteFile`      | ファイル削除         |
| SKILL_LIST_BACKUPS          | `skill:listBackups`     | バックアップ一覧取得 |
| SKILL_RESTORE_BACKUP        | `skill:restoreBackup`   | バックアップ復元     |
| SKILL_GET_FILE_TREE         | `skill:getFileTree`     | ファイルツリー取得   |

**実装場所**: `apps/desktop/src/preload/channels.ts`

**セキュリティ検証パターン（4層防御）**:

全7 invokeハンドラーで以下のセキュリティ検証を実施する:

1. **Sender検証**: `validateIpcSender(event, mainWindow)` で送信元BrowserWindowを検証。DevToolsからの呼び出しを検出・拒否
2. **引数バリデーション**: `typeof` 文字列チェック + `.trim()` による空文字列検出
3. **SkillFileManager内部検証**: `SkillFileManager.validatePath()` によるパストラバーサル/NULLバイト検出（`PathTraversalError`）
4. **エラーサニタイズ**: `isKnownSkillFileError(error)` でSkillFileManagerエラーを識別し安全なエラーメッセージを返却

**エラーサニタイズ仕様（isKnownSkillFileErrorパターン）**:

| 入力パターン                       | 返却メッセージ |
| ---------------------------------- | -------------- |
| 引数バリデーションエラー           | 各ハンドラー定義の英語エラーメッセージ（例: `skillName must be a non-empty string`） |
| `PathTraversalError`               | `"Path traversal detected: <path>"` |
| `SkillNotFoundError`               | `"Skill not found: <skillName>"` |
| `ReadonlySkillError`               | `"Cannot modify readonly skill: <skillName>"` |
| `FileExistsError`                  | `"File already exists: <relativePath>"` |
| `FileNotFoundError`                | `"File not found: <relativePath>"` |
| Sender検証失敗                     | `toIPCValidationError` で返却されるメッセージ（例: `"Unauthorized IPC call"`） |
| 不明なエラー                       | `"Internal error"` |

**IPCセキュリティ要件**:

| 要件                    | 実装                                 | 確認方法                            |
| ----------------------- | ------------------------------------ | ----------------------------------- |
| ホワイトリスト（チャンネル） | `SKILL_FILE_CHANNELS`定数で管理     | 定義外チャンネルはエラー            |
| sender検証              | `validateIpcSender()`                | DevTools/外部からの拒否             |
| 型安全性                | `IpcResult<T>`型で統一               | TypeScript型チェック                |
| サンドボックス分離      | contextBridgeで公開                  | contextIsolation=true               |
| 引数検証                | 各ハンドラーでtypeof + `.trim()`     | 空文字列/非文字列入力テスト         |
| パストラバーサル防止    | SkillFileManager内部の `validatePath()` | `PathTraversalError` スロー確認   |
| エラーサニタイズ        | `isKnownSkillFileError()` で識別返却 | スタック/パス/機密情報非露出テスト  |

**テストカバレッジ**: skillFileAPI 関連 155テスト全PASS（2026-03-03、IPC/Service/Preload/Renderer）

**関連タスク**: TASK-9A-B（2026-02-19完了）, UT-UI-05A-GETFILETREE-001（2026-03-03完了）

**関連未タスク（TASK-9A-B Phase 12 検出）**:

| タスクID     | タスク名                                | 優先度 | 関連箇所                         |
| ------------ | --------------------------------------- | ------ | -------------------------------- |
| UT-9A-B-001 | IPC入力バリデーション標準化             | 中     | 引数バリデーションパターンの統一 |
| UT-9A-B-002 | IPCエラーサニタイズ共通ユーティリティ化 | 中     | isKnownSkillFileError の共通化   |

> 上記未タスクは skillFileHandlers.ts のバリデーション・エラーサニタイズパターンを他のIPCハンドラー（skillCreatorHandlers.ts 等）に横展開するための改善タスク。

---

## 実装例: skillShareAPI（TASK-9F）

スキル共有（インポート／エクスポート／ソース検証）の3チャネルに適用するセキュリティパターン。

### チャネル定数定義

| 定数名                      | チャネル名               | 方向            |
| --------------------------- | ------------------------ | --------------- |
| SKILL_IMPORT_FROM_SOURCE    | `skill:importFromSource` | invoke (R→M) |
| SKILL_EXPORT                | `skill:export`           | invoke (R→M) |
| SKILL_VALIDATE_SOURCE       | `skill:validateSource`   | invoke (R→M) |

### セキュリティ検証4層構造

| 層 | 検証項目 | 実装 | 返却仕様 |
| -- | -------- | ---- | -------- |
| 1. Sender検証 | 送信元ウィンドウの正当性 | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時: `toIPCValidationError(validation)` |
| 2. 構造バリデーション | 引数がプレーンオブジェクトであること | `isPlainObject(value)` — `typeof === "object"` かつ `!== null` かつ `!Array.isArray()` | 不正時: `{ success: false, error: { code: "VALIDATION_ERROR" } }` |
| 3. P42準拠3段バリデーション | 文字列フィールドの型・空文字列・trim空文字列 | `validateStringField(value, fieldName)` | 不正時: バリデーションエラー |
| 4. 許可値チェック | source.type / destination.type が定義済み値に含まれること | `ALLOWED_SOURCE_TYPES.includes()` / `ALLOWED_DESTINATION_TYPES.includes()` | 不正時: バリデーションエラー |

### 許可値リスト

| フィールド | 許可値 |
| ---------- | ------ |
| `source.type` | `"github"`, `"gist"`, `"url"`, `"local"` |
| `destination.type` | `"gist"`, `"local"` |

### チャネル別バリデーション詳細

| チャネル | バリデーション項目 |
| -------- | ------------------ |
| `skill:importFromSource` | source オブジェクト検証 → source.type P42 3段 → source.type 許可値 → github時 repo 長さ制限（MAX_STRING_LENGTH: 10000） |
| `skill:export` | args オブジェクト検証 → args.skillName P42 3段 → args.destination オブジェクト検証 → args.destination.type P42 3段 → destination.type 許可値 |
| `skill:validateSource` | source オブジェクト検証 → source.type P42 3段 |

### 実装時の苦戦箇所（TASK-9F）

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| Sender検証と構造検証の適用順序 | 先に構造検証を行うと unauthorized 呼び出しでも内部エラーパターンが混在する | `validateIpcSender` を最初に適用し、その後 `isPlainObject` / P42検証へ進む順序に固定 |
| P42 3段バリデーションの漏れ | 一部フィールドで `trim()` 条件を見落とし、空白入力が通過しうる | `validateStringField` 共通関数へ集約し、全3チャネルで同一関数を使用 |
| 未タスク化の遅延 | セキュリティ改善候補が台帳未登録だと再発防止が弱い | Phase 10 MINOR を UT-9F 系へ変換し、`task-workflow.md` 残課題へ即時登録 |

### 同種課題の簡潔解決手順（4ステップ）

1. セキュリティ検証順序を `sender -> 構造 -> P42 -> 許可値` の固定パイプラインにする。  
2. 文字列検証は共通関数化し、チャネルごとの差分をなくす。  
3. セキュリティ改善項目は完了判定に混在させず、未タスクへ分離して追跡する。  
4. 仕様更新後に `verify-unassigned-links` と `audit --diff-from HEAD` で台帳整合を確認する。  

**関連タスク**: TASK-9F（2026-02-27完了）

---

## 実装例: skillChainAPI（TASK-9D）

スキルチェーン（一覧取得・定義取得・保存・削除・実行）の5チャネルに適用するセキュリティパターン。

### チャネル定数定義

| 定数名 | チャネル名 | 方向 |
| --- | --- | --- |
| SKILL_CHAIN_LIST | `skill:chain:list` | invoke (R->M) |
| SKILL_CHAIN_GET | `skill:chain:get` | invoke (R->M) |
| SKILL_CHAIN_SAVE | `skill:chain:save` | invoke (R->M) |
| SKILL_CHAIN_DELETE | `skill:chain:delete` | invoke (R->M) |
| SKILL_CHAIN_EXECUTE | `skill:chain:execute` | invoke (R->M) |

### バリデーションルール

| チャネル | バリデーション |
| --- | --- |
| `skill:chain:list` | Sender 検証のみ |
| `skill:chain:get` | `chainId` P42準拠3段バリデーション |
| `skill:chain:save` | `chain` が object、`chain.name` P42準拠3段バリデーション |
| `skill:chain:delete` | `chainId` P42準拠3段バリデーション |
| `skill:chain:execute` | `args` が object、`chainId` P42準拠3段バリデーション |

### セキュリティ対策一覧

| skill:chain:list | skill:chain:get | skill:chain:save | skill:chain:delete | skill:chain:execute |
| --- | --- | --- | --- | --- |
| OK | OK | OK | OK | OK |

全5ハンドラに以下を適用:
- `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })`
- P42準拠3段バリデーション（`validateStringArg` ヘルパー）
- エラーサニタイズ: `sanitizeErrorMessage(error)` → "Internal error"

**関連タスク**: TASK-9D

---

## 実装例: skillScheduleAPI（TASK-9G）

スキルスケジュール（一覧取得・追加・更新・削除・有効/無効切替）の5チャネルに適用するセキュリティパターン。

### チャネル定数定義

| 定数名 | チャネル名 | 方向 |
| --- | --- | --- |
| SKILL_SCHEDULE_LIST | `skill:schedule:list` | invoke (R->M) |
| SKILL_SCHEDULE_ADD | `skill:schedule:add` | invoke (R->M) |
| SKILL_SCHEDULE_UPDATE | `skill:schedule:update` | invoke (R->M) |
| SKILL_SCHEDULE_DELETE | `skill:schedule:delete` | invoke (R->M) |
| SKILL_SCHEDULE_TOGGLE | `skill:schedule:toggle` | invoke (R->M) |

### バリデーションルール

| チャネル | バリデーション |
| --- | --- |
| `skill:schedule:list` | Sender 検証のみ |
| `skill:schedule:add` | `skillName`/`prompt` P42準拠3段バリデーション、`schedule.type` 必須、cron 時は `cronExpression` 非空、interval 時は正の数 |
| `skill:schedule:update` | `id` P42準拠3段バリデーション |
| `skill:schedule:delete` | `id` P42準拠3段バリデーション |
| `skill:schedule:toggle` | `id` P42準拠3段バリデーション + 存在確認 |

### セキュリティ対策一覧

| skill:schedule:list | skill:schedule:add | skill:schedule:update | skill:schedule:delete | skill:schedule:toggle |
| --- | --- | --- | --- | --- |
| OK | OK | OK | OK | OK |

全5ハンドラに以下を適用:
- `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })`
- P42準拠3段バリデーション（`validateStringArg` ヘルパー）
- エラーサニタイズ: `toIpcErrorResponse(error)` → "Internal error"

**関連タスク**: TASK-9G（2026-02-27完了）

---

## 実装例: skillDebugAPI（TASK-9H）

スキルデバッグ（セッション開始・コマンド実行・ブレークポイント管理・式評価）の7チャネルに適用するセキュリティパターン。

### チャネル定数定義

| 定数名 | チャネル名 | 方向 |
| --- | --- | --- |
| SKILL_DEBUG_START | `skill:debug:start` | invoke (R->M) |
| SKILL_DEBUG_COMMAND | `skill:debug:command` | invoke (R->M) |
| SKILL_DEBUG_BREAKPOINT_ADD | `skill:debug:breakpoint:add` | invoke (R->M) |
| SKILL_DEBUG_BREAKPOINT_REMOVE | `skill:debug:breakpoint:remove` | invoke (R->M) |
| SKILL_DEBUG_INSPECT | `skill:debug:inspect` | invoke (R->M) |
| SKILL_DEBUG_EVALUATE | `skill:debug:evaluate` | invoke (R->M) |
| SKILL_DEBUG_EVENT | `skill:debug:event` | on (M->R) |

### セキュリティ検証4層構造（invoke 6チャネル共通）

| 層 | 検証項目 | 実装 | 返却仕様 |
| --- | --- | --- | --- |
| 1. Sender検証 | 送信元ウィンドウの正当性 | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時: `toIPCValidationError(validation)` |
| 2. P42準拠3段バリデーション | 文字列フィールドの型・空文字列・trim空文字列 | `typeof value === "string"` + `value.trim() !== ""` | 不正時: `{ success: false, error: "... must be a non-empty string" }` |
| 3. 契約値検証 | `command` 許可値、`breakpoint` オブジェクト、`sessionId` 一致 | `VALID_DEBUG_COMMANDS` / `validateSessionId` | 不正時: `command must be one of ...` / `Session ID mismatch ...` |
| 4. サンドボックス実行制約 | 式評価時のプロセス境界 | `vm.createContext` + `vm.runInContext(..., { timeout })` | タイムアウト時: `Expression evaluation timed out` |

### チャネル別バリデーション詳細

| チャネル | バリデーション項目 |
| --- | --- |
| `skill:debug:start` | `skillName`/`prompt` 非空文字列、`breakpoints` 配列 |
| `skill:debug:command` | `sessionId` 非空文字列、`command` が6許可値のいずれか |
| `skill:debug:breakpoint:add` | `sessionId` 非空文字列、`breakpoint` が object |
| `skill:debug:breakpoint:remove` | `sessionId`/`breakpointId` 非空文字列 |
| `skill:debug:inspect` | `sessionId`/`path` 非空文字列 |
| `skill:debug:evaluate` | `sessionId`/`expression` 非空文字列 + paused 状態 |

### 実装上の苦戦箇所（TASK-9H）

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| ハンドラ実装と起動配線の分離 | `skillDebugHandlers.ts` 実装のみではランタイム未到達 | `registerAllIpcHandlers` に `registerSkillDebugHandlers(mainWindow)` を追加して配線を固定 |
| イベントチャネルの扱い誤解 | `skill:debug:event` を invoke 側に誤って混在させやすい | event は `ALLOWED_ON_CHANNELS` のみに登録し、`webContents.send` 専用と明示 |
| サンドボックス例外の露出 | `vm` 例外をそのまま返すと内部情報漏洩リスク | エラーメッセージをハンドラでサニタイズし、戻り値は統一 `success/error` 契約に限定 |

### 同種課題の簡潔解決手順（4ステップ）

1. 追加IPCは `channels.ts` の invoke/on 両ホワイトリストを同時更新する。  
2. ハンドラ追加時は `validateIpcSender` と P42 3段バリデーションをテンプレート化して全チャネルへ適用する。  
3. イベントチャネルは invoke と分離し、`webContents.send` 経路だけを許可する。  
4. `skillDebugHandlers.test.ts` と `verify-all-specs` で契約・配線を同時検証する。  

**関連タスク**: TASK-9H（2026-02-27完了）

---

## 実装例: skillDocsAPI（TASK-9I）

スキルドキュメント生成（generate / preview / export / templates）の4チャネルに適用するセキュリティパターン。

### チャネル定数定義

| 定数名 | チャネル名 | 方向 |
| --- | --- | --- |
| SKILL_DOCS_GENERATE | `skill:docs:generate` | invoke (R→M) |
| SKILL_DOCS_PREVIEW | `skill:docs:preview` | invoke (R→M) |
| SKILL_DOCS_EXPORT | `skill:docs:export` | invoke (R→M) |
| SKILL_DOCS_TEMPLATES | `skill:docs:templates` | invoke (R→M) |

### セキュリティ検証4層構造

| 層 | 検証項目 | 実装 | 返却仕様 |
| --- | --- | --- | --- |
| 1. Sender検証 | 送信元ウィンドウの正当性 | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時: `toIPCValidationError(validation)` |
| 2. P42準拠3段バリデーション | `skillName`/`outputPath` の型・空文字列・trim空文字列 | `typeof === "string"` + `trim() !== ""` | 不正時: `{ success: false, error: string }` |
| 3. 入力制約検証 | `outputFormat`/`language` 許可値、boolean 型、`customSections` 文字列配列、`doc` オブジェクト | ハンドラー内の条件分岐検証 | 不正時: `{ success: false, error: string }` |
| 4. エラー境界 | 例外情報の外部露出を防止 | `catch` で unknown を `"Internal error"` へ正規化 | 内部情報漏えい防止 |

### チャネル別バリデーション詳細

| チャネル | バリデーション項目 |
| --- | --- |
| `skill:docs:generate` | `request` オブジェクト、`skillName` 非空文字列、`outputFormat` (`markdown/html`)、`includeExamples` boolean、`includeApiReference` boolean、`language` (`ja/en`)、`customSections` 文字列配列 |
| `skill:docs:preview` | `args` オブジェクト、`skillName` 非空文字列 |
| `skill:docs:export` | `args` オブジェクト、`doc` オブジェクト、`outputPath` 非空文字列、`..` を含むパス拒否 |
| `skill:docs:templates` | Sender検証のみ |

### 追加防御（export）

| 防御層 | 実装位置 | 内容 |
| --- | --- | --- |
| IPC 層 | `registerSkillDocsHandlers` | `outputPath.includes("..")` を即時拒否 |
| サービス層 | `SkillDocGenerator.validateOutputPath` | `path.resolve` + `..` 検証で再確認 |

### 実装時の苦戦箇所（TASK-9I）

| 苦戦箇所 | 問題 | 解決策 |
| --- | --- | --- |
| 共有型 root export 漏れ | `@repo/shared` から docs 型を参照できず型エラー | `packages/shared/index.ts` に 5型を明示 export |
| サービス契約不一致 | `listSkillFiles()` 呼び出しと `SkillFileManager` API が不整合 | `SkillFileManager.listSkillFiles()` を追加し API 契約を一致 |
| 「検証済み」と実態の乖離 | documentation-changelog に Step が未完了のまま残存 | Step 単位の完了チェックと実行証跡を同時更新 |

### 同種課題の簡潔解決手順（4ステップ）

1. `sender -> 入力構造 -> P42 -> 許可値` の順序で検証を固定する。  
2. IPC で拒否した入力でも、サービス層で防御を重ねる（二重防御）。  
3. shared 型追加時は root export まで同時更新し、型契約ドリフトを防ぐ。  
4. 仕様更新時は changelog チェック欄と実ファイル更新を同一ターンで完了する。  

**関連タスク**: TASK-9I（2026-02-28完了）

---

## 実装例: skillAnalyticsAPI（TASK-9J）

> 完了タスク: TASK-9J（2026-02-28）

### セキュリティ検証マトリクス

| チャンネル | validateIpcSender | sanitizeError | getAllowedWindows | IPC_CHANNELS定数 | 3段バリデーション |
| --- | :---: | :---: | :---: | :---: | :---: |
| skill:analytics:record | OK | OK ("Internal error") | OK | OK | OK (skillName, eventType) |
| skill:analytics:statistics | OK | OK ("Internal error") | OK | OK | OK (skillName) |
| skill:analytics:summary | OK | OK ("Internal error") | OK | OK | N/A (引数なし) |
| skill:analytics:trend | OK | OK ("Internal error") | OK | OK | OK (start, end, granularity) |
| skill:analytics:export | OK | OK ("Internal error") | OK | OK | OK (format) |

### バリデーション詳細

- **validateStringArg ヘルパー**: P42準拠3段バリデーション（typeof !== "string" → === "" → .trim() === ""）を共通化
- **isPlainObject**: 引数がプレーンオブジェクトであることを検証
- **許可値リスト**: ALLOWED_EVENT_TYPES, ALLOWED_GRANULARITIES, ALLOWED_FORMATS でホワイトリスト検証
- **toIpcErrorResponse**: 全 catch ブロックで内部エラー情報を "Internal error" に正規化

### 実装時の苦戦箇所（TASK-9J）

| 苦戦箇所 | 課題 | 対処 | 標準ルール |
| --- | --- | --- | --- |
| 文字列検証ロジックの分散 | ハンドラごとにバリデーション実装がばらつくと品質差が出る | `validateStringArg` へ統一して5ハンドラへ適用 | P42 3段検証はヘルパー化し個別実装を禁止 |
| 許可値チェックの抜け漏れ | `eventType` / `granularity` / `format` の検証粒度が揃わない | 3つの ALLOWED_* 定数を導入してホワイトリスト化 | enum相当入力は必ず ALLOWED_* で一元検証 |
| 内部エラー情報の露出リスク | 例外内容をそのまま返すと情報漏えいにつながる | `toIpcErrorResponse` で "Internal error" に正規化 | catch 節はすべてサニタイズ関数経由で返却する |

**関連タスク**: TASK-9J（2026-02-28完了）

---

## 実装例: `skill:execute` 認証 preflight ガード（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001）

`skill:execute` は Renderer 実行前に `auth-key:exists` を確認し、認証キー未設定時は Main へ実行を送らず停止する。加えて Main 側は最終防衛として `AUTHENTICATION_ERROR` を `errorCode` 付きで返却する。

### セキュリティ境界

| 層 | 実装 | セキュリティ意図 |
| --- | --- | --- |
| Renderer preflight | `preflightSkillExecutionAuth()` | 不要な実行を事前停止し、設定誘導を明確化 |
| Main sender検証 | `validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, ...)` | DevTools/未許可windowからの呼び出し拒否 |
| Main 失敗契約 | `{ success:false, error, errorCode?: string }` | 認証失敗を識別可能にして復旧導線を保証 |
| Preload unwrap | `Error.code = result.errorCode` | Renderer 側の例外分岐を型安全に維持 |

### 検証順序（標準）

1. sender 検証（Main）  
2. preflight 判定（Renderer）  
3. 実行処理（Main）  
4. エラーコード伝搬（Main -> Preload -> Renderer）

### 既知リスクと対策

| リスク | 対策 |
| --- | --- |
| preflight 判定と実行時判定の乖離 | `auth-key:exists` に env fallback を追加し `api-ipc-system.md` と同期 |
| 認証失敗が一般エラーに埋もれる | `errorCode` を optional 追加し後方互換を維持しつつ分類 |
| UI層で重複実装が再発 | preflight utility を単一入口に固定 |

---

## 自動更新のセキュリティ

| 項目         | 要件                         |
| ------------ | ---------------------------- |
| 更新ソース   | HTTPS経由のみ                |
| 署名検証     | コード署名の検証必須         |
| ロールバック | 失敗時の自動ロールバック機能 |
| 通知         | 更新内容のユーザーへの明示   |

---

## 関連ドキュメント

- [APIセキュリティ](./security-api.md)
- [スキル実行セキュリティ](./security-skill-execution.md)
- [AUTH IPC登録一元化 実装ガイド](../../../docs/30-workflows/ut-ipc-auth-handle-duplicate-001/outputs/phase-12/implementation-guide.md)

---

## 完了タスク

| タスクID | 完了日 | ステータス | 概要 |
| --- | --- | --- | --- |
| TASK-9I | 2026-02-28 | 完了 | スキルドキュメント4チャネルのセキュリティ実装。validateIpcSender + P42準拠3段バリデーション + 許可値検証 + export パストラバーサル二重防御 + エラー正規化を適用 |
| TASK-9J | 2026-02-28 | 完了 | スキル分析・統計5チャネルのセキュリティ実装。validateIpcSender + validateStringArg共通化 + 許可値リスト（ALLOWED_EVENT_TYPES/GRANULARITIES/FORMATS） + toIpcErrorResponse正規化。37テストPASS |
| TASK-9G | 2026-02-27 | 完了 | スキルスケジュール5チャネルのセキュリティ実装。validateIpcSender + P42準拠3段バリデーション + 方式別必須検証 + エラー正規化を適用 |
| TASK-9F | 2026-02-27 | 完了 | スキル共有3チャネルのセキュリティ実装。validateIpcSender + isPlainObject構造検証 + P42準拠3段バリデーション + 許可値チェックの4層構造。92テスト全PASS |
| UT-IPC-AUTH-HANDLE-DUPLICATE-001 | 2026-02-25 | 完了 | AUTH 5チャネルの重複登録式を共通登録へ一元化し、契約互換を維持 |
