# API / IPC System: ChatPanel / Console Safety / AI Provider / External API（後半）
> 親ファイル: [api-ipc-system-core.md](api-ipc-system-core.md)

## ChatPanel IPC チャネル契約（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001）

TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 で設計された ChatPanel が使用する IPC チャネル一覧。ChatPanel の実チャット配線で使用する全チャネルを定義する。

### チャンネル一覧

| チャネル | 方向 | 種別 | 用途 | 備考 |
| --- | --- | --- | --- | --- |
| `AI_CHAT` | Renderer → Main | request-response | LLM へのメッセージ送信と応答取得 | 既存チャネル（AI/チャット IPC チャネルセクション参照） |
| `llm:stream-chat` | Renderer → Main | invoke | ストリーミングチャット開始 | 既存チャネル |
| `llm:stream-chunk` | Main → Renderer | on | ストリーミング chunk 受信 | 既存チャネル |
| `llm:stream-done` | Main → Renderer | on | ストリーミング完了通知 | 既存チャネル |
| `llm:stream-error` | Main → Renderer | on | ストリーミングエラー通知 | 既存チャネル |
| `llm:cancel-stream` | Renderer → Main | invoke | ストリームキャンセル | 既存チャネル |
| `llm:set-selected-config` | Renderer → Main | invoke | Provider/Model 選択を Main へ同期 | 既存チャネル（LLM選択同期 IPC セクション参照） |
| `llm:get-providers` | Renderer → Main | invoke | プロバイダー一覧取得 | 既存チャネル |
| `llm:get-selected-config` | Renderer → Main | invoke | 現在の選択設定取得 | 既存チャネル |
| `settings:navigate` | Renderer → Main | invoke | 設定画面へのナビゲーション（blocked 状態の ErrorGuidance から呼び出し） | 既存チャネル |

### ChatPanel IPC 利用契約

| 項目 | 契約 |
| --- | --- |
| Provider/Model 未選択時 | `llm:get-selected-config` で `null` が返った場合、AI_CHAT を呼び出さず `blocked` 状態へ遷移（P62 準拠） |
| ストリーム開始 | `llm:stream-chat` invoke → `llm:stream-chunk` で chunk 受信 → `llm:stream-done` で完了 |
| エラーハンドリング | `llm:stream-error` 受信時は `error` 状態へ遷移し `ErrorGuidance` を表示 |
| キャンセル | `llm:cancel-stream` invoke 後、`cancelled` 状態へ遷移 |
| 設定導線 | `blocked` 状態の `ErrorGuidance` から `settings:navigate` を呼び出し、設定画面へ誘導 |

---

## Advanced Console Safety Governance（TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001）

> 完了日: 2026-03-25
> ステータス: `implemented`

### チャンネル一覧

| チャネル | 方向 | 種別 | 用途 |
| --- | --- | --- | --- |
| `approval:respond` | Renderer → Main | invoke | 承認/拒否応答送信 |
| `approval:request` | Main → Renderer | push (on) | 承認要求プッシュ通知 |
| `execution:get-disclosure-info` | Renderer → Main | invoke | AI開示情報取得 |
| `execution:get-terminal-log` | Renderer → Main | invoke | ターミナルログ取得 |
| `execution:get-copy-command` | Renderer → Main | invoke | コピーコマンド取得 |

### 実装アンカー

| 層 | ファイル | 役割 |
| --- | --- | --- |
| Main approval handler | `apps/desktop/src/main/ipc/approvalHandlers.ts` | `approval:respond` / `approval:request` push 境界 |
| Main advanced console handler | `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts` | `execution:get-terminal-log` / `execution:get-copy-command` |
| Main DI bridge | `apps/desktop/src/main/ipc/index.ts` | `getClaudeCliManager()` から `ClaudeCliManager` を解決し session data を callback へ接続 |
| Main disclosure handler | `apps/desktop/src/main/ipc/disclosureHandlers.ts` | `execution:get-disclosure-info` |
| Main approval gate service | `apps/desktop/src/main/services/runtime/ApprovalGate.ts` | ワンタイムトークン生成・検証 |
| Main runtime policy | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` | Consumer Auth Guard / NAS 判定 |
| Preload channels | `apps/desktop/src/preload/channels.ts` | 5チャンネルのホワイトリスト登録 |
| Renderer hook | `apps/desktop/src/renderer/hooks/useApprovalFlow.ts` | 承認フロー UI 制御 |
| Renderer hook | `apps/desktop/src/renderer/hooks/useAdvancedConsole.ts` | Advanced Console 状態管理 |
| Renderer view | `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx` | 3層レイヤー描画（Primary/Safety/Detail Surface） |

### Current Contract Notes

- `execution:get-terminal-log` は `ClaudeCliManager.getSession({ sessionId })` の `output` を返す。
- `execution:get-copy-command` は `SessionManager.createSession()` の実起動形式に合わせて `node <scriptPath> ...args` を返す。
- session 不在時は callback 内で `SESSION_NOT_FOUND` を生成し、外向き IPC 応答は handler 側で `TERMINAL_LOG_ERROR` / `COPY_COMMAND_ERROR` へ変換する。

---

## AIプロバイダーAPI連携

### 対応プロバイダー

| プロバイダー | API ベースURL                                  | 認証方式         |
| ------------ | ---------------------------------------------- | ---------------- |
| OpenAI       | `https://api.openai.com/v1`                    | Bearer Token     |
| Anthropic    | `https://api.anthropic.com/v1`                 | x-api-key Header |
| Google AI    | `https://generativelanguage.googleapis.com/v1` | Query Parameter  |
| xAI          | `https://api.x.ai/v1`                          | Bearer Token     |

