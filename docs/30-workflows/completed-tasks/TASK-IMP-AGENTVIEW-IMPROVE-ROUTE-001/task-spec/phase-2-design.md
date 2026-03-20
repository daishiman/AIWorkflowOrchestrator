# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 2                                    |
| Phase 名   | 設計                                 |
| タスクID   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| 前提 Phase | Phase 1（要件定義）                  |
| 後続 Phase | Phase 3（設計レビュー）              |
| ステータス | not_started                          |
| 作成日     | 2026-03-17                           |
| 機能名     | agentview-improve-route              |

## 目的

AgentView の改善 CTA 追加と SkillAnalysisView の Agent 起点戻り導線追加について、現行 code anchor と system spec に整合した実装設計を確定する。コンポーネント props、handoff state、遷移フロー、UI レイアウトを決定する。

## 実行タスク

- コンポーネント prop 設計: SkillAnalysisView に追加する `onNavigateBack` / `onNavigateToAgent` の型、表示条件、既存 `onClose` との共存を設計する
- 遷移フロー設計: `selectedSkillName -> currentSkillName -> skillAnalysis` の handoff と Agent への戻りを設計する
- 状態管理設計: `agentSlice` と `navigationSlice` の責務境界を崩さずに entry source を扱う方法を設計する
- UI レイアウト設計: AgentView の CTA バナーと SkillAnalysisView の追加アクションの配置を設計する

## 設計方針

- AgentView 側の実行状態は既存 `agentSlice`（`selectedSkillName` / `skillExecutionStatus` / `recentExecutions` / `isExecuting`）から導出する。persist 前提の `isExecutionComplete` は新設しない
- `currentSkillName` は `navigationSlice` の正本とし、AgentView から `skillAnalysis` に入るときは `selectedSkillName` を正規化して `setCurrentSkillName()` へ渡す
- `onNavigateBack` / `onNavigateToAgent` は SkillAnalysisView の既存 `onClose` と共存し、App.tsx 側で `viewHistory` を見て注入する
- `previousView` は現状未実装なので前提にしない。戻り導線は既存 `viewHistory` / `goBack()` を第一候補とし、新規 state は既存 navigation stack で表現できない場合だけ検討する
- P31 対策として、state / action は個別セレクタで取得する

## コンポーネント設計

### AgentView 実行後 CTA

**表示条件**:

```typescript
const canOfferAnalysis =
  selectedSkillName.trim().length > 0 &&
  skillExecutionStatus === "completed" &&
  !isExecuting;
```

`recentExecutions` は「直近実行が現在の選択スキルと一致しない」実測ギャップが確認された場合だけ補助判定に使う。

**非表示条件**: スキル未選択 / 空文字 / 空白のみ / 実行中 / 実行結果未成立。

### SkillAnalysisView props

```typescript
interface SkillAnalysisViewProps {
  skillName: string;
  onClose: () => void;
  onNavigateBack?: () => void;
  onNavigateToAgent?: () => void;
}
```

`onNavigateBack` / `onNavigateToAgent` はオプション prop にする。SkillCenter と DetailPanel の既存呼び出し元では未注入とし、Agent 起点のときだけ表示する。`onClose` は常に残し、canonical close 契約を壊さない。

### SkillAnalysisView レイアウト

- ヘッダー左に `onNavigateBack` があるときだけ戻るリンクを表示する
- 既存 footer の右端に `onNavigateToAgent` を追加し、`選択を適用` / `全自動改善` と競合しない配置にする
- 追加 UI は既存 CSS 変数トークンを使い、色のハードコードを避ける

## 状態管理設計

### state ownership

| concern                        | 正本 state                                                  | 現行実装          | 今回の扱い                                              |
| ------------------------------ | ----------------------------------------------------------- | ----------------- | ------------------------------------------------------- |
| Agent で選択中のスキル名       | `selectedSkillName`                                         | `agentSlice`      | CTA 表示条件の入力に使う                                |
| Agent の実行状態               | `skillExecutionStatus` / `recentExecutions` / `isExecuting` | `agentSlice`      | CTA 表示条件を導出する                                  |
| `skillAnalysis` へ渡すスキル名 | `currentSkillName`                                          | `navigationSlice` | Agent から遷移する直前に設定する                        |
| 現在 view / 履歴               | `currentView` / `viewHistory`                               | `navigationSlice` | 戻り導線の判定に使う                                    |
| Agent 起点かどうか             | `viewHistory` / `goBack()`                                  | `navigationSlice` | `skillAnalysis` 直前の履歴が `agent` かどうかで判定する |

### 推奨案

1. `selectedSkillName` は追加しない
2. `isExecutionComplete` は追加しない
3. `currentSkillName` を遷移 payload の正本にする
4. Agent 起点判定は `viewHistory` の直前 view を使う
5. 新規 entry source state は追加しない

### 個別セレクタ例

```typescript
const setCurrentView = useSetCurrentView();
const setCurrentSkillName = useSetCurrentSkillName();
const selectedSkillName = useSelectedSkillName();
const skillExecutionStatus = useSkillExecutionStatus();
const isExecuting = useIsSkillExecuting();
const recentExecutions = useRecentExecutions();
```

## 遷移フロー設計

```text
[AgentView]
  selectedSkillName / skillExecutionStatus / recentExecutions を確認
    ↓ canOfferAnalysis === true
  改善 CTA バナーを表示
    ↓ CTA クリック
  setCurrentSkillName(normalizedSelectedSkillName)
  setCurrentView("skillAnalysis")
    ↓
[SkillAnalysisView]
  onClose: 既存通り skillCenter へ close
  onNavigateBack: 直前 view が agent のときだけ goBack()
  onNavigateToAgent: Agent 起点のときだけ setCurrentView("agent")
  currentSkillName は維持
```

