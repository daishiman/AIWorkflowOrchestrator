# TASK-10A-F 状態遷移図

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| タスクID | TASK-10A-F                    |
| 機能名   | Store駆動ライフサイクルUI統合 |
| Phase    | 2 - 設計                      |
| 作成日   | 2026-03-07                    |

## useSkillAnalysis 状態遷移図

### 全体遷移フロー

```
                        ┌──────────────────────────────────┐
                        │           初期状態               │
                        │  analysis=null                   │
                        │  isAnalyzing=false               │
                        │  isImproving=false               │
                        │  error=null                      │
                        │  selectedSuggestions=Set()        │
                        │  improvementResult=null           │
                        └──────────┬───────────────────────┘
                                   │
                        useEffect マウント時
                        handleAnalyze() 自動呼び出し
                                   │
                                   v
                        ┌──────────────────────────────────┐
                        │          分析中                   │
                        │  isAnalyzing=true (store)        │
                        │  error=null (store)              │
                        └──────────┬───────────────────────┘
                                   │
                          ┌────────┴────────┐
                          │                 │
                       成功              失敗
                          │                 │
                          v                 v
           ┌──────────────────────┐  ┌──────────────────────┐
           │     分析完了         │  │     エラー           │
           │ analysis=結果(store) │  │ error=メッセージ     │
           │ isAnalyzing=false    │  │   (store)            │
           │ selectedSuggestions  │  │ isAnalyzing=false    │
           │   =new Set()         │  │ analysis=null(store) │
           └──────────┬───────────┘  └──────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
   提案選択/解除   選択改善適用  全自動改善
   (ローカル)      ボタン        ボタン
          │           │           │
          v           v           v
   ┌────────────┐ ┌──────────┐ ┌──────────────────┐
   │ToggleSugg. │ │改善適用中│ │確認ダイアログ    │
   │ selected   │ │isImproving│ │window.confirm()  │
   │ Suggestions│ │ =true    │ │                  │
   │ 更新       │ │ (store)  │ │ OK → 改善適用中  │
   │(ローカル)  │ │          │ │ Cancel → 戻る   │
   └────────────┘ └────┬─────┘ └────────┬─────────┘
                       │                │
                  ┌────┴────┐      ┌────┴────┐
                  │        │      │        │
               成功     失敗   成功     失敗
                  │        │      │        │
                  v        v      v        v
          ┌──────────┐ ┌─────┐ ┌──────────┐ ┌─────┐
          │再分析    │ │error│ │再分析    │ │error│
          │自動実行  │ │設定 │ │自動実行  │ │設定 │
          │(store内) │ │     │ │(store内) │ │     │
          │→分析完了 │ │     │ │→分析完了 │ │     │
          │ に戻る   │ │     │ │ に戻る   │ │     │
          └──────────┘ └─────┘ └──────────┘ └─────┘
```

### 状態管理の責任分担

```
┌─────────────────────────────────────────────────────────┐
│                    agentSlice (store)                    │
│                                                         │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐          │
│  │currentAnaly-│  │isAnalyz- │  │isImprov- │          │
│  │sis          │  │ingSkill  │  │ingSkill  │          │
│  │             │  │          │  │          │          │
│  │SkillAnalysis│  │ boolean  │  │ boolean  │          │
│  │ | null      │  │          │  │          │          │
│  └─────────────┘  └──────────┘  └──────────┘          │
│                                                         │
│  ┌─────────────┐                                        │
│  │skillError   │                                        │
│  │             │                                        │
│  │string | null│                                        │
│  └─────────────┘                                        │
│                                                         │
│  [アクション]                                           │
│  analyzeSkill() / applySkillImprovements()              │
│  autoImproveSkill() / createSkill()                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              useSkillAnalysis (ローカル)                 │
│                                                         │
│  ┌──────────────────┐  ┌────────────────────┐          │
│  │selectedSuggestions│  │improvementResult   │          │
│  │                  │  │                    │          │
│  │ Set<number>      │  │ImprovementResult   │          │
│  │                  │  │ | null             │          │
│  └──────────────────┘  └────────────────────┘          │
│                                                         │
│  [ローカルハンドラ]                                     │
│  handleToggleSuggestion() / handleSelectAutoFixable()   │
└─────────────────────────────────────────────────────────┘
```

## SkillCreateWizard 状態遷移図

```
┌────────────────────────────────────┐
│  Step 0: 説明入力                  │
│  idle 状態                         │
│  isGenerating=false                │
│  error=null                        │
│  skillPath=null                    │
└──────────────┬─────────────────────┘
               │
       「次へ」→ Step 1 (設定)
       「生成」ボタンクリック
               │
               v
┌────────────────────────────────────┐
│  Step 2: 生成中                    │
│  loading 状態                      │
│  goToStep(2)                       │
│  isGenerating=true                 │
│  error=null                        │
│                                    │
│  createSkill(description, options) │
│  ← store action 経由              │
└──────────────┬─────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
   成功              失敗
   (resultPath       (例外 or
    truthy)           falsy)
      │                 │
      v                 v
┌──────────────┐  ┌──────────────────────┐
│ Step 3: 完了 │  │ Step 2: エラー表示   │
│ success 状態 │  │ error 状態           │
│              │  │                      │
│ skillPath=   │  │ error=Error(         │
│  resultPath  │  │  "スキル生成に       │
│ goToStep(3)  │  │   失敗しました")     │
│              │  │ isGenerating=false   │
│ isGenerating │  │                      │
│  =false      │  │ [リトライ可能]       │
└──────────────┘  └──────────────────────┘
```

### SkillCreateWizard の状態管理

```
┌─────────────────────────────────────────────────────────┐
│            SkillCreateWizard (全てローカル)              │
│                                                         │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐          │
│  │description  │  │options   │  │currentStep│          │
│  │ string      │  │WizardOpts│  │ number   │          │
│  └─────────────┘  └──────────┘  └──────────┘          │
│                                                         │
│  ┌─────────────┐  ┌──────────┐  ┌──────────┐          │
│  │isGenerating │  │error     │  │skillPath │          │
│  │ boolean     │  │Error|null│  │string|null│          │
│  └─────────────┘  └──────────┘  └──────────┘          │
│                                                         │
│  [store セレクタ]                                       │
│  useCreateSkill() → createSkill 関数                    │
└─────────────────────────────────────────────────────────┘
```

## 競合状態の考慮

### useSkillAnalysis での競合

| シナリオ                             | 発生条件                              | 対処                                                      |
| ------------------------------------ | ------------------------------------- | --------------------------------------------------------- |
| 分析中に改善適用を実行               | `isAnalyzing=true` 時に改善ボタン押下 | store action 側で排他制御（isAnalyzing チェック）         |
| 改善適用中に再分析を実行             | `isImproving=true` 時に分析ボタン押下 | store action 側で排他制御（isImproving チェック）         |
| 分析中にコンポーネントがアンマウント | ナビゲーション遷移                    | `isMountedRef` でローカル状態更新をスキップ               |
| 連続した分析リクエスト               | skillName 変更による useEffect 再実行 | store action が前回リクエストを上書き（最新結果のみ保持） |

### SkillCreateWizard での競合

| シナリオ                   | 発生条件                           | 対処                                                     |
| -------------------------- | ---------------------------------- | -------------------------------------------------------- |
| 生成中に再度生成ボタン押下 | `isGenerating=true` 時にボタン押下 | UI 側で `isGenerating` 時にボタンを disabled にする      |
| 生成中にウィザードを閉じる | `onClose` 呼び出し                 | コンポーネントアンマウントで非同期処理の結果は無視される |
