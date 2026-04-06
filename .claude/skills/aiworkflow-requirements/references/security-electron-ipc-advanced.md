# Electron IPCセキュリティ / advanced specification

> 親仕様書: [security-electron-ipc.md](security-electron-ipc.md)
> 役割: advanced specification

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

#### Skill Docs 4チャンネル セキュリティ (TASK-IMP-SKILL-DOCS-AI-RUNTIME-001)

4チャンネル（generate/preview/export/templates）に4層セキュリティ適用:
1. **sender検証**: validateIpcSender() で webContents.id を検証
2. **P42 3段バリデーション**: validateStringArg() で型チェック → 空文字列 → .trim()空文字列
3. **入力制約**: outputFormat / language の enum 値検証
4. **エラー境界**: try-catch で内部エラーをサニタイズしてから返却

**テスト**: skillHandlers.docs.test.ts 37テスト（P42/sender/パストラバーサル回帰含む）

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
| Main exists 判定   | `auth-key:exists -> { exists, source }`                     | 判定根拠を返しつつキー実値は非公開       |
| Main sender検証    | `validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, ...)` | DevTools/未許可windowからの呼び出し拒否  |
| Main 失敗契約      | `{ success:false, error, errorCode?: string }`              | 認証失敗を識別可能にして復旧導線を保証   |
| Preload unwrap     | `Error.code = result.errorCode`                             | Renderer 側の例外分岐を型安全に維持      |

### 検証順序（標準）

1. sender 検証（Main）
2. preflight 判定（Renderer）
3. 実行処理（Main）
4. エラーコード伝搬（Main -> Preload -> Renderer）

### 既知リスクと対策

| リスク                           | 対策                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| preflight 判定と実行時判定の乖離 | `auth-key:exists` を `{ exists, source }` 契約へ拡張し、`env-fallback` 判定根拠をUIへ明示        |
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

## safeInvoke / invokeWithTimeout チャンネル別 timeout + cleanup 契約（TASK-FIX-IPC-TIMEOUT-001）

Preload 共通 helper `invokeWithTimeout()` は、Renderer から Main への `invoke` 呼び出しが応答不能になった場合でも Promise を永続 pending にしないためのフェイルセーフ契約である。`CHANNEL_TIMEOUTS` によるチャンネル別 timeout と `IPC_TIMEOUT_MS` fallback を併用する。

| 観点 | 契約 |
| --- | --- |
| 対象実装 | `apps/desktop/src/preload/ipc-utils.ts` |
| timeout 定数 | `IPC_TIMEOUT_MS = 5000`（fallback） |
| channel override | `CHANNEL_TIMEOUTS` に `auth:login=500`, `auth:get-session=10000`, `auth:refresh=10000`, `skill-creator:plan=30000`, `skill:execute=60000` を定義 |
| timeout resolver | `getChannelTimeout(channel)` が `CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS` を返す |
| fail-fast | `allowedChannels.includes(channel)` に失敗したチャンネルは `ipcRenderer.invoke()` 前に即時 reject |
| timeout error | `IPC timeout: {channel} did not respond within {resolvedTimeout}ms` |
| cleanup | 正常 resolve / reject の双方で `clearTimeout(timeoutId)` を実行し、短命 timer を残留させない |
| 後方互換 | `safeInvoke<T>(channel, ...args): Promise<T>` の公開シグネチャは不変。`getChannelTimeout` 追加後も呼び出し側変更は不要 |
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
