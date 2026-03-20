# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| Phase 名   | テスト作成                                |
| タスクID   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001      |
| 前提 Phase | Phase 3（設計レビュー PASS または MINOR） |
| 後続 Phase | Phase 5（実装）                           |
| ステータス | not_started                               |
| 作成日     | 2026-03-17                                |
| 機能名     | agentview-improve-route                   |

## 目的

TDD 原則に従い、実装前にテストコードを作成する。現行の `SkillAnalysisView` が `onClose` のみを持つ baseline と、SkillCenter 既存 analyze handoff を壊さない回帰 Red を先に固定し、Phase 2/3 で採択された将来契約がある場合のみ追加 Red を積む。

## 参照資料

| 参照資料                   | パス                                                                                        | 内容                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Phase 1（要件定義）        | `phase-1-requirements.md`                                                                   | AC と current code anchor を確認する                                            |
| Phase 2（設計）            | `phase-2-design.md`                                                                         | props 設計・遷移フロー・表示条件を確認する                                      |
| Phase 3（レビュー）        | `phase-3-design-review.md`                                                                  | レビュー指摘の修正内容を確認する                                                |
| AgentView                  | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                       | 既存コードを確認してテスト対象を特定する                                        |
| AgentView テスト           | `apps/desktop/src/renderer/views/AgentView/__tests__/`                                      | 既存テストのパターンを確認する                                                  |
| SkillAnalysisView          | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                          | 既存 props と `onClose` テストを確認する                                        |
| SkillAnalysisView テスト   | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`           | 既存テストへ追記可能か確認する                                                  |
| App.tsx                    | `apps/desktop/src/renderer/App.tsx`                                                         | `skillAnalysis` case と `currentSkillName` handoff を確認する                   |
| App renderView テスト      | `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx`                      | 既存 `skillAnalysis` close 契約のテスト資産を確認する                           |
| SkillCenter handoff        | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                   | 既存 analyze handoff を確認する                                                 |
| SkillCenter handoff テスト | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`          | `setCurrentSkillName` -> `setCurrentView("skillAnalysis")` の既存回帰を確認する |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Zustand テストパターンを確認する                                                |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P31 / P39 の根拠を確認する                                                      |

## 現行ベースライン

- `SkillAnalysisView` の現行 props は `skillName` と `onClose` のみである
- `App.tsx` の `skillAnalysis` case は `skillName={currentSkillName ?? "demo-skill"}` を渡す
- `App.tsx` の `onClose` は `setCurrentView("skillCenter")` と `setCurrentSkillName(null)` を実行する
- SkillCenter の既存 analyze handoff は `setCurrentSkillName(skillName)` の後に `setCurrentView("skillAnalysis")` を呼ぶ
- Task 4-2 / 4-3 の追加契約は、Phase 2/3 で採択された場合にのみ Red 化する

## 実行タスク

- Task 4-1: AgentView CTA の表示条件と handoff 順序を Red で固定する
- Task 4-2: SkillAnalysisView の追加 navigation props を採択時だけ Red で固定する
- Task 4-3: App.tsx の `skillAnalysis` 注入契約と fallback 契約を Red で固定する
- Task 4-4: AgentView -> SkillAnalysisView -> AgentView の往復を Red で固定する

### Task 4-1: AgentView CTA バナー表示条件テスト

**テストファイル**: `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` へ追記、または `ctaBanner.test.tsx` を追加

主なケース:

- `selectedSkillName` が非空で `skillExecutionStatus="completed"` の場合に CTA バナーを表示する
- `isExecuting=true` の場合は CTA バナーを表示しない
- `skillExecutionStatus!="completed"` の場合は CTA バナーを表示しない
- `selectedSkillName` が null / undefined / 空文字 / 空白のみの場合は CTA バナーを表示しない
- CTA クリック時に `setCurrentSkillName(trimmedName)` -> `setCurrentView("skillAnalysis")` が呼ばれる
- 既存 SkillCenter analyze handoff と同じ順序契約であることを確認する
- P31 対策として個別セレクタを使っていることを確認する

