# 実装ガイド: 評価・採点ゲート機能

## メタ情報

| 項目         | 内容                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-04                                                                                    |
| 生成日       | 2026-03-14                                                                                                 |
| Phase        | 12                                                                                                         |
| 対象ファイル | skill-improver.ts / skill-api.ts / agentSlice.ts / store/index.ts / ScoreDisplay.tsx / useSkillAnalysis.ts |

---

## Part 1: 中学生レベルの概念説明

**なぜ必要か**: 改善しても品質が上がったか分からない状態をなくし、保存や利用の判断を迷わないようにするため。  
**何をするか**: スコアを4段階ゲートで判定し、改善前後の差分（Δ）を画面に表示する。

### 採点ゲートって何？

あなたが学校でテストを受けると、先生が点数をつけてくれますよね。

- **0〜59点**: 赤点。もう一度やり直し
- **60〜79点**: ぎりぎり合格。でもまだ改善の余地あり
- **80〜99点**: よくできました。使えるレベル
- **100点**: 満点！おすすめします

このアプリのスキル（AIへの指示書）も、まったく同じ仕組みで採点されます。この仕組みを「採点ゲート」と呼んでいます。

```
0-59点   → NEEDS_IMPROVEMENT（改善必須）  赤
60-79点  → SAVE_ALLOWED    （保存OK・改善推奨） 黄
80-99点  → USE_ALLOWED     （利用OK）     青
100点    → RECOMMENDED     （推奨！）     金
```

### 「ゲート」って何のこと？

遊園地の入り口のゲートをイメージしてください。

- 身長が130cm未満の子は乗れないアトラクションがある（**保存ブロック**）
- 身長が130cm以上なら乗れる（**保存OK**）
- 身長が150cm以上なら大人向けも乗れる（**利用OK**）

スキルも同じです。スコアが60未満なら「まだ保存できないよ」とブロックします。80以上になると「本番で使えるよ」という扱いになります。

### 「改善してから再採点」の流れ

スポーツの練習サイクルに例えると分かりやすいです:

1. **練習試合**（スキルを評価する）→ スコアが出る
2. **コーチからのアドバイス**（改善提案が表示される）
3. **練習**（提案に従ってスキルを修正する）
4. **再び練習試合**（再評価する）
5. **スコア変化が表示される**（「+25点向上！」のような緑バッジ）

このバッジのことを **ScoreDeltaBadge（スコア差分バッジ）** と呼びます。緑は上昇、赤は下降、グレーは変化なしを意味します。

### 採点はどうやってされるの？

Claude AI（人工知能）が5つの観点でスキルを採点します:

| 採点ポイント | 意味                         | 例え                                     |
| ------------ | ---------------------------- | ---------------------------------------- |
| 明確さ       | 指示が分かりやすいか         | 「それをして」より「ファイルを保存して」 |
| 具体性       | 具体的に書かれているか       | 「なんかやって」より「3行で要約して」    |
| 完全性       | 必要な情報が全部入っているか | 材料なしのレシピより材料ありのレシピ     |
| 再現性       | 誰がやっても同じ結果になるか | 「適当に」より「5分間」                  |
| セキュリティ | 危険な操作をしていないか     | 知らない人にパスワードを教えない         |

この5つを0〜100点で採点して、平均を取ったものが総合スコアです。

---

## Part 2: 開発者向け実装詳細

### 1. 追加した型定義（packages/shared/src/types/skill-improver.ts）

ファイル末尾（L299-382）に以下を追加した。

#### ScoringGate（採点ゲート型）

```typescript
export type ScoringGate =
  | "NEEDS_IMPROVEMENT" // 0-59: 改善必須
  | "SAVE_ALLOWED" // 60-79: 保存可・改善推奨
  | "USE_ALLOWED" // 80-99: 利用可
  | "RECOMMENDED"; // 100: 推奨
```

