# Phase 2 成果物: スコアリング・ゲート連携マトリクス

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| 生成日       | 2026-03-14                           |
| Phase        | 2                                    |
| 担当SubAgent | SubAgent-A / SubAgent-B / SubAgent-C |
| ステータス   | 完了                                 |

---

## 1. スコアモデル設計（SubAgent-A）

### 1-1. EvaluationBreakdown → totalScore 算出式

```typescript
/** 評価項目の重み（Phase 1要件: 5項目均等）*/
export const EVALUATION_WEIGHT_MAP: Record<keyof EvaluationBreakdown, number> =
  {
    clarity: 0.2,
    specificity: 0.2,
    completeness: 0.2,
    reproducibility: 0.2,
    security: 0.2,
  };

/** EvaluationBreakdown から totalScore を算出 */
export function calculateScoreFromBreakdown(
  breakdown: EvaluationBreakdown,
): number {
  const raw =
    breakdown.clarity * EVALUATION_WEIGHT_MAP.clarity +
    breakdown.specificity * EVALUATION_WEIGHT_MAP.specificity +
    breakdown.completeness * EVALUATION_WEIGHT_MAP.completeness +
    breakdown.reproducibility * EVALUATION_WEIGHT_MAP.reproducibility +
    breakdown.security * EVALUATION_WEIGHT_MAP.security;
  return normalizeScore(raw);
}

/** スコアを 0-100 整数に正規化 */
export function normalizeScore(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.max(0, Math.min(100, n)));
}
```

### 1-2. ScoringGate 型定義

```typescript
/** 採点ゲート: 4段階の品質判定 */
export type ScoringGate =
  | "NEEDS_IMPROVEMENT" // 0-59: 改善必須
  | "SAVE_ALLOWED" // 60-79: 保存可・改善推奨
  | "USE_ALLOWED" // 80-99: 利用可
  | "RECOMMENDED"; // 100:   推奨

/** ゲート判定結果（UI制御用フラグ付き）*/
export interface ScoringGateResult {
  gate: ScoringGate;
  score: number;
  canSave: boolean;
  canUse: boolean;
  isRecommended: boolean;
}

/** スコア → ScoringGate 判定（純粋関数）*/
export function getScoreGate(score: number): ScoringGate {
  const s = normalizeScore(score);
  if (s === 100) return "RECOMMENDED";
  if (s >= 80) return "USE_ALLOWED";
  if (s >= 60) return "SAVE_ALLOWED";
  return "NEEDS_IMPROVEMENT";
}

/** スコア → ScoringGateResult（UIフラグ込み）*/
export function getScoreGateResult(score: number): ScoringGateResult {
  const gate = getScoreGate(score);
  return {
    gate,
    score: normalizeScore(score),
    canSave: gate !== "NEEDS_IMPROVEMENT",
    canUse: gate === "USE_ALLOWED" || gate === "RECOMMENDED",
    isRecommended: gate === "RECOMMENDED",
  };
}
```

---

## 2. ゲート遷移設計（SubAgent-B）

### 2-1. 入力値 × 期待ゲート × 次導線 マトリクス

| テストID    | 入力スコア | 期待ゲート        | canSave | canUse | 次導線アクション                           |
| ----------- | ---------- | ----------------- | ------- | ------ | ------------------------------------------ |
| UT-GATE-01a | 0          | NEEDS_IMPROVEMENT | false   | false  | SkillAnalysisView を必須表示・保存ブロック |
| UT-GATE-01b | 30         | NEEDS_IMPROVEMENT | false   | false  | 改善ボタンを強調・保存ブロック             |
| UT-GATE-01c | 59         | NEEDS_IMPROVEMENT | false   | false  | 境界最大値・保存ブロック（改善ボタン表示） |
| UT-GATE-02a | 60         | SAVE_ALLOWED      | true    | false  | 保存可・改善推奨バナー表示                 |
| UT-GATE-02b | 72         | SAVE_ALLOWED      | true    | false  | 保存可・改善推奨バナー表示                 |
| UT-GATE-02c | 79         | SAVE_ALLOWED      | true    | false  | 境界最大値・保存可・利用ブロック           |
| UT-GATE-03a | 80         | USE_ALLOWED       | true    | true   | Workspace 導線開放・利用ボタン有効化       |
| UT-GATE-03b | 90         | USE_ALLOWED       | true    | true   | Workspace 導線開放・利用ボタン有効化       |
| UT-GATE-03c | 99         | USE_ALLOWED       | true    | true   | 境界最大値・Workspace 導線開放             |
| UT-GATE-04a | 100        | RECOMMENDED       | true    | true   | 推奨バッジ表示・Workspace 導線開放         |

