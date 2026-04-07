# Electron IPCセキュリティ / core specification

> 親仕様書: [security-electron-ipc.md](security-electron-ipc.md)
> 役割: core specification

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

### Renderer 境界での Preload Payload 防御（2026-03-07追加）

contextBridge.exposeInMainWorld の公開が部分的に失敗するケース（sandbox 環境の遅延初期化、preload スクリプトの部分エラー等）に対応するための Renderer 側防御パターン。

| 防御層                       | 実装                                                                | セキュリティ意図                                             |
| ---------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| namespace 存在確認           | `window.electronAPI?.namespace` で optional chaining                | sandbox/preload 障害時にクラッシュせずフォールバック         |
| メソッド存在確認             | `api?.method` + `console.warn` で不在時に警告ログ                   | contextBridge 公開不完全を検出・記録                         |
| iterable 安全性検証          | `Array.isArray(result.data.items)` でレスポンスの iterable 性を保証 | 非配列レスポンスによる `for...of` / `map()` クラッシュを防止 |
| エラーメッセージ安全アクセス | `result?.error?.message` で null-safe アクセス                      | 部分的レスポンス構造でのプロパティアクセスエラーを回避       |

**責務分離**:

- 本パターンは Renderer 境界での受信防御を担当する
- Preload 層の safeInvoke 防御（task-04）とは独立した防御層として機能する
- Main Process 側のバリデーション（sender 検証 + 引数検証）とは別レイヤーの多層防御

**関連タスク**: 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001, TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001
**関連**: task-04（Preload 層 safeInvoke 防御）との責務分離

### P59: Preload API 未公開の検出と防止（TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001）

`chatEditApi.ts` に `exposeChatEditAPI()` 関数を定義しても、`preload/index.ts` で呼び出さなければ `window.chatEditAPI` は `undefined` のまま Renderer に公開されない。2026-03-14 の実装で発覚した。

