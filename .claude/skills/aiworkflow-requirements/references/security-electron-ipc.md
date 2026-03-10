# Electron IPCセキュリティ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [security-api-electron.md](./security-api-electron.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.18.1    | 2026-03-10 | TASK-UI-04A-WORKSPACE-LAYOUT を反映: file watch IPC lifecycle（`file:watch-start` / `file:watch-stop` / `file:changed`）の sender push、Renderer cleanup、module scope guard、`FILE_CHANGED` を subscribe 専用に保つ allowlist 契約を追加 |
| v1.18.0    | 2026-03-10 | TASK-FIX-SAFEINVOKE-TIMEOUT-001 を反映: Preload `invokeWithTimeout()` の timeout + timer cleanup 契約（`IPC_TIMEOUT_MS = 5000`、allowlist fail-fast、`clearTimeout` cleanup、timeout error 形式）を追加。Phase 11 screenshot 4件と preload 19 files / 551 tests の検証証跡を完了状態へ同期し、rollout scope を file 単位で再監査する運用を追記 |
| v1.17.1    | 2026-03-08 | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 苦戦箇所追記: IPC ハンドラライフサイクル管理セクションに `sanitizeRegistrationErrorMessage` によるパスマスクのセキュリティ意図、部分登録失敗時のフェイルセキュア確認、同種課題向け4ステップ手順を追加 |
| v1.17.0    | 2026-03-08 | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 再監査を反映: Graceful Degradation のログ出力にユーザーホーム配下パスの `~` マスクを追加し、Phase 11 スクリーンショット検証完了状態へ同期。関連未タスクリンクを撤去 |
| v1.16.1    | 2026-03-08 | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 反映: IPC ハンドラライフサイクル管理セクションに `IpcHandlerRegistrationResult` 戻り値契約と `safeRegister` による個別 try-catch の Graceful Degradation 仕様を追記。フェイルセキュア考慮事項を明文化 |
| v1.16.0    | 2026-03-08 | TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 完了記録: Profile/Avatar fallback 登録パターンセクション（v1.15.0で追加済み）の完了タスク反映。`registerProfileFallbackHandlers` / `registerAvatarFallbackHandlers` の検証基準（チャネル数一致・排他分岐・error envelope統一）を確定 |
| v1.15.0    | 2026-03-08 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 完了記録: ApiKeysSection 契約防御ガードセクション追加（GAP-01〜GAP-06テーブル、59テスト全PASS、カバレッジ実績値）。完了タスクテーブルに追加。architecture-implementation-patterns.md S29 との相互参照を設定                                                                                                   |
| v1.14.0    | 2026-03-07 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 反映: apiKeyAPI `apiKey:list` レスポンスバリデーション（`Array.isArray(providers)` + 要素 shape type predicate フィルタ）を追加。profileHandlers `identities` の `?? []` → `Array.isArray` パターン統一。Renderer 5層防御構造（namespace存在 → shape正規化 → 配列保証 → 要素フィルタ → 例外キャッチ）を明文化 |
| v1.13.1    | 2026-03-07 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 反映: ApiKeysSection の providers 要素 shape 検証（`provider/status` 必須）を Renderer 境界防御パターンへ追記。非配列防御に加えて malformed 要素混在時の継続表示を明文化                                                                                                                                         |
| v1.13.0    | 2026-03-07 | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 反映: Renderer 境界での Preload Payload 防御パターン（namespace/メソッド/iterable/エラー安全アクセスの4層）を追加。task-04（safeInvoke）との責務分離を明文化                                                                                                                                         |
| v1.12.5    | 2026-03-06 | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 反映: `auth-mode:*` の sender 検証順序、許可 origin、error envelope、`safeInvoke` / `safeOn` 公開境界、token/API Key マスキング方針を追加                                                                                                                                                                          |
| v1.12.4    | 2026-03-05 | TASK-10A-E-A 追補: skillShareAPI セクションへ「実装時の苦戦箇所（セキュリティ観点）」と5ステップ手順を追加。sender優先検証、`code/errorCode` 二軸固定、Step 2同時同期を標準化                                                                                                                                                                                |
| v1.12.3    | 2026-03-05 | TASK-10A-E-A 反映: `skill:importFromSource/export/validateSource` の sender失敗を `ERR_2004` で返す契約を追加し、validation `ERR_1001` / unknown例外 `ERR_5001` の3分類を固定。`IPC_CHANNELS` 定数参照と `Internal error` 正規化を追記                                                                                                                       |
| v1.12.2    | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: `skill:execute` の認証失敗コード伝搬（`errorCode`）と Renderer 側 preflight ガード（`auth-key:exists`）の運用境界を追加。実行前停止と sender検証順序の整合を明文化                                                                                                                                             |
| v1.12.1    | 2026-03-03 | UT-UI-05A-GETFILETREE-001 完了同期: skillFileAPI セクションを `skill:getFileTree` 含む 7 invoke チャネルへ更新。ホワイトリスト/4層防御/エラーサニタイズの適用範囲を拡張し、関連タスクを TASK-9A-B + UT-UI-05A-GETFILETREE-001 に更新                                                                                                                         |
| v1.12.0    | 2026-03-02 | TASK-UI-05B仕様整合: skillChainAPI（TASK-9D、5ch、validateIpcSender + P42準拠3段バリデーション + sanitizeErrorMessage）とskillScheduleAPI（TASK-9G、5ch、既存セクション欠落の補完）のセキュリティ実装パターンを追加                                                                                                                                          |
| v1.11.1    | 2026-02-28 | TASK-9E追補: セキュリティ観点の苦戦箇所3件（sender検証順序、path境界判定、契約境界混同）と同種課題向け4ステップ手順を追加                                                                                                                                                                                                                                    |
| v1.11.0    | 2026-02-28 | TASK-9E反映: `skill:fork` セキュリティ実装パターンを追加。`validateIpcSender`、P42準拠3段バリデーション、`SkillForker.validatePath` の境界検証（prefix一致すり抜け防止）、エラーサニタイズを仕様化                                                                                                                                                           |
| v1.10.0    | 2026-02-27 | TASK-9H反映: skillDebugAPI セキュリティ実装パターン追加（validateIpcSender + P42準拠3段バリデーション + vmサンドボックス式評価 + セッションID整合検証）。7チャネル（invoke 6 + event 1）を仕様化                                                                                                                                                             |
| v1.11.0    | 2026-02-28 | TASK-9I反映: skillDocsAPI セキュリティ実装パターン追加（sender 検証 + P42準拠3段バリデーション + 許可値チェック + パストラバーサル二重防御 + エラー正規化）。4チャンネル、64テストPASS                                                                                                                                                                       |
| v1.11.1    | 2026-02-28 | TASK-9J追補: 「実装時の苦戦箇所」セクションを追加。P42検証分散・許可値チェック漏れ・内部エラー露出リスクの再発防止ルールを明文化                                                                                                                                                                                                                             |
| v1.11.0    | 2026-02-28 | TASK-9J反映: skillAnalyticsAPI セキュリティ実装パターン追加（validateIpcSender + validateStringArg共通化 + 許可値リスト + toIpcErrorResponse正規化）。5チャンネル、37テストPASS                                                                                                                                                                              |
| v1.10.0    | 2026-02-27 | TASK-9G反映: skillScheduleAPI セキュリティ実装パターン追加（sender 検証 + P42準拠3段バリデーション + schedule種別ごとの必須検証 + 内部エラー正規化）。5チャンネル、163テストPASS（desktop 158 + shared 5）                                                                                                                                                   |
| v1.9.0     | 2026-02-27 | TASK-9F反映: skillShareAPIセキュリティ実装パターン追加（validateIpcSender + isPlainObject構造検証 + P42準拠3段バリデーション + 許可値チェック）。3チャンネル、92テスト全PASS                                                                                                                                                                                 |
| v1.8.0     | 2026-02-25 | UT-IPC-AUTH-HANDLE-DUPLICATE-001反映: AUTH IPC登録一元化パターンを追加。重複登録式の宣言的集約と fallback 経路の追跡性維持を明文化                                                                                                                                                                                                                           |
| v1.7.0     | 2026-02-21 | 契約ドリフト防止（P44/P45対策）セクション追加: ipc-contract-checklist.md参照・3箇所同時更新ルール・3段バリデーション検証テーブルを明文化                                                                                                                                                                                                                     |
| v1.6.0     | 2026-02-21 | UT-FIX-SKILL-IMPORT-INTERFACE-001反映: Skill API（`skill:import`/`skill:remove`）の引数検証パターンを `skillName` 非空文字列（`trim()`含む）へ統一し、契約ドリフト対策を明文化                                                                                                                                                                               |
| v1.5.0     | 2026-02-19 | TASK-9A-B: skillFileAPIセキュリティ実装パターン追加（validateIpcSender + 引数バリデーション + SkillFileManager内部検証 + isKnownSkillFileErrorエラーサニタイズ）。6チャンネル、65テスト全PASS                                                                                                                                                                |
| v1.4.0     | 2026-02-14 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラライフサイクル管理セクション追加（二重登録防止パターン）                                                                                                                                                                                                                                                      |
| v1.3.1     | 2026-02-12 | UT-9B-H-003仕様追補: skillCreatorHandlers.ts 実装に合わせ、エラーサニタイズ仕様（既定文言/パス・機密情報マスク）と schemaName ホワイトリスト検証の返却値を明記                                                                                                                                                                                               |
| v1.3.0     | 2026-02-12 | UT-9B-H-003: SkillCreator IPCセキュリティ強化完了。validatePath（パストラバーサル防止）、sanitizeErrorMessage（内部情報漏洩防止）、ALLOWED_SCHEMA_NAMES（スキーマ名ホワイトリスト）追加。116テスト全PASS                                                                                                                                                     |
| v1.2.0     | 2026-02-12 | TASK-9B-H: skillCreatorAPIセキュリティ実装例追加。6チャンネル、Sender検証、エラーサニタイズ仕様                                                                                                                                                                                                                                                              |
| v1.1.0     | 2026-01-26 | コードブロックを表形式・文章に変換（ガイドライン準拠）                                                                                                                                                                                                                                                                                                       |
| v1.0.0     | -          | 初版作成                                                                                                                                                                                                                                                                                                                                                     |

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

