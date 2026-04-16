# Phase 2 設計書 — IPC 4層整合性修正

## メタ情報

| 項目           | 値                                     |
| -------------- | -------------------------------------- |
| ドキュメントID | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001-PH2 |
| 作成日         | 2026-04-15                             |
| ステータス     | Draft                                  |
| 担当フェーズ   | Phase 2（設計）                        |
| 前提フェーズ   | Phase 1（要件定義）完了済み            |
| 後続フェーズ   | Phase 3（設計レビュー）                |

---

## 1. タスク分割設計

### 1.1 タスク構成

```
IPC 4層整合性修正
├── TASK-1: UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001
│   └── Rule-1修正: preloadホワイトリストへの不足チャネル追加
└── TASK-2: UT-FIX-IPC-MAIN-HANDLER-IMPL-001
    └── Rule-2修正: mainハンドラの実装
```

### 1.2 並列実行可否

**TASK-1 と TASK-2 は完全に独立しており、並列実行可能。**

- TASK-1 の変更対象は `apps/desktop/src/preload/channels.ts` のみ
- TASK-2 の変更対象は `apps/desktop/src/main/ipc/` 配下のみ
- 両タスク間でファイルの競合は発生しない
- どちらを先に実施してもよい

最終的な CI 検証（`node scripts/verify-ipc-4layer.cjs`）は両タスク完了後に実施する。

---

## 2. TASK-1 設計詳細

### 2.1 概要

**タスクID**: `UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001`
**目的**: Rule-1 違反（12チャネル）の解消
**変更ファイル**: `apps/desktop/src/preload/channels.ts` 1ファイルのみ

### 2.2 変更対象ファイル

| ファイル                               | 変更内容                                                   |
| -------------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts` | `ALLOWED_ON_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` への追加 |

### 2.3 チャネルの方向性判断根拠

Electron IPC の方向性は以下のルールで判断する：

- **ALLOWED_INVOKE_CHANNELS**: Renderer から Main へリクエストを送り、レスポンスを待つ（`ipcRenderer.invoke` / `ipcMain.handle` ペア）
- **ALLOWED_ON_CHANNELS**: Main から Renderer へイベントをプッシュする（`webContents.send` / `ipcRenderer.on` ペア）

各チャネルの shared 定数コメントにある「Renderer → Main」「Main → Renderer」の記述を判断根拠とする。

### 2.4 追加先一覧

#### ALLOWED_INVOKE_CHANNELS に追加するチャネル（6チャネル）

以下を `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` 配列末尾付近の適切なセクションに追加する。

```typescript
// Chat Export channels (CHAT_EXPORT_CHANNELS)
IPC_CHANNELS.EXPORT_SESSION,       // "chat:exportSession"
IPC_CHANNELS.PREVIEW_EXPORT,       // "chat:previewExport"

// File System channels (FILE_SYSTEM_CHANNELS)
IPC_CHANNELS.WRITE_FILE,           // "fs:writeFile"
IPC_CHANNELS.READ_FILE,            // "fs:readFile"

// Skill Creator Session channels - invoke 方向 (SKILL_CREATOR_SESSION_CHANNELS)
IPC_CHANNELS.START_SESSION,        // "skill-creator:start-session"
IPC_CHANNELS.ANSWER,               // "skill-creator:answer"
```

注意: `IPC_CHANNELS.CONFIGURE_API`（`skill-creator:configure-api`）は既存の `ALLOWED_INVOKE_CHANNELS` に登録済みのため追加不要。

#### ALLOWED_ON_CHANNELS に追加するチャネル（6チャネル）

以下を `ALLOWED_ON_CHANNELS` 配列の Skill Creator セクションに追加する。

```typescript
// Skill Creator Session channels - on 方向 (SKILL_CREATOR_SESSION_CHANNELS)
IPC_CHANNELS.QUESTION_RECEIVED,            // "skill-creator:question-received"
IPC_CHANNELS.SESSION_COMPLETE,             // "skill-creator:session-complete"
IPC_CHANNELS.SESSION_ERROR,                // "skill-creator:session-error"
IPC_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED, // "skill-creator:external-api-config-required"

