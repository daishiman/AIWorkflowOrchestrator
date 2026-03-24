# Phase 4: テストマトリクス

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001   |
| Phase    | 4                                                |
| 作成日   | 2026-03-24                                       |
| 前提     | Phase 3 PASS（MINOR M-1〜M-3 は本 Phase で対応） |

## テスト群概要

| 群           | テスト数 | 対象範囲                            |
| ------------ | -------- | ----------------------------------- |
| Route (R)    | 3        | ViewType 定義 + renderView 分岐     |
| CTA (C)      | 7        | 4 surface の CTA click 配線         |
| Label (L)    | 4        | Naming Contract 準拠ラベル検証      |
| Negative (N) | 3        | agent 代替除去 + no-op CTA 不在検証 |
| **合計**     | **17**   |                                     |

---

## 1. Route テスト群 (R-01〜R-03)

| ID   | テスト名                                                             | テスト対象ファイル                         | 期待結果                                                                                      | 優先度 |
| ---- | -------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- | ------ |
| R-01 | ViewType に executionConsole が含まれる                              | `apps/desktop/src/renderer/store/types.ts` | `ViewType` union に `"executionConsole"` リテラルが存在する（型レベルテスト）                 | P0     |
| R-02 | renderView が executionConsole で ExecutionConsoleView を描画する    | `apps/desktop/src/renderer/App.tsx`        | `currentView="executionConsole"` 時に `data-testid="execution-console-view"` 要素が描画される | P0     |
| R-03 | renderView が未知の ViewType で ComingSoonView を描画する (既存維持) | `apps/desktop/src/renderer/App.tsx`        | 存在しない ViewType でも default 分岐により ComingSoonView が描画される                       | P1     |

### テストファイル配置

```
apps/desktop/src/renderer/__tests__/executionConsole.route.test.tsx
```

---

## 2. CTA テスト群 (C-01〜C-07)

| ID   | テスト名                                                                        | テスト対象ファイル                                                              | 期待結果                                                                                            | 優先度 |
| ---- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------ |
| C-01 | ChatPanel の handoff 状態で CTA click が openExecutionConsole() を呼ぶ          | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                       | handoff 状態で表示される CTA をクリック時に `setCurrentView("executionConsole")` が呼ばれる         | P0     |
| C-02 | LLMGuidanceBanner の secondaryAction が openExecutionConsole() を呼ぶ           | `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`                | NO_PROVIDER 時の secondary CTA クリックで `openExecutionConsole()` が呼ばれる                       | P0     |
| C-03 | WorkspaceChatPanel の secondaryAction が openExecutionConsole() を呼ぶ          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`          | blocked guidance 表示時の secondary CTA クリックで `openExecutionConsole()` が呼ばれる              | P0     |
| C-04 | HandoffBlock の CTA click が openExecutionConsole() を呼ぶ                      | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`                    | `端末で続ける` ボタンクリックで props.onOpenTerminal (= openExecutionConsole) が呼ばれる            | P0     |
| C-05 | TerminalHandoffCard の CTA click が openExecutionConsole() を呼ぶ               | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx`  | `端末で続ける` ボタンクリックで props.onOpenTerminal が呼ばれる                                     | P0     |
| C-06 | App Shell の ExecutionConsoleLauncher click が openExecutionConsole() を呼ぶ    | `apps/desktop/src/renderer/components/organisms/AppLayout/TerminalLauncher.tsx` | launcher ボタンクリックで `openExecutionConsole()` 経由の遷移が発生する                             | P1     |
| C-07 | modelSelectionGuidance の secondaryAction type が open-execution-console である | `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`                  | `MODEL_SELECTION_BLOCKED_GUIDANCE_MAP` の secondaryAction.type が `"open-execution-console"` である | P0     |

### テストファイル配置

```
apps/desktop/src/renderer/__tests__/executionConsole.cta.test.tsx          # C-01, C-02, C-03
apps/desktop/src/renderer/components/chat/__tests__/HandoffBlock.test.tsx  # C-04
apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/__tests__/TerminalHandoffCard.test.tsx # C-05
apps/desktop/src/renderer/components/organisms/AppLayout/__tests__/TerminalLauncher.test.tsx              # C-06
apps/desktop/src/renderer/guidance/__tests__/modelSelectionGuidance.test.ts                                # C-07
```

---

## 3. Label テスト群 (L-01〜L-04)

| ID   | テスト名                                                                   | テスト対象ファイル                                                             | 期待結果                                                                       | 優先度 |
| ---- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------ |
| L-01 | HandoffBlock が「端末で続ける」ラベルを表示する                            | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`                   | CTA ボタンのテキストが `端末で続ける` である                                   | P0     |
| L-02 | TerminalHandoffCard が「端末で続ける」ラベルを表示する                     | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx` | CTA ボタンのテキストが `端末で続ける` である                                   | P0     |
| L-03 | modelSelectionGuidance の secondaryAction label が「実行コンソールを開く」 | `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts`                 | `EXECUTION_CONSOLE_ACTION.label` が `"実行コンソールを開く"` である            | P0     |
| L-04 | TerminalHandoffCard のヘッダーが terminal 主表示でない                     | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx` | ヘッダーテキストに `ターミナル` / `terminal` が primary label として含まれない | P1     |