## 実装例: skillCreatorAPI

**実装場所**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`
- Preload API: `apps/desktop/src/preload/skill-creator-api.ts`
- ハンドラー: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- 型定義: `apps/desktop/src/preload/types.ts`

**チャンネルホワイトリスト方式**:

`SKILL_CREATOR_CHANNELS`定数として、許可されたIPCチャンネルのみを定義する。invoke用5チャンネル、on用1チャンネルの計6チャンネルを管理する。

| 定数名                        | チャンネル名                    | 用途           | ホワイトリスト |
| ----------------------------- | ------------------------------- | -------------- | -------------- |
| SKILL_CREATOR_DETECT_MODE     | `skill-creator:detect-mode`     | モード自動判定 | ALLOWED_INVOKE |
| SKILL_CREATOR_CREATE          | `skill-creator:create`          | スキル新規作成 | ALLOWED_INVOKE |
| SKILL_CREATOR_EXECUTE_TASKS   | `skill-creator:execute-tasks`   | タスク群実行   | ALLOWED_INVOKE |
| SKILL_CREATOR_VALIDATE        | `skill-creator:validate`        | スキル検証     | ALLOWED_INVOKE |
| SKILL_CREATOR_VALIDATE_SCHEMA | `skill-creator:validate-schema` | スキーマ検証   | ALLOWED_INVOKE |
| SKILL_CREATOR_PROGRESS        | `skill-creator:progress`        | 進捗通知       | ALLOWED_ON     |

**実装場所**: `apps/desktop/src/preload/channels.ts`

**セキュリティ検証パターン**:

全5 invokeハンドラーで以下のセキュリティ検証を実施する:

1. **Sender検証**: `validateIpcSender(event, mainWindow)` で送信元BrowserWindowを検証。DevToolsからの呼び出しを検出・拒否
2. **引数バリデーション**: typeof手動チェック + `validatePath()` によるパストラバーサル/NULLバイト/UNCパス検証
3. **スキーマ名ホワイトリスト**: `ALLOWED_SCHEMA_NAMES`（`task-spec`/`skill-spec`/`mode`）以外を拒否
4. **エラーサニタイズ**: `sanitizeErrorMessage()` でスタックトレース・ファイルパス・機密文字列（token/key/password/secret）をマスクして返却

**エラーサニタイズ仕様**:

| 入力パターン                 | 返却メッセージ                                            |
| ---------------------------- | --------------------------------------------------------- |
| 引数バリデーションエラー     | 各ハンドラー定義の日本語エラーメッセージを返却            |
| パストラバーサル検出         | `"無効なパスが指定されました: <paramName>"`               |
| schemaNameホワイトリスト違反 | `"無効なスキーマ名が指定されました: <schemaName>"`        |
| Sender検証失敗               | `"Unauthorized IPC sender"`                               |
| Errorオブジェクト            | `sanitizeErrorMessage()` でサニタイズした `error.message` |
| Error以外のthrown value      | `"スキル作成処理でエラーが発生しました"`                  |

**IPCセキュリティ要件**:

| 要件                         | 実装                                    | 確認方法                           |
| ---------------------------- | --------------------------------------- | ---------------------------------- |
| ホワイトリスト（チャンネル） | `SKILL_CREATOR_CHANNELS`定数で管理      | 定義外チャンネルはエラー           |
| sender検証                   | `validateIpcSender()`                   | DevTools/外部からの拒否            |
| 型安全性                     | `IpcResult<T>`型で統一                  | TypeScript型チェック               |
| サンドボックス分離           | contextBridgeで公開                     | contextIsolation=true              |
| 引数検証                     | 各ハンドラーでtypeof + `validatePath()` | バリデーションテスト               |
| ホワイトリスト（schemaName） | `ALLOWED_SCHEMA_NAMES` で検証           | 不正値入力テスト                   |
| エラーサニタイズ             | `sanitizeErrorMessage()` でマスク返却   | スタック/パス/機密情報非露出テスト |

**関連タスク**: TASK-9B-H-SKILL-CREATOR-IPC（2026-02-12完了）

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

## 実装例: skillDebugAPI（TASK-9H）

スキルデバッグ（セッション開始・コマンド実行・ブレークポイント管理・式評価）の7チャネルに適用するセキュリティパターン。

### チャネル定数定義

| 定数名                        | チャネル名                      | 方向          |
| ----------------------------- | ------------------------------- | ------------- |
| SKILL_DEBUG_START             | `skill:debug:start`             | invoke (R->M) |
| SKILL_DEBUG_COMMAND           | `skill:debug:command`           | invoke (R->M) |
| SKILL_DEBUG_BREAKPOINT_ADD    | `skill:debug:breakpoint:add`    | invoke (R->M) |
| SKILL_DEBUG_BREAKPOINT_REMOVE | `skill:debug:breakpoint:remove` | invoke (R->M) |
| SKILL_DEBUG_INSPECT           | `skill:debug:inspect`           | invoke (R->M) |
| SKILL_DEBUG_EVALUATE          | `skill:debug:evaluate`          | invoke (R->M) |
| SKILL_DEBUG_EVENT             | `skill:debug:event`             | on (M->R)     |

### セキュリティ検証4層構造（invoke 6チャネル共通）

| 層                          | 検証項目                                                      | 実装                                                                           | 返却仕様                                                              |
| --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 1. Sender検証               | 送信元ウィンドウの正当性                                      | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時: `toIPCValidationError(validation)`                            |
| 2. P42準拠3段バリデーション | 文字列フィールドの型・空文字列・trim空文字列                  | `typeof value === "string"` + `value.trim() !== ""`                            | 不正時: `{ success: false, error: "... must be a non-empty string" }` |
| 3. 契約値検証               | `command` 許可値、`breakpoint` オブジェクト、`sessionId` 一致 | `VALID_DEBUG_COMMANDS` / `validateSessionId`                                   | 不正時: `command must be one of ...` / `Session ID mismatch ...`      |
| 4. サンドボックス実行制約   | 式評価時のプロセス境界                                        | `vm.createContext` + `vm.runInContext(..., { timeout })`                       | タイムアウト時: `Expression evaluation timed out`                     |

### チャネル別バリデーション詳細

| チャネル                        | バリデーション項目                                    |
| ------------------------------- | ----------------------------------------------------- |
| `skill:debug:start`             | `skillName`/`prompt` 非空文字列、`breakpoints` 配列   |
| `skill:debug:command`           | `sessionId` 非空文字列、`command` が6許可値のいずれか |
| `skill:debug:breakpoint:add`    | `sessionId` 非空文字列、`breakpoint` が object        |
| `skill:debug:breakpoint:remove` | `sessionId`/`breakpointId` 非空文字列                 |
| `skill:debug:inspect`           | `sessionId`/`path` 非空文字列                         |
| `skill:debug:evaluate`          | `sessionId`/`expression` 非空文字列 + paused 状態     |

### 実装上の苦戦箇所（TASK-9H）

| 苦戦箇所                     | 問題                                                   | 解決策                                                                                    |
| ---------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| ハンドラ実装と起動配線の分離 | `skillDebugHandlers.ts` 実装のみではランタイム未到達   | `registerAllIpcHandlers` に `registerSkillDebugHandlers(mainWindow)` を追加して配線を固定 |
| イベントチャネルの扱い誤解   | `skill:debug:event` を invoke 側に誤って混在させやすい | event は `ALLOWED_ON_CHANNELS` のみに登録し、`webContents.send` 専用と明示                |
| サンドボックス例外の露出     | `vm` 例外をそのまま返すと内部情報漏洩リスク            | エラーメッセージをハンドラでサニタイズし、戻り値は統一 `success/error` 契約に限定         |

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

| 定数名               | チャネル名             | 方向         |
| -------------------- | ---------------------- | ------------ |
| SKILL_DOCS_GENERATE  | `skill:docs:generate`  | invoke (R→M) |
| SKILL_DOCS_PREVIEW   | `skill:docs:preview`   | invoke (R→M) |
| SKILL_DOCS_EXPORT    | `skill:docs:export`    | invoke (R→M) |
| SKILL_DOCS_TEMPLATES | `skill:docs:templates` | invoke (R→M) |

### セキュリティ検証4層構造

| 層                          | 検証項目                                                                                      | 実装                                                                           | 返却仕様                                    |
| --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| 1. Sender検証               | 送信元ウィンドウの正当性                                                                      | `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` | 不正時: `toIPCValidationError(validation)`  |
| 2. P42準拠3段バリデーション | `skillName`/`outputPath` の型・空文字列・trim空文字列                                         | `typeof === "string"` + `trim() !== ""`                                        | 不正時: `{ success: false, error: string }` |
| 3. 入力制約検証             | `outputFormat`/`language` 許可値、boolean 型、`customSections` 文字列配列、`doc` オブジェクト | ハンドラー内の条件分岐検証                                                     | 不正時: `{ success: false, error: string }` |
| 4. エラー境界               | 例外情報の外部露出を防止                                                                      | `catch` で unknown を `"Internal error"` へ正規化                              | 内部情報漏えい防止                          |

### チャネル別バリデーション詳細

| チャネル               | バリデーション項目                                                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skill:docs:generate`  | `request` オブジェクト、`skillName` 非空文字列、`outputFormat` (`markdown/html`)、`includeExamples` boolean、`includeApiReference` boolean、`language` (`ja/en`)、`customSections` 文字列配列 |
| `skill:docs:preview`   | `args` オブジェクト、`skillName` 非空文字列                                                                                                                                                   |
| `skill:docs:export`    | `args` オブジェクト、`doc` オブジェクト、`outputPath` 非空文字列、`..` を含むパス拒否                                                                                                         |
| `skill:docs:templates` | Sender検証のみ                                                                                                                                                                                |

