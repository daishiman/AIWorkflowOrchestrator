# Phase 2: API設計書

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase      | 2                        |
| タスクID   | TASK-5-1                 |
| タスク名   | SkillAPI 実装（Preload） |
| 作成日     | 2026-01-27               |
| ステータス | 完了                     |

---

## 1. API概要

`window.skillAPI` は Renderer Process から Skill 機能にアクセスするための Preload API です。

### 1.1 API エンドポイント一覧

| メソッド                 | 種別   | 説明                         |
| ------------------------ | ------ | ---------------------------- |
| `execute`                | invoke | スキル実行を開始             |
| `abort`                  | invoke | 実行中のスキルを中断         |
| `getExecutionStatus`     | invoke | 実行状態を取得               |
| `onStream`               | on     | ストリーミングメッセージ購読 |
| `onPermissionRequest`    | on     | 権限確認リクエスト購読       |
| `sendPermissionResponse` | invoke | 権限確認応答を送信           |

---

## 2. API リファレンス

### 2.1 execute

スキル実行を開始します。

```typescript
execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse>
```

#### パラメータ

| 名前    | 型                      | 説明           |
| ------- | ----------------------- | -------------- |
| request | `SkillExecutionRequest` | 実行リクエスト |

#### SkillExecutionRequest

```typescript
interface SkillExecutionRequest {
  /** 実行するスキル名 */
  skillName: string;
  /** 実行時の入力パラメータ */
  input?: Record<string, unknown>;
  /** 実行オプション */
  options?: {
    /** タイムアウト（ミリ秒） */
    timeout?: number;
    /** 作業ディレクトリ */
    workingDirectory?: string;
  };
}
```

#### 戻り値

| 型                                | 説明                   |
| --------------------------------- | ---------------------- |
| `Promise<SkillExecutionResponse>` | 実行IDを含むレスポンス |

#### SkillExecutionResponse

```typescript
interface SkillExecutionResponse {
  /** 実行ID（後続操作で使用） */
  executionId: string;
  /** 実行開始時刻 */
  startedAt: Date;
  /** 実行ステータス */
  status: "running" | "completed" | "failed" | "aborted";
}
```

#### 使用例

```typescript
const response = await window.skillAPI.execute({
  skillName: "code-review",
  input: { filePath: "/src/main.ts" },
  options: { timeout: 60000 },
});
console.log("Execution started:", response.executionId);
```

#### エラー

| エラー                      | 原因               |
| --------------------------- | ------------------ |
| `Channel not allowed`       | セキュリティ違反   |
| `Skill not found`           | スキルが存在しない |
| `Execution failed to start` | 実行開始に失敗     |

---

### 2.2 abort

実行中のスキルを中断します。

```typescript
abort(executionId: string): Promise<boolean>
```

#### パラメータ

| 名前        | 型       | 説明   |
| ----------- | -------- | ------ |
| executionId | `string` | 実行ID |

#### 戻り値

| 型                 | 説明              |
| ------------------ | ----------------- |
| `Promise<boolean>` | 中断成功時 `true` |

#### 使用例

```typescript
const success = await window.skillAPI.abort(executionId);
if (success) {
  console.log("Execution aborted");
}
```

#### エラー

| エラー                | 原因                     |
| --------------------- | ------------------------ |
| `Channel not allowed` | セキュリティ違反         |
| `Execution not found` | 指定IDの実行が存在しない |

---

### 2.3 getExecutionStatus

実行状態を取得します。

```typescript
getExecutionStatus(executionId: string): Promise<ExecutionInfo | null>
```

#### パラメータ

| 名前        | 型       | 説明   |
| ----------- | -------- | ------ |
| executionId | `string` | 実行ID |

#### 戻り値

| 型                     | 説明   |
| ---------------------- | ------ | ------------------------------ |
| `Promise<ExecutionInfo | null>` | 実行情報（存在しない場合null） |

#### ExecutionInfo

