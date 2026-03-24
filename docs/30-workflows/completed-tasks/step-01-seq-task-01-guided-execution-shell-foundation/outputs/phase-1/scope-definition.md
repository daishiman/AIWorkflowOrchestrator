# Phase 1: スコープ定義

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 1                                              |
| 作成日   | 2026-03-24                                     |

## 対象（In Scope）

### 1. ViewType / Route 定義

- `ViewType` union に `executionConsole` を追加する設計
- `App.tsx` の `renderView()` に `executionConsole` 分岐を追加する設計
- `ExecutionConsoleView` コンポーネントの stub 作成方針

### 2. Shared Action 定義

- `openExecutionConsole()` の配置先と引数設計
- 全 surface からの呼び出しインターフェース統一
- store action としての定義

### 3. Front Naming 統一

- primary label: `実行コンソール`
- handoff label: `端末で続ける`
- advanced label: `高度な表示`
- `terminal` 文字列の front 退避方針

### 4. CTA Wiring

- ChatPanel: `handleTerminalSwitch` / `handleOpenTerminal` の置換
- LLMGuidanceBanner: `secondaryAction` 配線
- WorkspaceChatPanel: `secondaryAction` 配線
- HandoffBlock: `onOpenTerminal` の置換
- TerminalHandoffCard: label と action の置換

### 5. Agent 代替遷移の除去

- `setCurrentView("agent")` の terminal 代替を全箇所で除去する方針

## 非対象（Out of Scope）

### 1. Session Dock / Transcript / Artifact 統合

- Task02（step-02-seq-task-02）の責務
- session 管理、transcript 表示、artifact summary は対象外

### 2. Advanced Console / Approval / AI 開示

- Task03（step-03-seq-task-03）の責務
- raw terminal 表示、approval sheet、manual boundary は対象外

### 3. IPC Handler 実装

- `terminal.open` IPC の修正・拡張は本タスクでは行わない
- IPC channel 名の変更は後続タスクに委譲

### 4. Navigation ショートカット追加

- `navContract.ts` への項目追加は設計のみ定義
- 実装は後続の実装タスクに委譲

### 5. ExecutionConsoleView の内部実装

- View の内部コンポーネント設計は Task02/03 の責務
- 本タスクでは stub（空 View）の配置方針のみ定義

## 対象ファイル一覧

| ファイル                                                               | 変更種別 | 責務                      |
| ---------------------------------------------------------------------- | -------- | ------------------------- |
| `apps/desktop/src/renderer/store/types.ts`                             | 修正     | `ViewType` に追加         |
| `apps/desktop/src/renderer/App.tsx`                                    | 修正     | `renderView` 分岐追加     |
| `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`              | 修正     | agent 代替除去 + CTA 統合 |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`       | 修正     | secondaryAction 配線      |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | 修正     | secondaryAction 配線      |
| `apps/desktop/src/renderer/utils/runtimeAccess.ts`                     | 修正     | launcher helper 名称変更  |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`       | 新規     | stub View 作成            |
| `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`           | 修正     | label + action 変更       |
| `apps/desktop/src/renderer/components/chat/TerminalHandoffCard/`       | 修正     | label 変更                |

## 依存関係

### 前提

- 親パック root Phase 1-3 の完了（naming / scope / gate 固定）

### 後続

- Task02: session dock / transcript / artifact（本タスクの route が前提）
- Task03: advanced console / approval / AI 開示（本タスクの route + label が前提）
