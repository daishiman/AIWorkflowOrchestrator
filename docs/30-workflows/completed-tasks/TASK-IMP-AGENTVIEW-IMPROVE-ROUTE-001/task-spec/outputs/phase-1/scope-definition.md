# Phase 1: スコープ定義

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## 対象範囲

### 変更対象ファイル

| ファイル                                                           | 変更内容                                                                                                | 影響範囲                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`              | 改善 CTA バナー追加、`setCurrentView` / `setCurrentSkillName` インポート追加                            | AgentView のみ                     |
| `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` | `onNavigateBack?` / `onNavigateToAgent?` props 追加、ヘッダー左の戻りリンク、フッター右端の再実行ボタン | SkillAnalysisView とその呼び出し元 |
| `apps/desktop/src/renderer/App.tsx`                                | `skillAnalysis` case で `viewHistory` ベースの Agent 起点判定と prop 注入                               | renderView の `skillAnalysis` case |

### 新規作成ファイル

| ファイル                         | 内容                                                                  |
| -------------------------------- | --------------------------------------------------------------------- |
| テストファイル（Phase 4 で確定） | AgentView CTA テスト、SkillAnalysisView navigation テスト、統合テスト |

### 再利用する既存資産

| 資産                                         | 場所                 | 用途                      |
| -------------------------------------------- | -------------------- | ------------------------- |
| `useSelectedSkillName()`                     | `store/index.ts`     | CTA 表示条件の入力        |
| `useSkillExecutionStatus()`                  | `store/index.ts`     | CTA 表示条件の入力        |
| `useIsSkillExecuting()`                      | `store/index.ts`     | CTA 表示条件の入力        |
| `useRecentExecutions()`                      | `store/index.ts`     | 補助判定（必要時のみ）    |
| `viewHistory` / `goBack()`                   | `navigationSlice.ts` | 戻り導線 / Agent 起点判定 |
| `setCurrentView()` / `setCurrentSkillName()` | `navigationSlice.ts` | handoff アクション        |

## 除外範囲

| 除外対象                                        | 理由                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| `agentSlice.ts` への新規 state                  | `isExecutionComplete` 等は不要。既存 `skillExecutionStatus === "completed"` で導出可能 |
| `navigationSlice.ts` への新規 state             | `previousView` / `entrySource` 等は不要。`viewHistory` で前画面判定可能                |
| SkillCenter の `handleAnalyzeSkill` 変更        | 既存契約を回帰禁止対象として保護。変更不要                                             |
| DetailPanel の analyze ボタン変更               | Task03 の責務。本タスクとは独立                                                        |
| `skillLifecycleJourney.ts` 変更                 | 正本定義は変更不要                                                                     |
| `navigationSlice.ts` の `goBack()` ロジック変更 | 既存ロジックで十分                                                                     |
| パフォーマンスチューニング                      | Phase 8 で React.memo / useCallback の適用を検討                                       |

## 依存タスクとの責務境界

### Task01 (TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001)

- **状態**: 完了済み
- **提供**: `skillAnalysis` ViewType、renderView 基盤
- **本タスクの前提**: `skillAnalysis` case が App.tsx に存在することを前提とする

### Task02 (TASK-IMP-SKILLCENTER-CREATE-ROUTE-001)

- **責務境界**: SkillCenter から skillAnalysis への導線は Task02 が担当
- **本タスクの責務**: Agent から skillAnalysis への導線のみ
- **共有契約**: `setCurrentSkillName(name)` -> `setCurrentView("skillAnalysis")` の handoff 順序

### Task03 (TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001)

- **責務境界**: DetailPanel の analyze ボタンは Task03 が担当
- **本タスクの責務**: AgentView の CTA のみ
- **共有契約**: `currentSkillName` を正本とする handoff パターン

## リスク

| リスク                                             | 対策                                                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `viewHistory` から前画面を判定するロジックの信頼性 | `viewHistory` は `setCurrentView` で必ず push されるため、直前の view は `viewHistory[viewHistory.length - 2]` で取得可能                                    |
| `selectedSkillName` と `currentSkillName` の不整合 | handoff 時に `selectedSkillName.trim()` を `setCurrentSkillName` に渡す。戻り時は `currentSkillName` をクリアしない（Agent 側の `selectedSkillName` は維持） |
| 既存テストの回帰                                   | Phase 4 で既存テストの baseline を確認し、Phase 5 で回帰がないことを検証                                                                                     |
