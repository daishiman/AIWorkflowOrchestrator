# Phase 5: 実装計画

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 5                                              |
| 作成日   | 2026-03-24                                     |
| 前提     | Phase 4 テストマトリクス (17 テストケース)     |

## 実装順序

全 9 Step を依存関係順に実行する。Step 間の依存がない場合でも、テスト RED -> GREEN の追跡しやすさのために直列実行を推奨する。

---

### Step 1: ViewType 追加 + renderView 分岐追加

**目的**: route 先不在の解消を最優先。これにより `openExecutionConsole()` の遷移先が存在するようになる。

**変更ファイル**:

1. `apps/desktop/src/renderer/store/types.ts`
   - `ViewType` union に `| "executionConsole"` を追加
   - 位置: `| "agent"` の直下（エージェント・ワークフロー分類に隣接）

2. `apps/desktop/src/renderer/App.tsx`
   - `renderView()` switch 文に `case "executionConsole":` を追加
   - `case "agent":` の直後に配置
   - `ExecutionConsoleView` を lazy import で読み込む
   - import 文を追加: `const ExecutionConsoleView = React.lazy(() => import("./views/ExecutionConsoleView"));`

**テスト対象**: R-01, R-02, R-03

**完了条件**: `currentView="executionConsole"` で stub View が描画される

---

### Step 2: ExecutionConsoleView stub 作成

**目的**: Step 1 の renderView 分岐が参照する stub コンポーネントを配置する。

**新規ファイル**:

- `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`
  - `data-testid="execution-console-view"` を含む
  - placeholder テキスト: `実行コンソール -- Task02/03 で内部コンポーネントを実装`
  - default export で React.FC を返す

**テスト対象**: R-02 (renderView が stub を描画する)

**完了条件**: ExecutionConsoleView が import 可能で、data-testid が存在する

---

### Step 3: openExecutionConsole() shared action 作成

**目的**: 全 surface から呼ばれる唯一のエントリポイントを定義する。

**新規ファイル**:

- `apps/desktop/src/renderer/actions/executionConsole.ts`
  - `openExecutionConsole()` 関数を export
  - 内部: `useAppStore.getState().setCurrentView("executionConsole")`
  - JSDoc: 全 surface からの遷移用 shared action であることを明記

**テスト対象**: (Level 1 単体テスト: action が setCurrentView を呼ぶ)

**完了条件**: `openExecutionConsole()` を import して呼び出すと ViewType が "executionConsole" に変更される

---

### Step 4: ChatPanel の agent 代替除去 + CTA 統合

**目的**: `setCurrentView("agent")` による terminal 代替遷移を全て `openExecutionConsole()` に置換する。

**変更ファイル**:

- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`
  - L127-131: `handleTerminalSwitch` の中身を `openExecutionConsole()` に変更
  - L148-150: `handleOpenTerminal` の中身を `openExecutionConsole()` に変更
  - import 追加: `import { openExecutionConsole } from "../../actions/executionConsole";`
  - `useSetCurrentView` の import は handoff/terminal 以外の用途があるか確認し、不要なら削除

**変更詳細**:

```typescript
// Before (L127-131)
const handleTerminalSwitch = useCallback(() => {
  setCurrentView("agent");
}, [setCurrentView]);

// After
const handleTerminalSwitch = useCallback(() => {
  openExecutionConsole();
}, []);

// Before (L148-150)
const handleOpenTerminal = useCallback(() => {
  setCurrentView("agent");
}, [setCurrentView]);

// After
const handleOpenTerminal = useCallback(() => {
  openExecutionConsole();
}, []);
```

**テスト対象**: C-01, N-01

**完了条件**: ChatPanel 内の terminal/handoff handler が `setCurrentView("agent")` を呼ばない

---

### Step 5: LLMGuidanceBanner secondaryAction 配線

**目的**: NO_PROVIDER / NO_MODEL 時の secondary CTA に `openExecutionConsole()` を配線する。

**変更ファイル**:

- `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`
  - `createGuidanceActionDispatcher` に `openExecutionConsole` handler を追加
  - secondaryAction の描画ロジックを追加（primaryAction と同様のボタン描画）
  - import 追加: `import { openExecutionConsole } from "../../actions/executionConsole";`

**変更詳細**:

```typescript
// Before
const resolveAction = createGuidanceActionDispatcher({
  openSettings: onNavigateToSettings,
});

// After
const resolveAction = createGuidanceActionDispatcher({
  openSettings: onNavigateToSettings,
  openExecutionConsole: () => openExecutionConsole(),
});

// secondaryAction ボタンの描画を追加
const secondaryAction = guidance?.secondaryAction;
const onSecondaryAction = secondaryAction
  ? resolveAction(secondaryAction.type)
  : undefined;
```

**テスト対象**: C-02

**完了条件**: LLMGuidanceBanner に secondary CTA ボタンが表示され、クリックで openExecutionConsole が呼ばれる

---

### Step 6: WorkspaceChatPanel secondaryAction 配線

**目的**: Workspace surface の blocked guidance に `openExecutionConsole()` を配線する。

**変更ファイル**:

- `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`
  - `createGuidanceActionDispatcher` に `openExecutionConsole` handler を追加
  - import 追加: `import { openExecutionConsole } from "../../actions/executionConsole";`

**変更詳細**:

```typescript
// Before (L33-35)
const resolveAction = createGuidanceActionDispatcher({
  openSettings: () => setCurrentView("settings"),
});

