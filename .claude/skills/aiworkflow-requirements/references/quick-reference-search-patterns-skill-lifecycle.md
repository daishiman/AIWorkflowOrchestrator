# クイックリファレンス — 検索パターン集: スキルライフサイクル

> スキルライフサイクル関連タスクの仕様検索キーワードと読む順番
> 早見表（型定義/IPC/ディレクトリ等）は [quick-reference.md](quick-reference.md) を参照
> IPC/インフラ系は [quick-reference-search-patterns-ipc-infra.md](quick-reference-search-patterns-ipc-infra.md) を参照
> コードパターンは [quick-reference-search-patterns-code.md](quick-reference-search-patterns-code.md) を参照

---

## 仕様検索の分割ルール

- `search-spec.js` は **1概念1クエリ** で分割して使う
- 例: `TASK-10A-F useSkillAnalysis SkillCreateWizard` のようにまとめず、`TASK-10A-F` → `useSkillAnalysis` → `SkillCreateWizard` → `skillError` の順で個別検索する
- broad query が 0 件でも、resource-map / quick-reference / topic-map から再入場して取りこぼしを防ぐ

## スキルライフサイクル一次導線 / 画面責務再編を探すとき

このカテゴリは `skill lifecycle` `skillLifecycleJourney` `advanced route` `hidden route` `一次導線` `Skill Center` `Workspace` `Agent` `Skill Creator` `SkillManagementPanel` `settings bypass` `VITE_USE_GLOBAL_NAV_STRIP` `skill-center` `skillCenter` で検索を分割する。

```bash
node scripts/search-spec.js "Global Navigation Core" -C 3
node scripts/search-spec.js "Skill Center View" -C 3
node scripts/search-spec.js "Workspace Layout Foundation" -C 3
node scripts/search-spec.js "AgentView Redesign" -C 3
node scripts/search-spec.js "Store-Driven Lifecycle Integration" -C 3
node scripts/search-spec.js "Skill Creator" -C 3
node scripts/search-spec.js "SkillManagementPanel" -C 3
node scripts/search-spec.js "skillLifecycleJourney" -C 3
node scripts/search-spec.js "settings bypass" -C 3
node scripts/search-spec.js "VITE_USE_GLOBAL_NAV_STRIP" -C 3
node scripts/search-spec.js "advanced" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「スキルライフサイクル一次導線設計 / 画面責務再編」を見る
2. `references/ui-ux-navigation.md` で global nav / ViewType / rollback / advanced 前提を見る
3. `references/ui-ux-feature-components.md` で `Skill Center View` `Workspace Layout Foundation` `AgentView Redesign` `Store-Driven Lifecycle Integration` を見る
4. `references/arch-state-management.md` で `navigationSlice` `uiSlice` `Workspace` ownership と `settings` bypass / reset exclusion を見る
5. `references/architecture-overview.md` で shell と view 配置、rollback の位置を確認する
6. `references/ui-ux-settings.md` で `settings` 公開 shell の責務を確認する
7. `references/interfaces-agent-sdk-ui.md` と `references/ui-ux-agent-execution.md` で Agent 実行面の責務を確認する
8. `references/llm-workspace-chat-edit.md` で workspace/chat/edit 境界を確認する
9. 実装実体は `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` `apps/desktop/src/renderer/App.tsx` `apps/desktop/src/renderer/navigation/navContract.ts` `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` `apps/desktop/src/renderer/utils/shouldResetUnauthenticatedView.ts` で確認する
10. 仕様同期が必要なら `references/task-workflow.md` と `references/lessons-learned.md` を確認する

## ViewType/renderView 基盤拡張（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001）を探すとき

このカテゴリは `viewtype renderview foundation` `skillAnalysis` `skillCreate` `normalizeSkillLifecycleView` `advanced route fallback` `direct currentView` で検索を分割する。

```bash
node scripts/search-spec.js "viewtype renderview foundation" -C 3
node scripts/search-spec.js "skillAnalysis skillCreate" -C 3
node scripts/search-spec.js "normalizeSkillLifecycleView" -C 3
node scripts/search-spec.js "advanced route fallback" -C 3
node scripts/search-spec.js "direct currentView" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「Skill Lifecycle routing / renderView foundation」を見る
2. `references/workflow-skill-lifecycle-routing-render-view-foundation.md` で実装内容、TC-11-01..05、follow-up を確認する
3. `references/ui-ux-navigation.md` と `references/arch-state-management-core.md` で ViewType / state 契約を確認する
4. `references/task-workflow.md` / `references/task-workflow-completed-skill-lifecycle.md` / `references/task-workflow-backlog.md` で完了記録と未タスク導線を確認する
5. `references/lessons-learned-current.md` で direct 到達不安定性の再発防止ルールを確認する
6. 実装実体は `apps/desktop/src/renderer/App.tsx` `apps/desktop/src/renderer/store/types.ts` `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` `apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs` を照合する

