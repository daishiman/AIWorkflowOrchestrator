# Phase 2: 状態遷移設計

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## state ownership（変更なし）

| concern                      | 正本 state                             | slice             | 今回の扱い                                       |
| ---------------------------- | -------------------------------------- | ----------------- | ------------------------------------------------ |
| Agent で選択中のスキル名     | `selectedSkillName`                    | `agentSlice`      | CTA 表示条件の入力。変更なし                     |
| Agent の実行状態             | `skillExecutionStatus` / `isExecuting` | `agentSlice`      | CTA 表示条件を導出。変更なし                     |
| skillAnalysis へ渡すスキル名 | `currentSkillName`                     | `navigationSlice` | Agent から遷移する直前に設定。既存アクション使用 |
| 現在 view / 履歴             | `currentView` / `viewHistory`          | `navigationSlice` | 戻り導線の判定に使用。変更なし                   |

## 新規 state: なし

以下の state は追加しない:

- `previousView` - `viewHistory[length-2]` で代替
- `isExecutionComplete` - `skillExecutionStatus === "completed"` で代替
- `entrySource` - `viewHistory` で判定可能

## 状態遷移図

### シナリオ1: AgentView -> SkillAnalysisView (正常系)

```
初期状態:
  agentSlice: { selectedSkillName: "my-skill", skillExecutionStatus: "completed", isExecuting: false }
  navigationSlice: { currentView: "agent", viewHistory: ["dashboard", "agent"], currentSkillName: null }

CTA クリック:
  1. setCurrentSkillName("my-skill")
     -> { currentSkillName: "my-skill" }
  2. setCurrentView("skillAnalysis")
     -> { currentView: "skillAnalysis", viewHistory: ["dashboard", "agent", "skillAnalysis"] }

結果:
  SkillAnalysisView が skillName="my-skill" で描画
  viewHistory[length-2] === "agent" -> isFromAgent === true
  onNavigateBack / onNavigateToAgent が注入される
```

### シナリオ2: SkillAnalysisView -> AgentView (戻り)

```
初期状態:
  navigationSlice: { currentView: "skillAnalysis", viewHistory: ["dashboard", "agent", "skillAnalysis"], currentSkillName: "my-skill" }

onNavigateBack (goBack()) クリック:
  1. goBack()
     -> viewHistory: ["dashboard", "agent"]
     -> currentView: "agent"
  2. currentSkillName は変更しない（"my-skill" のまま）

結果:
  AgentView が再表示
  selectedSkillName は "my-skill" のまま維持（agentSlice は変更なし）
  currentSkillName も "my-skill" のまま（次回 skillAnalysis 遷移時に上書き可能）
```

### シナリオ3: SkillAnalysisView -> AgentView (再実行)

```
初期状態:
  navigationSlice: { currentView: "skillAnalysis", viewHistory: ["dashboard", "agent", "skillAnalysis"], currentSkillName: "my-skill" }

onNavigateToAgent クリック:
  1. setCurrentView("agent")
     -> viewHistory: ["dashboard", "agent", "skillAnalysis", "agent"]
     -> currentView: "agent"

結果:
  AgentView が再表示
  selectedSkillName は維持（agentSlice は変更なし）
  viewHistory に新しい "agent" エントリが追加（再実行は「新しい遷移」）
```

### シナリオ4: SkillAnalysisView -> SkillCenter (canonical close)

```
初期状態:
  navigationSlice: { currentView: "skillAnalysis", viewHistory: ["dashboard", "agent", "skillAnalysis"], currentSkillName: "my-skill" }

onClose クリック:
  1. setCurrentView("skillCenter")
     -> viewHistory: ["dashboard", "agent", "skillAnalysis", "skillCenter"]
     -> currentView: "skillCenter"
  2. setCurrentSkillName(null)
     -> currentSkillName: null

結果:
  SkillCenterView が表示（既存通り）
  currentSkillName がクリアされる（既存通り）
```

### シナリオ5: 非 Agent 起点（SkillCenter -> SkillAnalysisView）

```
初期状態:
  navigationSlice: { currentView: "skillCenter", viewHistory: ["dashboard", "skillCenter"], currentSkillName: null }

handleAnalyzeSkill("my-skill"):
  1. setCurrentSkillName("my-skill")
  2. setCurrentView("skillAnalysis")
     -> viewHistory: ["dashboard", "skillCenter", "skillAnalysis"]

結果:
  viewHistory[length-2] === "skillCenter" -> isFromAgent === false
  onNavigateBack / onNavigateToAgent は undefined（未注入）
  onClose のみ表示（既存通り）
```

## 個別セレクタ使用マップ

### AgentView で使用するセレクタ

| セレクタ                                  | P31 安全性                     | 用途         |
| ----------------------------------------- | ------------------------------ | ------------ |
| `useSelectedSkillName()`                  | 個別セレクタ済み               | CTA 表示条件 |
| `useSkillExecutionStatus()`               | 個別セレクタ済み               | CTA 表示条件 |
| `useIsSkillExecuting()`                   | 個別セレクタ済み               | CTA 表示条件 |
| `useAppStore(s => s.setCurrentView)`      | Zustand アクション（安定参照） | handoff      |
| `useAppStore(s => s.setCurrentSkillName)` | Zustand アクション（安定参照） | handoff      |

### App.tsx で使用するセレクタ

| セレクタ                          | P31 安全性                   | 用途           |
| --------------------------------- | ---------------------------- | -------------- |
| `useAppStore(s => s.viewHistory)` | プリミティブ配列（新規追加） | Agent 起点判定 |
| `useGoBack()`                     | 個別セレクタ済み             | 戻り導線       |