### App.tsx での注入方針

```tsx
case "skillAnalysis":
  return (
    <SkillAnalysisView
      skillName={currentSkillName ?? "demo-skill"}
      onClose={() => {
        setCurrentView("skillCenter");
        setCurrentSkillName(null);
      }}
      onNavigateBack={previousView === "agent" ? () => goBack() : undefined}
      onNavigateToAgent={previousView === "agent" ? () => setCurrentView("agent") : undefined}
    />
  );
```

`previousView` という新規 state は追加しない。`viewHistory.at(-2)` 相当の既存履歴から前画面を判定する。

## UI/UX リアライズ

| 観点             | 内容                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| 改善 CTA バナー  | AgentView の実行結果エリア直下に配置し、既存レイアウトを壊さない               |
| CTA ラベル       | 「スキルを分析・改善する」                                                     |
| 戻るリンク       | SkillAnalysisView ヘッダー左に配置し、`onNavigateBack` がある場合のみ表示      |
| 再実行ボタン     | 既存フッターの右端に追加し、`選択を適用` / `全自動改善` と競合しない配置にする |
| 表示条件         | Agent 起点で `onNavigateBack` / `onNavigateToAgent` が注入された場合のみ表示   |
| アニメーション   | CTA バナーは 200-300ms の軽い opacity 変化に留める                             |
| アクセシビリティ | CTA / 戻るリンク / 再実行ボタンに `aria-label` を付与し、Tab 到達可能にする    |

## 参照資料

| 参照資料              | パス                                                                      | 内容                                          |
| --------------------- | ------------------------------------------------------------------------- | --------------------------------------------- |
| Phase 1（要件定義）   | `phase-1-requirements.md`                                                 | 依存する前提成果物を確認する                  |
| AgentView             | `apps/desktop/src/renderer/views/AgentView/index.tsx`                     | 実行後 UI の現状コードを確認する              |
| SkillAnalysisView     | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`        | 既存 prop を確認し拡張点を確定する            |
| App.tsx               | `apps/desktop/src/renderer/App.tsx`                                       | renderView の `skillAnalysis` case 設計に使う |
| navigationSlice       | `apps/desktop/src/renderer/store/slices/navigationSlice.ts`               | 状態管理の拡張設計に使う                      |
| SkillCenter handoff   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | 既存 analyze handoff との整合に使う           |
| skillLifecycleJourney | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | Agent responsibility の正本契約に使う         |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                                                | 内容                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 利用導線正本         | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`         | Agent 実行後の改善導線正本                       |
| routing 基盤正本     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-routing-render-view-foundation.md`      | `currentSkillName` / renderView 契約             |
| Agent 実行面仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                        | Agent UI 責務                                    |
| ナビゲーション正本   | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                             | ViewType / `skillAnalysis` close 契約            |
| 機能別コンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                     | SkillCenter / AgentView / SkillAnalysisView 仕様 |
| 状態管理正本         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                   | navigation ownership                             |
| handoff 参照         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | SkillCenter analyze handoff                      |

## 実行手順

### ステップ1: 参照資料を確認する

Phase 1 の成果物と current code anchor を確認し、設計の前提を固める。

### ステップ2: 実行タスクを上から順に実施する

コンポーネント props 設計 -> handoff state 設計 -> 遷移フロー設計 -> UI レイアウト設計の順に実施する。存在しない state 名を前提にしない。

### ステップ3: system spec との整合を確認する

`currentSkillName`、`skillAnalysis` close、Agent responsibility、SkillCenter analyze handoff のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、Phase 3 レビューへの handoff を確認して記録する。

## 統合テスト連携

AgentView の CTA 表示条件、`selectedSkillName -> currentSkillName` handoff、SkillAnalysisView の props 拡張と既存 `onClose` 契約が Phase 1 の要件と整合するかを確認する。

## 成果物

| 成果物             | パス                                         | 内容                                                             |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------------- |
| 設計サマリー       | `outputs/phase-2/design-summary.md`          | props 設計・遷移フロー・状態管理方針を整理する                   |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | SkillAnalysisView props 拡張・AgentView CTA 設計を記録する       |
| 状態遷移設計       | `outputs/phase-2/state-transition-design.md` | `agentSlice` / `navigationSlice` / entry source の責務を記録する |
| UI/UX 設計         | `outputs/phase-2/ui-ux-realization.md`       | CTA バナー・戻るリンク・再実行ボタンのレイアウトを記録する       |

## 完了条件

- [ ] SkillAnalysisView の props 拡張設計（`onNavigateBack` / `onNavigateToAgent`）が確定している
- [ ] AgentView の改善 CTA 表示条件が既存 state に基づいて設計されている
- [ ] 遷移フロー（AgentView -> SkillAnalysis -> AgentView）全体が設計されている
- [ ] `currentSkillName` を正本とする handoff 方針が確定している
- [ ] entry source の扱い（追加 state or handler 注入）が確定している
- [ ] P31 対策（個別セレクタ使用）が設計に反映されている
- [ ] AC-6（スキル未実行時は CTA 非表示）の実装方針が設計されている
- [ ] `onClose -> skillCenter` 契約を壊さないことが設計に明記されている
- [ ] Apple HIG 準拠の UI レイアウトが設計されている（AC-7）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