### 2-2. EP-1〜EP-4 採点ポイント遷移フロー

```
[EP-1: 作成後]
  Skill Creator 完了
       ↓
  evaluateSkill(skillName)
       ↓
  getScoreGate(score)
       ├─ NEEDS_IMPROVEMENT (0-59) → SkillAnalysisView 必須 → 改善→EP-2
       ├─ SAVE_ALLOWED (60-79)     → 保存可・改善推奨バナー → Workspace or 改善→EP-2
       ├─ USE_ALLOWED (80-99)      → 保存可・Workspace 導線開放
       └─ RECOMMENDED (100)        → 推奨バッジ・Workspace 導線開放

[EP-2: 改善後]
  提案適用 or 全自動改善
       ↓
  previousScore = currentScore （Δ表示用にスナップショット）
       ↓
  evaluateSkill(skillName) （再分析）
       ↓
  scoreDelta = newScore - previousScore
       ├─ Δ > 0 → 「+XX点向上」バッジ（緑）
       ├─ Δ = 0 → 「変化なし」表示（グレー）
       └─ Δ < 0 → 「-XX点低下」バッジ（赤）
       ↓
  getScoreGate(newScore) → 次導線決定

[EP-3: 利用前（任意）]
  Workspace でスキル選択
       ↓
  evaluateBeforeUse(skillName) （任意）
       ↓
  ScoringGate を参考情報として表示（利用はブロックしない）

[EP-4: 利用後再評価（任意）]
  Agent 実行完了
       ↓
  evaluateAfterUse(executionResult) （任意）
       ↓
  フィードバック表示 → 改善導線へ
```

### 2-3. スコア差分（Δ）表示方針

| 差分値      | 表示スタイル | テキスト     |
| ----------- | ------------ | ------------ |
| Δ ≥ +3      | 緑・上矢印   | `+{Δ}点向上` |
| -2 ≤ Δ ≤ +2 | グレー       | `変化なし`   |
| Δ ≤ -3      | 赤・下矢印   | `{Δ}点低下`  |

---

## 3. 契約・仕様突合設計（SubAgent-C）

### 3-1. Task03/05 I/O 契約テーブル

#### Task03（作成/改善フロー）

| 方向 | 名称             | 型                      | 説明                     |
| ---- | ---------------- | ----------------------- | ------------------------ |
| 入力 | skillName        | `string`                | スキル識別子             |
| 入力 | prompt           | `string`                | 評価対象プロンプト       |
| 出力 | evaluation       | `PromptEvaluation`      | スコア + 5軸breakdown    |
| 出力 | analysis         | `SkillAnalysis`         | 総合分析 + 提案 + リスク |
| 出力 | gate             | `ScoringGateResult`     | 導線制御フラグ           |
| 出力 | previousAnalysis | `SkillAnalysis \| null` | 改善前スコア（Δ計算用）  |

#### Task05（利用/再評価フロー）

| 方向      | 名称            | 型                  | 説明             |
| --------- | --------------- | ------------------- | ---------------- |
| 入力 EP-3 | skillName       | `string`            | 利用前評価対象   |
| 出力 EP-3 | gate            | `ScoringGateResult` | 利用可否参考情報 |
| 入力 EP-4 | executionResult | `string`            | 実行結果テキスト |
| 出力 EP-4 | evaluation      | `PromptEvaluation`  | 更新後評価       |

### 3-2. GAP解決設計一覧

| GAP-ID | 内容                            | 解決方針                                                    | 実装箇所                                                      | 優先度 |
| ------ | ------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- | ------ |
| GAP-01 | Preload `evaluatePrompt()` 欠落 | `skill-api.ts` に `evaluatePrompt()` 追加                   | `apps/desktop/src/preload/skill-api.ts`                       | P1     |
| GAP-02 | `ScoringGate` 型未定義          | `skill-improver.ts` に型と関数を追加                        | `packages/shared/src/types/skill-improver.ts`                 | P1     |
| GAP-03 | `previousAnalysis` 保持なし     | `agentSlice.ts` に `previousAnalysis` フィールド追加        | `apps/desktop/src/renderer/store/slices/agentSlice.ts`        | P2     |
| GAP-04 | Δ表示UI未実装                   | `ScoreDisplay.tsx` に `ScoreDeltaBadge` 追加                | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx` | P2     |
| GAP-05 | Task05向けIPC契約未整備         | 既存 `skill:optimize:evaluate` を再利用（新チャンネル不要） | `apps/desktop/src/preload/skill-api.ts`                       | P3     |

### 3-3. 型定義追加計画（packages/shared/src/types/skill-improver.ts）

```typescript
// === Phase 5 追加: Section: 採点ゲート型 ===

