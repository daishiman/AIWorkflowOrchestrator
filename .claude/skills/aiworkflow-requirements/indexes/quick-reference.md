# クイックリファレンス

> 最重要情報への即時アクセス
> 詳細は resource-map.md → 該当ファイル を参照

---

## よく使うパターン

### 仕様検索の分割ルール

- `search-spec.js` は **1概念1クエリ** で分割して使う
- 例: `TASK-10A-F useSkillAnalysis SkillCreateWizard` のようにまとめず、`TASK-10A-F` → `useSkillAnalysis` → `SkillCreateWizard` → `skillError` の順で個別検索する
- broad query が 0 件でも、resource-map / quick-reference / topic-map から再入場して取りこぼしを防ぐ

### スキルライフサイクル一次導線 / 画面責務再編を探すとき

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

### Skill Lifecycle 評価・採点ゲート（TASK-SKILL-LIFECYCLE-04）を探すとき

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

### 作成済みスキル利用導線（TASK-SKILL-LIFECYCLE-05）を探すとき

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

### Preload safeInvoke timeout を探すとき

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

### Light Theme contrast regression guard を探すとき

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

### Workspace parent reference sweep guard を探すとき

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

### Workspace preview/search resilience guard を探すとき

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

### AI runtime/auth-mode unification を探すとき

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

### Skill/Agent runtime routing integration closure を探すとき

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

### Workspace Chat Edit AI Runtime（RuntimeResolver / handoff）を探すとき

検索語: `RuntimeResolver` `AnthropicLLMAdapter` `TerminalHandoffBuilder` `HandoffGuidance` `chat-edit:send-with-context` `workspacePath` `isAllowedPath`

読む順番:
1. `references/llm-workspace-chat-edit.md` で RuntimeResolver / AnthropicLLMAdapter / TerminalHandoffBuilder の実装仕様を確認
2. `references/interfaces-llm.md` で RuntimeResolution / HandoffGuidance 型定義を確認
3. `references/api-ipc-agent-core.md` で `chat-edit:send-with-context` チャンネル契約変更を確認
4. `references/security-electron-ipc-core.md` で workspacePath 検証・M-01 contextBridge 修正を確認
5. `references/lessons-learned-current.md` で P57-P61 の苦戦箇所を確認
6. 実装実体: `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts` `AnthropicLLMAdapter.ts` `TerminalHandoffBuilder.ts` `apps/desktop/src/main/ipc/chatEditHandlers.ts` `apps/desktop/src/preload/chatEditApi.ts`

### Electron IPC パターン

```typescript
// Main Process Handler
ipcMain.handle("xxx:action", async (event, request) => {
  return { success: true, data: result };
});

// Preload API
contextBridge.exposeInMainWorld("xxxAPI", {
  action: (req) => ipcRenderer.invoke("xxx:action", req),
});

// React Hook
const result = await window.xxxAPI.action(request);
```

**詳細**: architecture-patterns.md L620-905, security-api-electron.md

### IPC transport DTO 正本化パターン

```typescript
// shared transport DTO を唯一の正本にする
export type IPCResponse<T> =
  | { success: true; data?: T }
  | { success: false; error: { code: string; message: string } };

// Main / Preload / Renderer は再定義せず import / re-export する
```

| 確認項目 | 期待値 |
|---------|--------|
| request / response / event | `packages/shared/src/types/*` の DTO と一致 |
| Preload 公開型 | local 再定義ではなく shared 型の import / re-export |
| error envelope | `success` / `data` / `error.code` / `error.message` / `guidance?` が一致 |

**詳細**: api-ipc-system.md, interfaces-auth.md, ipc-contract-checklist.md

### IPC ハンドラライフサイクル管理パターン（P5 Main Process 対策）

macOS `activate` イベントでウィンドウ再作成時の二重登録防止:

```typescript
// ❌ 二重登録例外（handle は2回目で例外送出）
app.on("activate", () => {
  mainWindowRef = createWindow();
  registerAllIpcHandlers(mainWindowRef); // Error!
});

// ✅ unregister → createWindow → register の3ステップ
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    unregisterAllIpcHandlers();           // Step 1: 全解除
    mainWindowRef = createWindow();       // Step 2: 新ウィンドウ
    registerAllIpcHandlers(mainWindowRef); // Step 3: 再登録
  }
});
```

| API | 二重登録時の動作 | 解除API |
|-----|-----------------|---------|
| `ipcMain.handle()` | 例外送出 | `removeHandler()` |
| `ipcMain.on()` | リスナー累積 | `removeAllListeners()` |

**詳細**: security-electron-ipc.md（IPC ハンドラライフサイクル管理）, architecture-implementation-patterns.md（二重登録防止パターン）
**関連 Pitfall**: 06-known-pitfalls.md#P5

### Supabase 未設定 fallback handler パターン

```typescript
if (getSupabaseClient()) {
  registerAuthHandlers(mainWindow, supabase, secureStorage);
  registerProfileHandlers(mainWindow, supabase, profileCache);
  registerAvatarHandlers(mainWindow, supabase);
} else {
  registerAuthFallbackHandlers();
  registerProfileFallbackHandlers();
  registerAvatarFallbackHandlers();
}
```

