# SkillExecutor 実装ガイド - TASK-3-1-A

## Part 1: 概念的説明

### SkillExecutor とは？

SkillExecutor は、AIWorkflowOrchestrator のスキル実行エンジンです。ユーザーのリクエストをClaude Agent SDKに送信し、AIの応答をリアルタイムでアプリケーションに配信します。

### なぜ必要？

従来のAPI呼び出しでは、AIの応答が完了するまで待つ必要がありました。SkillExecutor はストリーミング技術を使用して、AIが応答を生成している最中からテキストを表示できます。

```
従来の方式:
[リクエスト] → [待機...] → [完全な応答を一度に受信]

ストリーミング方式:
[リクエスト] → [少しずつ応答を受信] → [リアルタイム表示]
```

### 主な機能

| 機能           | 説明                                 |
| -------------- | ------------------------------------ |
| スキル実行     | スキルプロンプトをAIに送信し実行     |
| ストリーミング | 応答をリアルタイムで受信・配信       |
| 中断機能       | 実行中のスキルをキャンセル           |
| 状態管理       | 実行中・完了・エラーなどの状態を追跡 |

### 動作の流れ

```
1. ユーザーがスキルを選択
       ↓
2. SkillExecutor.execute() が呼ばれる
       ↓
3. Claude Agent SDK の query() API を呼び出し
       ↓
4. AIからのストリーミングレスポンスを受信
       ↓
5. IPC経由でRenderer Processへリアルタイム配信
       ↓
6. UIにテキストが順次表示される
```

---

## Part 2: 技術的詳細

### API リファレンス

#### SkillExecutor クラス

**インポート**:

```typescript
import { SkillExecutor } from "@/main/services/skill/SkillExecutor";
```

**コンストラクタ**:

```typescript
constructor(mainWindow: BrowserWindow)
```

| パラメータ | 型            | 説明                          |
| ---------- | ------------- | ----------------------------- |
| mainWindow | BrowserWindow | IPC送信先のElectronウィンドウ |

### パブリックメソッド

#### execute()

スキルを実行し、ストリーミングレスポンスを開始する。

```typescript
async execute(
  request: SkillExecutionRequest,
  skill: SkillMetadata
): Promise<SkillExecutionResponse>
```

**パラメータ**:

| パラメータ | 型                    | 説明             |
| ---------- | --------------------- | ---------------- |
| request    | SkillExecutionRequest | 実行リクエスト   |
| skill      | SkillMetadata         | スキルメタデータ |

**戻り値**:

```typescript
interface SkillExecutionResponse {
  executionId: string; // UUID v4形式の実行ID
  success: boolean; // 成功/失敗
  error?: SkillExecutionError; // エラー情報（失敗時）
}
```

#### abort()

実行中のスキルを中断する。

```typescript
abort(executionId: string): boolean
```

**パラメータ**:

| パラメータ  | 型     | 説明             |
| ----------- | ------ | ---------------- |
| executionId | string | 中断対象の実行ID |

**戻り値**: 中断成功の場合 `true`、対象が存在しない場合 `false`

#### getActiveExecutions()

アクティブな実行一覧を取得する。

```typescript
getActiveExecutions(): ExecutionInfo[]
```

#### getExecutionStatus()

特定の実行状態を取得する。

```typescript
getExecutionStatus(executionId: string): ExecutionInfo | undefined
```

### 型定義

#### SkillExecutionRequest

```typescript
interface SkillExecutionRequest {
  prompt: string; // ユーザーの入力プロンプト
  skillId: string; // 実行対象のスキルID
  timeout?: number; // タイムアウト（ミリ秒、デフォルト30000）
  sessionId?: string; // セッションID（会話継続用）
}
```

#### SkillMetadata

```typescript
interface SkillMetadata {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  allowedTools?: string[];
}
```

#### SkillStreamMessage

