# Phase 2: 設計サマリー

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## 設計方針

### 原則

1. 既存 state で全てを表現する。新規 persistent state は追加しない
2. `onClose` は canonical close 契約として不変。`onNavigateBack` / `onNavigateToAgent` は contextual navigation として共存
3. Agent 起点判定は `viewHistory` の末尾から2番目の要素で行う
4. P31 対策として個別セレクタを使用。`setCurrentView` / `setCurrentSkillName` はインラインセレクタ（App.tsx 既存パターン準拠）
5. P42 対策として `selectedSkillName.trim()` してから handoff

### 変更ファイル一覧

| ファイル                | 変更概要                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `SkillAnalysisView.tsx` | Props に `onNavigateBack?` / `onNavigateToAgent?` 追加。ヘッダー左に戻りリンク、フッター右端に再実行ボタン |
| `AgentView/index.tsx`   | 改善 CTA バナー追加。`canOfferAnalysis` 導出。handoff ロジック                                             |
| `App.tsx`               | `skillAnalysis` case で `viewHistory` ベースの Agent 起点判定と prop 注入                                  |

## 遷移フロー

```
[AgentView]
  selectedSkillName / skillExecutionStatus / isExecuting を確認
    | canOfferAnalysis === true
  改善 CTA バナーを表示（200ms fade-in）
    | CTA クリック
  setCurrentSkillName(selectedSkillName.trim())
  setCurrentView("skillAnalysis")
    | viewHistory: [..., "agent", "skillAnalysis"]
    v
[SkillAnalysisView]
  onClose: setCurrentView("skillCenter") + setCurrentSkillName(null) (既存通り)
  onNavigateBack: goBack() -> viewHistory pop -> AgentView に戻る
  onNavigateToAgent: setCurrentView("agent") -> AgentView に新規遷移
```

## Agent 起点判定ロジック

```typescript
// App.tsx 内で viewHistory を取得
const viewHistory = useAppStore((state) => state.viewHistory);
const goBack = useGoBack();

// skillAnalysis case 内で判定
const previousView = Array.isArray(viewHistory)
  ? viewHistory[viewHistory.length - 2]
  : undefined;
const isFromAgent = previousView === "agent";
```

## Props / handoff 設計決定

| 決定事項       | 採択案                                                                          | 却下案                    | 理由                                                                 |
| -------------- | ------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------- |
| Agent 起点判定 | `viewHistory[length-2]`                                                         | `previousView` state 新設 | 既存 `viewHistory` で十分。新規 state 不要                           |
| 戻り導線       | `onNavigateBack` + `goBack()`                                                   | `onClose` 変更            | `onClose -> skillCenter` 契約を壊さない                              |
| 再実行導線     | `onNavigateToAgent` + `setCurrentView("agent")`                                 | Agent への直接 goBack     | 再実行は「新しい遷移」であり、history pop ではない                   |
| CTA 表示条件   | `selectedSkillName.trim().length > 0 && status === "completed" && !isExecuting` | `recentExecutions` ベース | シンプルで直接的。`recentExecutions` は補助                          |
| セレクタ方式   | 既存個別セレクタ + インラインセレクタ                                           | 個別セレクタ新設          | `setCurrentView` / `setCurrentSkillName` は App.tsx 既存パターン準拠 |
