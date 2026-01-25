# IPC 統合要件定義 - TASK-3-2 Phase 1

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| 作成日     | 2026-01-25      |
| Phase      | 1               |
| タスク     | IPC統合要件定義 |
| ステータス | 完了            |

---

## 1. Preload API 要件

### 1.1 skillAPI 名前空間

新規 Preload API として `skillAPI` を定義する。

#### API 定義

```typescript
interface SkillAPI {
  /**
   * スキルを実行する
   * @param request - 実行リクエスト
   * @returns 実行レスポンス（executionId を含む）
   */
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;

  /**
   * ストリームメッセージを受信するコールバックを登録する
   * @param callback - メッセージ受信時のコールバック関数
   * @returns クリーンアップ関数（リスナー解除用）
   */
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;

  /**
   * 実行中のスキルを中断する
   * @param executionId - 中断対象の実行ID
   * @returns 中断成功の場合 true
   */
  abort: (executionId: string) => Promise<boolean>;
}
```

### 1.2 skillAPI.onStream() 詳細要件

| 要件ID   | 要件                   | 詳細                                        |
| -------- | ---------------------- | ------------------------------------------- |
| PAPI-001 | コールバック登録       | IPC `skill:stream` チャンネルのリスナー登録 |
| PAPI-002 | メッセージ透過         | SkillStreamMessage をそのままコールバックへ |
| PAPI-003 | クリーンアップ関数返却 | removeListener を実行する関数を返す         |
| PAPI-004 | 複数リスナー対応       | 複数コールバックの同時登録を許可            |

#### 実装パターン

```typescript
onStream: (callback: (message: SkillStreamMessage) => void): (() => void) => {
  const handler = (_event: IpcRendererEvent, message: SkillStreamMessage) => {
    callback(message);
  };
  ipcRenderer.on("skill:stream", handler);
  return () => ipcRenderer.removeListener("skill:stream", handler);
};
```

### 1.3 skillAPI.abort() 詳細要件

| 要件ID   | 要件               | 詳細                              |
| -------- | ------------------ | --------------------------------- |
| PAPI-005 | invoke パターン    | ipcRenderer.invoke を使用         |
| PAPI-006 | executionId 必須   | 引数として executionId を受け取る |
| PAPI-007 | boolean 戻り値     | 成功時 true、失敗時 false を返す  |
| PAPI-008 | エラーハンドリング | IPC エラー時は false を返す       |

#### 実装パターン

```typescript
abort: (executionId: string): Promise<boolean> =>
  ipcRenderer.invoke("skill:abort", executionId);
```

---

## 2. IPC Handler 要件

### 2.1 チャンネル定義追加

`apps/desktop/src/preload/channels.ts` に追加：

```typescript
// IPC_CHANNELS 追加
SKILL_STREAM: "skill:stream",
SKILL_ABORT: "skill:abort",
```

### 2.2 許可リスト追加

```typescript
// ALLOWED_INVOKE_CHANNELS 追加
IPC_CHANNELS.SKILL_ABORT,

// ALLOWED_ON_CHANNELS 追加
IPC_CHANNELS.SKILL_STREAM,
```

### 2.3 Main Process Handler

#### skill:abort ハンドラー

```typescript
// apps/desktop/src/main/ipc/skill-handlers.ts（既存または新規）
ipcMain.handle("skill:abort", async (event, executionId: string) => {
  const executor = getSkillExecutor();
  return executor.abort(executionId);
});
```

---

## 3. UI 要件

### 3.1 React Hook: useSkillExecution

#### 目的

スキル実行の状態管理とストリーミングメッセージの集約を行う。

#### インターフェース

```typescript
interface UseSkillExecutionReturn {
  /** 受信したメッセージ一覧 */
  messages: SkillStreamMessage[];
  /** 実行状態 */
  status: "idle" | "running" | "completed" | "error" | "aborted";
  /** 現在の実行ID */
  executionId: string | null;
  /** エラー情報（エラー時のみ） */
  error: SkillExecutionError | null;
  /** スキルを実行する */
  execute: (prompt: string) => Promise<SkillExecutionResponse>;
  /** 実行を中断する */
  abort: () => Promise<void>;
  /** 状態をリセットする */
  reset: () => void;
}

function useSkillExecution(skillId: string): UseSkillExecutionReturn;
```

#### 状態遷移

```
idle → running → completed
              ↘ error
              ↘ aborted
```

#### 要件

| 要件ID   | 要件                 | 詳細                                    |
| -------- | -------------------- | --------------------------------------- |
| HOOK-001 | executionId フィルタ | 現在の executionId のメッセージのみ処理 |
| HOOK-002 | メモリリーク防止     | useEffect で onStream を cleanup        |
| HOOK-003 | 状態同期             | complete/error メッセージで status 更新 |
| HOOK-004 | メッセージ蓄積       | 受信メッセージを配列に追加（順序保持）  |
| HOOK-005 | リセット機能         | messages・status・error を初期化        |

