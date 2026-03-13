# Phase 2: Task03 / Task05 handoff 契約

## Task03 -> Task04

| Task03 event     | Task04 入力                                                  | Task04 出力       |
| ---------------- | ------------------------------------------------------------ | ----------------- |
| prepare          | prompt                                                       | draft gate        |
| create success   | skillName, prompt, initial analysis                          | post_create gate  |
| execute terminal | skillName, prompt, current analysis, status, stream messages | post_execute gate |
| improve success  | skillName, prompt, improved analysis                         | post_improve gate |

## Task04 -> Task05

| Task04 state                                 | Task05 参照先                        | 用途                           |
| -------------------------------------------- | ------------------------------------ | ------------------------------ |
| `latestGateDecision.status`                  | `SkillCenterView` banner             | badge 表示                     |
| `latestGateDecision.summary`                 | `SkillCenterView` banner             | 1文の理由説明                  |
| `latestEvaluationSnapshot.stage`             | `SkillCenterView` banner             | どの checkpoint の結果かを明示 |
| `latestEvaluationSnapshot.deltaFromPrevious` | `SkillCenterView` banner             | 改善差分の表示                 |
| `latestPromptRequest` + `currentAnalysis`    | `SkillCenterView.handleReevaluate()` | Task05 側からの再評価          |

## UI 非露出ルール

| 内部 role        | UI での扱い                            |
| ---------------- | -------------------------------------- |
| Evaluation Agent | `Evaluator` card まで。主 CTA 化しない |
| Trust Agent      | hard block の事実としてのみ出す        |
| SubAgent / Codex | 露出しない                             |

## 実装済み受け口

| surface               | 状態     |
| --------------------- | -------- |
| `SkillLifecyclePanel` | 実装済み |
| `SkillAnalysisView`   | 実装済み |
| `SkillCenterView`     | 実装済み |

## 残制約

- Task05 専用の Agent / Workspace 本流 UI は未着手のため、本ターンでは `SkillCenterView` を Task05 handoff surface として採用した。
- `SkillCenterView` の再評価は `post_improve` 再利用であり、stream 再実行は行わない。
