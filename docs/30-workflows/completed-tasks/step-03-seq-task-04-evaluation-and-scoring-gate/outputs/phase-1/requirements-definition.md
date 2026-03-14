# Phase 1 要件定義成果物: TASK-SKILL-LIFECYCLE-04

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| 生成日       | 2026-03-14                           |
| Phase        | 1                                    |
| 担当SubAgent | SubAgent-A / SubAgent-B / SubAgent-C |
| ステータス   | 完了                                 |

---

## タスク1: 評価対象の3軸定義

### 軸-1: prompt品質（Prompt Quality）

| 評価項目                  | 説明                         | 計測方法           |
| ------------------------- | ---------------------------- | ------------------ |
| Clarity（明確さ）         | 意図が曖昧なく伝わるか       | Claude評価 (0-100) |
| Specificity（具体性）     | 具体的な指示が含まれるか     | Claude評価 (0-100) |
| Completeness（完全性）    | 必要な情報が揃っているか     | Claude評価 (0-100) |
| Reproducibility（再現性） | 同じ結果が安定して得られるか | Claude評価 (0-100) |
| Security（セキュリティ）  | 安全な指示になっているか     | Claude評価 (0-100) |

**総合スコア算出**: `EvaluationBreakdown` の5項目を入力として Claude がスコア計算（0-100）

**実装アンカー**:

- `packages/shared/src/types/skill-improver.ts` の `EvaluationBreakdown` 型（L215-230）
- `apps/desktop/src/main/services/skill/PromptOptimizer.ts` の `evaluate()` メソッド

---

### 軸-2: skill品質（Skill Quality）

| 評価項目           | 説明                     | 計測方法       |
| ------------------ | ------------------------ | -------------- |
| 実装品質           | スキルの構造・記述の品質 | 静的解析       |
| 依存関係           | 外部依存の安全性         | リスクスキャン |
| セキュリティリスク | 悪用可能な指示の有無     | リスクパネル   |
| 提案適用可能性     | 自動修正可能な提案の割合 | autoFixable率  |

**実装アンカー**:

- `packages/shared/src/types/skill-improver.ts` の `SkillAnalysis` 型（L90-108）
- `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` の RiskPanel

---

### 軸-3: 実行結果品質（Execution Result Quality）

| 評価項目     | 説明                       | 計測方法     |
| ------------ | -------------------------- | ------------ |
| 期待結果一致 | 実行結果が期待と一致するか | 利用後再評価 |
| 改善効果     | 改善前後のスコア差分（Δ）  | 再分析比較   |

**現在の実装状態**: 改善後の自動再分析で最新スコアに更新されるが、改善前スコアは保持されない。スコア差分（Δ）表示は**未実装**（要件定義により実装方針を確定する）。

---

## タスク2: 採点ポイント4種の定義

### 採点ポイント一覧

| ID   | タイミング                | 評価軸                 | トリガー                         | 出力                                       |
| ---- | ------------------------- | ---------------------- | -------------------------------- | ------------------------------------------ |
| EP-1 | 作成時（After Create）    | prompt品質 + skill品質 | スキル作成ウィザード完了後       | 初回 `SkillAnalysis`                       |
| EP-2 | 改善時（After Improve）   | prompt品質 + skill品質 | 改善提案適用後の自動再分析       | 更新 `SkillAnalysis` + `ImprovementResult` |
| EP-3 | 利用前（Before Use）      | prompt品質             | Workspace でスキル選択時（任意） | `PromptEvaluation`                         |
| EP-4 | 利用後再評価（After Use） | 実行結果品質           | Agent での実行完了後（任意）     | `PromptEvaluation` 更新                    |

### 採点ポイントの流れ

```
EP-1 (作成後)
   └─ スコアに応じた分岐
       ├─ 0-59 (error): 改善必須 → SkillAnalysisView へ
       ├─ 60-79 (warning): 改善推奨 → 保存可・改善推奨バナー
       └─ 80-100 (success): 利用可 → Workspace への導線

EP-2 (改善後)
   └─ 再分析スコア表示 + 改善差分（Δ）（要実装）
       ├─ スコア上昇 → 改善効果確認 → 利用へ
       └─ スコア横ばい/低下 → 追加改善へ

EP-3 (利用前)
   └─ 任意の品質確認（利用をブロックしない）

EP-4 (利用後再評価)
   └─ 実行結果のフィードバックによる品質更新
```

---

## タスク3: スコア分岐条件の定義

### ゲート判定テーブル

| スコア範囲 | ゲート名            | 判定       | 導線アクション               | UI表示                    |
| ---------- | ------------------- | ---------- | ---------------------------- | ------------------------- |
| 0-59       | `NEEDS_IMPROVEMENT` | 改善へ戻す | SkillAnalysisView を必須表示 | error（赤）+ 改善ボタン   |
| 60-79      | `SAVE_ALLOWED`      | 保存可     | 保存可・改善推奨バナー表示   | warning（橙）+ 改善推奨   |
| 80-99      | `USE_ALLOWED`       | 利用可     | Workspace への導線開放       | success（緑）+ 利用ボタン |
| 100        | `RECOMMENDED`       | 推奨       | ハイライト表示 + 利用ボタン  | success（緑）+ 推奨バッジ |

**実装アンカー**:

```typescript
// 現行実装（ScoreDisplay.tsx L53-57）
export const getScoreVariant = (score: number): ScoreVariant => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "error";
};
```

**追加定義（Phase 2 でゲートロジックとして形式化）**:

- `getScoreGate(score: number): ScoringGate` を `skill-improver.ts` または共通ユーティリティに追加
- `ScoringGate`: `"NEEDS_IMPROVEMENT" | "SAVE_ALLOWED" | "USE_ALLOWED" | "RECOMMENDED"`

---

## タスク4: Task03 / Task05 連携契約の定義

### Task03（作成/改善フロー）との契約

| 入力      | 型     | 提供元                           | 用途           |
| --------- | ------ | -------------------------------- | -------------- |
| skillName | string | Task03（スキル作成ウィザード）   | 評価対象の識別 |
| prompt    | string | Task03（スキルのプロンプト内容） | prompt品質評価 |

| 出力             | 型                 | 受け取り先                  | 用途                     |
| ---------------- | ------------------ | --------------------------- | ------------------------ |
| SkillAnalysis    | `SkillAnalysis`    | Task03（SkillAnalysisView） | 評価結果の表示・改善導線 |
| PromptEvaluation | `PromptEvaluation` | Task03（スコア表示）        | スコア + フィードバック  |
| ScoringGate      | `ScoringGate`      | Task03（導線制御）          | 保存/利用/改善の分岐     |

### Task05（利用/再評価フロー）との契約

| 入力            | 型     | 提供元                         | 用途             |
| --------------- | ------ | ------------------------------ | ---------------- |
| skillName       | string | Task05（Workspace スキル選択） | 評価対象の識別   |
| executionResult | string | Task05（Agent 実行結果）       | 実行結果品質評価 |

| 出力             | 型                 | 受け取り先                 | 用途                     |
| ---------------- | ------------------ | -------------------------- | ------------------------ |
| PromptEvaluation | `PromptEvaluation` | Task05（利用前スコア確認） | 利用可否判定             |
| ScoringGate      | `ScoringGate`      | Task05（再評価導線）       | 利用後の再評価フロー制御 |

### 双方向連携が必要な契約

```
Task03 ──────── evaluateSkill(skillName) ──────→ ScoringGate
Task03 ←──── SkillAnalysis + ScoringGate ────── 評価サービス

Task05 ──────── evaluateBeforeUse(skillName) ──→ ScoringGate
Task05 ←──── PromptEvaluation + ScoringGate ─── 評価サービス
Task05 ──────── evaluateAfterUse(result) ──────→ PromptEvaluation（更新）
```

---

## タスク5: aiworkflow-requirements 仕様抽出結果

### 抽出結果確認

`./aiworkflow-requirements-extraction.md` に定義された必須仕様セット10件・補助仕様4件・実装アンカー8件の照合結果:

| 種別         | 件数 | 結果                 |
| ------------ | ---- | -------------------- |
| 必須仕様     | 10   | PASS（全件確認済み） |
| 補助仕様     | 4    | PASS（全件確認済み） |
| 実装アンカー | 8    | PASS（全件照合済み） |

---

## 要件-テストID対応表（Phase 4 連携用）

| 要件ID | 要件内容                          | テストID候補    |
| ------ | --------------------------------- | --------------- |
| REQ-01 | prompt品質の5軸評価               | UT-SCORE-01〜05 |
| REQ-02 | skill品質評価（分析・リスク）     | UT-SKILL-01〜03 |
| REQ-03 | 実行結果品質評価                  | UT-EXEC-01〜02  |
| REQ-04 | EP-1 作成時採点                   | IT-EP1-01〜03   |
| REQ-05 | EP-2 改善時採点                   | IT-EP2-01〜03   |
| REQ-06 | EP-3 利用前採点                   | IT-EP3-01       |
| REQ-07 | EP-4 利用後再評価                 | IT-EP4-01       |
| REQ-08 | ゲート NEEDS_IMPROVEMENT（0-59）  | UT-GATE-01      |
| REQ-09 | ゲート SAVE_ALLOWED（60-79）      | UT-GATE-02      |
| REQ-10 | ゲート USE_ALLOWED（80-99）       | UT-GATE-03      |
| REQ-11 | ゲート RECOMMENDED（100）         | UT-GATE-04      |
| REQ-12 | Task03 連携契約                   | IT-T03-01〜03   |
| REQ-13 | Task05 連携契約                   | IT-T05-01〜02   |
| REQ-14 | Preload API evaluatePrompt() 追加 | UT-IPC-01       |
| REQ-15 | スコア差分（Δ）表示               | UT-DELTA-01〜02 |

---

## 既存実装との差分（Phase 5 で対応必須）

| ID     | 内容                                                   | 優先度         |
| ------ | ------------------------------------------------------ | -------------- |
| GAP-01 | Preload API に `evaluatePrompt()` メソッドが欠落       | P1（必須）     |
| GAP-02 | `ScoringGate` 型が未定義（`getScoreVariant` は色のみ） | P1（必須）     |
| GAP-03 | 改善前スコア（`previousAnalysis`）が保持されない       | P2（重要）     |
| GAP-04 | スコア差分（Δ）表示 UI が未実装                        | P2（重要）     |
| GAP-05 | Task05 向けの利用前/利用後評価の IPC 契約が未整備      | P3（設計必要） |

---

## 完了条件チェックリスト

- [x] 3軸評価と4採点ポイントが定義されている
- [x] スコア分岐条件が定義されている（4段階ゲート）
- [x] Task03/05 連携契約が定義されている
- [x] aiworkflow 抽出手順が再現可能な形で記録されている（aiworkflow-requirements-extraction.md）