// Skill Creator External API channels - on 方向 (SKILL_CREATOR_EXTERNAL_API_CHANNELS)
IPC_CHANNELS.API_CONFIGURED,              // "skill-creator:api-configured"
IPC_CHANNELS.API_TEST_RESULT,             // "skill-creator:api-test-result"
```

### 2.5 定数キーのマッピング確認

`apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` オブジェクトは `...SKILL_CREATOR_SESSION_CHANNELS` および `...SKILL_CREATOR_EXTERNAL_API_CHANNELS` を spread で取り込んでいる（既存）。したがって以下のキーはすでに `IPC_CHANNELS` オブジェクト上で参照可能：

| 追加するキー参照                            | 解決される定数                                                | チャネル文字列                               |
| ------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------- |
| `IPC_CHANNELS.EXPORT_SESSION`               | `CHAT_EXPORT_CHANNELS.EXPORT_SESSION`                         | `chat:exportSession`                         |
| `IPC_CHANNELS.PREVIEW_EXPORT`               | `CHAT_EXPORT_CHANNELS.PREVIEW_EXPORT`                         | `chat:previewExport`                         |
| `IPC_CHANNELS.WRITE_FILE`                   | `FILE_SYSTEM_CHANNELS.WRITE_FILE`                             | `fs:writeFile`                               |
| `IPC_CHANNELS.READ_FILE`                    | `FILE_SYSTEM_CHANNELS.READ_FILE`                              | `fs:readFile`                                |
| `IPC_CHANNELS.START_SESSION`                | `SKILL_CREATOR_SESSION_CHANNELS.START_SESSION`                | `skill-creator:start-session`                |
| `IPC_CHANNELS.ANSWER`                       | `SKILL_CREATOR_SESSION_CHANNELS.ANSWER`                       | `skill-creator:answer`                       |
| `IPC_CHANNELS.QUESTION_RECEIVED`            | `SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED`            | `skill-creator:question-received`            |
| `IPC_CHANNELS.SESSION_COMPLETE`             | `SKILL_CREATOR_SESSION_CHANNELS.SESSION_COMPLETE`             | `skill-creator:session-complete`             |
| `IPC_CHANNELS.SESSION_ERROR`                | `SKILL_CREATOR_SESSION_CHANNELS.SESSION_ERROR`                | `skill-creator:session-error`                |
| `IPC_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED` | `SKILL_CREATOR_SESSION_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED` | `skill-creator:external-api-config-required` |
| `IPC_CHANNELS.API_CONFIGURED`               | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_CONFIGURED`          | `skill-creator:api-configured`               |
| `IPC_CHANNELS.API_TEST_RESULT`              | `SKILL_CREATOR_EXTERNAL_API_CHANNELS.API_TEST_RESULT`         | `skill-creator:api-test-result`              |

ただし、`CHAT_EXPORT_CHANNELS` と `FILE_SYSTEM_CHANNELS` は現時点で `apps/desktop/src/preload/channels.ts` の import に含まれていない可能性がある。実装者は import 宣言の追加要否を確認すること。

**確認事項**: `IPC_CHANNELS` オブジェクト内に `EXPORT_SESSION`、`PREVIEW_EXPORT`、`WRITE_FILE`、`READ_FILE` キーが存在しない場合は、spread `...CHAT_EXPORT_CHANNELS`、`...FILE_SYSTEM_CHANNELS` を `IPC_CHANNELS` に追加するか、shared から個別 import した上でキーを明示的に追加する。

---

## 3. TASK-2 設計詳細

### 3.1 概要

**タスクID**: `UT-FIX-IPC-MAIN-HANDLER-IMPL-001`
**目的**: Rule-2 違反（8チャネル）の解消
**変更ファイル**: `apps/desktop/src/main/ipc/` 配下の既存ファイルへの追加（新規ファイル作成は最小限）

### 3.2 変更対象ファイル一覧

| チャネル                   | 追加先ファイル                               | 理由                                                          |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| `auth:start-oauth-flow`    | `apps/desktop/src/main/ipc/authHandlers.ts`  | 既存の authHandlers.ts に Auth 関連ハンドラが集約されている   |
| `auth:test-callback`       | `apps/desktop/src/main/ipc/authHandlers.ts`  | 同上                                                          |
| `settings:get`             | `apps/desktop/src/main/ipc/storeHandlers.ts` | 設定値の取得・更新は既存の store 系 IPC に集約する            |
| `settings:update`          | `apps/desktop/src/main/ipc/storeHandlers.ts` | 同上                                                          |
| `agent:get-skills`         | `apps/desktop/src/main/ipc/agentHandlers.ts` | 既存の agentHandlers.ts に Agent 関連ハンドラが集約されている |
| `agent:get-skill-detail`   | `apps/desktop/src/main/ipc/agentHandlers.ts` | 同上                                                          |
| `agent:execute`            | `apps/desktop/src/main/ipc/agentHandlers.ts` | 同上                                                          |
| `agent:permission-respond` | `apps/desktop/src/main/ipc/agentHandlers.ts` | 同上                                                          |

### 3.3 各ハンドラの設計詳細

#### 3.3.1 auth:start-oauth-flow

**追加先**: `authHandlers.ts` の `registerAuthHandlers` 関数内

**設計方針**:

- 既存の `auth:login` ハンドラ（OAuthプロバイダーを引数に取る）と `auth:start-oauth-flow`（PKCE対応OAuth開始）は概念が重複する可能性がある
- `AuthFlowOrchestrator.startOAuthFlow` または同等のメソッドを呼び出す
- プロバイダーバリデーション（`isValidProvider`）を適用する
- 戻り値: `{ success: boolean; authUrl?: string; error?: { code: string; message: string } }`

**実装パターン**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.AUTH_START_OAUTH_FLOW,
  async (_event, { provider }: { provider: string }) => {
    // プロバイダーバリデーション
    // AuthFlowOrchestrator を通じて OAuth フロー開始
    // authUrl を返す、またはブラウザ起動してフローを開始
  },
);
```

#### 3.3.2 auth:test-callback

**追加先**: `authHandlers.ts` の `registerAuthHandlers` 関数内（または開発用として条件分岐）

**設計方針**:

- 開発用チャネル（`process.env.NODE_ENV !== 'production'` 時のみ有効にすることを推奨）
- コールバックURL文字列を受け取り、`processAuthCallback` を呼び出す
- 戻り値: `{ success: boolean; error?: { code: string; message: string } }`

**実装パターン**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.AUTH_TEST_CALLBACK,
  async (_event, { callbackUrl }: { callbackUrl: string }) => {
    // 開発環境のみ有効にする guard を設ける
    // processAuthCallback(callbackUrl, mainWindow, supabase, secureStorage) を呼び出す
  },
);
```

#### 3.3.3 settings:get

**追加先**: `storeHandlers.ts`

**設計方針**:

- `USER_SETTINGS_GET`（`settings:get`）は `storeHandlers.ts` に集約する
- 既存の `STORE_GET`（`store:get`）とはチャネル責務を分けるが、実装は同じ store helper を再利用する
- 戻り値: `UserSettings` 型相当の設定オブジェクト

**実装パターン**:

```typescript
ipcMain.handle(IPC_CHANNELS.USER_SETTINGS_GET, async (_event) => {
  // store helper から設定オブジェクトを取得する
  // settings 専用ファイルや専用サービスは作らない
});
```

#### 3.3.4 settings:update

**追加先**: `storeHandlers.ts`

**設計方針**:

- 部分更新（patch）または全置換（put）を引数で制御する
- 入力バリデーションを行う（不正なキーを拒否）
- 戻り値: `{ success: boolean; data?: UserSettings; error?: ... }`

**実装パターン**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.USER_SETTINGS_UPDATE,
  async (_event, updates: Partial<UserSettings>) => {
    // store helper に対して検証済みの更新を反映する
    // settings 専用ファイルや追加登録関数は作らない
  },
);
```

#### 3.3.5 agent:get-skills

**追加先**: `agentHandlers.ts` の `registerAgentExecutionHandlers` 関数内、または独立した `registerAgentSkillHandlers` 関数として追加

**設計方針**:

- スキル一覧の取得。既存の `skill:list`（`SKILL_LIST`）と重複する可能性があるため、内部実装の共有または委譲を検討する
- AgentService または SkillService を介してスキル一覧を取得する
- 戻り値: `{ success: boolean; data?: AgentSkill[]; error?: ... }`

**実装パターン**:

```typescript
ipcMain.handle(IPC_CHANNELS.AGENT_GET_SKILLS, async (_event) => {
  // SkillService.list() または同等の処理を呼び出す
  // AgentSkill[] 型の配列を返す
});
```

#### 3.3.6 agent:get-skill-detail

**追加先**: `agentHandlers.ts`

**設計方針**:

- スキルID を引数に取り、詳細情報を返す
- 既存の `skill:get-detail`（`SKILL_GET_DETAIL`）と重複可能性あり。内部委譲を推奨
- 戻り値: `{ success: boolean; data?: AgentSkillDetail; error?: ... }`

**実装パターン**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
  async (_event, { skillId }: { skillId: string }) => {
    // SkillService.getDetail(skillId) または同等処理
  },
);
```

#### 3.3.7 agent:execute

**追加先**: `agentHandlers.ts`

**設計方針**:

- 既存の `agent:start`（`AGENT_EXECUTION_START`）と類似するが別チャネル
- `AGENT_EXECUTE` は高レベルのエージェント実行インターフェース（skillId + prompt 等）
- `ExecutionManager.startExecution` または `AgentService.execute` に委譲
- 戻り値: `{ success: boolean; executionId?: string; error?: ... }`

