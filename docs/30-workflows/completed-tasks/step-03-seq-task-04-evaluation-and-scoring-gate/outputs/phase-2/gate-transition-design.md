# ゲート遷移設計書: TASK-SKILL-LIFECYCLE-04

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| 生成日     | 2026-03-14                                   |
| Phase      | 2                                            |
| タスクID   | TASK-SKILL-LIFECYCLE-04                      |
| 前提成果物 | `outputs/phase-1/requirements-definition.md` |
| ステータス | 完了                                         |

---

## 1. 4段階ゲートの判定式

### 1.1 ScoringGate 型定義

```typescript
// packages/shared/src/types/skill-improver.ts に追加
export type ScoringGate =
  | "NEEDS_IMPROVEMENT"
  | "SAVE_ALLOWED"
  | "USE_ALLOWED"
  | "RECOMMENDED";
```

### 1.2 getScoreGate 判定式

```typescript
// packages/shared/src/types/skill-improver.ts に追加
export const GATE_THRESHOLD = {
  NEEDS_IMPROVEMENT_MAX: 59, // 0-59: 改善必須
  SAVE_ALLOWED_MIN: 60, // 60-79: 保存可
  USE_ALLOWED_MIN: 80, // 80-99: 利用可
  RECOMMENDED: 100, // 100: 推奨
} as const;

/**
 * スコアから4段階ゲートを判定する
 *
 * 判定式（境界値を含む）:
 *   score === 100              → RECOMMENDED
 *   score >= 80 && score < 100 → USE_ALLOWED
 *   score >= 60 && score < 80  → SAVE_ALLOWED
 *   score < 60                 → NEEDS_IMPROVEMENT
 *
 * @param score - 0以上100以下の整数
 * @returns ScoringGate
 */
export function getScoreGate(score: number): ScoringGate {
  if (score === 100) return "RECOMMENDED";
  if (score >= 80) return "USE_ALLOWED";
  if (score >= 60) return "SAVE_ALLOWED";
  return "NEEDS_IMPROVEMENT";
}
```

### 1.3 境界値の明示

| スコア | 境界 | ゲート判定結果    | 理由                 |
| ------ | ---- | ----------------- | -------------------- |
| 0      | 下限 | NEEDS_IMPROVEMENT | 最低スコア           |
| 59     | 上限 | NEEDS_IMPROVEMENT | 60未満の最高値       |
| 60     | 下限 | SAVE_ALLOWED      | 保存可ゾーンの開始点 |
| 79     | 上限 | SAVE_ALLOWED      | 80未満の最高値       |
| 80     | 下限 | USE_ALLOWED       | 利用可ゾーンの開始点 |
| 99     | 上限 | USE_ALLOWED       | 100未満の最高値      |
| 100    | 固定 | RECOMMENDED       | 満点のみ（等値比較） |

### 1.4 既存 getScoreVariant との対応

| ScoringGate       | ScoreVariant | 表示色 | 意味             |
| ----------------- | ------------ | ------ | ---------------- |
| NEEDS_IMPROVEMENT | error        | 赤     | 改善必須         |
| SAVE_ALLOWED      | warning      | 橙     | 保存可・改善推奨 |
| USE_ALLOWED       | success      | 緑     | 利用可           |
| RECOMMENDED       | success      | 緑     | 推奨・ハイライト |

注: 既存の `getScoreVariant` (ScoreDisplay.tsx L53-57) はUI色分けを継続利用する。
`getScoreGate` は導線制御（保存可否・利用可否）の判定専用として独立させる。

---

## 2. 各ゲートでの導線アクション詳細

### 2.1 NEEDS_IMPROVEMENT（スコア 0-59）

**状態**: 改善必須。保存ボタン・利用ボタンはいずれも無効。

