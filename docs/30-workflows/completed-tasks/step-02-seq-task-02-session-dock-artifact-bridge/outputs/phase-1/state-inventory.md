# State Inventory - Session Dock / Artifact / Share

## 1. Current State 棚卸し

### 1.1 Dock State

| 観点                  | 現状                                                                     | 正本定義                                                                                         | GAP                                      |
| --------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------- | ------ |
| state enum            | agentSlice に dock 専用 state なし                                       | `collapsed / ready / handoff / running / done / aborted / unavailable / guidance-only` (8 state) | state machine 未実装                     |
| open/close            | dock の open/close 状態を保持するフィールドなし                          | dock を閉じても session 保持                                                                     | 未実装                                   |
| terminalDockStatus    | 型定義に存在しない                                                       | `idle / handoff-pending / running / done / aborted`                                              | 未定義                                   |
| skillExecutionStatus  | `running / completed / error / cancelled`                                | UI 正本とのマッピングなし                                                                        | 乖離                                     |
| executionState.status | `idle / executing / streaming / awaiting_permission / error / cancelled` | 単一 state 契約への統合マッピングなし                                                            | 分散                                     |
| handoffGuidance       | `HandoffGuidance                                                         | null` で handoff 表現                                                                            | handoff state は guidance 有無で暗黙表現 | 暗黙的 |

### 1.2 Session Persistence

| 観点            | 現状                                                        | 正本定義                          | GAP                                                             |
| --------------- | ----------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| session ID      | `claudeCliAPI.listSessions()` で CLI 側 session ID 取得可能 | dock 固有 session ID の採番・保持 | dock 側 session ID なし                                         |
| transcript 保存 | dock を閉じると消失                                         | close しても reopen で復元        | UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001 (Issue #1460, blocked) |
| 保持件数        | 未定義                                                      | 最大保持件数・期間の定義          | 未定義                                                          |
| reopen restore  | 未実装                                                      | transcript + artifact 復元        | 未実装                                                          |
| cleanup 条件    | 未定義                                                      | 保持期間超過 / 明示削除           | 未定義                                                          |

### 1.3 Artifact Display

| 観点                | 現状                              | 正本定義                                             | GAP                                   |
| ------------------- | --------------------------------- | ---------------------------------------------------- | ------------------------------------- |
| primary surface     | raw log / streaming output が前面 | Artifact Summary（生成ファイル・差分・次アクション） | Artifact Summary コンポーネント未実装 |
| ArtifactSummary.tsx | 存在しない                        | Phase 5 で新規作成予定                               | 未実装                                |
| 表示順序            | transcript が主役                 | `成果物 → 要約 → transcript 詳細` の順               | 逆順                                  |
| error summary       | aborted 時の表示なし              | `done / aborted` state で error summary 表示         | 未実装                                |

### 1.4 Manual Share

| 観点            | 現状                   | 正本定義                                                          | GAP                            |
| --------------- | ---------------------- | ----------------------------------------------------------------- | ------------------------------ |
| share 操作      | 未実装                 | 手動 3 操作: `選択範囲を送る / 直近出力を添付 / セッションを貼る` | TranscriptShareRail.tsx 未実装 |
| provenance chip | 未実装                 | `source / sharedAt / inspect` フィールド                          | ProvenanceChip.tsx 未実装      |
| auto-send       | 禁止ルール（MB-1）あり | transcript の自動 message 化禁止                                  | Manual Boundary は定義済み     |
| IPC channel     | share 系 IPC なし      | share payload の IPC 契約                                         | 未定義                         |

### 1.5 UI コンポーネント

| コンポーネント                 | 現状                                                                                             | GAP                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| HandoffBlock.tsx               | 25 行の最小実装。`contextSummary` + `terminalCommand` + `端末で続ける` ボタン。Dock との結線なし | Dock 接続・Artifact・Share 要素なし       |
| PersistentTerminalLauncher.tsx | 20 行の最小実装。`onLaunch` callback の結線は呼び出し元任せ                                      | Dock 常設パネル・persist 機構との接続なし |
| ExecutionConsoleView/index.tsx | 存在するが session dock 統合なし                                                                 | session state machine との接続なし        |
| ArtifactSummary.tsx            | 存在しない                                                                                       | 新規作成が必要                            |
| TranscriptShareRail.tsx        | 存在しない                                                                                       | 新規作成が必要                            |
| ProvenanceChip.tsx             | 存在しない                                                                                       | 新規作成が必要                            |

### 1.6 Preload / IPC

| API             | 現状                                                                                                       | GAP                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| claudeCliAPI    | `terminateSession / listSessions / getSession / onSessionOutput / onSessionStatus` の 5 session 系メソッド | Dock state machine との接続契約なし  |
| agentSDKAPI     | `createSession / resumeSession / destroySession`                                                           | Session Dock とは別系統              |
| conversationAPI | `list / get / create / update / delete / addMessage / search`                                              | Dock transcript とは未接続           |
| artifact 系 IPC | 存在しない                                                                                                 | Artifact Summary 用の IPC 契約が必要 |
| share 系 IPC    | 存在しない                                                                                                 | Manual Share 用の IPC 契約が必要     |

## 2. 関連未タスク

| ID                                       | タイトル                                                  | ステータス | 依存                         |
| ---------------------------------------- | --------------------------------------------------------- | ---------- | ---------------------------- |
| UT-TERMINAL-DOCK-SESSION-PERSISTENCE-001 | transcript persistence                                    | blocked    | Task06 Transcript Provenance |
| UT-TERMINAL-DOCK-ABORTED-STATE-001       | aborted state 未定義                                      | unassigned | なし                         |
| UT-GUIDANCE-BLOCK-HANDOFF-CARD-RULE-001  | GuidanceBlock vs TerminalHandoffCard 使い分けルール未定義 | unassigned | なし                         |

## 3. data-testid 衝突

`PersistentTerminalLauncher.tsx` と `HandoffBlock.tsx` に同一 `data-testid="persistent-terminal-launcher"` が存在する可能性あり。Phase 5 で修正対象。
