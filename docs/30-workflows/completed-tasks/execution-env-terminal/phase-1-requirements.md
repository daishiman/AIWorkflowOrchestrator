# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 1                                                          |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001                              |
| 機能名   | execution-env-terminal                                     |
| Issue    | #1456                                                      |
| 作成日   | 2026-03-23                                                 |
| 由来     | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 P62 対策 |

## 目的

`ExecutionEnvironment.terminal` の placeholder 実装を本実装に移行し、`assertNoSilentFallback` ガードにより `DEFAULT_CONFIG` への暗黙 fallback が発生しないことを保証する。

## P50 チェック: 既実装状態の調査結果

| 対象                                     | 状態             | 詳細                                                              |
| ---------------------------------------- | ---------------- | ----------------------------------------------------------------- |
| `ExecutionEnvironment` コンポーネント    | placeholder      | `case "terminal"` で `<Placeholder>` を表示（"Coming soon"）      |
| `DEFAULT_CONFIG`（llmConfigProvider.ts） | コメントアウト済 | L22-26 で意図的にコメントアウト。`currentConfig` は `null` 初期値 |
| `assertNoSilentFallback()` ガード        | 未実装           | 明示的なランタイムアサーションは存在しない                        |
| `RuntimePolicyResolver`                  | 実装済み         | `authMode + apiKey` → `integrated_api` / `terminal_handoff` 分岐  |
| `TerminalHandoffBuilder`                 | 実装済み         | `HandoffGuidance` DTO 構築                                        |
| `TerminalHandoffCard`                    | 実装済み         | Renderer 側 handoff UI コンポーネント                             |
| `terminalHandlers.ts`                    | 実装済み         | `IPC_CHANNELS.TERMINAL_OPEN` ハンドラ                             |
| `HandoffGuidance` 型                     | 実装済み         | `packages/shared/src/types/handoff.ts`                            |

**判定**: placeholder → 本実装への移行 + `assertNoSilentFallback` ガード新規追加。既存インフラ（RuntimePolicyResolver, TerminalHandoffBuilder, TerminalHandoffCard）は再利用可能。

## 機能要件（FR）

### FR-1: ExecutionEnvironment.terminal 本実装

`ExecutionEnvironment` コンポーネントの `case "terminal"` を placeholder から本実装に移行する。

| ID    | 要件                                                                | 優先度 |
| ----- | ------------------------------------------------------------------- | ------ |
| FR-1a | `environmentType="terminal"` 時に `TerminalHandoffCard` を表示する  | 高     |
| FR-1b | `HandoffGuidance` が `null` の場合は空状態（empty state）を表示する | 高     |
| FR-1c | `TerminalHandoffCard` に `handoffGuidance` props を渡して表示する   | 高     |

### FR-2: assertNoSilentFallback ガード

Provider/Model 未選択時に `DEFAULT_CONFIG` への暗黙 fallback を防止するランタイムガード。

| ID    | 要件                                                               | 優先度 |
| ----- | ------------------------------------------------------------------ | ------ |
| FR-2a | `assertNoSilentFallback()` 関数を実装する                          | 高     |
| FR-2b | `getSelectedLLMConfig()` が `null` を返す場合にエラーを throw する | 高     |
| FR-2c | ガードは LLM 呼び出し前の全てのエントリポイントで実行する          | 高     |
| FR-2d | エラーメッセージに未選択の項目（Provider/Model）を明示する         | 中     |

### FR-3: 未選択時のエラーハンドリング

| ID    | 要件                                                                     | 優先度 |
| ----- | ------------------------------------------------------------------------ | ------ |
| FR-3a | Provider/Model 未選択時にユーザーへエラーメッセージを表示する            | 高     |
| FR-3b | エラー状態から設定画面（LLM セレクター）へ遷移可能なアクションを提供する | 中     |

## 非機能要件（NFR）

| ID    | 要件                                                                                       | 優先度 |
| ----- | ------------------------------------------------------------------------------------------ | ------ |
| NFR-1 | `assertNoSilentFallback` は同期関数として実装（非同期では呼び出し元で await 忘れのリスク） | 高     |
| NFR-2 | ガードのオーバーヘッドは無視可能（in-memory 変数の null チェックのみ）                     | 低     |
| NFR-3 | エラーメッセージは i18n 対応可能な構造にする                                               | 低     |

## 受入基準

- [ ] AC-1: `ExecutionEnvironment.terminal` が `TerminalHandoffCard` を使った本実装になっている
- [ ] AC-2: `HandoffGuidance` が `null` の場合に適切な空状態が表示される
- [ ] AC-3: `assertNoSilentFallback()` 関数が実装されている
- [ ] AC-4: `getSelectedLLMConfig()` が `null` を返す状態で LLM 呼び出しを行うとエラーが throw される
- [ ] AC-5: Provider/Model 未選択時にユーザーへエラーメッセージが表示される
- [ ] AC-6: unit test でガード動作（fallback が発生しないこと）が検証されている
- [ ] AC-7: `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` に terminal の `assertNoSilentFallback` 仕様が追記されている

## スコープ

### 含む

- `ExecutionEnvironment.terminal` の placeholder → 本実装移行
- `assertNoSilentFallback()` ガード関数の新規実装
- 未選択時のエラー表示 UI
- ガードの unit test
- 仕様書への `assertNoSilentFallback` 追記

### 含まない

- Persistent Launcher button（App Shell Header）の実装
- Terminal session dock / panel の実装
- Consumer adapter 関数（`toHandoffGuidance()`）の新規実装
- Zustand store の `handoffGuidance` slice 新規追加
- terminal transcript display の実装

## 参照資料

| 資料名                         | パス                                                                                                                                  | 説明                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| design-summary.md              | `docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md`        | Terminal Handoff Surface 設計サマリー         |
| implementation-guide.md        | `docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-12/implementation-guide.md` | 実装ガイド                                    |
| interfaces-agent-sdk-skill-ref | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md`                     | Agent SDK Skill 仕様 reference bundle         |
| llmConfigProvider.ts           | `apps/desktop/src/main/ipc/llmConfigProvider.ts`                                                                                      | LLM 設定プロバイダー（DEFAULT_CONFIG の所在） |
| ExecutionEnvironment/index.tsx | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx`                                                       | 現在の placeholder 実装                       |

## 統合テスト連携

- `ExecutionEnvironment` コンポーネントの既存テストに terminal ケースを追加
- `assertNoSilentFallback()` の unit test を新規作成
- `llmConfigProvider` の既存テストに null 状態のガード検証を追加

## 成果物

| 成果物     | パス                                                               | 説明           |
| ---------- | ------------------------------------------------------------------ | -------------- |
| 要件定義書 | `docs/30-workflows/execution-env-terminal/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [ ] FR-1〜FR-3、NFR-1〜NFR-3 が定義されている
- [ ] AC-1〜AC-7 が検証可能な形式で記述されている
- [ ] スコープ（含む/含まない）が明確に定義されている
- [ ] P50 チェックが完了し、既実装状態が把握されている
- [ ] 参照資料が全て有効なパスで指定されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 2: 設計
