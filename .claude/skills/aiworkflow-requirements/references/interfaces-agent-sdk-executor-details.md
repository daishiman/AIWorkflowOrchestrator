# Agent SDK Executor 仕様 / detail specification

> 親仕様書: [interfaces-agent-sdk-executor.md](interfaces-agent-sdk-executor.md)
> 役割: detail specification

## PermissionResolver 型定義（TASK-3-2）

スキル実行時の権限確認を管理するコンポーネント。ユーザーが許可/拒否するまで処理を待機し、タイムアウト・AbortSignal によるキャンセルをサポート。

### 概要

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| 実装ファイル | `apps/desktop/src/main/services/skill/PermissionResolver.ts` |
| 依存型       | `SkillPermissionRequest`, `SkillPermissionResponse`          |
| 使用元       | `SkillExecutor`, IPC Handlers                                |

### アーキテクチャ

PermissionResolverは、Main Process内でSkillExecutorと連携し、Renderer ProcessのPermissionDialogを介してユーザーの権限確認を行う。

#### コンポーネント間の関係

| プロセス         | コンポーネント       | 役割                                   |
| ---------------- | -------------------- | -------------------------------------- |
| Main Process     | SkillExecutor        | 権限確認が必要なツール使用を検出       |
| Main Process     | PermissionResolver   | 権限応答の待機・解決を管理             |
| Main Process     | IPC Handler          | Rendererからの応答を受信しresolve呼出  |
| Renderer Process | PermissionDialog     | ユーザーに許可/拒否を確認するUI        |

#### 通信フロー概要

SkillExecutorがPermissionResolverのwaitForResponseを呼び出すと、IPC経由でRendererのPermissionDialogにリクエストが送信される。ユーザーが許可または拒否を選択すると、その応答がIPC Handlerを通じてPermissionResolverのresolveRequestに渡され、待機中のPromiseが解決される。

### フロー

権限確認は以下の8ステップで実行される。

| ステップ | 実行者           | アクション                                               |
| -------- | ---------------- | -------------------------------------------------------- |
| 1        | SkillExecutor    | 権限確認が必要なツール使用を検出                         |
| 2        | SkillExecutor    | PermissionResolver.waitForResponse(requestId) を呼び出し |
| 3        | Main Process     | IPC で Renderer に SkillPermissionRequest を送信         |
| 4        | Renderer         | PermissionDialog でユーザーに確認                        |
| 5        | ユーザー         | 許可/拒否を選択                                          |
| 6        | Renderer         | IPC で SkillPermissionResponse を Main に返送            |
| 7        | IPC Handler      | PermissionResolver.resolveRequest(response) を呼び出し   |
| 8        | SkillExecutor    | waitForResponse の Promise が解決、処理続行              |

### PermissionResolver クラス

| メソッド          | シグネチャ                                                       | 説明                     |
| ----------------- | ---------------------------------------------------------------- | ------------------------ |
| `waitForResponse` | `(requestId: string, signal?: AbortSignal) => Promise<Response>` | 権限応答を待機           |
| `resolveRequest`  | `(response: SkillPermissionResponse) => void`                    | リクエストを解決         |
| `cancelRequest`   | `(requestId: string, reason?: string) => void`                   | リクエストをキャンセル   |
| `cancelAll`       | `() => void`                                                     | 全リクエストをキャンセル |
| `pendingCount`    | `number` (getter)                                                | 待機中リクエスト数       |

### コンストラクタ

| パラメータ       | 型     | デフォルト | 説明                       |
| ---------------- | ------ | ---------- | -------------------------- |
| `defaultTimeout` | number | 300000     | タイムアウト時間（ミリ秒） |

### 設定定数

| 定数                 | 値       | 説明                         |
| -------------------- | -------- | ---------------------------- |
| `DEFAULT_TIMEOUT_MS` | `300000` | デフォルトタイムアウト (5分) |

### エラーメッセージ

