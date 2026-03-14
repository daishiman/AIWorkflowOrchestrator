# Phase 8 リファクタリングサマリー

## TASK-SKILL-LIFECYCLE-04 評価・採点ゲート機能

## リファクタリング判断結果

### 1. ScoreDisplay.tsx のローカル定義と @repo/shared の重複

**判断: 重複解消不要（共存が正しい設計）**

調査結果:

| 種別                                   | 定義場所                                                             | フィールド構成                                                                                   | 用途                                         |
| -------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| ScoreDisplay.tsx ローカル `ScoreDelta` | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx` L40-44 | `value: number`（絶対値）/ `direction: ScoreDeltaDirection` / `raw: number`（符号付き）          | ScoreDeltaBadge コンポーネントの UI 表示制御 |
| @repo/shared `ScoreDelta`              | `packages/shared/src/types/skill-improver.ts` L339-345               | `previousScore: number` / `newScore: number` / `delta: number`（符号付き） / `direction: string` | calculateScoreDelta 関数の返り値型（計算用） |

両者はフィールド構造が異なる別概念を表しており、互いに代替できない。重複ではなく、それぞれの責務に特化した独立した型定義。

- ScoreDisplay ローカル: `raw`（符号付き差分）と `value`（絶対値）を分離し、符号を `direction` の enum で管理。バッジ表示ラベル生成に特化
- @repo/shared: `previousScore` / `newScore` の両値を保持し、再計算可能。ゲートロジック層での使用に特化

**結論**: 変更なし。

### 2. getScoreGate / getScoreGateResult の責務分離

**判断: 分離済み（設計通り）**

`@repo/shared/src/types/skill-improver.ts` の実装:

```typescript
// 純粋関数1: スコア → ScoringGate（文字列型）
export function getScoreGate(score: number): ScoringGate {
  const s = normalizeScore(score);
  if (s === 100) return "RECOMMENDED";
  if (s >= 80) return "USE_ALLOWED";
  if (s >= 60) return "SAVE_ALLOWED";
  return "NEEDS_IMPROVEMENT";
}

// 純粋関数2: スコア → ScoringGateResult（UIフラグ込み）
// → getScoreGate を内部で呼び出す単方向依存
export function getScoreGateResult(score: number): ScoringGateResult {
  const gate = getScoreGate(score);
  return { gate, score: normalizeScore(score), canSave: ..., canUse: ..., isRecommended: ... };
}
```

- `getScoreGate`: ゲート名を返す最小責務
- `getScoreGateResult`: `getScoreGate` に委譲した後、UI 制御フラグを組み立てる拡張責務

責務分離は適切。UI 制御ロジックはゲート判定から切り離されている。

### 3. useSkillAnalysis フック — scoreDelta / scoreDirection 計算位置

**判断: useEffect 外で派生値計算（適切な設計）**

実装（`useSkillAnalysis.ts` L206-218）:

```typescript
// フック本体の return 直前で派生値を計算（副作用なし）
const scoreDelta: number | null =
  previousAnalysis != null && analysis != null
    ? analysis.overallScore - previousAnalysis.overallScore
    : null;
const scoreDirection: ScoreDirection | null = ...;
```

- `useState` を使わず、`previousAnalysis` と `analysis` から毎回派生計算する設計
- P48（useShallow 未適用による無限ループ）リスクなし（プリミティブ値のため）
- P31（合成Hook無限ループ）リスクなし（useEffect 依存配列に含めていない）

## 差分サマリー

| ファイル                                                               | 変更種別       | 内容                                                                                                                       |
| ---------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | 追加           | `previousAnalysis` / `scoreDelta` / `scoreDirection` / `evaluateError` / `isEvaluateError` / `handleEvaluatePrompt` の追加 |
| `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`          | 変更なし       | ローカル ScoreDelta は @repo/shared との重複ではなく共存が正しい                                                           |
| `packages/shared/src/types/skill-improver.ts`                          | 追加（既実装） | 採点ゲート型・純粋関数（L299-382）                                                                                         |

## 回帰検証結果

```
Test Files  3 passed (3)
     Tests  63 passed (63)

- scoring-gate.test.ts:          30 passed
- ScoreDisplay.test.tsx:         26 passed
- useSkillAnalysis-gate.test.ts:  7 passed
```

型チェック（tsc --noEmit）: エラーなし

## 技術的負債の記録

- `handleEvaluatePrompt` は `window.electronAPI` を直接呼び出している（TASK-10A-F で定めた Store 経由の原則から外れる）。今回のタスクスコープ（ゲート機能追加）では Store 統合まで踏み込まないため、未タスク候補として記録する