### APIキー検証エンドポイント

| プロバイダー | メソッド | エンドポイント         | 検証方法                     |
| ------------ | -------- | ---------------------- | ---------------------------- |
| OpenAI       | GET      | `/models`              | モデル一覧取得成功で有効判定 |
| Anthropic    | POST     | `/messages`            | 最小リクエスト送信で認証確認 |
| Google AI    | GET      | `/models?key={apiKey}` | モデル一覧取得成功で有効判定 |
| xAI          | GET      | `/models`              | モデル一覧取得成功で有効判定 |

### HTTPステータスと検証結果マッピング

| HTTPステータス | 検証結果        | 意味                               |
| -------------- | --------------- | ---------------------------------- |
| 200-299        | `valid`         | APIキー有効                        |
| 401            | `invalid`       | 認証失敗（キー無効または期限切れ） |
| 403            | `invalid`       | アクセス拒否                       |
| 429            | `valid`         | レートリミット（認証は成功）       |
| 500-504        | `network_error` | サーバーエラー                     |
| タイムアウト   | `timeout`       | 接続タイムアウト（10秒）           |

---

## Skill Creator - execute() ファイル永続化統合（TASK-P0-05）

> 完了日: 2026-03-30

### 概要

`RuntimeSkillCreatorFacade.execute()` 内で LLM 応答テキストを `parseLlmResponseToContent()` で解析し、`SkillFileWriter.persist()` でファイルに書き出す。

### 実装アンカー

| 役割 | ファイル | 内容 |
| ---- | -------- | ---- |
| 応答パーサー | `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts` | `assistant` / `result` イベント配列から LLM テキストを結合し、見出し行でファイル分類する |
| execute() 統合 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | Step 3.5-3.6 に persist 連携ロジック追加。`persistResult` / `persistError` を IPC 戻り値へ付加 |
| artifact 記録 | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `execute_result` artifact に `persistResult` / `persistError` を保持 |

### 型定義（packages/shared/src/types/skillCreator.ts）

```typescript
// RuntimeSkillCreatorExecuteResult に追加
persistResult?: { skillPath: string; files: string[] } | null;
persistError?: string | null;
```

### parseLlmResponseToContent API

```typescript
function parseLlmResponseToContent(
  events: SdkEvent[]
): SkillGeneratedContent
```

- `events`: `assistant` / `result` タイプの SDK イベント配列
- 戻り値: `{ skillMd?: string; agents: Record<string, string>; scripts: Record<string, string>; references: Record<string, string> }`
- 見出し `## agents/foo` → `agents/foo.md` にキーとして格納（`.md` 拡張子は正規化して重複回避）
- 見出し揺れ（末尾スラッシュ / 大文字小文字 / スペース）は許容する

### エラーハンドリング

| 状態 | 挙動 |
| ---- | ---- |
| `skillFileWriter` DI 未注入 | `console.warn` を出力し `persistResult: null` を返す |
| `persist()` が例外 | `persistError` に sanitized message を設定し処理継続 |
| `VALIDATION_ERROR` / `PATH_TRAVERSAL` | `persistError` に error code を含むメッセージを設定 |

---

## Skill Creator External API Support（TASK-SDK-SC-03）

> 完了日: 2026-04-03
> ステータス: `implemented`

### 概要

TASK-SDK-SC-03 では、Skill Creator フロー内で外部 HTTP API を呼び出すための IPC チャネル（4本）と型定義を追加した。SDK Session が `RequestExternalApiConfig` custom tool を通じて UI にAPI設定を要求し、ユーザーが `ExternalApiConfigForm` で設定を入力する双方向フローを実現する。

### チャネル一覧

