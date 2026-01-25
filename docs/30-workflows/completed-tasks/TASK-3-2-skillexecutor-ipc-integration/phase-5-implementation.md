# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| Phase名    | 実装（TDD: Green）                     |
| 前提Phase  | Phase 4（テスト作成）                  |
| 後続Phase  | Phase 6（テスト拡充）                  |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | TASK-3-2-skillexecutor-ipc-integration |

---

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストをパスさせる最小限の実装を行う。

## 背景

Phase 4で作成した失敗するテストに対して、それらをパスさせる実装を行う。この段階ではリファクタリングは行わず、テストをパスさせることに集中する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Preload API実装

**目的**: skillAPI拡張（onStream, abort, getExecutionStatus）を実装する

**実行手順**:

1. skill-api.tsを作成または更新する
   - パス: `apps/desktop/src/preload/skill-api.ts`

2. onStreamを実装する

   ```typescript
   import { ipcRenderer, IpcRendererEvent } from "electron";
   import type { SkillStreamMessage } from "@repo/shared";

   export const skillAPI = {
     // 既存のexecuteメソッドは維持

     onStream: (
       callback: (message: SkillStreamMessage) => void,
     ): (() => void) => {
       const handler = (
         _event: IpcRendererEvent,
         message: SkillStreamMessage,
       ) => {
         callback(message);
       };
       ipcRenderer.on("skill:stream", handler);
       return () => {
         ipcRenderer.removeListener("skill:stream", handler);
       };
     },

     abort: (executionId: string): Promise<boolean> => {
       return ipcRenderer.invoke("skill:abort", executionId);
     },

     getExecutionStatus: (
       executionId: string,
     ): Promise<ExecutionInfo | null> => {
       return ipcRenderer.invoke("skill:getExecutionStatus", executionId);
     },
   };
   ```

3. Preload indexに統合する
   - `apps/desktop/src/preload/index.ts`の`window.skillAPI`を更新

4. テストを実行して確認する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "skillAPI"
   ```

**期待される成果物**:

- `apps/desktop/src/preload/skill-api.ts`（更新）
- `apps/desktop/src/preload/index.ts`（更新）

---

### タスク2: Main Process IPC Handler実装

**目的**: skill:abort, skill:getExecutionStatusのIPC Handlerを実装する

**実行手順**:

1. IPC Handlerファイルを更新する
   - パス: `apps/desktop/src/main/ipc/skillHandlers.ts`

2. abortハンドラーを実装する

   ```typescript
   ipcMain.handle("skill:abort", async (_event, executionId: string) => {
     return skillExecutor.abort(executionId);
   });
   ```

3. getExecutionStatusハンドラーを実装する

   ```typescript
   ipcMain.handle(
     "skill:getExecutionStatus",
     async (_event, executionId: string) => {
       return skillExecutor.getExecutionStatus(executionId);
     },
   );
   ```

**期待される成果物**:

- `apps/desktop/src/main/ipc/skillHandlers.ts`（更新）

---

### タスク3: React Hook実装

**目的**: useSkillExecutionフックを実装する

**実行手順**:

1. Hookファイルを作成する
   - パス: `apps/desktop/src/renderer/hooks/useSkillExecution.ts`

2. useSkillExecutionを実装する

   ```typescript
   import { useState, useEffect, useRef, useCallback } from "react";
   import type {
     SkillStreamMessage,
     SkillExecutionResponse,
     SkillExecutionError,
   } from "@repo/shared";

   type ExecutionStatus = "idle" | "running" | "completed" | "error";

   interface UseSkillExecutionReturn {
     messages: SkillStreamMessage[];
     status: ExecutionStatus;
     error: SkillExecutionError | null;
     execute: (prompt: string) => Promise<SkillExecutionResponse>;
     abort: () => Promise<void>;
     reset: () => void;
   }

   export function useSkillExecution(skillId: string): UseSkillExecutionReturn {
     const [messages, setMessages] = useState<SkillStreamMessage[]>([]);
     const [status, setStatus] = useState<ExecutionStatus>("idle");
     const [error, setError] = useState<SkillExecutionError | null>(null);
     const executionIdRef = useRef<string | null>(null);

     useEffect(() => {
       const unsubscribe = window.skillAPI.onStream((message) => {
         if (message.executionId === executionIdRef.current) {
           setMessages((prev) => [...prev, message]);

           if (message.type === "complete") {
             setStatus("completed");
           } else if (message.type === "error") {
             setStatus("error");
             setError({
               code: "EXECUTION_FAILED",
               message: message.content,
             });
           }
         }
       });

       return unsubscribe;
     }, []);

     const execute = useCallback(
       async (prompt: string) => {
         setMessages([]);
         setStatus("running");
         setError(null);

         const response = await window.skillAPI.execute({
           prompt,
           skillId,
         });

         executionIdRef.current = response.executionId;
         return response;
       },
       [skillId],
     );

     const abort = useCallback(async () => {
       if (executionIdRef.current) {
         await window.skillAPI.abort(executionIdRef.current);
       }
     }, []);

     const reset = useCallback(() => {
       setMessages([]);
       setStatus("idle");
       setError(null);
       executionIdRef.current = null;
     }, []);

     return { messages, status, error, execute, abort, reset };
   }
   ```

3. テストを実行して確認する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "useSkillExecution"
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/useSkillExecution.ts`

