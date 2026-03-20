# クイックリファレンス — 検索パターン集: IPC/セキュリティ/インフラ

> IPC, セキュリティ, Workspace, テーマ, AI runtime 関連タスクの仕様検索キーワードと読む順番
> スキルライフサイクル系は [quick-reference-search-patterns-skill-lifecycle.md](quick-reference-search-patterns-skill-lifecycle.md) を参照
> コードパターンは [quick-reference-search-patterns-code.md](quick-reference-search-patterns-code.md) を参照

---

## Permission Fallback（abort/skip/retry/timeout）を探すとき

このカテゴリは `processPermissionFallback` `executeAbortFlow` `executeSkipFlow` `AbortReason` `PERMISSION_MAX_RETRIES` `abortedExecutions` `PermissionFlowContext` `PermissionFlowResult` で検索を分割する。

```bash
node scripts/search-spec.js "processPermissionFallback" -C 3
node scripts/search-spec.js "executeAbortFlow" -C 3
node scripts/search-spec.js "AbortReason" -C 3
node scripts/search-spec.js "PERMISSION_MAX_RETRIES" -C 3
node scripts/search-spec.js "abortedExecutions" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「Permission Fallback（abort/skip/retry/timeout）」を見る
2. `references/workflow-permission-fallback-abort-skip-retry.md` で current canonical set、artifact inventory、苦戦箇所、5分解決カードを確認する
3. `references/interfaces-agent-sdk-executor-core.md` で AbortReason / PermissionFlowContext / PermissionFlowResult 型を確認する
4. `references/interfaces-agent-sdk-executor-details.md` で 4フロー詳細と連携図を確認する
5. `references/security-skill-execution.md` で fail-closed 原則と retry limit セキュリティを確認する

## SafetyGate / Permission Fallback 実装（UT-06-003 / UT-06-005）を探すとき

このカテゴリは `DefaultSafetyGate` `SafetyGateResult` `evaluateSafety` `skill:evaluate-safety` `PermissionStore` `DI スコープ` `metadataProvider` `P62` `P63` で検索を分割する。

```bash
node scripts/search-spec.js "DefaultSafetyGate" -C 3
node scripts/search-spec.js "SafetyGateResult" -C 3
node scripts/search-spec.js "skill:evaluate-safety" -C 3
node scripts/search-spec.js "metadataProvider" -C 3
node scripts/search-spec.js "PermissionStore" -C 3
node scripts/search-spec.js "revokeSessionEntries" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「SafetyGate MetadataProvider 実装」を見る
2. `references/api-ipc-agent-safety.md` で `skill:evaluate-safety` チャネル仕様・SafetyGateResult 型・DefaultSafetyGate DI 構成を確認する
3. `references/security-skill-execution.md` で SafetyGate の 5 種チェック（critical/high/no-approval/all-low/protected-path）と fail-closed 原則を確認する
4. `references/lessons-learned-safety-gate-permission-fallback.md` で P62（PermissionStore DI スコープ問題）・P63（metadataProvider データソース未定義）の教訓と解決手順を確認する
5. `references/interfaces-agent-sdk-executor-details.md` で `processPermissionFallback` / `executeAbortFlow` / `executeSkipFlow` の連携図を確認する
6. 実装実体: `apps/desktop/src/main/ipc/safetyGateHandlers.ts` `apps/desktop/src/main/ipc/index.ts`（permissionStore 上位スコープ抽出箇所）`packages/shared/src/types/safety-gate.ts`

## Preload safeInvoke timeout を探すとき