| キー            | メッセージ                                  | 発生条件                 |
| --------------- | ------------------------------------------- | ------------------------ |
| `TIMEOUT`       | `Permission request timed out: {requestId}` | タイムアウト発生時       |
| `ABORTED`       | `Permission request aborted: {requestId}`   | AbortSignal 発火時       |
| `CANCELLED`     | `Permission request cancelled: {requestId}` | cancelRequest 呼び出し時 |
| `CANCELLED_ALL` | `All permission requests cancelled`         | cancelAll 呼び出し時     |

### 注意事項

| 項目                 | 説明                                              |
| -------------------- | ------------------------------------------------- |
| タイムアウト         | 設定時間経過後は Error がスローされる             |
| AbortSignal          | キャンセル時は即座に Error で reject              |
| 存在しない requestId | resolveRequest/cancelRequest はエラーを投げない   |
| メモリリーク防止     | 全てのケースでタイマーがクリアされる              |
| 並行処理             | 複数リクエストを同時に管理可能（Map による O(1)） |

### Permission フォールバックフロー（UT-06-005）

SkillExecutor が Permission 拒否を受けた際のフォールバック処理フロー。

#### processPermissionFallback

Permission レスポンスを受けて適切なアクションを決定する。

**分岐ロジック:**

| 条件 | アクション | 説明 |
| --- | --- | --- |
| `approved === true` | `{ action: "approved" }` | ツール実行を許可 |
| `approved === false && skip === true` | `executeSkipFlow()` → `{ action: "skip" }` | 当該ツールをスキップし実行継続 |
| `approved === false && retryCount < maxRetries` | `{ action: "retry", retryCount: retryCount + 1 }` | Permission を再要求 |
| `approved === false && retryCount >= maxRetries` | `executeAbortFlow("max_retries")` → `{ action: "abort" }` | 最大リトライ到達で中断 |
| catch(error) | `executeAbortFlow("unknown")` → `{ action: "abort" }` | fail-closed 原則 |

#### executeAbortFlow（4ステップ）

スキル実行を安全に中断する4ステップフロー。各ステップは個別の try-catch で保護され、一部失敗でも後続ステップが実行される（fail-closed）。

| Step | 処理 | 失敗時の影響 |
| --- | --- | --- |
| 1 | `permissionResolver.cancelAll()` | 未解決のPermission要求が残存（タイムアウトで自然解消） |
| 2 | `permissionStore.revokeSessionEntries?.(executionId)` | セッション許可が残存（セキュリティリスク低） |
| 3 | `console.warn("[SkillExecutor] abort: ...")` | ログ欠損のみ |
| 4 | `sendStream({ type: "error", content: "Execution aborted: ${reason}" })` | Renderer への通知欠損 |

**冪等性保証**: `abortedExecutions: Set<string>` で管理。二重 abort 時は Step 1-4 をスキップして即座にリターン。

#### executeSkipFlow

当該ツール呼び出しをスキップし、スキル実行を継続する。ExecutionState は `"running"` を維持。

#### timeout → abort フロー

PermissionResolver の応答待機が `DEFAULT_TIMEOUT_MS`（300000ms = 5分）を超過した場合、`executeAbortFlow("timeout")` を呼び出して中断する。retry を経由しない直接 abort。

---

## SkillExecutor IPC統合（TASK-3-2）

TASK-3-1-Aで実装したSkillExecutorの実行結果を、Renderer Processにリアルタイムでストリーミング表示するためのIPC統合。

### 概要

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | TASK-3-2                                                    |
| 完了日       | 2026-01-25                                                  |
| ステータス   | **完了**                                                    |
| テスト数     | 138件（37 + 38 + 40 + 23）                                  |
| ドキュメント | `docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/` |

### Preload API（window.electronAPI.skill）

| メソッド             | シグネチャ                                        | 用途                               |
| -------------------- | ------------------------------------------------- | ---------------------------------- |
| `execute`            | `(request) => Promise<SkillExecutionResponse>`    | スキル実行開始。handoff 時は `handoff/guidance` を返す  |
| `onStream`           | `(callback) => () => void`                        | ストリームメッセージのリスナー登録 |
| `abort`              | `(executionId) => Promise<boolean>`               | 実行中のスキルを中断               |
| `getExecutionStatus` | `(executionId) => Promise<ExecutionInfo \| null>` | 実行状態を照会                     |

### IPCチャンネル

