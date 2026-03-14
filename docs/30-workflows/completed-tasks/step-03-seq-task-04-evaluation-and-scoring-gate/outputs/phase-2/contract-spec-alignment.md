# Phase 2 設計成果物: 契約・仕様突合設計書

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| 生成日       | 2026-03-14                                                     |
| Phase        | 2                                                              |
| タスクID     | TASK-SKILL-LIFECYCLE-04                                        |
| 担当SubAgent | SubAgent-C（契約/仕様突合）                                    |
| ステータス   | 完了                                                           |
| 依存成果物   | `outputs/phase-1/requirements-definition.md`（Phase 1 完了済） |

---

## セクション1: Task03/05 入出力契約（I/Oテーブル）

### 1-1. Task03（作成/改善フロー）との入出力契約

#### 入力契約

| パラメータ名 | 型       | 必須 | 提供元                           | 説明                         |
| ------------ | -------- | ---- | -------------------------------- | ---------------------------- |
| `skillName`  | `string` | 必須 | Task03（スキル作成ウィザード）   | 評価対象スキルの識別名       |
| `prompt`     | `string` | 必須 | Task03（スキルのプロンプト内容） | prompt品質評価の対象テキスト |

バリデーション規則（P42準拠 3段チェック）:

- `typeof skillName === "string"` かつ `skillName.trim() !== ""`
- `typeof prompt === "string"` かつ `prompt.trim() !== ""`

#### 出力契約

| フィールド名       | 型                      | 必須 | 受け取り先                      | 用途                         |
| ------------------ | ----------------------- | ---- | ------------------------------- | ---------------------------- |
| `analysis`         | `SkillAnalysis`         | 必須 | Task03 `SkillAnalysisView`      | 評価結果の表示・改善導線提供 |
| `evaluation`       | `PromptEvaluation`      | 必須 | Task03 スコア表示コンポーネント | スコア＋フィードバック表示   |
| `gate`             | `ScoringGate`           | 必須 | Task03 導線制御ロジック         | 保存/利用/改善の分岐判定     |
| `previousAnalysis` | `SkillAnalysis \| null` | 任意 | Task03 差分表示（Δ）            | 改善前スコアとの比較表示     |

#### IPC呼び出しシーケンス（Task03）

```
Task03 Renderer
  └─ window.electronAPI.skill.analyze(skillName)
       └─ [IPC: skill:analyze] → Main: SkillAnalyzer.analyze()
            └─ SkillAnalysis

  └─ window.electronAPI.skill.evaluatePrompt(skillName, prompt)   ← GAP-01 追加対象
       └─ [IPC: skill:optimize:evaluate] → Main: PromptOptimizer.evaluate()
            └─ PromptEvaluation → ScoringGate（Preload側で算出）
```

---

### 1-2. Task05（利用/再評価フロー）との入出力契約

#### 入力契約（EP-3: 利用前評価）

| パラメータ名 | 型       | 必須 | 提供元                         | 説明                   |
| ------------ | -------- | ---- | ------------------------------ | ---------------------- |
| `skillName`  | `string` | 必須 | Task05（Workspace スキル選択） | 評価対象スキルの識別名 |
| `prompt`     | `string` | 必須 | Task05（スキルのプロンプト）   | 利用前prompt品質確認   |

#### 入力契約（EP-4: 利用後再評価）

| パラメータ名      | 型       | 必須 | 提供元                   | 説明                         |
| ----------------- | -------- | ---- | ------------------------ | ---------------------------- |
| `skillName`       | `string` | 必須 | Task05（実行済みスキル） | 再評価対象スキルの識別名     |
| `executionResult` | `string` | 必須 | Task05（Agent実行結果）  | 実行結果に基づく品質テキスト |

#### 出力契約

