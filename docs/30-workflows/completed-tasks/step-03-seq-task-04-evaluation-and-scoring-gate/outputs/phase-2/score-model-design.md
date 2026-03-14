# スコア算出モデル設計書

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-04                       |
| Phase        | 2（設計）                                     |
| 文書種別     | SubAgent-A 成果物（スコアモデル設計）         |
| 参照元型定義 | `packages/shared/src/types/skill-improver.ts` |
| 追加先型定義 | `packages/shared/src/types/skill-improver.ts` |
| 作成日       | 2026-03-14                                    |

---

## 1. スコア算出モデル

### 1-1. EvaluationBreakdown から totalScore を算出する方法

既存の `EvaluationBreakdown` は 5 項目で構成される。

```
clarity          : 0–100  （明確さ）
specificity      : 0–100  （具体性）
completeness     : 0–100  （完全性）
reproducibility  : 0–100  （再現性）
security         : 0–100  （セキュリティ）
```

#### 重み付け方針: 全等価（均等平均）

Phase 1 要件に「prompt品質 5 項目」として並列に定義されており、現行の `PromptOptimizer.evaluate()` も Claude API に対して 5 項目を同等に依頼している。
設計段階で特定項目に恣意的な重みを付けると、Claude API の評価値との整合性が取れなくなるリスクがある。
したがって、**Phase 5 実装時点では均等平均を採用**し、重み変更が必要な場合は `WEIGHT_MAP` 定数で後から調整できる構造にする。

```
totalScore = (clarity + specificity + completeness + reproducibility + security) / 5
```

小数点以下は `Math.round()` で整数に丸める。

#### 算出式（TypeScript 形式）

```typescript
/**
 * EvaluationBreakdown の 5 項目均等平均から totalScore を算出する。
 * 結果は整数（Math.round）に丸めて返す。
 */
export function computeTotalScore(breakdown: EvaluationBreakdown): number {
  const WEIGHT_MAP: Record<keyof EvaluationBreakdown, number> = {
    clarity: 1,
    specificity: 1,
    completeness: 1,
    reproducibility: 1,
    security: 1,
  };

  const totalWeight = Object.values(WEIGHT_MAP).reduce((s, w) => s + w, 0);
  const weightedSum =
    WEIGHT_MAP.clarity * normalizeScore(breakdown.clarity) +
    WEIGHT_MAP.specificity * normalizeScore(breakdown.specificity) +
    WEIGHT_MAP.completeness * normalizeScore(breakdown.completeness) +
    WEIGHT_MAP.reproducibility * normalizeScore(breakdown.reproducibility) +
    WEIGHT_MAP.security * normalizeScore(breakdown.security);

  return Math.round(weightedSum / totalWeight);
}
```

`WEIGHT_MAP` の値をすべて 1 にした均等平均が初期実装。
将来の重み変更は `WEIGHT_MAP` の値を変えるだけで対応できる。

---

## 2. スコア正規化ルール

### 2-1. 範囲外の値への対処

Claude API の応答は `PromptOptimizer.parseEvaluationResponse()` 内で既に
`Math.max(0, Math.min(100, parsed.score ?? 50))` でクランプされているが、
`breakdown` の各項目は現行実装ではクランプされていない。

Phase 5 では以下の `normalizeScore()` を追加して各項目を正規化する。

```typescript
/**
 * スコア値を 0–100 の範囲にクランプし、整数に丸める。
 * NaN / undefined / null は 0 として扱う。
 *
 * @param raw - Claude API または手動入力の生スコア値
 * @returns 0 以上 100 以下の整数
 */
export function normalizeScore(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.max(0, Math.min(100, n)));
}
```

`computeTotalScore()` は内部で `normalizeScore()` を呼び出すため、
呼び出し元が事前正規化を行わなくても安全に動作する。

### 2-2. breakdown が未提供の場合

`PromptEvaluation.breakdown` はオプショナル（`?`）である。
breakdown が存在しない場合は `score` フィールドをそのまま使い、
`computeTotalScore()` は呼び出さない。

| 条件             | totalScore の算出方法                           |
| ---------------- | ----------------------------------------------- |
| `breakdown` あり | `computeTotalScore(breakdown)` の結果を使用     |
| `breakdown` なし | `normalizeScore(evaluation.score)` の結果を使用 |

---

## 3. ScoringGate 型定義