### 3.2 ストリーミング表示コンポーネント

#### コンポーネント構成

```
SkillStreamDisplay/
├── index.tsx           # メインコンポーネント
├── MessageList.tsx     # メッセージ一覧
├── MessageItem.tsx     # 個別メッセージ
├── StatusIndicator.tsx # 状態表示
├── AbortButton.tsx     # 中断ボタン
└── ErrorDisplay.tsx    # エラー表示
```

#### SkillStreamDisplay Props

```typescript
interface SkillStreamDisplayProps {
  skillId: string;
  prompt: string;
  onComplete?: () => void;
  onError?: (error: SkillExecutionError) => void;
}
```

#### 要件

| 要件ID | 要件               | 詳細                                   |
| ------ | ------------------ | -------------------------------------- |
| UI-001 | リアルタイム表示   | メッセージ受信時に即座に表示更新       |
| UI-002 | 自動スクロール     | 新メッセージ受信時に最下部へスクロール |
| UI-003 | メッセージタイプ別 | text/tool_use/error で表示形式を変える |
| UI-004 | ローディング表示   | running 状態でスピナー表示             |
| UI-005 | 完了表示           | completed 状態で完了メッセージ表示     |
| UI-006 | エラー表示         | error 状態でエラー詳細表示             |

### 3.3 中断ボタン

#### 要件

| 要件ID    | 要件           | 詳細                               |
| --------- | -------------- | ---------------------------------- |
| ABORT-001 | 表示条件       | status が running の時のみ表示     |
| ABORT-002 | クリック動作   | abort() を呼び出し                 |
| ABORT-003 | 無効化         | abort 呼び出し中は disabled        |
| ABORT-004 | 確認ダイアログ | オプションで確認を表示（設定可能） |

### 3.4 エラー表示

#### 要件

| 要件ID    | 要件             | 詳細                           |
| --------- | ---------------- | ------------------------------ |
| ERROR-001 | エラーコード     | SkillExecutionErrorCode を表示 |
| ERROR-002 | エラーメッセージ | error.message を表示           |
| ERROR-003 | 詳細トグル       | error.details を折りたたみ表示 |
| ERROR-004 | リトライボタン   | オプションでリトライ機能を提供 |

---

## 4. データフロー

### 4.1 実行フロー

```
User Input
    ↓
SkillStreamDisplay (React Component)
    ↓
useSkillExecution.execute(prompt)
    ↓
skillAPI.execute(request)  [Preload API]
    ↓ IPC invoke
skill:execute Handler      [Main Process]
    ↓
SkillExecutor.execute()
    ↓
SDK query() API
    ↓ (streaming)
SkillExecutor.sendStream()
    ↓ IPC send
skill:stream              [Main → Renderer]
    ↓
skillAPI.onStream callback [Preload API]
    ↓
useSkillExecution.setMessages()
    ↓
SkillStreamDisplay (re-render)
```

### 4.2 中断フロー

```
User Click "Abort"
    ↓
useSkillExecution.abort()
    ↓
skillAPI.abort(executionId)  [Preload API]
    ↓ IPC invoke
skill:abort Handler          [Main Process]
    ↓
SkillExecutor.abort()
    ↓
AbortController.abort()
    ↓ (abort signal)
SDK query() cancelled
    ↓
SkillExecutor.sendStream({type: "error", content: "Execution aborted"})
    ↓ IPC send
skill:stream (error message)
    ↓
useSkillExecution → status = "aborted"
```

---

## 5. セキュリティ要件

### 5.1 IPC セキュリティ

| 要件ID  | 要件                 | 詳細                                    |
| ------- | -------------------- | --------------------------------------- |
| SEC-001 | チャンネル許可リスト | ALLOWED_ON/INVOKE_CHANNELS で制限       |
| SEC-002 | 型検証               | Renderer 側で SkillStreamMessage 型検証 |
| SEC-003 | executionId 検証     | UUID v4 形式の検証                      |

### 5.2 メモリ管理

| 要件ID  | 要件               | 詳細                                 |
| ------- | ------------------ | ------------------------------------ |
| MEM-001 | リスナー解除       | useEffect cleanup で必ず解除         |
| MEM-002 | メッセージ上限     | 表示メッセージ数の上限設定（1000件） |
| MEM-003 | 古いメッセージ削除 | 上限超過時に古いメッセージを削除     |

---

## 6. 参照

- SkillExecutor: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
- 型定義: `packages/shared/src/types/skill-execution.ts`
- 既存 agentAPI: `apps/desktop/src/preload/index.ts`
- チャンネル定義: `apps/desktop/src/preload/channels.ts`