## AgentView→SkillAnalysis 改善導線（TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001）を探すとき

このカテゴリは `agentview improve route` `skillLifecycleJourney` `useSkillCenter` `handleAnalyzeSkill` `currentSkillName` `selectedSkillName` `skillExecutionStatus` `viewHistory` `skillAnalysis case` `agent to skill analysis` で検索を分割する。

```bash
node scripts/search-spec.js "agentview improve route" -C 3
node scripts/search-spec.js "skillLifecycleJourney" -C 3
node scripts/search-spec.js "useSkillCenter handleAnalyzeSkill" -C 3
node scripts/search-spec.js "currentSkillName skillExecutionStatus" -C 3
node scripts/search-spec.js "skillAnalysis case" -C 3
node scripts/search-spec.js "agent to skill analysis" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「UI改修（AgentView→SkillAnalysis 改善導線 / 戻り導線）」を見る
2. `references/workflow-skill-lifecycle-routing-render-view-foundation.md` で `skillAnalysis` / `currentSkillName` / close 契約を確認する
3. `references/ui-ux-navigation.md` で ViewType / destination handoff / close baseline を確認する
4. `references/arch-state-management-core.md` と `references/arch-state-management-reference.md` で `viewHistory` / `currentSkillName` / `selectedSkillName` / `skillExecutionStatus` の ownership を確認する
5. `references/ui-ux-feature-components-core.md` と `references/ui-ux-feature-components-reference.md` で AgentView / SkillAnalysisView / SkillCenter analyze handoff を確認する
6. `references/arch-state-management-reference-permissions-import-lifecycle.md` で `handleAnalyzeSkill` の順序契約を確認する
7. `references/workflow-skill-lifecycle-created-skill-usage-journey.md` は CTA 制御マトリクスの上位仕様として確認する
8. `references/lessons-learned-skill-import-analysis-view.md` と `references/lessons-learned-ui-agent-view-nav-notification-history.md` で UI 追加時の既知論点を確認する
9. current code anchor は `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` `apps/desktop/src/renderer/App.tsx` `apps/desktop/src/renderer/store/slices/navigationSlice.ts` を先に確認し、その後 `apps/desktop/src/renderer/views/AgentView/index.tsx` `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` `apps/desktop/src/renderer/store/slices/agentSlice.ts` を照合する

## Skill Lifecycle 評価・採点ゲート（TASK-SKILL-LIFECYCLE-04）を探すとき

このカテゴリは `skill lifecycle scoring gate` `ScoringGate` `evaluatePrompt` `ScoreDelta` `previousAnalysis` `task-fix-eval-store-dispatch-001` `task-fix-score-delta-dedup-001` `canonical path` で検索を分割する。

```bash
node scripts/search-spec.js "skill lifecycle scoring gate" -C 3
node scripts/search-spec.js "ScoringGate" -C 3
node scripts/search-spec.js "evaluatePrompt" -C 3
node scripts/search-spec.js "previousAnalysis" -C 3
node scripts/search-spec.js "task-fix-eval-store-dispatch-001" -C 3
node scripts/search-spec.js "task-fix-score-delta-dedup-001" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（Skill Lifecycle 評価・採点ゲート）」を見る
2. `references/workflow-skill-lifecycle-evaluation-scoring-gate.md` で `current canonical set` と `artifact inventory` を確認する
3. `references/interfaces-agent-sdk-skill-details.md` / `references/arch-state-management-details.md` / `references/ui-ux-feature-components-reference.md` で契約・状態・UI責務を分離確認する
4. `references/task-workflow.md` / `references/task-workflow-backlog.md` / `references/task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` で完了台帳と follow-up 未タスク導線を確認する
5. `references/lessons-learned-current.md` で苦戦箇所と簡潔解決手順を確認する
6. 実装実体は `packages/shared/src/types/skill-improver.ts` `apps/desktop/src/preload/skill-api.ts` `apps/desktop/src/renderer/store/slices/agentSlice.ts` `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx` `apps/desktop/scripts/capture-task-skill-lifecycle-04-phase11.mjs` を照合する