```typescript
interface ExecutionInfo {
  /** 実行ID */
  executionId: string;
  /** スキル名 */
  skillName: string;
  /** 実行ステータス */
  status: "running" | "completed" | "failed" | "aborted";
  /** 開始時刻 */
  startedAt: Date;
  /** 終了時刻（完了時のみ） */
  endedAt?: Date;
  /** 進捗（0-100） */
  progress?: number;
  /** エラーメッセージ（失敗時のみ） */
  error?: string;
}
```

#### 使用例

```typescript
const info = await window.skillAPI.getExecutionStatus(executionId);
if (info) {
  console.log(`Status: ${info.status}, Progress: ${info.progress}%`);
}
```

---

### 2.4 onStream

ストリーミングメッセージを購読します。

```typescript
onStream(callback: (message: SkillStreamMessage) => void): () => void
```

#### パラメータ

| 名前     | 型                                      | 説明                 |
| -------- | --------------------------------------- | -------------------- |
| callback | `(message: SkillStreamMessage) => void` | メッセージハンドラー |

#### SkillStreamMessage

```typescript
interface SkillStreamMessage {
  /** 実行ID */
  executionId: string;
  /** メッセージ種別 */
  type: "text" | "tool_use" | "tool_result" | "progress" | "error";
  /** メッセージ内容 */
  content: unknown;
  /** タイムスタンプ */
  timestamp: Date;
}
```

#### 戻り値

| 型           | 説明               |
| ------------ | ------------------ |
| `() => void` | クリーンアップ関数 |

#### 使用例

```typescript
// React コンポーネント内
useEffect(() => {
  const cleanup = window.skillAPI.onStream((message) => {
    if (message.type === "text") {
      setOutput((prev) => prev + message.content);
    }
  });
  return cleanup; // アンマウント時にリスナー解除
}, []);
```

---

### 2.5 onPermissionRequest

権限確認リクエストを購読します。

```typescript
onPermissionRequest(callback: (request: SkillPermissionRequest) => void): () => void
```

#### パラメータ

| 名前     | 型                                          | 説明                 |
| -------- | ------------------------------------------- | -------------------- |
| callback | `(request: SkillPermissionRequest) => void` | リクエストハンドラー |

#### SkillPermissionRequest

```typescript
interface SkillPermissionRequest {
  /** リクエストID */
  requestId: string;
  /** 実行ID */
  executionId: string;
  /** ツール名 */
  toolName: string;
  /** ツール入力 */
  toolInput: Record<string, unknown>;
  /** リクエストメッセージ */
  message?: string;
}
```

#### 戻り値

| 型           | 説明               |
| ------------ | ------------------ |
| `() => void` | クリーンアップ関数 |

#### 使用例

```typescript
useEffect(() => {
  const cleanup = window.skillAPI.onPermissionRequest((request) => {
    // 権限確認ダイアログを表示
    showPermissionDialog(request);
  });
  return cleanup;
}, []);
```

---

### 2.6 sendPermissionResponse

権限確認応答を送信します。

```typescript
sendPermissionResponse(response: SkillPermissionResponse): Promise<{ success: boolean }>
```

#### パラメータ

| 名前     | 型                        | 説明       |
| -------- | ------------------------- | ---------- |
| response | `SkillPermissionResponse` | 応答データ |

#### SkillPermissionResponse

```typescript
interface SkillPermissionResponse {
  /** リクエストID */
  requestId: string;
  /** 許可/拒否 */
  allowed: boolean;
  /** 記憶するかどうか */
  remember?: boolean;
  /** 拒否理由（allowed=false時） */
  reason?: string;
}
```

#### 戻り値

| 型                              | 説明     |
| ------------------------------- | -------- |
| `Promise<{ success: boolean }>` | 送信結果 |

#### 使用例

```typescript
await window.skillAPI.sendPermissionResponse({
  requestId: request.requestId,
  allowed: true,
  remember: true,
});
```

---

## 3. IPC チャネルマッピング

