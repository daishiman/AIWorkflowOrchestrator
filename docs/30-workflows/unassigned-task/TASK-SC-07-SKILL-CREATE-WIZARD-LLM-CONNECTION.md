# TASK-SC-07: SkillCreateWizard への LLM 生成フロー接続

## 概要

SkillCreateWizard の4段階フローに planSkill/executePlan を接続する。
Phase 2 設計でスコープ外とした未タスク（R-2）。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION で SkillLifecyclePanel への接続を完了した。
SkillCreateWizard（GenerateStep）への接続は独立した別タスクで対応する。

## 変更対象ファイル

- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
- apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx

## 受入基準

- DescribeStep で「LLM で生成」を選択した場合、planSkill が呼ばれる
- GenerateStep で plan 結果が表示される
- 既存の「テンプレートから作成」フローは非破壊

## 苦戦箇所（TASK-SC-06 実装知見）

| 苦戦箇所                            | 問題                                                                                                                                                                        | 解決策                                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| executePlan 引数不足（C-1）         | SkillCreatorRuntimeApi のローカル型では `skillSpec?: unknown`（optional）だが、Preload API は `skillSpec: string`（必須）。型の不整合でコンパイルは通るがランタイムでエラー | Preload API の実シグネチャを必ず確認し、ローカル型を合わせる。P44/P45 参照                                                |
| PlanResult 型の二重定義（C-4）      | agentSlice.ts の `export interface PlanResult` とコンポーネント内の `type PlanResult` が共存し、import がシャドウイング                                                     | 型は Single Source of Truth（agentSlice）から import する。ローカル型定義を作らない                                       |
| Hybrid State Pattern の非対称クリア | `localPlanResult` と `storePlanResult` の二重管理で、エラーパスで片方だけクリアされるリスク                                                                                 | handleCancelPlan / handleExecutePlan 両方で `setLocalPlanResult(null)` + `clearGenerationState()` を呼ぶ。TASK-SC-12 参照 |
| generationProgress 未表示（C-2）    | `setGenerationProgress("計画を生成中...")` を呼ぶが、JSX で表示していなかった。import も変数宣言もなかった                                                                  | useGenerationProgress の import・変数宣言・JSX 表示を必ずセットで追加する                                                 |

## 参照

- Phase 3 設計レビュー（R-2）
- TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド
