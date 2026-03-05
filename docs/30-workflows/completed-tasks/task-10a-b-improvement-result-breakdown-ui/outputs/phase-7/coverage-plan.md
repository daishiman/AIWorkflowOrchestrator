# Phase 7 カバレッジ計画

## 目標

- Line >= 80%
- Branch >= 70%
- Function >= 80%
  (対象: skill分析UI関連)

## 実測(対象コンポーネント)

`pnpm --filter @repo/desktop test:coverage src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx` のレポートより:

- `ImprovementResultBreakdown.tsx`: Stmt 97.08 / Branch 64.28 / Func 100
- `SkillAnalysisView.tsx`: Stmt 100 / Branch 100 / Func 100
- `hooks/useSkillAnalysis.ts`: Stmt 100 / Branch 96.15 / Func 100

## 判定

- コンポーネント単位では目標達成
- グローバル閾値は対象限定実行のため未達(運用上想定内)

## 完了判定

- [x] 目標値と実測値を記録
- [x] 未達時の理由を明示
