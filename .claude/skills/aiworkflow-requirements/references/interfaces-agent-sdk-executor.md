# Agent SDK Executor 仕様

> 本ドキュメントは interfaces-agent-sdk.md の分割ファイルです。
> 親ファイル: interfaces-agent-sdk.md
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

SkillExecutor、PermissionResolverに関する型定義とAPI仕様。
実行エンジン・権限確認機能の実装時に参照する。

---

## SkillExecutor 型定義（TASK-3-1-A）

Claude Agent SDK の `query()` API を使用してスキルを実行し、ストリーミングレスポンスを Renderer Process に配信する実行エンジン。

### 概要

| 項目           | 内容                                                    |
| -------------- | ------------------------------------------------------- |
| 実装ファイル   | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |
| 型定義         | `packages/shared/src/types/skill-execution.ts`          |
| IPC チャンネル | `skill:stream` (Main → Renderer)                        |
| SDK 依存       | `@anthropic-ai/claude-agent-sdk`                        |

### アーキテクチャ

SkillExecutorは、Main ProcessとRenderer Process間でIPCを介してストリーミング通信を行う。

#### プロセス間通信構造

| レイヤー         | コンポーネント       | 役割                                   |
| ---------------- | -------------------- | -------------------------------------- |
| Renderer Process | React UI             | ユーザーインターフェース               |
| Renderer Process | onSkillStream        | ストリームリスナー                     |
| IPC              | skill:stream         | Main → Renderer へのメッセージ配信     |
| Main Process     | SkillExecutor        | スキル実行管理（execute, abort等）     |
| Main Process     | Claude Agent SDK     | query().stream() によるAPI呼び出し     |

#### データフロー

1. Renderer ProcessのReact UIがスキル実行をリクエスト
2. Main ProcessのSkillExecutorがClaude Agent SDKを呼び出し
3. SDKからのストリーミングレスポンスをIPC経由でRendererに配信
4. React UIのonSkillStreamリスナーがメッセージを受信・表示

### 型定義

#### ExecutionState

実行状態を表す列挙型。

| 値          | 説明         |
| ----------- | ------------ |
| `pending`   | 実行待ち     |
| `running`   | 実行中       |
| `completed` | 完了         |
| `aborted`   | ユーザー中断 |
| `error`     | エラー発生   |

#### SkillExecutionRequest

スキル実行リクエスト（Renderer → Main）。

| プロパティ  | 型       | 必須 | 説明                       |
| ----------- | -------- | ---- | -------------------------- |
| `prompt`    | `string` | ✓    | 実行プロンプト             |
| `skillId`   | `string` | ✓    | スキルID                   |
| `timeout`   | `number` | -    | タイムアウト (ms)          |
| `sessionId` | `string` | -    | セッションID（会話継続用） |

#### SkillExecutionResponse

スキル実行レスポンス（Main → Renderer）。

| プロパティ    | 型                    | 必須 | 説明                 |
| ------------- | --------------------- | ---- | -------------------- |
| `executionId` | `string`              | ✓    | 実行ID（UUID）       |
| `success`     | `boolean`             | ✓    | 成功/失敗フラグ      |
| `error`       | `SkillExecutionError` | -    | エラー情報（失敗時） |

#### SkillStreamMessage

ストリーミングメッセージ（Main → Renderer）。

| プロパティ    | 型                       | 必須 | 説明                 |
| ------------- | ------------------------ | ---- | -------------------- |
| `executionId` | `string`                 | ✓    | 実行ID               |
| `id`          | `string`                 | ✓    | メッセージID（UUID） |
| `type`        | `SkillStreamMessageType` | ✓    | メッセージ種別       |
| `content`     | `string`                 | ✓    | メッセージ内容       |
| `timestamp`   | `number`                 | ✓    | タイムスタンプ       |
| `isComplete`  | `boolean`                | ✓    | 完了フラグ           |

#### SkillStreamMessageType

| 値         | 説明               |
| ---------- | ------------------ |
| `text`     | テキストメッセージ |
| `tool_use` | ツール使用         |
| `error`    | エラーメッセージ   |
| `complete` | 完了通知           |

#### SkillExecutionError

