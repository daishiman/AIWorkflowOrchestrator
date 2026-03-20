# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 1                                    |
| Phase 名   | 要件定義                             |
| タスクID   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| 前提 Phase | なし                                 |
| 後続 Phase | Phase 2（設計）                      |
| ステータス | not_started                          |
| 作成日     | 2026-03-17                           |
| 機能名     | agentview-improve-route              |

## 目的

AgentView の実行後 UI、SkillAnalysisView の現行契約、SkillCenter 既存 analyze handoff を調査し、今回の実装で追加すべき要件と壊してはいけない境界を明文化する。

## 実行タスク

- 現状調査: AgentView の `selectedSkillName` / `skillExecutionStatus` / `recentExecutions`、navigationSlice の `currentSkillName` / `viewHistory`、SkillAnalysisView の既存 props を確認する
- 要件抽出: 因果ループ断絶3（AgentView -> SkillAnalysis）と断絶4（SkillAnalysis -> Agent）の解決要件を抽出する
- 受入基準定義: AC-1〜AC-7 の検証可能な完了条件を定義する
- スコープ確定: 対象ファイル・除外範囲・依存タスクとの責務境界、aiworkflow-requirements から読むべき正本を確定する

## 参照資料

| 参照資料              | パス                                                                      | 内容                                                          |
| --------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| AgentView             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                     | 実行後 UI と選択状態を確認する                                |
| SkillAnalysisView     | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`        | 既存 props / footer / close 契約を確認する                    |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                                       | `skillAnalysis` case と `currentSkillName` handoff を確認する |
| navigationSlice       | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`               | `currentView` / `viewHistory` / `currentSkillName` を確認する |
| SkillCenter handoff   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | 既存 `handleAnalyzeSkill()` 契約を確認する                    |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | Agent が改善判断の起点である正本契約を確認する                |
| AgentView テスト      | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx`  | 既存テスト契約を確認する                                      |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料             | パス                                                                                                                | 内容                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 利用導線正本         | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`         | Agent 実行後の改善導線に最も近い統合正本  |
| routing 基盤正本     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`      | `skillAnalysis` / `currentSkillName` 契約 |
| Agent 実行面仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                        | Agent UI の責務境界                       |
| ナビゲーション正本   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                             | ViewType / `skillAnalysis` close 契約     |
| 機能別コンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                     | AgentView / SkillAnalysisView 仕様        |
| 状態管理正本         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                   | navigation ownership                      |
| handoff 参照         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | SkillCenter analyze handoff               |

## 受入基準

| AC   | 条件                                                                                                                                                                                                         | 検証観点                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| AC-1 | AgentView の改善 CTA は `selectedSkillName` が trim 後に非空、かつ `skillExecutionStatus === "completed"`、かつ `isExecuting !== true` のときだけ表示される                                                  | feature state の表示条件が実装実体に一致している             |
| AC-2 | AgentView から SkillAnalysis へ遷移する場合、`setCurrentSkillName(trimmedSelectedSkillName)` の後に `setCurrentView("skillAnalysis")` を呼ぶ順序が明文化されている                                           | 既存 SkillCenter analyze handoff と同じ route pattern である |
| AC-3 | 現行 SkillCenter analyze handoff の正本として `useSkillCenter.ts` の `handleAnalyzeSkill()` が参照され、回帰禁止対象として記録されている                                                                     | 既存導線を壊さない                                           |
| AC-4 | 現行 `App.tsx` の `skillAnalysis` 契約、すなわち `skillName={currentSkillName ?? "demo-skill"}` と `onClose => setCurrentView("skillCenter"); setCurrentSkillName(null);` が baseline として明文化されている | 既存 close 契約の後方互換を守る                              |
| AC-5 | SkillAnalysis から Agent へ戻る導線は、既存 `viewHistory` / `goBack()` を第一候補として検討し、`previousView` や同種の未実在 state を要件に書かない                                                          | 戻り導線設計の発明を防ぐ                                     |
| AC-6 | navigation state（`currentView` / `currentSkillName` / `viewHistory`）と feature state（`selectedSkillName` / `skillExecutionStatus` / `recentExecutions`）の ownership が分離して記録されている             | 関心ごとの分離が守られている                                 |
| AC-7 | aiworkflow-requirements の正本参照先と current code anchor の対応が `spec-extraction-map.md` に固定され、今回必要な docs が取りこぼしなく列挙されている                                                      | 仕様抽出漏れがない                                           |

## 実行手順

### ステップ1: 参照資料を確認する

`skillLifecycleJourney.ts`、`useSkillCenter.ts`、`App.tsx`、`navigationSlice.ts` の 4 点を current code anchor として押さえる。

### ステップ2: P50 チェック（既実装状態の調査）

実装前に対象ファイルの現在の実装状態を確認し、新規実装 / 補完どちらのモードで進めるかを判定する。

```bash
# AgentView 側の状態アンカー確認
rg -n "selectedSkillName|skillExecutionStatus|recentExecutions|isExecuting" \
  apps/desktop/src/renderer/views/AgentView/index.tsx \
  apps/desktop/src/renderer/store/index.ts \
  apps/desktop/src/renderer/store/slices/agentSlice.ts