| フィールド名 | 型                 | 必須 | 受け取り先                | 用途                         |
| ------------ | ------------------ | ---- | ------------------------- | ---------------------------- |
| `evaluation` | `PromptEvaluation` | 必須 | Task05 利用前スコア確認UI | 利用可否の視覚フィードバック |
| `gate`       | `ScoringGate`      | 必須 | Task05 再評価フロー制御   | 利用後の再評価導線を制御     |

#### IPC呼び出しシーケンス（Task05）

```
Task05 Renderer（EP-3: 利用前）
  └─ window.electronAPI.skill.evaluatePrompt(skillName, prompt)   ← GAP-01/05 追加対象
       └─ [IPC: skill:optimize:evaluate] → Main: PromptOptimizer.evaluate()
            └─ PromptEvaluation → ScoringGate（Preload側で算出）

Task05 Renderer（EP-4: 利用後再評価）
  └─ window.electronAPI.skill.evaluateAfterUse(skillName, executionResult) ← GAP-05 追加対象
       └─ [IPC: skill:optimize:evaluate] → Main: PromptOptimizer.evaluate()
            └─ PromptEvaluation（更新） → ScoringGate
```

---

## セクション2: IPC契約追加リスト

### 2-1. evaluatePrompt()の追加仕様（GAP-01解決）

#### Preload API 型定義追加（`apps/desktop/src/preload/skill-api.ts`）

現状の `SkillAPIBridge` インターフェースには `evaluate` 系メソッドが存在しない。
以下のメソッドを `// === Skill Analysis & Improvement API (TASK-10A-B) ===` ブロックの末尾に追加する:

```typescript
/**
 * プロンプトを評価してスコアとゲート判定を返す
 * @param skillName - 評価対象スキルの識別名
 * @param prompt - 評価対象プロンプトテキスト
 * @returns PromptEvaluation（score, breakdown, feedback）
 */
evaluatePrompt: (skillName: string, prompt: string) =>
  Promise<PromptEvaluation>;

/**
 * 利用後実行結果に基づいてプロンプトを再評価する（EP-4）
 * @param skillName - 再評価対象スキルの識別名
 * @param executionResult - Agent実行結果テキスト
 * @returns PromptEvaluation（更新されたスコア）
 */
evaluateAfterUse: (skillName: string, executionResult: string) =>
  Promise<PromptEvaluation>;
```

#### Preload 実装追加（`apps/desktop/src/preload/skill-api.ts` 実装部）

```typescript
evaluatePrompt: (skillName: string, prompt: string): Promise<PromptEvaluation> =>
  safeInvokeUnwrap<PromptEvaluation>(IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE, { prompt }),

evaluateAfterUse: (skillName: string, executionResult: string): Promise<PromptEvaluation> =>
  safeInvokeUnwrap<PromptEvaluation>(IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE, { prompt: executionResult }),
```

**注意**: `IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE` は `channels.ts` L201 に既存登録済み（`"skill:optimize:evaluate"`）。新規チャンネル追加不要。

#### P42準拠バリデーション仕様（Main側 `skillHandlers.ts`）

既存の `skill:optimize:evaluate` ハンドラ（L665）は P42準拠の3段バリデーションが実装済み:

```typescript
// 既実装済み（skillHandlers.ts L665）
if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "prompt must be a non-empty string",
  };
}
```

`skillName` パラメータは Preload → Main 間で `{ prompt }` オブジェクトとして渡す設計のため、Main側バリデーション変更不要。Preload側で `skillName.trim() === ""` チェックを行う。

#### IPC レスポンス形式

仕様書（`interfaces-agent-sdk-skill-details.md` L28）の定義:

```
skill:optimize:evaluate → OperationResult<PromptEvaluation>
```

実装上は `{ success: true, data: PromptEvaluation }` / `{ success: false, error: string }` 形式。
`safeInvokeUnwrap` が展開して `PromptEvaluation` を直接返す。

---

### 2-2. 新規IPC追加なし確認

