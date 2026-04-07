# Electron IPC セキュリティ実装例 / examples specification
> 親ファイル: [security-electron-ipc-core.md](security-electron-ipc-core.md)

## 実装例: historyAPI

**実装場所**:

- チャンネル定義: `apps/desktop/src/main/infrastructure/ipc/channels.ts`
- preload: `apps/desktop/src/preload/index.ts`
- 型定義: `apps/desktop/src/renderer/components/history/types.ts`

**チャンネルホワイトリスト方式**:

`HISTORY_CHANNELS`定数として、許可されたIPCチャンネルのみを定義する。定義外のチャンネルは自動的に拒否される。

| 定数名              | チャンネル名                | 用途               |
| ------------------- | --------------------------- | ------------------ |
| GET_FILE_HISTORY    | `history:getFileHistory`    | ファイル履歴取得   |
| GET_VERSION_DETAIL  | `history:getVersionDetail`  | バージョン詳細取得 |
| GET_CONVERSION_LOGS | `history:getConversionLogs` | 変換ログ取得       |
| RESTORE_VERSION     | `history:restoreVersion`    | バージョン復元     |

**実装場所**: `apps/desktop/src/main/infrastructure/ipc/channels.ts`

**safeInvoke ラッパーによる安全な呼び出し**:

Renderer側からMainプロセスへの安全なIPC呼び出しを実現するため、`createSafeInvoke`ヘルパー関数を使用する。この関数はジェネリック型を受け取り、型安全なPromiseを返す。

**実装パターン**:

1. `createSafeInvoke<T>(channel)`関数でチャンネル名を受け取り、ラッパー関数を生成
2. ラッパー関数は任意の引数を受け取り、`ipcRenderer.invoke`を呼び出す
3. `contextBridge.exposeInMainWorld`で`historyAPI`として公開

**公開されるAPI**:

| API名          | 戻り値型                                               | 対応チャンネル   |
| -------------- | ------------------------------------------------------ | ---------------- |
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

## 実装例: notificationAPI（TASK-UI-08）

**実装場所**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- shared 定数: `packages/shared/src/ipc/channels.ts`
- preload API: `apps/desktop/src/preload/api/notification-api.ts`
- 型定義: `apps/desktop/src/preload/types.ts`
- Main handler: `apps/desktop/src/main/ipc/notificationHandlers.ts`

**チャンネルホワイトリスト方式**:

`notification:get-history` / `notification:mark-read` / `notification:mark-all-read` / `notification:delete` / `notification:clear` は invoke allowlist、`notification:new` は subscribe 専用として分離する。

| チャネル | 用途 | セキュリティ要件 |
| --- | --- | --- |
| `notification:get-history` | 初期履歴取得 | sender 検証 |
| `notification:mark-read` | 単一既読化 | sender 検証 + `notificationId` 検証 |
| `notification:mark-all-read` | 一括既読化 | sender 検証 |
| `notification:delete` | 単一削除 | sender 検証 + `notificationId` 検証 |
| `notification:new` | push 通知 | invoke allowlist へ入れず subscribe 専用 |

**バリデーション契約**:

1. `validateIpcSender(event, channel, ...)` で mainWindow 由来の sender を検証する。
2. 更新系ハンドラでは `notificationId` を非空文字列として検証する。
3. 例外メッセージは `sanitizeErrorMessage()` でサニタイズして返す。
4. Renderer 側では `safeInvoke` / `safeOn` 経由以外で notification API を公開しない。

**関連タスク**: TASK-UI-01-C（2026-03-05完了）, TASK-UI-08（2026-03-11完了）

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

| パターン   | 説明                       |
| ---------- | -------------------------- |
| `..`       | 基本的な親ディレクトリ参照 |
| `%2e%2e`   | URLエンコードされた`..`    |
| `%2e.`     | 部分エンコード（前半）     |
| `.%2e`     | 部分エンコード（後半）     |
| `..%c0%af` | UTF-8オーバーロング表現    |
| `\0`       | NULLバイトインジェクション |

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

## IPC Layer Integrity Fix（TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001、2026-03-19完了）

| チャンネル | sender検証 | whitelist | unwrap | P42 3段 | P45命名 |
|------------|-----------|-----------|--------|---------|---------|
| `skill:update` | validateIpcSender | ALLOWED_INVOKE_CHANNELS L494 | safeInvokeUnwrap | PASS | skillName |
| `skill:get-detail` | validateIpcSender(既存) | ALLOWED_INVOKE_CHANNELS L486 | safeInvokeUnwrap | PASS | skillId |

- Preload層早期拒否: バリデーション失敗時は `Promise.reject()` で invoke を呼ばない
- エラーサニタイズ: `sanitizeErrorMessage()` でパス/IP/機密情報をマスク
- unregister: `ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE)` L844 で P5対策

---

---