ゲートは文字列ユニオン型として定義した。`Record<ScoringGate, Config>` で網羅性チェックが機能する。

#### ScoringGateResult（UI制御フラグ付き）

```typescript
export interface ScoringGateResult {
  gate: ScoringGate;
  score: number; // normalizeScore済み（0-100整数）
  canSave: boolean; // gate !== "NEEDS_IMPROVEMENT"
  canUse: boolean; // gate === "USE_ALLOWED" || gate === "RECOMMENDED"
  isRecommended: boolean; // gate === "RECOMMENDED"
}
```

UI 側で個別フラグを参照することで、ゲート文字列を switch/if で分岐する必要がなくなる。

#### ScoreDelta（スコア差分情報）

`@repo/shared` に定義した `ScoreDelta`（計算用）と `ScoreDisplay.tsx` 内の `ScoreDelta`（UI表示用）は別概念であり共存している。

| 型           | 定義場所                      | フィールド                                     | 用途           |
| ------------ | ----------------------------- | ---------------------------------------------- | -------------- |
| `ScoreDelta` | `@repo/shared/skill-improver` | `previousScore / newScore / delta / direction` | 計算ロジック   |
| `ScoreDelta` | `ScoreDisplay.tsx`            | `value / direction / raw`                      | UI表示ロジック |

#### 補助関数

```typescript
// スコアを 0-100 整数に正規化（防御的実装）
export function normalizeScore(raw: unknown): number;
// EvaluationBreakdown の5項目（均等重み）から総合スコアを算出
export function calculateScoreFromBreakdown(
  breakdown: EvaluationBreakdown,
): number;
// スコア → ScoringGate 判定（純粋関数）
export function getScoreGate(score: number): ScoringGate;
// スコア → ScoringGateResult（UIフラグ込み）
export function getScoreGateResult(score: number): ScoringGateResult;
// スコア差分を計算（pure function）
export function calculateScoreDelta(
  previousScore: number,
  newScore: number,
): ScoreDelta;
```

### 2. getScoreGate() / getScoreGateResult() の使い方

```typescript
import {
  getScoreGate,
  getScoreGateResult,
} from "@repo/shared/types/skill-improver";

// 基本的な判定
const gate = getScoreGate(75); // "SAVE_ALLOWED"

// UI制御フラグ付き判定
const result = getScoreGateResult(75);
// result.gate === "SAVE_ALLOWED"
// result.canSave === true
// result.canUse === false
// result.isRecommended === false

// ボタン制御の例
<button disabled={!result.canSave}>保存</button>
<button disabled={!result.canUse}>利用開始</button>
```

境界値の動作:

| スコア | gate              | canSave | canUse | isRecommended |
| ------ | ----------------- | ------- | ------ | ------------- |
| 0      | NEEDS_IMPROVEMENT | false   | false  | false         |
| 59     | NEEDS_IMPROVEMENT | false   | false  | false         |
| 60     | SAVE_ALLOWED      | true    | false  | false         |
| 79     | SAVE_ALLOWED      | true    | false  | false         |
| 80     | USE_ALLOWED       | true    | true   | false         |
| 99     | USE_ALLOWED       | true    | true   | false         |
| 100    | RECOMMENDED       | true    | true   | true          |

### 3. previousAnalysis + ScoreDeltaBadge の連携方法

`previousAnalysis` は `agentSlice.applySkillImprovements` が管理する。改善適用直前に Store へスナップショット保存し、再分析後のスコアと比較表示する。`useSkillAnalysis` は `usePreviousAnalysis()` で参照する。

```typescript
// useSkillAnalysis フック使用例
const {
  analysis,
  previousAnalysis,
  scoreDelta,
  scoreDirection,
} = useSkillAnalysis(skillName);

// ScoreDisplay に渡す
<ScoreDisplay
  analysis={analysis}
  previousAnalysis={previousAnalysis} // null のとき ScoreDeltaBadge は非表示
/>
```