### 追加防御（export）

| 防御層     | 実装位置                               | 内容                                   |
| ---------- | -------------------------------------- | -------------------------------------- |
| IPC 層     | `registerSkillDocsHandlers`            | `outputPath.includes("..")` を即時拒否 |
| サービス層 | `SkillDocGenerator.validateOutputPath` | `path.resolve` + `..` 検証で再確認     |

### 実装時の苦戦箇所（TASK-9I）

| 苦戦箇所                 | 問題                                                          | 解決策                                                      |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------- |
| 共有型 root export 漏れ  | `@repo/shared` から docs 型を参照できず型エラー               | `packages/shared/index.ts` に 5型を明示 export              |
| サービス契約不一致       | `listSkillFiles()` 呼び出しと `SkillFileManager` API が不整合 | `SkillFileManager.listSkillFiles()` を追加し API 契約を一致 |
| 「検証済み」と実態の乖離 | documentation-changelog に Step が未完了のまま残存            | Step 単位の完了チェックと実行証跡を同時更新                 |

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

| チャンネル                 | validateIpcSender |     sanitizeError     | getAllowedWindows | IPC_CHANNELS定数 |      3段バリデーション       |
| -------------------------- | :---------------: | :-------------------: | :---------------: | :--------------: | :--------------------------: |
| skill:analytics:record     |        OK         | OK ("Internal error") |        OK         |        OK        |  OK (skillName, eventType)   |
| skill:analytics:statistics |        OK         | OK ("Internal error") |        OK         |        OK        |        OK (skillName)        |
| skill:analytics:summary    |        OK         | OK ("Internal error") |        OK         |        OK        |        N/A (引数なし)        |
| skill:analytics:trend      |        OK         | OK ("Internal error") |        OK         |        OK        | OK (start, end, granularity) |
| skill:analytics:export     |        OK         | OK ("Internal error") |        OK         |        OK        |         OK (format)          |