| チャネル | 方向 | 用途 | Request / Payload | Response |
| --- | --- | --- | --- | --- |
| `skill-creator:configure-api` | Renderer → Main | 外部API設定送信 | `ExternalApiConnectionConfig` | `IpcResult<unknown>` |
| `skill-creator:api-configured` | Main → Renderer | API設定完了通知 | none | push payload |
| `skill-creator:api-test-result` | Main → Renderer | API接続テスト結果 | none | push payload |
| `skill-creator:external-api-config-required` | Main → Renderer | SDK→UI: API設定要求 | none | `ExternalApiConfigRequiredEvent` (`{ apiName?, description? }`) |

### チャネル定義正本

| 定数名 | 値 | 定義元 |
| --- | --- | --- |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API` | `skill-creator:configure-api` | `packages/shared/src/ipc/channels.ts` |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_CONFIGURED` | `skill-creator:api-configured` | `packages/shared/src/ipc/channels.ts` |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_TEST_RESULT` | `skill-creator:api-test-result` | `packages/shared/src/ipc/channels.ts` |
| `SKILL_CREATOR_SESSION_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED` | `skill-creator:external-api-config-required` | `packages/shared/src/ipc/channels.ts` |

### 型定義

| 型名 | 種別 | 定義ファイル | 概要 |
| --- | --- | --- | --- |
| `ExternalApiAuthType` | type alias | `packages/shared/src/types/skillCreatorExternalApi.ts` | `"none" \| "api-key" \| "bearer" \| "basic"` |
| `ExternalApiConnectionConfig` | interface | `packages/shared/src/types/skillCreatorExternalApi.ts` | API接続設定（name / url / method / authType / credential? / headers? / description?） |
| `SkillExternalApiContext` | interface | `packages/shared/src/types/skillCreatorExternalApi.ts` | SDK Session に注入する外部APIコンテキスト（`apis: ExternalApiConnectionConfig[]`） |
| `IExternalApiAdapter` | interface | `packages/shared/src/types/skillCreatorExternalApi.ts` | 外部HTTP APIアダプターインターフェース（get / post / setAuth） |
| `ExternalApiTimeoutError` | class | `packages/shared/src/types/skillCreatorExternalApi.ts` | 30秒タイムアウトエラー（url プロパティ保持） |
| `ExternalApiHttpError` | class | `packages/shared/src/types/skillCreatorExternalApi.ts` | HTTP 4xx/5xx エラー（statusCode / url プロパティ保持） |
| `ExternalApiConfigRequiredEvent` | interface | `apps/desktop/src/preload/skill-creator-session-api.ts` | SDK→UI 通知ペイロード（`{ apiName?, description? }`） |

### 実装アンカー

| 層 | ファイル | 役割 |
| --- | --- | --- |
| Shared channels | `packages/shared/src/ipc/channels.ts` | `SKILL_CREATOR_EXTERNAL_API_CHANNELS` 定数定義 |
| Shared types | `packages/shared/src/types/skillCreatorExternalApi.ts` | 型定義 SSoT |
| Main IPC Bridge | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts` | `configureApi` handler / `isValidExternalApiConfig()` 8条件バリデーション |
| Main SDK Session | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts` | `RequestExternalApiConfig` custom tool / `sanitizeExternalApiConfigForPrompt()` |
| Main HTTP Adapter | `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts` | `IExternalApiAdapter` 実装（30秒タイムアウト / AbortController） |
| Preload session API | `apps/desktop/src/preload/skill-creator-session-api.ts` | `onExternalApiConfigRequired()` push listener |
| Preload creator API | `apps/desktop/src/preload/skill-creator-api.ts` | `configureExternalApi()` invoke |
| Renderer | `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx` | API接続設定フォーム UI |

### 並行フロー管理

SDK Session は `pendingAnswerPromise`（質問待機）と `pendingExternalApiPromise`（API設定要求）を相互排他で管理する。

| 状態 | 判定 | 挙動 |
| --- | --- | --- |
| 質問待機中にAPI設定要求 | `pendingAnswerPromise` が存在 | 質問待機を維持し、API設定要求は拒否 |
| API設定待機中に質問要求 | `pendingExternalApiPromise` が存在 | API設定待機を維持し、質問要求は拒否 |
| タイムアウト | 30秒 | 単一 `timeoutHandle` を両フローで共有し、タイムアウト時に reject |

### credential 秘匿化

`sanitizeExternalApiConfigForPrompt()` は SDK プロンプトに注入する値から credential を `[REDACTED]` に置換する。実際のAPI呼び出しには元の credential を使用する（二重管理パターン）。

### バリデーション

`isValidExternalApiConfig()` は以下の8条件でバリデーションを実施する。

1. `config` が非 null object であること
2. `config.name` が非空文字列であること
3. `config.url` が非空文字列であること
4. `config.url` が `http://` または `https://` で始まること
5. `config.method` が `"GET"` または `"POST"` であること
6. `config.authType` が `ExternalApiAuthType` のいずれかであること
7. `config.authType` が `"none"` 以外の場合、`config.credential` が非空文字列であること
8. `config.headers` が指定されている場合、`Record<string, string>` 形状であること