### テストファイル配置

```
apps/desktop/src/renderer/components/chat/__tests__/HandoffBlock.test.tsx                                  # L-01 (C-04 と同一ファイル)
apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/__tests__/TerminalHandoffCard.test.tsx  # L-02, L-04
apps/desktop/src/renderer/guidance/__tests__/modelSelectionGuidance.test.ts                                 # L-03 (C-07 と同一ファイル)
```

---

## 4. Negative テスト群 (N-01〜N-03)

| ID   | テスト名                                                             | テスト対象ファイル                                             | 期待結果                                                                                                          | 優先度 |
| ---- | -------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| N-01 | ChatPanel に setCurrentView("agent") の terminal 代替が存在しない    | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`      | terminal/handoff 関連の handler 内で `setCurrentView("agent")` が呼ばれない（`openExecutionConsole` 使用）        | P0     |
| N-02 | modelSelectionGuidance に open-terminal アクションタイプが存在しない | `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts` | `GuidanceActionType` union に `"open-terminal"` が含まれない                                                      | P0     |
| N-03 | createGuidanceActionDispatcher に openTerminal handler が不要        | `apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts` | `GuidanceActionHandlers` に `openTerminal` プロパティが存在せず、代わりに `openExecutionConsole` が定義されている | P1     |

### テストファイル配置

```
apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.executionConsole.test.tsx   # N-01
apps/desktop/src/renderer/guidance/__tests__/modelSelectionGuidance.test.ts                # N-02, N-03 (C-07, L-03 と同一ファイル)
```

---

## テスト優先度まとめ

| 優先度 | テスト数 | 説明                                      |
| ------ | -------- | ----------------------------------------- |
| P0     | 13       | foundation 契約の根幹。全テスト PASS 必須 |
| P1     | 4        | 既存機能維持・補完。PASS 推奨             |

## テスト実行コマンド

```bash
# 全 execution console テストを実行
cd apps/desktop && pnpm vitest run src/renderer/__tests__/executionConsole.route.test.tsx src/renderer/__tests__/executionConsole.cta.test.tsx

# HandoffBlock テスト
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/HandoffBlock.test.tsx

# modelSelectionGuidance テスト
cd apps/desktop && pnpm vitest run src/renderer/guidance/__tests__/modelSelectionGuidance.test.ts

# TerminalHandoffCard テスト
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/TerminalHandoffCard/__tests__/TerminalHandoffCard.test.tsx
```

## Phase 3 MINOR 対応のテストカバレッジ

| MINOR ID | 指摘内容                                     | カバーするテスト       |
| -------- | -------------------------------------------- | ---------------------- |
| M-1      | `runtimeAccess.ts` 関数名 rename             | C-06                   |
| M-2      | Skill Creator CTA interface 型定義           | (型レベル、テスト不要) |
| M-3      | `TerminalLauncher` rename 時の既存テスト修正 | C-06                   |