| プロパティ | 型                        | 必須 | 説明             |
| ---------- | ------------------------- | ---- | ---------------- |
| `code`     | `SkillExecutionErrorCode` | ✓    | エラーコード     |
| `message`  | `string`                  | ✓    | エラーメッセージ |
| `details`  | `unknown`                 | -    | 詳細情報         |

#### SkillExecutionErrorCode

| コード                    | 説明               |
| ------------------------- | ------------------ |
| `MAX_CONCURRENT_EXCEEDED` | 同時実行数超過     |
| `ABORTED`                 | ユーザーによる中断 |
| `TIMEOUT`                 | タイムアウト       |
| `EXECUTION_FAILED`        | 実行失敗           |

#### ExecutionInfo

実行情報（状態確認用）。

| プロパティ    | 型               | 必須 | 説明               |
| ------------- | ---------------- | ---- | ------------------ |
| `id`          | `string`         | ✓    | 実行ID             |
| `skillId`     | `string`         | ✓    | スキルID           |
| `state`       | `ExecutionState` | ✓    | 実行状態           |
| `startedAt`   | `number`         | ✓    | 開始タイムスタンプ |
| `completedAt` | `number`         | -    | 完了タイムスタンプ |

### API リファレンス

#### SkillExecutor クラス

| メソッド              | シグネチャ                                            | 説明               |
| --------------------- | ----------------------------------------------------- | ------------------ |
| `execute`             | `(request, skill) => Promise<SkillExecutionResponse>` | スキル実行         |
| `abort`               | `(executionId: string) => boolean`                    | 実行中断           |
| `getActiveExecutions` | `() => ExecutionInfo[]`                               | アクティブ実行一覧 |
| `getExecutionStatus`  | `(executionId: string) => ExecutionInfo \| undefined` | 実行状態取得       |

### IPC チャンネル（SkillExecutor）

| チャンネル     | 方向            | 説明               |
| -------------- | --------------- | ------------------ |
| `skill:stream` | Main → Renderer | ストリーミング配信 |

### 設定定数

| 定数                        | 値      | 説明                         |
| --------------------------- | ------- | ---------------------------- |
| `DEFAULT_TOOLS`             | 5ツール | Read, Edit, Bash, Glob, Grep |
| `DEFAULT_TIMEOUT_MS`        | `30000` | デフォルトタイムアウト (ms)  |
| `MAX_CONCURRENT_EXECUTIONS` | `5`     | 最大同時実行数               |
| `HISTORY_RETENTION_MS`      | `60000` | 履歴保持期間 (ms)            |

---

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

### Preload API（skillAPI）

| メソッド             | シグネチャ                                        | 用途                               |
| -------------------- | ------------------------------------------------- | ---------------------------------- |
| `execute`            | `(request) => Promise<SkillExecutionResponse>`    | スキル実行開始、executionIdを返す  |
| `onStream`           | `(callback) => () => void`                        | ストリームメッセージのリスナー登録 |
| `abort`              | `(executionId) => Promise<boolean>`               | 実行中のスキルを中断               |
| `getExecutionStatus` | `(executionId) => Promise<ExecutionInfo \| null>` | 実行状態を照会                     |

### IPCチャンネル

| チャンネル         | 方向            | 用途                 |
| ------------------ | --------------- | -------------------- |
| `skill:execute`    | Renderer → Main | 実行開始             |
| `skill:stream`     | Main → Renderer | メッセージストリーム |
| `skill:abort`      | Renderer → Main | 実行中断             |
| `skill:get-status` | Renderer → Main | ステータス照会       |

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

## 関連ドキュメント

| ドキュメント                        | 説明                       |
| ----------------------------------- | -------------------------- |
| interfaces-agent-sdk.md             | 親ファイル（インデックス） |
| interfaces-agent-sdk-integration.md | 統合機能仕様               |
| interfaces-agent-sdk-history.md     | 完了タスク履歴             |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                                   |
| ---------- | ---------- | ---------------------------------------------------------- |
| 2026-01-26 | 1.1.0      | spec-guidelines.md準拠: コードブロックを表形式・文章に変換 |
| 2026-01-26 | 1.0.0      | interfaces-agent-sdk.mdから分割                            |