| 確認項目 | 期待値 |
| -------- | ------ |
| Profile channels | `profile:*` 11チャネルを fallback 配列へ全件登録 |
| Avatar channels | `avatar:*` 3チャネルを fallback 配列へ全件登録 |
| error envelope | `{ success: false, error: { code, message } }` に統一し、`PROFILE_ERROR_CODES.NOT_CONFIGURED` / `AVATAR_ERROR_CODES.NOT_CONFIGURED` を返す |
| registration | `ReadonlyArray` + `for...of` で宣言的登録 |
| lifecycle | 通常経路と fallback 経路を if/else 排他にする |

**詳細**: api-ipc-auth.md, architecture-auth-security.md, security-electron-ipc.md, ipc-contract-checklist.md
**完了タスク**: TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001（Profile 11ch / Avatar 3ch の fallback 実装完了）

### Result Pattern

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

**詳細**: interfaces-core.md L70-105

### Zustand Slice

```typescript
export const createXxxSlice: StateCreator<XxxSlice> = (set) => ({
  // state
  data: null,
  // actions
  setData: (data) => set({ data }),
});
```

**詳細**: architecture-patterns.md L141-234

### P31対策: Store Hooks無限ループ防止

合成Store Hook（`useAuthModeStore()`等）が毎回新しいオブジェクトを返すため、関数を`useEffect`依存配列に含めると無限ループ発生。

| 対策 | 方法 | 適用場面 |
|------|------|---------|
| 短期 | `useRef`ガード + 空の依存配列 | 既存コード緊急修正 |
| 長期 | 個別セレクタ再設計 | 新規実装時 |

```typescript
// ❌ 無限ループ
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => { initializeAuthMode(); }, [initializeAuthMode]);

// ✅ useRefガード
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) { initRef.current = true; initializeAuthMode(); }
}, []); // P31対策: 意図的に空の依存配列
```

**詳細**:
- 設計原則: arch-state-management.md L156-245
- 成功パターン: patterns.md（Zustand Store Hooks 無限ループ対策）
- 落とし穴: 06-known-pitfalls.md#P31

### Store selector migration / renderer direct IPC removal

```typescript
// before
const result = await window.electronAPI.skill.analyze(skillName);

// after
const analyzeSkill = useAnalyzeSkill();
await analyzeSkill(skillName);
```

| 確認項目 | 期待値 |
|---------|--------|
| 対象 | Renderer 直呼び出しを Store action / 個別セレクタへ寄せる |
| state 境界 | 共有 state は Store、UI 一時 state は local |
| 検索語 | `TASK-10A-F`, `store-driven lifecycle`, `selector migration`, `renderer direct IPC removal` |

**詳細**: arch-state-management.md, architecture-implementation-patterns.md, task-workflow.md, lessons-learned.md

### CTA制御マトリクスパターン（TASK-SKILL-LIFECYCLE-05）

`Record<ScoringGate, CTAVisibility>` で採点ゲート → ボタン表示状態を静的マッピング。キー不足はコンパイルエラーで検出。30テスト（16マトリクス + 7境界値 + 3異常値 + 4ハイライト）。

```typescript
import { getCTAVisibilityFromScore } from "@repo/shared";
const cta = getCTAVisibilityFromScore(85); // USE_ALLOWED
// cta.useNow === "primary", cta.improveFirst === "hidden"
```

**詳細**: workflow-skill-lifecycle-created-skill-usage-journey.md, packages/shared/src/types/cta-visibility.ts

### ChatPanel統合パターン（TASK-7D）

```typescript
// 条件レンダーでSkillStreamingViewを統合
{isExecuting && selectedSkillName && (
  <SkillStreamingView skillName={selectedSkillName} />
)}

// forwardRef + useImperativeHandle で外部API公開
const ChatPanel = forwardRef<ChatPanelHandle, ChatPanelProps>((props, ref) => {
  useImperativeHandle(ref, () => ({ handleImportRequest }));
});

// DisplayableStatus型（idle除外の厳密なステータス）
type DisplayableStatus = Exclude<SkillExecutionStatus, "idle">;

// Store個別セレクタで再レンダー最適化
const isExecuting = useAppStore((s) => s.skill.isExecuting);
const selectedSkillName = useAppStore((s) => s.skill.selectedSkillName);
```

**詳細**: interfaces-agent-sdk-ui.md, ui-ux-agent-execution.md, ui-ux-feature-components.md

---

## 型定義クイックアクセス

| 用途               | 型名                          | ファイル                   |
| ------------------ | ----------------------------- | -------------------------- |
| API結果            | `OperationResult<T>`          | interfaces-core.md         |
| IPC transport      | `IPCResponse<T>`              | interfaces-auth.md         |
| 認証方式状態       | `AuthModeStatus`              | interfaces-auth.md         |
| スキル情報         | `Skill`, `SkillMetadata`      | interfaces-agent-sdk.md    |
| チャットメッセージ | `ChatMessage`                 | interfaces-llm.md          |
| 会話セッション     | `ChatSession`                 | interfaces-chat-history.md |
| RAG検索結果        | `SearchResult`                | interfaces-rag-search.md   |
| エラー             | `AppError`, `ValidationError` | error-handling.md          |
| CTA制御            | `CTAVisibility`, `CTAState`   | workflow-skill-lifecycle-created-skill-usage-journey.md |