### バリデーション詳細

- **validateStringArg ヘルパー**: P42準拠3段バリデーション（typeof !== "string" → === "" → .trim() === ""）を共通化
- **isPlainObject**: 引数がプレーンオブジェクトであることを検証
- **許可値リスト**: ALLOWED_EVENT_TYPES, ALLOWED_GRANULARITIES, ALLOWED_FORMATS でホワイトリスト検証
- **toIpcErrorResponse**: 全 catch ブロックで内部エラー情報を "Internal error" に正規化

### 実装時の苦戦箇所（TASK-9J）

| 苦戦箇所                   | 課題                                                        | 対処                                              | 標準ルール                                   |
| -------------------------- | ----------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| 文字列検証ロジックの分散   | ハンドラごとにバリデーション実装がばらつくと品質差が出る    | `validateStringArg` へ統一して5ハンドラへ適用     | P42 3段検証はヘルパー化し個別実装を禁止      |
| 許可値チェックの抜け漏れ   | `eventType` / `granularity` / `format` の検証粒度が揃わない | 3つの ALLOWED\_\* 定数を導入してホワイトリスト化  | enum相当入力は必ず ALLOWED\_\* で一元検証    |
| 内部エラー情報の露出リスク | 例外内容をそのまま返すと情報漏えいにつながる                | `toIpcErrorResponse` で "Internal error" に正規化 | catch 節はすべてサニタイズ関数経由で返却する |