## ApprovalGate セキュリティ契約（TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001）

> 完了日: 2026-03-25

### ApprovalGate 基本契約

| 項目 | 契約 |
| --- | --- |
| 動作プロセス | Main プロセスでのみ動作する（Renderer 非公開） |
| トークン生成 | `crypto.randomBytes(32)` による安全なランダムトークン |
| トークン有効期限 | TTL = 300 秒（`APPROVAL_TTL_SECONDS = 300`） |
| トークン使用 | 単一操作ごとに失効（ワンタイム使用） |
| DI 対応 | `IApprovalGate` インターフェースで依存注入可能 |

### DENY パターン（追加定義）

| ID | パターン | 内容 |
| --- | --- | --- |
| DENY-5 | API key 非公開 | API key を Renderer に渡さない |
| DENY-6 | terminal command sanitize | terminal command に API key を含有させない（`sanitizeForApiKeys` 関数で除去） |
| DENY-9 | 外部送信承認必須 | 外部送信時は ApprovalGate 承認が必須 |

### Consumer Auth Guard（CAG）

| ルール | 内容 |
| --- | --- |
| CAG-1 | `RuntimePolicyResolver.isConsumerToken()` で `sess-` プレフィックスを検出 |
| CAG-2 | `RuntimePolicyResolver.isConsumerToken()` で `sessionKey=` プレフィックスを検出 |
| CAG-3 | Consumer token 検出時は外部送信を常にブロックする |

### No Auto-Send（NAS）

| ルール | 内容 |
| --- | --- |
| NAS-1 | 外部送信操作はユーザーの明示的アクション（ボタンクリック）が必須 |
| NAS-2 | auto-send / auto-execute 機能の実装を禁止する |
| NAS-3 | `approval:respond` は Renderer から明示的に invoke される場合のみ有効 |
| NAS-4 | バックグラウンドでの自動承認・自動送信は禁止する |

### 実装ファイル

| ファイル | 役割 |
| --- | --- |
| `apps/desktop/src/main/services/runtime/ApprovalGate.ts` | ワンタイムトークン生成・TTL 管理・IApprovalGate インターフェース |
| `apps/desktop/src/main/ipc/approvalHandlers.ts` | `approval:respond` invoke / `approval:request` push handler |
| `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts` | `execution:get-terminal-log` / `execution:get-copy-command` handler |
| `apps/desktop/src/main/ipc/disclosureHandlers.ts` | `execution:get-disclosure-info` handler |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` | `isConsumerToken()` による CAG 判定・NAS 強制 |

### Advanced Console Error Boundary

- callback 層は session 不在を `SESSION_NOT_FOUND` で表現してよいが、外向き IPC 応答コードは `TERMINAL_LOG_ERROR` / `COPY_COMMAND_ERROR` に正規化する。

---

## Skill Creator External API Credential 秘匿化（TASK-SDK-SC-03）

> 完了日: 2026-04-03

### 秘匿化パターン: `sanitizeExternalApiConfigForPrompt()`

SDK Session が LLM プロンプトに外部API設定を注入する際、credential を秘匿化する。

| 観点 | 契約 |
| --- | --- |
| 秘匿対象 | `ExternalApiConnectionConfig.credential` フィールド |
| 置換値 | `[REDACTED]` |
| 適用タイミング | SDK プロンプトへの注入時のみ |
| 実際のAPI呼び出し | 元の credential を使用（二重管理パターン） |
| 実装箇所 | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts` の `sanitizeExternalApiConfigForPrompt()` |

### DENY パターン（External API 追加定義）

| ID | パターン | 内容 |
| --- | --- | --- |
| DENY-10 | External API credential 非注入 | LLM プロンプトに credential 実値を含めない（`[REDACTED]` に置換） |
| DENY-11 | External API credential ログ非出力 | ログ・エラーメッセージに credential を含めない |

### バリデーション契約

`SkillCreatorIpcBridge.isValidExternalApiConfig()` は `skill-creator:configure-api` の受信時に8条件バリデーションを実施する。

| # | 条件 | 目的 |
| --- | --- | --- |
| 1 | `config` が非 null object | injection 防止 |
| 2 | `config.name` が非空文字列 | 識別名必須 |
| 3 | `config.url` が非空文字列 | エンドポイント必須 |
| 4 | `config.url` が `http://` or `https://` 始まり | protocol guard |
| 5 | `config.method` が `GET` or `POST` | HTTP method 制限 |
| 6 | `config.authType` が `ExternalApiAuthType` 値 | 列挙値ガード |
| 7 | `authType !== "none"` 時に `credential` 非空 | 認証情報必須性 |
| 8 | `headers` が `Record<string, string>` 形状 | ヘッダー形状ガード |
- `sanitizeForApiKeys()` は success path だけでなく error message にも適用し、internal error text 経由で秘密情報を漏らさない。
