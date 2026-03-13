# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| タスクID   | TASK-SKILL-LIFECYCLE-04         |
| 前提Phase  | Phase 1（要件定義）             |
| 後続Phase  | Phase 3（設計レビューゲート）   |
| ステータス | completed                       |
| 作成日     | 2026-03-12                      |
| 機能名     | skill-lifecycle-evaluation-gate |

## 目的

Task03 と Task05 が共有できる評価モデル、gate engine、state ownership、UI integration、履歴保存契約を設計する。

## 実行タスク

- ドメインモデル設計: `LifecycleEvaluationSnapshot` `LifecycleGateDecision` `ExecutionQualityEvaluation` を定義する
- Gate engine 設計: 60 / 80 閾値、hard block、改善前後差分、理由文生成の判定手順を設計する
- 状態管理設計: Task03 の create / execute / improve と Task05 の use にまたがる評価 state の ownership を設計する
- UI統合設計: `SkillLifecyclePanel` `SkillAnalysisView` `ScoreDisplay` と Task05 usage surface の表示責務を設計する
- Handoff / history 設計: Task03 からのイベント入力、Task05 への再利用、履歴保存、Atent Team 内部 role を設計する

### 型設計

```ts
type EvaluationStage =
  | "draft"
  | "post_create"
  | "post_execute"
  | "post_improve";

type GateStatus =
  | "revise_required"
  | "save_with_warning"
  | "use_with_warning"
  | "use_ready"
  | "recommended";

interface ExecutionQualityEvaluation {
  score: number;
  reliability: number;
  resultClarity: number;
  permissionSafety: number;
  retryReadiness: number;
  evidence: string[];
}

interface LifecycleEvaluationSnapshot {
  skillName: string;
  stage: EvaluationStage;
  promptEvaluation?: PromptEvaluation;
  skillAnalysis?: SkillAnalysis;
  executionQuality?: ExecutionQualityEvaluation;
  totalScore: number;
  hardBlocks: string[];
  deltaFromPrevious?: number;
  createdAt: string;
}

interface LifecycleGateDecision {
  stage: EvaluationStage;
  status: GateStatus;
  nextSurface: "skillCreator" | "skillCenter" | "workspace" | "agent";
  summary: string;
  blockingIssues: string[];
}
```

### 合成スコア設計

| Stage          | prompt品質 | skill品質 | execution品質 | 備考                      |
| -------------- | ---------- | --------- | ------------- | ------------------------- |
| `draft`        | 100%       | 0%        | 0%            | 作成依頼文の事前判定      |
| `post_create`  | 35%        | 65%       | 0%            | 作成直後の保存 / 改善分岐 |
| `post_execute` | 20%        | 40%       | 40%           | 利用開始可否を判定        |
| `post_improve` | 20%        | 50%       | 30%           | 再評価と差分を判定        |

### hard block 設計

| 条件                                               | block 理由              | 許可しない状態             |
| -------------------------------------------------- | ----------------------- | -------------------------- |
| `PromptEvaluation.breakdown.security < 70`         | 危険な prompt 指示      | `use_ready`, `recommended` |
| `SkillAnalysis.risks` に `critical` が存在         | 致命的リスク            | `save_with_warning` 以上   |
| `ExecutionQualityEvaluation.permissionSafety < 70` | permission 境界が不十分 | `use_with_warning` 以上    |
| 実行結果が失敗し retry 根拠がない                  | 再実行前提が不足        | `use_ready`, `recommended` |

### gate decision 設計

| 判定                | 条件                                                              | nextSurface                | 画面表現                      |
| ------------------- | ----------------------------------------------------------------- | -------------------------- | ----------------------------- |
| `revise_required`   | hard block あり、または `totalScore < 60`                         | `skillCreator`             | error badge + 改善 CTA        |
| `save_with_warning` | `totalScore 60-79`、hard block なし                               | `skillCenter`              | warning badge + 保存許可      |
| `use_with_warning`  | `post_execute` で warning 残存                                    | `agent`                    | warning badge + 改善 shortcut |
| `use_ready`         | `totalScore >= 80`、hard block なし                               | `workspace` または `agent` | success badge                 |
| `recommended`       | `post_improve` で `deltaFromPrevious > 0` かつ `totalScore >= 80` | `workspace`                | recommendation badge          |

### state ownership 設計

| state                                                           | 所有者                                | 理由                                  |
| --------------------------------------------------------------- | ------------------------------------- | ------------------------------------- |
| `currentAnalysis` `isAnalyzing` `isImproving`                   | 既存 `agentSlice`                     | 既存 skill lifecycle state を維持する |
| `latestGateDecision` `evaluationHistory` `lastExecutionQuality` | 新規 `skillEvaluationSlice`           | Task04 固有責務を分離する             |
| session narrative                                               | `SkillLifecyclePanel` local state     | 会話ログ表示専用                      |
| Task05 usage banner state                                       | Task05 surface local state + selector | usage surface 表示に限定する          |

