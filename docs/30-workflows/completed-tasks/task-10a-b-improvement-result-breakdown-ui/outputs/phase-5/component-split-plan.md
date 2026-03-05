# Phase 5 コンポーネント分割計画・実施結果

## 責務分離

- `useSkillAnalysis`: 改善実行後の結果状態管理と再分析導線
- `ImprovementResultBreakdown`: 表示専用(入力は `ImprovementResult`)
- `SkillAnalysisView`: レイアウトとコンポーネント合成

## 分離理由

- 表示責務と状態遷移責務を分けてテスト容易性を上げる
- 結果内訳UIを将来再利用可能なmoleculeに固定

## 再利用方針

- `ImprovementResultBreakdown` は他画面でも `ImprovementResult` を渡せば再利用可能

## 完了判定

- [x] view/molecule/hooks の責務境界を維持