**関連タスク**: TASK-9J（2026-02-28完了）

---

## 実装例: `skill:execute` 認証 preflight ガード（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001）

`skill:execute` は Renderer 実行前に `auth-key:exists` を確認し、認証キー未設定時は Main へ実行を送らず停止する。加えて Main 側は最終防衛として `AUTHENTICATION_ERROR` を `errorCode` 付きで返却する。

### セキュリティ境界

| 層                 | 実装                                                        | セキュリティ意図                         |
| ------------------ | ----------------------------------------------------------- | ---------------------------------------- |
| Renderer preflight | `preflightSkillExecutionAuth()`                             | 不要な実行を事前停止し、設定誘導を明確化 |
| Main sender検証    | `validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, ...)` | DevTools/未許可windowからの呼び出し拒否  |
| Main 失敗契約      | `{ success:false, error, errorCode?: string }`              | 認証失敗を識別可能にして復旧導線を保証   |
| Preload unwrap     | `Error.code = result.errorCode`                             | Renderer 側の例外分岐を型安全に維持      |

### 検証順序（標準）

1. sender 検証（Main）
2. preflight 判定（Renderer）
3. 実行処理（Main）
4. エラーコード伝搬（Main -> Preload -> Renderer）

### 既知リスクと対策

| リスク                           | 対策                                                                  |
| -------------------------------- | --------------------------------------------------------------------- |
| preflight 判定と実行時判定の乖離 | `auth-key:exists` に env fallback を追加し `api-ipc-system.md` と同期 |
| 認証失敗が一般エラーに埋もれる   | `errorCode` を optional 追加し後方互換を維持しつつ分類                |
| UI層で重複実装が再発             | preflight utility を単一入口に固定                                    |

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

