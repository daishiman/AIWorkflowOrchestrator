# Skill Lifecycle Evaluation/Scoring Gate ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`

---

## 概要

`TASK-SKILL-LIFECYCLE-04`（`step-03-seq-task-04-evaluation-and-scoring-gate`）で実装した
採点ゲート契約（`ScoringGate`）・`evaluatePrompt` 経路・`previousAnalysis` スナップショット・`ScoreDeltaBadge` UI を、
system spec へ同一 wave で同期するための統合正本。

**トリガー**: `skill lifecycle scoring gate`, `ScoringGate`, `evaluatePrompt`, `ScoreDelta`, `previousAnalysis`, `phase12 unassigned canonical path`

---

## classification-first 分割判断

| 観点 | 判断 |
| --- | --- |
| 変更対象 | IPC契約 / Store状態 / UI差分 / Phase 11証跡 / Phase 12未タスク導線 |
| 既存配置 | `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` の1節に集約 |
| 分割方針 | workflow単位の再利用入口として `workflow-skill-lifecycle-evaluation-scoring-gate.md` を新設 |
| 命名方針 | 連番ではなく concern 名を表す semantic filename を採用 |

---

## 今回の実装内容（2026-03-14）

| 実装観点 | 反映内容 | 実装アンカー |
| --- | --- | --- |
| 採点契約 | `ScoringGate` / `ScoringGateResult` / `ScoreDelta` と純粋関数を共有型へ追加 | `packages/shared/src/types/skill-improver.ts` |
| 評価API | `evaluatePrompt(prompt)` を preload API 公開面に追加（`{ prompt }` payload） | `apps/desktop/src/preload/skill-api.ts` |
| Store状態 | `previousAnalysis` を `AgentState` に追加し、改善前スナップショットを保持 | `apps/desktop/src/renderer/store/slices/agentSlice.ts` |
| UI表示 | `ScoreDeltaBadge` で改善前後スコア差分（direction/badge）を表示 | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx` |
| Hook責務 | `useSkillAnalysis` に `previousAnalysis` / `scoreDelta` / `handleEvaluatePrompt` を追加 | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` |
| 手動画面検証 | TC-11-01〜04 の screenshot を dark/light/mobile で再取得 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/screenshots/` |

---

## 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 解決策 |
| --- | --- | --- |
| Δ表示がテストPASSでも実画面に出ない | Hook戻り値を UI 子コンポーネントへ渡し忘れる | `SkillAnalysisView -> ScoreDisplay` の props 配線を固定し、Phase 11 screenshot で回帰確認 |
| 未タスク配置先が workflow ローカルへドリフトする | `tasks/unassigned-task/` を一時運用し台帳更新を後回しにする | root canonical path（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`）へ再配置し、参照を同ターンで一括更新 |
| `current` と `baseline` の意味が混ざる | 監査結果を単一数値で報告する | `配置可否` / `link整合` / `currentViolations` を分離し、`baseline` は legacy監視値として別記録 |
| docs更新が分割され same-wave が崩れる | workflow成果物だけ更新し parent docs/index/log を後回しにする | `workflow + parent docs + ledger + indexes + LOGS + mirror` を同一 wave checklist で同期 |

---

## current canonical set（2026-03-14 wave）