```typescript
/**
 * スコアに基づくゲート判定結果。
 *
 * - NEEDS_IMPROVEMENT : 0–59   改善が必要。保存・利用を拒否する。
 * - SAVE_ALLOWED      : 60–79  保存は可能。利用にはさらに改善を推奨。
 * - USE_ALLOWED       : 80–99  利用可能。推奨状態には達していない。
 * - RECOMMENDED       : 100    完全スコア。推奨状態。
 */
export type ScoringGate =
  | "NEEDS_IMPROVEMENT"
  | "SAVE_ALLOWED"
  | "USE_ALLOWED"
  | "RECOMMENDED";

/**
 * ゲート判定結果のメタ情報。
 * UI 表示・導線分岐・IPC レスポンスで共通利用する。
 */
export interface ScoringGateResult {
  /** ゲート識別子 */
  gate: ScoringGate;

  /** 正規化済み総合スコア（0–100 整数） */
  score: number;

  /** UI 表示用ラベル（日本語） */
  label: string;

  /** 保存操作を許可するか */
  canSave: boolean;

  /** 利用操作を許可するか */
  canUse: boolean;

  /** 推奨状態かどうか */
  isRecommended: boolean;
}
```

---

## 4. getScoreGate 関数の設計

### 4-1. 境界値定義

| スコア範囲 | ゲート              | canSave | canUse | isRecommended |
| ---------- | ------------------- | ------- | ------ | ------------- |
| 0–59       | `NEEDS_IMPROVEMENT` | false   | false  | false         |
| 60–79      | `SAVE_ALLOWED`      | true    | false  | false         |
| 80–99      | `USE_ALLOWED`       | true    | true   | false         |
| 100        | `RECOMMENDED`       | true    | true   | true          |

境界値: **59/60/79/80/100**

- スコア 59 は `NEEDS_IMPROVEMENT`、60 は `SAVE_ALLOWED`。
- スコア 79 は `SAVE_ALLOWED`、80 は `USE_ALLOWED`。
- スコア 100 のみ `RECOMMENDED`（100 未満は `USE_ALLOWED`）。

### 4-2. 関数実装

```typescript
/**
 * 正規化済みスコアからゲート判定結果を返す。
 *
 * @param score - 0–100 の整数スコア（normalizeScore 済みであること）
 * @returns ScoringGateResult
 *
 * @example
 * getScoreGate(59)  // => { gate: "NEEDS_IMPROVEMENT", canSave: false, canUse: false, ... }
 * getScoreGate(60)  // => { gate: "SAVE_ALLOWED",      canSave: true,  canUse: false, ... }
 * getScoreGate(79)  // => { gate: "SAVE_ALLOWED",      canSave: true,  canUse: false, ... }
 * getScoreGate(80)  // => { gate: "USE_ALLOWED",       canSave: true,  canUse: true,  ... }
 * getScoreGate(100) // => { gate: "RECOMMENDED",       canSave: true,  canUse: true,  isRecommended: true }
 */
export function getScoreGate(score: number): ScoringGateResult {
  const normalized = normalizeScore(score);

  if (normalized === 100) {
    return {
      gate: "RECOMMENDED",
      score: normalized,
      label: "推奨",
      canSave: true,
      canUse: true,
      isRecommended: true,
    };
  }

  if (normalized >= 80) {
    return {
      gate: "USE_ALLOWED",
      score: normalized,
      label: "利用可",
      canSave: true,
      canUse: true,
      isRecommended: false,
    };
  }

  if (normalized >= 60) {
    return {
      gate: "SAVE_ALLOWED",
      score: normalized,
      label: "保存可",
      canSave: true,
      canUse: false,
      isRecommended: false,
    };
  }

  return {
    gate: "NEEDS_IMPROVEMENT",
    score: normalized,
    label: "要改善",
    canSave: false,
    canUse: false,
    isRecommended: false,
  };
}
```

### 4-3. 境界値テストケース一覧（Phase 4 で使用）

| 入力スコア | 期待 gate         | canSave | canUse | isRecommended |
| ---------- | ----------------- | ------- | ------ | ------------- |
| -1         | NEEDS_IMPROVEMENT | false   | false  | false         |
| 0          | NEEDS_IMPROVEMENT | false   | false  | false         |
| 59         | NEEDS_IMPROVEMENT | false   | false  | false         |
| 60         | SAVE_ALLOWED      | true    | false  | false         |
| 79         | SAVE_ALLOWED      | true    | false  | false         |
| 80         | USE_ALLOWED       | true    | true   | false         |
| 99         | USE_ALLOWED       | true    | true   | false         |
| 100        | RECOMMENDED       | true    | true   | true          |
| 101        | RECOMMENDED       | true    | true   | true          |
| NaN        | NEEDS_IMPROVEMENT | false   | false  | false         |