| GAP    | 対応方針                                                          | 新規チャンネル追加 |
| ------ | ----------------------------------------------------------------- | ------------------ |
| GAP-01 | 既存 `skill:optimize:evaluate` を `evaluatePrompt()` でラップ     | なし               |
| GAP-05 | 既存 `skill:optimize:evaluate` を `evaluateAfterUse()` でも再利用 | なし               |

---

## セクション3: GAP-01〜05の解決設計

### GAP-01: Preload API `evaluatePrompt()` 欠落

| 項目           | 内容                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| 現状           | `skill:optimize:evaluate` はMain実装済み・Preload未公開                                 |
| 解決方針       | `skill-api.ts` の `SkillAPIBridge` インターフェースと実装部に `evaluatePrompt()` を追加 |
| 実装箇所       | `apps/desktop/src/preload/skill-api.ts`（型定義部 L315付近 / 実装部 L691付近）          |
| 変更種別       | Preload API追加（Main/Shared変更なし）                                                  |
| 優先度         | P1（必須）                                                                              |
| バリデーション | Preload側で `skillName.trim() === ""` / `prompt.trim() === ""` を事前チェック           |

### GAP-02: `ScoringGate` 型未定義

| 項目     | 内容                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| 現状     | `ScoreDisplay.tsx` に `getScoreVariant()` が色ベースで実装されているが、ゲート型なし            |
| 解決方針 | `packages/shared/src/types/skill-improver.ts` に `ScoringGate` 型と `getScoreGate()` 関数を追加 |
| 実装箇所 | `packages/shared/src/types/skill-improver.ts`（`PromptEvaluation` 型定義の直後）                |
| 変更種別 | Shared型追加                                                                                    |
| 優先度   | P1（必須）                                                                                      |
| 型定義案 | セクション5参照                                                                                 |

### GAP-03: `previousAnalysis` 保持なし（Δ表示不可）

| 項目           | 内容                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| 現状           | `agentSlice.ts` L162 に `currentAnalysis: SkillAnalysis \| null` のみ。改善前スコア非保持 |
| 解決方針       | `agentSlice.ts` に `previousAnalysis: SkillAnalysis \| null` フィールドを追加             |
| 実装箇所       | `apps/desktop/src/renderer/store/slices/agentSlice.ts`（`AgentState` interface L162付近） |
| 変更種別       | Store状態追加                                                                             |
| 優先度         | P2（重要）                                                                                |
| 更新タイミング | `currentAnalysis` を更新する直前に `previousAnalysis = currentAnalysis` を保存            |

### GAP-04: スコア差分（Δ）表示UI未実装

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 現状     | `ScoreDisplay.tsx` は単一スコアのみ表示。Δ（差分）表示コンポーネントなし               |
| 解決方針 | `ScoreDisplay.tsx` に `previousScore?: number` propsを追加し、差分バッジを条件付き表示 |
| 実装箇所 | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`                          |
| 変更種別 | UIコンポーネント拡張                                                                   |
| 優先度   | P2（重要）                                                                             |
| 表示仕様 | `Δ+12` (緑) / `Δ-5` (赤) / `Δ0` (グレー) 形式。スコア差 ±3 未満はグレー中性表示        |

### GAP-05: Task05向け利用前/利用後評価のIPC契約未整備

| 項目     | 内容                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| 現状     | Task05のIPC経路が設計されていない                                             |
| 解決方針 | GAP-01の `evaluatePrompt()` を EP-3 に、`evaluateAfterUse()` を EP-4 に適用   |
| 実装箇所 | `apps/desktop/src/preload/skill-api.ts`（GAP-01と同一ファイルへの追加）       |
| 変更種別 | Preload API追加（GAP-01の延長）                                               |
| 優先度   | P3（設計確定必要）                                                            |
| 注意点   | Task05 向けに `evaluateAfterUse()` はプロンプトではなく実行結果テキストを渡す |

---

## セクション4: スコア履歴保持方針

### 4-1. `previousAnalysis` フィールドの追加

#### Store変更設計（`apps/desktop/src/renderer/store/slices/agentSlice.ts`）

`AgentState` interface の `// === スキルライフサイクル状態（TASK-10A-D） ===` ブロックに追加:

```typescript
// === スキルライフサイクル状態（TASK-10A-D） ===
/** 最新の分析結果 */
currentAnalysis: SkillAnalysis | null;
/** 改善前の分析結果（Δ表示用） ← 追加 */
previousAnalysis: SkillAnalysis | null;
/** 分析処理中フラグ */
isAnalyzing: boolean;
/** 改善適用処理中フラグ */
isImproving: boolean;
```

初期値: `previousAnalysis: null`

#### 更新タイミング仕様

| タイミング             | 操作                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| `analyze()` 呼び出し前 | `previousAnalysis` は変更しない（分析完了後に判断）                          |
| 改善適用前（EP-2）     | `previousAnalysis = currentAnalysis` を保存してから `currentAnalysis` を更新 |
| スキル切り替え時       | `previousAnalysis = null`（別スキルの差分は表示しない）                      |
| Store リセット         | `previousAnalysis = null`                                                    |

### 4-2. スコア履歴エントリ（将来拡張用）

Phase 5実装時点では `previousAnalysis` の単一保持のみ実装する。
複数履歴（`ScoreHistoryEntry[]`）は未タスクとして記録（セクション5参照）。

### 4-3. `PromptEvaluation` とのスコア差分算出

```typescript
// Preload / Renderer どちらで計算しても良いが、表示責務は Renderer
const scoreDelta =
  currentAnalysis.overallScore -
  (previousAnalysis?.overallScore ?? currentAnalysis.overallScore);
// Δ表示ルール: |delta| < 3 → 中性（グレー）、delta > 0 → 改善（緑）、delta < 0 → 低下（赤）
```

---

## セクション5: 型定義追加計画

### 5-1. `ScoringGate` 型（新規追加）

追加先: `packages/shared/src/types/skill-improver.ts`（`PromptEvaluation` 型定義の直後）

```typescript
/**
 * スコアに基づく受け入れゲート判定
 * - NEEDS_IMPROVEMENT: 0-59（改善必須）
 * - SAVE_ALLOWED: 60-79（保存可・改善推奨）
 * - USE_ALLOWED: 80-99（利用可）
 * - RECOMMENDED: 100（推奨）
 */
export type ScoringGate =
  | "NEEDS_IMPROVEMENT"
  | "SAVE_ALLOWED"
  | "USE_ALLOWED"
  | "RECOMMENDED";

/**
 * スコアからゲート判定を算出するユーティリティ関数
 * @param score - 総合スコア (0-100)
 * @returns ScoringGate
 */
export function getScoreGate(score: number): ScoringGate {
  if (score >= 100) return "RECOMMENDED";
  if (score >= 80) return "USE_ALLOWED";
  if (score >= 60) return "SAVE_ALLOWED";
  return "NEEDS_IMPROVEMENT";
}
```

### 5-2. `EvaluatedSkillResult` 型（新規追加・Task03/05の統一レスポンス）

追加先: `packages/shared/src/types/skill-improver.ts`（`ScoringGate` 定義の直後）

```typescript
/**
 * 評価・採点結果の統合レスポンス型（Task03/05共通）
 */
export interface EvaluatedSkillResult {
  /** スキル分析結果（EP-1/EP-2で使用） */
  analysis: SkillAnalysis | null;
  /** プロンプト評価結果 */
  evaluation: PromptEvaluation;
  /** スコアゲート判定 */
  gate: ScoringGate;
  /** 改善前分析結果（Δ表示用、EP-2でのみ有値） */
  previousAnalysis: SkillAnalysis | null;
}
```