| コンポーネント         | 役割       | アクション                                                            |
| ---------------------- | ---------- | --------------------------------------------------------------------- |
| ScoreDisplay           | スコア表示 | 総合スコアを error 色（赤）で表示                                     |
| ScoringGateBanner      | ゲート通知 | 「スコアが低すぎます。改善してからご利用ください」バナー表示（error） |
| ImproveSuggestionPanel | 改善提案   | SkillAnalysis.suggestions を priority:high 順に列挙                   |
| SaveButton             | 保存ボタン | disabled 状態。aria-disabled="true"、tooltip で理由を表示             |
| UseButton              | 利用ボタン | disabled 状態。aria-disabled="true"、tooltip で理由を表示             |
| ImproveButton          | 改善ボタン | enabled。クリックで SkillAnalysisView へ遷移（必須導線）              |

**SkillAnalysisView への遷移トリガー**:

- ユーザーが改善ボタンをクリック（任意）
- 保存/利用ボタン押下時はインターセプトして改善を促す（強制）

### 2.2 SAVE_ALLOWED（スコア 60-79）

**状態**: 保存可だが改善推奨。利用ボタンは無効（80未満のため）。

| コンポーネント         | 役割       | アクション                                                      |
| ---------------------- | ---------- | --------------------------------------------------------------- |
| ScoreDisplay           | スコア表示 | 総合スコアを warning 色（橙）で表示                             |
| ScoringGateBanner      | ゲート通知 | 「保存できます。利用前に改善を推奨します」バナー表示（warning） |
| ImproveSuggestionPanel | 改善提案   | SkillAnalysis.suggestions を推奨として列挙                      |
| SaveButton             | 保存ボタン | enabled。保存完了後に Workspace 導線を提示                      |
| UseButton              | 利用ボタン | disabled 状態。「スコア80以上で利用可能」tooltip 表示           |
| ImproveButton          | 改善ボタン | enabled。クリックで SkillAnalysisView へ遷移（推奨）            |

### 2.3 USE_ALLOWED（スコア 80-99）

**状態**: 利用可。保存・利用ともに開放。改善は任意。

| コンポーネント    | 役割               | アクション                                          |
| ----------------- | ------------------ | --------------------------------------------------- |
| ScoreDisplay      | スコア表示         | 総合スコアを success 色（緑）で表示                 |
| ScoringGateBanner | ゲート通知         | 「スキルは利用可能な品質です」バナー表示（success） |
| SaveButton        | 保存ボタン         | enabled                                             |
| UseButton         | 利用ボタン         | enabled。クリックで Workspace または Agent へ遷移   |
| ImproveButton     | 改善ボタン（任意） | enabled。任意改善として表示                         |

### 2.4 RECOMMENDED（スコア 100）

**状態**: 推奨。満点バッジを付与。導線は USE_ALLOWED と同一。

| コンポーネント    | 役割       | アクション                                              |
| ----------------- | ---------- | ------------------------------------------------------- |
| ScoreDisplay      | スコア表示 | 総合スコアを success 色（緑）で表示 + 「100」強調       |
| RecommendedBadge  | 推奨バッジ | 「推奨」バッジを ScoreDisplay に重ねて表示              |
| ScoringGateBanner | ゲート通知 | 「このスキルは推奨品質です」バナー表示（success、強調） |
| SaveButton        | 保存ボタン | enabled                                                 |
| UseButton         | 利用ボタン | enabled。「推奨スキルを使う」ラベルでハイライト         |

---

## 3. EP-1〜EP-4 の採点ポイント遷移図

