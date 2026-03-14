# Phase 6 回帰テストマトリクス

## TASK-SKILL-LIFECYCLE-04 評価・採点ゲート機能

## 追加テストケース一覧

### scoring-gate.test.ts — calculateScoreDelta 境界値テスト（8件追加）

| テスト ID   | 対象                        | 期待結果                             | 結果 |
| ----------- | --------------------------- | ------------------------------------ | ---- |
| UT-DELTA-01 | calculateScoreDelta(60, 85) | delta=+25, direction="up"            | PASS |
| UT-DELTA-02 | calculateScoreDelta(80, 82) | delta=+2, direction="neutral"        | PASS |
| UT-DELTA-03 | calculateScoreDelta(75, 75) | delta=0, direction="neutral"         | PASS |
| UT-DELTA-04 | calculateScoreDelta(80, 78) | delta=-2, direction="neutral"        | PASS |
| UT-DELTA-05 | calculateScoreDelta(80, 50) | delta=-30, direction="down"          | PASS |
| UT-DELTA-06 | calculateScoreDelta(77, 80) | delta=+3, direction="up"（境界値）   | PASS |
| UT-DELTA-07 | calculateScoreDelta(80, 77) | delta=-3, direction="down"（境界値） | PASS |
| UT-DELTA-08 | calculateScoreDelta(0, 105) | newScore=100, delta=100（クランプ）  | PASS |

### ScoreDisplay.test.tsx — ScoreDeltaBadge テスト（4件追加）

| テスト ID | 対象                                | 期待結果                               | 結果 |
| --------- | ----------------------------------- | -------------------------------------- | ---- |
| SDB-01    | ScoreDeltaBadge delta=null          | 何もレンダリングしない                 | PASS |
| SDB-02    | ScoreDeltaBadge direction="up"      | 上昇バッジ（+15点向上）、success背景色 | PASS |
| SDB-03    | ScoreDeltaBadge direction="neutral" | 変化なしバッジ、tertiary背景色         | PASS |
| SDB-04    | ScoreDeltaBadge direction="down"    | 低下バッジ（-10点低下）、error背景色   | PASS |

### ScoreDisplay.test.tsx — calculateScoreDelta (ローカル) テスト（5件追加）

| テスト ID | 対象                                             | 期待結果                               | 結果 |
| --------- | ------------------------------------------------ | -------------------------------------- | ---- |
| CSD-01    | calculateScoreDelta(85, 60)                      | raw=+25, direction="up"                | PASS |
| CSD-02    | calculateScoreDelta(82, 80)                      | raw=+2, direction="neutral"            | PASS |
| CSD-03    | calculateScoreDelta(50, 80)                      | raw=-30, direction="down"              | PASS |
| CSD-04    | ScoreDisplay with previousAnalysis (score 60→85) | ScoreDeltaBadge aria-label "+25点向上" | PASS |
| CSD-05    | ScoreDisplay with previousAnalysis=null          | ScoreDeltaBadge 非表示                 | PASS |

## テスト実行サマリー

| ファイル                      | 元テスト数 | 追加テスト数 | 合計   | 結果       |
| ----------------------------- | ---------- | ------------ | ------ | ---------- |
| scoring-gate.test.ts          | 22         | 8            | 30     | 全PASS     |
| ScoreDisplay.test.tsx         | 17         | 9            | 26     | 全PASS     |
| useSkillAnalysis-gate.test.ts | 7          | 0            | 7      | 全PASS     |
| **合計**                      | **46**     | **17**       | **63** | **全PASS** |

## 実行コマンドと結果

```
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/scoring-gate.test.ts \
  src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis-gate.test.ts

Test Files  3 passed (3)
     Tests  63 passed (63)
  Duration  2.31s
```