---

## IPCチャンネル早見表

### 認証・ユーザー

| チャンネル         | 用途           |
| ------------------ | -------------- |
| `auth:get-session` | セッション取得 |
| `auth:sign-out`    | ログアウト     |
| `auth-mode:get`    | 現在の認証方式取得 |
| `auth-mode:set`    | 認証方式の切替 |
| `auth-mode:status` | 現在 mode の資格情報状態取得 |
| `auth-mode:validate` | 対象 mode の有効性検証 |
| `auth-mode:changed` | Main→Renderer の認証方式変更通知 |

### スキル管理

| チャンネル             | 用途           |
| ---------------------- | -------------- |
| `skill:list-available` | スキルスキャン |
| `skill:list-imported`  | インポート済み |
| `skill:execute`        | スキル実行     |
| `skill:permission`     | 権限確認       |

### チャット

| チャンネル       | 用途           |
| ---------------- | -------------- |
| `chat:send`      | メッセージ送信 |
| `chat:stream`    | ストリーミング |
| `conversation:*` | 会話履歴管理   |

**詳細**: api-endpoints.md L126-736

---

## ディレクトリ構成早見表

```
apps/
  desktop/
    src/
      main/           # Electron Main Process
        services/     # ビジネスロジック
        ipc/          # IPCハンドラ
        settings/     # 設定管理
      renderer/       # React UI
        store/        # Zustand
        views/        # ページ
        components/   # 共通コンポーネント
      preload/        # Preload API
  web/                # Next.js (将来)
packages/
  shared/             # 共通型・ユーティリティ
    src/types/        # 型定義
  ui/                 # UIコンポーネント
```

**詳細**: directory-structure.md

---

## エラーコード早見表

| プレフィックス | 種別             | 例                     |
| -------------- | ---------------- | ---------------------- |
| ERR_1xxx       | システムエラー   | ERR_1001 INTERNAL      |
| ERR_2xxx       | 認証・認可       | ERR_2006 UNAUTHORIZED  |
| ERR_3xxx       | バリデーション   | ERR_3001 INVALID_INPUT |
| ERR_4xxx       | ビジネスロジック | ERR_4001 NOT_FOUND     |

**詳細**: error-handling.md L8-230

---

## テスト基準早見表

| メトリクス        | 必須 | 推奨 |
| ----------------- | ---- | ---- |
| Line Coverage     | 80%  | 90%+ |
| Branch Coverage   | 75%  | 85%+ |
| Function Coverage | 90%  | 100% |

**詳細**: quality-requirements.md L94-256

---

## セキュリティチェックリスト

- [ ] 入力バリデーション（Zod）
- [ ] IPCチャンネルホワイトリスト
- [ ] XSS対策（DOMPurify）
- [ ] パストラバーサル防止
- [ ] 機密情報ログ出力禁止

**詳細**: security-implementation.md, security-api-electron.md

---

## 新機能追加フロー

1. **型定義**: `packages/shared/src/types/`
2. **サービス**: `apps/desktop/src/main/services/`
3. **IPCハンドラ**: `apps/desktop/src/main/ipc/`
4. **Preload API**: `apps/desktop/src/preload/`
5. **React Hook**: `apps/desktop/src/renderer/hooks/`
6. **UIコンポーネント**: `apps/desktop/src/renderer/components/`
7. **テスト**: 各ディレクトリの`__tests__/`

**詳細**: architecture-patterns.md L8-74

---

## 仕様書テンプレート選択

| 作成対象                  | テンプレート               |
| ------------------------- | -------------------------- |
| インターフェース/型定義   | interfaces-template.md     |
| アーキテクチャ/パターン   | architecture-template.md   |
| API/エンドポイント        | api-template.md            |
| Electron IPC              | ipc-channel-template.md    |
| React Hook                | react-hook-template.md     |
| サービス/ビジネスロジック | service-template.md        |
| UIコンポーネント          | ui-ux-template.md          |
| テスト仕様                | testing-template.md        |
| エラーハンドリング        | error-handling-template.md |
| セキュリティ              | security-template.md       |
| データベース              | database-template.md       |
| デプロイ/CI/CD            | deployment-template.md     |
| 技術スタック              | technology-template.md     |
| Claude Code               | claude-code-template.md    |
| ワークフロー              | workflow-template.md       |
| 汎用                      | spec-template.md           |

---

## 関連ドキュメント

| ドキュメント                 | 用途                      |
| ---------------------------- | ------------------------- |
| resource-map.md              | タスク種別→ファイル逆引き |
| topic-map.md                 | セクション・行番号詳細    |
| spec-guidelines.md           | 仕様書作成ルール          |
| spec-splitting-guidelines.md | ファイル分割ルール        |
