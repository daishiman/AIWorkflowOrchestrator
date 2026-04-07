# Phase 12 System Spec Update Summary

## 概要

このブランチでは renderer 実装の canonical-first 化と workflow spec の整備を並行して行った。更新対象と判断内容を current / baseline で分けて記録する。

## Step 1: 完了記録

| 項目          | 内容                                                                 |
| ------------- | -------------------------------------------------------------------- |
| workflow root | `docs/30-workflows/task-ui-03-ipc-renderer-migration/`               |
| baseline      | 元の skeleton spec                                                   |
| current       | renderer の canonical API 化と close-out 記録を反映した refined spec |
| 判定          | renderer 実装と workflow spec の整合性改善を実施                     |

## Step 2: system spec sync 判定

| 項目                                                 | 判定     | 理由                                                                                                                                |
| ---------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements` の実更新    | N/A      | 正本 skill 本体は変更せず、workflow spec 側で同期内容を記録した                                                                     |
| `.claude/skills/task-specification-creator` の実更新 | N/A      | 同上                                                                                                                                |
| `window.skillCreatorAPI` を canonical とする判断     | 記録済み | phase-2 / phase-3 / phase-11 / phase-12 で明文化                                                                                    |
| `electronAPI.skillCreator` 互換シム                  | 維持     | renderer から直接参照しない方針に固定                                                                                               |
| 近接する renderer consumer の canonical-first 化     | 記録済み | `SkillCreateWizard` / `SkillLifecyclePanel` / `useLLMAdapterStatus` / `useStreamingProgress` を `window.skillCreatorAPI` 優先に統一 |

## 同期対象

| ファイル                    | 状態           |
| --------------------------- | -------------- |
| `index.md`                  | 更新済み       |
| `phase-1-requirements.md`   | 更新済み       |
| `phase-2-design.md`         | 更新済み       |
| `phase-3-design-review.md`  | 更新済み       |
| `phase-11-manual-test.md`   | 更新済み       |
| `phase-12-documentation.md` | 更新済み       |
| `artifacts.json`            | 更新済み       |
| `outputs/artifacts.json`    | 追加・同期済み |

## parity

| 対象                                        | 結果         |
| ------------------------------------------- | ------------ |
| `artifacts.json` / `outputs/artifacts.json` | 同一         |
| Phase 11 evidence mode                      | NON_VISUAL   |
| Phase 12 6成果物                            | 仕様上で固定 |

## 判断根拠

- renderer の direct ref だけを移行し、UI は変えないため NON_VISUAL とした
- 実装は `window.skillCreatorAPI` に統一し、preload 側の互換シムは維持するため、破壊的変更は避けた
- 互換シムは preload に残し、後方互換を壊さない
- Phase 12 の close-out は 6 成果物 + compliance check で閉じる
