# Lessons Learned: IPC / Preload / AI Runtime（2026-04）

> 親ファイル: [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md)

## TASK-FIX-EXECUTE-PLAN-FF-001（2026-04-01）

### 教訓1: fire-and-forget の ack と compat path は同じ wave で閉じる

| 項目       | 内容                                                                                                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `skill-creator:execute-plan` を `{ accepted: true, planId }` の ack に切り替えると、preload の正本契約、Renderer consumer の compat path、snapshot relay を別々に直したくなるが、分けると contract drift が長期化する                  |
| 解決策     | `SkillCreatorExecutePlanAck` を preload の正本として定義し、Renderer は `SkillCreatorWorkflowUiSnapshot` の relay を受ける。旧 `RuntimeSkillCreatorExecuteResponse` は compat path のみで扱い、follow-up cleanup は backlog に分離する |
| 標準ルール | public IPC の戻り値を変更する場合は、ack の正本化・snapshot relay・compat shim の終端・follow-up backlog の 4 点を同一 wave で記録する                                                                                                 |

### 教訓2: 非同期 progress hook は internal phase と public snapshot を混ぜない

| 項目       | 内容                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | `SkillCreatorExecuteAsyncPhase` を renderer public へ露出させると、`SkillCreatorWorkflowPhase` と役割が重なり、UI は internal progress と workflow state を同列に誤解しやすい                          |
| 解決策     | `SkillCreatorExecuteAsyncPhase = "executing" \| "complete" \| "error"` は `SkillCreatorWorkflowEngine` の内部 hook に閉じ、Renderer へは `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の snapshot だけを送る |
| 標準ルール | internal progress label / public snapshot / renderer state の 3 層は混在させず、type 名と通知経路を別々に定義する                                                                                      |

---

## TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001（2026-03-31）

### 苦戦箇所1（L-BETTER-SQLITE3-ABI-001）: native addon ABI 不一致 — postinstall で自動 rebuild

| 項目     | 内容                                                                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | `pnpm install` 直後の `better-sqlite3` は Node.js ABI（127 = Node.js 22.x）向け prebuilt バイナリが入る。Electron 39.2.4 は ABI 140 を使う内部ランタイムを持つため、ABI 不一致で `ERR_DLOPEN_FAILED` になる |
| 症状     | Electron 起動時に `NODE_MODULE_VERSION 127 … requires NODE_MODULE_VERSION 140` → DB 初期化失敗 → IPC ハンドラ登録失敗                                                                                       |
| 解決策   | `apps/desktop/package.json` に `"postinstall": "pnpm rebuild:native"` を追加。`pnpm install` 後に自動で Electron ABI 向けに native addon を再コンパイルする                                                 |
| 注意点   | `esbuild` は workspace 内の version 競合で rebuild が失敗しやすいため `(pnpm rebuild esbuild \|\| true)` として best-effort 扱いにする。`better-sqlite3` は必須（`\|\| true` 不要）                         |
| 再発防止 | 新しい native addon を追加する際は `apps/desktop/package.json` の `rebuild:native` に対象を追加し、`pnpm --filter @repo/desktop rebuild:native` で動作確認する                                              |

---

## TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001（2026-03-31）

### 苦戦箇所1（L-PRELOAD-ALIAS-001）: externalizeDepsPlugin が resolve.alias より前に外部化判定を行う

| 項目     | 内容                                                                                                                                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | `externalizeDepsPlugin` が `config` フックで `rollupOptions.external` に `^(@repo/shared)/.+` 正規表現を設定するため、`resolve.alias` のみでは外部化を防げない                                                                                                            |
| 症状     | `apps/desktop/electron.vite.config.ts` preload セクションに `resolve.alias` を追加しても `out/preload/index.js` に `require("@repo/shared/src/ipc/channels")` が残存し続けた                                                                                              |
| 根本原因 | Rollup の external チェックはモジュール解決（`resolveId` フック）より**前**に実行される。`resolve.alias` は Vite のビルトイン alias プラグインとして `resolveId` フックで動作するため、alias 変換が間に合わない                                                           |
| 解決策   | `externalizeDepsPlugin({ exclude: ["@repo/shared"] })` と `resolve.alias` を組み合わせる。`exclude` により `rollupOptions.external` の正規表現から `@repo/shared` が除去され、alias が正常に機能する                                                                      |
| 安全性   | `@repo/shared` の他サブパスが preload で `import type` のみであることを確認してから `exclude` を適用すること。値インポートが存在する場合、意図しないバンドル増加が発生する                                                                                                |
| 再発防止 | `electron.vite.config.ts` の preload セクションで workspace パッケージのサブパスをバンドルに含める場合は、`externalizeDepsPlugin({ exclude: ["パッケージ名"] })` + `resolve.alias` の組み合わせが必要。`resolve.alias` 単独では機能しないことを仕様書設計時に明記すること |

---

## TASK-FIX-AUTH-IPC-001（2026-04-01）

### 教訓1（L-AUTH-IPC-001）: IPC channel timeout と fire-and-forget パターン

| 項目          | 内容                                                                                                                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題          | `auth:login` ハンドラーが `await authFlowOrchestrator.startOAuthFlow(provider)` で OAuth フロー完了を待機していた。OAuth は外部ブラウザ認証を含み完了まで数秒〜数十秒かかる。`CHANNEL_TIMEOUTS["auth:login"] = 500ms` との矛盾でタイムアウトエラーが発生 |
| 症状          | `[AuthSlice] Login error: Error: IPC timeout: auth:login did not respond within 500ms`                                                                                                                                                                   |
| 根本原因      | handler が長時間の非同期処理完了を await することで IPC レスポンスが遅延する。channel-specific timeout がある場合は特に注意が必要                                                                                                                        |
| 解決策        | `void authFlowOrchestrator.startOAuthFlow(provider).catch(console.error)` — fire-and-forget で即時返却する。バリデーション（invalid provider）のみ同期チェックして即時エラーを返す                                                                       |
| 標準ルール    | `CHANNEL_TIMEOUTS` で channel-specific timeout が設定されている IPC は、handler 内で timeout を超える可能性がある await を使わない。長時間処理は別イベント（`AUTH_STATE_CHANGED` など）で完了を通知する設計にする                                        |
| 5分解決カード | `ipc-utils.ts` の `CHANNEL_TIMEOUTS` を確認し、timeout 値を超える処理を `await` している handler があれば fire-and-forget に切り替え、完了通知を既存イベントに委譲する                                                                                   |

### 教訓2（L-AUTH-IPC-002）: AUTH_STATE_CHANGED 責務境界の分離

| 項目       | 内容                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `auth:login` handler が fire-and-forget 化した場合、OAuth 失敗時に handler が `AUTH_STATE_CHANGED` を二重送信するリスクがある                                                                                 |
| 解決策     | `authHandlers.ts` 側では `AUTH_STATE_CHANGED` を一切送信しない。成功・失敗の通知責務は `AuthFlowOrchestrator` に固定する。handler は「起動確認（success: true）」と「起動拒否（invalid provider）」のみを担う |
| 標準ルール | IPC handler と event emitter の責務を明確に分離する。handler は「受付」、orchestrator は「完了通知」。両方が同じイベントを送信すると Renderer 側で状態遷移の二重処理が発生する                                |
| 関連タスク | TASK-FIX-AUTH-IPC-001 / `authHandlers.ts:auth:login` / `authFlowOrchestrator.ts:startOAuthFlow`                                                                                                               |

---

## Phase-12 IPC 4層型同期（2026-04-06）

### L-IPC-4LAYER-001: IPC 4層型定義は shared 層に集約する

| 項目       | 内容                                                                                                                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | creatorHandlers（Main）→ SkillCreatorFacade（Service）→ Preload API → Renderer の4層で型定義が個別管理されており、Session Resume の `errorReason` フィールド（`expired` / `incompatible` / `not_found` の3分岐）が全層で同期されているか確認が困難だった |
| 症状       | Preload 層の型に `errorReason` を追加しても Renderer 側の型推論が古いまま残存。TypeScript は個別ファイルの型を参照するため、cross-layer の型同期漏れを静的に検出できない                                                                                 |
| 解決策     | Session Resume 関連の型（`SessionSummary` / `SessionDetail` / `SessionResumeResult` / `errorReason`）を `packages/shared/src/types/` に SSoT として定義し、4層すべてから import する。型変更は shared の1ファイルを修正すれば全層に波及する              |
| 標準ルール | 複数層にまたがる IPC 型は `packages/shared/src/types/` に集約し、各層では再定義せず import のみとする。Preload 側でもローカル型定義は避け、shared 型をそのまま export する                                                                               |
| 関連タスク | TASK-P0-08 session-resume-renderer-integration                                                                                                                                                                                                           |

### L-IPC-4LAYER-002: errorReason 3分岐は型 union で全層同期する

| 項目       | 内容                                                                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `errorReason: 'expired' \| 'incompatible' \| 'not_found'` が Main 側と Renderer 側で別々の string literal union として定義されていると、1分岐の追加が片側だけの修正で終わるリスクがある |
| 解決策     | shared の型定義で `SessionResumeErrorReason = 'expired' \| 'incompatible' \| 'not_found'` として export し、Main/Preload/Renderer の全3箇所でこの型を参照する                           |
| 検証方法   | `packages/shared` の型変更後に `pnpm typecheck --filter @repo/desktop` を実行し、全層のコンパイルエラーで同期漏れを検出する                                                             |
| 標準ルール | 分岐数が3以上の status/reason 型は必ず shared に抽出し、type alias として管理する。inline string literal は2値（boolean的）の場合のみ許容する                                           |
| 関連タスク | TASK-P0-08 session-resume-renderer-integration                                                                                                                                          |

### L-SESSION-RESUME-UI-001: SessionResumePrompt の snapshot nullability 設計パターン

| 項目       | 内容                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `SkillLifecyclePanel` が一次導線に昇格（TASK-UI-01）した後、`SessionResumePrompt` / `SessionIndicator` との画面遷移ロジックが複雑化した。`snapshot` が `null` の場合と `undefined` の場合で挙動を分けていたため、条件分岐が冗長化した |
| 解決策     | `snapshot` は `SkillCreatorWorkflowUiSnapshot \| null` に型を統一し、`undefined` は許容しない。`null` は「セッションなし」、非 null は「セッションあり（resume 可否判定が必要）」として意味を明確化する                               |
| パターン   | `const hasSession = snapshot !== null;` を単一の判定ポイントとし、resume プロンプト表示条件は `hasSession && !isSessionActive` の形で表現する。`snapshot?.sessionId` のような optional chaining の乱用を避ける                        |
| 標準ルール | 遷移条件が3分岐以上になる場合は nullability の型統一（`null` vs `undefined` の使い分け廃止）を最初に行う。`snapshot ?? null` パターンで undefined を早期に null へ正規化する                                                          |
| 関連タスク | TASK-P0-08 session-resume-renderer-integration / TASK-UI-01 lifecycle-panel-primary-route-promotion                                                                                                                                   |

---

## TASK-UT-RT-01 executeAsync エラー伝搬パス（2026-04-06）

---

## UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 IPC ハンドラ重複登録サイレントフェイル（2026-04-07）

### L-IPC-DEDUP-SNAPSHOT-001: ipcMain.handle() 重複登録はサイレント無視される — スナップショット CI で固定せよ

| 項目          | 内容                                                                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題          | `registerRuntimeSkillCreatorHandlers()` 内で `ipcMain.handle()` が同一チャネルに 2 回実行されていたが、ElectronJS は後続登録をサイレント無視するためランタイムエラーが発生しなかった。後続 14 チャネルが未登録のまま長期間放置されていた |
| 症状          | IPC チャネルが未登録でも `ipcMain` は例外を投げない。Renderer 側の呼び出しは応答なしでタイムアウトし、UI は「フリーズ」に見える。コードレビューのみに依存しては検出不可能                                                                |
| 根本原因      | 登録関数の完全性テストが存在せず、コードレビューのみで担保していた。重複ブロック（約 35 行）は `git blame` で追跡困難な形で混入                                                                                                          |
| 解決策        | `vi.hoisted` + `vi.mock("electron")` で `ipcMain.handle` を spy 化し、全 `handle()` 呼び出し引数を記録。ソート済みチャネル名配列を `toMatchSnapshot()` で固定する。`Set.size === Array.length` で重複検出をアサーション                  |
| 実装パターン  | `vi.hoisted(() => ({ mockIpcMainHandle: vi.fn() }))` で hoisted spy を定義し、`vi.mock("electron", ...)` でバインド。`beforeEach` で `vi.clearAllMocks()` + `vi.resetModules()` を実施して隔離する                                       |
| 標準ルール    | IPC ハンドラ登録関数（`register*Handlers`）を新規追加・変更する際は、スナップショットテストを必ず同時に作成・更新する。`--update-snapshots` は意図的変更時のみ許可し、コミットメッセージにチャネル変更の意図を明記する                   |
| 5分解決カード | 1) `vi.hoisted` で spy 定義 → 2) `vi.mock("electron")` でバインド → 3) 登録関数呼び出し → 4) `handle.mock.calls.map(a=>a[0]).sort()` でチャネル名取得 → 5) `toMatchSnapshot()` + `Set.size === length` アサーション                      |
| 関連タスク    | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 / TASK-FIX-IPC-SKILL-NAME-001                                                                                                                                                                |

---

### L-IPC-VARIADIC-001: IPC の第3引数は preload で明示的に通す

- **教訓**: Main 側で `webContents.send(channel, snapshot, errorMessage)` としても、preload の `safeOn` が 1 引数固定だと errorMessage は Renderer に届かない
- **対策**: multi-arg event は preload bridge を variadic 化し、Renderer 側 callback でも optional errorMessage を受け取る
- **コード例**:
  ```typescript
  // preload 側
  safeOn<[SkillCreatorWorkflowUiSnapshot | null, string?]>(
    ipcRenderer,
    SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
    (snapshot, errorMessage) => callback(snapshot, errorMessage),
  );
  ```
- **適用範囲**: snapshot 以外のメタ情報（errorMessage など）を同一 IPC イベントで流したい場合の標準パターン
- **発見日**: 2026-04-06

### L-RT01-CALLBACK-GUARD-001: エラーコールバックを `if (!snapshot)` 等の条件でガードしない

- **教訓**: `if (!snapshot) { onWorkflowStateSnapshot(null, error.message); }` のように snapshot 存在チェックでエラーコールバックをガードすると、snapshot が存在するパスでエラーメッセージが Renderer に届かず無音失敗する
- **対策**: `callback(snapshot ?? null, error)` パターンで常にエラーを渡す
- **コード例**:
  ```typescript
  // NG: if (!snapshot) でガードするとエラーが隠れる
  // if (!snapshot) {
  //   onWorkflowStateSnapshot(null, error.message);
  // }

  // OK: snapshot の有無にかかわらず常にエラーを渡す
  onWorkflowStateSnapshot(
    snapshot ?? null,
    error instanceof Error ? error.message : String(error),
  );
  ```
- **適用範囲**: fire-and-forget 型の executeAsync ラッパー全般。catch ブロックと structured error パスの両方に適用する
- **発見元**: TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001
- **発見日**: 2026-04-07

### L-SC13-IPC-001: IPC surface 追加時は `ALLOWED_INVOKE_CHANNELS` 追記が必須

- **教訓**: `packages/shared/src/ipc/channels.ts` に定数を追加し `ipcMain.handle()` を登録しても、`apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に追記しなければ Renderer から呼び出せない
- **症状**: `ipcRenderer.invoke("skill-creator:verify", ...)` が Electron の `DISALLOWED_CHANNEL` エラーでリジェクトされる
- **対策**: IPC surface 追加タスクのチェックリストに「`ALLOWED_INVOKE_CHANNELS` への追記」を必須項目として追加する
- **発見元**: TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION
- **発見日**: 2026-04-08

### L-SC13-IPC-002: 公開 surface と内部エンジンで名前が酷似する場合は DTO 変換表を Phase 2 成果物に必須化

- **教訓**: `RuntimeSkillCreatorFacade.verifySkill(skillDir)` が既に存在する状態で公開 `verify(skillName, ...)` を追加すると、コードレビュー時に責務・引数・返り値の差分が不明確になる
- **対策**: Phase 2 設計成果物に「内部型 → 公開 DTO 変換表」を必須項目として追加し、フィールド名マッピング（`id→checkId` / `summary→label` など）を明文化する
- **補足**: 解決レイヤ（`resolveVerifySkillDir(skillName)` 等）を Phase 2 で先に命名しておくと設計の揺れを防げる
- **発見元**: TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION
- **発見日**: 2026-04-08