| 観点 | 内容 |
| --- | --- |
| 根本原因 | `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと else ブロックの両方に `exposeChatEditAPI()` 呼び出しが欠落していた |
| 症状 | `window.chatEditAPI` が `undefined` で全 chat-edit IPC 呼び出しが silent fail |
| 修正内容 | `preload/index.ts` の `contextBridge.exposeInMainWorld()` ブロックと `else` ブロックの両方に `exposeChatEditAPI()` を追加 |
| 監査方法 | `grep -c "exposeInMainWorld" preload/index.ts` で公開 API 数を確認し、定義済み API 数と一致させる |
| 再発防止 | 新規 Preload API 追加時は「定義 → index.ts 両ブロック追記 → typecheck → 手動確認（DevTools で `window.xxxAPI` 存在検証）」を 1 セットで実施 |

**関連 Pitfall**: P59（lessons-learned-current.md）、P23（API二重定義の型管理複雑性）
**関連タスク**: TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001

### Workspace file watch lifecycle（TASK-UI-04A）

`WorkspaceView` は selected file の再読込に限って watch を使う。watch 契約は file read/write の一般契約とは分けて扱う。

| 項目 | 契約 |
| --- | --- |
| invoke channel | `file:watch-start`, `file:watch-stop` |
| event channel | `file:changed` |
| sender | Main は `event.sender.send(IPC_CHANNELS.FILE_CHANGED, payload)` で push する |
| Renderer cleanup | file switch / unmount のたびに `watchStop` を呼ぶ |
| allowlist | `FILE_CHANGED` は subscribe 専用で invoke allowlist には入れない |
| duplicate guard | Renderer は module scope guard で selected file 同一時の再登録を避ける |

**セキュリティ意図**:

- watch 対象を selected file に限定し、広域監視を行わない。
- Main 側は watchId 単位で watcher を保持し、stop 後は map から削除する。
- Renderer は preload 公開 API だけを使い、 chokidar や Node FS へ直接触れない。

### Workspace preview security contract（TASK-UI-04C）

04C は preview 描画を増やすが、権限境界は 04A から広げない。

| 観点 | 契約 |
| --- | --- |
| invoke reuse | Renderer は `window.electronAPI.file.read()` だけを使い、Node FS へ直接触れない |
| timeout / retry | timeout は Renderer local 制御で実装し、Main の許可範囲を拡張しない |
| HTML preview | iframe sandbox + CSP を維持し、危険 URL を除去した content のみ描画する |
| structured preview | JSON/YAML parse error は banner + source fallback に落とし、追加評価は行わない |
| watcher cleanup | 04A と同様に file switch / unmount の都度 `file:watch-stop` を呼ぶ |

### Workspace Chat Panel IPC 境界（TASK-UI-04B）

`WorkspaceChatPanel` は 04A の file/watch 契約の上で、LLM stream と conversation 永続化を preload API 経由で組み合わせる。

| 種別 | チャンネル / API | 契約 |
| --- | --- | --- |
| invoke | `file:read` | 選択ファイルと context block 生成に限定 |
| invoke | `llm:stream-chat` | request body は renderer 側で組み立てるが provider adapter へ直接アクセスしない |
| invoke | `llm:cancel-stream` | unmount / ユーザー停止時に明示キャンセルする |
| subscribe | `llm:on-stream-chunk` / `llm:on-stream-end` / `llm:on-stream-error` | stream lifecycle を UI 状態へ反映 |
| invoke | `conversation:create` | workspace chat session を初回作成 |
| invoke | `conversation:add-message` | user/assistant 双方を永続化 |

**セキュリティ意図**:

- stream listener は preload 提供の unsubscribe を必ず cleanup する。
- renderer は `isStreamingRef` と `streamContentRef` を使って競合に強い状態遷移を行うが、権限境界自体は preload/main に残す。
- mention 経由の file context 追加でも `file:read` 失敗を黙殺せず alert 表示し、失敗状態を可視化する。

### Workspace Chat Edit runtime/handoff IPC 境界（TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001）

`chat-edit:send-with-context` は auth mode と API key 状態に応じて integrated 実行か handoff 案内を返す。2026-03-14 の同期で preload/main の契約を以下に固定した。

| 観点 | 契約 |
| --- | --- |
| preload 公開 | `contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI)` を使用し、`window` 直接代入を禁止 |
| invoke payload | `read-file` / `write-file` は object payload（`{ filePath, workspacePath? }`）で Main 契約と一致させる |
| sender 検証 | すべての `chat-edit:*` handler で `validateIpcSender` を先頭実行 |
| workspace 境界 | `workspacePath` 指定時は `isAllowedPath()` で context file 全件を検証し、違反時は `PERMISSION_DENIED` |
| runtime 分岐 | `RuntimeResolver.resolve()` が `subscription` / API key 不足を `handoff` として返す |
| handoff 出力 | `TerminalHandoffBuilder` は `terminalCommand` に API key を含めない（secret 非中継） |

**セキュリティ意図**:

- renderer は `chatEditAPI` 以外の直接 IPC 経路を持たない。
- handoff は「手動実行支援」に限定し、auto-send / hidden prompt injection を許容しない。
- auth key の有無を判定しても key 実値は UI / command / error へ露出しない。

### Slide runtime/auth-mode IPC 境界（TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001）

> **ステータス**: `spec_created`（2026-03-19 再監査同期）

slide invoke channel はすべて `validateIpcSender -> P42 -> path guard -> business` の順序を守る。

| 観点 | 契約 |
| --- | --- |
| sender 検証 | `slide:*` invoke handler の先頭で `validateIpcSender` を実行する |
| payload 検証 | `projectPath` は型 / 空文字列 / trim 後空文字列の 3 段で検証する |
| path guard | `..` / null byte / allowlist 外 path を reject する |
| runtime handoff | API key 不足や subscription mode は `guidance` 付きの handoff envelope を返す |
| secret 非中継 | `terminalCommand` や error message に API key を含めない |
| push channel | Renderer へ送るのは `sync-status-changed` / `sync-progress` / `sync-error` / `execution-progress` / `structureChanged` / `watch-status` に限定する |

**current drift（2026-03-19）**:

- `apps/desktop/src/main/slide/ipc-handlers.ts` では `validateIpcSender` と path guard が未実装
- legacy channel 名が残存し、canonical allowlist と一致していない
- `registerSlideIpcHandlers()` が `ipc/index.ts` へ未接続

**完了タスク記録（TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001、2026-03-19）**:

| セキュリティ設計項目 | 内容 |
| -------------------- | ---- |
| validateIpcSender 適用範囲 | slide invoke channel 全 6 本（`slide:executePhase` / `slide:watch-start` / `slide:watch-stop` / `slide:sync-status` / `slide:reverse-sync` / `slide:cancel`）に適用設計完了 |
| セキュリティ検証順序 | sender 検証 → P42 3段バリデーション → パストラバーサル検出 → エラーサニタイズ → business logic 委譲 |
| パストラバーサル対象 | 全 invoke チャネルの `projectPath` 引数に `detectPathTraversal` 適用設計完了 |
| エラーサニタイズ | handler 内で内部パス・スタックトレースをマスクし、`code` + `message` のみ Renderer に返却 |
| push channel 制限 | Renderer への push は `slide:sync-status-changed` / `slide:sync-progress` / `slide:sync-error` / `slide:execution-progress` / `slide:structureChanged` / `slide:watch-status` に限定 |

実装は後続タスク `UT-SLIDE-IMPL-001` で対応する。

**関連未タスク**:

- `UT-SLIDE-IMPL-001`

### Conversation IPC セキュリティ契約（TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION / TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001）

`registerConversationHandlers()` が `registerAllIpcHandlers()` Section 13 に接続され、conversation:* 7チャンネルが Main Process で正常登録される。

| 観点 | 契約 |
| --- | --- |
| 登録パターン | `safeRegister` + `track` で Graceful Degradation 準拠（S30） |
| sender 検証 | 各ハンドラで `validateIpcSender` を先頭実行 |
| 引数バリデーション | 全ハンドラで P42 準拠3段バリデーション（型チェック → 空文字列 → `trim()` 空文字列） |
| DB 障害時 | `conversationDb` が `null` → 全チャンネルが `DB_NOT_AVAILABLE`（ERR_4006）を返却 |
| エラーメッセージ | `sanitizeRegistrationErrorMessage` でホームパスをマスク（P55準拠） |
| 二重登録防止 | `unregisterAllIpcHandlers()` で `CONVERSATION_*` 全チャンネルを解除後に再登録（P5準拠） |
| DB 初期化分離 | DB 初期化は `ipc/index.ts` の `registerAllIpcHandlers` から分離し、`initializeConversationDatabase()` Factory 関数に集約 |
| DI パターン | `registerAllIpcHandlers(mainWindow, conversationDb?)` 第2引数で DB インスタンスを外部注入 |
| DB パス | `app.getPath('userData')/conversations.db`（旧: `~/.claude/conversations.db`）に変更。OS標準のユーザーデータディレクトリを使用しパスのハードコードを排除 |

**セキュリティ意図**:

- conversation DB 操作は Main Process に閉じ、Renderer は Preload 公開の `conversationAPI` のみ使用
- search クエリの SQL injection は better-sqlite3 のパラメータバインディングで防止
- DB ファイルパスは `app.getPath('userData')` ベースに固定し、パストラバーサルを排除
- Factory 関数パターンにより DB 初期化失敗がフォールバック登録に確実に伝播される（DI 経由）

**関連タスク**: TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION（2026-03-16）、TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001（2026-03-19）
**関連未タスク**: UT-IPC-P42-INTRA-GROUP-CONSISTENCY-AUDIT-001（グループ内P42一貫性監査）
**関連**: arch-ipc-persistence.md（ConversationRepository 詳細）

### ApiKeysSection 契約防御ガード（2026-03-08完了）

06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 で実装した Renderer 4層防御 + Main 側配列正規化の完了記録。

| GAP ID | 防御対象                   | 実装箇所                     | テスト数 |
| ------ | -------------------------- | ---------------------------- | -------- |
| GAP-01 | result.data undefined/null | ApiKeysSection loadProviders | 2        |
| GAP-02 | providers 空配列           | ApiKeysSection loadProviders | 1        |
| GAP-03 | malformed 要素フィルタ     | type predicate + .filter()   | 3        |
| GAP-04 | apiKey.list() reject       | try-catch + エラーUI         | 1        |
| GAP-05 | Main側 providers 非配列    | apiKeyHandlers.ts            | 7        |
| GAP-06 | identities 非配列          | profileHandlers.ts (3箇所)   | 6        |

**合計テスト**: 59件（Renderer 46 + Main 13）全PASS
**カバレッジ**: Stmts 93.17%, Branch 86.23%, Fn 91.66%

**関連パターン**: [architecture-implementation-patterns.md S29](./architecture-implementation-patterns.md)（Renderer 境界 providers 正規化パターン）

### AuthMode IPC セキュリティパターン（TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001）

`auth-mode:*` は sender 検証、mode 検証、error envelope を Main / Preload / Renderer で共通 transport に固定する。

| セキュリティ観点   | 実装                                                                                                                           | 確認ポイント                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| sender 検証順序    | `authModeHandlers.ts` は各 handler の先頭で `validateSender(event)` を実行し、失敗時は直ちに `auth-mode/invalid-sender` を返す | 入力検証より先に unauthorized request を拒否する          |
| 許可 origin        | `file://`, `http://localhost`, `https://localhost` のみ許可                                                                    | DevTools/不正 window の URL を通さない                    |
| mode 検証          | sender 合格後に `VALID_AUTH_MODES` で `subscription` / `api-key` のみ許可                                                      | `auth-mode/invalid-mode` が返ること                       |
| エラー情報の最小化 | `sanitizeErrorMessage()` で `token=`, `key=`, `sk-ant-*` をマスク                                                              | 認証トークンや API Key を露出しない                       |
| 公開 envelope      | `IPCResponse<T>` + `IPCError { code, message, guidance? }`                                                                     | Renderer は `message` 表示、`guidance` 補助表示のみに限定 |
| Preload 公開境界   | `safeInvoke()` で `get/set/status/validate`、`safeOn()` で `auth-mode:changed` を公開                                          | invoke/on のホワイトリスト外チャンネルは拒否する          |