### 5-3. `ScoreHistoryEntry` 型（将来拡張用・未タスク）

現フェーズでは定義のみ記録。実装は別タスクで対応。

```typescript
/**
 * スコア履歴エントリ（将来拡張用）
 * 複数改善サイクルのスコア推移を保持する
 */
export interface ScoreHistoryEntry {
  /** 記録日時 */
  recordedAt: Date;
  /** 採点ポイント種別 */
  evaluationPoint: "EP-1" | "EP-2" | "EP-3" | "EP-4";
  /** 総合スコア */
  overallScore: number;
  /** ゲート判定 */
  gate: ScoringGate;
  /** PromptEvaluation（スナップショット） */
  evaluation: PromptEvaluation;
}
```

---

## セクション6: aiworkflow参照仕様との整合性チェック

### 6-1. 必須仕様セット整合性チェック（10件）

| No. | 関心ごと            | 参照先                                                 | 整合性 | 確認内容                                                                                 |
| --- | ------------------- | ------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------- |
| 1   | 導線契約            | `references/ui-ux-navigation.md`                       | PASS   | create/use/improve 導線はTask03/05のI/O契約と矛盾なし                                    |
| 2   | 評価UI契約          | `references/ui-ux-feature-components-reference.md`     | PASS   | `SkillAnalysisView`/`ScoreDisplay` の表示契約は設計と整合                                |
| 3   | ライフサイクル統合  | `references/ui-ux-feature-components.md`               | PASS   | Store-Driven Lifecycle Integration は `previousAnalysis` 追加で拡張可能                  |
| 4   | IPCチャンネル契約   | `references/interfaces-agent-sdk-skill-details.md` L28 | PASS   | `skill:optimize:evaluate → OperationResult<PromptEvaluation>` 整合                       |
| 5   | IPCセキュリティ契約 | `references/security-skill-ipc-core.md` L63            | PASS   | `sender検証 + prompt非空文字列検証（trim()含む）` は既実装済み（L665）                   |
| 6   | IPC全体契約         | `references/api-ipc-system.md`                         | PASS   | チャンネル名 `skill:optimize:evaluate` はホワイトリスト（channels.ts L499）登録済み      |
| 7   | 状態管理契約        | `references/arch-state-management.md`                  | PASS   | `previousAnalysis` は `agentSlice` に追加。State ownership は Main でなく Renderer Store |
| 8   | 全体アーキテクチャ  | `references/architecture-overview.md`                  | PASS   | Renderer→Preload→Main のレイヤー依存方向を遵守                                           |
| 9   | Phase 12 同期先     | `references/task-workflow.md`                          | 確認済 | 完了記録の同期先として登録                                                               |
| 10  | Phase 12 同期先     | `references/lessons-learned.md`                        | 確認済 | 教訓の同期先として登録                                                                   |

### 6-2. 補助仕様セット整合性チェック（4件）

| No. | 関心ごと             | 参照先                                               | 整合性 | 確認内容                                               |
| --- | -------------------- | ---------------------------------------------------- | ------ | ------------------------------------------------------ |
| 1   | Skill型入口仕様      | `references/interfaces-agent-sdk-skill.md`           | PASS   | 既存 `SkillAnalysis`/`PromptEvaluation` 型の拡張は整合 |
| 2   | Electron IPC横断原則 | `references/security-electron-ipc.md`                | PASS   | sender検証は `validateIpcSender` で一元化（既実装）    |
| 3   | 要件品質基準         | `references/quality-requirements.md`                 | PASS   | 受入基準はPhase 1のREQ-01〜15と対応                    |
| 4   | 実装パターン         | `references/architecture-implementation-patterns.md` | PASS   | P42（3段バリデーション）/ P23（型二重定義管理）を適用  |

### 6-3. 参照漏れゼロ確認