| 区分 | canonical docs |
| --- | --- |
| workflow 正本 | `references/workflow-skill-lifecycle-evaluation-scoring-gate.md` |
| parent docs（契約境界） | `references/interfaces-agent-sdk-skill-details.md`, `references/arch-state-management-details.md`, `references/ui-ux-feature-components-reference.md` |
| 台帳 | `references/task-workflow.md`, `references/task-workflow-backlog.md`, `references/task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` |
| 教訓 | `references/lessons-learned-current.md` |
| index 導線 | `indexes/resource-map.md`, `indexes/quick-reference.md`, `indexes/topic-map.md`, `indexes/keywords.json` |
| 運用ログ | `LOGS.md`, `SKILL.md` |
| follow-up 未タスク | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md`, `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md` |
| 旧名互換台帳 | `references/legacy-ordinal-family-register.md` |
| mirror root | canonical=`.claude/skills/aiworkflow-requirements/` / mirror=`.agents/skills/aiworkflow-requirements/` |

---

## artifact inventory（implementation + doc sync）

| 種別 | ファイル | 用途 |
| --- | --- | --- |
| Phase 11 結果 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/manual-test-result.md` | TC-ID と screenshot の 1:1 対応 |
| Phase 11 screenshot | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/screenshots/TC-11-01-skill-analysis-baseline-dark-desktop.png` | baseline 画面証跡 |
| Phase 11 screenshot | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/screenshots/TC-11-02-skill-analysis-delta-dark-desktop.png` | delta表示（dark） |
| Phase 11 screenshot | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/screenshots/TC-11-03-skill-analysis-delta-light-desktop.png` | delta表示（light） |
| Phase 11 screenshot | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/screenshots/TC-11-04-skill-analysis-delta-dark-mobile.png` | delta表示（mobile） |
| screenshot harness | `apps/desktop/scripts/capture-task-skill-lifecycle-04-phase11.mjs` | TC-11-01〜04 自動取得 |
| Phase 12 準拠証跡 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 + 再監査根拠 |
| Phase 12 同期要約 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12/system-spec-update-summary.md` | Step 1/2 の反映範囲 |
| follow-up 未タスク | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md` | evaluatePrompt Store経由化 |
| follow-up 未タスク | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md` | score delta 重複解消 |

---

## parent docs と依存関係

| parent doc | この workflow で参照する理由 |
| --- | --- |
| `interfaces-agent-sdk-skill-details.md` | `ScoringGate` / `evaluatePrompt` の API 契約境界を維持するため |
| `arch-state-management-details.md` | `previousAnalysis` の状態責務（保存/クリア）を明示するため |
| `ui-ux-feature-components-reference.md` | `SkillAnalysisView` の delta 表示と証跡導線を保持するため |
| `task-workflow.md` | 完了台帳・検証証跡・関連未タスク導線を管理するため |
| `task-workflow-backlog.md` | follow-up 未タスクの優先度と由来を追跡するため |
| `lessons-learned-current.md` | 苦戦箇所と簡潔解決手順を再利用可能にするため |

---

## 旧 filename 互換管理

`TASK-SKILL-LIFECYCLE-04` の Phase 12 再確認で、未タスクの旧 path/filename を current canonical へ移行した。
互換行は `legacy-ordinal-family-register.md` の `Current Alias Overrides` へ登録する。

| legacy path/filename | current path/filename |
| --- | --- |
| `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/TASK-FIX-EVAL-STORE-DISPATCH-001.md` | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md` |
| `docs/30-workflows/skill-lifecycle-unification/tasks/unassigned-task/TASK-FIX-SCORE-DELTA-DEDUP-001.md` | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md` |

---

## 仕様書別 SubAgent 分担（関心分離）

| SubAgent | 関心ごと | 主担当 |
| --- | --- | --- |
| A | 契約境界 | `interfaces-agent-sdk-skill-details.md` |
| B | 状態責務 | `arch-state-management-details.md` |
| C | UI仕様と画面証跡 | `ui-ux-feature-components-reference.md`, Phase 11 screenshots |
| D | 未タスク導線 | `task-workflow-backlog.md`, `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/*.md` |
| Lead | 入口導線と整合 | `resource-map`, `quick-reference`, `task-workflow`, `lessons`, `LOGS`, mirror |

---

## 検証コマンド

| コマンド | 目的 | 結果 |
| --- | --- | --- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate` | workflow 構造検証 | PASS（13/13） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate` | Phase 検証 | PASS（28項目） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate --json` | 画面証跡カバレッジ | PASS（4/4） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate --json` | 実装ガイド要件 | PASS（10/10） |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` | 未タスクリンク整合 | PASS（229/229） |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 未タスク差分監査 | PASS（current=0, baseline=134） |

---

## 同種課題の5分解決カード

1. 実装差分は UT PASS だけで閉じず、Phase 11 screenshot で最終確認する。  
2. `workflow + parent docs + backlog + lessons` を同一ターンで同期する。  
3. MINOR は root `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に即時未タスク化する。  
4. `verify-unassigned-links` と `audit --diff-from HEAD` を分離記録し、`current` と `baseline` を混同しない。  
5. 仕上げで `generate-index` → `validate-structure` → mirror sync → `diff -qr` を実行する。  

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [interfaces-agent-sdk-skill-details.md](./interfaces-agent-sdk-skill-details.md) | 採点/評価 API 契約 |
| [arch-state-management-details.md](./arch-state-management-details.md) | `previousAnalysis` 状態責務 |
| [ui-ux-feature-components-reference.md](./ui-ux-feature-components-reference.md) | SkillAnalysisView UI仕様 |
| [task-workflow-completed-skill-lifecycle-agent-view-line-budget.md](./task-workflow-completed-skill-lifecycle-agent-view-line-budget.md) | 完了台帳の元記録 |
| [task-workflow-backlog.md](./task-workflow-backlog.md) | follow-up 未タスク |
| [lessons-learned-current.md](./lessons-learned-current.md) | 苦戦箇所と再利用手順 |

---

## Task04→Task07 評価イベント連携（TASK-SKILL-LIFECYCLE-07）

| 連携項目 | 内容 |
| --- | --- |
| イベント種別 | `skill:evaluated` / `skill:score_updated` イベントが Task04 の評価フローから発火される |
| 記録先 | Task07 の `lifecycle_events` テーブル（設計仕様）に時系列で記録される |
| 集約への影響 | 記録されたイベントは SkillAggregateView の `scoreTrend`（ScoreDataPoint配列）に反映される |
| ゲート連携 | `skill:gate_passed` / `skill:gate_failed` イベントも ScoringGate 判定結果として記録される |

### 参照リンク

- Task07 設計: `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-2-design.md`

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-16 | 1.1.0 | Task04→Task07 評価イベント連携セクションを追加（TASK-SKILL-LIFECYCLE-07 Phase 12） |
| 2026-03-14 | 1.0.0 | `TASK-SKILL-LIFECYCLE-04` の実装内容・苦戦箇所・current canonical set・artifact inventory・legacy path 互換・same-wave 検証手順を統合した workflow 正本を新規作成 |