#### auth-mode 用の標準エラーコード

| コード                                                       | 用途                             |
| ------------------------------------------------------------ | -------------------------------- |
| `auth-mode/invalid-sender`                                   | sender 検証失敗                  |
| `auth-mode/invalid-mode`                                     | request payload 不正             |
| `auth-mode/no-api-key`                                       | API Key mode の資格情報なし      |
| `auth-mode/no-subscription-token`                            | subscription mode の資格情報なし |
| `auth-mode/storage-failed` / `auth-mode/storage-read-failed` | 永続化層の失敗                   |
| `auth-mode/unknown-error`                                    | 想定外例外のサニタイズ後返却     |

#### Renderer 側の安全な受信境界

| 公開 API                                         | 返却 / payload             | セキュリティ意図                            |
| ------------------------------------------------ | -------------------------- | ------------------------------------------- |
| `window.electronAPI.authMode.get()`              | `AuthModeGetResponse`      | mode のみ公開                               |
| `window.electronAPI.authMode.status()`           | `AuthModeStatusResponse`   | `message/errorCode/guidance` までに限定     |
| `window.electronAPI.authMode.validate(request?)` | `AuthModeValidateResponse` | 現在 mode か指定 mode の検証結果のみ公開    |
| `window.electronAPI.authMode.onModeChanged(cb)`  | `AuthModeChangedEvent`     | `status` を含むが資格情報そのものは含めない |