---

## IPC Handler Lifecycle Management（TASK-FIX-IPC-SKILL-NAME-001 追記: 2026-04-06）

### 設計原則

Electron の `ipcMain.handle()` は同一チャネルに対して**1回のみ登録すること**。
2回目の登録時に Electron が例外を投げ、**後続の全ハンドラが未登録**になる。

### register / unregister 対称パターン

```typescript
// ✅ 正しいパターン: register と unregister を対称実装する
export function registerRuntimeSkillCreatorHandlers(mainWindow: BrowserWindow, service: SkillCreatorService | null): void {
  ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_PLAN, async (event, req) => { ... });
  ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS, async (event) => { ... });
  // ... 全 N 個のチャネルを登録
}

export function unregisterRuntimeSkillCreatorHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_ADAPTER_STATUS);
  // ... 同 N 個を削除（対称）
}
```

### 重複登録防止チェックリスト

- [ ] 同一チャネル名で `ipcMain.handle()` が1度だけ呼ばれているか確認する
- [ ] `unregisterXxxHandlers()` で登録数と同数の `removeHandler()` を実装する
- [ ] アプリ再起動時に `unregister → register` の順序で呼び出す

### 実装参照

- `apps/desktop/src/main/ipc/creatorHandlers.ts` - `registerRuntimeSkillCreatorHandlers()` / `unregisterRuntimeSkillCreatorHandlers()`（16チャネル対称実装）

---

## TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION（2026-04-08）

### 概要

既存 `RuntimeSkillCreatorFacade.verifySkill(skillDir)` の内部エンジンに対して、外部から `skillName` を受け付ける公開 IPC surface `skill-creator:verify` を追加する。

### 実装アンカー

| 層 | ファイル | 変更内容 |
| --- | --- | --- |
| 型定義 | `packages/shared/src/types/skillCreator.ts` | `VerifyCheckResult` / `VerifyResult` 型を追加 |
| IPC 定数 | `packages/shared/src/ipc/channels.ts` | `SKILL_CREATOR_VERIFY = "skill-creator:verify"` を定数エクスポートし `IPC_CHANNELS` に統合 |
| Preload whitelist | `apps/desktop/src/preload/channels.ts` | `SKILL_CREATOR_VERIFY` を `ALLOWED_INVOKE_CHANNELS` に追加（要 whitelist 登録） |
| Main Handler | `apps/desktop/src/main/ipc/creatorHandlers.ts` | `ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_VERIFY, ...)` 登録。`validateSender + isBlank + sanitizeErrorMessage` パターン。`unregisterRuntimeSkillCreatorHandlers` に `removeHandler` も追加 |
| Facade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `async verify(skillName, authMode, apiKey): Promise<VerifyResult>` を追加。`resolveVerifySkillDir → verifySkill(skillDir) → DTO 変換` |
| Preload API | `apps/desktop/src/preload/skill-creator-api.ts` | `verifySkill(skillName, authMode?, apiKey?)` メソッドを追加 |

### チャンネル

| チャンネル | 用途 | Request | Response |
| --- | --- | --- | --- |
| `skill-creator:verify` | スキルの整合性・品質チェックを実行 | `{ skillName: string, authMode?: string, apiKey?: string }` | `IpcResult<VerifyResult>` |

### 公開 DTO 型

```typescript
interface VerifyCheckResult {
  checkId: string;   // RuntimeSkillCreatorVerifyCheck.id から変換
  label: string;     // RuntimeSkillCreatorVerifyCheck.summary から変換
  passed: boolean;   // severity === "info" → true
  message?: string;  // evidenceSummary から変換
}

interface VerifyResult {
  success: boolean;
  checks: VerifyCheckResult[];
  error?: string;
}
```

### DTO 変換ルール（内部型 → 公開 DTO）

| 内部フィールド | 公開フィールド | 変換ルール |
| --- | --- | --- |
| `RuntimeSkillCreatorVerifyCheck.id` | `checkId` | そのまま |
| `RuntimeSkillCreatorVerifyCheck.summary` | `label` | そのまま |
| `severity === "info"` | `passed = true` | info のみ pass 扱い |
| `evidenceSummary` | `message` | optional |

### 設計注意点

- `skillName` を受ける公開 surface と `skillDir` を受ける内部エンジン（`verifySkill(skillDir)`）は名前が酷似するため、Phase 2 設計で `resolveVerifySkillDir()` 解決レイヤを明示すること
- IPC surface 追加時は `preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` への追記が必須（漏れやすい）
- 新チャネル登録と同時に `unregisterXxxHandlers()` への `removeHandler` 追加を忘れないこと（対称パターン）
- follow-up: `UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001`（CI スナップショットテスト）
