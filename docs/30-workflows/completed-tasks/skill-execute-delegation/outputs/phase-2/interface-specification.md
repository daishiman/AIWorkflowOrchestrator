# インターフェース仕様書: SkillService.executeSkill() の SkillExecutor 委譲

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| Phase    | 2                                     |
| 作成日   | 2026-02-11                            |

---

## 1. IPCハンドラーインターフェース

### 1.1 skill:execute ハンドラー

#### 現在の実装

```typescript
// skillHandlers.ts (現在: L184-213)
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.skillId !== "string" || args.skillId === "") {
      return { success: false, error: "skillId must be a string" };
    }
    try {
      const result = await skillService.executeSkill(args.skillId, args.params);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "スキル実行に失敗しました",
      };
    }
  },
);
```

#### 新しい実装

```typescript
// skillHandlers.ts (変更後)
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    // 1. 送信元検証
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // 2. 引数バリデーション
    if (typeof args?.skillId !== "string" || args.skillId === "") {
      return {
        success: false,
        error: "skillId must be a string",
        errorCode: "VALIDATION_FAILED",
      };
    }

    try {
      // 3. スキルメタデータを取得
      const skill = await skillService.getSkillById(args.skillId);
      if (!skill) {
        return {
          success: false,
          error: "スキルが見つかりません",
          errorCode: "SKILL_NOT_FOUND",
        };
      }

      // 4. SkillExecutor の存在確認
      if (!_skillExecutorInstance) {
        return {
          success: false,
          error: "SkillExecutor が初期化されていません",
          errorCode: "EXECUTOR_NOT_INITIALIZED",
        };
      }

      // 5. SkillExecutionRequest を構築
      const request: SkillExecutionRequest = {
        prompt: extractPromptFromParams(args.params),
        skillId: args.skillId,
        timeout: args.params?.timeout as number | undefined,
      };

      // 6. Skill → SkillMetadata 変換
      const skillMetadata = convertToSkillMetadata(skill);

      // 7. SkillExecutor.execute() を呼び出し
      const response = await _skillExecutorInstance.execute(
        request,
        skillMetadata,
      );

      // 8. レスポンスを変換
      if (response.success) {
        return {
          success: true,
          data: { executionId: response.executionId },
        };
      } else {
        return {
          success: false,
          error: response.error?.message ?? "スキル実行に失敗しました",
          errorCode: response.error?.code,
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "スキル実行に失敗しました",
        errorCode: "EXECUTION_FAILED",
      };
    }
  },
);
```

---

## 2. 新規関数インターフェース

### 2.1 extractPromptFromParams

```typescript
/**
 * IPC引数からプロンプトを抽出する
 *
 * params.prompt を優先し、存在しない場合は params.message にフォールバック。
 * どちらも存在しない場合は空文字列を返す。
 *
 * @param params - IPC引数のparams
 * @returns プロンプト文字列
 *
 * @example
 * extractPromptFromParams({ prompt: "hello" })  // => "hello"
 * extractPromptFromParams({ message: "world" }) // => "world"
 * extractPromptFromParams({ prompt: "a", message: "b" }) // => "a"
 * extractPromptFromParams(undefined) // => ""
 * extractPromptFromParams({}) // => ""
 */
function extractPromptFromParams(params?: Record<string, unknown>): string {
  if (!params) {
    return "";
  }

  // promptフィールドがあればそれを使用
  if (typeof params.prompt === "string") {
    return params.prompt;
  }

  // messageフィールドがあればそれを使用（互換性のため）
  if (typeof params.message === "string") {
    return params.message;
  }

  // その他の場合は空文字
  return "";
}
```

### 2.2 convertToSkillMetadata

```typescript
/**
 * Skill型をSkillMetadata型に変換する
 *
 * SkillExecutorはSkillMetadata型を期待するため、
 * Skill型からlastModifiedを除いた形式に変換する。
 *
 * @param skill - 変換元のSkillオブジェクト
 * @returns SkillMetadataオブジェクト
 *
 * @example
 * const skill: Skill = {
 *   id: "skill-1",
 *   name: "Test Skill",
 *   // ...other fields
 *   lastModified: new Date()
 * };
 * const metadata = convertToSkillMetadata(skill);
 * // metadata.lastModified は undefined
 */
function convertToSkillMetadata(skill: Skill): SkillMetadata {
  return {
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    description: skill.description,
    path: skill.path,
    triggers: skill.triggers,
    anchors: skill.anchors,
    allowedTools: skill.allowedTools,
  };
}
```

---

## 3. 型定義