### Skill API 引数検証パターン（UT-FIX-SKILL-IMPORT-INTERFACE-001）

`skill:import` / `skill:remove` は Renderer から単一文字列 `skillName` を受け取る契約に統一する。

| チャンネル     | 検証条件                                                       | エラー                                                      |
| -------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
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
- skill:get-detail / skill:update のような skill 管理系 IPC は object payload を標準化し、`{ skillId }` / `{ skillName, updates }` を明示する
- `skill:get-detail` は Preload 側で `safeInvokeUnwrap` を使うため、Main の失敗応答を `null` で曖昧化しない
- `skill:update` は P44（構造ドリフト）と P45（命名ドリフト）を同時監視し、send/receive の双方を object payload に揃える

| 検証項目             | 確認方法                                        |
| -------------------- | ----------------------------------------------- |
| 引数形式一致         | ハンドラ型定義 vs Preload `safeInvoke` 呼び出し |
| 引数名セマンティクス | 実際の値が `skillId` か `skillName` か確認      |
| バリデーション網羅   | `typeof` + `=== ""` + `.trim() === ""` の3段    |

---

### Skill Fork API セキュリティパターン（TASK-9E）

`skill:fork` は Skill API ドメインのフォーク専用チャネルとして実装する。`skill-creator:fork` と混同せず、送信元検証・入力検証・パス境界検証を多層で適用する。

