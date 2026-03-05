# Phase 2 状態設計

## 状態変数

- `analysis: SkillAnalysis | null`
- `isAnalyzing: boolean`
- `isImproving: boolean`
- `selectedSuggestions: Set<number>`
- `error: string | null`
- `improvementResult: ImprovementResult | null` (追加)

## 遷移

1. 初期表示 -> `handleAnalyze()`
2. 選択適用:

- `applyImprovements` 実行
- `improvementResult` 設定
- 250ms待機
- `handleAnalyze()`
- 再分析完了後 `improvementResult = null`

3. 全自動改善:

- confirm
- `autoImprove` 実行
- 上記と同じ遷移

## 設計意図

- 再分析前に結果内訳を視認できる最小時間を確保
- 既存の分析/改善フローを壊さない

## 完了判定

- [x] イベント起点の状態遷移が明示されている
- [x] 表示タイミングと消去条件が定義されている
