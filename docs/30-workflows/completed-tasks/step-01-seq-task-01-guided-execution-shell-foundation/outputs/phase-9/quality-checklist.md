# Phase 9: 品質検証チェックリスト

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 9                                              |
| 作成日   | 2026-03-24                                     |

## 1. Wording QA

front に表示される全ての文言が Naming Contract に準拠していることを検証する。

### 1.1 Primary Label 検証

| チェック項目                                                                 | 検証方法                                                              | 結果 |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---- |
| App Shell nav item に `実行コンソール` が表示される                          | navContract.ts / GlobalNavStrip の label 確認                         | [ ]  |
| App Shell TerminalLauncher のボタンに `実行コンソール` が表示される          | `AppLayout/TerminalLauncher.tsx` L33 の表示テキスト確認               | [ ]  |
| ChatPanel の handoff CTA に `実行コンソールを開く` 相当が表示される          | ChatPanel.tsx の HandoffBlock 呼び出し箇所確認                        | [ ]  |
| LLMGuidanceBanner の secondaryAction に `実行コンソールを開く` が表示される  | `EXECUTION_CONSOLE_ACTION.label` が `実行コンソールを開く` であること | [ ]  |
| WorkspaceChatPanel の secondaryAction に `実行コンソールを開く` が表示される | GuidanceBlock の secondaryActionLabel 確認                            | [ ]  |

### 1.2 Handoff Label 検証

| チェック項目                                                 | 検証方法                                              | 結果 |
| ------------------------------------------------------------ | ----------------------------------------------------- | ---- |
| HandoffBlock のボタンに `端末で続ける` が表示される          | `HandoffBlock.tsx` のボタンテキスト確認               | [ ]  |
| TerminalHandoffCard のヘッダーに `端末で続ける` が表示される | `TerminalHandoffCard.tsx` L101 のヘッダーテキスト確認 | [ ]  |

### 1.3 禁止 Wording 検証

| チェック項目                                                                | 検証方法                                                                                                         | 結果 |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---- |
| `ターミナルを開く` が front の UI テキストに存在しない                      | `grep -rn "ターミナルを開く" apps/desktop/src/renderer --include="*.tsx" --include="*.ts"` が UI 表示箇所で 0 件 | [ ]  |
| `terminal を開く` が front の UI テキストに存在しない                       | `grep -rn "terminal を開く" apps/desktop/src/renderer --include="*.tsx"` が 0 件                                 | [ ]  |
| `open-terminal` が `GuidanceActionType` に存在しない                        | `modelSelectionGuidance.ts` の型定義確認                                                                         | [ ]  |
| `TERMINAL_ACTION` 定数が存在しない（`EXECUTION_CONSOLE_ACTION` に置換済み） | `grep -rn "TERMINAL_ACTION" apps/desktop/src/renderer` が 0 件                                                   | [ ]  |

### 1.4 内部 API / コメントの Legacy Wording 確認

| チェック項目                                                     | 検証方法                                  | 対応レベル |
| ---------------------------------------------------------------- | ----------------------------------------- | ---------- |
| `ChatPanel.tsx` JSDoc の `terminal surface` 記述が更新されている | L17 のコメント確認                        | コメント   |
| `ChatPanel.tsx` の `GAP-04` コメントが削除されている             | L147 のコメント確認（handler 自体を削除） | コメント   |
| `runtimeAccess.ts` の disabled reason 文字列が更新されている     | L28 `利用可能なターミナル経路` 確認       | 文字列     |

## 2. Route QA

`executionConsole` が ViewType / renderView / navContract で正しく定義されていることを検証する。

### 2.1 ViewType 定義

| チェック項目                                         | 検証方法                                        | 結果 |
| ---------------------------------------------------- | ----------------------------------------------- | ---- |
| `ViewType` union に `"executionConsole"` が含まれる  | `apps/desktop/src/renderer/store/types.ts` 確認 | [ ]  |
| `"executionConsole"` が既存の ViewType と重複しない  | types.ts の union 全体を確認                    | [ ]  |
| TypeScript コンパイルが通る（`pnpm typecheck` PASS） | `pnpm --filter @repo/desktop exec tsc --noEmit` | [ ]  |

### 2.2 renderView 分岐

| チェック項目                                                        | 検証方法                               | 結果 |
| ------------------------------------------------------------------- | -------------------------------------- | ---- |
| `App.tsx` の `renderView()` に `case "executionConsole"` が存在する | App.tsx の switch/if 文確認            | [ ]  |
| `case "executionConsole"` が `<ExecutionConsoleView />` を返す      | JSX 要素の確認                         | [ ]  |
| `ExecutionConsoleView` が lazy import されている                    | `React.lazy(() => import(...))` の確認 | [ ]  |
| `ExecutionConsoleView` の stub が正しく描画される                   | stub View の JSX 確認                  | [ ]  |

### 2.3 Shared Action

| チェック項目                                                               | 検証方法                                                                                                           | 結果 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---- |
| `openExecutionConsole()` が `actions/executionConsole.ts` に定義されている | ファイル存在確認                                                                                                   | [ ]  |
| `openExecutionConsole()` が `setCurrentView("executionConsole")` を呼ぶ    | 関数本体の確認                                                                                                     | [ ]  |
| 全 surface が `openExecutionConsole()` を import して使用している          | `grep -rn "openExecutionConsole" apps/desktop/src/renderer`                                                        | [ ]  |
| 直接 `setCurrentView("executionConsole")` を呼んでいる箇所がない           | `grep -rn 'setCurrentView.*executionConsole' apps/desktop/src/renderer` が actions/executionConsole.ts 以外で 0 件 | [ ]  |

### 2.4 navContract 整合性