## 作成済みスキル利用導線（TASK-SKILL-LIFECYCLE-05）を探すとき

このカテゴリは `TASK-SKILL-LIFECYCLE-05` `created-skill-usage-journey` `ScoreGateBadge` `PostExecutionActionBar` `favoriteSkillNames` `recentlyUsedSkills` `workspacePath` で検索を分割する。

```bash
node scripts/search-spec.js "TASK-SKILL-LIFECYCLE-05" -C 3
node scripts/search-spec.js "created-skill-usage-journey" -C 3
node scripts/search-spec.js "ScoreGateBadge" -C 3
node scripts/search-spec.js "PostExecutionActionBar" -C 3
node scripts/search-spec.js "favoriteSkillNames" -C 3
node scripts/search-spec.js "recentlyUsedSkills" -C 3
node scripts/search-spec.js "workspacePath" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「設計仕様（Skill Lifecycle 作成済みスキル利用導線）」を見る
2. `references/workflow-skill-lifecycle-created-skill-usage-journey.md` で 3 シナリオ導線・Task04 依存契約・仕様抽出マップを確認する
3. `references/ui-ux-agent-execution.md` / `references/ui-ux-navigation.md` / `references/ui-ux-feature-components.md` で導線と UI 責務を確認する
4. `references/interfaces-agent-sdk-executor.md` / `references/interfaces-agent-sdk-skill.md` / `references/arch-state-management.md` で契約・状態を突合する
5. `references/llm-workspace-chat-edit.md` で Workspace 文脈引き継ぎの境界を確認する
6. 実体仕様は `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-1-requirements.md` から Phase 13 までを順に照合する

## 信頼・権限・ガバナンス設計（TASK-SKILL-LIFECYCLE-06）を探すとき

このカテゴリは `TASK-SKILL-LIFECYCLE-06` `ToolRiskLevel` `SafetyGatePort` `AllowedToolEntryV2` `TOOL_RISK_CONFIG` `PermissionResolver` `SafetyGrade` `INS-01` `abort fallback` で検索を分割する。

```bash
node scripts/search-spec.js "TASK-SKILL-LIFECYCLE-06" -C 3
node scripts/search-spec.js "ToolRiskLevel" -C 3
node scripts/search-spec.js "SafetyGatePort" -C 3
node scripts/search-spec.js "AllowedToolEntryV2" -C 3
node scripts/search-spec.js "TOOL_RISK_CONFIG" -C 3
node scripts/search-spec.js "PermissionResolver" -C 3
node scripts/search-spec.js "INS-01" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「信頼・権限・ガバナンス設計」を見る
2. `references/security-skill-execution.md` で ToolRiskLevel 参照を確認する
3. `references/interfaces-agent-sdk-executor-details.md` で AllowedToolEntryV2 / SafetyGatePort を確認する
4. `references/arch-state-management-reference-permissions-import-lifecycle.md` で permissionHistorySlice 拡張仕様を確認する
5. `references/lessons-learned-current.md` で P57〜P59（設計タスク特有の苦戦箇所）を確認する
6. `references/task-workflow-backlog.md` で UT-06-001〜008 の未タスク状況を確認する
7. 設計成果物は `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/` 配下を参照する