```bash
node scripts/search-spec.js "safeInvoke" -C 3
node scripts/search-spec.js "IPC timeout" -C 3
node scripts/search-spec.js "preload invoke hang" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（Preload safeInvoke timeout / invoke hang）」を見る
2. `references/security-electron-ipc.md` の Preload `safeInvoke` timeout セクションを見る
3. `references/architecture-implementation-patterns.md` の invoke hang containment パターンを見る
4. `references/ipc-contract-checklist.md` で channel / payload / whitelist の崩れがないか確認する

## ChatView silent failure / エラー表示を探すとき

このカテゴリは `chatError` `callLLMAPI` `AI_UNAVAILABLE` `API_CALL_FAILED` `ChatView error banner` `silent failure` で検索を分割する。

```bash
node scripts/search-spec.js "chatError" -C 3
node scripts/search-spec.js "callLLMAPI" -C 3
node scripts/search-spec.js "AI_UNAVAILABLE" -C 3
node scripts/search-spec.js "ChatView error banner" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（ChatView silent failure / エラー表示）」を見る
2. `references/error-handling.md` で error surface と code-to-message 変換の原則を確認する
3. `references/arch-state-management-core.md` で `chatSlice` / renderer local state の責務境界を確認する
4. `references/interfaces-llm.md` と `references/ui-ux-system-prompt.md` で Main Chat surface と LLM UI の接続点を確認する
5. `references/api-ipc-system-core.md` と `references/lessons-learned-ipc-preload-runtime.md` で runtime sync / fallback 由来の失敗要因を確認する
6. 実装実体は `apps/desktop/src/renderer/store/slices/chatSlice.ts` `apps/desktop/src/renderer/views/ChatView/index.tsx` `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx` を照合する

## LLM選択 state persistence / runtime sync を探すとき

このカテゴリは `selectedModelId` `llm:set-selected-config` `llmConfigProvider` `setSelectedConfig` `currentConfig` `syncSelectedConfigToMain` で検索を分割する。

```bash
node scripts/search-spec.js "selectedModelId" -C 3
node scripts/search-spec.js "llm:set-selected-config" -C 3
node scripts/search-spec.js "llmConfigProvider" -C 3
node scripts/search-spec.js "syncSelectedConfigToMain" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（LLM選択 state persistence / runtime sync）」を見る
2. `references/api-ipc-system-core.md` で `llm:set-selected-config` と Main 側 runtime 契約を確認する
3. `references/ui-ux-llm-selector.md` と `references/interfaces-llm.md` で provider/model selection UI 契約を確認する
4. `references/arch-state-management-core.md` で `llmSlice` の ownership と persist 境界を確認する
5. `references/lessons-learned-ipc-preload-runtime.md` と `references/security-electron-ipc-core.md` で DEFAULT_CONFIG fallback と preload/runtime drift の教訓を確認する
6. 実装実体は `apps/desktop/src/renderer/store/slices/llmSlice.ts` `apps/desktop/src/renderer/store/index.ts` `apps/desktop/src/main/ipc/llmConfigProvider.ts` を照合する

## Workspace Chat stream error UX を探すとき

このカテゴリは `WorkspaceChatPanel errorMessage` `onStreamError` `workspace-chat-error` `MODEL_NOT_FOUND` `selectedModelId` `streamChat` で検索を分割する。

```bash
node scripts/search-spec.js "WorkspaceChatPanel errorMessage" -C 3
node scripts/search-spec.js "onStreamError" -C 3
node scripts/search-spec.js "workspace-chat-error" -C 3
node scripts/search-spec.js "MODEL_NOT_FOUND" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（Workspace Chat stream error UX）」を見る
2. `references/llm-streaming.md` で stream error / chunk / end 契約を確認する
3. `references/ui-ux-feature-components-details.md` と `references/interfaces-llm.md` で `WorkspaceChatPanel` / `WorkspaceChatInput` / `useWorkspaceChatController` の責務を確認する
4. `references/security-electron-ipc-core.md` と `references/arch-state-management-core.md` で error surface と local state ownership を確認する
5. `references/lessons-learned-ipc-preload-runtime.md` で fallback / runtime drift の再発条件を確認する
6. 実装実体は `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatInput.tsx` `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` を照合する

## Light Theme contrast regression guard を探すとき

このカテゴリは `light theme contrast guard` `phase11-static-server` `selector-based capture` `currentViolations` `baselineViolations` `ThemeSelector` `AuthView` `workspace-search` `current build static serve` で検索を分割する。

