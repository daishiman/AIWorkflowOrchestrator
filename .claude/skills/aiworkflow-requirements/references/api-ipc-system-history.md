# システムIPC・AIプロバイダーAPI連携 / history bundle

> 親仕様書: [api-ipc-system.md](api-ipc-system.md)
> 役割: history bundle

## 関連ドキュメント

- [APIエンドポイント概要](./api-endpoints.md)
- [認証・プロフィールIPC](./api-ipc-auth.md)
- [Agent Dashboard IPC](./api-ipc-agent.md)
- [RAGサービス群](./rag-services.md)

---

## 完了タスク

### TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001（2026-03-08完了）

| 項目             | 内容                                                                                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001                                                                                                                                                       |
| 反映対象         | `registerAllIpcHandlers` の Graceful Degradation                                                                                                                                                    |
| 主要変更         | `safeRegister()` ヘルパーで各ハンドラ登録を個別 try-catch 化。`IpcHandlerRegistrationResult`（`successCount`/`failureCount`/`failures`）を戻り値として返却。エラーコード 4001（Infrastructure Error） |
| 検証             | 個別失敗テスト + 全成功テスト + 戻り値検証テスト PASS                                                                                                                                              |
| 関連ドキュメント | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/outputs/`                                                                                                                       |

#### Graceful Degradation 実装パターン詳細

**型定義**:

| 型名                            | 目的               | フィールド                                                                                  |
| ------------------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| `HandlerRegistrationFailure`    | 個別登録失敗の記録 | `handlerName: string`, `errorMessage: string`, `errorCode: number` (4001 = Infrastructure Error) |
| `IpcHandlerRegistrationResult`  | 全体の登録結果     | `successCount: number`, `failureCount: number`, `failures: HandlerRegistrationFailure[]`    |

**内部ヘルパー関数**:

| 関数名                              | 公開範囲                          | 目的                                                                                       |
| ----------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| `safeRegister(name, fn)`            | 非公開（index.ts内部）            | 個別ハンドラ登録を try-catch でラップ。失敗時は `HandlerRegistrationFailure` を返却         |
| `sanitizeRegistrationErrorMessage(msg)` | 非公開                        | エラーメッセージからユーザーホームディレクトリパスを `~` にマスク（NFR-02）                 |
| `escapeRegExp(str)`                 | 非公開                            | 正規表現メタ文字をエスケープ                                                               |
| `track()`                           | 非公開クロージャ                  | `registerAllIpcHandlers` 内で `safeRegister` の成功/失敗を自動カウント                     |

**ハンドラグループと登録パターン**:

| グループ                             | ハンドラ数 | 登録方式                  | 備考                                                                |
| ------------------------------------ | ---------- | ------------------------- | ------------------------------------------------------------------- |
| 独立ハンドラ（File, Store, Dashboard 等） | 11    | `track()` 経由 `safeRegister` | 依存関係なし                                                        |
| mainWindow 依存（Agent, ChatEdit）   | 2          | `track()` 経由 `safeRegister` | BrowserWindow 引数必要                                              |
| ThemeWatcher                         | 1          | 個別 try-catch            | 戻り値（unsubscribe）のキャプチャが必要なため `safeRegister` 不適合 |
| Supabase 条件付き                    | 1          | 条件分岐 + `track()`     | `getSupabaseClient()` 存在時のみ                                    |
| 複合サービス（Skill, History, Auth 等） | ~15     | `track()` 経由 `safeRegister` | サービスインスタンス共有                                            |

#### 実装時の苦戦箇所と再発防止

| 項目      | 内容                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 苦戦箇所1 | `setupThemeWatcher` は `safeRegister` パターンに適合しない。戻り値（unsubscribe 関数）のキャプチャが必要なため、個別 try-catch で処理する必要がある            |
| 苦戦箇所2 | `track()` クロージャで成功カウントを自動管理しないと、手動カウント漏れが発生する。成功/失敗を一元管理するクロージャパターンが必須                              |
| 苦戦箇所3 | `os.homedir()` のパスには正規表現メタ文字（`\`、`.` 等）が含まれる可能性があり、`escapeRegExp` による事前エスケープが必須。未エスケープだと sanitize が誤動作する |
| 苦戦箇所4 | `unregisterAllIpcHandlers` は変更不要。`ipcMain.removeHandler()` は未登録チャネルでも安全に動作するため、Graceful Degradation の対称修正は不要               |
| 標準ルール | 戻り値キャプチャが必要なハンドラは `safeRegister` 対象外とし、個別 try-catch で処理する。カウント管理はクロージャで一元化し、手動カウントを禁止する             |

#### 関連未タスク（TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 から派生）

| タスクID | 概要 | 優先度 | 指示書パス |
|---|---|---|---|
| UT-FIX-AGENT-HANDLERS-VITE-RESOLVE-001 | agentHandlers.test.ts 16テスト失敗（Vite resolvePackageEntry エラー）修正 | 高 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-fix-agent-handlers-vite-resolve.md` |
| UT-IMP-IPC-ERROR-SANITIZE-COMMON-001 | sanitizeErrorMessage の IPC ハンドラ横断共通化 | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-ipc-error-sanitize-common.md` |

---

### TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001（2026-03-08完了）

| 項目             | 内容                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID         | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001                                                                                                                                                |
| 反映対象         | `apiKey:list` の契約防御と providers 正規化                                                                                                                                                |
| 主要変更         | Main 側で `Array.isArray(result?.providers)` によりレスポンスを検証し `ProviderListResult` へ正規化。Renderer 側で要素 shape フィルタ（`provider/status` 必須、P49準拠 `in` 演算子）を追加 |
| 仕様拡充         | `apiKey:list` レスポンス詳細（IPCResponse/ProviderStatus 構造）、Main側バリデーション（GAP-05）、Renderer側 normalizeProviders 仕様を追記                                                  |
| 検証             | `apiKeyHandlers.list` 7件 + `profileHandlers.identities` 6件 + `ApiKeysSection` 46件、計59件 PASS                                                                                          |
| 画面証跡         | `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/phase-11/screenshots/TC-11-01..03`                                                                               |
| 関連ドキュメント | `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/phase-12/documentation-changelog.md`                                                                             |

### TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001（2026-03-11完了）

| 項目             | 内容                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID         | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001                                                                                                             |
| 反映対象         | `ai.chat` 実行経路と Settings APIキー管理・AuthKey 状態表示の契約整合                                                                                 |
| 主要変更         | `AI_CHAT` に `providerId/modelId` の request 優先ルートを追加（片指定禁止）。`llm:set-selected-config` を追加し Renderer 選択状態を Main に同期      |
| 追加変更         | `SecureStorage` を `api-keys` 単一正本に収束。`apiKey:save/delete` で LLM adapter cache をクリア                                                     |
| auth-key契約     | `auth-key:exists` へ `source` を追加し、`saved` / `env-fallback` / `not-set` を明示                                                                   |
| 検証             | `llm.test.ts` / `aiHandlers.llm.test.ts` / `authKeyHandlers.test.ts` / `channels.test.ts` / `AuthKeySection.test.tsx` / `SettingsView.test.tsx` PASS |
| 画面証跡         | `docs/30-workflows/api-key-chat-tool-integration-alignment/outputs/phase-11/screenshots/TC-11-01..03`                                               |
| 関連ドキュメント | `docs/30-workflows/api-key-chat-tool-integration-alignment/outputs/phase-12/spec-update-summary.md`                                                 |

#### 関連改善タスク

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| ~~UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001~~ | ~~`apiKey:save/delete` の cache clear、`llm:set-selected-config` の Main 同期、`auth-key:exists.source` の Settings 表示を単一回帰マトリクスで guard する~~ **完了: 2026-03-11** | ~~中~~ | `docs/30-workflows/completed-tasks/task-imp-apikey-chat-triple-sync-guard-001.md` |

### TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001（2026-03-05完了）

| 項目             | 内容                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001                                                                                                                     |
| 反映対象         | AuthKeyService 生成/注入ライフサイクル                                                                                                                     |
| 主要変更         | `registerAllIpcHandlers` で `AuthKeyService` を単一生成し、`registerSkillHandlers` へ第3引数として注入。`registerAuthKeyHandlers` と同一インスタンスを共有 |
| 検証             | `ipc-double-registration` で第3引数注入と同一インスタンス共有を検証。関連回帰148 tests PASS                                                                |
| 関連ドキュメント | `docs/30-workflows/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/outputs/phase-12/spec-update-summary.md`                                                      |

---

### TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN（2026-03-05完了）

| 項目             | 内容                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN                                                                          |
| 反映対象         | Notification / HistorySearch IPC契約                                                                              |
| 主要変更         | history 2チャネル + notification 5チャネルを追加し、sender検証・認証ゲート・入力検証を標準化                      |
| 関連ドキュメント | `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/outputs/phase-12/spec-update-summary.md` |

---

### TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001（2026-03-05完了）

| 項目             | 内容                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001                                                                                |
| 反映対象         | auth-key IPC 登録/解除ライフサイクル                                                                                      |
| 主要変更         | `registerAllIpcHandlers`/`unregisterAllIpcHandlers` に auth-key ハンドラ接続を追加                                        |
| 検証             | `ipc-double-registration` と `authKeyHandlers` の回帰テスト、および Renderer preflight 関連テストが PASS                  |
| 関連ドキュメント | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-12/spec-update-summary.md` |