| チャンネル         | 方向            | 用途                 |
| ------------------ | --------------- | -------------------- |
| `skill:execute`    | Renderer → Main | 実行開始（runtime routing 分岐） |
| `skill:stream`     | Main → Renderer | メッセージストリーム |
| `skill:abort`      | Renderer → Main | 実行中断             |
| `skill:get-status` | Renderer → Main | ステータス照会       |

### Runtime routing / handoff 応答契約（2026-03-15 同期）

| チャンネル | handoff 条件 | 応答 |
| --- | --- | --- |
| `skill:execute` | `authMode=subscription` または API key 未設定 | `{ success: true, data: { success: false, handoff: true, guidance, error } }` |
| `agent:start` | `authMode=subscription` または API key 未設定 | `{ success: false, handoff: true, guidance, error }` |

補足:

- `skill:execute` は IPC envelope（`{ success, data }`）を維持し、Preload `safeInvokeUnwrap` と整合させる。
- `agent:start` は `AGENT_EXECUTION_START` チャネルで実行し、Preload `agentAPI` は `AGENT_EXECUTION_*` 系チャネルを使用する。

### React Hook（useSkillExecution）

| プロパティ    | 型                                      | 説明           |
| ------------- | --------------------------------------- | -------------- |
| `messages`    | `SkillStreamMessage[]`                  | メッセージ一覧 |
| `status`      | `ExecutionStatus`                       | 実行状態       |
| `executionId` | `string \| null`                        | 実行ID         |
| `error`       | `SkillExecutionError \| null`           | エラー         |
| `isAborting`  | `boolean`                               | 中断中フラグ   |
| `execute`     | `(prompt) => Promise<Response \| null>` | 実行関数       |
| `abort`       | `() => Promise<void>`                   | 中断関数       |
| `reset`       | `() => void`                            | リセット関数   |

### UIコンポーネント（SkillStreamDisplay）

| Prop             | 型                 | 説明                       |
| ---------------- | ------------------ | -------------------------- |
| `skillId`        | `string`           | 実行対象スキルID           |
| `initialPrompt`  | `string?`          | 初期プロンプト             |
| `autoExecute`    | `boolean?`         | 自動実行フラグ             |
| `onComplete`     | `() => void`       | 完了コールバック           |
| `onError`        | `(error) => void`  | エラーコールバック         |
| `onStatusChange` | `(status) => void` | ステータス変更コールバック |
| `height`         | `string \| number` | 高さ                       |
| `className`      | `string?`          | カスタムクラス             |

### 実装ファイル

| ファイル                                                                | 行数 | 用途             |
| ----------------------------------------------------------------------- | ---- | ---------------- |
| `apps/desktop/src/preload/skill-api.ts`                                 | 101  | Preload API      |
| `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                  | 198  | React Hook       |
| `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | 223  | UIコンポーネント |

### テストカバレッジ

| メトリクス  | 達成値  |
| ----------- | ------- |
| Line        | 95.09%  |
| Branch      | 88.46%  |
| Function    | 100%    |
| Total Index | 283.55% |

---

## AllowedToolEntryV2 / SafetyGatePort 参照（TASK-SKILL-LIFECYCLE-06）

スキル実行エグゼキューターは以下のインターフェースを使用して権限管理・安全性チェックを行う。

### AllowedToolEntryV2

- 型定義ファイル: `apps/desktop/src/main/permissions/permission-store-interface.ts`
- 既存 `AllowedToolEntry` の拡張型（後方互換性あり）
- 追加フィールド: `expiresAt`（失効タイムスタンプ）/ `skillName`（適用スキル名）/ `expiryPolicy`（session | time_24h | time_7d | permanent）

### SafetyGatePort

- 型定義ファイル: `apps/desktop/src/main/permissions/safety-gate.ts`
- 公開前安全性チェックの契約インターフェース
- メソッド: `evaluate(skillName: string): Promise<SafetyGateResult>`
- Task-08（スキル公開）がこのインターフェースを通じて安全性チェックを実行する

詳細は TASK-SKILL-LIFECYCLE-06 の実装ガイド（docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-12/implementation-guide.md）を参照。
