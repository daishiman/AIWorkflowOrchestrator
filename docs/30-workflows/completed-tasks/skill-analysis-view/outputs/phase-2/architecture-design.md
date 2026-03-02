# アーキテクチャ設計: SkillAnalysisView

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-B |
| 作成日   | 2026-03-02 |
| Phase    | 2          |

## 1. コンポーネントツリー

```
SkillAnalysisView/                      # organism（メインコンテナ）
├── index.tsx                           # 状態管理ハブ、useSkillAnalysis呼び出し
├── components/
│   ├── ScoreDisplay/                   # molecule（スコア可視化）
│   │   ├── ScoreDisplay.tsx            # 総合スコア円形インジケータ + カテゴリ別バー
│   │   └── CategoryBar.tsx            # カテゴリ別水平バーチャート（内部コンポーネント）
│   ├── SuggestionList/                 # molecule（改善提案リスト）
│   │   ├── SuggestionList.tsx          # 優先度別グループ表示 + フィルタボタン
│   │   └── SuggestionItem.tsx         # 個別提案行（チェックボックス付）
│   ├── RiskPanel/                      # molecule（リスク情報）
│   │   ├── RiskPanel.tsx               # リスクパネルコンテナ
│   │   └── RiskItem.tsx               # 個別リスク行（レベル別色分け）
│   ├── AnalysisActions.tsx            # molecule（アクションボタン群）
│   ├── AnalysisHeader.tsx             # molecule（ヘッダー：戻るボタン＋タイトル）
│   └── AnalysisError.tsx              # molecule（エラー表示＋再試行ボタン）
├── hooks/
│   └── useSkillAnalysis.ts            # カスタムフック（ロジック分離）
└── __tests__/
    ├── SkillAnalysisView.test.tsx
    ├── ScoreDisplay.test.tsx
    ├── SuggestionList.test.tsx
    ├── RiskPanel.test.tsx
    ├── AnalysisActions.test.tsx
    ├── AnalysisError.test.tsx
    └── useSkillAnalysis.test.ts
```

### Atomic Design 層分類

| 層       | コンポーネント                                                                          | 数量 |
| -------- | --------------------------------------------------------------------------------------- | ---- |
| organism | SkillAnalysisView                                                                       | 1    |
| molecule | ScoreDisplay, SuggestionList, RiskPanel, AnalysisActions, AnalysisHeader, AnalysisError | 6    |
| atom級   | CategoryBar, SuggestionItem, RiskItem（molecule内部の子コンポーネント）                 | 3    |

## 2. 状態管理設計

### 2.1 状態一覧（useSkillAnalysis カスタムフック内の5つの useState）

| 状態名                | 型                      | 初期値      | 更新トリガー                                                    |
| --------------------- | ----------------------- | ----------- | --------------------------------------------------------------- |
| `analysis`            | `SkillAnalysis \| null` | `null`      | analyze完了時にデータ設定、再分析完了時に更新                   |
| `isAnalyzing`         | `boolean`               | `false`     | runAnalysis開始時にtrue、完了/エラー時にfalse                   |
| `isImproving`         | `boolean`               | `false`     | applySelected/autoImprove開始時にtrue、完了時にfalse            |
| `selectedSuggestions` | `Set<number>`           | `new Set()` | toggleSuggestion/selectAutoFixable操作、analyze完了時にリセット |
| `error`               | `string \| null`        | `null`      | APIエラー発生時にメッセージ設定、clearError/新規操作時にnull    |

### 2.2 状態配置の根拠

| 判断                          | 根拠                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| Zustand Store を使わない      | 単一画面で完結し、他コンポーネントとの状態共有が不要（03-state-management.md の配置原則準拠） |
| useState ベースのローカル状態 | コンポーネントのライフサイクルに紐づく一時的な分析データ                                      |
| カスタムフックに分離          | ロジック（API呼び出し・状態遷移）をUIから分離し、テスト容易性と再利用性を確保                 |
| P31対策不要                   | Zustandを使わないため、合成Hook無限ループの問題は構造的に発生しない                           |

### 2.3 状態遷移図

```
                         ┌──────────────────────────────────────────┐
                         │                                          │
[初期状態] ──runAnalysis()──→ [分析中] ──success──→ [分析完了]     │
 analysis=null                isAnalyzing=true       analysis=データ │
 isAnalyzing=false            error=null              isAnalyzing=false
 isImproving=false                │                        │
 error=null                       │ error                  │ toggle/select
                                  ↓                        │ autoFixable
                              [エラー]                     ↓
                              error=メッセージ        [選択操作中]
                              isAnalyzing=false        selectedSuggestions更新
                                  │                        │
                                  │ retry(clearError       │ applySelected() / autoImprove()
                                  │  + runAnalysis)        ↓
                                  │                   [改善適用中]
                                  └──→ [分析中]        isImproving=true
                                                           │
                                                           │ success → runAnalysis()
                                                           ↓
                                                      [再分析中] ──success──→ [分析完了]
                                                      isAnalyzing=true         analysis=新データ
                                                      isImproving=false        selectedSuggestions=空
```

### 2.4 状態遷移テーブル

