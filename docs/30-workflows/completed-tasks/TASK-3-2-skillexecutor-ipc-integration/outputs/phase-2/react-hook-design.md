# React Hook 設計 - TASK-3-2 Phase 2

## メタ情報

| 項目       | 内容            |
| ---------- | --------------- |
| 作成日     | 2026-01-25      |
| Phase      | 2               |
| タスク     | React Hook 設計 |
| ステータス | 完了            |

---

## 1. useSkillExecution 概要

### 1.1 目的

- スキル実行のライフサイクル管理
- ストリーミングメッセージの状態管理
- 実行状態・エラー状態の管理
- クリーンアップ（メモリリーク防止）

### 1.2 使用例

```typescript
function SkillExecutionView({ skillId }: { skillId: string }) {
  const { messages, status, error, execute, abort, reset } =
    useSkillExecution(skillId);

  const handleExecute = async () => {
    await execute("タスクを実行してください");
  };

  return (
    <div>
      {status === "idle" && <button onClick={handleExecute}>実行</button>}
      {status === "running" && (
        <>
          <Spinner />
          <button onClick={abort}>中断</button>
        </>
      )}
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      {error && <ErrorDisplay error={error} />}
    </div>
  );
}
```

---

## 2. 型定義

### 2.1 State 型

```typescript
// apps/desktop/src/renderer/hooks/useSkillExecution.ts

import type {
  SkillStreamMessage,
  SkillExecutionError,
  SkillExecutionResponse,
} from "@repo/shared/types/skill-execution";

/**
 * 実行ステータス
 */
export type SkillExecutionStatus =
  | "idle" // 待機中
  | "running" // 実行中
  | "completed" // 完了
  | "error" // エラー
  | "aborted"; // 中断

/**
 * Hook 内部状態
 */
interface UseSkillExecutionState {
  messages: SkillStreamMessage[];
  status: SkillExecutionStatus;
  executionId: string | null;
  error: SkillExecutionError | null;
  isAborting: boolean;
}

/**
 * Hook 戻り値
 */
export interface UseSkillExecutionReturn {
  /** 受信したメッセージ一覧 */
  messages: SkillStreamMessage[];
  /** 実行状態 */
  status: SkillExecutionStatus;
  /** 現在の実行ID */
  executionId: string | null;
  /** エラー情報（エラー時のみ） */
  error: SkillExecutionError | null;
  /** 中断処理中フラグ */
  isAborting: boolean;
  /** スキルを実行する */
  execute: (prompt: string) => Promise<SkillExecutionResponse>;
  /** 実行を中断する */
  abort: () => Promise<void>;
  /** 状態をリセットする */
  reset: () => void;
}
```

---

## 3. 実装設計

### 3.1 Hook 本体

```typescript
// apps/desktop/src/renderer/hooks/useSkillExecution.ts

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  SkillStreamMessage,
  SkillExecutionError,
  SkillExecutionRequest,
  SkillExecutionResponse,
} from "@repo/shared/types/skill-execution";

/** メッセージ最大保持数 */
const MAX_MESSAGES = 1000;

export function useSkillExecution(skillId: string): UseSkillExecutionReturn {
  const [state, setState] = useState<UseSkillExecutionState>({
    messages: [],
    status: "idle",
    executionId: null,
    error: null,
    isAborting: false,
  });

  // executionId を ref で保持（コールバック内で最新値を参照するため）
  const executionIdRef = useRef<string | null>(null);

  // onStream リスナーの登録・解除
  useEffect(() => {
    const unsubscribe = window.skillAPI.onStream((message) => {
      // 現在の executionId と一致するメッセージのみ処理
      if (message.executionId !== executionIdRef.current) {
        return;
      }

      setState((prev) => {
        // メッセージ追加（上限を超えたら古いものを削除）
        const newMessages =
          prev.messages.length >= MAX_MESSAGES
            ? [...prev.messages.slice(1), message]
            : [...prev.messages, message];

        // 状態更新
        let newStatus = prev.status;
        let newError = prev.error;

        if (message.type === "complete") {
          newStatus = "completed";
        } else if (message.type === "error") {
          // 中断エラーの場合は aborted、それ以外は error
          if (message.content.includes("aborted")) {
            newStatus = "aborted";
          } else {
            newStatus = "error";
            newError = {
              code: "EXECUTION_FAILED",
              message: message.content,
            };
          }
        }

        return {
          ...prev,
          messages: newMessages,
          status: newStatus,
          error: newError,
          isAborting: false, // 中断完了
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, []); // 空の依存配列：マウント時のみ実行

  // execute 関数
  const execute = useCallback(
    async (prompt: string): Promise<SkillExecutionResponse> => {
      // 状態リセット
      setState({
        messages: [],
        status: "running",
        executionId: null,
        error: null,
        isAborting: false,
      });

      const request: SkillExecutionRequest = {
        prompt,
        skillId,
      };

      try {
        const response = await window.skillAPI.execute(request);

        if (response.success) {
          // executionId を保存
          executionIdRef.current = response.executionId;
          setState((prev) => ({
            ...prev,
            executionId: response.executionId,
          }));
        } else {
          // 実行失敗
          setState((prev) => ({
            ...prev,
            status: "error",
            error: response.error ?? {
              code: "EXECUTION_FAILED",
              message: "Unknown error",
            },
          }));
        }

        return response;
      } catch (err) {
        const error: SkillExecutionError = {
          code: "EXECUTION_FAILED",
          message: err instanceof Error ? err.message : "Unknown error",
        };
        setState((prev) => ({
          ...prev,
          status: "error",
          error,
        }));
        return { executionId: "", success: false, error };
      }
    },
    [skillId],
  );

  // abort 関数
  const abort = useCallback(async (): Promise<void> => {
    if (!executionIdRef.current || state.status !== "running") {
      return;
    }

    setState((prev) => ({ ...prev, isAborting: true }));

    try {
      await window.skillAPI.abort(executionIdRef.current);
      // 中断メッセージは onStream コールバックで処理される
    } catch {
      setState((prev) => ({ ...prev, isAborting: false }));
    }
  }, [state.status]);

  // reset 関数
  const reset = useCallback((): void => {
    executionIdRef.current = null;
    setState({
      messages: [],
      status: "idle",
      executionId: null,
      error: null,
      isAborting: false,
    });
  }, []);

  return {
    messages: state.messages,
    status: state.status,
    executionId: state.executionId,
    error: state.error,
    isAborting: state.isAborting,
    execute,
    abort,
    reset,
  };
}
```