```bash
node scripts/search-spec.js "light theme contrast guard" -C 3
node scripts/search-spec.js "phase11-static-server" -C 3
node scripts/search-spec.js "selector-based capture" -C 3
node scripts/search-spec.js "currentViolations" -C 3
node scripts/search-spec.js "baselineViolations" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（Light Theme contrast regression guard / representative screenshot audit）」を見る
2. `references/workflow-light-theme-contrast-regression-guard.md` で実装内容、苦戦箇所、5分解決カード、SubAgent 分担をまとめて確認する
3. `references/ui-ux-feature-components.md` の guard 節で representative screen と baseline routing を確認する
4. `references/ui-ux-design-system.md` と `references/workflow-light-theme-global-remediation.md` で token/remediation 側の責務を切り分ける
5. `references/task-workflow.md` と `references/lessons-learned.md` で完了記録と短手順を確認する
6. 実装実体は `apps/desktop/scripts/light-theme-contrast-guard.config.mjs` `apps/desktop/scripts/light-theme-contrast-guard.mjs` `apps/desktop/scripts/phase11-static-server.mjs` `apps/desktop/src/renderer/phase11-light-theme-contrast-guard.tsx` `apps/desktop/electron.vite.config.ts` を照合する

## Workspace parent reference sweep guard を探すとき

このカテゴリは `workspace parent reference sweep guard` `task-060` `pointer docs` `legacy index` `mirror drift` `representative visual re-audit` `workspace review board` で検索を分割する。

```bash
node scripts/search-spec.js "workspace parent reference sweep guard" -C 3
node scripts/search-spec.js "task-060" -C 3
node scripts/search-spec.js "pointer docs" -C 3
node scripts/search-spec.js "mirror drift" -C 3
node scripts/search-spec.js "representative visual re-audit" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（Workspace parent pointer / pointer docs / mirror drift / visual re-audit）」を見る
2. `references/workflow-workspace-parent-reference-sweep-guard.md` で全体像、SubAgent 分担、5分解決カードを確認する
3. `references/task-workflow.md` と `references/ui-ux-feature-components.md` で completed 記録と Workspace surface 側の扱いを確認する
4. `references/interfaces-llm.md` / `references/interfaces-chat-history.md` / `references/lessons-learned.md` で evidence path と苦戦箇所を確認する
5. 実装実体は `scripts/validate-workspace-parent-reference-sweep.mjs` `scripts/__tests__/validate-workspace-parent-reference-sweep.test.mjs` `apps/desktop/scripts/capture-workspace-parent-reference-sweep-guard-review-board.mjs` `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-11/screenshots/` を照合する

## Workspace preview/search resilience guard を探すとき

このカテゴリは `workspace preview search resilience guard` `quickFileSearchResilience` `previewResilience` `score=0` `external-dev-server` `audit --target-file` `conversationIdRef` で検索を分割する。