| チェック項目                                              | 結果 |
| --------------------------------------------------------- | ---- |
| 必須仕様セット 10件すべてに整合性コメントが記載されている | PASS |
| 補助仕様セット 4件すべてに整合性コメントが記載されている  | PASS |
| GAP-01〜05の全ての解決設計が仕様参照に基づいている        | PASS |
| P42（3段バリデーション）準拠が明示されている              | PASS |
| P23/P32（型定義二重管理）対策が明示されている             | PASS |
| IPC レスポンス形式が仕様書定義と一致している              | PASS |
| 新規チャンネル追加なしで既存チャンネルを再利用する設計    | PASS |

---

## セクション7: Phase 4 テスト連携マトリクス（境界値）

Phase 4のテスト作成で使用する閾値ケースを設計時点で固定する。

### 7-1. ゲート判定境界値マトリクス

| テストケースID | 入力スコア | 期待ゲート        | 期待UI色      | 次導線アクション            |
| -------------- | ---------- | ----------------- | ------------- | --------------------------- |
| UT-GATE-01-a   | 0          | NEEDS_IMPROVEMENT | error（赤）   | SkillAnalysisView 必須表示  |
| UT-GATE-01-b   | 59         | NEEDS_IMPROVEMENT | error（赤）   | SkillAnalysisView 必須表示  |
| UT-GATE-02-a   | 60         | SAVE_ALLOWED      | warning（橙） | 保存可・改善推奨バナー表示  |
| UT-GATE-02-b   | 79         | SAVE_ALLOWED      | warning（橙） | 保存可・改善推奨バナー表示  |
| UT-GATE-03-a   | 80         | USE_ALLOWED       | success（緑） | Workspace への導線開放      |
| UT-GATE-03-b   | 99         | USE_ALLOWED       | success（緑） | Workspace への導線開放      |
| UT-GATE-04     | 100        | RECOMMENDED       | success（緑） | ハイライト表示 + 推奨バッジ |

### 7-2. IPC バリデーションテストケース

| テストケースID | 入力                             | 期待エラー                            |
| -------------- | -------------------------------- | ------------------------------------- |
| UT-IPC-01-a    | `prompt: ""`                     | `VALIDATION_ERROR: prompt must be...` |
| UT-IPC-01-b    | `prompt: "   "` （スペースのみ） | `VALIDATION_ERROR: prompt must be...` |
| UT-IPC-01-c    | `prompt: undefined`              | `VALIDATION_ERROR: prompt must be...` |
| UT-IPC-01-d    | `prompt: "valid prompt"`         | 正常: `PromptEvaluation` を返す       |

### 7-3. スコア差分（Δ）テストケース

| テストケースID | previousScore | currentScore | 期待Δ表示 | 期待色   |
| -------------- | ------------- | ------------ | --------- | -------- | --- | ---- |
| UT-DELTA-01    | 65            | 80           | `Δ+15`    | 緑       |
| UT-DELTA-02    | 80            | 75           | `Δ-5`     | 赤       |
| UT-DELTA-03    | 75            | 76           | `Δ+1`     | グレー（ | Δ   | <3） |
| UT-DELTA-04    | null          | 80           | 非表示    | -        |

---

## 完了条件チェックリスト

- [x] Task03/05 の入出力契約が I/O テーブル形式で定義されている
- [x] IPC契約追加リスト（evaluatePrompt()追加仕様、P42準拠バリデーション）が定義されている
- [x] GAP-01〜05 の解決設計（解決方針・実装箇所）が定義されている
- [x] スコア履歴保持方針（previousAnalysis追加、Store設計変更）が定義されている
- [x] 型定義追加計画（ScoringGate型、EvaluatedSkillResult型、ScoreHistoryEntry型）が定義されている
- [x] aiworkflow参照仕様との整合性チェック（必須10件・補助4件）が完了し、参照漏れゼロを確認
- [x] Phase 4 テスト連携マトリクス（境界値ケース）が定義されている