```typescript
interface SkillStreamMessage {
  executionId: string; // 実行ID
  id: string; // メッセージID（UUID）
  type: SkillStreamMessageType; // メッセージタイプ
  content: string; // メッセージ内容
  timestamp: number; // タイムスタンプ
  isComplete: boolean; // 完了フラグ
}

type SkillStreamMessageType =
  | "text" // テキスト応答
  | "tool_use" // ツール使用
  | "error" // エラー
  | "complete"; // 完了
```

#### ExecutionState

```typescript
type ExecutionState =
  | "pending" // 開始待ち
  | "running" // 実行中
  | "completed" // 正常完了
  | "aborted" // 中断済み
  | "error"; // エラー終了
```

### 使用例

#### 基本的なスキル実行

```typescript
import { SkillExecutor } from "@/main/services/skill/SkillExecutor";
import { BrowserWindow } from "electron";

// SkillExecutorの初期化
const mainWindow = BrowserWindow.getFocusedWindow();
const executor = new SkillExecutor(mainWindow);

// スキルの実行
const response = await executor.execute(
  {
    prompt: "このコードをレビューしてください",
    skillId: "code-review",
  },
  {
    id: "code-review",
    name: "Code Review",
    slug: "code-review",
    description: "コードレビューを行うスキル",
    path: "/skills/code-review.md",
    triggers: ["review", "レビュー"],
    anchors: [],
    allowedTools: ["Read", "Grep"],
  },
);

console.log("Execution ID:", response.executionId);
console.log("Success:", response.success);
```

#### ストリーミングメッセージの受信（Renderer Process）

```typescript
import { ipcRenderer } from "electron";

// ストリームメッセージのリスナー登録
ipcRenderer.on("skill:stream", (event, message: SkillStreamMessage) => {
  switch (message.type) {
    case "text":
      console.log("Text:", message.content);
      // UIに追記表示
      break;
    case "tool_use":
      console.log("Tool use:", JSON.parse(message.content));
      // ツール使用の表示
      break;
    case "error":
      console.error("Error:", message.content);
      // エラー表示
      break;
    case "complete":
      console.log("Completed");
      // 完了処理
      break;
  }
});
```

#### 実行の中断

```typescript
// 実行を中断
const aborted = executor.abort(response.executionId);
if (aborted) {
  console.log("Execution aborted successfully");
}
```

#### アクティブな実行の監視

```typescript
// アクティブな実行一覧を取得
const activeExecutions = executor.getActiveExecutions();
console.log("Active executions:", activeExecutions.length);

// 特定の実行状態を取得
const status = executor.getExecutionStatus(executionId);
if (status) {
  console.log("State:", status.state);
  console.log("Started at:", new Date(status.startedAt));
}
```

### IPCチャンネル

| チャンネル   | 方向            | ペイロード         |
| ------------ | --------------- | ------------------ |
| skill:stream | Main → Renderer | SkillStreamMessage |

### 制限事項

| 項目                   | 値   | 説明                                           |
| ---------------------- | ---- | ---------------------------------------------- |
| 同時実行数             | 5    | MAX_CONCURRENT_EXECUTIONS                      |
| デフォルトタイムアウト | 30秒 | DEFAULT_TIMEOUT_MS                             |
| 履歴保持期間           | 60秒 | HISTORY_RETENTION_MS（クリーンアップ待機時間） |

### エラーコード

| コード                  | 説明                 |
| ----------------------- | -------------------- |
| EXECUTION_FAILED        | 一般的な実行エラー   |
| TIMEOUT                 | タイムアウト         |
| ABORTED                 | ユーザーによる中断   |
| MAX_CONCURRENT_EXCEEDED | 同時実行数超過       |
| SKILL_NOT_FOUND         | スキルが見つからない |
| VALIDATION_FAILED       | バリデーションエラー |
| SDK_ERROR               | SDKエラー            |
| NETWORK_ERROR           | ネットワークエラー   |
| AUTHENTICATION_ERROR    | 認証エラー           |

---

## 参考資料

| 資料               | パス                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| 実装ファイル       | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                               |
| 要件定義           | `outputs/phase-1/requirements-definition.md`                           |