| チェック項目                                                          | 検証方法                                  | 結果 |
| --------------------------------------------------------------------- | ----------------------------------------- | ---- |
| `navContract.ts` に `executionConsole` 項目が設計として定義されている | design-summary.md の navContract 追加確認 | [ ]  |
| 既存の 9 項目（Cmd+1〜8, Cmd+,）に変更がない                          | navContract.ts の items 配列確認          | [ ]  |
| `NAV_SHORTCUT_TO_VIEW` マッピングに既存以外の追加がない               | navContract.ts の Record 確認             | [ ]  |

## 3. Accessibility QA

WCAG 2.1 AA 準拠を検証する。

### 3.1 ARIA Label 更新

| チェック項目                                                                      | 検証方法                                  | 結果 |
| --------------------------------------------------------------------------------- | ----------------------------------------- | ---- |
| `TerminalLauncher.tsx` の `aria-label` が `実行コンソールを開く` に更新されている | L25 の aria-label 確認                    | [ ]  |
| `TerminalHandoffCard.tsx` の `aria-label` が `実行コンソール引き継ぎ案内` に更新  | L72 の aria-label 確認                    | [ ]  |
| `LLMGuidanceBanner.tsx` の secondaryAction ボタンに適切な `aria-label` がある     | `EXECUTION_CONSOLE_ACTION.ariaLabel` 確認 | [ ]  |
| `HandoffBlock.tsx` のボタンに `aria-label` が設定されている                       | button 要素の aria-label 確認             | [ ]  |
| `ExecutionConsoleView` の stub に適切な `aria-label` または landmark がある       | stub View の JSX 確認                     | [ ]  |

### 3.2 コントラスト比

| チェック項目                                                      | 基準                       | 検証方法                                                        | 結果 |
| ----------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------- | ---- |
| `実行コンソール` ラベルのテキスト色とボタン背景色のコントラスト比 | 4.5:1 以上（通常テキスト） | CSS 変数 `--text-primary` / `--bg-secondary` のコントラスト計算 | [ ]  |
| `端末で続ける` ラベルのテキスト色と背景色のコントラスト比         | 4.5:1 以上                 | 同上                                                            | [ ]  |
| ダークモードでの `実行コンソール` ラベルのコントラスト比          | 4.5:1 以上                 | ダークモード CSS 変数でのコントラスト計算                       | [ ]  |
| disabled 状態の tooltip テキストのコントラスト比                  | 3:1 以上（UI 部品）        | disabled 状態の色確認                                           | [ ]  |

### 3.3 キーボードアクセシビリティ

| チェック項目                                              | 検証方法                                | 結果 |
| --------------------------------------------------------- | --------------------------------------- | ---- |
| TerminalLauncher ボタンが Tab キーでフォーカス可能        | `tabIndex` が適切に設定されていること   | [ ]  |
| HandoffBlock のボタンが Tab キーでフォーカス可能          | `<button>` 要素であること               | [ ]  |
| TerminalHandoffCard の各ボタンが Tab キーでフォーカス可能 | copy / dismiss ボタンの `<button>` 確認 | [ ]  |
| フォーカス状態の視覚的フィードバックがある                | `:focus-visible` スタイルの確認         | [ ]  |

## 4. Link / Artifacts QA

Phase 本文と artifacts.json の成果物名・パスが一致していることを検証する。

### 4.1 Phase 8 Artifacts

| artifacts.json 定義                            | 実ファイルパス                                 | 一致 |
| ---------------------------------------------- | ---------------------------------------------- | ---- |
| `outputs/phase-8/refactor-boundaries.md`       | `outputs/phase-8/refactor-boundaries.md`       | [ ]  |
| `outputs/phase-8/simplification-candidates.md` | `outputs/phase-8/simplification-candidates.md` | [ ]  |

### 4.2 Phase 9 Artifacts

| artifacts.json 定義                    | 実ファイルパス                         | 一致 |
| -------------------------------------- | -------------------------------------- | ---- |
| `outputs/phase-9/quality-checklist.md` | `outputs/phase-9/quality-checklist.md` | [ ]  |
| `outputs/phase-9/risk-register.md`     | `outputs/phase-9/risk-register.md`     | [ ]  |

### 4.3 Phase 仕様書と成果物の整合性

| チェック項目                                                            | 検証方法                                                        | 結果 |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- | ---- |
| `phase-8-refactoring.md` の成果物テーブルと artifacts.json が一致       | 成果物テーブルのパスと artifacts.json の Phase 8 artifacts 比較 | [ ]  |
| `phase-9-quality-assurance.md` の成果物テーブルと artifacts.json が一致 | 同上                                                            | [ ]  |
| 全 Phase の成果物ファイルが実際に存在する                               | `ls outputs/phase-*/` で全ファイル確認                          | [ ]  |
| design-summary.md 内の参照パスが有効                                    | `route-and-action-contract.md`, `cta-mapping.md` の存在確認     | [ ]  |

### 4.4 Cross-Phase 参照整合性

| 参照元            | 参照先                    | リンク有効 |
| ----------------- | ------------------------- | ---------- |
| phase-8 参照資料  | phase-1-requirements.md   | [ ]        |
| phase-8 参照資料  | phase-2-design.md         | [ ]        |
| phase-8 参照資料  | phase-5-implementation.md | [ ]        |
| phase-8 参照資料  | phase-6-test-expansion.md | [ ]        |
| phase-8 参照資料  | phase-7-coverage-check.md | [ ]        |
| phase-9 参照資料  | phase-5-implementation.md | [ ]        |
| phase-9 参照資料  | phase-8-refactoring.md    | [ ]        |
| phase-9 次のPhase | phase-10-final-review.md  | [ ]        |