---

### タスク4: UIコンポーネント実装

**目的**: SkillStreamDisplayコンポーネントを実装する

**実行手順**:

1. コンポーネントファイルを作成する
   - パス: `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

2. コンポーネントを実装する

   ```typescript
   import React from "react";
   import { useSkillExecution } from "@/renderer/hooks/useSkillExecution";
   import type { SkillStreamMessage, SkillExecutionError } from "@repo/shared";

   interface SkillStreamDisplayProps {
     skillId: string;
     onComplete?: () => void;
     onError?: (error: SkillExecutionError) => void;
   }

   export function SkillStreamDisplay({
     skillId,
     onComplete,
     onError,
   }: SkillStreamDisplayProps) {
     const { messages, status, error, execute, abort, reset } =
       useSkillExecution(skillId);

     // コールバック処理
     React.useEffect(() => {
       if (status === "completed" && onComplete) {
         onComplete();
       }
       if (status === "error" && error && onError) {
         onError(error);
       }
     }, [status, error, onComplete, onError]);

     return (
       <div className="skill-stream-display">
         {/* ヘッダー: 実行状態表示 */}
         <div className="stream-header">
           <span className={`status-badge status-${status}`}>{status}</span>
           {status === "running" && (
             <button onClick={abort} className="abort-button">
               中断
             </button>
           )}
         </div>

         {/* メッセージ一覧 */}
         <div className="stream-content">
           {messages.map((message) => (
             <MessageItem key={message.id} message={message} />
           ))}
         </div>
       </div>
     );
   }

   function MessageItem({ message }: { message: SkillStreamMessage }) {
     const getMessageClassName = () => {
       switch (message.type) {
         case "text":
           return "message-text";
         case "tool_use":
           return "message-tool-use";
         case "error":
           return "message-error";
         default:
           return "";
       }
     };

     return (
       <div className={`message-item ${getMessageClassName()}`}>
         {message.type === "tool_use" && (
           <span className="tool-name">[Tool: {message.content}]</span>
         )}
         {message.type !== "tool_use" && <span>{message.content}</span>}
       </div>
     );
   }
   ```

3. テストを実行して確認する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "SkillStreamDisplay"
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

---

### タスク5: テスト実行（Green状態確認）

**目的**: 全てのテストがパスすることを確認する

**実行手順**:

1. 全テストを実行する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "skillAPI|useSkillExecution|SkillStreamDisplay"
   ```

2. 全テストがGreen状態（成功）であることを確認する

3. テスト結果を記録する

**期待される成果物**:

- `outputs/phase-5/test-results-green.md`

---

## 参照資料

| 参照資料        | パス                                                                        | 内容             |
| --------------- | --------------------------------------------------------------------------- | ---------------- |
| Phase 2設計     | `outputs/phase-2/`                                                          | 設計ドキュメント |
| Phase 4テスト   | Phase 4で作成したテストファイル                                             | テストケース     |
| 既存Preload API | `apps/desktop/src/preload/index.ts`                                         | 参考実装         |
| Agent SDK仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型定義           |

---

## 成果物

| 成果物           | パス                                                                    | 内容                 |
| ---------------- | ----------------------------------------------------------------------- | -------------------- |
| Preload API      | `apps/desktop/src/preload/skill-api.ts`                                 | skillAPI拡張         |
| Preload Index    | `apps/desktop/src/preload/index.ts`                                     | contextBridge統合    |
| IPC Handler      | `apps/desktop/src/main/ipc/skillHandlers.ts`                            | Main Process Handler |
| React Hook       | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                  | useSkillExecution    |
| UIコンポーネント | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | SkillStreamDisplay   |
| Green状態確認    | `outputs/phase-5/test-results-green.md`                                 | テスト成功確認       |

---

## 統合テスト連携

Phase 4で作成した統合テストもパスすることを確認する。

---

## 完了条件

- [ ] Preload API（skillAPI.onStream, abort, getExecutionStatus）が実装されている
- [ ] Main Process IPC Handler（skill:abort, skill:getExecutionStatus）が実装されている
- [ ] React Hook（useSkillExecution）が実装されている
- [ ] UIコンポーネント（SkillStreamDisplay）が実装されている
- [ ] Phase 4で作成した全テストがGreen状態（成功）
- [ ] テスト結果が`outputs/phase-5/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "skillAPI|useSkillExecution|SkillStreamDisplay"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/phase-6-test-expansion.md`
