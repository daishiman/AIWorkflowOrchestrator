# Phase 12: システム仕様更新サマリー

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

## Step 1-A: タスク完了記録

本 worktree 上で `.claude/skills/aiworkflow-requirements/` の正本を更新し、同内容を `.agents/skills/aiworkflow-requirements/` へ mirror 同期した。

### 実更新した system spec

| ファイル                                                                | 更新内容                                                                              |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `references/ui-ux-navigation.md`                                        | AgentView CTA と SkillAnalysisView の Agent 起点戻り導線を追加                        |
| `references/arch-state-management-core.md`                              | `viewHistory` / `currentSkillName` / `selectedSkillName` を使う Task04 状態契約を追加 |
| `references/ui-ux-feature-components-reference.md`                      | AgentView CTA バナーと SkillAnalysisView optional navigation props を追記             |
| `references/workflow-skill-lifecycle-routing-render-view-foundation.md` | Task04 の Agent 起点 handoff を統合正本へ追加                                         |
| `references/task-workflow-completed-skill-lifecycle.md`                 | Task04 completed ledger 逆引きを追加                                                  |
| `references/task-workflow-completed-skill-lifecycle-ui.md`              | Task04 実装内容 / screenshot / follow-up を追加                                       |
| `references/task-workflow-backlog.md`                                   | Task04 派生の未タスク 8 件を追加                                                      |
| `references/lessons-learned-viewtype-electron-ui.md`                    | Task04 の screenshot harness / onboarding overlay / arm64 esbuild 回避の教訓を追加    |
| `references/lessons-learned-current.md`                                 | ViewType / Electron UI ファミリの対象タスク一覧を更新                                 |
| `references/task-workflow.md`                                           | Task04 を completed skill lifecycle family の説明へ追加                               |
| `references/ui-ux-agent-execution-core.md`                              | AgentView 改善 CTA バナー仕様と SkillAnalysisView round-trip props を追加             |

## Step 1-B: 実装状況テーブル

新規 API/IPC 追加はなし。既存 UI / store 契約の再利用で閉じている。

| 観点              | 実装状況                                                       |
| ----------------- | -------------------------------------------------------------- |
| AgentView         | completed 状態のときだけ CTA バナー表示                        |
| App.tsx           | `viewHistory[length-2] === "agent"` で Agent 起点判定          |
| SkillAnalysisView | `onNavigateBack?` / `onNavigateToAgent?` optional props を利用 |
| Phase 11          | 実画面 screenshot 6 件を再取得して P53 代替を除去              |

## Step 1-C: 関連タスクテーブル

| 関連タスク                                  | 関係                                               | 状態     |
| ------------------------------------------- | -------------------------------------------------- | -------- |
| TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 | `skillAnalysis` ViewType / renderView 基盤を再利用 | 依存充足 |
| TASK-SKILL-LIFECYCLE-02                     | SkillCenter -> skillAnalysis 導線との整合          | 回帰なし |
| TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001     | secondary handoff との契約整合                     | 回帰なし |

## Step 1-D: topic-map / mirror 同期

`node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`topic-map.md` と `keywords.json` を再生成したうえで `.claude` から `.agents` へ mirror 同期した。Task04 の本文差分と index 差分は同一 wave で反映済み。

## Step 2: skill 改善

`task-specification-creator` の `validate-phase-output.js` を更新し、以下の drift を自動検出できるようにした。

| 検出対象                      | 追加内容                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `outputs/artifacts.json` 欠落 | `artifacts.json` がある workflow で mirror 欠落を error 化                                   |
| Phase 11 補助成果物欠落       | UI task の `manual-test-checklist.md` / `screenshot-plan.json` / PNG 0 枚を warning/error 化 |
| Phase 12 先送り表現           | PR 作成フェーズやマージ後対応を示す先送り句、英文の後追い表現を warning 化                   |

同内容を `.agents/skills/task-specification-creator/` へ mirror 同期した。
