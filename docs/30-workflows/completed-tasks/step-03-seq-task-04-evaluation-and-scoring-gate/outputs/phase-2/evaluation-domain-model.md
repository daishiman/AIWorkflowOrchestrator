# Phase 2: 評価ドメインモデル

## 追加した shared 型

| 型                            | 役割                      | 主なフィールド                                                                                                                              |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `EvaluationStage`             | checkpoint の列挙         | `draft`, `post_create`, `post_execute`, `post_improve`                                                                                      |
| `GateStatus`                  | gate 判定結果             | `revise_required`, `save_with_warning`, `use_with_warning`, `use_ready`, `recommended`                                                      |
| `ExecutionQualityEvaluation`  | 実行品質の集約            | `score`, `reliability`, `resultClarity`, `permissionSafety`, `retryReadiness`, `evidence`                                                   |
| `LifecycleEvaluationSnapshot` | 判定の正規化単位          | `skillName`, `stage`, `promptEvaluation`, `skillAnalysis`, `executionQuality`, `totalScore`, `hardBlocks`, `deltaFromPrevious`, `createdAt` |
| `LifecycleGateDecision`       | UI / handoff 用の軽量判定 | `stage`, `status`, `nextSurface`, `summary`, `blockingIssues`, `totalScore`, `recommended`                                                  |

## 実装配置

| ファイル                                        | 役割                  |
| ----------------------------------------------- | --------------------- |
| `packages/shared/src/types/skill-evaluation.ts` | canonical 型定義      |
| `packages/shared/src/types/index.ts`            | barrel export         |
| `packages/shared/index.ts`                      | package public export |

## ドメイン境界

| 境界                        | 所有者                                                    |
| --------------------------- | --------------------------------------------------------- |
| raw prompt evaluation       | Main + preload                                            |
| raw skill analysis          | agentSlice                                                |
| raw execution stream        | agentSlice                                                |
| lifecycle judgment          | `skillEvaluation.ts`                                      |
| persisted / latest decision | `skillEvaluationSlice`                                    |
| UI rendering                | `SkillEvaluationPanel`, `ScoreDisplay`, `SkillCenterView` |

## 重要な設計判断

1. `ExecutionQualityEvaluation` は shared 型に置き、Task05 側でも同じ evidence 文字列を読めるようにした。
2. `LifecycleGateDecision` は UI が必要な要素だけを持ち、full snapshot を直接描画しない。
3. `deltaFromPrevious` は snapshot 保存時にのみ計算し、UI 側で差分計算をやり直さない。
