# Phase 4 テスト仕様

## 対象

- `SkillAnalysisView`
- `useSkillAnalysis`
- `ImprovementResultBreakdown`

## 重点観点

- 内訳表示(成功/スキップ/失敗)
- 再分析呼び出し
- 再分析完了後のパネル消去
- a11y属性(`role=status`,`aria-live`)

## フィクスチャ方針

- `createMockImprovementResult` を基準
- `applied/skipped/errors` をケースごとに上書き
- 既存 `createMockAnalysis` を再利用

## 実装済み差分テスト

- `SkillAnalysisView.test.tsx` に `改善結果内訳パネルを表示して再分析後に閉じる` を追加
- 既存再分析テストを呼び出し回数基準で安定化

## 完了判定

- [x] 対象/期待値/フィクスチャ方針が明文化されている