`ScoreDisplay.tsx` 内の動作:

```typescript
// ScoreDisplay.tsx（L243-248）
const delta =
  previousAnalysis != null
    ? calculateScoreDelta(
        analysis.overallScore,
        previousAnalysis.overallScore,
      )
    : null;

// ScoreDeltaBadge は delta が null のとき何もレンダリングしない
<ScoreDeltaBadge delta={delta} />
```

差分の方向判定基準（`|delta| <= 2` は neutral として扱う微小変動無視）:

```
delta >= 3  → "up"      （緑バッジ、↑ アイコン付き）
delta <= -3 → "down"    （赤バッジ、↓ アイコン付き）
それ以外    → "neutral" （グレーバッジ、「変化なし」）
```

### 4. evaluatePrompt() Preload API の呼び出し方法

`apps/desktop/src/preload/skill-api.ts` に追加した実装:

```typescript
// SkillAPI インターフェース定義（L319-327）
evaluatePrompt: (prompt: string) => Promise<OperationResult<PromptEvaluation>>;

// 実装（L705-711）
evaluatePrompt: (prompt: string): Promise<OperationResult<PromptEvaluation>> =>
  safeInvoke<OperationResult<PromptEvaluation>>(
    IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE,
    { prompt },  // P44/P45準拠: オブジェクト形式、引数名はセマンティクスに一致
  ),
```

呼び出し元（`useSkillAnalysis.ts` L179-186）の実装:

```typescript
try {
  await window.electronAPI.skill.evaluatePrompt(prompt);
} catch (err) {
  const message = err instanceof Error ? err.message : "評価に失敗しました";
  setEvaluateError(message);
  setIsEvaluateError(true);
}
```

IPC契約の注意点:

- **P42準拠**: Main Process 側ハンドラで `args.prompt.trim() === ""` の3段バリデーション実装済み
- **P44準拠**: Preload 側では `{ prompt }` オブジェクト形式で送信
- **P45準拠**: 引数名 `prompt` はセマンティクス（プロンプト文字列）に一致

空文字列ガード（フック側でも事前検証）:

```typescript
const handleEvaluatePrompt = useCallback(async (prompt: string) => {
  if (prompt.trim() === "") {
    setEvaluateError("プロンプトを入力してください");
    setIsEvaluateError(true);
    return;
  }
  // ... IPC呼び出し
}, []);
```

### 5. agentSlice.ts の usePreviousAnalysis() セレクタの使い方

`agentSlice.ts` の `AgentState` に追加したフィールド（L163-164）:

```typescript
/** 改善適用前のスナップショット分析結果（Δスコア表示用） */
previousAnalysis: SkillAnalysis | null;
```

`store/index.ts` に追加した個別セレクタ（L666-667）:

```typescript
/** 改善適用前のスナップショット分析結果（Δスコア表示用） */
export const usePreviousAnalysis = () =>
  useAppStore((state) => state.previousAnalysis);
```

使い方（P31対策: 個別セレクタで取得）:

```typescript
import {
  useCurrentAnalysis,
  usePreviousAnalysis,
  useIsAnalyzingSkill,
} from "../../../store";

// コンポーネント内
const analysis = useCurrentAnalysis();
const previousAnalysis = usePreviousAnalysis();
const isAnalyzing = useIsAnalyzingSkill();
```

`previousAnalysis` の更新タイミング:

```typescript
// agentSlice.ts の applySkillImprovements（抜粋）
set({
  isImproving: true,
  skillError: null,
  previousAnalysis: get().currentAnalysis, // 改善適用「前」のスナップショット
});
```

### 6. 実装上の注意点

#### P42準拠（.trim() バリデーション）

IPC ハンドラの文字列引数には必ず3段バリデーションを適用する:

```typescript
// Main Process側ハンドラ
if (
  typeof args?.prompt !== "string" ||
  args.prompt === "" ||
  args.prompt.trim() === ""
) {
  throw { code: "VALIDATION_ERROR", message: "prompt is required" };
}
```

#### P44準拠（IPC引数形式の一致）

Preload 側で `{ prompt }` オブジェクト形式で送信し、Main Process ハンドラも同形式で受け取ることを確認する。文字列リテラル直送は禁止。

#### P45準拠（引数命名のセマンティクス一致）

引数名 `prompt` は実際に渡す値（プロンプト文字列）のセマンティクスと一致させる。`id` や `name` など内容と合わない名前を使わない。

#### ScoreDelta の二重定義（FINAL-M-02）

`@repo/shared` の `ScoreDelta` と `ScoreDisplay.tsx` の `ScoreDelta` は異なるフィールド構造を持つ。将来的には統一を検討するが、現状は設計上の意図的な分離（計算ロジックと表示ロジックの責務分離）として共存させている。詳細は未タスク `TASK-FIX-SCORE-DELTA-DEDUP-001` を参照。

#### handleEvaluatePrompt の Store 非経由（FINAL-M-01）

`handleEvaluatePrompt` は現状 `window.electronAPI.skill.evaluatePrompt()` を直接呼び出している。Store 経由原則から外れているが、機能影響は軽微であり、リファクタリングは未タスク `TASK-FIX-EVAL-STORE-DISPATCH-001` として将来対応予定。

### 7. エラーハンドリング

- `handleEvaluatePrompt` は空文字入力時に即時ガードし、UIへエラーメッセージを表示する。
- IPC 例外発生時は `err instanceof Error` で message を抽出し、`evaluateError` と `isEvaluateError` を更新する。
- Main 側は P42 準拠のバリデーション失敗で `VALIDATION_ERROR` を返す。

### 8. エッジケース / 境界条件

- `normalizeScore` は `NaN` や範囲外値を `0-100` に補正する。
- `getScoreGate` は閾値 `59/60/79/80/100` を境界条件として固定する。
- `calculateScoreDelta` は `|delta| <= 2` を `neutral` とし、微小変動によるノイズ表示を防ぐ。
- `previousAnalysis` が `null` の場合、`ScoreDeltaBadge` は描画しない（初回評価時）。

### 9. 設定項目と定数一覧

| 項目                | 値 / 型                                                                   | 役割                        |
| ------------------- | ------------------------------------------------------------------------- | --------------------------- | ----- | ------- |
| `ScoringGate`       | `"NEEDS_IMPROVEMENT" \| "SAVE_ALLOWED" \| "USE_ALLOWED" \| "RECOMMENDED"` | ゲート判定の正本            |
| `neutral threshold` | `2`                                                                       | Δ表示の中立判定（`          | delta | <= 2`） |
| `score range`       | `0..100`                                                                  | `normalizeScore` の補正範囲 |
| `IPC channel`       | `IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE`                                    | evaluatePrompt 呼び出し先   |

### テスト構成

| テストファイル                  | テスト数 | 対象                                                                                                |
| ------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `scoring-gate.test.ts`          | 30       | ScoringGate型・純粋関数（normalizeScore / getScoreGate / getScoreGateResult / calculateScoreDelta） |
| `ScoreDisplay.test.tsx`         | 26       | ScoreDeltaBadge / OverallScore / ScoreDisplay コンポーネント                                        |
| `useSkillAnalysis-gate.test.ts` | 7        | useSkillAnalysis フックのゲート関連ハンドラ（TC-GATE-01〜04 / TC-EVAL-01〜03）                      |
| **合計**                        | **63**   | **全件 PASS**                                                                                       |

テスト実行コマンド:

```bash
cd apps/desktop && pnpm exec vitest run \
  src/renderer/components/skill/__tests__/scoring-gate.test.ts \
  src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx \
  src/renderer/components/skill/__tests__/useSkillAnalysis-gate.test.ts
```