**実装パターン**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.AGENT_EXECUTE,
  async (_event, request: AgentExecutionRequest) => {
    // バリデーション
    // ExecutionManager または AgentService を通じて実行開始
    // executionId を返す
  },
);
```

#### 3.3.8 agent:permission-respond

**追加先**: `agentHandlers.ts`

**設計方針**:

- 既存の `agent:permission:res`（`AGENT_EXECUTION_PERMISSION_RES`）と類似するが別チャネル
- `AGENT_PERMISSION_RESPOND` はより高レベルの権限応答インターフェース
- `ExecutionManager.resolvePermission` または `ApprovalGate` に委譲
- 戻り値: `{ success: boolean; error?: ... }`

**実装パターン**:

```typescript
ipcMain.handle(
  IPC_CHANNELS.AGENT_PERMISSION_RESPOND,
  async (_event, response: PermissionResponse) => {
    // バリデーション（requestId、approved の型チェック）
    // ExecutionManager.resolvePermission または ApprovalGate を通じて解決
  },
);
```

---

## 4. 実装上の注意事項

### 4.1 TASK-1 実施時の注意

1. **import の確認**: `CHAT_EXPORT_CHANNELS`、`FILE_SYSTEM_CHANNELS` が `apps/desktop/src/preload/channels.ts` にまだ import されていない場合は `@repo/shared/src/ipc/channels` からの import を追加する
2. **IPC_CHANNELS へのキー追加**: spread がなければ、`IPC_CHANNELS` オブジェクトへ `...CHAT_EXPORT_CHANNELS`、`...FILE_SYSTEM_CHANNELS` を追加する
3. **既存登録済みの重複チェック**: `ALLOWED_INVOKE_CHANNELS` に既存で `CONFIGURE_API` が含まれている事実を確認してから追加すること

### 4.2 TASK-2 実施時の注意

1. **ハンドラ重複登録の回避**: `ipcMain.handle` は同一チャネルに2度登録するとエラーになる。既存ファイルに同名チャネルがないかを必ず `grep` で確認してから追加する
2. **settings は storeHandlers.ts に固定**: 新規 `settingsHandlers.ts` は作らず、既存の `storeHandlers.ts` に集約する
3. **型安全性の確保**: `any` 型は使用しない。引数の型は `@repo/shared` または `@repo/desktop` の既存型定義を参照する
4. **セキュリティバリデーション**: `withValidation` または `validateIpcSender` を使用して送信元ウィンドウを検証する

### 4.3 settings ハンドラの配置判断

`storeHandlers.ts` に集約する。新規 `settingsHandlers.ts` は作成しない。

---

## 5. リスク・制約事項

### 5.1 リスク一覧

| リスク                                                                          | 影響度 | 発生可能性 | 対策                                                                                   |
| ------------------------------------------------------------------------------- | ------ | ---------- | -------------------------------------------------------------------------------------- |
| `agent:get-skills` が既存 `skill:list` と完全重複し、二重メンテナンスが発生する | 中     | 高         | 内部で `skillHandlers` の処理を委譲する実装にする                                      |
| `settings` を新規ファイルへ分割する                                             | 中     | 中         | `storeHandlers.ts` に集約し、追加ファイルを作らない                                    |
| `auth:start-oauth-flow` と `auth:login` の責務が曖昧で競合する                  | 中     | 中         | authHandlers.ts のコメント・型定義を参照し、OAuth フロー開始の適切なメソッドを選択する |
| TASK-1 で追加した IPC_CHANNELS キーが verify スクリプトで正しく解決されない     | 高     | 低         | ローカルで `node scripts/verify-ipc-4layer.cjs` を実行して確認する                     |
| `auth:test-callback` が本番環境でも有効になりセキュリティリスクになる           | 高     | 中         | `process.env.NODE_ENV !== 'production'` ガードを必ず実装する                           |

### 5.2 制約事項

- **コードの実装は行わない**: 本設計書はタスク実施者への指示書であり、この文書自体は設計書のみ。コード変更は実装フェーズ（Phase 4以降）で行う
- **コミットは行わない**: 設計フェーズではコードのコミットは行わない
- **`--no-verify` 禁止**: プロジェクトルールにより `git commit --no-verify` は絶対に使用しない
- **`any` 型禁止**: TypeScript の `any` 型は使用しない

---

## 6. 検証手順

### 6.1 TASK-1 完了後の検証

```bash
# preload のホワイトリスト確認（手動確認）
grep -n "chat:exportSession\|chat:previewExport\|fs:writeFile\|fs:readFile" \
  apps/desktop/src/preload/channels.ts

# 型チェック
pnpm --filter @repo/desktop typecheck
```

### 6.2 TASK-2 完了後の検証

```bash
# mainハンドラの登録確認（手動確認）
grep -rn "auth:start-oauth-flow\|auth:test-callback\|settings:get\|settings:update\|agent:get-skills\|agent:get-skill-detail\|agent:execute\|agent:permission-respond" \
  apps/desktop/src/main/ipc/

# 型チェック
pnpm --filter @repo/desktop typecheck
```

### 6.3 両TASK完了後の検証

```bash
# IPC 4層整合性スクリプトの実行
node scripts/verify-ipc-4layer.cjs

# 全テスト実行
pnpm --filter @repo/desktop test
```