### UI統合設計

| surface               | 追加要素                                           | 参照実装                                                                                                    |
| --------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `SkillLifecyclePanel` | checkpoint ごとの gate summary、次アクションボタン | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                        |
| `SkillAnalysisView`   | gate decision summary、hard block 理由、再評価 CTA | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                                          |
| `ScoreDisplay`        | threshold に対応する gate badge と delta 表示      | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`                                               |
| Task05 usage surface  | 最終評価表示、再評価ボタン、warning shortcut       | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md` |

### 内部チーム設計

| role      | 入力                                 | 出力                                          |
| --------- | ------------------------------------ | --------------------------------------------- |
| Planner   | 作成依頼文、mode 判定                | `draft` snapshot                              |
| Evaluator | prompt / analysis / execution データ | totalScore と gate decision                   |
| Trust     | permission / risk データ             | hard block 一覧                               |
| Usage     | Task05 の再評価要求                  | `post_execute` または `post_improve` の再計算 |

## 参照資料

| 参照資料                     | パス                                                                                                                      | 説明                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 1 要件                 | `phase-1-requirements.md`                                                                                                 | 評価軸、checkpoint、gate 要件     |
| Phase 1 生成成果物           | `outputs/phase-1/evaluation-requirements-matrix.md`                                                                       | FR / NFR / AC 一覧                |
| Phase 1 checkpoint 定義      | `outputs/phase-1/checkpoint-gate-matrix.md`                                                                               | 4 checkpoint と 5 gate 状態       |
| Task03 設計                  | `../../skill-lifecycle-unification/tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | create / execute / improve 主導線 |
| Task05 要件                  | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/index.md`                        | usage journey の受け側責務        |
| SkillAnalysis completed task | `docs/30-workflows/completed-tasks/skill-analysis-view/index.md`                                                          | 既存 scoring UI の完成形          |
| Store-driven lifecycle task  | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/index.md`                                                    | Renderer direct IPC 排除の前提    |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                                                  |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | surface ownership board                               |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | lifecycle entry canonicalization と slice 責務        |
| api-ipc-agent            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`            | Task03 の Renderer 統合契約                           |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | `SkillAnalysisView` `ScoreDisplay` `useSkillAnalysis` |
| security-skill-execution | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | create / execute / improve の権限境界                 |

## 実行手順

### ステップ1: ドメイン型と checkpoint 別スコア計算を設計する

shared type と renderer state に置く型を分け、checkpoint ごとの重みを定義する。

### ステップ2: hard block と gate engine を設計する

security、critical risk、permission を block 判定へ集約し、理由文生成と nextSurface 決定を設計する。

### ステップ3: state ownership と UI 組み込み点を設計する

`agentSlice` と新規 `skillEvaluationSlice` の責務を分離し、Task03 / Task05 の描画地点を固定する。

### ステップ4: 履歴保存と再評価フローを設計する

改善前後差分、Task05 からの再評価、Phase 11 / 12 証跡に必要な履歴最小単位を定義する。

## 統合テスト連携

| 観点    | 対象                                                                     | Phase 2 で固定する内容                    |
| ------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| 型契約  | shared types / store slice                                               | snapshot と gate decision の型境界        |
| IPC契約 | `skill:create` `skill:execute` `skill:analyze` `skill:optimize:evaluate` | どの戻り値をどの stage に流すか           |
| UI契約  | Task03 surface / Task05 surface                                          | badge、warning、recommendation の表示位置 |
| 履歴    | evaluation history                                                       | 再評価時の前回比較ルール                  |

## 成果物

| 成果物           | パス                                                | 内容                           |
| ---------------- | --------------------------------------------------- | ------------------------------ |
| ドメインモデル   | `outputs/phase-2/evaluation-domain-model.md`        | 型設計と責務                   |
| gate engine 設計 | `outputs/phase-2/gate-decision-design.md`           | 閾値、hard block、nextSurface  |
| state 設計       | `outputs/phase-2/state-management-design.md`        | slice と selector の ownership |
| handoff 契約     | `outputs/phase-2/task03-task05-handoff-contract.md` | Task03 / Task05 接続表         |

## 完了条件

- [x] `LifecycleEvaluationSnapshot` と `LifecycleGateDecision` の型が定義されている
- [x] Stage 別の重みと hard block が表形式で定義されている
- [x] `agentSlice` と `skillEvaluationSlice` の責務境界が定義されている
- [x] Task03 / Task05 の UI 組み込み点が定義されている
- [x] 評価履歴と再評価フローが定義されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 3: 設計レビューゲート](./phase-3-design-review.md) に進む
