# Phase 12 仕様書最適化レポート（追補）

- 実施日: 2026-03-04 23:50 JST
- 対象: TASK-UI-00-ORGANISMS
- 目的: system spec における「実装内容 + 苦戦箇所 + 再利用手順」の記録粒度を統一し、同種課題の初動を短縮する

## SubAgent分担（関心ごと分離）

| SubAgent | 担当仕様書/テンプレート                  | 実施内容                                               |
| -------- | ---------------------------------------- | ------------------------------------------------------ |
| A        | `references/task-workflow.md`            | 5分チェックリストを追加し、再確認フローを固定          |
| B        | `references/lessons-learned.md`          | コピペテンプレートを追加し、再利用入力を標準化         |
| C        | `references/ui-ux-feature-components.md` | Organisms Foundation に苦戦箇所 + 最短手順を追加       |
| D        | `references/arch-ui-components.md`       | 設計時の苦戦箇所と標準化ルールを追加                   |
| E        | `skill-creator` templates                | Phase 12テンプレートへ「最適なファイル形成」規約を追加 |

## 仕様書更新内容

| ファイル                                                                                                                                          | 更新要点                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                              | TASK-UI-00-ORGANISMS 節に「同種課題の5分チェックリスト」を追加    |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                            | 「同種課題向けコピペテンプレート（最短版）」を追加                |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                                   | Organisms Foundation に再発条件付きの苦戦箇所表と最短手順を追加   |
| `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                                         | 設計時の苦戦箇所（責務分離/表示モード/状態管理）を追加            |
| `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/unassigned-task/task-imp-task-ui-00-organisms-phase12-sync-guard-001.md` | 苦戦箇所を未タスク仕様書へ分離し、Phase 12 運用ガードとして正本化 |

## 今回の実装で苦戦した箇所（最適化後）

| 苦戦箇所                 | 再発条件                                   | 標準ルール                                              |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------- |
| UI再撮影後の時刻同期漏れ | 画像更新と文書更新を別ターンで行う         | `stat` 実時刻を `manual-test-result` と仕様書に同時反映 |
| 未タスク監査値の誤読     | `current` と `baseline` を混同して合否判定 | 合否は `currentViolations=0`、baseline は監視値で分離   |
| Step 1-A 同期漏れ        | UI仕様書だけ更新して台帳/教訓を後回し      | `task-workflow` + `lessons` 同期を完了条件に固定        |

## skill-creator 改善内容

| ファイル                                                                            | 改善内容                                                           |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` | 「最適なファイル形成（記述順序/必須ブロック/整合チェック）」を追加 |
| `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`        | 仕様書単位の最小構成チェックを追加                                 |
| `.claude/skills/skill-creator/references/patterns.md`                               | 成功パターン「実装内容+苦戦箇所の仕様書統一フォーマット」を追加    |
| `.claude/skills/skill-creator/references/resource-map.md`                           | 上記テンプレート機能説明を同期                                     |

## 参照

- `outputs/phase-12/phase12-task-spec-compliance-check.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