```
スキル作成ウィザード完了
        |
        v
[ EP-1: 作成時採点 ]
  評価軸: prompt品質 + skill品質
  型: SkillAnalysis
  トリガー: 作成ウィザード完了 (skill:analyze IPC)
        |
        |--- getScoreGate(overallScore) --->+
        |                                  |
     NEEDS_IMPROVEMENT (0-59)       SAVE_ALLOWED (60-79)     USE_ALLOWED/RECOMMENDED (80+)
        |                                  |                          |
        v                                  v                          v
  SkillAnalysisView               保存可 + 改善推奨バナー     Workspace/Agent 導線開放
  (改善必須表示)                          |                          |
        |                                  |                          |
        v                                  v                          |
  改善提案を適用                    改善ボタン (任意)                |
        |                                  |                          |
        +----------------------------------+                          |
        |                                                             |
        v                                                             |
[ EP-2: 改善時採点 ]                                                  |
  評価軸: prompt品質 + skill品質                                      |
  型: SkillAnalysis + ImprovementResult                               |
  トリガー: 改善提案適用後の自動再分析 (skill:analyze IPC)           |
        |                                                             |
        |--- getScoreGate(overallScore) --->+                         |
        |                                  |                          |
     スコア低下/横ばい              スコア上昇 (改善効果確認)         |
        |                                  |                          |
        v                                  v                          |
  追加改善へ戻る                   Workspace/Agent 導線              |
                                   (Δスコア表示)                     |
                                                                      |
        +---------------------------------------------------------+   |
        |                                                         |   |
        v                                                         |   |
[ EP-3: 利用前採点 (任意) ]  <------------------------------------+---+
  評価軸: prompt品質
  型: PromptEvaluation
  トリガー: Workspace でスキル選択時 (skill:optimize:evaluate IPC)
  利用をブロックしない（確認のみ）
        |
        v
  Agent でスキル実行
        |
        v
[ EP-4: 利用後再評価 (任意) ]
  評価軸: 実行結果品質
  型: PromptEvaluation (更新)
  トリガー: Agent 実行完了後 (skill:optimize:evaluate IPC)
        |
        |--- getScoreGate(score) --> 改善が必要なら EP-2 フローへ戻す
        |
        v
  評価完了 (ライフサイクル継続)
```

---

## 4. Task03（作成/改善）フローでのゲート遷移

### 4.1 フロー概要

Task03 はスキルの**作成**と**改善**の両フローを担う。評価は EP-1（作成直後）と EP-2（改善直後）で実施される。

### 4.2 作成フロー（EP-1 相当）

```
[SkillCreateWizard]
  スキル定義入力
        |
        v
  作成確定ボタン
        |
        v  IPC: skill:analyze (skillName)
        |
        v
  [評価サービス: PromptOptimizer.evaluate()]
  → SkillAnalysis { overallScore, categories, suggestions, risks }
        |
        v
  [getScoreGate(overallScore)]
        |
  +-----+-----+-----+
  |           |     |
  v           v     v
NEEDS_     SAVE_  USE_ALLOWED
IMPROVEMENT ALLOWED  / RECOMMENDED
  |           |     |
  v           v     v
SkillAnalysis 保存可  利用ボタン
View表示   バナー  開放
(改善必須)  表示
```

### 4.3 改善フロー（EP-2 相当）

```
[SkillAnalysisView]
  改善提案を選択・適用
        |
        v  IPC: skill:improve (skillName, suggestions)
        |
        v
  [改善サービス: SkillImprover.improve()]
  → ImprovementResult { applied, skipped, errors }
        |
        v  自動再分析トリガー
        |
        v  IPC: skill:analyze (skillName)
        |
        v
  [評価サービス: PromptOptimizer.evaluate()]
  → SkillAnalysis { overallScore, categories }
        |
        v
  previousScore (改善前) を保持して Δ を計算
  → delta = newScore - previousScore
        |
        v
  [getScoreGate(newScore)]
        |
  Δスコア表示 + ゲートに応じた導線制御
```

### 4.4 Task03 への入出力契約（要約）

| 方向 | 項目             | 型               | 説明                             |
| ---- | ---------------- | ---------------- | -------------------------------- |
| 入力 | skillName        | string           | 評価対象スキル識別子             |
| 入力 | prompt           | string           | スキルのプロンプト内容           |
| 出力 | SkillAnalysis    | SkillAnalysis    | 評価結果（スコア・提案・リスク） |
| 出力 | ScoringGate      | ScoringGate      | 導線制御用ゲート判定結果         |
| 出力 | PromptEvaluation | PromptEvaluation | 詳細スコア内訳                   |