### 3.1 SkillExecutionRequest

```typescript
/** スキル実行リクエスト */
export interface SkillExecutionRequest {
  /** ユーザープロンプト */
  prompt: string;
  /** スキルID */
  skillId: string;
  /** タイムアウト（ミリ秒、オプション） */
  timeout?: number;
  /** セッションID（オプション） */
  sessionId?: string;
  /** リトライ設定（部分指定可能） */
  retryConfig?: Partial<RetryConfig>;
}
```

### 3.2 SkillExecutionResponse

```typescript
/** スキル実行レスポンス */
export interface SkillExecutionResponse {
  /** 実行ID */
  executionId: string;
  /** 成功フラグ */
  success: boolean;
  /** エラー情報（失敗時） */
  error?: SkillExecutionError;
}
```

### 3.3 SkillMetadata

```typescript
/** SkillMetadata - Skillを拡張した実行用メタデータ */
export interface SkillMetadata extends Omit<Skill, "lastModified"> {
  // Skill型から継承:
  // - id: string
  // - name: string
  // - slug: string
  // - description: string
  // - path: string
  // - triggers: SkillTrigger[]
  // - anchors: SkillAnchor[]
  // - allowedTools?: string[]
}
```

### 3.4 SkillExecutionError

```typescript
/** スキル実行エラー */
export interface SkillExecutionError {
  /** エラーコード */
  code: SkillExecutionErrorCode;
  /** エラーメッセージ */
  message: string;
  /** 詳細情報（オプション） */
  details?: unknown;
}

/** スキル実行エラーコード */
export type SkillExecutionErrorCode =
  | "EXECUTION_FAILED"
  | "TIMEOUT"
  | "ABORTED"
  | "MAX_CONCURRENT_EXCEEDED"
  | "SKILL_NOT_FOUND"
  | "VALIDATION_FAILED"
  | "SDK_ERROR"
  | "NETWORK_ERROR"
  | "AUTHENTICATION_ERROR";
```

### 3.5 IPCレスポンス形式

```typescript
// 成功時
interface SkillExecuteSuccessResponse {
  success: true;
  data: {
    executionId: string;
  };
}

// 失敗時
interface SkillExecuteErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
}

type SkillExecuteResponse =
  | SkillExecuteSuccessResponse
  | SkillExecuteErrorResponse;
```

---

## 4. ストリームメッセージ

### 4.1 SkillStreamMessage

```typescript
/** スキルストリームメッセージ */
export interface SkillStreamMessage {
  /** 実行ID */
  executionId: string;
  /** メッセージID */
  id: string;
  /** メッセージタイプ */
  type: SkillStreamMessageType;
  /** コンテンツ */
  content: string;
  /** タイムスタンプ */
  timestamp: number;
  /** 完了フラグ */
  isComplete: boolean;
}

/** ストリームメッセージタイプ */
export type SkillStreamMessageType =
  | "text" // テキストメッセージ
  | "tool_use" // ツール使用通知
  | "error" // エラー通知
  | "complete" // 完了通知
  | "retry"; // リトライ通知
```

### 4.2 ストリームメッセージ例

#### text メッセージ

```typescript
{
  executionId: "exec-123",
  id: "msg-1",
  type: "text",
  content: "分析を開始します...",
  timestamp: 1707638400000,
  isComplete: false
}
```

#### tool_use メッセージ

```typescript
{
  executionId: "exec-123",
  id: "msg-2",
  type: "tool_use",
  content: JSON.stringify({
    name: "Read",
    input: { file_path: "/path/to/file.ts" }
  }),
  timestamp: 1707638401000,
  isComplete: false
}
```

#### error メッセージ

```typescript
{
  executionId: "exec-123",
  id: "msg-3",
  type: "error",
  content: "Authentication failed",
  timestamp: 1707638402000,
  isComplete: true
}
```

#### complete メッセージ

```typescript
{
  executionId: "exec-123",
  id: "msg-4",
  type: "complete",
  content: "",
  timestamp: 1707638403000,
  isComplete: true
}
```

#### retry メッセージ

```typescript
{
  executionId: "exec-123",
  id: "msg-5",
  type: "retry",
  content: JSON.stringify({
    attempt: 1,
    maxRetries: 3,
    delayMs: 1000,
    errorType: "network",
    errorMessage: "Connection reset"
  }),
  timestamp: 1707638404000,
  isComplete: false
}
```

---

## 5. IPCチャンネル

