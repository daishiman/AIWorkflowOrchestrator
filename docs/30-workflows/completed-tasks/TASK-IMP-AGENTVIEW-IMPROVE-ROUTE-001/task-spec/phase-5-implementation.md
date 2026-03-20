# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 5                                    |
| Phase 名   | 実装                                 |
| タスクID   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| 前提 Phase | Phase 4（テスト作成 / Red 確認済み） |
| 後続 Phase | Phase 6（テスト拡充）                |
| ステータス | not_started                          |
| 作成日     | 2026-03-17                           |
| 機能名     | agentview-improve-route              |

## 目的

Phase 4 で作成したテストを Green にするプロダクションコードを実装する。実装順序は「SkillAnalysisView prop 拡張 -> AgentView CTA 実装 -> App.tsx handoff 注入更新」の順に行う。

## 参照資料

| 参照資料            | パス                                                                      | 内容                                                               |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Phase 2（設計）     | `phase-2-design.md`                                                       | props 設計・UI レイアウト・遷移フローの正本                        |
| Phase 3（レビュー） | `phase-3-design-review.md`                                                | レビュー指摘の対応事項を確認する                                   |
| Phase 4（テスト）   | `phase-4-test-creation.md`                                                | Green にすべきテストケース一覧を確認する                           |
| AgentView           | `apps/desktop/src/renderer/views/AgentView/index.tsx`                     | 現状の実装を確認し変更箇所を特定する                               |
| SkillAnalysisView   | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`        | 現状の props / 構造を確認し拡張ポイントを特定する                  |
| App.tsx             | `apps/desktop/src/renderer/App.tsx`                                       | `skillAnalysis` case と `currentSkillName` handoff を確認する      |
| navigationSlice     | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`               | `currentSkillName` / `viewHistory` / 追加 state の必要性を確認する |
| SkillCenter handoff | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | 既存 analyze handoff と揃える                                      |

## 実行タスク

- Task 5-1: SkillAnalysisView の追加 props と既存 `onClose` の両立を実装する
- Task 5-2: AgentView CTA と `selectedSkillName -> currentSkillName -> skillAnalysis` handoff を実装する
- Task 5-3: App.tsx の `skillAnalysis` case を現行 baseline と履歴ベース判定で更新する

### Task 5-1: SkillAnalysisView prop 拡張

**変更ファイル**: `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`

- `SkillAnalysisViewProps` に `onNavigateBack?` / `onNavigateToAgent?` を追加する
- `onNavigateBack` がある場合だけヘッダー左に戻るリンクを表示する
- `onNavigateToAgent` がある場合だけ既存 footer の右端に再実行ボタンを表示する
- 既存 `onClose` 契約は必ず維持する

### Task 5-2: AgentView CTA バナー実装

**変更ファイル**: `apps/desktop/src/renderer/views/AgentView/index.tsx`

- `selectedSkillName` / `skillExecutionStatus` / `recentExecutions` / `isExecuting` を個別セレクタで取得する
- 既存 state から `canOfferAnalysis` を導出する
- CTA クリック時は `selectedSkillName` を正規化し、`setCurrentSkillName(trimmedName)` -> `setCurrentView("skillAnalysis")` の順で handoff する
- 戻り導線のための新規 persistent state は追加しない。既存 `viewHistory` を使う

### Task 5-3: App.tsx `skillAnalysis` case の prop 注入更新

**変更ファイル**: `apps/desktop/src/renderer/App.tsx`

- `skillName` には `currentSkillName ?? "demo-skill"` を渡す
- `onClose` は既存通り `setCurrentView("skillCenter"); setCurrentSkillName(null);` を維持する
- Agent 起点のときだけ `viewHistory` を根拠に `onNavigateBack` / `onNavigateToAgent` を注入する

## 実装順序と確認ポイント

1. SkillAnalysisView prop 拡張を行い、関連テストを Green にする
2. AgentView CTA バナー実装を行い、関連テストを Green にする
3. App.tsx handoff 注入更新を行い、関連テストと統合テストを Green にする
4. 既存テストが壊れていないことを確認する

## 実装上の禁止事項

- `any` 型を使用しない
- `@ts-ignore` / `@ts-expect-error` を理由コメントなしに使用しない
- 合成 Store Hook を新規使用箇所に追加しない
- 存在しない state 名（`previousView` や `isExecutionComplete`）を前提に実装しない
- ハードコード色を新規に追加しない

## 統合テスト連携

AgentView の CTA 表示条件、`selectedSkillName -> currentSkillName` handoff、SkillAnalysisView の props 拡張と既存 `onClose` 契約が受入基準と追跡可能であることを確認する。

## 成果物

| 成果物                 | パス                                                               | 内容                                              |
| ---------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| SkillAnalysisView 変更 | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` | `onNavigateBack` / `onNavigateToAgent` props 追加 |
| AgentView 変更         | `apps/desktop/src/renderer/views/AgentView/index.tsx`              | 改善 CTA バナー追加                               |
| App.tsx 変更           | `apps/desktop/src/renderer/App.tsx`                                | `skillAnalysis` case への handoff 注入更新        |
| navigationSlice 変更   | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`        | entry source 周辺の調整（必要時）                 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                        | 変更箇所・設計判断・注意事項を記録する            |

## 完了条件

- [ ] Task 5-1: SkillAnalysisView に `onNavigateBack` / `onNavigateToAgent` props が追加されている
- [ ] Task 5-1: 後方互換性が維持されている
- [ ] Task 5-2: AgentView に改善 CTA バナーが実装されている
- [ ] Task 5-2: CTA 表示条件が既存 state に基づいて実装されている
- [ ] Task 5-2: 200-300ms の軽いアニメーション方針が実装されている
- [ ] Task 5-2: 個別セレクタを使用している
- [ ] Task 5-3: App.tsx の `skillAnalysis` case に `onNavigateBack` / `onNavigateToAgent` が注入されている
- [ ] Task 5-3: Agent 起点以外では `undefined` を渡している
- [ ] Task 5-3: `currentSkillName` handoff と既存 `onClose -> skillCenter` 契約が維持されている
- [ ] Phase 4 で作成したすべてのテストが Green 状態になっている
- [ ] 既存テストが壊れていない
- [ ] `outputs/phase-5/implementation-summary.md` に実装サマリーが記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