| セキュリティ観点 | 実装                                                                                                                       | 確認ポイント                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Sender検証       | `validateIpcSender(event, IPC_CHANNELS.SKILL_FORK, { getAllowedWindows: () => [mainWindow] })`                             | DevTools/未許可windowからの呼び出し拒否 |
| 入力検証（P42）  | `sourceSkill`/`newName` は `typeof` + 空文字 + `trim()` 3段検証、`copy*` は boolean、`modifyAllowedTools` は非空文字列配列 | IPC契約とPreload契約の一致              |
| サービス境界検証 | `SkillForker.validatePath()` で `path.relative` ベースの境界判定を実施（`/skills` と `/skills-evil` の prefix 衝突を拒否） | パストラバーサル/境界外書き込み防止     |
| 例外情報保護     | `sanitizeErrorMessage(error)` で内部パス/スタック情報をマスクして返却                                                      | 機密情報・内部構造の漏洩防止            |
| ハンドラー解除   | `unregisterSkillHandlers()` で `removeHandler(IPC_CHANNELS.SKILL_FORK)` を実施                                             | 再登録時の重複ハンドラ防止              |

### 実装時の苦戦箇所（TASK-9E）

| 苦戦箇所                                 | 問題                                                                       | 解決策                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| sender検証順序のばらつき                 | 入力検証を先に行うと unauthorized 呼び出しでも内部エラー系の返却が混在した | `validateIpcSender` を最初に固定し、その後に P42 検証を適用          |
| path境界判定のすり抜け                   | `startsWith` 判定だけでは `/skills-evil` を境界内と誤判定しうる            | `path.relative` による境界判定へ統一し、仕様書にも境界検証方式を明記 |
| `skill:fork` / `skill-creator:fork` 混同 | 類似チャネル名によりレビュー時の対象範囲がぶれた                           | Security/API/Interface の3仕様で責務境界を同時追記し、契約を分離管理 |

### 同種課題の簡潔解決手順（4ステップ）

1. セキュリティ検証順序を `sender -> P42 -> 境界検証 -> サニタイズ` で固定する。
2. path検証は prefix 比較を避け、`path.relative` で境界判定する。
3. 近似チャネルは責務境界表を API/Interface/Security に同時反映する。
4. 仕様更新後にセキュリティ系テストと `verify-all-specs` を連続実行する。

---



---

## 続き

後半コンテンツは分割ファイルを参照:
- [security-electron-ipc-examples.md](security-electron-ipc-examples.md) — IPC実装例（historyAPI、notificationAPI等）