---

## 5. Task05（利用）フローでのゲート遷移

### 5.1 フロー概要

Task05 はスキルの**利用**と**利用後再評価**を担う。評価は EP-3（利用前）と EP-4（利用後）で実施される。どちらも任意であり、利用をブロックしない。

### 5.2 利用前評価フロー（EP-3 相当）

```
[Workspace]
  スキルを選択
        |
        v  (任意) IPC: skill:optimize:evaluate (skillName)
        |
        v
  [評価サービス: PromptOptimizer.evaluate()]
  → PromptEvaluation { score, breakdown, feedback }
        |
        v
  [getScoreGate(score)]
        |
  ゲート別バナーを表示（利用はブロックしない）
        |
        v
  Agent へ実行を渡す（利用ボタン常時有効）
```

### 5.3 利用後再評価フロー（EP-4 相当）

```
[Agent]
  スキル実行完了
        |
        v  実行結果: executionResult (string)
        |
        v  (任意) IPC: skill:optimize:evaluate (skillName, executionResult)
        |
        v
  [評価サービス: PromptOptimizer.evaluate()]
  → PromptEvaluation (更新) { score, feedback }
        |
        v
  [getScoreGate(score)]
        |
  +-----+-----+
  |           |
  v           v
NEEDS_     SAVE_ALLOWED/
IMPROVEMENT  USE_ALLOWED
  |           |
  v           v
改善フローへ  評価完了
の誘導       (スコア履歴更新)
```

### 5.4 Task05 への入出力契約（要約）

| 方向 | 項目             | 型               | 説明                         |
| ---- | ---------------- | ---------------- | ---------------------------- |
| 入力 | skillName        | string           | 評価対象スキル識別子         |
| 入力 | executionResult  | string           | Agent の実行結果（EP-4のみ） |
| 出力 | PromptEvaluation | PromptEvaluation | スコア + フィードバック      |
| 出力 | ScoringGate      | ScoringGate      | 再評価後の導線制御判定       |

---

## 6. 改善前後スコア比較（Δ表示）の実装方針

### 6.1 問題の背景

Phase 1 要件定義（GAP-03）で確認の通り、現行実装は改善後の自動再分析で最新スコアに上書きされ、改善前スコアが保持されない。Δ表示は未実装（GAP-04）。

### 6.2 状態保持方針

EP-2（改善時採点）のタイミングで、改善実行直前の `SkillAnalysis.overallScore` を `previousScore` としてコンポーネントの state または Store に保持する。

```typescript
// useSkillAnalysis フック内の拡張イメージ
interface SkillAnalysisState {
  currentAnalysis: SkillAnalysis | null;
  previousScore: number | null; // 追加: 改善前スコア
  scoreDelta: number | null; // 追加: Δ = current - previous
}

// 改善実行前に previousScore をスナップショット
function captureScoreBeforeImprovement(currentScore: number): void {
  setState((prev) => ({
    ...prev,
    previousScore: currentScore,
  }));
}

// 再分析完了後に Δ を計算
function updateAfterReanalysis(newAnalysis: SkillAnalysis): void {
  setState((prev) => ({
    ...prev,
    currentAnalysis: newAnalysis,
    scoreDelta:
      prev.previousScore !== null
        ? newAnalysis.overallScore - prev.previousScore
        : null,
  }));
}
```

### 6.3 Δ表示 UI 方針

```
ScoreDisplay コンポーネント内:

  総合スコア
  ┌─────────────────┐
  │       85        │   ← currentAnalysis.overallScore
  │  +12 (73→85)   │   ← delta > 0: success色 "+" プレフィックス
  └─────────────────┘

  delta < 0 → error 色で "-N" 表示
  delta = 0 → warning 色で "±0 変化なし" 表示
  delta = null → 非表示（初回評価時）
```