export type ScoringGate =
  | "NEEDS_IMPROVEMENT"
  | "SAVE_ALLOWED"
  | "USE_ALLOWED"
  | "RECOMMENDED";

export interface ScoringGateResult {
  gate: ScoringGate;
  score: number;
  canSave: boolean;
  canUse: boolean;
  isRecommended: boolean;
}

export interface ScoreDelta {
  previousScore: number;
  newScore: number;
  delta: number;
  direction: "up" | "neutral" | "down";
}

// Task03/05 共通レスポンス
export interface EvaluatedSkillResult {
  evaluation: PromptEvaluation;
  analysis: SkillAnalysis;
  gate: ScoringGateResult;
  previousAnalysis: SkillAnalysis | null;
}
```

---

## 4. aiworkflow 参照仕様整合チェック

| 仕様               | 参照先                                  | 整合確認                                              |
| ------------------ | --------------------------------------- | ----------------------------------------------------- |
| 導線契約           | `ui-ux-navigation.md`                   | PASS: create/use/improve 3導線と一致                  |
| 評価UI契約         | `ui-ux-feature-components-reference.md` | PASS: ScoreDisplay/SkillAnalysisView 契約と一致       |
| ライフサイクル統合 | `ui-ux-feature-components.md`           | PASS: Store-Driven Lifecycle Integration と整合       |
| IPCチャネル契約    | `interfaces-agent-sdk-skill-details.md` | PASS: `skill:optimize:evaluate` と型契約一致          |
| IPCセキュリティ    | `security-skill-ipc-core.md`            | PASS: P42準拠バリデーション確認済み                   |
| 状態管理           | `arch-state-management.md`              | PASS: agentSlice への追加設計が state ownership 準拠  |
| 全体アーキテクチャ | `architecture-overview.md`              | PASS: レイヤー依存方向が Renderer→Preload→Main に準拠 |

**参照漏れ**: 0件（全件PASS）

---

## 5. Phase 4 テスト設計マトリクス（境界値固定）

### 5-1. getScoreGate() 単体テスト（境界値）

| テストID     | 入力 | 期待ゲート        | 境界値種別      |
| ------------ | ---- | ----------------- | --------------- |
| UT-GATE-01a  | 0    | NEEDS_IMPROVEMENT | 最小値          |
| UT-GATE-01b  | 59   | NEEDS_IMPROVEMENT | 上限境界        |
| UT-GATE-02a  | 60   | SAVE_ALLOWED      | 下限境界        |
| UT-GATE-02b  | 79   | SAVE_ALLOWED      | 上限境界        |
| UT-GATE-03a  | 80   | USE_ALLOWED       | 下限境界        |
| UT-GATE-03b  | 99   | USE_ALLOWED       | 上限境界        |
| UT-GATE-04a  | 100  | RECOMMENDED       | 最大値          |
| UT-GATE-ERR1 | -1   | NEEDS_IMPROVEMENT | 範囲外（clamp） |
| UT-GATE-ERR2 | 101  | RECOMMENDED       | 範囲外（clamp） |
| UT-GATE-ERR3 | NaN  | NEEDS_IMPROVEMENT | 異常値          |

### 5-2. スコア差分（Δ）テスト

| テストID    | 前スコア | 後スコア | 期待Δ   | direction                 |
| ----------- | -------- | -------- | ------- | ------------------------- |
| UT-DELTA-01 | 55 → 80  | +25      | up      | ゲート昇格: NEEDS→USE     |
| UT-DELTA-02 | 79 → 80  | +1       | neutral | 境界またぎ・表示はneutral |
| UT-DELTA-03 | 60 → 59  | -1       | neutral | 境界またぎ・表示はneutral |
| UT-DELTA-04 | 80 → 50  | -30      | down    | ゲート降格: USE→NEEDS     |

---

## 完了条件チェックリスト

- [x] スコア算出モデルが定義されている（均等重み付き5項目平均）
- [x] 4段階ゲート判定が定義されている（0-59/60-79/80-99/100）
- [x] Task03/05 連携契約が定義されている（I/Oテーブル）
- [x] スコア差分（Δ）表示の実装方針が定義されている
- [x] aiworkflow 参照漏れがゼロである（全件PASS）
- [x] Phase 4 テスト用境界値マトリクスが固定されている