#### 実装時の苦戦箇所と再発防止

| 項目       | 内容                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| 苦戦箇所1  | `auth-key:*` 4チャネル自体は定義済みだったため、runtime 配線漏れが発見されにくかった                          |
| 原因       | ハンドラ実装の有無と `ipc/index.ts` の登録経路検証を分離して進めた                                            |
| 対処       | `registerAllIpcHandlers` / `unregisterAllIpcHandlers` を対称更新し、再登録サイクルテストを追加                |
| 標準ルール | auth 系 IPC は「チャンネル定義・ハンドラ実装・register/unregister 配線・回帰テスト」の4点同時確認を必須化する |

#### 同種課題の簡潔解決チェック（5分）

| 項目     | 内容                                                                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | `No handler registered` または `apps/desktop` の全量テストが `SIGTERM` で中断                                                                                                                       |
| 最短対応 | 1) `register/unregister` 対称更新 2) `authKeyHandlers`/`ipc-double-registration` 回帰追加 3) 全量実行が不安定な場合は `vitest run <対象>` へ分割 4) `task-workflow` と `lessons-learned` へ同値転記 |
| 検証     | `pnpm --filter @repo/desktop test:run <対象テスト>` PASS + `pnpm --filter @repo/desktop typecheck` PASS                                                                                             |
| 反映先   | `api-ipc-system.md` / `task-workflow.md` / `lessons-learned.md`                                                                                                                                     |