### 6.4 保持スコープと有効期間

| スコープ     | 保持場所                                       | 有効期間                                         |
| ------------ | ---------------------------------------------- | ------------------------------------------------ |
| セッション内 | コンポーネント state または Zustand skillSlice | 改善フロー中のみ保持。スキル切り替え時にリセット |
| 永続化       | 対象外                                         | Δ表示は操作フィードバック目的のため永続化しない  |

### 6.5 実装ファイルと変更箇所

| ファイル                                                               | 変更内容                                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `packages/shared/src/types/skill-improver.ts`                          | `ScoringGate` 型・`getScoreGate()` 関数を追加                                |
| `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | `previousScore`・`scoreDelta` state を追加。改善前スナップショット処理を追加 |
| `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`          | Δ表示サブコンポーネント `ScoreDelta` を追加                                  |
| `apps/desktop/src/renderer/components/skill/ScoringGateBanner.tsx`     | 新規作成。ゲート別バナーコンポーネント                                       |

---

## 7. Phase 4 テスト設計用マトリクス

### 7.1 getScoreGate 単体テスト（入力値 / 期待ゲート / 次導線）

| テストID    | 入力スコア | 期待 ScoringGate  | 期待 ScoreVariant | 次導線（UIアクション）                      | 境界値ケース |
| ----------- | ---------- | ----------------- | ----------------- | ------------------------------------------- | ------------ |
| UT-GATE-01a | 0          | NEEDS_IMPROVEMENT | error             | ImproveButton enabled、SaveButton disabled  | 下限         |
| UT-GATE-01b | 30         | NEEDS_IMPROVEMENT | error             | ImproveButton enabled、SaveButton disabled  | 中間値       |
| UT-GATE-01c | 59         | NEEDS_IMPROVEMENT | error             | ImproveButton enabled、SaveButton disabled  | 上限境界     |
| UT-GATE-02a | 60         | SAVE_ALLOWED      | warning           | SaveButton enabled、UseButton disabled      | 下限境界     |
| UT-GATE-02b | 70         | SAVE_ALLOWED      | warning           | SaveButton enabled、UseButton disabled      | 中間値       |
| UT-GATE-02c | 79         | SAVE_ALLOWED      | warning           | SaveButton enabled、UseButton disabled      | 上限境界     |
| UT-GATE-03a | 80         | USE_ALLOWED       | success           | UseButton enabled、Workspace/Agent 導線開放 | 下限境界     |
| UT-GATE-03b | 90         | USE_ALLOWED       | success           | UseButton enabled、Workspace/Agent 導線開放 | 中間値       |
| UT-GATE-03c | 99         | USE_ALLOWED       | success           | UseButton enabled、Workspace/Agent 導線開放 | 上限境界     |
| UT-GATE-04a | 100        | RECOMMENDED       | success           | UseButton ハイライト、RecommendedBadge 表示 | 固定値       |

### 7.2 Δスコア表示テスト

| テストID    | previousScore | newScore | 期待 delta | 期待表示              | ケース               |
| ----------- | ------------- | -------- | ---------- | --------------------- | -------------------- |
| UT-DELTA-01 | 73            | 85       | +12        | "+12 (73→85)" success | スコア上昇           |
| UT-DELTA-02 | 80            | 65       | -15        | "-15 (80→65)" error   | スコア低下           |
| UT-DELTA-03 | 70            | 70       | 0          | "±0 変化なし" warning | 変化なし             |
| UT-DELTA-04 | null          | 85       | null       | 非表示                | 初回評価（Δ非表示）  |
| UT-DELTA-05 | 59            | 60       | +1         | "+1 (59→60)" success  | NEEDS→SAVE 境界遷移  |
| UT-DELTA-06 | 79            | 80       | +1         | "+1 (79→80)" success  | SAVE→USE 境界遷移    |
| UT-DELTA-07 | 99            | 100      | +1         | "+1 (99→100)" success | USE→RECOMMENDED 境界 |

### 7.3 Task03 連携テスト（EP-1 / EP-2）

| テストID  | 採点ポイント | 入力スコア | 期待ゲート        | 期待 UI アクション                         |
| --------- | ------------ | ---------- | ----------------- | ------------------------------------------ |
| IT-EP1-01 | EP-1 作成後  | 50         | NEEDS_IMPROVEMENT | SkillAnalysisView 表示、保存/利用 disabled |
| IT-EP1-02 | EP-1 作成後  | 75         | SAVE_ALLOWED      | 保存可バナー表示、利用 disabled            |
| IT-EP1-03 | EP-1 作成後  | 85         | USE_ALLOWED       | 利用ボタン開放、Workspace 導線表示         |
| IT-EP2-01 | EP-2 改善後  | 73→85      | USE_ALLOWED       | Δ+12 表示、利用ボタン開放                  |
| IT-EP2-02 | EP-2 改善後  | 59→60      | SAVE_ALLOWED      | ゲート昇格、Δ+1 表示、保存可バナー         |
| IT-EP2-03 | EP-2 改善後  | 80→75      | SAVE_ALLOWED      | ゲート降格、Δ-5 表示、利用 disabled        |

### 7.4 Task05 連携テスト（EP-3 / EP-4）

| テストID  | 採点ポイント | 入力スコア | 期待ゲート        | 期待 UI アクション                   |
| --------- | ------------ | ---------- | ----------------- | ------------------------------------ |
| IT-EP3-01 | EP-3 利用前  | 55         | NEEDS_IMPROVEMENT | 警告バナー表示、利用はブロックしない |
| IT-EP4-01 | EP-4 利用後  | 85→60      | SAVE_ALLOWED      | 改善フローへの誘導リンク表示         |
| IT-EP4-02 | EP-4 利用後  | 80→50      | NEEDS_IMPROVEMENT | 改善フローへの強い誘導表示           |

### 7.5 要件ID 対応表

| 要件ID | 要件内容                         | 本マトリクスのテストID       |
| ------ | -------------------------------- | ---------------------------- |
| REQ-08 | ゲート NEEDS_IMPROVEMENT（0-59） | UT-GATE-01a, 01b, 01c        |
| REQ-09 | ゲート SAVE_ALLOWED（60-79）     | UT-GATE-02a, 02b, 02c        |
| REQ-10 | ゲート USE_ALLOWED（80-99）      | UT-GATE-03a, 03b, 03c        |
| REQ-11 | ゲート RECOMMENDED（100）        | UT-GATE-04a                  |
| REQ-12 | Task03 連携契約                  | IT-EP1-01〜03, IT-EP2-01〜03 |
| REQ-13 | Task05 連携契約                  | IT-EP3-01, IT-EP4-01〜02     |
| REQ-15 | スコア差分（Δ）表示              | UT-DELTA-01〜07              |

---

## 付記: 設計制約と前提

1. **EP-3・EP-4 は利用をブロックしない**: 利用前/後の評価は品質確認目的のみ。ゲート判定結果によらず Agent 実行は常に可能とする。
2. **getScoreGate と getScoreVariant は独立して共存する**: 導線制御に `getScoreGate`、UI色分けに `getScoreVariant` を使い、責務を分離する。
3. **Δ表示は永続化しない**: セッション内の操作フィードバックとして機能し、Store への長期保存は行わない。
4. **境界値は閉区間で定義**: スコア60と80は `>=` 演算子（閉区間）で判定する。等値比較は100のみ（`=== 100`）。
5. **ScoringGate の配置**: `packages/shared/src/types/skill-improver.ts` に追加し、Renderer・Main・Preload の全層で参照可能とする。
