# Phase 1: ギャップ分析レポート

作成日: 2026-04-02

## 1. Facade フェーズ別配線調査結果

`RuntimeSkillCreatorFacade.ts` を調査した結果、**全フェーズへの governance 配線は既に完了**していた。

| フェーズ | メソッド        | createGovernanceHooks 呼び出し     | 行   |
| -------- | --------------- | ---------------------------------- | ---- |
| plan     | `plan()`        | `createGovernanceHooks("plan")`    | 785  |
| execute  | `execute()`     | `createGovernanceHooks("execute")` | 917  |
| verify   | `verifySkill()` | `createGovernanceHooks("verify")`  | 264  |
| improve  | `improve()`     | `createGovernanceHooks("improve")` | 1133 |

**結論**: Issue #1791 の「plan/verify/improve への接続が未完了」という記述は、`lessons-learned` ドキュメントの記述が実際のコードと乖離していた。コード上は完了済み。

## 2. Renderer Governance UI 実装状況

`GovernanceSummaryPanel` コンポーネントが存在しない：

- `apps/desktop/src/renderer/components/organisms/AgentView/` 配下に governance UI なし
- `getGovernanceState()` IPC + preload API は実装済みだが、renderer で消費するコンポーネントが未実装

**結論**: renderer UI の実装が必要。

## 3. execute-only 文言の存在箇所

| ファイル                                                                                             | 行  | 内容                                       |
| ---------------------------------------------------------------------------------------------------- | --- | ------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md` | 16  | "execute phase のみ「接続」した"           |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md` | 61  | "## 4. execute-only wiring の警告パターン" |

## 4. 確定した受入条件

| AC   | 条件                             | 現状                       | 必要作業                       |
| ---- | -------------------------------- | -------------------------- | ------------------------------ |
| AC-1 | 全フェーズ governance hooks 配線 | **完了（コード確認済み）** | 文言修正のみ                   |
| AC-2 | GovernanceSummaryPanel 実装      | 未実装                     | **新規実装**                   |
| AC-3 | denial/summary 表示              | 未実装                     | GovernanceSummaryPanel に含む  |
| AC-4 | Phase 11 evidence                | 未収集                     | 実装後にスクリーンショット収集 |
| AC-5 | execute-only 文言除去            | 残存                       | **文言修正**                   |