// After
const resolveAction = createGuidanceActionDispatcher({
  openSettings: () => setCurrentView("settings"),
  openExecutionConsole: () => openExecutionConsole(),
});
```

**テスト対象**: C-03

**完了条件**: WorkspaceChatPanel の GuidanceBlock secondary CTA が openExecutionConsole を呼ぶ

---

### Step 7: HandoffBlock / TerminalHandoffCard label + action 変更

**目的**: Naming Contract 準拠のラベル変更と action 統合。

**変更ファイル**:

1. `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`
   - L21: ボタンテキスト `ターミナルを開く` -> `端末で続ける`
   - (props interface は `onOpenTerminal` のまま維持。rename は後続タスクで検討)

2. `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx`
   - L79: ヘッダーテキスト `Terminal で続けてください` -> `端末で続けてください`
   - L130: ボタンテキスト `terminal を開く` -> `端末で続ける`

**テスト対象**: C-04, C-05, L-01, L-02, L-04

**完了条件**: front に `ターミナルを開く` / `terminal を開く` が表示されない

---

### Step 8: TerminalLauncher rename + action 変更

**目的**: App Shell の TerminalLauncher を ExecutionConsoleLauncher に概念的に再配線する（コンポーネントファイル名の rename は影響範囲が大きいため、本タスクでは内部 label + action のみ変更）。

**変更ファイル**:

1. `apps/desktop/src/renderer/components/organisms/AppLayout/TerminalLauncher.tsx`
   - aria-label: `ターミナルを開く` -> `実行コンソールを開く`
   - ボタンテキスト: `"AI + Terminal"` / `"Terminal"` -> `"実行コンソール"` に統一
   - (ファイル名 rename は M-3 対応として、影響範囲の大きさを鑑み本タスクでは見送り。re-export alias で対応可能)

2. `apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx`
   - TerminalLauncher の `onLaunch` handler を `openExecutionConsole()` に変更
   - import 追加: `import { openExecutionConsole } from "../../../actions/executionConsole";`

3. `apps/desktop/src/renderer/App.tsx` (legacy path)
   - TerminalLauncher の `onLaunch` handler を `openExecutionConsole()` に変更

**テスト対象**: C-06

**完了条件**: App Shell launcher クリックで executionConsole に遷移する

---

### Step 9: modelSelectionGuidance.ts 定数変更

**目的**: guidance 定数の `open-terminal` を `open-execution-console` に統一する。

**変更ファイル**:

- `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`
  - `GuidanceActionType` union: `"open-terminal"` -> `"open-execution-console"`
  - `TERMINAL_ACTION` -> `EXECUTION_CONSOLE_ACTION` にリネーム
    - `type: "open-execution-console"`
    - `label: "実行コンソールを開く"`
    - `ariaLabel: "実行コンソールを開く"`
  - `MODEL_SELECTION_BLOCKED_GUIDANCE_MAP` の secondaryAction を更新
  - `GuidanceActionHandlers` interface:
    - `openTerminal` -> `openExecutionConsole` にリネーム
  - `createGuidanceActionDispatcher` の switch 文:
    - `case "open-terminal":` -> `case "open-execution-console":`
    - `handlers.openTerminal` -> `handlers.openExecutionConsole`

**テスト対象**: C-07, L-03, N-02, N-03

**完了条件**: `open-terminal` / `openTerminal` / `ターミナルを開く` が modelSelectionGuidance.ts に存在しない

---

## 実装順序の依存関係図

```
Step 1 (ViewType + renderView)
  |
  v
Step 2 (ExecutionConsoleView stub)
  |
  v
Step 3 (openExecutionConsole action)
  |
  +---> Step 4 (ChatPanel agent 代替除去)
  |
  +---> Step 5 (LLMGuidanceBanner 配線)  --+
  |                                          |
  +---> Step 6 (WorkspaceChatPanel 配線)  --+--> Step 9 (modelSelectionGuidance 定数変更)
  |
  +---> Step 7 (HandoffBlock / TerminalHandoffCard label)
  |
  +---> Step 8 (TerminalLauncher action)
```

Step 1-3 は直列実行必須。Step 4-8 は Step 3 完了後に並列実行可能。Step 9 は Step 5, 6 と同時に実行可能だが、定数変更が全 surface に影響するため最後に実行することを推奨する。

---

## MINOR 指摘対応方針

| ID  | 指摘内容                                 | 対応 Step | 対応方針                                                                                                                                                                 |
| --- | ---------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M-1 | `runtimeAccess.ts` 関数名 rename         | Step 8    | `launchMainlineTerminal` は内部 helper のため本タスクでは rename しない。App Shell の呼び出し元を `openExecutionConsole()` に変更することで front 露出を排除する         |
| M-2 | Skill Creator CTA interface 型定義       | Step 3    | `openExecutionConsole()` の関数シグネチャを export し、Skill Creator から import 可能にする                                                                              |
| M-3 | `TerminalLauncher` rename 時のテスト修正 | Step 8    | ファイル名 rename は影響範囲が大きい（import 元 3 箇所 + テスト 1 箇所）ため本タスクでは見送り。aria-label + テキストの変更のみ実施。rename は後続タスクで未タスク化する |