- [TASK-FIX-SAFEINVOKE-TIMEOUT-001 実装ガイド](../../../docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/outputs/phase-12/implementation-guide.md)
- [APIセキュリティ](./security-api.md)
- [スキル実行セキュリティ](./security-skill-execution.md)
- [AUTH IPC登録一元化 実装ガイド](../../../docs/30-workflows/ut-ipc-auth-handle-duplicate-001/outputs/phase-12/implementation-guide.md)

---

## safeInvoke タイムアウト + cleanup 契約（TASK-FIX-SAFEINVOKE-TIMEOUT-001）

Preload 共通 helper `invokeWithTimeout()` は、Renderer から Main への `invoke` 呼び出しが応答不能になった場合でも Promise を永続 pending にしないためのフェイルセーフ契約である。

| 観点 | 契約 |
| --- | --- |
| 対象実装 | `apps/desktop/src/preload/ipc-utils.ts` |
| timeout 定数 | `IPC_TIMEOUT_MS = 5000` |
| fail-fast | `allowedChannels.includes(channel)` に失敗したチャンネルは `ipcRenderer.invoke()` 前に即時 reject |
| timeout error | `IPC timeout: {channel} did not respond within 5000ms` |
| cleanup | 正常 resolve / reject の双方で `clearTimeout(timeoutId)` を実行し、短命 timer を残留させない |
| 後方互換 | `safeInvoke<T>(channel, ...args): Promise<T>` の公開シグネチャは不変 |
| rollout 監査 | `preload/index.ts` だけでなく `skill-api.ts` / `skill-creator-api.ts` など channel 境界ごとに file 単位で適用漏れを確認する |