#### 関連未タスク

| タスクID                                          | 概要                                                                                                     | 参照                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001 | `apps/desktop test:run` の `SIGTERM` 中断時フォールバック（失敗ログ固定 + 分割実行 + 3仕様同期）を標準化 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-desktop-testrun-sigterm-fallback-guard-001.md` |

---

### TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001（2026-03-05完了）

| 項目             | 内容                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001                                                                  |
| 反映対象         | `AUTH_STATE_CHANGED` payload整合 / `linkedProviders` ランタイム防御                                                   |
| 主要変更         | `PROFILE_UNLINK_PROVIDER` の通知時に `toAuthUser` を適用し、Renderer `authSlice` へ `normalizeLinkedProviders` を導入 |
| 契約影響         | なし（既存IPCチャネル、request/response定義は不変）                                                                   |
| 関連ドキュメント | `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-12/spec-update-summary.md`   |

#### 実装時の苦戦箇所と再発防止

| 項目       | 内容                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 苦戦箇所1  | `PROFILE_UNLINK_PROVIDER` 通知時の `AUTH_STATE_CHANGED.user` が profile shape のまま混入し、Renderer 側で iterable 系例外を誘発しやすい |
| 原因       | Main 通知経路の shape 正規化と Renderer 側の配列防御が片側実装になりやすい                                                              |
| 対処       | Main は `toAuthUser` を必須化し、Renderer は `normalizeLinkedProviders` を導入して契約崩れを吸収                                        |
| 標準ルール | 認証契約修正は Main/Renderer の片側のみで完了扱いにしない（送信正規化 + 受信防御を同時適用）                                            |

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| 苦戦箇所2  | 契約修正中心タスクで UI証跡を省略しやすく、Phase 11 の要求水準とずれやすい                |
| 原因       | 「非視覚修正=NON_VISUALのみ可」という運用慣性で、ユーザー追加要求への昇格を見落としやすい |
| 対処       | TC-11-UI-01〜03 の実画面証跡を再取得し、coverage validator 3/3 を証跡化                   |
| 標準ルール | ユーザーが画面検証を求めた時点で `NON_VISUAL` 運用を `SCREENSHOT` へ切り替える            |

#### 同種課題の5分解決カード（IPC契約境界）

| 項目       | 内容                                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `AUTH_STATE_CHANGED` 通知後に Renderer で `is not iterable` が発生する                                                                                                                               |
| 根本原因   | Main通知 shape と Renderer受信 shape の契約境界が揃っていない                                                                                                                                        |
| 最短5手順  | 1) Main通知 payload を `AuthUser` 形状へ正規化 2) Renderer で `linkedProviders` を正規化 3) Main/Renderer/UI の対象回帰を明示実行 4) UI要求時は `SCREENSHOT` 昇格で証跡を再取得 5) 3仕様書へ同値転記 |
| 検証ゲート | `typecheck` PASS、対象テスト PASS（3 files / 169 tests）、`validate-phase11-screenshot-coverage` PASS（3/3）、`verify-all-specs` PASS                                                                |
| 同期先3点  | `references/api-ipc-system.md` / `references/task-workflow.md` / `references/lessons-learned.md`                                                                                                     |

#### 関連未タスク

| タスクID                                                            | 概要                                                                                               | 参照                                                                                                         | ステータス |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 | 5分解決カードの3仕様書同期（存在/順序/検証ゲート）を機械検証し、契約系タスクの再利用性を安定化する | `docs/30-workflows/completed-tasks/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` | 未実施     |

---

### TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001（2026-03-04完了）

| 項目             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001                                                             |
| 反映対象         | `auth-key:exists` 判定契約                                                                          |
| 主要変更         | store キー有無に加え `ANTHROPIC_API_KEY` env fallback を仕様化                                      |
| 関連ドキュメント | `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/outputs/phase-12/spec-update-summary.md` |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                                                                                                                                  |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.8.7     | 2026-03-11 | TASK-UI-04C-WORKSPACE-PREVIEW を反映: 04C では新規 IPC を追加せず `file:read` を再利用し、Renderer 側 `Promise.race` timeout（5秒）+ 3回 retry、`file:changed` path 一致時の preview 再読込、QuickSearch の Renderer-only search を契約化 |
| v1.8.6     | 2026-03-11 | UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 の完了移管を反映。関連改善タスクの参照先を `docs/30-workflows/completed-tasks/task-imp-apikey-chat-triple-sync-guard-001.md` へ更新し、Phase 12完了後の配置整合を task-workflow と揃えた |
| v1.8.5     | 2026-03-11 | UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 を関連未タスクへ登録。`cache clear` / Main 同期 / `source` 表示の 3 契約を単一回帰マトリクスで guard する改善導線を追加し、APIキー連動系の再発初動を短縮 |
| v1.8.4     | 2026-03-11 | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 を反映: `AI_CHAT` の provider/model 明示指定ルート、`llm:set-selected-config`、`auth-key:exists.source`、`apiKey:save/delete` 後の adapter cache clear、`SecureStorage` の単一正本化を同期 |
| v1.8.3     | 2026-03-11 | TASK-UI-08-NOTIFICATION-CENTER を反映: Notification IPC に `notification:delete` を追加し、`mark-read` / `delete` の引数名を `notificationId` に統一。058e の個別削除 UI と sender 検証契約を同期 |
| v1.8.2     | 2026-03-10 | TASK-UI-04A-WORKSPACE-LAYOUT を反映: `file:watch-start` / `file:watch-stop` / `file:changed` の workspace file watch API を追加し、selected file 単位の watch 契約と cleanup 条件を明文化 |
| v1.8.1     | 2026-03-08 | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 追補: 完了タスク節へ「Graceful Degradation 実装パターン詳細」（型定義・内部ヘルパー関数・ハンドラグループ登録パターン）と「実装時の苦戦箇所と再発防止」を追加 |
| v1.8.0     | 2026-03-08 | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 反映: `registerAllIpcHandlers` の Graceful Degradation（`safeRegister` + `IpcHandlerRegistrationResult` 戻り値）を実装状況テーブル・関連タスク・完了タスクへ追加 |
| v1.7.0     | 2026-03-08 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 仕様拡充: `apiKey:list` レスポンス詳細（IPCResponse/ProviderStatus 構造）、Main側バリデーション（GAP-05）、Renderer側 normalizeProviders（P49準拠）を追記。完了タスク日付を 2026-03-08 に更新 |
| v1.6.1     | 2026-03-07 | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 反映: `apiKey:list` 戻り値を `IPCResponse<ProviderListResult>` へ更新し、Main/Renderer 双方の providers 形状防御と画面証跡（TC-11-01..03）を完了タスクへ同期                                  |
| v1.6.0     | 2026-03-07 | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 反映: Renderer側 Response Shape Fallback パターン（3段階防御）を追加。ApiKeysSection loadProviders での適用を明文化                                                               |
| v1.5.7     | 2026-03-06 | completed 移管済み未タスクリンクを是正。`UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001` の参照先を `completed-tasks/` 実体へ更新し、`verify-unassigned-links` での false missing を防止                             |
| v1.5.3     | 2026-03-05 | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 反映: auth-key ライフサイクル実装状況へ「単一生成 + SkillExecutor注入」2項目を追加。関連タスク/完了タスク台帳を同期                                                                                |
| v1.5.6     | 2026-03-06 | UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 を関連未タスクへ登録。5分解決カードの3仕様書同期を機械検証する改善タスクを明示し、契約系タスクの再発防止導線を追加                                                    |
| v1.5.5     | 2026-03-06 | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 追補2: 「同種課題の5分解決カード（IPC契約境界）」を追加し、症状/根本原因/最短5手順/検証ゲート/同期先3点を固定して再利用性を向上                                                      |
| v1.5.4     | 2026-03-06 | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 追補: 当該タスク節に「実装時の苦戦箇所と再発防止」を追加し、`AUTH_STATE_CHANGED.user` shape 正規化と `NON_VISUAL`→`SCREENSHOT` 昇格ルールを標準化                                    |
| v1.5.3     | 2026-03-05 | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 反映: `PROFILE_UNLINK_PROVIDER` 成功通知の `AUTH_STATE_CHANGED.user` を `AuthUser` 形状へ統一し、Renderer `linkedProviders` 防御（正規化）を実装状況/関連タスク/完了タスクへ同期     |
| v1.4.0     | 2026-03-05 | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN 反映: Notification/HistorySearch IPC（history 2 + notification 5）を追加。sender検証、更新系認証ゲート、入力検証、preload公開境界を契約化                                                        |
| v1.5.2     | 2026-03-05 | `UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001` を関連未タスクへ登録。`apps/desktop test:run` の `SIGTERM` 中断時に「失敗ログ固定 + `vitest run <対象>` 分割実行 + 3仕様同期」を標準運用として追跡可能化                              |
| v1.5.1     | 2026-03-05 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 追補: 「同種課題の簡潔解決チェック（5分）」を追加し、runtime 配線漏れと `SIGTERM` 中断時の分割回帰テスト運用を標準化                                                                           |
| v1.5.0     | 2026-03-05 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 追補: 完了タスク節へ「実装時の苦戦箇所と再発防止」を追加し、auth-key 既存チャネルで発生しやすい runtime 配線漏れの防止手順を明文化                                                             |
| v1.4.0     | 2026-03-05 | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 反映: auth-key ライフサイクル実装状況テーブルを追加し、`registerAllIpcHandlers` / `unregisterAllIpcHandlers` の接続責務を明文化。完了タスク台帳へ同タスクを追加                                |
| v1.3.0     | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: `auth-key:exists` 判定契約に env fallback（`ANTHROPIC_API_KEY`）を追加。Renderer preflight と Main 実行時判定の整合方針を明文化                                                             |
| v1.2.0     | 2026-02-08 | TASK-FIX-16-1: Claude Agent SDK認証キー管理IPCチャネル4種追加（auth-key:set/exists/validate/delete）                                                                                                                                      |
| v1.1.0     | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式に変換                                                                                                                                                                                      |
| v1.0.0     | -          | 初版作成                                                                                                                                                                                                                                  |

