# Electron IPCセキュリティ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [security-api-electron.md](./security-api-electron.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                       |
| ---------- | ---------- | ---------------------------------------------- |
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

---

## 実装例: historyAPI

**実装場所**:

- チャンネル定義: `apps/desktop/src/main/infrastructure/ipc/channels.ts`
- preload: `apps/desktop/src/preload/index.ts`
- 型定義: `apps/desktop/src/renderer/components/history/types.ts`

**チャンネルホワイトリスト方式**:

`HISTORY_CHANNELS`定数として、許可されたIPCチャンネルのみを定義する。定義外のチャンネルは自動的に拒否される。

| 定数名              | チャンネル名                 | 用途               |
| ------------------- | ---------------------------- | ------------------ |
| GET_FILE_HISTORY    | `history:getFileHistory`     | ファイル履歴取得   |
| GET_VERSION_DETAIL  | `history:getVersionDetail`   | バージョン詳細取得 |
| GET_CONVERSION_LOGS | `history:getConversionLogs`  | 変換ログ取得       |
| RESTORE_VERSION     | `history:restoreVersion`     | バージョン復元     |

**実装場所**: `apps/desktop/src/main/infrastructure/ipc/channels.ts`

**safeInvoke ラッパーによる安全な呼び出し**:

Renderer側からMainプロセスへの安全なIPC呼び出しを実現するため、`createSafeInvoke`ヘルパー関数を使用する。この関数はジェネリック型を受け取り、型安全なPromiseを返す。

**実装パターン**:

1. `createSafeInvoke<T>(channel)`関数でチャンネル名を受け取り、ラッパー関数を生成
2. ラッパー関数は任意の引数を受け取り、`ipcRenderer.invoke`を呼び出す
3. `contextBridge.exposeInMainWorld`で`historyAPI`として公開

**公開されるAPI**:

| API名          | 戻り値型                                      | 対応チャンネル             |
| -------------- | --------------------------------------------- | -------------------------- |
| getFileHistory | `Promise<Result<PaginatedResult<VersionHistoryItem>>>` | GET_FILE_HISTORY |

**実装場所**: `apps/desktop/src/preload/index.ts`

**IPCセキュリティ要件**:

| 要件               | 実装                         | 確認方法                 |
| ------------------ | ---------------------------- | ------------------------ |
| ホワイトリスト     | `HISTORY_CHANNELS`定数で管理 | 定義外チャンネルはエラー |
| 型安全性           | Result<T>型で統一            | TypeScript型チェック     |
| サンドボックス分離 | contextBridgeで公開          | contextIsolation=true    |
| 引数検証           | Main側ハンドラーで実施       | バリデーションテスト     |

**関連タスク**: history-preload-setup（2026-01-13完了）

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