| チャンネル                 | 定数                                      | 方向            | 説明           |
| -------------------------- | ----------------------------------------- | --------------- | -------------- |
| `skill:execute`            | `IPC_CHANNELS.SKILL_EXECUTE`              | Renderer → Main | スキル実行開始 |
| `skill:stream`             | `SKILL_CHANNELS.SKILL_STREAM`             | Main → Renderer | ストリーム配信 |
| `skill:abort`              | `IPC_CHANNELS.SKILL_ABORT`                | Renderer → Main | 実行中断       |
| `skill:get-status`         | `IPC_CHANNELS.SKILL_GET_STATUS`           | Renderer → Main | ステータス照会 |
| `skill:permission-request` | `SKILL_CHANNELS.SKILL_PERMISSION_REQUEST` | Main → Renderer | 権限リクエスト |

---

## 6. エラーコード一覧

| エラーコード               | 発生箇所      | 説明                      | リトライ |
| -------------------------- | ------------- | ------------------------- | -------- |
| `VALIDATION_FAILED`        | ハンドラー    | 引数バリデーション失敗    | 不可     |
| `SKILL_NOT_FOUND`          | ハンドラー    | スキルが見つからない      | 不可     |
| `EXECUTOR_NOT_INITIALIZED` | ハンドラー    | SkillExecutorが未初期化   | 不可     |
| `AUTHENTICATION_ERROR`     | SkillExecutor | APIキーが未設定または無効 | 不可     |
| `EXECUTION_FAILED`         | SkillExecutor | SDK実行中にエラー発生     | 状況依存 |
| `TIMEOUT`                  | SkillExecutor | 実行がタイムアウト        | 可能     |
| `ABORTED`                  | SkillExecutor | ユーザーによる中断        | 不可     |
| `MAX_CONCURRENT_EXCEEDED`  | SkillExecutor | 同時実行数上限に達した    | 可能     |
| `NETWORK_ERROR`            | SkillExecutor | ネットワークエラー        | 可能     |
| `SDK_ERROR`                | SkillExecutor | SDKの内部エラー           | 状況依存 |

---

## 7. 既存インターフェースとの互換性

### 7.1 維持するインターフェース

| インターフェース         | 維持内容                              |
| ------------------------ | ------------------------------------- |
| skill:execute 引数       | `{ skillId, params }` 形式を維持      |
| skill:execute レスポンス | `{ success, data, error }` 形式を維持 |
| skill:abort 引数         | `executionId: string` 形式を維持      |
| skill:get-status 引数    | `executionId: string` 形式を維持      |
| SKILL_STREAM メッセージ  | SkillStreamMessage 形式を維持         |

### 7.2 非推奨化するインターフェース

| インターフェース              | 対応                         |
| ----------------------------- | ---------------------------- |
| `SkillService.executeSkill()` | `@deprecated` コメントを追加 |

```typescript
/**
 * スキルを実行する
 *
 * @deprecated SkillExecutor.execute() を直接使用してください。
 * このメソッドはスタブ実装であり、実際のスキル実行は行いません。
 * TASK-FIX-7-1 で非推奨化されました。
 *
 * @param skillId - スキルID
 * @param _params - 実行パラメータ（未使用）
 * @returns スキル実行結果（常に成功を返す）
 */
async executeSkill(
  skillId: string,
  _params?: Record<string, unknown>,
): Promise<SkillRunResult> {
  // ...
}
```

---

## 8. インポート文

### 8.1 skillHandlers.ts の追加インポート

```typescript
// 既存
import { SkillExecutor } from "../services/skill/SkillExecutor";

// 追加（型のみ）
import type {
  SkillExecutionRequest,
  SkillMetadata,
} from "../services/skill/SkillExecutor";
```

---

## 9. テスト用モックインターフェース

### 9.1 MockSkillExecutor

```typescript
const mockSkillExecutor = {
  execute: vi.fn().mockResolvedValue({
    executionId: "exec-123",
    success: true,
  }),
  abort: vi.fn().mockReturnValue(true),
  getExecutionStatus: vi.fn().mockReturnValue({
    id: "exec-123",
    skillId: "skill-1",
    state: "running",
    startedAt: Date.now(),
  }),
  getActiveExecutions: vi.fn().mockReturnValue([]),
};
```

### 9.2 MockSkillService

```typescript
const mockSkillService = {
  getSkillById: vi.fn().mockResolvedValue({
    id: "skill-1",
    name: "Test Skill",
    slug: "test-skill",
    description: "A test skill",
    path: "/skills/test",
    triggers: [],
    anchors: [],
    allowedTools: ["Read", "Edit"],
    lastModified: new Date(),
  }),
  // ...other methods
};
```
