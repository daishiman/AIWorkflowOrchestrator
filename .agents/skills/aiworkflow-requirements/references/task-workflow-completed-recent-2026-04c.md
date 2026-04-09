# 完了タスク記録 — 2026-04-04〜2026-04-06（後半）

> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

| UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 | SkillLifecyclePanel ウィザード遷移ボタン化（executionPrompt state/textarea 削除、defaultExecutionPrompt 定数導入、onOpenSettings prop 追加、LLMAdapterErrorBanner → settings 導線実装） | 2026-04-08 | PR#完了 | phase-12 100% PASS / 85 tests green |

### タスク: UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 SkillLifecyclePanel テキストエリア削除・ウィザード遷移ボタン化（2026-04-08）

| 項目       | 値                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                          |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                             |
| タイプ     | ui-refactoring / state-cleanup / TDD                                                       |
| 優先度     | 高                                                                                         |
| 完了日     | 2026-04-08                                                                                 |
| 対象       | `SkillLifecyclePanel.tsx` / `SkillLifecyclePanel.test.tsx`                                 |
| 成果物     | `docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001/`                    |

#### 実施内容

- `executionPrompt` state（useState）を削除し、全参照箇所を `defaultExecutionPrompt` 定数に置換
- `canExecuteSkill` からプロンプト長チェック（`executionPrompt.trim().length > 0`）を削除
- `skill-lifecycle-execution-input` textarea（JSX）を削除
- `handleExecute` / `handlePlanImprovement` を `defaultExecutionPrompt` 定数使用に変更
- TC-04, TC-05 を Red→Green（`skill-lifecycle-execution-input` 非存在確認 + 回帰ガード）
- Phase 1-12 全成果物を `outputs/` に整備

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/`: 85 PASS / 18 SKIP
- `pnpm --filter @repo/desktop typecheck`: PASS

#### Phase 12 carry-over

- W2-seq-03a: `SkillCreateWizard` への実配線・疎通確認は current facts で解消済み（`onOpenSkillWizard` prop の接続確認済み）

---

### タスク: TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 execute/improve adapter guard（2026-04-04）

| 項目       | 値                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001                                                       |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                                        |
| タイプ     | runtime bug-fix / adapter guard / error-propagation                                                   |
| 優先度     | 高                                                                                                    |
| 完了日     | 2026-04-04                                                                                            |
| 対象       | `RuntimeSkillCreatorFacade.execute()` / `RuntimeSkillCreatorFacade.improve()` / structured error flow |
| 成果物     | `docs/30-workflows/ut-rt-01-execute-improve-adapter-guard-001/`                                       |

#### 実施内容

- `execute()` / `improve()` の先頭に `_llmAdapterStatus` guard を追加し、`failed` / `initializing` で早期 return するようにした
- `packages/shared/src/types/skillCreator.ts` に `RuntimeSkillCreatorExecuteErrorResponse` を追加し、`RuntimeSkillCreatorExecuteResponse` union を拡張した
- `SkillCreatorWorkflowEngine.recordExecuteAdapterFailure()` を追加し、execute の adapter failure を review-ready snapshot として保存するようにした
- `SkillCreatorWorkflowEngine.recordImproveFailure()` を追加し、improve failure を `currentPhase: improve` のまま `verifyResult` に反映するようにした
- `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` で structured execute error を message へ正規化し、SkillCreateWizard は `executePlan` ack 後に `getWorkflowState` を再読込して handoff / failure snapshot を表示するようにした
- `outputs/phase-11/*` と `outputs/phase-12/*` を current facts に差し替え、NON_VISUAL evidence と Phase 12 docs を同 wave で閉じた
- `TASK-UT-RT-01-PHASE11-NONVISUAL-WALKTHROUGH-EVIDENCE-001` を resolved carry-over として backlog から completed へ移管し、Phase 10 の MINOR follow-up 2件を backlog へ formalize した

#### 検証証跡

- `pnpm --filter @repo/shared typecheck`: PASS
- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/desktop exec eslint src/main/services/runtime/RuntimeSkillCreatorFacade.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/renderer/components/skill/SkillCreateWizard.tsx src/renderer/components/skill/SkillLifecyclePanel.tsx`: PASS
- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`: PASS（4 files / 69 tests）

#### Phase 12 未タスク

- `TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001`
- `TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001`

---

### タスク: TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 executeAsync() の error message 伝搬パス統一（2026-04-06）

| 項目       | 値                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001                                                                                      |
| ステータス | **完了**                                                                                                                                    |
| タイプ     | runtime bug-fix / error-propagation / documentation sync                                                                                    |
| 優先度     | 中                                                                                                                                          |
| 完了日     | 2026-04-06                                                                                                                                  |
| 対象       | `RuntimeSkillCreatorFacade.executeAsync()` / `RuntimeSkillCreatorFacade.executeAsync.test.ts` / `outputs/phase-11/*` / `outputs/phase-12/*` |
| 成果物     | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/`                                                                 |

#### 実施内容

- `executeAsync()` の structured error / catch パスで `if (!snapshot)` 条件を削除し、snapshot の有無に依存せず `onWorkflowStateSnapshot` を呼ぶようにした
- `RuntimeSkillCreatorFacade.executeAsync.test.ts` に T-01〜T-06 を追加し、structured error / catch / regression の 10 テストを固定した
- `creatorHandlers.ts` / `skill-creator-api.ts` / `SkillLifecyclePanel.tsx` を更新し、workflow-state changed event の errorMessage を Renderer まで通すようにした
- `creatorHandlers.test.ts` に errorMessage 付き snapshot の state-changed event 伝搬テストを追加した
- `SkillLifecyclePanel.error-persistence.test.tsx` に errorMessage-only event の回帰テストを追加した
- `outputs/phase-11/manual-test-checklist.md` / `manual-test-result.md` / `manual-test-report.md` / `discovered-issues.md` を追加し、NON_VISUAL 証跡を current facts として残した
- `outputs/phase-12/*` の 6 ファイルを作成し、implementation guide / system spec / changelog / feedback / compliance を同期した
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` の残課題行を完了扱いへ更新し、`task-workflow-completed.md` に本完了セクションを追加した
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して `topic-map.md` / `keywords.json` を再生成した

#### 検証証跡

- `pnpm typecheck`: PASS
- `pnpm lint`: PASS（0 errors / 10 warnings）
- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/creatorHandlers.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts src/preload/__tests__/skill-creator-api.runtime.test.ts src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx`: PASS（53 tests）
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`: PASS

#### Phase 12 補足

- `TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001` は未タスク候補として残している
- Renderer 側 UI 表示確認は本タスクのスコープ外のため、別タスク候補として維持している

---

### タスク: TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001（2026-04-06）

| 項目       | 値                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001                                                            |
| ステータス | **完了**                                                                                          |
| タイプ     | refactoring / ui                                                                                  |
| 優先度     | 中                                                                                                |
| 完了日     | 2026-04-06                                                                                        |
| 対象       | `useAuthKeyManagement` 新規追加 / `AuthKeySection` への統合 / `ApiKeySettingsPanel` 委譲 / 型統一 |
| 成果物     | `docs/30-workflows/rt-04-authkey-component-dedup/`                                                |
| GitHub     | Issue #1903                                                                                       |

#### 実施内容

- `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts` を新規追加し、`auth-key:*` IPC 呼び出しを集約
- `packages/shared/src/types/skillCreator.ts` の `ApiKeyStatus` に `check-failed` を追加し UI 状態型を統一
- `AuthKeySection` をフック統合 + `onStatusChange` props 対応へ更新
- `ApiKeySettingsPanel` を `AuthKeySection` への委譲ラッパーへ変更
- テスト: `useAuthKeyManagement.test.ts` / `AuthKeySection.test.tsx` / `ApiKeySettingsPanel.test.tsx` を更新

#### 未タスク

- TECH-M-01 を `TASK-RT-04-APIKEYPANEL-REMOVAL-001` として backlog に登録（ApiKeySettingsPanel 廃止）

---

### タスク: TASK-RT-02 api-key-ui-adapter-status（2026-03-29）

| 項目       | 値                                                            |
| ---------- | ------------------------------------------------------------- |
| タスクID   | TASK-RT-02                                                    |
| ステータス | **完了**                                                      |
| タイプ     | implementation / ui                                           |
| 優先度     | 中                                                            |
| 完了日     | 2026-03-29                                                    |
| 対象       | `ApiKeysSection` に `AdapterStatusBadge` + `RetryButton` 統合 |
| 成果物     | `docs/30-workflows/task-rt-02-api-key-ui-adapter-status/`     |

#### 実施内容

- `AdapterStatusBadge` atom を新規作成（`LLMAdapterStatus: ready/initializing/failed` の3状態を色付き Badge で視覚化・アクセシビリティ対応 `role="status"` / `aria-live="polite"`）
- `RetryButton` atom を新規作成（`failed` 状態時の再接続アクション・`isRetrying` でローディング状態表示）
- `ApiKeysSection` に `refreshAdapterStatuses()` を追加し、登録済みプロバイダーの health check を並列実行（`Promise.allSettled`）
- `adapterStatusRequestIdRef` で request ID をトラッキングし、非同期競合状態（race condition）を防止
- `Partial<Record<AIProvider, boolean>>` でプロバイダー単位の `isRetrying` 状態をマップ管理
- `atoms/index.ts` に `AdapterStatusBadge` / `RetryButton` をエクスポート追加

#### 苦戦箇所

| 苦戦箇所                                  | 再発条件                                                                   | 解決策                                                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 非同期 health check の競合状態            | 複数回 `refreshAdapterStatuses` が連続呼び出しされた場合                   | `useRef` でリクエスト ID をトラッキングし、古いリクエスト結果を無視                          |
| `Promise.allSettled` と個別エラーの独立性 | 複数プロバイダーを並列実行しつつ個別エラーが他プロバイダーに伝播しない設計 | `allSettled` で全結果を収集、`rejected` 時は `failed` + `errorMessage` にフォールバック      |
| プロバイダー単位の `isRetrying` 管理      | 同一セクションで複数プロバイダーが同時リトライ可能な場合                   | `Partial<Record<AIProvider, boolean>>` で Map パターン管理、他プロバイダーの状態に影響しない |

#### 検証証跡

- `AdapterStatusBadge.test.tsx`: 3状態表示・failureReason・アクセシビリティ PASS
- `RetryButton.test.tsx`: レンダリング・クリック・disabled・aria-label PASS
- GitHub Issue: #1705

---

### タスク: TASK-RT-04 skill-authkey-api-key-management-ui（2026-03-29）

| 項目       | 値                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------- |
| タスクID   | TASK-RT-04                                                                                  |
| ステータス | **完了**                                                                                    |
| タイプ     | implementation / ui                                                                         |
| 優先度     | 中                                                                                          |
| 完了日     | 2026-03-29                                                                                  |
| 対象       | `ApiKeySettingsPanel` 新規実装 / `SkillLifecyclePanel` 補助導線統合 / `ApiKeyStatus` 型追加 |
| 成果物     | `docs/30-workflows/step-08-par-task-rt-04-api-key-management-ui/`                           |

#### 実施内容

- `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` を新規作成（`auth-key:exists/set/delete` IPC 再利用、30 tests PASS）
- `packages/shared/src/types/skillCreator.ts` に `ApiKeyStatus` 型を追加（`not_set / validating / configured / error`）
- `packages/shared/src/types/index.ts` に `ApiKeyStatus` をエクスポート追加
- `SkillLifecyclePanel.tsx` に `<ApiKeySettingsPanel />` を補助導線として組み込み
- `SettingsView` を主導線・`SkillLifecyclePanel` を補助導線として責務境界を文書化

#### 苦戦箇所

| 苦戦箇所                                                       | 再発条件                                                     | 解決策                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| esbuild バイナリアーキ不一致（`darwin-arm64` vs `darwin-x64`） | `pnpm install` 後に optional deps が現在アーキと合わない場合 | `pnpm install --force` で optional dependency を再解決     |
| Settings vs Lifecycle 責務境界の曖昧さ                         | 同一 IPC チャネルを複数 surface で再利用する場合             | 主導線/補助導線の役割を workflow index.md に明記し仕様固定 |

#### 検証証跡

- `ApiKeySettingsPanel.test.tsx`: 30 tests PASS
- Phase 11 screenshots: TC-11-01〜TC-11-03（3枚）current build 撮影
- `api-ipc-system-core.md`: Runtime lane 補助導線ルール追記完了
- `interfaces-agent-sdk-skill-reference.md`: `ApiKeyStatus` 型追記完了
- 未タスク3件（UT-TASK-RT-04-\*）: すべて resolved

---

### タスク: TASK-SDK-03 context-budget-and-resource-selection（2026-03-27）

| 項目       | 値                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-03                                                                                          |
| ステータス | **完了**                                                                                             |
| タイプ     | refactoring / implementation                                                                         |
| 優先度     | 高                                                                                                   |
| 完了日     | 2026-03-27                                                                                           |
| PR         | #1666                                                                                                |
| 対象       | PhaseResourcePlanner / SkillCreatorSourceResolver / ResolvedResourceReader / context budget 動的解決 |
| 成果物     | `docs/30-workflows/step-03-par-task-03-context-budget-and-resource-selection/`                       |

#### 実施内容

- `SkillCreatorSourceResolver`（候補解決）、`PhaseResourcePlanner`（tier 選択・予算強制）、`ResolvedResourceReader`（読み出し）を独立クラスに分離
- manifest 解決 → リソース選択 → 予算強制の3段階パイプラインを確立
- tier ベースの段階的リソース削減（optional-deep-dive → optional-quality → required-context）を実装
- context budget と resource selection を動的解決へ移行

---

### タスク: TASK-SDK-04 user-interaction-bridge-and-phase-ui（2026-03-27）

| 項目       | 値                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-04                                                                   |
| ステータス | **完了**                                                                      |
| タイプ     | implementation                                                                |
| 優先度     | 高                                                                            |
| 完了日     | 2026-03-27                                                                    |
| PR         | #1667                                                                         |
| 対象       | ユーザー入力ブリッジ / フェーズ UI 同期 / IPC 型外部化                        |
| 成果物     | `docs/30-workflows/step-04-par-task-04-user-interaction-bridge-and-phase-ui/` |

#### 実施内容

- ユーザー入力ブリッジと Phase UI の同期を実装
- `AwaitingUserInput` → `UserInputRequest` への型リネームと packages/shared/ への外部化
- IPC / Preload / Main 全レイヤーの同時更新

---

### タスク: TASK-SDK-04-U2 plan-execute-canonical-binding（2026-03-28）

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| タスクID   | TASK-SDK-04-U2                                                         |
| ステータス | **完了**                                                               |
| タイプ     | bug-fix                                                                |
| 優先度     | 高                                                                     |
| 完了日     | 2026-03-28                                                             |
| 親タスク   | TASK-SDK-04                                                            |
| 対象       | `SkillLifecyclePanel.tsx` の execute flow canonical binding drift 是正 |
| 成果物     | `docs/30-workflows/TASK-SDK-04-U2-plan-execute-canonical-binding/`     |

#### 実施内容

- `approvedSkillSpec` state を追加し、textarea draft と approved snapshot を分離
- `handleExecutePlan` が `request.trim()` ではなく `approvedSkillSpec` を参照するよう修正
- cancel 時の対称クリア実装
- テスト 5件追加（U-8b, U-18, U-19, U-20, U-21）

---

### タスク: TASK-P0-07 hardcoded-agent-names-dynamic-resolution — plan/improve 動的解決と root dedupe（2026-04-06）

| 項目       | 値                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-07                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ステータス | **完了**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| タイプ     | refactoring / docs sync                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 優先度     | 高                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 完了日     | 2026-04-06                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 対象       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`, `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts`, `apps/desktop/src/main/services/runtime/planPromptConstants.ts`, `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`, `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`, `docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution/outputs/phase-12/*` |
| 関連タスク | step-11-par-task-plan-execution-hardening / step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution                                                                                                                                                                                                                                                                                                                                                                                                                           |

#### 実施内容

- `plan()` / `improve()` の manifest 優先解決を current facts へ同期し、phase resource ids を source of truth として扱うよう整理
- fallback path は `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` のみを source of truth とし、agent 名を静的文字列から切り離した
- `SkillCreatorSourceResolver` の root dedupe を resolved root ベースに変更し、manifest / explicit / env の同一 root 重複を除去
- `AGENT_NAMES` を削除し、plan/improve の両方で dynamic resource pipeline と static fallback の整合を維持
- 影響: No public surface change（IPC contract / shared types / API シグネチャ変更なし）

---

### タスク: TASK-SDK-05 create-entry-mainline-unification（2026-03-27）

| 項目       | 値                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-05                                                                |
| ステータス | **完了**                                                                   |
| タイプ     | implementation                                                             |
| 優先度     | 高                                                                         |
| 完了日     | 2026-03-27                                                                 |
| PR         | #1667, #1668                                                               |
| 対象       | create entry の mainline 統合 / ViewType 契約                              |
| 成果物     | `docs/30-workflows/step-04-par-task-05-create-entry-mainline-unification/` |

#### 実施内容

- create entry の mainline 統合と ViewType 契約の確立
- advanced route boundary の整備

---

### タスク: UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 IPC ハンドラ登録完全性スナップショットテスト（2026-04-07）

| 項目       | 値                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------- |
| タスクID   | UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001                                              |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                           |
| タイプ     | bug-fix / CI 強化 / snapshot test                                                        |
| 優先度     | 高                                                                                       |
| 完了日     | 2026-04-07                                                                               |
| 対象       | `registerRuntimeSkillCreatorHandlers()` — 18 チャネル（public runtime 16 + auxiliary 2） |
| 成果物     | `docs/30-workflows/completed-tasks/UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001/`         |
| 発見元     | TASK-FIX-IPC-SKILL-NAME-001 Phase 12 close-out (2026-04-06)                              |

#### 実施内容

- `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts` を新規作成
  - TC-01: 登録チャネル名がスナップショットと一致する（決定論的ソート済み配列）
  - TC-02: 重複チャネルが存在しない（`Set.size === Array.length`）
  - TC-03: 登録チャネル総数が 18（public runtime 16 + auxiliary 2）
  - TC-04: 重複登録が注入された場合に検出できる（ネガティブテスト）
  - TC-05: 想定外チャネル追加でスナップショット差分が生じる（ネガティブテスト）
- `vi.hoisted` + `vi.mock("electron")` で `ipcMain.handle` をモック化し、全 handle() 呼び出し引数を spy で記録
- `__snapshots__/ipcHandlerRegistrationSnapshot.test.ts.snap` を自動生成・コミット
- `docs/30-workflows/completed-tasks/UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001.md` に仕様書移動（unassigned-task → completed-tasks）

#### 背景

TASK-FIX-IPC-SKILL-NAME-001 修正作業中に `registerRuntimeSkillCreatorHandlers()` 内で `ipcMain.handle()` が同一チャネルに 2 回実行され、後続 14 チャネルが未登録になっていた重複バグを発見。ElectronJS の `ipcMain.handle()` はサイレント無視するためランタイムエラーが出ず、長期間コードレビューのみに依存していた。スナップショット CI テストで再発防止。

#### 検証証跡

- `pnpm --filter @repo/desktop typecheck`: PASS
- `pnpm --filter @repo/desktop exec eslint src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts`: PASS
- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot`: PASS（5 tests）

#### Phase 12 未タスク

- `UT-IPC-EXECUTION-CHANNELS-PARITY-001`: Renderer 側チャネル一覧との突合（別タスク）

---

### タスク: UT-SKILL-WIZARD-W1-par-02a SkillInfoStep コンポーネント実装（Step 0）（2026-04-07）

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W1-par-02a                              |
| ステータス | **完了**                                                |
| タイプ     | UI implementation / wizard redesign                     |
| 優先度     | 高                                                      |
| 完了日     | 2026-04-07                                              |
| 対象       | `SkillInfoStep.tsx`（新規）/ `DescribeStep.tsx`（削除） |
| 成果物     | `docs/30-workflows/W1-par-02a-skill-info-step/`         |

#### 実施内容

- `SkillInfoStep.tsx` を新規作成。スキル名（任意）・目的・背景（必須・10文字以上）・カテゴリ（5種単選択・必須）を入力する Step 0 フォームコンポーネント。
- `DescribeStep.tsx` / `DescribeStep.test.tsx` を削除（旧 Step 0 実装）。
- `wizard/index.ts` のエクスポートを再構成: `DescribeStep` → `SkillInfoStep`。
- `GenerateStep.tsx` の `GenerationMode` standalone 定義を撤去し、export を正本化。
- `SkillCreateWizard.tsx` の Step 0 を `DescribeStep` から `SkillInfoStep` へ置き換え。
- 共有型 `SkillInfoFormData` / `SkillCategory` は `@repo/shared/types/skillCreator` の正本参照（W0-seq-01 で定義済み）。

#### 検証証跡

- SkillInfoStep 単体テスト 26 件 PASS
- Phase 11 スクリーンショット 8 件（TC-01〜TC-08）保存
- Phase 12 成果物 6件 PASS（implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check）
- 未タスク: 0件（W2 への引き継ぎは W1-par-02b / W2-seq-03b のスコープ）

---

### タスク: UT-SKILL-WIZARD-W1-par-02d SkillLifecyclePanel ウィザード遷移ボタン化（2026-04-08）

| 項目       | 値                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                                                                         |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                                     |
| タイプ     | UI implementation / wizard redesign                                                                |
| 優先度     | 高                                                                                                 |
| 完了日     | 2026-04-08                                                                                         |
| 対象       | `SkillLifecyclePanel.tsx` / `SkillManagementPanel.tsx` / `SkillCreateWizard.tsx` / `agentSlice.ts` |
| 成果物     | `docs/30-workflows/W1-par-02d-lifecycle-panel/`                                                    |

#### 実施内容

- `SkillLifecyclePanel.tsx` のテキストエリア・「スキルを生成する」ボタン・「方針を決める」ボタンを削除し、「スキル作成ウィザードを開く →」ボタン一本に置き換え
- `onOpenSkillWizard?: () => void` / `onOpenWizard?: () => void` Props を追加（既存 Props との共存）
- `agentSlice.ts` の `PlanResult` インターフェースに `skillSpec?: string` を追加し canonical 値として保持
- `approvedSkillSpec` 重複 state を除去し `activePlanResult.skillSpec` を canonical data flow として一本化
- `SkillCreateWizard.tsx`: `executePlan` に canonical `skillSpec` を渡すよう修正
- `SkillManagementPanel.tsx`: `lifecycle` ビューで `onOpenSkillWizard` を接続
- テスト 4 件（auth-regression / llm-generation / error-persistence / SkillLifecyclePanel）を current Props に合わせて更新
- 仕様書ディレクトリを `skill-wizard-redesign-lane/W1-par-02d-lifecycle-panel/` → `docs/30-workflows/W1-par-02d-lifecycle-panel/` へ移動（フラット化）

#### 苦戦箇所

| #   | 苦戦箇所                                                                                                | 解決策                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | `approvedSkillSpec`（textarea draft）と `activePlanResult.skillSpec`（approved snapshot）の二重管理混在 | `activePlanResult.skillSpec` を canonical 値として一本化し、textarea draft を除去             |
| 2   | `onOpenWizard` と `onOpenSkillWizard` の両 Props 共存                                                   | 両方 optional で残し、`SkillManagementPanel` で同値（`() => setCurrentView("create")`）を渡す |
| 3   | ディレクトリ移動後の `skill-wizard-redesign-lane/index.md` 参照パス不整合                               | 未コミット段階のため次回コミット時に修正                                                      |

#### 検証証跡

- テスト 4 ファイル / Phase 12 成果物 6件 PASS
- 未タスク: 0件

### タスク: TASK-SDK-06 verify-and-improve-lifecycle-surface（2026-03-27）

| 項目       | 値                                                                                   |
| ---------- | ------------------------------------------------------------------------------------ |
| タスクID   | TASK-SDK-06                                                                          |
| ステータス | **完了**                                                                             |
| タイプ     | implementation                                                                       |
| 優先度     | 高                                                                                   |
| 完了日     | 2026-03-27                                                                           |
| PR         | #1668                                                                                |
| 対象       | verify detail 展開 / reverify ワークフロー / layer3-4 verify check 自動生成          |
| 成果物     | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001/` |

#### 実施内容

- `getVerifyDetail(planId)` API の実装（artifact + provenance + route + phase の複合 evidence 管理）
- `requestReverify(planId)` API の実装
- disable 理由の4段階判定（not_verified / no_artifact / incomplete_provenance / route_mismatch）
- layer3 / layer4 の verify check 自動生成

### タスク: TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 RuntimeSkillCreatorFacade adapter guard（2026-04-04）

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| ステータス | **完了**                                        |
| タイプ     | implementation                                  |
| 優先度     | 高                                              |
| 完了日     | 2026-04-04                                      |

#### 実施内容

- `execute()` / `improve()` 先頭に LLMAdapter ステータス3段階チェック（initializing / ready / failed）を追加
- `RuntimeSkillCreatorExecuteErrorResponse` 型を `packages/shared` に新設し `RuntimeSkillCreatorExecuteResponse` union を拡張
- `SkillCreatorWorkflowEngine.recordImproveFailure()` メソッドを追加
- `SkillCreateWizard` / `SkillLifecyclePanel` の structured error 表示対応

#### 検証

- 69 テスト PASS

---

### タスク: UT-SDK-L34-UI-DISPLAY-001 SkillLifecyclePanel Layer別グルーピング（2026-04-04）

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | UT-SDK-L34-UI-DISPLAY-001 |
| ステータス | **完了**                  |
| タイプ     | implementation            |
| 優先度     | 中                        |
| 完了日     | 2026-04-04                |

#### 実施内容

- `SkillLifecyclePanel.tsx` で Layer3/4 チェック結果をグループ別アコーディオン・severity アイコン付き表示を実装
- Phase 3 レビュー完了

---

### タスク: UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001 SkillStreamMessage と SkillCreatorSdkEvent の出力型統合（2026-04-04）

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| タスクID   | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001 |
| ステータス | **完了**                                        |
| タイプ     | implementation                                  |
| 優先度     | low                                             |
| 完了日     | 2026-04-04                                      |

#### 実施内容

- `packages/shared/src/types/skillCreator.ts` に `SdkOutputMessageBase`（共通基底型）を追加
- `SkillExecutorStreamMessage` / `SkillExecutorStreamMessageType` を新設（旧: `SkillExecutor.ts` ローカル `SkillStreamMessage` / `SkillStreamMessageType` を shared に集約）
- `SkillCreatorSdkEvent` が `SdkOutputMessageBase` を継承するよう変更
- `packages/shared/index.ts` / `packages/shared/src/types/index.ts` に新型を export 追加
- `apps/desktop/src/main/services/skill/SkillExecutor.ts` のローカル型定義を `@deprecated` 型エイリアスに置き換え、`@repo/shared` から `SkillExecutorStreamMessage` をインポート

#### 検証

- `pnpm typecheck` PASS
- `pnpm lint` 0 errors

---

### タスク: TASK-P0-09 claude-sdk-permission-hooks-governance Phase 12 close-out（2026-04-06）

| 項目       | 値                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-09                                                                                                                                   |
| ステータス | **完了**                                                                                                                                     |
| タイプ     | implementation / TDD / governance                                                                                                            |
| 優先度     | 最高                                                                                                                                         |
| 完了日     | 2026-04-06                                                                                                                                   |
| 対象       | `runtime/governance/` サブディレクトリ（`SkillCreatorPermissionPolicy` / `SkillCreatorHooksFactory` / `SkillCreatorAuditSink` / `index.ts`） |
| 成果物     | `docs/30-workflows/task-p0-09-sdk-permission-hooks-governance/`（Phase 1-13 仕様書 15ファイル）                                              |

#### 実施内容

- `runtime/governance/` サブディレクトリを新設し、全 governance ファイルを集約
- 命名規則を `SkillCreator` プレフィックスに統一（旧: `GovernanceHooksFactory` / `GovernanceAuditSink` → 新: `SkillCreatorHooksFactory` / `SkillCreatorAuditSink`）
- TDD: Phase 4（Red）→ Phase 5（Green）→ Phase 6（fail-path / edge case / 回帰ガード）→ Phase 7（カバレッジ確認）
- `SkillCreatorPermissionPolicy`: plan/execute/verify/improve の policy テーブルを `Object.freeze()` で保護、`canUseTool(toolName, phase)` を実装
- `SkillCreatorHooksFactory`: `createHooks(phase, auditSink, provenance?)` でライフサイクルフックを生成
- `SkillCreatorAuditSink`: in-memory ring buffer（maxEvents: 500、`slice(-N)` 方式）で監査イベントを蓄積
- `RuntimeSkillCreatorFacade`: plan/execute/verify/improve 各フェーズで governance hooks を接続、`getGovernanceState()` で状態公開
- `governance-hooks-factory-audit-sink.md` を新 API に更新し、canonical spec と実装の一致を確認
- TASK-P0-09-U1（path-scoped enforcement）は `TODO(TASK-P0-09-U1)` コメントで carry-forward として明示

#### 検証証跡

- `pnpm --filter @repo/desktop test -- --grep "governance|SkillCreatorPermission|SkillCreatorHooks|SkillCreatorAudit" --run`
- 90 tests PASS（PermissionPolicy 31件 / HooksFactory 18件 / AuditSink 15件 / Integration 12件 / AllPhases 14件）
- typecheck: EXIT:0 ✅
- lint: EXIT:0（10 warnings / 0 errors）⚠️
- Phase 11: NON_VISUAL（Main プロセス非 UI コンポーネント、自動テスト代替 PASS）

---

### タスク: TASK-P0-09-U1 path-scoped-governance-runtime-enforcement（2026-04-06）

| 項目       | 値                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-09-U1                                                                                              |
| ステータス | **完了**                                                                                                   |
| タイプ     | implementation / TDD / security                                                                            |
| 優先度     | 最高                                                                                                       |
| 完了日     | 2026-04-06                                                                                                 |
| 対象       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                      |
| 成果物     | `docs/30-workflows/task-p0-09-u1-path-scoped-governance-runtime-enforcement/`（Phase 1-12 仕様書・テスト） |

#### 実施内容

- `extractTargetPath(input)` private helper を追加（`file_path ?? path` fallback パターン）
- `createExecuteGovernanceCanUseTool(skillRoot)` のシグネチャを修正し、`targetPath` / `allowedSkillRoot` context を `evaluateGovernanceToolUse` に渡す配線を接続
- `createImproveGovernanceCanUseTool(skillRoot)` を新規追加（improve phase 対応）
- `_executeInternal()` 呼び出しで `this.getExplicitSkillCreatorRoot() ?? ""` を渡すよう修正
- `SkillCreatorPermissionPolicy.ts` の `TODO(TASK-P0-09-U1)` コメントを解消

#### 検証証跡

- TDD: TC-PATH-01〜06（path-scoped deny/allow）+ extractTargetPath 4件 = 11件追加
- 合計 101 tests PASS（`path-scoped-enforcement.test.ts` 含む）
- typecheck: EXIT:0 ✅
- Phase 11: NON_VISUAL（Main プロセス非 UI コンポーネント、自動テスト代替 PASS）