| 状態       | isAnalyzing | isImproving | analysis  | selectedSuggestions | error      |
| ---------- | ----------- | ----------- | --------- | ------------------- | ---------- |
| 初期       | false       | false       | null      | 空Set               | null       |
| 分析中     | true        | false       | null/前回 | 前回のまま          | null       |
| 分析完了   | false       | false       | データ    | 空Set（リセット）   | null       |
| 選択操作中 | false       | false       | データ    | ユーザー選択        | null       |
| 改善適用中 | false       | true        | データ    | 前回のまま          | null       |
| 再分析中   | true        | false       | データ    | 前回のまま          | null       |
| エラー     | false       | false       | null/前回 | 前回のまま          | メッセージ |

## 3. データフロー

### 3.1 分析実行フロー

```
[Renderer]                     [Preload]                    [Main Process]
SkillAnalysisView               skill-api.ts                 IPC Handler
     │                              │                            │
     │── runAnalysis() ──→          │                            │
     │   setIsAnalyzing(true)       │                            │
     │   setError(null)             │                            │
     │                              │                            │
     │── analyze(skillName) ──→     │                            │
     │                              │── safeInvoke ────→         │
     │                              │   (SKILL_ANALYZE,          │
     │                              │    skillName)              │
     │                              │                            │── validateIpcSender()
     │                              │                            │── P42: 3段バリデーション
     │                              │                            │── SkillAnalyzer.analyze()
     │                              │                            │← SkillAnalysis
     │                              │← IpcResult<T> ────         │
     │← SkillAnalysis ──────       │                            │
     │   setAnalysis(result)        │                            │
     │   setSelectedSuggestions(∅)  │                            │
     │   setIsAnalyzing(false)      │                            │
```

### 3.2 改善適用フロー

```
[Renderer]                     [Preload]                    [Main Process]
SkillAnalysisView               skill-api.ts                 IPC Handler
     │                              │                            │
     │── applySelected() ──→       │                            │
     │   setIsImproving(true)       │                            │
     │                              │                            │
     │── applyImprovements ──→     │                            │
     │   (skillName, selected)      │── safeInvoke ────→         │
     │                              │   (SKILL_IMPROVE,          │
     │                              │    {skillName,suggestions}) │
     │                              │                            │── validateIpcSender()
     │                              │                            │── P42: 3段バリデーション
     │                              │                            │── SkillImprover.apply()
     │                              │                            │← ImprovementResult
     │                              │← IpcResult<T> ────         │
     │← ImprovementResult ────     │                            │
     │   → runAnalysis() (再分析)   │                            │
     │   setIsImproving(false)      │                            │
```

### 3.3 自動改善フロー

```
[Renderer]                     [Preload]                    [Main Process]
SkillAnalysisView               skill-api.ts                 IPC Handler
     │                              │                            │
     │── autoImprove() ──→         │                            │
     │   setIsImproving(true)       │                            │
     │                              │                            │
     │── autoImprove(skillName) →  │                            │
     │                              │── safeInvoke ────→         │
     │                              │   (SKILL_OPTIMIZE,         │
     │                              │    skillName)              │
     │                              │                            │── validateIpcSender()
     │                              │                            │── P42: 3段バリデーション
     │                              │                            │── SkillImprover.autoImprove()
     │                              │                            │← ImprovementResult
     │                              │← IpcResult<T> ────         │
     │← ImprovementResult ────     │                            │
     │   → runAnalysis() (再分析)   │                            │
     │   setIsImproving(false)      │                            │
```

## 4. レイヤー依存方向

```
Renderer (SkillAnalysisView)
    ↓ window.electronAPI.skill.analyze / applyImprovements / autoImprove
Preload (skill-api.ts: safeInvoke + IPC_CHANNELS定数)
    ↓ IPC Channel (skill:analyze / skill:improve / skill:optimize)
Main Process (IPC Handler: validateIpcSender + P42バリデーション)
    ↓ DI (Constructor / Setter Injection)
SkillAnalyzer / SkillImprover (Service Layer)
```

依存は上位 → 下位の一方向のみ（01-architecture.md 準拠）。Renderer から Node.js API を直接使用しない。全 IPC 通信は Preload Bridge（contextBridge + safeInvoke）を経由する。

## 5. IPC連携設計

### 5.1 チャネル定義

3チャネルは TASK-9C で `channels.ts` に定義済み・`ALLOWED_INVOKE_CHANNELS` に登録済み:

| チャネル名     | 定数名                      | 方向            | バリデーション    |
| -------------- | --------------------------- | --------------- | ----------------- |
| skill:analyze  | IPC_CHANNELS.SKILL_ANALYZE  | Renderer → Main | P42準拠3段        |
| skill:improve  | IPC_CHANNELS.SKILL_IMPROVE  | Renderer → Main | P42準拠3段 + 配列 |
| skill:optimize | IPC_CHANNELS.SKILL_OPTIMIZE | Renderer → Main | P42準拠3段        |

### 5.2 IPC契約（P44/P45準拠）

| レイヤー | skill:analyze | skill:improve                                      | skill:optimize |
| -------- | ------------- | -------------------------------------------------- | -------------- |
| Preload  | `string`      | `{ skillName: string, suggestions: Suggestion[] }` | `string`       |
| Main     | `string`      | `{ skillName: string, suggestions: Suggestion[] }` | `string`       |
| 引数名   | skillName     | args.skillName / args.suggestions                  | skillName      |
| 整合性   | 一致          | 一致                                               | 一致           |

全チャネルで Preload API の引数形式と Main Handler の期待形式が完全に一致している。引数名のセマンティクスも実際に渡される値（スキル名）と一致している（P45対策）。