```bash
node scripts/search-spec.js "workspace preview search resilience guard" -C 3
node scripts/search-spec.js "quickFileSearchResilience" -C 3
node scripts/search-spec.js "previewResilience" -C 3
node scripts/search-spec.js "score=0" -C 3
node scripts/search-spec.js "external-dev-server" -C 3
node scripts/search-spec.js "audit --target-file" -C 3
node scripts/search-spec.js "conversationIdRef" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（Workspace preview/search resilience / fuzzy no-match / renderer timeout+retry）」を見る
2. `references/workflow-workspace-preview-search-resilience-guard.md` で実装内容、苦戦箇所、5分解決カード、SubAgent 分担、検証コマンドをまとめて確認する
3. `references/ui-ux-search-panel.md` と `references/ui-ux-feature-components.md` で Quick Search dialog、preview surface、`score=0` 除外、top 10、empty state 契約を確認する
4. `references/arch-state-management.md` / `references/ui-ux-components.md` / `references/architecture-implementation-patterns.md` / `references/error-handling.md` で state reset、visual polish、timeout/retry、typed taxonomy を確認する
5. `references/task-workflow.md` / `references/lessons-learned.md` で completed path、`external-dev-server` screenshot、`audit --target-file` ルールを確認する
6. 実装実体は `apps/desktop/src/renderer/views/WorkspaceView/utils/quickFileSearchResilience.ts` `apps/desktop/src/renderer/views/WorkspaceView/utils/previewResilience.ts` `apps/desktop/src/renderer/views/WorkspaceView/index.tsx` `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` `apps/desktop/scripts/capture-workspace-preview-search-resilience-guard-phase11.mjs` を照合する

## Main Chat / Settings runtime 同期（TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001）を探すとき

このカテゴリは `llm:check-health` `llm:set-selected-config` `AI_CHECK_CONNECTION` `DEFAULT_CONFIG` `HealthCheckResult` `SetSelectedConfigParams` `aiHandlers` `llmConfigProvider` `disconnected` `P42 validation` で検索を分割する。

```bash
node scripts/search-spec.js "llm:check-health" -C 3
node scripts/search-spec.js "llm:set-selected-config" -C 3
node scripts/search-spec.js "AI_CHECK_CONNECTION" -C 3
node scripts/search-spec.js "DEFAULT_CONFIG" -C 3
node scripts/search-spec.js "HealthCheckResult" -C 3
node scripts/search-spec.js "SetSelectedConfigParams" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「Main Chat / Settings runtime 同期」を見る
2. `references/api-ipc-system-core.md` で `AI_CHAT` IPC チャンネル・P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を確認する
3. `references/llm-ipc-types.md` で `HealthCheckResult`（`llm:check-health` レスポンス）・`SetSelectedConfigParams`（`llm:set-selected-config` 引数）型を確認する
4. `references/arch-state-management-core.md` で `llmSlice` の `selectedConfig` 同期フローと Store 更新タイミングを確認する
5. `references/lessons-learned-current.md` で P42（trim バリデーション）・P60（IPC レスポンス形式不一致）の教訓と UT-TASK06-001〜004 未タスク状況を確認する
6. `references/task-workflow-backlog.md` で UT-TASK06-001〜004（aiHandlers / llmConfigProvider / disconnected 統一 / AI_CHAT バリデーション）の状況を確認する
7. 実装実体: `apps/desktop/src/main/ipc/aiHandlers.ts`（AI_CHAT P42バリデーション）`apps/desktop/src/main/ipc/llm.ts`（llm:check-health disconnected統一）`apps/desktop/src/main/services/llmConfigProvider.ts`（DEFAULT_CONFIG廃止）`apps/desktop/src/preload/channels.ts`（AI_CHECK_CONNECTION legacy残置）

## AI Chat / Workspace LLM integration fix を探すとき

このカテゴリは `ChatView` `chatError` `selectedProviderId` `selectedModelId` `llm:set-selected-config` `WorkspaceChatPanel` `onStreamError` `persist` で検索を分割する。

```bash
node scripts/search-spec.js "chatError" -C 3
node scripts/search-spec.js "selectedProviderId" -C 3
node scripts/search-spec.js "llm:set-selected-config" -C 3
node scripts/search-spec.js "WorkspaceChatPanel" -C 3
node scripts/search-spec.js "onStreamError" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（AI Chat / LLM integration fix）」を見る
2. `references/workflow-ai-chat-llm-integration-fix.md` で 4 タスクの concern 別読書セットを確定する
3. `references/llm-ipc-types.md` で `AIChatResponse.error` と `llm:set-selected-config` 契約を確認する
4. UI 導線は `references/ui-ux-feature-components.md` と `references/ui-ux-navigation.md` を読む
5. persist は `references/arch-state-management-reference-persist-hardening-test-quality.md` と `references/arch-ipc-persistence.md` を読む
6. 実装実体は `apps/desktop/src/renderer/store/slices/chatSlice.ts` `apps/desktop/src/renderer/store/slices/llmSlice.ts` `apps/desktop/src/renderer/store/index.ts` `apps/desktop/src/main/ipc/llmConfigProvider.ts` `apps/desktop/src/renderer/views/ChatView/index.tsx` `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` を照合する

## AI runtime/auth-mode unification を探すとき

このカテゴリは `ai-runtime-authmode` `auth mode unification` `settings authmode` `legacy-ordinal-family-register` `UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001` で検索を分割する。

```bash
node scripts/search-spec.js "ai-runtime-authmode" -C 3
node scripts/search-spec.js "auth mode unification" -C 3
node scripts/search-spec.js "legacy-ordinal-family-register" -C 3
node scripts/search-spec.js "UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「設計同期（AI runtime/auth-mode unification）」を見る
2. `references/workflow-ai-runtime-authmode-unification.md` で foundation 契約に加えて `current canonical set` と `artifact inventory` を確認する
3. `references/ui-ux-settings.md` / `references/interfaces-auth.md` / `references/api-ipc-system.md` で settings 3領域と runtime 契約の境界を確認する
4. `references/task-workflow.md` と `references/lessons-learned.md` で完了記録、苦戦箇所、関連未タスク `UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001` を確認する
5. `references/legacy-ordinal-family-register.md` で旧 filename 互換行（`qa-checklist` -> `quality-assurance-checklist`）を確認する