---

## 4. 状態遷移図

```
                 ┌─────────────────────────────────────┐
                 │                                     │
                 ↓                                     │
    ┌──────────────────────┐                          │
    │        idle          │                          │
    │   (初期状態/reset)   │                          │
    └──────────┬───────────┘                          │
               │ execute()                            │
               ↓                                      │
    ┌──────────────────────┐                          │
    │       running        │                          │
    │     (実行中)         │                          │
    └──────────┬───────────┘                          │
               │                                      │
    ┌──────────┼──────────┬───────────┐              │
    │          │          │           │              │
    ↓          ↓          ↓           ↓              │
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│completed│ │ error   │ │ aborted │ │ running │     │
│ (完了)  │ │(エラー) │ │ (中断)  │ │(timeout)│     │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘     │
     │           │           │           │          │
     │           └───────────┼───────────┘          │
     │                       │                      │
     └───────────────────────┴──────────────────────┘
                   reset()
```

---

## 5. ライフサイクル

### 5.1 マウント時

1. `useEffect` で `skillAPI.onStream` リスナーを登録
2. 初期状態（idle）で待機

### 5.2 実行時（execute）

1. 状態を `running` に更新
2. `skillAPI.execute` を呼び出し
3. 成功時: `executionId` を保存
4. 失敗時: `error` 状態に遷移

### 5.3 メッセージ受信時（onStream）

1. `executionId` が一致するか確認
2. メッセージを配列に追加
3. `complete` タイプなら `completed` に遷移
4. `error` タイプなら `error` または `aborted` に遷移

### 5.4 中断時（abort）

1. `isAborting` を `true` に設定
2. `skillAPI.abort` を呼び出し
3. 中断メッセージ受信で `aborted` に遷移

### 5.5 アンマウント時

1. `useEffect` クリーンアップで `unsubscribe` を呼び出し
2. リスナーが解除される（メモリリーク防止）

---

## 6. パフォーマンス考慮

### 6.1 メッセージ上限

- `MAX_MESSAGES = 1000` で上限を設定
- 上限超過時は古いメッセージを削除

### 6.2 バッチ更新

高頻度メッセージ対応のため、`requestAnimationFrame` を使用したバッチ更新を検討：

```typescript
// オプション: 高頻度更新対応
const pendingMessages = useRef<SkillStreamMessage[]>([]);
const rafId = useRef<number | null>(null);

const flushMessages = useCallback(() => {
  if (pendingMessages.current.length > 0) {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, ...pendingMessages.current].slice(
        -MAX_MESSAGES,
      ),
    }));
    pendingMessages.current = [];
  }
  rafId.current = null;
}, []);

// onStream 内
pendingMessages.current.push(message);
if (!rafId.current) {
  rafId.current = requestAnimationFrame(flushMessages);
}
```

### 6.3 useCallback メモ化

- `execute`, `abort`, `reset` は `useCallback` でメモ化
- 不要な再レンダリングを防止

---

## 7. テスト設計

### 7.1 テストケース

| TC-ID    | テスト内容          | 期待結果                   |
| -------- | ------------------- | -------------------------- |
| TC-H-001 | 初期状態            | status="idle", messages=[] |
| TC-H-002 | execute 成功        | status="running"           |
| TC-H-003 | text メッセージ受信 | messages に追加            |
| TC-H-004 | complete 受信       | status="completed"         |
| TC-H-005 | error 受信          | status="error"             |
| TC-H-006 | abort 呼び出し      | isAborting=true            |
| TC-H-007 | abort 完了          | status="aborted"           |
| TC-H-008 | 他 executionId 無視 | messages 変化なし          |
| TC-H-009 | reset 呼び出し      | 初期状態に戻る             |
| TC-H-010 | アンマウント        | リスナー解除               |
| TC-H-011 | メッセージ上限      | 古いメッセージ削除         |

### 7.2 モック

```typescript
// skillAPI モック
const mockSkillAPI = {
  execute: vi.fn(),
  onStream: vi.fn(),
  abort: vi.fn(),
};

beforeEach(() => {
  (window as any).skillAPI = mockSkillAPI;
});
```

---

## 8. 参照

- Phase 1 IPC 要件: `outputs/phase-1/ipc-integration-requirements.md`
- Preload API 設計: `outputs/phase-2/preload-api-design.md`
- 型定義: `packages/shared/src/types/skill-execution.ts`