### Task 4-2: SkillAnalysisView prop 拡張テスト

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx` へ追記、または `SkillAnalysisView.navigation.test.tsx` を追加

主なケース:

- 現行 baseline として `onClose` のみでも描画できることを維持する
- `onNavigateBack` がある場合だけ戻るリンクを表示する
- `onNavigateToAgent` がある場合だけ再実行ボタンを表示する
- `onNavigateBack` / `onNavigateToAgent` 追加後も既存 `onClose` が機能する
- 追加 UI がキーボード到達可能である

### Task 4-3: App.tsx prop 注入テスト

**テストファイル**: `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx` へ追記、または `App/__tests__/skillAnalysisCase.test.tsx` を追加

主なケース:

- Agent 起点 entry source の場合だけ `onNavigateBack` / `onNavigateToAgent` が注入される
- `skillName` には `currentSkillName` が渡される
- `onClose` は既存通り `skillCenter` close を維持する
- `currentSkillName ?? "demo-skill"` の fallback 契約を維持する

### Task 4-4: 遷移フロー統合テスト

**テストファイル**: `apps/desktop/src/renderer/__tests__/agentToSkillAnalysisFlow.integration.test.tsx`、または既存 renderView 系テストへの統合追記

主なケース:

- 実行済み状態で CTA が表示され、クリックで `skillAnalysis` に遷移する
- SkillAnalysisView で戻ると AgentView に戻る
- SkillAnalysisView で再実行を押すと AgentView に戻る
- 往復後も `currentSkillName` / `selectedSkillName` が不整合を起こさない
- スキル未選択・実行中・completed 以外では CTA が表示されない
- 既存 SkillCenter analyze handoff の回帰が壊れていない

## 実行手順

1. 既存テストのモックパターンを確認する
2. Task 4-1 から Task 4-4 の順にテストファイルを作成する
3. すべてが Red であることを確認する
4. `outputs/phase-4/test-plan.md` にテスト設計を記録する

## 統合テスト連携

受入基準 AC-1〜AC-7 と、`currentSkillName` handoff / 既存 `onClose` 契約の両方を追跡可能にする。

## 成果物

| 成果物                     | パス                                                                                                                             | 内容                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| テスト計画書               | `outputs/phase-4/test-plan.md`                                                                                                   | テストケース一覧・カバレッジ目標・モック設計    |
| CTA バナーテスト           | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` または `ctaBanner.test.tsx`                             | AgentView の CTA バナー表示条件・動作テスト     |
| ナビゲーション prop テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx` または `SkillAnalysisView.navigation.test.tsx` | SkillAnalysisView のナビゲーション props テスト |
| App.tsx prop 注入テスト    | `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx` または `App/__tests__/skillAnalysisCase.test.tsx`         | App.tsx の handoff / entrySource 注入テスト     |
| 統合テスト                 | `apps/desktop/src/renderer/__tests__/agentToSkillAnalysisFlow.integration.test.tsx` または既存 renderView 系テスト               | 遷移フロー全体の統合テスト                      |

## 完了条件

- [ ] Task 4-1: AgentView CTA バナー表示条件テストが作成されている
- [ ] Task 4-2: SkillAnalysisView prop 拡張テストが作成されている
- [ ] Task 4-3: App.tsx prop 注入テストが作成されている
- [ ] Task 4-4: 遷移フロー統合テストが作成されている
- [ ] AC-1〜AC-7 がテストでカバーされている
- [ ] `currentSkillName` handoff / 既存 `onClose` 契約のテストが含まれている
- [ ] 既存 SkillCenter analyze handoff の回帰テストが含まれている
- [ ] P31 対策（個別セレクタ使用確認）のテストが含まれている
- [ ] P39 対策（`fireEvent` を使用、`userEvent` 不使用）が遵守されている
- [ ] すべてのテストが Red であることを確認している
- [ ] `outputs/phase-4/test-plan.md` にテスト計画が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