## Skill/Agent runtime routing integration closure を探すとき

このカテゴリは `runtime routing integration closure` `TerminalHandoffCard` `handoffGuidance` `RuntimeResolver` `AGENT_EXECUTION_START` `skill:execute handoff` で検索を分割する。

```bash
node scripts/search-spec.js "runtime routing integration closure" -C 3
node scripts/search-spec.js "TerminalHandoffCard" -C 3
node scripts/search-spec.js "handoffGuidance" -C 3
node scripts/search-spec.js "AGENT_EXECUTION_START" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「Skill/Agent runtime routing 統合（harness + handoff guidance）」を見る
2. `references/interfaces-agent-sdk-executor-core.md` / `details.md` / `history.md` で `skill:execute` / `agent:start` の handoff 契約を確認する
3. `references/arch-electron-services-details.md` で `RuntimeResolver` / `TerminalHandoffBuilder` の DI 配線を確認する
4. `references/ui-ux-agent-execution-core.md` で `TerminalHandoffCard` の表示条件・操作を確認する
5. `references/arch-state-management-reference.md` で `handoffGuidance` の state 遷移と dismiss 契約を確認する
6. workflow 証跡は `docs/30-workflows/completed-tasks/runtime-routing-integration-closure/outputs/phase-11/` と `outputs/phase-12/` を参照する

## Workspace Chat Edit AI Runtime（RuntimeResolver / handoff）を探すとき

検索語: `RuntimeResolver` `AnthropicLLMAdapter` `TerminalHandoffBuilder` `HandoffGuidance` `chat-edit:send-with-context` `workspacePath` `isAllowedPath`

読む順番:
1. `references/llm-workspace-chat-edit.md` で RuntimeResolver / AnthropicLLMAdapter / TerminalHandoffBuilder の実装仕様を確認
2. `references/interfaces-llm.md` で RuntimeResolution / HandoffGuidance 型定義を確認
3. `references/api-ipc-agent-core.md` で `chat-edit:send-with-context` チャンネル契約変更を確認
4. `references/security-electron-ipc-core.md` で workspacePath 検証・M-01 contextBridge 修正を確認
5. `references/lessons-learned-current.md` で P57-P61 の苦戦箇所を確認
6. 実装実体: `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts` `AnthropicLLMAdapter.ts` `TerminalHandoffBuilder.ts` `apps/desktop/src/main/ipc/chatEditHandlers.ts` `apps/desktop/src/preload/chatEditApi.ts`

## Skill Docs Runtime Integration（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001）を探すとき

検索語: `DocOperationResult` `ILLMDocQueryAdapter` `SkillDocsCapabilityResult` `skill-docs:query` `CapabilityResolver` `bind() DI`

読む順番:
1. `references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` で `DocOperationResult` / `ILLMDocQueryAdapter` / `SkillDocsCapabilityResult` の型定義を確認する
2. `references/api-ipc-agent-details.md` でエラーコード体系（1001-5001、7カテゴリ: Validation/Permission/FileSystem/LLM/Parse/Context/Internal）と 4チャンネル契約（`skill-docs:query` 等）を確認する
3. `references/security-electron-ipc-advanced.md` で 4チャンネル4層防御（送信元検証 → ホワイトリスト → 入力バリデーション → サニタイズ）を確認する
4. `references/lessons-learned-current.md` で以下の教訓を確認する: bind() を用いた this コンテキスト保持 DI パターン、CapabilityResolver のフォールバック戦略、Phase 4-5 統合テスト設計の注意点
