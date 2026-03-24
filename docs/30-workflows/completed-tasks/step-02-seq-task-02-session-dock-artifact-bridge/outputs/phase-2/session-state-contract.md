# Session State Contract

## 1. Dock State Enum

```typescript
export type DockState =
  | "collapsed"
  | "ready"
  | "handoff"
  | "running"
  | "done"
  | "aborted"
  | "unavailable"
  | "guidance-only";
```

## 2. State 遷移表

| From \ To     | collapsed | ready | handoff | running | done | aborted | unavailable | guidance-only |
| ------------- | --------- | ----- | ------- | ------- | ---- | ------- | ----------- | ------------- |
| collapsed     | -         | T1    | -       | -       | -    | -       | T8          | T9            |
| ready         | T2        | -     | T3      | -       | -    | -       | T8          | -             |
| handoff       | T2        | T10   | -       | T4      | -    | T6      | T8          | -             |
| running       | -         | -     | -       | -       | T5   | T6      | T8          | -             |
| done          | T2        | T7    | -       | -       | -    | -       | -           | -             |
| aborted       | T2        | T7    | -       | -       | -    | -       | -           | -             |
| unavailable   | T2        | T1    | -       | -       | -    | -       | -           | -             |
| guidance-only | T2        | T1    | -       | -       | -    | -       | T8          | -             |

### 遷移定義

| ID  | トリガー               | ガード条件                                      | 説明                            |
| --- | ---------------------- | ----------------------------------------------- | ------------------------------- |
| T1  | `GUIDANCE_RECEIVED`    | `handoffGuidance != null && cliAvailable`       | guidance 受信で ready に遷移    |
| T2  | `USER_COLLAPSE`        | なし                                            | ユーザーが dock を折りたたむ    |
| T3  | `USER_EXECUTE`         | `handoffGuidance != null`                       | ユーザーが「実行する」を押下    |
| T4  | `CLI_SESSION_START`    | `sessionId != null`                             | CLI session が開始された        |
| T5  | `CLI_SESSION_COMPLETE` | `exitCode === 0`                                | CLI session が正常完了          |
| T6  | `CLI_SESSION_ABORT`    | `exitCode !== 0 \|\| userAbort`                 | ユーザー中止またはエラー終了    |
| T7  | `USER_NEW_SESSION`     | なし                                            | ユーザーが新しい session を開始 |
| T8  | `CLI_UNAVAILABLE`      | `!cliInstalled \|\| !cliConnected`              | CLI が利用不可能                |
| T9  | `GUIDANCE_ONLY`        | `handoffGuidance != null && !requiresExecution` | 実行不要の guidance             |
| T10 | `USER_CANCEL_HANDOFF`  | なし                                            | ユーザーが handoff をキャンセル |

## 3. 各 State の CTA 定義

| State         | Primary CTA                      | Secondary CTA                          | Tertiary CTA         |
| ------------- | -------------------------------- | -------------------------------------- | -------------------- |
| collapsed     | 「開く」(expand)                 | -                                      | -                    |
| ready         | 「実行する」(execute)            | 「閉じる」(collapse)                   | -                    |
| handoff       | 「キャンセル」(cancel)           | -                                      | -                    |
| running       | 「中止する」(abort)              | -                                      | -                    |
| done          | 「成果物を見る」(view artifacts) | 「共有する」(share)                    | 「閉じる」(collapse) |
| aborted       | 「やり直す」(retry)              | 「ガイダンスに戻る」(back to guidance) | 「閉じる」(collapse) |
| unavailable   | 「インストールする」(install)    | 「閉じる」(collapse)                   | -                    |
| guidance-only | 「閉じる」(collapse)             | -                                      | -                    |

## 4. Error Summary 表示

### done state

```
[Artifact Summary]
[Warning 一覧（折りたたみ可）]
  - warning 1: ...
  - warning 2: ...
[CTA: 成果物を見る / 共有する]
```

### aborted state

```
[Error Summary]
  中止理由: ユーザー中止 / プロセスエラー / タイムアウト
  エラー詳細: exit code, stderr 抜粋
  実行時間: Xs
[CTA: やり直す / ガイダンスに戻る]
```

## 5. Store 拡張設計

### 5.1 agentSlice への追加フィールド

```typescript
interface SessionDockState {
  dockState: DockState;
  sessionId: string | null;
  isDockOpen: boolean;
  transcriptEntries: TranscriptEntry[];
  artifactSummary: ArtifactSummaryData | null;
  errorSummary: ErrorSummaryData | null;
  shareHistory: ShareRecord[];
}
```

### 5.2 Computed Dock State（派生セレクタ）

既存の `executionState.status` / `skillExecutionStatus` / `handoffGuidance` を壊さず、**computed selector** として dock state を算出する。

```typescript
export const useDockState = (): DockState =>
  useAppStore((state) => {
    if (!state.agent.sessionDock.isDockOpen) return "collapsed";
    if (!state.agent.cliAvailable) return "unavailable";
    if (state.agent.sessionDock.dockState === "guidance-only")
      return "guidance-only";
    // ... 以下、state mapping logic
    return state.agent.sessionDock.dockState;
  });
```

### 5.3 アクション

| アクション           | 引数                           | 説明                                             |
| -------------------- | ------------------------------ | ------------------------------------------------ |
| `openDock`           | なし                           | dock を開く（collapsed → 前回 state or ready）   |
| `closeDock`          | なし                           | dock を折りたたむ（→ collapsed）。session は保持 |
| `startSession`       | `sessionId: string`            | 新しい session を開始                            |
| `transitionDock`     | `event: DockEvent`             | state machine に event を送信して遷移            |
| `addTranscriptEntry` | `entry: TranscriptEntry`       | transcript に entry を追加                       |
| `setArtifactSummary` | `summary: ArtifactSummaryData` | artifact summary を設定                          |
| `setErrorSummary`    | `summary: ErrorSummaryData`    | error summary を設定                             |
| `addShareRecord`     | `record: ShareRecord`          | share 履歴に追加                                 |
| `restoreSession`     | `sessionId: string`            | 保存済み session を復元                          |
| `clearSession`       | なし                           | 現在の session をクリア                          |

## 6. claudeCliAPI 接続設計

### 6.1 Event → Dock State マッピング

| claudeCliAPI Event                          | Dock State Transition              |
| ------------------------------------------- | ---------------------------------- |
| `onSessionOutput(event)`                    | running 中の transcript entry 追加 |
| `onSessionStatus({ status: "running" })`    | → `running`                        |
| `onSessionStatus({ status: "completed" })`  | → `done`                           |
| `onSessionStatus({ status: "error" })`      | → `aborted`                        |
| `onSessionStatus({ status: "terminated" })` | → `aborted`                        |

### 6.2 Store → claudeCliAPI 呼び出し

| Store Action                        | claudeCliAPI Call                                   |
| ----------------------------------- | --------------------------------------------------- |
| `transitionDock(USER_EXECUTE)`      | `claudeCliAPI.executeScript(...)` → session 開始    |
| `transitionDock(CLI_SESSION_ABORT)` | `claudeCliAPI.terminateSession(...)` → session 中止 |
| `restoreSession(sessionId)`         | `claudeCliAPI.getSession(...)` → transcript 取得    |
