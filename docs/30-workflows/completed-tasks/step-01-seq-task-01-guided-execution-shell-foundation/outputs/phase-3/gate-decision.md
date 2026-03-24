# Phase 3: Gate Decision

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase    | 3                                              |
| 作成日   | 2026-03-24                                     |

## Gate 判定

| 項目               | 判定     |
| ------------------ | -------- |
| Overall            | **PASS** |
| Phase 4 着手許可   | **承認** |
| Phase 1 差戻し要否 | 不要     |
| Phase 2 差戻し要否 | 不要     |

## Phase 4 着手条件

### 必須条件（全て充足）

| 条件                                        | 充足 | 根拠                         |
| ------------------------------------------- | ---- | ---------------------------- |
| naming contract が固定されている            | OK   | design-summary.md Label 階層 |
| route owner が定義されている                | OK   | route-and-action-contract.md |
| shared action が定義されている              | OK   | openExecutionConsole() 定義  |
| 4 surface の CTA が同一契約で表現されている | OK   | cta-mapping.md               |
| no-op / agent 代替の禁止が明記されている    | OK   | cta-mapping.md 禁止パターン  |

### MINOR 指摘の持越し

以下の MINOR 指摘は Phase 4-5 で対応する:

| ID  | 内容                                     | 対応 Phase |
| --- | ---------------------------------------- | ---------- |
| M-1 | `runtimeAccess.ts` rename 優先度の明確化 | Phase 5    |
| M-2 | Skill Creator CTA の action 型定義       | Phase 5    |
| M-3 | `TerminalLauncher` rename 時のテスト修正 | Phase 4    |

## Phase 4 への引継ぎ事項

### テスト設計の重点

1. **Route テスト**: `setCurrentView("executionConsole")` で `ExecutionConsoleView` が描画される
2. **CTA テスト**: 4 surface の CTA click で `openExecutionConsole()` が呼ばれる
3. **Label テスト**: front に `terminal` / `ターミナル` が主表示されない
4. **Negative テスト**: `setCurrentView("agent")` の terminal 代替が存在しない
5. **Launcher テスト**: `TerminalLauncher` → `ExecutionConsoleLauncher` の rename 反映

### Mock 戦略

- `useAppStore` の `setCurrentView` を mock
- `openExecutionConsole()` を spy
- `createGuidanceActionDispatcher` の dispatcher map に `openExecutionConsole` を含める