# SkillAnalysisView の現行 props / footer 確認
rg -n "onClose|skillName|footer|button" \
  apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx

# 既存 analyze handoff 確認
rg -n "handleAnalyzeSkill|setCurrentSkillName|setCurrentView\\(\"skillAnalysis\"" \
  apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts \
  apps/desktop/src/renderer/App.tsx \
  apps/desktop/src/renderer/store/slices/navigationSlice.ts
```

### ステップ3: 実行タスクを上から順に実施する

要件定義の実行タスクを上から順に処理し、スコープ、受入基準、除外範囲、system spec 参照先を成果物へ反映する。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

AgentView の CTA 表示条件、`selectedSkillName -> currentSkillName` handoff、SkillAnalysisView の `onClose` / 戻り導線の共存要件を明文化する。

## 多角的チェック観点

| 観点             | 適用判断                       | 仕様参照先                                                                 |
| ---------------- | ------------------------------ | -------------------------------------------------------------------------- |
| UI/UX            | フロントエンド実装が対象       | `aiworkflow-requirements: ui-ux-navigation.md`, `ui-ux-agent-execution.md` |
| アーキテクチャ   | 状態管理・handoff 設計が対象   | `aiworkflow-requirements: arch-state-management-*.md`                      |
| アクセシビリティ | UI 実装の場合 WCAG 2.1 AA 必須 | `aiworkflow-requirements: ui-ux-feature-components.md`                     |

## 成果物

| 成果物         | パス                                         | 内容                                                              |
| -------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・受入基準を整理する                          |
| スコープ定義   | `outputs/phase-1/scope-definition.md`        | 対象範囲・除外範囲・依存境界を明記する                            |
| 仕様抽出マップ | `outputs/phase-1/spec-extraction-map.md`     | aiworkflow-requirements の正本と current code anchor を対応付ける |

## 完了条件

- [ ] AgentView 側の state 責務（`selectedSkillName` / `skillExecutionStatus` / `recentExecutions`）が整理されている
- [ ] navigation 側の state 責務（`currentSkillName` / `viewHistory` / `currentView`）が整理されている
- [ ] SkillAnalysisView の現状 props と `onClose` 契約が確認されている
- [ ] SkillCenter 側の既存 analyze handoff が確認されている
- [ ] 因果ループ断絶3・断絶4 の根拠が要件として明文化されている
- [ ] AC-1〜AC-7 が検証可能な条件として定義されている
- [ ] aiworkflow-requirements の参照先が `spec-extraction-map.md` に固定されている
- [ ] 依存タスク（Task01/02/03）との責務境界が確定している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 2（設計）](./phase-2-design.md) に進む
