# Phase 1: 仕様抽出マップ

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## aiworkflow-requirements 正本 <-> current code anchor 対応表

| #   | 正本仕様                                                          | current code anchor                    | 抽出した契約                                                                                                                         | 確認状態 |
| --- | ----------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| S-1 | `workflow-skill-lifecycle-created-skill-usage-journey.md`         | `skillLifecycleJourney.ts` L98-104     | Agent の主責務は「実行、結果確認、改善判断の起点」。handoff は「改善が必要なら Skill Analysis へ戻す」                               | 確認済み |
| S-2 | `workflow-skill-lifecycle-routing-render-view-foundation.md`      | `App.tsx` L305-314                     | `skillAnalysis` case: `skillName={currentSkillName ?? "demo-skill"}`, `onClose` で `skillCenter` 遷移 + `setCurrentSkillName(null)`  | 確認済み |
| S-3 | `ui-ux-agent-execution.md`                                        | `AgentView/index.tsx` 全体             | Agent UI の責務は実行・結果確認。`PostExecutionActionBar` は設計意図として言及あり、未実装                                           | 確認済み |
| S-4 | `ui-ux-navigation.md`                                             | `navigationSlice.ts`                   | Surface ownership: Agent -> Skill Analysis handoff。`viewHistory` で push/pop。close は `skillCenter` 固定                           | 確認済み |
| S-5 | `ui-ux-feature-components.md`                                     | `SkillAnalysisView.tsx`                | Props: `skillName` + `onClose` のみ。ヘッダー左に空きあり、フッター右端に追加余地あり                                                | 確認済み |
| S-6 | `arch-state-management-core.md`                                   | `navigationSlice.ts` + `agentSlice.ts` | navigation state は `navigationSlice` が正本。feature state は `agentSlice` が正本。ownership 分離                                   | 確認済み |
| S-7 | `arch-state-management-reference-permissions-import-lifecycle.md` | `useSkillCenter.ts` L304-311           | `handleAnalyzeSkill`: `setCurrentSkillName(skillName)` -> `setCurrentView("skillAnalysis")` -> `handleCloseDetail()` 順序。trim なし | 確認済み |

## state ownership マップ

### navigation state（navigationSlice が正本）

| state              | 型               | 用途                                                                          |
| ------------------ | ---------------- | ----------------------------------------------------------------------------- |
| `currentView`      | `ViewType`       | 現在表示中の view                                                             |
| `viewHistory`      | `ViewType[]`     | 遷移履歴（初期値 `["dashboard"]`）。`setCurrentView` で push、`goBack` で pop |
| `currentSkillName` | `string \| null` | `skillAnalysis` / `skill-editor` に渡すスキル名。handoff payload の正本       |

### feature state（agentSlice が正本）

| state                  | 型                             | 用途                                                                                         |
| ---------------------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| `selectedSkillName`    | `SkillName \| null`            | AgentView で選択中のスキル名                                                                 |
| `skillExecutionStatus` | `SkillExecutionStatus \| null` | 実行状態（`"running"` / `"completed"` / `"error"` / `"cancelled"` / `"permission_pending"`） |
| `isExecuting`          | `boolean`                      | 実行中フラグ                                                                                 |
| `recentExecutions`     | `ExecutionSummary[]`           | 直近実行履歴（最大10件）                                                                     |

## 個別セレクタ一覧（今回使用するもの）

| セレクタ                    | 場所                         | P31 対策                 |
| --------------------------- | ---------------------------- | ------------------------ |
| `useSelectedSkillName()`    | `store/index.ts`             | 個別セレクタ済み         |
| `useSkillExecutionStatus()` | `store/index.ts`             | 個別セレクタ済み         |
| `useIsSkillExecuting()`     | `store/index.ts`             | 個別セレクタ済み         |
| `useRecentExecutions()`     | `store/index.ts`             | 個別セレクタ済み         |
| `useSetCurrentView()`       | 要確認（インライン or 個別） | App.tsx はインライン使用 |
| `useSetCurrentSkillName()`  | 要確認（インライン or 個別） | App.tsx はインライン使用 |

## 回帰禁止対象

| 対象                                         | 契約                                                             | テスト資産                                            |
| -------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------- |
| `SkillAnalysisView onClose`                  | `setCurrentView("skillCenter"); setCurrentSkillName(null);`      | `App.renderView.viewtype.test.tsx` TC-RV-04, TC-RV-05 |
| `handleAnalyzeSkill`                         | `setCurrentSkillName(name)` -> `setCurrentView("skillAnalysis")` | `useSkillCenter.test.ts`                              |
| `currentSkillName ?? "demo-skill"` fallback  | null 時のフォールバック                                          | `App.renderView.viewtype.test.tsx` TC-RV-01b          |
| `SkillAnalysisView onClose のみでも描画可能` | Props 後方互換性                                                 | `SkillAnalysisView.test.tsx`                          |

## 検出された既存仕様との差分

| #   | 差分                                                                           | 影響                                                                             | 対応方針                                               |
| --- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| D-1 | `handleAnalyzeSkill` は `trim()` なし（P42 違反）                              | 本タスクでは Agent 側で trim してから handoff するため直接影響なし               | Agent 側で trim を実施。SkillCenter 側の修正は別タスク |
| D-2 | App.tsx で `setCurrentView` / `setCurrentSkillName` をインラインセレクタで取得 | P31 リスクは低い（Zustand アクション参照は安定）が、一貫性のため個別セレクタ推奨 | Phase 5 で個別セレクタに統一を検討                     |
| D-3 | `skillAnalysis` の close 時に `viewHistory` を使わず `skillCenter` 固定        | Agent 起点で戻るには `goBack()` が必要。`onClose` と別経路で提供                 | `onNavigateBack` を新設し、`onClose` は既存通り維持    |