> 101 以上は `normalizeScore()` でクランプされて 100 扱いになるため `RECOMMENDED` となる。

---

## 5. カテゴリスコアの重み付け方針

### 5-1. Phase 5 初期実装: 均等平均

理由:

1. Phase 1 要件は 5 項目を「評価3軸」の一軸として並列に定義している。特定項目の優先度は明示されていない。
2. `PromptOptimizer.evaluate()` は Claude API に 5 項目を対等に評価させており、均等平均が API の評価意図と最も整合する。
3. 将来の重み変更を `WEIGHT_MAP` 定数で局所化することで、算出式のロジック変更を最小にする。

### 5-2. 将来の重み変更パターン（参考）

セキュリティを優先したい場合の例:

```typescript
const WEIGHT_MAP: Record<keyof EvaluationBreakdown, number> = {
  clarity: 1,
  specificity: 1,
  completeness: 1,
  reproducibility: 1,
  security: 2, // 2倍の重み
};
// totalWeight = 6, セキュリティスコアが全体に与える影響が大きくなる
```

重み変更は `computeTotalScore()` 内の `WEIGHT_MAP` のみを変更すればよく、
`getScoreGate()` や呼び出し元への影響はない。

---

## 6. Phase 5 実装時の型追加先

### 6-1. 追加対象ファイル

```
packages/shared/src/types/skill-improver.ts
```

### 6-2. 追加する型・関数の一覧

| 識別子                | 種別            | セクション                               |
| --------------------- | --------------- | ---------------------------------------- |
| `ScoringGate`         | type union      | `// Section: 採点ゲート型 (ScoringGate)` |
| `ScoringGateResult`   | interface       | 同上                                     |
| `normalizeScore()`    | export function | 同上                                     |
| `computeTotalScore()` | export function | 同上                                     |
| `getScoreGate()`      | export function | 同上                                     |

### 6-3. 追加位置

既存セクション構成:

```
// Section: 分析結果型 (SkillAnalyzer)       ← 既存
// Section: 改善実行型 (SkillImprover)        ← 既存
// Section: プロンプト最適化型 (PromptOptimizer) ← 既存
// Section: IPC リクエスト/レスポンス型       ← 既存
// Section: 採点ゲート型 (ScoringGate)        ← 【新規追加】
```

新規セクションは `IPC リクエスト/レスポンス型` の直後に追加する。

### 6-4. packages/shared/index.ts への export 追加

```typescript
// 既存の export に追加
export type {
  ScoringGate,
  ScoringGateResult,
} from "./src/types/skill-improver";
export {
  normalizeScore,
  computeTotalScore,
  getScoreGate,
} from "./src/types/skill-improver";
```

---

## 7. Task03/Task05 連携での利用方針

| 利用タイミング         | 利用元                    | 渡すデータ                                 | 判定後の導線                        |
| ---------------------- | ------------------------- | ------------------------------------------ | ----------------------------------- |
| 作成時（Task03）       | `useSkillAnalysis` フック | `PromptEvaluation` → `getScoreGate(score)` | `canSave=false` → 保存ボタン無効化  |
| 改善時（Task03）       | `useSkillAnalysis` フック | 同上（改善後スコア）                       | `canUse=false` → 利用ボタン無効化   |
| 利用前（Task05）       | IPC レスポンス検証層      | `ScoringGateResult` をキャッシュ参照       | `canUse=false` → 利用拒否ダイアログ |
| 利用後再評価（Task05） | 実行結果返却後            | 再評価スコア → `getScoreGate()`            | `gate` が下がった場合に警告表示     |

`ScoringGateResult` を IPC レスポンスに含めることで、Main/Renderer 双方が同一の判定ロジックを参照する。
Renderer 側で `getScoreGate()` を呼び出し直す場合も、`@repo/shared` からインポートして同一の関数を使用する。

---

## 8. 設計制約・注意事項

| 制約                            | 詳細                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `getScoreGate()` は純粋関数     | 副作用なし。テストは入力・出力のみで検証できる                                |
| `normalizeScore()` は防御的設計 | `unknown` 型を受け入れ、NaN/null/undefined を 0 として処理する                |
| 境界値は閉区間                  | 60 は `SAVE_ALLOWED`（>=60）、79 は `SAVE_ALLOWED`（<80）                     |
| `RECOMMENDED` は 100 のみ       | 99 は `USE_ALLOWED`。クランプ後に 100 に到達した値も `RECOMMENDED` となる     |
| IPC 層での再計算禁止            | `skillHandlers.ts` は `getScoreGate()` を呼ぶだけとし、算出ロジックを持たない |