| API メソッド             | IPC チャネル                | 方向  | ホワイトリスト |
| ------------------------ | --------------------------- | ----- | -------------- |
| `execute`                | `skill:execute`             | R → M | INVOKE         |
| `abort`                  | `skill:abort`               | R → M | INVOKE         |
| `getExecutionStatus`     | `skill:get-status`          | R → M | INVOKE         |
| `onStream`               | `skill:stream`              | M → R | ON             |
| `onPermissionRequest`    | `skill:permission:request`  | M → R | ON             |
| `sendPermissionResponse` | `skill:permission:response` | R → M | INVOKE         |

---

## 4. 型定義ファイル

### 4.1 インポート元

```typescript
// skill-api.ts
import type {
  SkillStreamMessage,
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
} from "@repo/shared/types/skill-execution";

import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";
```

### 4.2 SkillAPI インターフェース全体

```typescript
export interface SkillAPI {
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  abort: (executionId: string) => Promise<boolean>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}
```

---

## 5. グローバル型定義

Renderer で TypeScript の型補完を有効にするための定義:

```typescript
// apps/desktop/src/renderer/types/global.d.ts
declare global {
  interface Window {
    skillAPI: import("../preload/skill-api").SkillAPI;
  }
}
```

---

## 6. エラーハンドリングガイド

### 6.1 共通エラー

| エラーメッセージ           | 原因                | 対処法             |
| -------------------------- | ------------------- | ------------------ |
| `Channel X is not allowed` | チャネル未登録      | channels.ts に追加 |
| `Skill not found`          | スキル名が不正      | スキル名を確認     |
| `Execution not found`      | 実行ID不正/完了済み | 実行状態を確認     |

### 6.2 エラーハンドリングパターン

```typescript
// invoke 系 API
try {
  const result = await window.skillAPI.execute(request);
} catch (error) {
  if (error.message.includes("not allowed")) {
    // セキュリティエラー
  } else if (error.message.includes("not found")) {
    // 存在しないリソース
  } else {
    // その他のエラー
  }
}

// on 系 API（エラーはストリームで通知）
window.skillAPI.onStream((message) => {
  if (message.type === "error") {
    handleStreamError(message.content);
  }
});
```

---

## 7. 使用パターン

### 7.1 基本的な実行フロー

```typescript
// 1. ストリーム購読開始
const cleanupStream = window.skillAPI.onStream(handleMessage);
const cleanupPermission = window.skillAPI.onPermissionRequest(handlePermission);

// 2. スキル実行
const { executionId } = await window.skillAPI.execute({
  skillName: "my-skill",
  input: { prompt: "Hello" },
});

// 3. 定期的に状態確認（オプション）
const interval = setInterval(async () => {
  const info = await window.skillAPI.getExecutionStatus(executionId);
  if (info?.status !== "running") {
    clearInterval(interval);
  }
}, 1000);

// 4. クリーンアップ（コンポーネントアンマウント時）
cleanupStream();
cleanupPermission();
```

### 7.2 React Hooks との統合

```typescript
function useSkillExecution() {
  const [status, setStatus] = useState<ExecutionInfo | null>(null);
  const [messages, setMessages] = useState<SkillStreamMessage[]>([]);

  useEffect(() => {
    const cleanup = window.skillAPI.onStream((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return cleanup;
  }, []);

  const execute = async (request: SkillExecutionRequest) => {
    const response = await window.skillAPI.execute(request);
    // ...
    return response;
  };

  return { status, messages, execute };
}
```

---

## 8. 実装確認

| 確認項目                          | 状態    |
| --------------------------------- | ------- |
| 全6メソッドが実装されている       | ✅ 完了 |
| 型定義が@repo/sharedから参照      | ✅ 完了 |
| IPCチャネルがホワイトリストに登録 | ✅ 完了 |
| クリーンアップ関数が返される      | ✅ 完了 |

---

## 9. 次のステップ

Phase 3: 設計レビューゲートへ進む