## ライフサイクル履歴・フィードバック統合（TASK-SKILL-LIFECYCLE-07）を探すとき

このカテゴリは `TASK-SKILL-LIFECYCLE-07` `SkillLifecycleEvent` `SkillAggregateView` `SkillFeedback` `lifecycleHistorySlice` `feedbackSlice` `scoreTrend` `publish readiness` で検索を分割する。

```bash
node scripts/search-spec.js "TASK-SKILL-LIFECYCLE-07" -C 3
node scripts/search-spec.js "SkillLifecycleEvent" -C 3
node scripts/search-spec.js "SkillAggregateView" -C 3
node scripts/search-spec.js "SkillFeedback" -C 3
node scripts/search-spec.js "lifecycleHistorySlice" -C 3
node scripts/search-spec.js "feedbackSlice" -C 3
node scripts/search-spec.js "publish readiness" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「設計仕様（Skill Lifecycle 履歴・フィードバック統合）」を見る
2. `references/interfaces-agent-sdk-skill.md` と `references/interfaces-agent-sdk-history.md` でイベント・型契約を確認する
3. `references/arch-state-management.md` で `lifecycleHistorySlice` / `feedbackSlice` の責務境界を確認する
4. `references/workflow-skill-lifecycle-created-skill-usage-journey.md` と `references/workflow-skill-lifecycle-evaluation-scoring-gate.md` で Task05/Task04 依存契約を確認する
5. `references/ui-history-search-view.md` / `references/ui-ux-history-panel.md` で UI 観測項目を確認する
6. workflow 実体は `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/` の Phase 1〜12 成果物で照合する

## SkillCreateWizard LLM接続（TASK-SC-07）を探すとき

このカテゴリは `TASK-SC-07` `SkillCreateWizard` `LLM connection` `GenerationMode` `planSkill` `executePlan` `localPlanResult` `storePlanResult` `useIsSkillGenerating` `useGenerationProgress` `useClearGenerationState` で検索を分割する。

```bash
node scripts/search-spec.js "TASK-SC-07" -C 3
node scripts/search-spec.js "SkillCreateWizard LLM" -C 3
node scripts/search-spec.js "GenerationMode" -C 3
node scripts/search-spec.js "planSkill executePlan" -C 3
node scripts/search-spec.js "localPlanResult" -C 3
node scripts/search-spec.js "useIsSkillGenerating" -C 3
node scripts/search-spec.js "useClearGenerationState" -C 3
```

読む順番:

1. `indexes/resource-map.md` の TASK-SC-07 changelog エントリで概要を把握する
2. `references/arch-state-management-core.md` の TASK-SC-07 セクションで Props/State/Store hooks/Handler 契約を確認する
3. `references/ui-ux-feature-components-core.md` で SkillCreateWizard の UI 仕様を確認する
4. `references/lessons-learned-ipc-preload-runtime.md` で L-SC-07-001〜004（vi.mock gaps / non-destructive extension / symmetric clear / GenerationMode SSoT）を確認する
5. `references/task-workflow-completed-skill-create-ui-integration.md` で完了記録を確認する
6. `references/task-workflow-backlog.md` で UT-SC-07-STORE-CONFLICT-GUARD / UT-SC-07-AUTH-MODE-API-KEY-IMPL を確認する
7. 実装実体は `apps/desktop/src/renderer/components/skill/SkillCreateWizard/index.tsx` `apps/desktop/src/renderer/components/skill/SkillCreateWizard/types.ts` `apps/desktop/src/renderer/store/slices/agentSlice.ts` を照合する