### セキュリティ意図

- 応答不能ハンドラで Renderer が無限待機し続ける状態を防ぎ、安全側の reject に倒す。
- エラーメッセージは channel 名と timeout 値のみを含み、パス・token・stack trace は露出しない。
- cleanup はメモリ最適化だけでなく、fake timer テストや高頻度 invoke の再現性維持にも効く。

### 検証証跡

| 種別 | 結果 |
| --- | --- |
| preload 単体テスト | `src/preload/__tests__/ipc-utils.safeInvoke-timeout.test.ts` 15 tests PASS |
| preload 回帰 | `pnpm vitest run src/preload` → 19 files / 551 tests PASS |
| 型検証 | `pnpm typecheck` PASS |
| workflow 検証 | `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` 全 PASS |
| UI影響確認 | timeout fallback / settings shell の screenshot 4件を current workflow 配下で取得済み |

---

## 完了タスク

| タスクID                                       | 完了日     | ステータス | 概要                                                                                                                                                                                          |
| ---------------------------------------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001                | 2026-03-10 | 完了       | Preload `safeInvoke` を `invokeWithTimeout()` へ集約し、`IPC_TIMEOUT_MS = 5000` の timeout + `clearTimeout` cleanup を追加。allowlist fail-fast・error format・19 files / 551 tests PASS・Phase 11 screenshot 4件で完了確認 |
| TASK-9I                                        | 2026-02-28 | 完了       | スキルドキュメント4チャネルのセキュリティ実装。validateIpcSender + P42準拠3段バリデーション + 許可値検証 + export パストラバーサル二重防御 + エラー正規化を適用                               |
| TASK-9J                                        | 2026-02-28 | 完了       | スキル分析・統計5チャネルのセキュリティ実装。validateIpcSender + validateStringArg共通化 + 許可値リスト（ALLOWED_EVENT_TYPES/GRANULARITIES/FORMATS） + toIpcErrorResponse正規化。37テストPASS |
| TASK-9G                                        | 2026-02-27 | 完了       | スキルスケジュール5チャネルのセキュリティ実装。validateIpcSender + P42準拠3段バリデーション + 方式別必須検証 + エラー正規化を適用                                                             |
| TASK-9F                                        | 2026-02-27 | 完了       | スキル共有3チャネルのセキュリティ実装。validateIpcSender + isPlainObject構造検証 + P42準拠3段バリデーション + 許可値チェックの4層構造。92テスト全PASS                                         |
| 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 | 2026-03-08 | 完了       | ApiKeysSection Renderer 4層防御（API存在確認→レスポンス成功確認→配列正規化+type predicateフィルタ→UI更新）+ Main側 providers/identities 配列正規化。59テスト全PASS、Stmts 93.17%              |
| TASK-10A-E-A                                   | 2026-03-05 | 完了       | share 3チャネルの sender失敗を `ERR_2004`、validation失敗を `ERR_1001`、unknown例外を `ERR_5001` へ統一。`skillHandlers.share.ts` の `IPC_CHANNELS` 定数参照化でチャネルドリフトを抑止        |
| UT-IPC-AUTH-HANDLE-DUPLICATE-001               | 2026-02-25 | 完了       | AUTH 5チャネルの重複登録式を共通登録へ一元化し、契約互換を維持                                                                                                                                |
| TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001  | 2026-03-08 | 完了       | registerAllIpcHandlers に safeRegister ヘルパーを導入し、1ハンドラ例外時も後続ハンドラを登録継続する Graceful Degradation を実装。19テスト全PASS、Phase 11 スクリーンショット 3/3 PASS、ログサニタイズ反映済み |
