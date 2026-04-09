# タスク完了記録 — インデックス

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: index — 詳細は各子ファイルを参照
> 区分: 履歴記録（history record）

## 最近の完了タスク（2026-04）

- [2026-04-08: UT-SKILL-WIZARD-W2-seq-03a SkillCreateWizard オーケストレーション更新（LLM専用化・SmartDefault・GenerateStep再入防止・CompleteStep skillPath表示）](./task-workflow-completed-recent-2026-04d.md)
- [2026-04-05～04-06（前半）: UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 / TASK-SDK-04-U1-F1 / TASK-P0-01 / TASK-UI-01 など](./task-workflow-completed-recent-2026-04b.md)
- [2026-04-04～04-06（後半）: TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 / TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001 / TASK-P0-07 / TASK-P0-09 など](./task-workflow-completed-recent-2026-04c.md)
- [2026-04-01～04-03: TASK-SDK-SC-02 Conversation UI コンポーネント](./task-workflow-completed-recent-2026-04a.md)
### タスク: UT-SKILL-WIZARD-W0-seq-01 スキルウィザード共有型定義追加（2026-04-07）

| 項目       | 値                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W0-seq-01                                                                           |
| ステータス | **完了（Phase 12 close-out / Phase 13 blocked）**                                                   |
| タイプ     | docs / shared-types / workflow-sync                                                                 |
| 優先度     | 高                                                                                                  |
| 完了日     | 2026-04-07                                                                                          |
| 対象       | `packages/shared/src/types/skillCreator.ts` の共有型契約追加と Phase 12 ドキュメント同期           |
| 成果物     | `docs/30-workflows/W0-seq-01-types-skill-info-form/`                                                |
| 元未タスク | なし（lane spec 先行タスク）                                                                        |

#### 実施内容

- `SkillCategory` / `SkillInfoFormData` / `SkillWizardScheduleConfig` / `QuestionAnswer` / `ConversationAnswers` / `SmartDefaultResult` / `SkeletonQualityFeedback` を `packages/shared/src/types/skillCreator.ts` に追加した
- `packages/shared/src/types/__tests__/skillCreator-wizard.test.ts` を新規作成し、型契約 7 件を TDD で固定した
- `docs/30-workflows/W0-seq-01-types-skill-info-form/phase-12-docs.md` の出力先を current root に是正し、Phase 12 の 6 成果物を作成した
- `docs/30-workflows/W0-seq-01-types-skill-info-form/artifacts.json` と `outputs/artifacts.json` を `phase13_blocked` で同期した
- `docs/30-workflows/W0-seq-01-types-skill-info-form/index.md` と `docs/30-workflows/skill-wizard-redesign-lane/index.md` に完了記録を追加した
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` に shared contract を反映し、`task-specification-creator` / `aiworkflow-requirements` の LOGS も同波更新した

#### 検証証跡

- `pnpm --filter @repo/shared typecheck`: PASS
- `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts`: PASS
- `pnpm exec eslint packages/shared/src/types/skillCreator.ts packages/shared/src/types/__tests__/skillCreator-wizard.test.ts`: PASS

### タスク: UT-RT-02-EXHAUSTIVE-CHECK-001 RuntimeSkillCreatorExecuteResponse union exhaustive check 導入（2026-04-07）

| 項目       | 値                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------- |
| タスクID   | UT-RT-02-EXHAUSTIVE-CHECK-001                                                                       |
| ステータス | **完了**                                                                                            |
| タイプ     | refactoring / exhaustive-check / typescript                                                         |
| 優先度     | 中                                                                                                  |
| 完了日     | 2026-04-07                                                                                          |
| 対象       | `RuntimeSkillCreatorFacade.executeAsync()` の switch + assertNever 化                               |
| 成果物     | `docs/30-workflows/ut-rt-02-exhaustive-check/`                                                      |
| 元未タスク | `docs/30-workflows/unassigned-task/task-runtime-execute-response-exhaustive-check.md`                 |

#### 実施内容

- `classifyExecuteResult()` module-local 正規化 helper + `assertNever()` を `RuntimeSkillCreatorFacade.ts` に追加した
- `executeAsync()` の `isStructuredError` if-else パターンを switch + assertNever に変換した
- `success === false`（厳格等価）で振る舞いを旧コードと完全に一致させた（T-03 回帰防止）
- TC-08（unknown variant smoke test）と it.todo TC-09 をテストファイルに追加した
- 11 tests PASS / 1 todo / pnpm typecheck エラー 0 件

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` → 11 PASS / 1 todo
- `pnpm --filter @repo/desktop typecheck` → エラー 0 件

---

### タスク: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 スマートデフォルト推論サービス実装（2026-04-07）

| 項目       | 値                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001                                                     |
| ステータス | **完了（Phase 12 close-out / Phase 13 blocked）**                                                   |
| タイプ     | docs / shared-services / workflow-sync                                                              |
| 優先度     | 高                                                                                                  |
| 完了日     | 2026-04-07                                                                                          |
| 対象       | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` の推論実装と Phase 12 同期 |
| 成果物     | `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/`                                      |
| 元未タスク | なし（lane spec 先行タスク）                                                                        |

#### 実施内容

- `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` に `inferSmartDefaults` を実装し、Slack / GitHub / Notion / scheduled / realtime / code / structured の規則ベース推論を追加した
- `packages/shared/src/services/skillCreator/index.ts` と `packages/shared/index.ts` を更新し、`@repo/shared` から `inferSmartDefaults` を import できるようにした
- `packages/shared/src/types/index.ts` と `packages/shared/index.ts` を更新し、`SkillInfoFormData` / `SmartDefaultResult` を root export で利用できるようにした
- `packages/shared/vitest.config.ts` に `@repo/shared` alias を追加し、shared 内テストの解決性を固定した
- `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` を 33 tests PASS に拡張し、空白のみ purpose の edge case を固定した
- `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/artifacts.json` / `outputs/artifacts.json` を `phase13_blocked` へ同期した
- `docs/30-workflows/skill-wizard-redesign-lane/index.md` に W0-seq-02 の完了記録を追加した
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `task-workflow-backlog.md` / `task-workflow-completed.md` / `LOGS.md` / `SKILL.md` / `.claude/skills/task-specification-creator/LOGS.md` を same-wave で更新した
- `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/outputs/phase-12/implementation-guide.md` と `system-spec-update-summary.md` を current facts に同期した

#### 検証証跡

- `pnpm exec vitest run src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts`（`packages/shared` 直下）: 33 tests PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/W0-seq-02-smart-default-reasoning-service`: PASS

### タスク: UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Skill Creator preload / renderer に approval:request surface を追加（2026-04-06）

## 完了タスク（2026-03後半）

- [2026-03-29～31: TASK-P0-02 / TASK-P0-05 / TASK-LLM-MOD-05 / TASK-RT-01 / TASK-RT-02 / TASK-RT-04 / UT-RT-06-* / TASK-UIUX-FEEDBACK-001 など](./task-workflow-completed-recent-2026-03d.md)
- [2026-03-25～28: TASK-SDK-03 / TASK-SDK-04 / TASK-SDK-05 / TASK-SDK-06 / UT-IMP-RUNTIME-WORKFLOW-* / UT-LLM-MOD-01-005 / TASK-SDK-01 / TASK-SDK-02 など](./task-workflow-completed-recent-2026-03c.md)
- [2026-03-22～26（後半）: TASK-SDK-08 / TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 / TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 / TASK-SC-04 / UT-SC-03-003 / TASK-IMP-SLIDE-MODIFIER / TASK-IMP-TERMINAL-HANDOFF / TASK-IMP-TRANSCRIPT / TASK-IMP-SETTINGS-SHELL / TASK-IMP-CANONICAL-BRIDGE / TASK-IMP-HEALTH-POLICY / TASK-IMP-ADVANCED-CONSOLE-SAFETY など](./task-workflow-completed-recent-2026-03e.md)
- [2026-03-19～21: TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 / TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 / TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 / TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001](./task-workflow-completed-recent-2026-03b.md)
- [2026-03-10～18: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 / TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 / TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 / TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 / TASK-SKILL-LIFECYCLE-01 / TASK-UI-06/07/08/04B](./task-workflow-completed-recent-2026-03a.md)

## 完了タスク（機能別アーカイブ）

### Skill Lifecycle

- [Skill Lifecycle UI 実装系（前半）](./task-workflow-completed-skill-lifecycle-ui.md)
- [Skill Lifecycle UI 実装系（後半: Verify/Improve パネル）](./task-workflow-completed-skill-lifecycle-ui-verify.md)
- [Skill Lifecycle メイン](./task-workflow-completed-skill-lifecycle.md)
- [Skill Lifecycle 設計](./task-workflow-completed-skill-lifecycle-design.md)
- [Skill Lifecycle セキュリティ](./task-workflow-completed-skill-lifecycle-security.md)
- [Skill Lifecycle AuthFix](./task-workflow-completed-skill-lifecycle-authfix.md)
- [Skill Lifecycle AgentView/LineBudget](./task-workflow-completed-skill-lifecycle-agent-view-line-budget.md)
- [Skill Lifecycle アーカイブ 2026-03](./task-workflow-completed-skill-lifecycle-archive-2026-03.md)

### Chat / Lifecycle / Tests

- [Chat Lifecycle Tests（前半）](./task-workflow-completed-chat-lifecycle-tests.md)
- [Chat Lifecycle Tests（後半）](./task-workflow-completed-chat-lifecycle-tests-part2.md)
- [Workspace Chat Lifecycle Tests](./task-workflow-completed-workspace-chat-lifecycle-tests.md)

### IPC / Preload / Contract

- [IPC Contract Preload Alignment（前半）](./task-workflow-completed-ipc-contract-preload-alignment.md)
- [IPC Preload Foundation（後半）](./task-workflow-completed-ipc-preload-foundation.md)
- [IPC Graceful Degradation Lifecycle](./task-workflow-completed-ipc-graceful-degradation-lifecycle.md)

### UI / View / Navigation

- [Skill Import / Skill Center Nav](./task-workflow-completed-skill-import-skill-center-nav.md)
- [Skill Create UI Integration](./task-workflow-completed-skill-create-ui-integration.md)
- [Advanced Views / Analytics / Audit](./task-workflow-completed-advanced-views-analytics-audit.md)
- [Agent View / Line Budget](./task-workflow-completed-agent-view-line-budget.md)
- [UI/UX Visual Baseline Drift](./task-workflow-completed-ui-ux-visual-baseline-drift.md)

### Auth / Notification / State

- [Notification / History / Auth Key State](./task-workflow-completed-notification-history-auth-key-state.md)
- [Abort / Contract / Auth / Session / Chat](./task-workflow-completed-abort-contract-auth-session-chat.md)

| 項目       | 値                                                                                 |
| ---------- | ---------------------------------------------------------------------------------- |
| タスクID   | UT-VERIFY-DOC-CONSOLIDATION-001                                                    |
| ステータス | **完了（Phase 13: worktree completed）**                                           |
| タイプ     | documentation / doc-consolidation                                                  |
| 優先度     | 中                                                                                 |
| 完了日     | 2026-04-06                                                                         |
| 対象       | verify 関連ドキュメント4ファイルの区分ラベル付与・責務分離明示                     |
| 成果物     | `docs/30-workflows/completed-tasks/UT-VERIFY-DOC-CONSOLIDATION-001.md`               |
### Quality / Infra

- [Quality Gates / Module Resolution / Logging](./task-workflow-completed-quality-gates-module-resolution-logging.md)
- [Debug / Scheduler / Doc Generation / Theme](./task-workflow-completed-debug-scheduler-doc-generation-theme.md)
- [UT-06 Safety Gate](./task-workflow-completed-ut-06-safety-gate.md)

### Workspace

#### 検証証跡

- Phase 6: リンク整合チェック PASS（`outputs/phase-6/link-check-report.md`）
- Phase 7: 機能要件・非機能要件カバレッジ確認 PASS（`outputs/phase-7/`）
- Phase 8: ラベル整合・責務セクション・スタイル整合チェック PASS（`outputs/phase-8/`）
- Phase 9: ID整合・リンク・Prettier 検証 PASS（`outputs/phase-9/`）
- Phase 10: 最終レビュー PASS（`outputs/phase-10/final-review-result.md`）
- Phase 11: 手動テスト PASS（`outputs/phase-11/manual-test-report.md`）
- Phase 12: スキルフィードバック反映 PASS（`outputs/phase-12/skill-feedback-report.md`）

#### 苦戦箇所（詳細は lessons-learned）

| 苦戦箇所                                       | 解決策概要                                                    |
| ---------------------------------------------- | ------------------------------------------------------------- |
| 並行マージコンフリクト検出（`||||||| Stash base` マーカー） | PR前チェックリストにコンフリクトマーカー検索を追加            |
| インデックステーブル全行への列追加の手間       | 20行超のテーブルは置換スクリプト化が有効                      |
| 正本・履歴判別の属人化解消                     | 冒頭 `> 区分: XXX` ラベルの統一付与で解消                     |

→ 詳細: [lessons-learned-verify-contract-consolidation.md](lessons-learned-verify-contract-consolidation.md)

---

### タスク: TASK-FIX-IPC-SKILL-NAME-001 ipcMain重複登録・スキル名正規化修正（2026-04-06）

| 項目             | 値                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | TASK-FIX-IPC-SKILL-NAME-001                                                                                                    |
| ステータス       | **完了（Phase 12 close-out）**                                                                                                  |
| タイプ           | bug-fix / ipc / skill-name-normalization                                                                                        |
| 優先度           | 高                                                                                                                              |
| 完了日           | 2026-04-06                                                                                                                      |
| 対象             | `creatorHandlers.ts` ipcMain重複登録修正 / `SkillService.toWizardSkillName()` 正規化強化                                        |
| 成果物           | `docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/`                                                        |

#### 実施内容

- `registerRuntimeSkillCreatorHandlers()` の `SKILL_CREATOR_GET_ADAPTER_STATUS` 2重登録を除去（後続14ハンドラの未登録が解消、全16チャネルが正常登録）
- `toWizardSkillName()` に5ステップ正規化フロー実装（小文字化→非許容文字ハイフン化→連続ハイフン圧縮→端除去→"new-skill"フォールバック）
- `resolveUniqueSkillName()` による衝突回避（`new-skill-2` / `new-skill-3`...）
- `docs/00-requirements/18-skills.md` 3.2.2.1セクションに正規化規則を追記
- `docs/00-requirements/08-api-design.md` にIPC ハンドラ一意性要件を追記
- Phase 7 で `creatorHandlers.governanceState.test.ts` 新規12テスト追加

#### 未タスク（Phase 12 close-out）

- `UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001`: SKILL_NAME_PATTERN定数一元化（Medium）
- `UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001`: IPC登録CIスナップショット（Medium）
- `UT-FIX-SKILL-NAME-JAPANESE-INPUT-UX-001`: 日本語入力リアルタイムプレビュー（Low）

---

### タスク: UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 phase-spec-template Task/Step 分離と NON_VISUAL evidence hardening（2026-04-06）
### タスク: UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001 task-specification-creator Phase-12 テンプレート改善（2026-04-06）

## UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001: task-specification-creator Phase-12 テンプレート改善
- 完了日: 2026-04-06
- 内容: Phase-12 validator 改善（NEXT_PART_HEADING導入、fence-safe化）、テンプレート構造化、SKILL.md v10.09.35 更新
- 成果物: 6ファイル（implementation-guide / documentation-changelog / system-spec-update-summary / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check）

---

### タスク: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001 packages/shared/src/ipc/channels.ts を desktop 実装へ同期（2026-04-06）

| 項目             | 値                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                                                                      |
| ステータス       | **完了（Phase 12 close-out）**                                                                                                  |
| タイプ           | refactor / ipc / shared-normalization / NON_VISUAL                                                                             |
| 優先度           | 高                                                                                                                              |
| 完了日           | 2026-04-06                                                                                                                      |
| 対象             | `packages/shared/src/ipc/channels.ts` / `apps/desktop/src/preload/channels.ts` / `governance-bundle.test.ts`                   |
| 元未タスク指示書 | `docs/30-workflows/completed-tasks/task-ut-sdk-07-shared-ipc-channel-contract-001.md`                                          |

#### 実施内容

- `SKILL_CREATOR_RUNTIME_CHANNELS` を `packages/shared/src/ipc/channels.ts` に正本化し、3チャネル（`SKILL_CREATOR_PROGRESS` / `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` / `SKILL_CREATOR_ADAPTER_STATUS_CHANGED`）を shared の SSoT として定義
- `apps/desktop/src/preload/channels.ts` が `@repo/shared/src/ipc/channels` から `SKILL_CREATOR_RUNTIME_CHANNELS` をインポートするよう変更（直書き廃止）
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` に Cross-layer parity テストを追加（将来の shared-preload ドリフトを自動検出）
- `packages/shared/vitest.config.ts` の coverage 対象から `src/ipc/channels.ts` の除外を解除

#### 苦戦箇所（詳細は lessons-learned-phase12-workflow-lifecycle.md）

| 苦戦箇所                                            | 解決策概要                                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| shared パッケージ内テストで `@repo/shared` エイリアスが解決できない | テストファイル内インポートを相対パスに変更（`../channels` 等）                     |
| IPC チャネル命名規則の既存パターン未把握            | Phase 1 開始前に `grep -n "CHANNELS" channels.ts` で命名規則を表として整理         |
| TDD Red Phase 前の設計前提整合未確認               | allowlist / 既存テスト期待値への影響範囲を Phase 3 先行ステップで文書化            |

---

### タスク: UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001 visible handoff / disclosure / execution host の Phase 11 screenshot 取得（2026-04-06）

| UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001 | visible handoff / disclosure / execution host の Phase 11 screenshot 取得 | spec_created | 2026-04-06 |

### タスク: TASK-P0-01 llm-adapter-status（2026-04-06）

| 項目       | 値                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-01                                                                                                  |
| ステータス | **完了（Phase 13: worktree completed）**                                                                    |
| タイプ     | implementation / IPC 4層統合                                                                                |
| 優先度     | 高                                                                                                          |
| 完了日     | 2026-04-06                                                                                                  |
| 対象       | LLM Adapter Status IPC エンドポイント実装                                                                   |
| 成果物     | `docs/30-workflows/skill-creator-agent-sdk-lane/step-12-par-task-ui-03-ipc-session-runtime-unification/`   |

#### 実施内容

- `getAdapterStatus`: 現在の LLM Adapter の状態（providerName / modelName / isConnected / lastChecked）を取得する IPC エンドポイントを creatorHandlers → SkillCreatorFacade → Preload API → Renderer の4層で統合
- `onAdapterStatusChanged`: Adapter の状態変化をイベント購読する IPC チャネルを実装（preload variadic パターン適用）
- `useLLMAdapterStatus` Hook: Renderer 側で Adapter 状態を管理する専用 Hook（ポーリング不要のイベント駆動設計）
- `GovernanceSummaryPanel.tsx` に Adapter Status 表示を統合

#### 苦戦箇所

| 苦戦箇所 | 解決策概要 |
| --- | --- |
| IPC 4層型同期漏れリスク | `AdapterStatus` 型を `packages/shared/src/types/` に SSoT として定義し全層から import |
| preload variadic 化 | `safeOn` を `[AdapterStatus, string?]` として型付けし、Renderer 側 callback で optional 第2引数を受け取る |

→ 詳細: [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md) L-IPC-4LAYER-001 / L-IPC-4LAYER-002

---

### タスク: TASK-UI-01 lifecycle-panel-primary-route-promotion（2026-04-06）

| 項目       | 値                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-01                                                                                                |
| ステータス | **完了（Phase 13: worktree completed）**                                                                  |
| タイプ     | implementation / UI routing                                                                               |
| 優先度     | 高                                                                                                        |
| 完了日     | 2026-04-06                                                                                                |
| 対象       | SkillLifecyclePanel を一次導線（primary route）として昇格                                                 |
| 成果物     | `docs/30-workflows/skill-creator-agent-sdk-lane/step-12-par-task-ui-03-ipc-session-runtime-unification/` |

#### 実施内容

- `navigateToSkillLifecycle()` shared action を実装し、SkillCenter → SkillLifecyclePanel への直結ルーティングを確立（最小変更 ~42行）
- `skillLifecycle` ViewType を `apps/desktop/src/renderer/` に追加（`SKILL_LIFECYCLE_PRIMARY_VIEW` 定数）
- `SkillLifecycleJourneyPanel` / `SkillLifecycleSurfaceOwnershipPanel` コンポーネントを Atomic Design 準拠で追加
- `journeyActions` CTA 集約による一次導線の視認性向上
- Phase 11 Playwright screenshot 4枚（`outputs/phase-11/screenshots/`）で visual evidence を取得

#### 苦戦箇所

| 苦戦箇所 | 解決策概要 |
| --- | --- |
| SessionResumePrompt / SessionIndicator との遷移ロジック複雑化 | `snapshot` を `null` に型統一し `hasSession = snapshot !== null` 単一判定ポイントに集約 |
| snapshot nullability チェックの冗長化 | `snapshot ?? null` で undefined を早期正規化し optional chaining 乱用を回避 |

→ 詳細: [lessons-learned-ipc-preload-runtime.md](lessons-learned-ipc-preload-runtime.md) L-SESSION-RESUME-UI-001
→ 仕様更新: [ui-ux-navigation.md](ui-ux-navigation.md) v1.9.2

---

### タスク: TASK-P0-08 session-resume-renderer-integration（2026-04-06）
### タスク: TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001 verifyAndImproveLoop adapter error notification（2026-04-06）

| 項目             | 値                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------- |
| タスクID         | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001                                                   |
| ステータス       | **仕様書作成完了（`spec_created` / Phase 13 blocked）**                                |
| タイプ           | docs-only / NON_VISUAL                                                                 |
| 優先度           | 中                                                                                     |
| 完了日           | 2026-04-06                                                                             |
| 対象             | `task-specification-creator` / Phase 仕様書テンプレート                                |
| GitHub Issue     | #1919                                                                                  |
| 成果物           | `docs/30-workflows/ut-phase-spec-format-improvement-001/`                              |
| 元未タスク指示書 | `docs/30-workflows/completed-tasks/ut-phase-spec-format-improvement-001.md`         |

#### 実施内容

- `phase-spec-template.md` に Task / Step 分離ルールと Phase 11 NON_VISUAL / Phase 12 記録分離方針を追加した
- `unassigned-task-template.md` に苦戦箇所の必須記載欄を追加した
- `task-workflow-backlog.md` に UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 を spec_created として登録し、`task-workflow-completed.md` / `LOGS.md` / `SKILL.md` / `index.md` / `artifacts.json` / `outputs/artifacts.json` を same-wave sync した
- `phase-11-manual-test.md` で NON_VISUAL evidence を検証し、`manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` を current facts へ記録した
- `phase-12-documentation.md` で implementation-guide / system-spec / documentation-changelog / unassigned-task-detection / skill-feedback-report / compliance-check を作成した

#### 検証証跡

- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/ut-phase-spec-format-improvement-001 --json`: PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-phase-spec-format-improvement-001`: PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/ut-phase-spec-format-improvement-001 --json`: PASS
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/ut-phase-spec-format-improvement-001/outputs/phase-11/manual-test-result.md`: PASS
- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`: PASS
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`: FAIL（既存の line budget / description 境界のため）
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`: FAIL（既存の line budget / description / mirror 差分のため）

---

| 項目             | 値                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------- |
| タスクID         | TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001                          |
| ステータス       | **完了（Phase 12 close-out / Phase 13 blocked）**                                      |
| タイプ           | docs-improvement / runtime follow-up / notification                                    |
| 優先度           | 中                                                                                     |
| 完了日           | 2026-04-06                                                                             |
| 対象             | `RuntimeSkillCreatorFacade.verifyAndImproveLoop()` の improve adapter error 通知        |
| GitHub Issue     | #1896                                                                                  |
| 成果物           | `docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001/`    |
| 元未タスク指示書 | `docs/30-workflows/completed-tasks/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001.md` |

#### 実施内容

- `verifyAndImproveLoop()` の improve adapter error が `success:false` を返す場合に、`execute()` / `improve()` 単体の degraded 通知と同じ失敗通知を出す方針を close-out した
- close-out 証跡として workflow spec（`index.md` / `phase-*.md`）、`artifacts.json` / `outputs/artifacts.json`、Phase 11 NON_VISUAL evidence、Phase 12 outputs を canonical filename で揃えた
- `task-workflow-backlog.md` から該当 row を完了へ移管し、follow-up の残り 1件（executeAsync snapshot）だけを backlog に残した

#### 検証証跡

- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001`: PASS（0エラー / 0警告）
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001`: PASS（警告 26）

### タスク: TASK-P0-05 execute() → SkillFileWriter persist 統合（2026-04-05）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-P0-08 |
| ステータス | **仕様書作成完了（`spec_created` / Phase 13 blocked）** |
| タイプ | implementation / renderer-session-resume |
| 優先度 | 高 |
| 完了日 | 2026-04-06 |
| 対象 | `SkillLifecyclePanel` / `SessionResumePrompt` / `SessionIndicator` / session persistence bridge |
| 成果物 | `docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-08-session-resume-renderer-integration/` |

#### 実施内容

- `SkillCreatorSessionListItem` に `sessionId?` / `startedAt?` / `isActive?` を追加し、`SkillCreatorSessionResumeResult` と `cleanupExpiredSessions()` を shared / preload / main で同期した
- `RuntimeSkillCreatorFacade.resumeSession()` を direct result 返却へ更新し、expired checkpoint は `errorReason: "expired"` で renderer に返す current fact に揃えた
- `SessionResumePrompt` に `削除して新規開始` を追加し、`SessionIndicator` の pulse / session id display を改善した
- Phase 11 screenshot evidence を `outputs/phase-11/screenshots/` に保存し、`implementation-guide.md` validator PASS / `verify-unassigned-links.js` PASS を記録した
- `api-ipc-system-core.md` / `interfaces-agent-sdk-skill-reference.md` / LOGS / SKILL / topic-map / keywords を same-wave sync した

#### 検証証跡

- `pnpm --dir apps/desktop screenshot:task-p0-08-session-resume` PASS（6 screenshots captured）
- `pnpm --dir apps/desktop typecheck` PASS
- `pnpm --dir packages/shared exec tsc --noEmit` PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-08-session-resume-renderer-integration --json` PASS
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` PASS

#### Phase 12 未タスク

- 既存 `UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001` は open 維持
- 新規未タスク 0 件
- Phase 13 PR 作成はユーザーの明示承認後に実施

### タスク: TASK-P0-02 verify→improve→re-verify 閉ループ修復（2026-03-30）

| 項目 | 値 |
| --- | --- |
| タスクID | TASK-P0-02 |
| ステータス | **完了** |
| タイプ | implementation / runtime orchestration |
| 優先度 | 高 |
| 完了日 | 2026-03-30 |
| 対象 | `SkillCreatorWorkflowEngine` / `RuntimeSkillCreatorFacade` の閉ループ改善 |
| 成果物 | `docs/30-workflows/task-imp-verify-improve-revert-loop-002/` |

#### 実施内容

- `recordVerifyPass()` / `recordImproveAttempt()` / `getImproveAttemptCount()` を `SkillCreatorWorkflowEngine` に追加
- `verifyAndImproveLoop()` に `maxImproveRetry` と feedback memory を追加
- `failedChecks` のみを改善入力に使い、直前の改善要約を次回 feedback に合成
- Phase 12 の未タスク検出を current 0件へ更新し、UT-P0-02-001 を今回フェーズへ吸収
- `packages/shared/src/types/skillCreator.ts` と `packages/shared/src/types/index.ts` を同期

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/main/services/runtime/__tests__/formatVerifyChecksAsFeedback.test.ts`
- 70 tests PASS
- `pnpm --filter @repo/desktop typecheck` PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/task-imp-verify-improve-revert-loop-002 --json` PASS

### タスク: TASK-P0-05 execute-skill-file-writer-integration（2026-03-30）

| 項目       | 値                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-05                                                                               |
| ステータス | **完了**                                                                                 |
| タイプ     | implementation / runtime persist integration                                             |
| 優先度     | 高                                                                                       |
| 完了日     | 2026-03-30                                                                               |
| 対象       | `RuntimeSkillCreatorFacade.execute()` の LLM 応答解析 → `SkillFileWriter.persist()` 連携 |
| 成果物     | `docs/30-workflows/step-09-par-task-p0-05-execute-skill-file-writer-integration/`        |

#### 実施内容

- `parseLlmResponseToContent()` を追加し、`assistant` / `result` イベントから `SkillGeneratedContent` を抽出
- `agents/*.md` / `references/*.md` 見出しの `.md` を正規化し、Writer 側で `*.md.md` にならないよう是正
- `RuntimeSkillCreatorFacade.execute()` で `SkillFileWriter.persist()` を呼び、`persistResult` / `persistError` を IPC 戻り値へ追加
- `SkillCreatorWorkflowEngine` の `execute_result` artifact に `persistResult` / `persistError` を保持し、履歴・resume 系 snapshot へ反映
- Phase 11 evidence (`manual-test-result.md`, `discovered-issues.md`) と Phase 12 compliance root を補完し、same-wave sync 未完了分は `UT-P0-05-PHASE12-SAME-WAVE-SYNC-001` として formalize

#### 検証証跡

- `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/parseLlmResponseToContent.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.persist-integration.test.ts src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- 50 tests PASS（parser 16 / facade persist 13 / workflow engine 23 ではなく、current targeted suite 合計 50 として記録）

---

### タスク: TASK-LLM-MOD-05 step-04-seq-task-05-schema-extension（2026-03-30）

| 項目       | 値                                                                                  |
| ---------- | ----------------------------------------------------------------------------------- |
| タスクID   | TASK-LLM-MOD-05                                                                     |
| ステータス | **完了**                                                                            |
| タイプ     | implementation / schema-extension                                                   |
| 優先度     | 高                                                                                  |
| 完了日     | 2026-03-30                                                                          |
| 対象       | `provider-registry.ts` への `description` フィールド追加と `inferProviderId()` 強化 |
| 成果物     | `docs/30-workflows/step-04-seq-task-05-schema-extension/`                           |

#### 実施内容

- `ProviderModelEntry` に `description?: string` フィールドを追加し、全19モデル（OpenAI 6 / Anthropic 3 / Google 3 / xAI 3 / OpenRouter 4）に説明文を設定
- `LLMModelSchema` に `description` フィールドを Zod schema へ追加（optional）
- `inferProviderId()` 関数を整備: `specialMatcher` 優先評価 + `modelPrefixes` による推定（`o3` / `o4` prefix → openai）
- `handleGetProviders()` が `PROVIDER_CONFIGS` を走査する際に `description` を自動透過
- Phase 1-13 完全ワークフローを `docs/30-workflows/step-04-seq-task-05-schema-extension/` に整備（旧 `llm-provider-model-modernization/tasks/step-04-seq-task-05-schema-extension/` から移動）

#### 苦戦箇所

| 苦戦箇所                            | 再発条件                                                   | 解決策                                             |
| ----------------------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| ワークフロー配置の再編（パス移動）  | 親プロジェクト配下のタスクを独立ワークフローへ昇格する場合 | 旧パスを削除し新パス直下に Phase 1-13 全構成を整備 |
| `o3`/`o4` prefix の openai 推定漏れ | inferProviderId に新プレフィックスを追加する場合           | `modelPrefixes` 配列に `"o3"`, `"o4"` を明示追加   |

#### 検証証跡

- `provider.test.ts`: TS-001〜A-04 約20テスト PASS（description フィールドの Zod バリデーション・伝搬検証）
- `llm.test.ts`: description 透過・新モデル対応含む計 56+ テスト PASS
- Phase 12 成果物完備（implementation-guide.md / documentation-changelog.md / skill-feedback-report.md）
- 未タスク1件: `TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY`（Renderer UI への description 表示）

---

### タスク: TASK-RT-01 llm-adapter-error-propagation（2026-03-29）

| 項目       | 値                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| タスクID   | TASK-RT-01                                                                |
| ステータス | **完了**                                                                  |
| タイプ     | runtime bug-fix / error-propagation                                       |
| 優先度     | 高                                                                        |
| 完了日     | 2026-03-29                                                                |
| 対象       | `skill-creator:plan` の adapter 初期化失敗伝播                            |
| 成果物     | `docs/30-workflows/step-08-par-task-rt-01-llm-adapter-error-propagation/` |

#### 実施内容

- `RuntimeSkillCreatorFacade` に `llmAdapterStatus` / `llmAdapterFailureReason` surface を追加し、`plan()` の silent failure を error response へ置換
- `packages/shared/src/types/skillCreator.ts` に `LLMAdapterStatus` / `SkillCreatorErrorCode` / `RuntimeSkillCreatorPlanErrorResponse` を追加し、`RuntimeSkillCreatorPlanResponse` を union 拡張
- `ipc/index.ts` の fire-and-forget 初期化 catch で `setLLMAdapterFailed(reason)` を呼び、`failed` 状態を記録
- IPC 境界の outer/inner 契約（`IpcResult.success` と `data.success`）を `skillCreatorHandlers.runtime.test.ts` で検証

#### 2026-04-04 追補（IPC / UI close-out）

- `apps/desktop/src/renderer/components/skill/LLMAdapterErrorBanner.tsx` を追加し、`SkillLifecyclePanel` 上部に `role="alert"` の失敗バナーを表示するようにした
- `apps/desktop/src/renderer/components/skill/hooks/useLLMAdapterStatus.ts` を追加し、Main からの pull + push で `LLMAdapterStatusPayload` を同期するようにした
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` に banner を統合し、`onOpenWizard` から設定導線を再利用するようにした
- Phase 11 のスクリーンショット証跡を current build から再取得し、placeholder PNG を実画像へ差し替えた
- `api-ipc-agent-core.md` / `ui-ux-feature-components-core.md` / `implementation-guide.md` / `index.md` / `topic-map.md` / `keywords.json` を current facts に同期した
- Phase 13 はユーザー指示待ちのため blocked を維持し、PR は作成していない

#### 追補の検証証跡

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts src/preload/__tests__/skill-creator-api.runtime.test.ts src/preload/__tests__/skill-creator-api.test.ts`: PASS
- `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator.contract-parity.test.ts`: PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/task-rt-01-llm-adapter-error-propagation`: PASS
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/task-rt-01-llm-adapter-error-propagation --json`: PASS
- `outputs/phase-11/screenshots/TC-11-01.png` 〜 `TC-11-06.png`: current build で再取得済み

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
| 成果物     | `docs/30-workflows/ut-rt-01-execute-improve-adapter-guard-001/`                                      |

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

| 項目       | 値                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001                                                                 |
| ステータス | **完了**                                                                                                               |
| タイプ     | runtime bug-fix / error-propagation / documentation sync                                                               |
| 優先度     | 中                                                                                                                     |
| 完了日     | 2026-04-06                                                                                                             |
| 対象       | `RuntimeSkillCreatorFacade.executeAsync()` / `RuntimeSkillCreatorFacade.executeAsync.test.ts` / `outputs/phase-11/*` / `outputs/phase-12/*` |
| 成果物     | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/`                                           |

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

| 項目       | 値                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001                                                           |
| ステータス | **完了**                                                                                         |
| タイプ     | refactoring / ui                                                                                |
| 優先度     | 中                                                                                               |
| 完了日     | 2026-04-06                                                                                       |
| 対象       | `useAuthKeyManagement` 新規追加 / `AuthKeySection` への統合 / `ApiKeySettingsPanel` 委譲 / 型統一 |
| 成果物     | `docs/30-workflows/rt-04-authkey-component-dedup/`                                               |
| GitHub     | Issue #1903                                                                                      |

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

| 項目       | 値                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-P0-07                                                                                                                                       |
| ステータス | **完了**                                                                                                                                         |
| タイプ     | refactoring / docs sync                                                                                                                          |
| 優先度     | 高                                                                                                                                               |
| 完了日     | 2026-04-06                                                                                                                                       |
| 対象       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`, `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts`, `apps/desktop/src/main/services/runtime/planPromptConstants.ts`, `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`, `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan-resource-selection.test.ts`, `docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution/outputs/phase-12/*` |
| 関連タスク | step-11-par-task-plan-execution-hardening / step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution |

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

---

### タスク: UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 verify artifact append と workflow close-out を同期（2026-03-26）

| 項目       | 値                                                                              |
| ---------- | ------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                              |
| ステータス | **完了**                                                                        |
| タイプ     | bugfix                                                                          |
| 優先度     | 高                                                                              |
| 完了日     | 2026-03-26                                                                      |
| PR         | #1660                                                                           |
| 対象       | `execute_result` / `verify_result` の append 戦略統一 / workflow close-out 同期 |

#### 実施内容

- `appendArtifact()` を導入し、`execute_result` / `verify_result` を時系列で残す append 戦略へ統一
- verify artifact append と workflow close-out の同期

---

### タスク: UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Runtime workflow engine の失敗系 state lifecycle 是正（2026-03-26）

| 項目             | 値                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| タスクID         | UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001                                                          |
| ステータス       | **完了**                                                                                                      |
| タイプ           | implementation / bugfix                                                                                       |
| 優先度           | 高                                                                                                            |
| 完了日           | 2026-03-26                                                                                                    |
| 対象             | `RuntimeSkillCreatorFacade.execute()` / `SkillCreatorWorkflowEngine` / runtime tests / Phase 1-12 outputs     |
| 成果物           | `docs/30-workflows/completed-tasks/ut-imp-runtime-workflow-engine-failure-lifecycle-001/`                     |
| 元未タスク指示書 | `docs/30-workflows/completed-tasks/unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md` |
| GitHub Issue     | #1646                                                                                                         |

#### 実施内容

- `SkillCreatorWorkflowEngine.ts` に transition guard、append artifact、`ensureReviewReadyState()`、`verification_review` 保存を追加し、失敗経路も review owner に統一
- `RuntimeSkillCreatorFacade.ts` で executor reject を catch し、失敗 snapshot を保存して `execute` 停滞を解消
- `SkillCreatorWorkflowEngine.test.ts` と `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` に reject / `success:false` / invalid transition / review path テストを追加
- 親 workflow の `ownership-matrix.md` / `phase-6-test-expansion.md` / related outputs を current fact へ同期
- targeted vitest 35 件 PASS、workflow validators PASS、wider suite の `ManifestLoader.test.ts` alias blocker は既存 backlog 管轄として重複未タスク化しない運用を固定

#### Phase 12 未タスク

- 新規未タスク 0 件
- wider runtime suite の `@repo/shared/types` alias blocker は既存 `docs/30-workflows/unassigned-task/task-renderer-build-fix.md` などの module-resolution 系 tracker と重複するため新設しない

---

### タスク: UT-LLM-MOD-01-005 PROVIDER_CONFIGS/inferProviderId/LLMProviderIdSchema 三重管理解消（2026-03-25）

| 項目             | 値                                                                       |
| ---------------- | ------------------------------------------------------------------------ |
| タスクID         | UT-LLM-MOD-01-005                                                        |
| ステータス       | **完了（Phase 1-12 完了 / Phase 13 blocked）**                           |
| タイプ           | implementation / refactor                                                |
| 優先度           | 中                                                                       |
| 完了日           | 2026-03-25                                                               |
| 対象             | `provider-registry.ts` を正本にした provider / model 管理                |
| 成果物           | `docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/`                   |
| 元未タスク指示書 | `docs/30-workflows/completed-tasks/unassigned-task/UT-LLM-MOD-01-005.md` |
| GitHub Issue     | #1524                                                                    |

#### 実施内容

- `packages/shared/src/types/llm/schemas/provider-registry.ts` を新設し、`PROVIDER_CONFIGS` / `PROVIDER_IDS` / `inferProviderId()` を正本化
- `packages/shared/src/types/llm/schemas/provider.ts` の `LLMProviderIdSchema` を `z.enum(PROVIDER_IDS)` へ置換
- `packages/shared/src/types/llm/schemas/index.ts` から provider registry 関連 export を公開
- `apps/desktop/src/main/handlers/llm.ts` のローカル `PROVIDER_CONFIGS` / `inferProviderId` を削除し shared 正本へ統一
- `provider-registry.test.ts` を追加し、SSoT 導出・OpenRouter 優先判定・競合 prefix を固定化
- `api-ipc-system-core.md` に provider ID 正本と `openrouter` 対応を反映

#### Phase 12 未タスク

| 未タスクID                                    | 概要                                                                                   | 優先度 | タスク仕様書                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| task-llm-adapter-factory-provider-ids-ssot    | `LLMAdapterFactory` の `SUPPORTED_PROVIDER_IDS` を `provider-registry.ts` 由来に寄せる | 中     | `docs/30-workflows/unassigned-task/task-llm-adapter-factory-provider-ids-ssot.md`    |
| task-llm-handle-get-providers-readonly-models | `handleGetProviders()` の readonly models bridge を解消する                            | 低     | `docs/30-workflows/unassigned-task/task-llm-handle-get-providers-readonly-models.md` |

---

### タスク: UT-SC-02-005 Preload skill-creator-api.ts の execute 戻り値型更新（2026-03-25）

| 項目       | 値                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-SC-02-005                                                                                                          |
| ステータス | **完了**（2026-03-25）                                                                                                |
| タイプ     | バグ修正                                                                                                              |
| 優先度     | 中                                                                                                                    |
| 完了日     | 2026-03-25                                                                                                            |
| 対象       | `apps/desktop/src/preload/skill-creator-api.ts`, `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` |
| 親タスク   | UT-SC-02-002                                                                                                          |

#### 実施内容

- `skill-creator-api.ts` の `executePlan` 戻り値型を旧型 `RuntimeSkillCreatorExecuteResult` から `RuntimeSkillCreatorExecuteResponse` に統一
- `SkillLifecyclePanel.tsx` に `terminal_handoff` 型ナロイング追加（P44/P45 パターン対応）
- Preload runtime テスト・Renderer テストを更新し全 PASS を確認

---

### タスク: TASK-SDK-01 manifest-contract-foundation（2026-03-26）

| 項目       | 値                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-01                                                                                     |
| ステータス | **完了**                                                                                        |
| タイプ     | implementation / contract-foundation                                                            |
| 優先度     | 高                                                                                              |
| 完了日     | 2026-03-26                                                                                      |
| 対象       | `packages/shared` workflow manifest contract、desktop main `ManifestLoader`、Phase 1-12 outputs |
| 成果物     | `docs/30-workflows/step-01-seq-task-01-manifest-contract-foundation/`                           |

#### 実施内容

- `packages/shared/src/types/skillCreator.ts` に `WORKFLOW_MANIFEST_SCHEMA_VERSION` と `WorkflowManifest*` 型群を追加
- `apps/desktop/src/main/services/runtime/ManifestLoader.ts` を追加し、責務を `read -> validate -> normalize -> cache` に固定
- fixture と unit test を追加し、unknown field / schema mismatch / hook drift / phase order / missing resource / cache drift を監査
- `LoadedWorkflowManifest.manifestContentHash`、`resource.phaseIds` / `phase.resourceIds` 相互参照検証、same-`mtime` cache hardening を follow-up 同一波で実装した
- Phase 1-12 成果物、`artifacts.json`、`outputs/artifacts.json` を completed へ同期
- system spec の manifest foundation アンカーは既存正本に反映済みであることを再確認し、Phase 12 では completed ledger / lessons / skill update を中心に close-out した

#### Phase 12 未タスク

- ~~`task-imp-task-sdk-01-phase12-compliance-sync-001`（Issue #1643）~~ **完了: 2026-03-26** `docs/30-workflows/completed-tasks/task-sdk-01-phase12-compliance-sync/`
- ~~`task-imp-manifest-loader-contract-hardening-001`（Issue #1644）~~ **完了: 2026-03-26** `UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001` の runtime contract sync で吸収
- 環境 blocker: Vitest は `esbuild` version mismatch で未実行。既存の native binary / worktree guard 系 tracker を再利用し、重複未タスクは新設しない

---

### タスク: TASK-SDK-02 workflow-engine-runtime-orchestration（2026-03-26）

| 項目       | 値                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-02                                                                                                               |
| ステータス | **完了**                                                                                                                  |
| タイプ     | implementation / runtime-orchestration                                                                                    |
| 優先度     | 高                                                                                                                        |
| 完了日     | 2026-03-26                                                                                                                |
| 対象       | `RuntimeSkillCreatorFacade` / `SkillCreatorWorkflowEngine` / `ResourceLoader` / runtime/shared tests / Phase 1-12 outputs |
| 成果物     | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/`                                            |

#### 実施内容

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` を新設し、`currentPhase` / `awaitingUserInput` / `verifyResult` / phase artifacts / `resumeTokenEnvelope` の owner を engine に集約
- `RuntimeSkillCreatorFacade.plan()` が review state を engine へ記録し、`execute()` は `terminal_handoff` 時に executor を呼ばず early return、`integrated_api` 時に verify phase へ遷移する current fact を固定
- `ResourceLoader.getBasePath()` を追加し、source provenance を `resumeTokenEnvelope.sourceProvenance` として保持可能にした
- runtime/shared/IPC/preload テスト 47 件を PASS 化し、workflow 側では Phase 5〜10 summary と Phase 12 close-out evidence を補完した
- system spec は `architecture-overview-core.md` / `arch-electron-services-details-part2.md` / `api-ipc-system-core.md` / lessons / index を same-wave で更新し、mirror parity まで確認した

#### Phase 12 未タスク

- 新規未タスク 0 件
- 環境 blocker は既存 `docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md` の管轄と重複するため、新設しない

---

### タスク: TASK-SDK-03 context-budget-and-resource-selection（2026-03-27）

| 項目       | 値                                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-03                                                                                                                                                                  |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                                                                                                               |
| タイプ     | implementation / internal-contract-hardening                                                                                                                                 |
| 優先度     | 高                                                                                                                                                                           |
| 完了日     | 2026-03-27                                                                                                                                                                   |
| 対象       | `RuntimeSkillCreatorFacade` plan/improve resource loading、`SkillCreatorSourceResolver`、`PhaseResourcePlanner`、`ResolvedResourceReader`、runtime tests、Phase 1-12 outputs |
| 成果物     | `docs/30-workflows/step-03-par-task-03-context-budget-and-resource-selection/`                                                                                               |

#### 実施内容

- `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts` を追加し、`getSkillCreatorRootCandidates()` を利用した `explicit -> env -> home -> repo` の root discovery と `structure_mismatch` 検出を実装した
- `apps/desktop/src/main/services/runtime/PhaseResourcePlanner.ts` を追加し、resource kind / tier / budget / degrade reason を `RuntimeSkillCreatorFacade` から分離した
- `apps/desktop/src/main/services/runtime/ResolvedResourceReader.ts` を追加し、absolute path 読込を優先しつつ legacy `ResourceLoader` fallback を compatibility layer に限定した
- `RuntimeSkillCreatorFacade.plan()` / `improve()` を dynamic pipeline 対応に更新し、`SkillCreatorWorkflowSourceProvenance` へ `candidateRoots` / `selectedRoots` / `selectedResourceIds` / `droppedResourceIds` / `structureSignature` / `degradeReasons` を保持する current fact に揃えた
- `apps/desktop/src/main/ipc/index.ts` の DI 配線を拡張し、resolver / planner / reader を runtime facade へ注入した

#### Phase 12 未タスク

- 新規未タスク 0 件
- trust scoring / disclosure は Task07、resume compatibility / invalidation は Task08 の owner を維持するため、Task03 から独立 follow-up は新設しない

---

### タスク: TASK-SDK-05 create-entry-mainline-unification（2026-03-27）

| 項目       | 値                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-05                                                                                                            |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked / `spec_created` close-out sync 済み）**                                    |
| タイプ     | docs-only / create-mainline-boundary                                                                                   |
| 優先度     | 高                                                                                                                     |
| 完了日     | 2026-03-27                                                                                                             |
| 対象       | Skill Creator create 一次導線、advanced route 境界、warning summary と diagnostics の分離、Phase 12 close-out evidence |
| 成果物     | `docs/30-workflows/step-04-par-task-05-create-entry-mainline-unification/`                                             |

#### 実施内容

- `Skill Center -> skillCreate` を一次導線、`SkillCreateWizard` を destination surface、`SkillLifecyclePanel` / `SkillManagementPanel` を advanced / secondary route として task spec 上で固定
- source provenance / structure mismatch / source conflict の表示を mainline summary と diagnostics に分離し、Task03 / Task04 / Task06 / Task07 との owner boundary を明示
- Phase 12 の `system-spec-update-summary.md` / `documentation-changelog.md` / `phase12-task-spec-compliance-check.md` を、Step 1 same-wave sync + Step 2 no-op 根拠の実績ベースへ更新
- `references/task-workflow-completed.md` / `indexes/quick-reference.md` / `indexes/resource-map.md` / `lessons-learned-phase12-workflow-lifecycle.md` / LOGS / SKILL history を same-wave で同期
- validator 実行コマンドを actual invocation に揃え、workflow root path drift を 0 件化した

#### Phase 12 未タスク

- 新規未タスク 0 件
- create mainline wording finalization は Task05 実装 wave の Phase 8 / 9 で扱う既存責務とし、今回 close-out では新設しない

---

### タスク: UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 runtime workflow failure verify artifact append 是正（2026-03-26）

| 項目       | 値                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                                              |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                                  |
| タイプ     | implementation-closure / runtime-workflow-follow-up                                             |
| 優先度     | 高                                                                                              |
| 完了日     | 2026-03-26                                                                                      |
| 対象       | `SkillCreatorWorkflowEngine` verify artifact strategy / runtime tests / workflow pack close-out |
| 成果物     | `docs/30-workflows/completed-tasks/ut-imp-runtime-workflow-verify-artifact-append-001/`         |

#### 実施内容

- `SkillCreatorWorkflowEngine.recordExecuteResult()` / `recordVerifyFailure()` の `verify_result` 戦略を upsert から append へ変更し、pending/fail を履歴正本へ残す current fact を固定
- `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` と `SkillCreatorWorkflowEngine.test.ts` に failure append / repeated failure 回帰ケースを追加し、`execute_result=2件` / `verify_result=4件` の履歴増分を検証
- workflow pack 側では stale method 名（`recordExecutionFailure()`）を current code に合わせて是正し、Phase 12 の 6成果物と completed metadata を current facts へ更新
- source unassigned task `docs/30-workflows/unassigned-task/task-ut-imp-runtime-workflow-verify-artifact-append-001.md` を completed 状態へ更新し、workflow root への導線を固定

#### Phase 12 未タスク

- 新規未タスク 0 件
- 今回差分は runtime workflow follow-up の局所是正で閉じたため、既存 backlog と重複する未タスクは新設しない

---

### タスク: UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 task-sdk-01-phase12-compliance-sync（2026-03-26）

| 項目             | 値                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| タスクID         | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001                                                          |
| ステータス       | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                                          |
| タイプ           | docs-improvement / phase12-close-out                                                                    |
| 優先度           | 高                                                                                                      |
| 完了日           | 2026-03-26                                                                                              |
| 対象             | `TASK-SDK-01` の Phase 12 監査証跡、台帳同期、parent `index.md` status parity                           |
| 成果物           | `docs/30-workflows/completed-tasks/task-sdk-01-phase12-compliance-sync/`                                |
| 元未タスク指示書 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-01-phase12-compliance-sync-001.md` |
| GitHub Issue     | #1643                                                                                                   |

#### 実施内容

- parent workflow の `outputs/phase-12/*.md` を current facts ベースへ再構成し、`implementation-guide.md` を validator 10/10 へ是正
- `phase-11-manual-test.md` と `outputs/phase-11/*` に docs-only task 用の validator compatibility placeholder 運用を追加
- `generate-index.js` を `artifacts.json` の phases 配列 / オブジェクト両対応へ修正し、parent `index.md` の Phase 12/13 status drift を再発防止した
- `packages/shared` / `apps/desktop` に manifest contract hardening を実装し、`manifestContentHash` / 相互参照検証 / same-`mtime` cache guard を current follow-up へ吸収した
- `task-workflow-backlog.md`、`task-workflow-completed.md`、`lessons-learned-phase12-workflow-lifecycle.md` を same-wave で同期した
- `verify-all-specs.js`、`validate-phase-output.js`、`validate-phase12-implementation-guide.js`、`audit-unassigned-tasks --target-file` を再実行し、current evidence を固定した

#### Phase 12 未タスク

- 追加の機能未タスクは 0 件
- 環境 blocker として `Vitest + esbuild` mismatch のみ継続管理し、既存 tracker を再利用する

---

### タスク: UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 runtime workflow engine failure lifecycle（2026-03-26）

| 項目       | 値                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001                                                                             |
| ステータス | **完了**                                                                                                                         |
| タイプ     | implementation / failure-lifecycle-fix                                                                                           |
| 優先度     | 高                                                                                                                               |
| 完了日     | 2026-03-26                                                                                                                       |
| 対象       | `RuntimeSkillCreatorFacade` / `SkillCreatorWorkflowEngine` failure path、runtime tests、parent workflow docs、Phase 1-12 outputs |
| 成果物     | `docs/30-workflows/ut-imp-runtime-workflow-engine-failure-lifecycle-001/`                                                        |
| 親タスク   | TASK-SDK-02                                                                                                                      |

#### 実施内容

- `SkillCreatorWorkflowEngine.ts` に `execution_error` / `execution_failed` / `verification_review` を区別する failure reason と invalid transition guard を追加
- failure artifact を upsert ではなく append に変更し、latest accessor を通じて snapshot 系の読み出しを安定化
- `recordVerifyFailure(..., "review")` で `awaitingUserInput.reason = "verification_review"` と prompt を保存する契約へ是正
- `RuntimeSkillCreatorFacade.execute()` で executor reject を `execution_error` として保存し、`success:false` は verify pending へ進めず `execution_failed` snapshot として保存
- `SkillCreatorWorkflowEngine.test.ts` / `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` に reject / `success:false` / repeated failure append / invalid transition / verification review の回帰を追加
- parent workflow の `ownership-matrix.md` / `phase-6-test-expansion.md` と current workflow の Phase 12 成果物を実装実績へ同期

#### Phase 12 未タスク

- 新規未タスク 0 件
- `ESBUILD_BINARY_PATH=... pnpm vitest ... --run` で targeted verification を実施済み。native binary / worktree blocker は既存 `docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md` と重複するため新設しない

---

### タスク: TASK-SDK-08 session-persistence-and-resume-contract（2026-03-26）

| 項目       | 値                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-08                                                                                                   |
| ステータス | **設計完了**                                                                                                  |
| タイプ     | design / session-persistence                                                                                  |
| 優先度     | 高                                                                                                            |
| 完了日     | 2026-03-26                                                                                                    |
| 対象       | workflow checkpoint / compatibility evaluator / revision lease / Phase 1-13 docs pack                         |
| 成果物     | `docs/30-workflows/skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/` |

#### 実施内容

- `SkillCreatorWorkflowEngine` の state を persisted checkpoint の正本入力として固定し、`resumeTokenEnvelope` と persisted payload の責務分離を定義
- compatibility evaluator が `routeSnapshot` / `sourceProvenance` / manifest hash / revision / lease を見て `compatible` / `compatible_with_warning` / `incompatible` / `conflict` を返す設計を追加
- checkpoint は phase boundary 単位に限定し、mid-stream resume / rewind / fork を初回 scope から除外
- public resume surface を追加する場合は `skill-creator:*` namespace を使い、`agent:resumeSession` を流用しない方針を確定

#### Phase 12 未タスク

- 新規未タスク 0 件
- shared types / session storage / preload-main wiring の本実装は後続 wave へ引き継ぐ

---

### タスク: TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 session-dock-artifact-bridge（2026-03-24）

| 項目       | 値                                                                                    |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001                                             |
| ステータス | **設計完了**                                                                          |
| タイプ     | design                                                                                |
| 優先度     | 高                                                                                    |
| 完了日     | 2026-03-24                                                                            |
| 対象       | session dock、transcript、artifact-first result、manual share                         |
| 成果物     | `docs/30-workflows/completed-tasks/step-02-seq-task-02-session-dock-artifact-bridge/` |

#### 実施内容

- DockState 8状態（collapsed/ready/handoff/running/done/aborted/unavailable/guidance-only）定義
- SessionDockState / session ID / reopen restore 方針設計
- transcript share: 手動3操作 + provenance chip 前提設計
- artifact-first result 表示順定義
- error summary の done/aborted state 表示設計

#### Phase 12 未タスク

| 未タスクID                                        | 概要                                                              | 優先度 | タスク仕様書                                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| UT-IMP-SESSION-DOCK-TESTID-DEDUP-001              | HandoffBlock / PersistentTerminalLauncher の data-testid 衝突解消 | 低     | `docs/30-workflows/unassigned-task/UT-IMP-SESSION-DOCK-TESTID-DEDUP-001.md`              |
| UT-IMP-SESSION-DOCK-CREDENTIAL-PATTERN-EXTEND-001 | CREDENTIAL_PATTERNS に AWS/GCP/Azure キー形式追加                 | 中     | `docs/30-workflows/unassigned-task/UT-IMP-SESSION-DOCK-CREDENTIAL-PATTERN-EXTEND-001.md` |
| UT-IMP-SESSION-DOCK-SHARE-RAIL-LAYOUT-001         | transcript 展開時の Share Rail 表示位置調整                       | 低     | `docs/30-workflows/unassigned-task/UT-IMP-SESSION-DOCK-SHARE-RAIL-LAYOUT-001.md`         |

---

### タスク: TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 guided-execution-shell-foundation（2026-03-24）

| 項目       | 値                                                                         |
| ---------- | -------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001                             |
| ステータス | **完了**                                                                   |
| タイプ     | design                                                                     |
| 優先度     | 高                                                                         |
| 完了日     | 2026-03-24                                                                 |
| 対象       | 実行コンソールの名称、route、shared launcher、mainline entry               |
| 成果物     | `docs/30-workflows/step-01-seq-task-01-guided-execution-shell-foundation/` |

#### 実施内容

- ViewType に `executionConsole` を追加し、route / view 分岐を整備
- `openExecutionConsole()` shared action を定義し、CTA 7箇所を統一
- agent 代替経路を除去し、実行コンソールへの導線を一本化
- 2件の既存未タスクを解決（ut-viewtype-terminal-addition、UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001）
- 2件の新規未タスクを検出（UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001、UT-RENAME-RUNTIME-ACCESS-TERMINAL-HELPERS-001）

#### Phase 12 未タスク

| 未タスクID                                     | 概要                                            | 優先度 | タスク仕様書                                                                          |
| ---------------------------------------------- | ----------------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001 | navContract.ts に executionConsole エントリ追加 | 高     | `docs/30-workflows/unassigned-task/ut-imp-navcontract-execution-console-entry-001.md` |
| UT-RENAME-RUNTIME-ACCESS-TERMINAL-HELPERS-001  | runtimeAccess.ts の terminal 系ヘルパー名称変更 | 低     | `docs/30-workflows/unassigned-task/ut-rename-runtime-access-terminal-helpers-001.md`  |

#### 解決した既存未タスク

| 未タスクID                                       | 概要                                          | 解決方法                             |
| ------------------------------------------------ | --------------------------------------------- | ------------------------------------ |
| ut-viewtype-terminal-addition                    | ViewType に "terminal" を追加                 | executionConsole ViewType 追加で解決 |
| UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001 | Chat/Workspace guidance の open terminal 導線 | CTA wiring 統一で解決                |

---

### タスク: UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001 navContract executionConsole エントリ追加（2026-03-24）

| 項目         | 値                                                                                      |
| ------------ | --------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001                                          |
| ステータス   | **完了**                                                                                |
| タイプ       | implementation                                                                          |
| 優先度       | 高                                                                                      |
| 完了日       | 2026-03-24                                                                              |
| 対象         | navContract.ts の DockViewType / NAV_SECTIONS / NAV_SHORTCUT_TO_VIEW + Icon play-circle |
| 成果物       | `docs/30-workflows/ut-imp-navcontract-execution-console-entry-001/`                     |
| 親タスク     | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001                                          |
| GitHub Issue | #1553 (CLOSED)                                                                          |

#### 実施内容

- DockViewType に `"executionConsole"` を追加（Extract パターン）
- NAV_SECTIONS sub セクションに executionConsole エントリ追加（icon: play-circle, shortcut: Cmd+9）
- NAV_SHORTCUT_TO_VIEW に `"9": "executionConsole"` マッピング追加
- Icon コンポーネントに PlayCircle (lucide-react) / "play-circle" (IconName / iconMap) 追加
- テスト期待値更新: navContract.test.ts, types.test.ts, Icon.test.tsx（59 tests PASS）
- 未タスク: 0件

---

### タスク: TASK-SC-04-OUTPUT-PERSISTENCE SkillFileWriter LLM生成スキルコンテンツ永続化（2026-03-23）

| 項目       | 値                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| タスクID   | TASK-SC-04-OUTPUT-PERSISTENCE                                                 |
| 完了日     | 2026-03-23                                                                    |
| ステータス | **完了**                                                                      |
| 優先度     | 高                                                                            |
| 対象       | SkillFileWriter / SkillGeneratedContent / RuntimeSkillCreatorFacade.execute() |
| 成果物     | `docs/30-workflows/w3a-sc-output-persistence/`                                |

#### 実施内容

- SkillFileWriter クラス新規作成（LLM 生成スキルコンテンツの `.claude/skills/{skillName}/` への永続化）
- SkillGeneratedContent 型を `packages/shared/src/types/skillCreator.ts` に追加
- RuntimeSkillCreatorFacade.execute() に永続化フロー統合（extractGeneratedContent + persist）
- 6層パストラバーサル防止 + P42 準拠3段バリデーション
- アトミック書き込み + ロールバック（部分書き込み防止）
- 26テスト全 PASS

#### 未タスク

| 未タスクID   | 概要                                                | 優先度 | タスク仕様書                                        |
| ------------ | --------------------------------------------------- | ------ | --------------------------------------------------- |
| UT-SC-04-001 | SkillFileWriter インターフェース抽出（P61 DIP準拠） | 低     | `docs/30-workflows/unassigned-task/UT-SC-04-001.md` |

---

### タスク: UT-EXECUTION-ENV-TERMINAL-001 ExecutionEnvironment Terminal 本実装 + assertNoSilentFallback（2026-03-23）

### タスク: TASK-SC-01-IPC-WIRING-FIX P65 dead-end namespace 検証・allowlistガードレール追加（2026-03-23）

### タスク: TASK-SC-03-PLAN-LLM-PROMPT RuntimeSkillCreatorFacade.plan() LLM プロンプト統合（2026-03-23）

### タスク: UT-SC-03-003 RuntimeSkillCreatorFacade DI 配線（2026-03-24）

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| タスクID   | UT-SC-03-003                                                   |
| 親タスク   | TASK-SC-03-PLAN-LLM-PROMPT                                     |
| ステータス | **完了**                                                       |
| 完了日     | 2026-03-24                                                     |
| 対象       | RuntimeSkillCreatorFacade setLLMAdapter / ipc/index.ts DI 配線 |
| 成果物     | `docs/30-workflows/completed-tasks/ut-sc-03-003-di-wiring/`    |

#### 実施内容

- `RuntimeSkillCreatorFacade.ts`: `llmAdapter` readonly 解除 + `setLLMAdapter(adapter: ILLMAdapter): void` Setter Injection 追加（P34 準拠）
- `ipc/index.ts`: ResourceLoader コンストラクタ注入（`DEFAULT_SKILL_CREATOR_PATH`）+ LLMAdapterFactory.getAdapter("anthropic") fire-and-forget async 遅延注入
- graceful degradation: LLMAdapter 未注入時はスタブ応答
- TC-1〜TC-9 計11テスト全 PASS

#### 未タスク

| 未タスクID       | 概要                                 | 優先度 | タスク仕様書                                                                                 |
| ---------------- | ------------------------------------ | ------ | -------------------------------------------------------------------------------------------- |
| UT-SC-03-003-M01 | subscriptionAuthProvider DI 配線追加 | 低     | `docs/30-workflows/unassigned-task/UT-SC-03-003-M01-subscription-auth-provider-injection.md` |
| UT-SC-03-003-M02 | テスト内 undefined キャスト除去      | 低     | `docs/30-workflows/unassigned-task/UT-SC-03-003-M02-test-type-cast-cleanup.md`               |

---

### タスク: UT-CONV-DB-001 better-sqlite3 75件テスト SKIP 修正（2026-03-23）

| 項目       | 値                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| タスクID   | UT-CONV-DB-001                                                            |
| ステータス | **実装完了**                                                              |
| タイプ     | bugfix / test-infrastructure                                              |
| 優先度     | 高                                                                        |
| 完了日     | 2026-03-23                                                                |
| 対象       | better-sqlite3 ネイティブバイナリ / conversationRepository.test.ts        |
| 成果物     | `docs/30-workflows/completed-tasks/conv-db-001-repository-test-skip-fix/` |

#### 実施内容

- better-sqlite3 ネイティブバイナリの CPU アーキテクチャ不一致（arm64 vs x86_64、P66）を pnpm rebuild で解決
- `apps/desktop/package.json` に `rebuild:native` スクリプトを追加（永続的修正）
- conversationRepository.test.ts 75件テストを全 PASS に復帰（4.28s）
- conversation 関連テスト 160件全 PASS（回帰なし）
- P66 を 06-known-pitfalls.md に追記
- UT-CONV-DB-004（ネイティブモジュール環境自動整備）を未タスクとして作成

#### 発見元

- 親タスク: TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001
- 関連 Pitfall: P7, P66

### タスク: TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 Slide Modifier Manual Fallback Alignment 設計（2026-03-23）

| 項目       | 値                                                                                |
| ---------- | --------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001                             |
| ステータス | **仕様書作成完了（`spec_created` / 設計タスク / Phase 13 blocked）**              |
| タイプ     | design                                                                            |
| 優先度     | 高                                                                                |
| 完了日     | 2026-03-23                                                                        |
| 対象       | Slide Modifier / SlideUIStatus 状態機械 / Manual Fallback 整合設計                |
| 成果物     | `docs/30-workflows/step-05-par-task-08-slide-modifier-manual-fallback-alignment/` |

#### 実施内容

- SlideUIStatus（synced / running / degraded / guidance）と SlideLane（integrated / manual）の型定義を確定
- SlideCapabilityDTO（laneType / modifier / agentClient / fallbackReason / guidance）の契約設計
- 禁止遷移4件（integrated→manual 自動格下げ / guidance 中 modifier 呼出 / degraded 中 agentClient 呼出 / synced 時 fallbackReason 設定）の仕様明文化
- Manual Fallback 境界ルール（MB-1〜MB-4）と slide:sync:\* IPC チャネル設計
- Phase 3 設計レビュー PASS / Phase 10 最終レビュー PASS
- 未タスク 5 件（UT-SLIDE-IMPL-001 / UT-SLIDE-UI-001 / UT-SLIDE-P31-001 / UT-SLIDE-HANDOFF-DUP-001 / UT-SLIDE-TASK09-IPC-NAMESPACE-001）を検出・backlog 登録

#### 発見元

- ai-runtime-execution-responsibility-realignment pack step-05-par-task-08（2026-03-23）

---

### タスク: TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 Terminal Handoff Surface Realization 設計（2026-03-22）

| 項目       | 値                                                                            |
| ---------- | ----------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001                             |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                |
| タイプ     | design                                                                        |
| 優先度     | 高                                                                            |
| 完了日     | 2026-03-22                                                                    |
| 対象       | Claude Code terminal surface / shared handoff UI 共通設計                     |
| 成果物     | `docs/30-workflows/step-03-par-task-05-terminal-handoff-surface-realization/` |

#### 実施内容

- Concern 3 分割設計（Launcher / Handoff Card / Consumer Adapter）を確定
- 統一 DTO `HandoffGuidance`（terminalCommand / contextSummary / reason）を定義
- Manual Boundary（MB-1〜MB-4: auto-send / hidden injection / headless execution / credential passthrough 禁止）を確定
- Consumer → DTO マッピング（5 consumer × 3 surfaceType）と `toHandoffGuidance()` adapter 仕様を設計
- Phase 3 設計レビュー PASS / Phase 10 最終レビュー PASS
- 未タスク 8 件（MINOR 3 件 + GAP 5 件）を検出・指示書化

#### 発見元

- ai-runtime-execution-responsibility-realignment pack Task 05（2026-03-19）

---

### タスク: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 Transcript -> Chat Provenance Linkage 設計（2026-03-22）

| 項目       | 値                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001                                             |
| ステータス | **仕様書作成完了（`spec_created` / workflow root `implementation_ready` / Phase 13 blocked）** |
| タイプ     | design                                                                                         |
| 優先度     | 高                                                                                             |
| 完了日     | 2026-03-22                                                                                     |
| 対象       | Transcript -> Chat 手動3操作連携 / Provenance Chip / Metadata Contract                         |
| 成果物     | `docs/30-workflows/step-04-seq-task-06-transcript-to-chat-provenance-linkage/`                 |

#### 実施内容

- TranscriptProvenance 型定義（sourceType / sharedAt / sessionTitle / messageRange / originalContent）
- 3操作フロー: OP-1（選択範囲をチャットへ送る）/ OP-2（直近出力を添付）/ OP-3（セッションを貼り付ける）
- Provenance Chip の表示条件・dismiss 動作・履歴復元ロジック
- Terminal Handoff (Task 05) との責務分離・CTA 表示領域の非競合保証
- Phase 3 設計レビュー PASS / Phase 10 最終レビュー PASS
- 未タスク 2 件（M-1: SelectedFile source / M-2: TranscriptSession 型）を検出・指示書化

#### 発見元

- ai-runtime-execution-responsibility-realignment pack Task 06（2026-03-19）

---

### タスク: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001 Settings shell access matrix mainline design（2026-03-22）

| 項目       | 値                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001                                            |
| ステータス | **完了（Phase 1-13 設計タスク完了 / Phase 13 blocked: user approval 待ち）**                  |
| タイプ     | design                                                                                        |
| 優先度     | 高                                                                                            |
| 完了日     | 2026-03-22                                                                                    |
| 対象       | Settings Access Matrix Section / AppLayout Persistent Launcher / Public Shell Access Contract |
| 成果物     | `docs/30-workflows/step-03-par-task-03-settings-shell-access-matrix-mainline/outputs/`        |

#### 実施内容

- Settings 画面に access matrix セクション（CapabilityCard / HealthStatusRow / ProviderSummaryCard）の IA 定義
- AppLayout header に persistent TerminalLauncher の配置設計
- 未認証時 guidance-only モード（PUBLIC_UNAUTHENTICATED_VIEWS 不変）の設計
- AccessCapability x UiState 全5組合せの契約マトリクス定義
- テストマトリクス（TC-C01〜C06 / TC-H01〜H04 / TC-P01〜P03 / TC-L01〜L03 / SC-01〜SC-06 / RG-01〜RG-06）
- Phase 10 最終レビュー PASS、AC-1〜AC-4 全 PASS、未タスク 0 件

#### 発見元

- ai-runtime-execution-responsibility-realignment 親パックの step-03-par-task-03

---

### タスク: TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 RuntimePolicyResolver capability bridge（2026-03-21）

| 項目       | 値                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001                                                          |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                                                         |
| タイプ     | implementation                                                                                         |
| 優先度     | 中                                                                                                     |
| 完了日     | 2026-03-21                                                                                             |
| 対象       | RuntimePolicyResolver / RuntimeSkillCreatorFacade / creatorHandlers の direct caller capability bridge |
| 成果物     | `docs/30-workflows/completed-tasks/runtime-policy-resolver-4state/`                                    |

#### 実施内容

- `RuntimeSkillCreatorFacade.execute()` が `decision.capability` を実消費し、`terminalSurface` で handoff bundle を返し `SkillExecutor` を呼ばないよう是正した
- `creatorHandlers.ts` に `ExecutionCapabilityInput` 正規化を導入し、`creatorHandlers.test.ts` で IPC boundary の raw args 変換と terminal handoff 透過を検証した
- workflow / system spec / skills / lessons を same-wave sync し、manual evidence の `not_run` 矛盾と artifact parity drift を解消した
- Phase 13 は user approval 未取得のため blocked とした

#### 発見元

- TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 direct caller lane 分解（2026-03-21）

#### 検証証跡

| コマンド                                                                                                                                                                                                    | 結果                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                                                                                     | PASS（378ファイル分類、`indexes/topic-map.md` / `indexes/keywords.json` 再生成） |
| `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/runtime-policy-resolver-4state --regenerate`                                                         | PASS（13/13 phase files）                                                        |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/runtime-policy-resolver-4state`                                                                          | PASS（31項目, 0エラー, 0警告）                                                   |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/runtime-policy-resolver-4state --strict`                                                           | PASS（13/13, errors 0, warnings 0）                                              |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/runtime-policy-resolver-4state`                                               | PASS（10/10）                                                                    |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/completed-tasks/runtime-policy-resolver-4state/outputs/phase-12/unassigned-task-detection.md` | PASS（2/2, missing 0）                                                           |
| `pnpm --filter @repo/shared typecheck`                                                                                                                                                                      | PASS                                                                             |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                     | PASS                                                                             |
| `diff -qr .claude/skills/ .agents/skills/`                                                                                                                                                                  | PASS（差分なし）                                                                 |

#### Phase 12 未タスク

| 未タスクID                                                   | 概要                                                                                                     | 優先度 | タスク仕様書                                                                                                      |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001`                | internal `creatorHandlers.ts` capability bridge と public `skill-creator:*` IPC / preload surface の統合 | 高     | `docs/30-workflows/unassigned-task/UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001.md`                                |
| `UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001` | `RuntimePolicyResolver.resolveFromServices()` への subscription 判定 service 統合                        | 中     | `docs/30-workflows/completed-tasks/unassigned-task/UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001.md` |

#### 苦戦箇所

| 苦戦箇所                                                         | 再発条件                                                   | 対処                                                          |
| ---------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| `manual-test-result.md` が `not_run` のまま completed を宣言する | non-visual task の manual evidence を後回しにする          | `NON_VISUAL_FALLBACK`、blocker、代替 evidence を同時記録した  |
| internal adapter と public preload 契約を同じ「IPC更新」とみなす | `ipcMain.handle()` 追加だけで system spec を更新済みと書く | internal/public の到達面を分離し、follow-up へ formalize した |
| `index.md` / `phase-*.md` / `artifacts*` を別ターンで更新する    | workflow 本文だけ completed にする                         | 4点同期を Phase 12 完了条件として固定した                     |

#### 同種課題の簡潔解決手順

1. `manual-test-result.md` が `not_run` でないことを確認し、fallback 時は blocker と evidence を残す。
2. internal adapter と public preload / registration の到達面を分離して記録する。
3. workflow 本文、phase 本文、`artifacts.json`、`outputs/artifacts.json` を同一ターンで同期する。

### タスク: TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 runtime-policy-centralization（2026-03-21）

| 項目       | 値                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001                                                     |
| ステータス | **仕様書作成完了（`spec_created` / workflow root `implementation_ready` / Phase 13 blocked）** |
| タイプ     | design                                                                                         |
| 優先度     | 高                                                                                             |
| 完了日     | 2026-03-21                                                                                     |
| 対象       | surface 横断 runtime policy / health route / handoff contract centralization                   |
| 成果物     | `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/`         |

#### 実施内容

- RuntimePolicy / Health DTO / HandoffGuidance の consumption contract を Phase 1〜12 で確定した
- `index.md` / `artifacts.json` / `outputs/artifacts.json` / `phase-1..13` の status を整合化し、workflow root を `implementation_ready` に正規化した
- `outputs/phase-12/skill-feedback-report.md` を追加し、Phase 12 必須 6成果物をそろえた
- current code 再監査で actual centralization gap を確認し、follow-up 4件を formalize した

#### 検証証跡

| コマンド                                                                                                                                                                                                                       | 結果                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                                                                                                        | PASS（topic-map.md / keywords.json 再生成）           |
| `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js`                                                                                                                                                    | PASS with warnings 5（500行超ファイルの既存警告のみ） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization --json`                                             | PASS（13/13, errors 0, warnings 0, info 1）           |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization --json`                        | PASS（10/10）                                         |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/outputs/phase-12/unassigned-task-detection.md` | PASS（4/4, missing 0）                                |
| `diff -qr .claude/skills/ .agents/skills/`                                                                                                                                                                                     | PASS（差分なし）                                      |

#### Phase 12 未タスク

| 未タスクID                                                          | 概要                                                                                | 優先度 | タスク仕様書                                                                                                             |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001` | current code に残る centralization 未完了箇所を実装・共有契約・テストまで収束させる | 高     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` |
| `UT-CLEANUP-AI-CHECK-CONNECTION-001`                                | legacy health route cleanup                                                         | 低     | `docs/30-workflows/unassigned-task/UT-CLEANUP-AI-CHECK-CONNECTION-001.md`                                                |
| `UT-CLEANUP-RUNTIME-RESOLVER-001`                                   | deprecated resolver cleanup                                                         | 低     | `docs/30-workflows/unassigned-task/UT-CLEANUP-RUNTIME-RESOLVER-001.md`                                                   |
| `UT-DESIGN-SANITIZE-PLACEMENT-001`                                  | sanitize 配置判断の固定                                                             | 中     | `docs/30-workflows/unassigned-task/UT-DESIGN-SANITIZE-PLACEMENT-001.md`                                                  |

#### 苦戦箇所

| 苦戦箇所                                                 | 再発条件                                             | 対処                                                                                                 |
| -------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| design close-out を feature 完了と誤読しやすい           | workflow root と completed ledger の意味を分離しない | workflow root=`implementation_ready`、completed=`spec_created` を明記した                            |
| docs だけ見て final re-audit を閉じると実装 gap を見逃す | `outputs/` と台帳だけで判断し、current code を見ない | main IPC consumer / facade / shared transport / tests まで sweep し、高優先度 task を formalize した |

#### 同種課題の簡潔解決手順

1. design task の close-out では workflow root と completed ledger の意味を分離する。
2. Phase 12 最終再監査で current code の主要 consumer と tests を確認する。
3. 実装 gap は未タスクへ昇格し、backlog / workflow / lessons / completed を同一ターンで同期する。

### タスク: TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 execution-responsibility-contract-foundation（2026-03-20）

| 項目       | 値                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001                                             |
| ステータス | **仕様書作成完了（`spec_created` / Phase 1-12 completed / Phase 13 blocked）**                        |
| タイプ     | design                                                                                                |
| 優先度     | 高                                                                                                    |
| 完了日     | 2026-03-20                                                                                            |
| 対象       | execution responsibility / access capability / CTA contract foundation                                |
| 成果物     | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/` |

#### 実施内容

- `integratedRuntime` / `terminalSurface` / `both` / `none` の capability 語彙と `ready` / `blocked` / `unavailable` の UI 状態語彙を固定した
- primary CTA 1件 + secondary CTA 1件、`none` では実行 CTA を DOM に含めない、silent fallback / auto-send / hidden prompt injection 禁止を foundation 契約として明文化した
- current canonical workflow として `workflow-ai-runtime-execution-responsibility-realignment.md` を追加し、`task-workflow.md` / `resource-map.md` / `lessons-learned-current.md` と same-wave sync した
- Phase 12 再監査で planned wording 残存と worktree 先送りパターンを教訓化し、両 skill のガイドを是正した

#### 検証証跡

| コマンド                                                                                                                                                                                                               | 結果                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                                                                                                | PASS（topic-map.md / keywords.json 再生成）           |
| `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js`                                                                                                                                            | PASS with warnings 5（500行超ファイルの既存警告のみ） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation --json`                      | PASS（13/13, errors 0, warnings 12）                  |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation --json` | PASS（10/10）                                         |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                                                                               | PASS（差分なし）                                      |
| `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                         | PASS（差分なし）                                      |

#### 苦戦箇所

| 苦戦箇所                                                                                              | 再発条件                                                      | 対処                                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| current workflow の canonical entrypoint が task-workflow から辿れず、旧 authmode pack だけが見つかる | workflow 名変更後も旧 parent pack だけを参照し続ける          | `workflow-ai-runtime-execution-responsibility-realignment.md` を追加し、resource-map / task-workflow から到達可能にした |
| Phase 12 実更新後も `計画済み` / `更新予定` が成果物に残る                                            | docs-only task で実ファイル更新と成果物更新を別ターンに分ける | planned wording を不完了として扱うルールを skill 正本へ追記し、成果物を実績ベースへ書き換える                           |

#### 同種課題の簡潔解決手順

1. current workflow 名を canonical workflow spec と task-workflow の両方へ同時登録する。
2. Phase 12 では `.claude` 正本更新、workflow 成果物更新、mirror sync を同一ターンで閉じる。
3. `計画済み` / `更新予定` / `PRマージ後` が残っていたら未完了として扱い、実績文へ置換する。

### タスク: TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 slide-ai-runtime-alignment（2026-03-19）

| 項目       | 値                                                                                  |
| ---------- | ----------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001                                             |
| ステータス | **仕様書作成完了（`spec_created` / Phase 1-12 完了）**                              |
| タイプ     | design                                                                              |
| 優先度     | 高                                                                                  |
| 完了日     | 2026-03-19                                                                          |
| 対象       | Slide / Modifier / Legacy Agent 経路の runtime/auth-mode alignment                  |
| 成果物     | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/` |

#### 実施内容

- slide runtime/auth-mode alignment の正本仕様を IPC / RuntimeResolver / UI / state / security へ同期した
- Phase 11 は screenshot 5件を取得し、current UI と正本仕様の drift を visual audit として記録した
- live preview は esbuild native binary mismatch で停止したため、current code 由来の static fallback capture を metadata 付きで保存した
- `UT-SLIDE-IMPL-001` / `UT-SLIDE-UI-001` / `UT-SLIDE-P31-001` / `UT-SLIDE-HANDOFF-DUP-001` を formalize し、backlog へ登録した
- 2026-03-21 current branch で `UT-SLIDE-UI-001` は完了、`UT-SLIDE-P31-001` は吸収済みへ更新した

#### 検証証跡

| コマンド                                                                                                                                                                       | 結果                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `node .../verify-all-specs.js --workflow ...step-04-par-task-09-slide-ai-runtime-alignment --json`                                                                             | PASS（13/13, warnings 0）       |
| `node .../validate-phase-output.js ...step-04-par-task-09-slide-ai-runtime-alignment`                                                                                          | PASS                            |
| `node apps/desktop/scripts/capture-slide-ai-runtime-alignment-phase11.mjs`                                                                                                     | PASS（fallback screenshot 5件） |
| `node .../validate-phase11-screenshot-coverage.js --workflow ...step-04-par-task-09-slide-ai-runtime-alignment`                                                                | PASS                            |
| `node .../validate-phase12-implementation-guide.js --workflow ...step-04-par-task-09-slide-ai-runtime-alignment`                                                               | PASS                            |
| `node .../verify-unassigned-links.js --source .../outputs/phase-12/unassigned-task-detection.md`                                                                               | PASS                            |
| `node .../audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                                   | PASS（currentViolations=0）     |
| `diff -qr .claude/skills/{aiworkflow-requirements,task-specification-creator,skill-creator} .agents/skills/{aiworkflow-requirements,task-specification-creator,skill-creator}` | PASS                            |

#### follow-up 状況（2026-03-21）

| 種別      | ID                         | 概要                                                            | タスク仕様書                                                                                                                        |
| --------- | -------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| pending   | `UT-SLIDE-IMPL-001`        | slide runtime/auth-mode 実装収束                                | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-impl-001.md`        |
| pending   | `UT-SLIDE-HANDOFF-DUP-001` | `HandoffGuidance` 重複定義解消                                  | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-handoff-dup-001.md` |
| completed | `UT-SLIDE-UI-001`          | SlideWorkspace UI 4領域実装                                     | `docs/30-workflows/completed-tasks/task-ut-slide-ui-001.md`                                                                         |
| resolved  | `UT-SLIDE-P31-001`         | `useSlideProject()` selector migration を current branch で吸収 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-p31-001.md`         |

#### 苦戦箇所

| 苦戦箇所                                                                        | 再発条件                                              | 対処                                                                                                              |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| live preview が `esbuild` mismatch で停止し、current build の直接撮影ができない | worktree の native binary と preview 実行環境が不整合 | harness + static fallback に切り替え、`phase11-capture-metadata.json` と `manual-test-result.md` に理由を固定した |
| repo-wide `verify-unassigned-links` と task-scope link 監査が混ざる             | global コマンドだけで完了判定する                     | `--source outputs/phase-12/unassigned-task-detection.md` を current 判定に使い、repo baseline 6 件は別管理にした  |
| `spec_created` が計画記述のまま残りやすい                                       | docs-heavy task で `.claude` 正本更新を後回しにする   | system spec / lessons / backlog / skill / mirror parity を同ターンで実更新した                                    |

#### 同種課題の簡潔解決手順

1. Phase 11 は live preview が不安定なら無理に続行せず、fallback capture と metadata を current workflow へ先に固定する。
2. link 監査は `verify-unassigned-links --source .../unassigned-task-detection.md` を task 判定にし、repo-wide FAIL は baseline として分離する。
3. `spec_created` でも `.claude` 正本、lessons、backlog、skill、mirror parity を同ターンで閉じる。

### タスク: TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 skill-docs-runtime-integration（2026-03-16）

| 項目       | 値                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                                                            |
| ステータス | **完了（Phase 1-12 完了）**                                                                                   |
| タイプ     | implementation                                                                                                |
| 優先度     | 中                                                                                                            |
| 完了日     | 2026-03-16                                                                                                    |
| 対象       | Skill Docs 生成の AI runtime 統合（LLMDocQueryAdapter / SkillDocsCapabilityResolver / DocOperationResult 型） |
| 成果物     | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/` |

#### 実施内容

- `LLMDocQueryAdapter` を実装し、SkillDocGenerator の stubQueryFn を差し替えた
- `SkillDocsCapabilityResolver` で integrated-api / guidance-only / terminal-handoff の3パス判定を実装
- `DocOperationResult<T>` 型を追加し、エラーハンドリングを統一
- 実装完了時点の証跡として 97テスト ALL PASS、カバレッジ基準充足（LLMDocQueryAdapter 98.58%、CapabilityResolver 100%）を保持
- 2026-03-16 再監査で Phase 11 screenshot/Phase 12 guide/workflow 構造を再検証し、契約ドリフト（証跡ファイル名・implementation-guide要件）を是正
- 未タスク1件検出: UT-SKILL-DOCS-TERMINAL-HANDOFF-001（terminal-handoff 実パス実装）

#### 検証証跡

| コマンド                                                                                                                    | 結果                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @repo/desktop test`                                                                                          | 97テスト ALL PASS                                                                                                                |
| `LLMDocQueryAdapter` カバレッジ                                                                                             | 98.58%                                                                                                                           |
| `SkillDocsCapabilityResolver` カバレッジ                                                                                    | 100%                                                                                                                             |
| `pnpm --filter @repo/desktop typecheck`                                                                                     | PASS（再監査 2026-03-16）                                                                                                        |
| `pnpm --filter @repo/shared typecheck`                                                                                      | PASS（再監査 2026-03-16）                                                                                                        |
| `node .../verify-all-specs.js --workflow ...step-03-par-task-04-skill-docs-runtime-integration --json`                      | PASS（13/13, warning 0）                                                                                                         |
| `node .../validate-phase-output.js ...step-03-par-task-04-skill-docs-runtime-integration --phase 12 --json`                 | PASS（28項目）                                                                                                                   |
| `node .../validate-phase11-screenshot-coverage.js --workflow ...step-03-par-task-04-skill-docs-runtime-integration --json`  | PASS（5/5）                                                                                                                      |
| `node .../validate-phase12-implementation-guide.js --workflow ...step-03-par-task-04-skill-docs-runtime-integration --json` | PASS（10/10）                                                                                                                    |
| `pnpm --filter @repo/desktop exec vitest run ...`                                                                           | 環境依存で再実行不可（esbuild darwin-x64/arm64 mismatch）。実装完了時の PASS 証跡を保持し、今回は typecheck + validator で再監査 |

### タスク: TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 task-specification-creator 大規模 Markdown 責務分離（2026-03-12）

| 項目       | 値                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001                                 |
| ステータス | **進行中（Phase 1-12 完了 / Phase 13 blocked）**                                           |
| タイプ     | improvement                                                                                |
| 優先度     | 高                                                                                         |
| 完了日     | 2026-03-12                                                                                 |
| 対象       | `.claude/skills/task-specification-creator/` の 500 行超 markdown 6 concern                |
| 成果物     | `docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform/outputs/` |

#### 実施内容

- `SKILL.md` を 227 行の入口専用ドキュメントへ slim 化した
- `patterns`、`phase-templates`、`spec-update-workflow`、`phase-11-12-guide` を family file へ分割した
- `LOGS.md` を rolling 化し、`logs-archive-index.md` と月次 archive を追加した
- `.claude` 正本を `.agents` mirror へ同期し、`quick_validate.js` / `validate_all.js` / `diff -qr` を PASS させた

#### 検証証跡

| コマンド                                                                                                                                                                       | 結果                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator --verbose`                                                              | PASS                         |
| `node .claude/skills/skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator --verbose`                                                                | PASS                         |
| `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                 | PASS                         |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform`              | Phase outputs 更新後に再実行 |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-specification-creator-line-budget-reform --json` | Phase outputs 更新後に再実行 |

### タスク: TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 ライトテーマ token 基盤是正（2026-03-11）

| 項目       | 値                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001                                                                 |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 未実施）**                                                             |
| タイプ     | fix                                                                                                       |
| 優先度     | 高                                                                                                        |
| 完了日     | 2026-03-11                                                                                                |
| 対象       | `apps/desktop/src/renderer/styles/tokens.css` の light token 契約是正（surface / text / border / accent） |
| 成果物     | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/`                                 |

#### 実施内容

- `tokens.css` の light palette を `#ffffff` / `#000000` 基準へ是正し、surface / text / border / accent の階層を再定義した
- `globals.css` に renderer-wide compatibility bridge を追加し、light mode で残っていた `text-white` / `text-gray-*` / `bg-gray-*` / `border-white/*` 系の legacy neutral drift を全画面共通で吸収した
- `Button` / `Input` / `TextArea` / `Checkbox` / `SettingsCard` などの共通 primitives を semantic token 基準へ寄せ、accent surface 上だけ inverse text を維持した
- `DashboardView` まわりの未定義 `--accent` 参照を `--accent-primary` に統一し、CI fail shard と一致する `pnpm --filter @repo/desktop exec vitest run --shard=11/16` の再現系を PASS へ戻した
- Phase 11 screenshot 5件を再取得し、completed workflow 側へ移した capture script / screenshot path / coverage validator を current 実装へ再同期した
- 親 workflow 完了後の継続 backlog 2件を `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/` に移管し、Issue `#1156` / `#1157` と同期した

#### 苦戦箇所

| 苦戦箇所                                                                        | 再発条件                                                                                                | 対処                                                                                                                                                                                    |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| token 修正だけでは renderer 全域の hardcoded neutral class drift を止めきれない | `tokens.css` だけ直し、`text-white` / `bg-gray-*` / `border-white/*` を使う legacy class を棚卸ししない | `globals.css` に compatibility bridge を入れ、全画面の暫定整合を先に取り、その後に primitives を token へ寄せた                                                                         |
| desktop CI の 1 shard fail は全量再実行だけでは原因が埋もれる                   | GitHub Actions 上の shard 番号を local で再現せずに broad rerun する                                    | `pnpm --filter @repo/desktop exec vitest run --shard=11/16` で同じ shard を再現し、Dashboard の `--accent` drift を局所化した                                                           |
| light baseline 更新後に旧 screenshot を残すと Apple UI/UX 判断が stale になる   | token / component / bridge を変えた後に screenshot を再取得しない                                       | capture script の workflow root を completed path へ直し、5件を再撮影して `validate-phase11-screenshot-coverage` を通した                                                               |
| Phase 5-12 成果物不足で phase status と outputs が乖離する                      | 実装優先で phase artifacts 生成を後回しにする                                                           | `outputs/phase-5..12` を補完し、`artifacts.json` / `outputs/artifacts.json` / `index.md` と同時同期した                                                                                 |
| `phase-11-manual-test.md` の必須節不足で coverage validator の根拠が弱くなる    | `テストケース` と `画面カバレッジマトリクス` を省略する                                                 | 2節を追加し、`manual-test-result.md` の `証跡` 列と 1:1 対応にそろえた                                                                                                                  |
| `.claude` 正本と workflow docs の更新順が崩れると Step 1-A〜2 の記録が欠ける    | workflow だけ更新して system spec 台帳を後回しにする                                                    | `ui-ux-design-system` / `task-workflow` / `lessons-learned` / `SKILL` / `LOGS` を同一ターンで同期した                                                                                   |
| completed workflow へ移管した後の follow-up backlog 正本がぶれる                | workflow 名参照だけで残課題を管理し、正式 task spec / issue 導線を固定しない                            | 親 task 完了後の継続 backlog は `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/` に揃え、`audit --target-file` で個別 `currentViolations=0` を確認した |

#### 同種課題の5分解決カード

1. light token baseline を `#ffffff / #000000` に固定する。
2. `rg` で renderer 全域の hardcoded neutral class を監査し、token 修正 / compatibility bridge / component migration の責務を先に分ける。
3. CI fail が desktop shard 単位なら `pnpm --filter @repo/desktop exec vitest run --shard=<n>/16` で同じ shard を再現する。
4. light baseline を変えたら screenshot を再取得し、`validate-phase11-screenshot-coverage` を再実行する。
5. `ui-ux-design-system` / `task-workflow` / `lessons-learned` / `SKILL` / `LOGS` を同一ターンで同期して閉じる。

#### 関連未タスク

| タスクID                                           | 概要                                                                   | 優先度 | 参照                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001    | shared component の hardcoded color を semantic token へ段階移行する   | 高     | `docs/30-workflows/light-theme-shared-color-migration/index.md`            |
| TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 | light contrast の screenshot / audit / Phase 11 checklist を恒久化する | 中     | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` |

#### 検証証跡

| コマンド                                                                                                                                                                                                                                                   | 結果                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/styles/tokens.light-theme.contract.test.ts`                                                                                                                                                      | PASS（4 tests）               |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/components/atoms/Button/Button.test.tsx`                                                                                                                                                         | PASS                          |
| `pnpm --filter @repo/desktop exec vitest run --shard=11/16`                                                                                                                                                                                                | PASS                          |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                    | PASS                          |
| `pnpm --filter @repo/desktop build`                                                                                                                                                                                                                        | PASS                          |
| `pnpm lint`                                                                                                                                                                                                                                                | PASS（warning のみ、error 0） |
| `node apps/desktop/scripts/capture-light-theme-token-foundation-phase11.mjs`                                                                                                                                                                               | PASS（screenshot 5件）        |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/light-theme-token-foundation`                                                                                 | PASS                          |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                                                                                        | PASS                          |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md` | PASS（currentViolations=0）   |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard`                                                                                                  | PASS                          |

### タスク: TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 ライトテーマ shared 色移行仕様書整備（2026-03-12）

| 項目       | 値                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001                                                                                                                                               |
| ステータス | **仕様書作成完了（`spec_created` / Phase 1-3 completed / 実装未着手）**                                                                                                                       |
| タイプ     | fix                                                                                                                                                                                           |
| 優先度     | 高                                                                                                                                                                                            |
| 完了日     | 2026-03-12                                                                                                                                                                                    |
| 対象       | `ThemeSelector` / `AuthModeSelector` / `AuthKeySection` / `AccountSection` / `ApiKeysSection` / `AuthView` / `WorkspaceSearchPanel` の hardcoded color migration を実コード監査ベースで仕様化 |
| 成果物     | `docs/30-workflows/light-theme-shared-color-migration/outputs/`                                                                                                                               |

#### 実施内容

- current workflow root（`index.md` / `phase-1..3` / `artifacts.json` / `outputs/artifacts.json`）を、`outputs/phase-1..3` と `verification-report.md` に合わせて `spec_created` + inventory correction ベースへ是正した
- primary targets を `ThemeSelector` / `AuthModeSelector` / `AuthKeySection` / `AccountSection` / `ApiKeysSection` / `AuthView` / `WorkspaceSearchPanel` に更新し、`SettingsView` / `SettingsCard` / `DashboardView` は verification-only lane に落とした
- `ui-ux-design-system` / `ui-ux-settings` / `ui-ux-feature-components` / `ui-ux-components` / `ui-ux-search-panel` / `ui-ux-portal-patterns` / `rag-desktop-state` / `api-ipc-auth` / `api-ipc-system` / `architecture-auth-security` / `security-electron-ipc` / `security-principles` / `task-workflow` / `lessons-learned` を current task の必要 spec として抽出した
- Phase 1-3 を completed、Phase 4-12 を planned、Phase 13 を blocked に固定し、実装・commit・PR は user 指示どおり未着手のまま維持した

#### 仕様書別 SubAgent 分担

| SubAgent | 担当仕様書                                                                                                                        | 主担当作業                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| A        | `workflow-light-theme-global-remediation.md` / `ui-ux-design-system.md` / `ui-ux-settings.md`                                     | token/component 境界、actual inventory、verification-only lane の同期 |
| B        | `ui-ux-feature-components.md` / `ui-ux-search-panel.md` / `ui-ux-portal-patterns.md` / `rag-desktop-state.md`                     | Auth / WorkspaceSearch / dialog / state の cross-cutting 条件抽出     |
| C        | `api-ipc-auth.md` / `api-ipc-system.md` / `architecture-auth-security.md` / `security-electron-ipc.md` / `security-principles.md` | auth/api/security 契約の抽出と boundary 確認                          |
| D        | `task-workflow.md`                                                                                                                | `spec_created` 台帳化、Phase gate、検証証跡の固定                     |
| E        | `lessons-learned.md` / `skill-creator` templates                                                                                  | 苦戦箇所、5分解決カード、再利用テンプレート化                         |

#### 苦戦箇所

| 苦戦箇所                                                               | 再発条件                                                   | 対処                                                                                                                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 旧 unassigned-task 在庫をそのまま使うと current worktree と drift する | `SettingsView` / `DashboardView` を主対象のまま固定する    | Phase 1 で current worktree の hardcoded color inventory を取り直し、wrapper は verification-only に分離した                                             |
| token scope と component scope を混ぜると task 境界が崩れる            | token foundation の残件を component migration に混在させる | 親 workflow を token 基盤、current workflow を component migration、wrapper を verification-only として3分離した                                         |
| UI spec だけ読むと auth/search/security/portal/state の前提を落とす    | `ui-ux-*` だけで Phase 1-2 を閉じる                        | `rag-desktop-state` / `api-ipc-auth` / `api-ipc-system` / `architecture-auth-security` / `security-*` / `ui-ux-portal-patterns` まで同一ターンで抽出した |
| Phase 1-3 前提を崩すと後続 phase の batch が揺れる                     | inventory correction 前に Phase 4-13 を先に詳細化する      | priority batches と design review を固定してから Phase 4+ を planned へ維持した                                                                          |

#### 同種課題の5分解決カード

1. Phase 1 で current worktree の inventory を取り直し、旧 unassigned-task の対象を盲信しない。
2. token scope / component scope / verification-only lane を先に分離する。
3. `ui-ux-*` だけでなく `rag-desktop-state` / `api-ipc-*` / `architecture-auth-security` / `security-*` / `ui-ux-portal-patterns` の要否を同時判定する。
4. Phase 1-3 を completed にしてから、Phase 4 以降は planned task として書く。
5. `workflow-light-theme-global-remediation` / `task-workflow` / `lessons-learned` / skill template を同一ターンで同期する。

#### 検証証跡

| コマンド                                                                                                                                                  | 結果     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/light-theme-shared-color-migration --phase 1`          | PASS     |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/light-theme-shared-color-migration --json`       | PASS     |
| `diff -u docs/30-workflows/light-theme-shared-color-migration/artifacts.json docs/30-workflows/light-theme-shared-color-migration/outputs/artifacts.json` | 差分なし |

#### Phase 12で登録した関連未タスク

| 未タスクID                                          | 概要                                                                                                                                    | 優先度 | タスク仕様書                                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| UT-IMP-SPEC-CREATED-UI-WORKFLOW-ROOT-SYNC-GUARD-001 | `spec_created` UI workflow で current inventory / verification-only lane / system spec extraction / root registry sync を同時に固定する | 中     | `docs/30-workflows/unassigned-task/task-imp-spec-created-ui-workflow-root-sync-guard-001.md` |

### タスク: TASK-SKILL-LIFECYCLE-01 スキルライフサイクル一次導線・画面責務基盤（2026-03-11）

| 項目       | 値                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                                                                 |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 未実施）**                                                           |
| タイプ     | design                                                                                                  |
| 優先度     | 高                                                                                                      |
| 完了日     | 2026-03-11                                                                                              |
| 対象       | Skill Center を起点にした create / use / improve 一次導線、画面責務、advanced route、Task02-05 依存契約 |
| 成果物     | `docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/`           |

#### 実施内容

- `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` を追加し、job guide / surface responsibility / advanced route policy / downstream contract を一元化
- `App.tsx` で `normalizeSkillLifecycleView()` を通して `skill-center` legacy alias を canonical `skillCenter` へ正規化
- `SkillCenterView` に create / use / improve の 3 ジョブパネルと surface ownership board を追加し、一次導線入口と責務境界を画面上へ露出
- targeted tests / typecheck PASS、Phase 11 screenshot 6件取得、TC-11-05 は責務ボード要素を直接 capture、Apple UI/UX 観点の視覚監査まで完了
- `.claude` 正本 8件、`.agents` mirror、workflow 本文 / artifacts / outputs、task-spec guide を同一ターンで同期
- `outputs/phase-12/phase12-task-spec-compliance-check.md` を追加し、Task 12-1〜12-5 と Step 1-A〜1-E / Step 2 の準拠証跡を 1 ファイルへ集約した

#### 苦戦箇所

| 苦戦箇所                                                                                 | 再発条件                                                                                                                                                                          | 対処                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lifecycle 仕様が複数 view に分散し、入口と責務が同時に読めない                           | navigation / feature / state / workflow を別々に更新する                                                                                                                          | `skillLifecycleJourney.ts` を実装アンカーにし、Skill Center を入口、各 view を destination surface として役割分担を固定した                                                                                                                                                 |
| legacy `skill-center` 値が残ると view 分岐・テスト・仕様書が二重化する                   | store / legacy button / shortcut のどこかが旧値を返したままになる                                                                                                                 | `App.tsx` で正規化 helper を必ず通し、仕様書・テスト・UI 表示は `skillCenter` を正本に統一した                                                                                                                                                                              |
| representative screenshot が shell 全景だけだと責務証跡として弱い                        | Global nav と main content が見えても、どの surface が何を担当するかが明文化されない                                                                                              | `SkillCenterView` に surface ownership board を追加し、Phase 11 は `data-testid="skill-lifecycle-surface-ownership"` を待って要素 capture した                                                                                                                              |
| Phase 12 で workflow 台帳・本文・正本仕様の同期漏れが起きやすい                          | outputs だけ作って `artifacts.json` / `phase-*.md` / `task-workflow.md` を後回しにする                                                                                            | artifacts を標準スキーマへ寄せ、Phase 本文 1-12 を completed 化し、`.claude` 正本とあわせて同ターンで閉じた                                                                                                                                                                 |
| `unassigned-task-detection.md` を「0件」だけで終えると指定ディレクトリ全体が健全に見える | current task 由来の未タスクは 0 件だが、`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` 全体には legacy baseline が残っている | `currentViolations=0` と `baselineViolations=133` を分離記録し、既存 backlog `task-imp-unassigned-task-format-normalization-001.md` / `task-imp-unassigned-task-legacy-normalization-001.md` / `task-imp-phase12-unassigned-baseline-remediation-002.md` を参照先へ固定した |

#### 同種課題の5分解決カード

1. 入口導線は 1 画面に集約し、destination surface とは責務を分ける。
2. legacy view alias は shell で canonical 化し、分岐・テスト・仕様書の正本値を 1 つに固定する。
3. create / use / improve のような job guide は UI 表示とコード契約を同じファイルで管理する。
4. Phase 12 は outputs だけで閉じず、`artifacts.json` / `outputs/artifacts.json` / phase 本文 / `.claude` 正本を同時更新する。
5. UI 導線変更は targeted test、typecheck、Phase 11 screenshot、Apple UI/UX 目視レビューに加え、`unassigned-task-detection.md` へ `current/baseline` と既存 backlog 参照を同時に残す。

#### Phase 12 タスク仕様準拠の追加確認（2026-03-11 JST）

| 観点                                                               | 結果                                                                                                                                                                        |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify-all-specs --workflow ... --json`                           | PASS（13/13 phases, error 0, warning 0, info 1）                                                                                                                            |
| `validate-phase-output.js <workflow>`                              | PASS                                                                                                                                                                        |
| `validate-phase12-implementation-guide.js --workflow ... --json`   | PASS                                                                                                                                                                        |
| `verify-unassigned-links.js --source .claude/.../task-workflow.md` | PASS（213 / 213, missing 0）                                                                                                                                                |
| `audit-unassigned-tasks.js --json --diff-from HEAD`                | PASS（currentViolations=0, baselineViolations=133）                                                                                                                         |
| 今回タスク由来の未タスク                                           | 0 件                                                                                                                                                                        |
| 継続管理する backlog                                               | `task-imp-unassigned-task-format-normalization-001.md` / `task-imp-unassigned-task-legacy-normalization-001.md` / `task-imp-phase12-unassigned-baseline-remediation-002.md` |

### タスク: TASK-UI-06-HISTORY-SEARCH-VIEW あなたの記録タイムライン再設計（2026-03-10）

| 項目       | 値                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-06-HISTORY-SEARCH-VIEW                                                                             |
| ステータス | **完了（Phase 1-12 出力 + 実装 + screenshot + system spec 同期）**                                         |
| タイプ     | ui                                                                                                         |
| 優先度     | 中                                                                                                         |
| 完了日     | 2026-03-10                                                                                                 |
| 対象       | `HistorySearchView` timeline 再設計、`historySearchSlice`、`historySearchHandlers`、`EditorView` deep-open |
| 成果物     | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/outputs/`                           |

#### 実施内容

- `HistorySearchView` を query/filter/stats 主導の検索画面から timeline 主導 UI へ再設計
- `historySearchSlice` に `hasFetchedHistory` / `isHistoryLoadingMore` / append dedupe を追加
- file card から editor を開くため `editorSlice.pendingOpenFilePath` を追加
- `history:search` handler の trim / filter / pagination guard を明文化
- Phase 11 screenshot 6件、targeted tests 26件、task-scope coverage 88.42 / 80.00 / 90.00 を取得

#### 苦戦箇所

| 苦戦箇所                                                               | 再発条件                                   | 対処                                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------- |
| worktree で Rollup native optional module が欠けて test 起動前に落ちる | UI検証前に dependency preflight を省略する | `pnpm install --frozen-lockfile` を preflight に含めた                 |
| screenshot script の locator が broad で strict mode violation になる  | summary/detail が同じ文字列を持つ          | 一意な detail text へ待機条件を絞った                                  |
| `.claude` 正本と `.agents` mirror の参照が混線する                     | workflow / outputs が mirror 側を参照する  | `.claude/skills/...` を正本に固定し、systemic gap は未タスクへ分離した |

#### 同種課題の5分解決カード

1. UIの主目的を「検索」ではなく「読む timeline」に置き直す。
2. initial loading と load more を別 state に分ける。
3. cross-view 導線は `pending payload + view 遷移` に分離する。
4. screenshot script は一意 selector を待機条件にする。
5. Phase 12 は `.claude` 正本・workflow outputs・skill docs を同ターンで同期する。

#### Phase 12で登録した関連未タスク

| タスクID                                   | 概要                                                                                           | 優先度 | 参照                                                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-SKILL-ROOT-CANONICAL-SYNC-GUARD-001 | `.claude` 正本と `.agents` mirror の drift を機械検知し、Phase 12 の canonical root を固定する | 中     | `docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view/unassigned-task/task-imp-skill-root-canonical-sync-guard-001.md` |

#### 検証証跡

| コマンド                                                                                                                                                                                                                                                                                                                                                            | 結果                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/views/HistorySearchView/HistorySearchView.test.tsx src/renderer/views/HistorySearchView/hooks/useTimelineGroups.test.tsx src/renderer/views/HistorySearchView/hooks/useInfiniteScroll.test.tsx src/renderer/store/slices/historySearchSlice.test.ts src/main/ipc/__tests__/historySearchHandlers.test.ts` | PASS（26 tests）      |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                                                                                                                             | PASS                  |
| `pnpm --filter @repo/desktop run screenshot:task-058c`                                                                                                                                                                                                                                                                                                              | PASS（6 screenshots） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view`                                                                                                                                                                                   | PASS                  |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/task-058c-ui-06-history-search-view`                                                                                                                                                                                  | PASS                  |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                                                                                                                                                                                                 | PASS                  |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                                                                                                                                                                          | currentViolations=0   |

### タスク: TASK-UI-08-NOTIFICATION-CENTER お知らせセンター再整備（2026-03-11）

| 項目       | 値                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-08-NOTIFICATION-CENTER                                                                             |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 未実施）**                                                              |
| タイプ     | feat                                                                                                       |
| 優先度     | P2                                                                                                         |
| 完了日     | 2026-03-11                                                                                                 |
| 対象       | `NotificationCenter` の 058e 差分収束（`お知らせ`、Portal、relative time、個別削除 IPC、a11y、responsive） |
| 成果物     | `docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center/outputs/`                           |

#### 実施内容

- `NotificationCenter` のタイトルを `お知らせ` に統一し、`すべて削除` UI を撤去
- popover を `document.body` へ portal 描画し、Escape / outside click / focus return / Tab wrap を追加
- `notification:delete` を shared / preload / main に追加し、個別削除を persistence と接続
- `notificationSlice` に履歴 dedupe と delete 時 `expandedNotificationId` reset を追加
- targeted tests 59件、typecheck PASS、coverage `92.94 / 81.77 / 94.44 / 92.94` を確認
- Phase 11 で screenshot 7件を取得し、Apple UI/UX engineer 観点の視覚レビューを実施

#### 苦戦箇所

| 苦戦箇所                                              | 再発条件                                    | 対処                                                                        |
| ----------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| popover が stacking context と focus 管理で不安定     | inline 描画のまま overlay を広げる          | `createPortal(document.body)` と focus return を導入した                    |
| 初期履歴同期と push が競合して重複する                | history fetch 直後に同一ID push が届く      | `setNotificationHistory()` / `ingestNotification()` の両方で dedupe した    |
| UI に delete を足しても Main persistence が追随しない | shared/preload/main の3境界を同時更新しない | `notification:delete` を channel / type / handler / test まで一括で追加した |

#### 同種課題の5分解決カード

1. Bell 起点 UI は portal と focus return を先に決める。
2. push と history が混在する通知系は ID dedupe を Main/Renderer 両方で確認する。
3. UI から mutation を追加するときは shared 定数、preload 型、main handler を同一ターンで更新する。
4. `notification:clear` のような互換 API は残しても、UI 操作は正本仕様に合わせて減らしてよい。
5. Phase 11 では desktop だけでなく tablet / mobile / empty state まで screenshot を残す。

#### 関連未タスク

- なし。Phase 11 の所見は `MINOR` に留まり、新規 backlog 化は不要と判断した。

#### 検証証跡

| コマンド                                                                            | 結果                                                           |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `cd apps/desktop && pnpm test:run ...NotificationCenter scope...`                   | PASS（6 files / 59 tests）                                     |
| `cd apps/desktop && pnpm typecheck`                                                 | PASS                                                           |
| `cd apps/desktop && pnpm exec vitest run --coverage ...NotificationCenter scope...` | PASS（Stmts 92.94 / Branch 81.77 / Funcs 94.44 / Lines 92.94） |
| `node apps/desktop/scripts/capture-task-058e-notification-center-phase11.mjs`       | PASS（screenshot 7件）                                         |

### タスク: TASK-UI-04B-WORKSPACE-CHAT Workspace Chat Panel（2026-03-11）

| 項目       | 値                                                                                     |
| ---------- | -------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-04B-WORKSPACE-CHAT                                                             |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 未実施）**                                          |
| タイプ     | feat                                                                                   |
| 優先度     | P2                                                                                     |
| 完了日     | 2026-03-11                                                                             |
| 対象       | `WorkspaceView` への chat panel 統合（mention / stream / conversation / file context） |
| 成果物     | `docs/30-workflows/task-059a-ui-04b-workspace-chat-panel/outputs/`                     |

#### 実施内容

- `WorkspaceChatPanel` / `WorkspaceChatInput` / `WorkspaceChatMessageList` / `WorkspaceFileContextChips` / `WorkspaceMentionDropdown` / `WorkspaceSuggestionBubbles` を追加
- `useWorkspaceChatController` で send/stream/persist/mention を統合
- `WorkspaceView` 側の placeholder chat を置換し、attach/preview を共通化
- stream race（chunk/end 同期）に対して `streamContentRef` / `isStreamingRef` の即時同期を導入
- テスト14件 PASS、typecheck PASS、Phase 11 screenshot 8件を取得

#### 苦戦箇所

| 苦戦箇所                                                                       | 再発条件                             | 対処                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------ |
| stream chunk と end が同一ティックで到着すると assistant が欠落する            | state 反映前に end を処理する        | ref 同期更新で chunk/end 競合を解消した                      |
| screenshot harness で llm / conversation API が無いと stream状態が再現できない | 04A harness をそのまま流用する       | 059a 専用 capture script で llm/conversation mock を追加した |
| coverage が全体閾値で失敗し task-scope 判定が見えにくい                        | モノレポ全体 coverage をそのまま読む | task-scope 指標を phase-7 に分離して記録した                 |

#### 同種課題の5分解決カード

1. stream UI のテストで chunk/end を同時発火させ、race を先に検出する。
2. `setState` 依存ロジックは必要なら ref で即時同期して競合を潰す。
3. screenshot harness は対象機能の API（file + llm + conversation）を最初に揃える。
4. モノレポ coverage は task-scope と global を分離して報告する。
5. Phase 12 で system spec / LOGS / SKILL を同一ターンで同期する。

#### 関連未タスク

- なし。MINOR は本タスク成果物に取り込んで解消可能と判断した。

#### 検証証跡

| コマンド                                                                                                                                                                                                                                  | 結果                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `cd apps/desktop && pnpm exec vitest run src/renderer/views/WorkspaceView/WorkspaceView.test.tsx src/renderer/views/WorkspaceView/hooks/useWorkspaceMentionQuery.test.ts src/renderer/views/WorkspaceView/workspaceFileSelection.test.ts` | PASS（3 files / 14 tests） |
| `cd apps/desktop && pnpm exec tsc --noEmit`                                                                                                                                                                                               | PASS                       |
| `cd apps/desktop && pnpm build`                                                                                                                                                                                                           | PASS                       |
| `cd apps/desktop && node scripts/capture-task-059a-workspace-chat-panel-phase11.mjs`                                                                                                                                                      | PASS（screenshot 8件）     |

### タスク: TASK-UI-07-DASHBOARD-ENHANCEMENT ホーム画面リデザイン ─ 挨拶・サジェスチョン・タイムライン（2026-03-11）

| 項目       | 値                                                                                 |
| ---------- | ---------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-07-DASHBOARD-ENHANCEMENT                                                   |
| ステータス | **完了（Phase 1-12 出力 + 実装 + 実画面検証 + 仕様同期）**                         |
| 完了日     | 2026-03-11                                                                         |
| 対象       | `DashboardView` / `views/DashboardView/components/` / Phase 11 screenshot harness  |
| 成果物     | `docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/outputs/` |

#### 実施内容

- 旧統計カード中心の `DashboardView` を、挨拶、サジェスチョン 3 件、タイムライン 5 件中心のホーム画面へ置換
- `dashboardContent.ts` に greeting / suggestions / timeline 導出を集約し、`GreetingHeader` / `DashboardSuggestionSection` / `RecentTimeline` を view-local component として分離
- Phase 11 用 screenshot harness を追加し、light / dark / kanagawa-dragon / mobile / empty / loading を実画面で検証

#### 苦戦箇所

| 苦戦箇所                                                                    | 再発条件                                                     | 対処                                                                |
| --------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| workflow 本体が `spec_created` のまま残りやすい                             | `index.md` / `artifacts.json` / `phase-1..12` を分離更新する | 三層同期を Phase 12 の完了条件に含めた                              |
| Phase 11 validator が `phase-11-manual-test.md` の literal 見出しに依存する | `manual-test-result.md` だけを更新して閉じる                 | `テストケース` と `画面カバレッジマトリクス` を専用文書へ固定した   |
| 表示名 `ホーム` と内部 `dashboard` 契約が混線する                           | 文言変更を `ViewType` 変更と同一視する                       | copy と internal ID を分離し、store / nav 契約は維持した            |
| `.claude` / `.agents` の二重 skill root で mirror 側が stale になる         | user 指定rootだけ更新して完了扱いにする                      | canonical root 固定 + mirror sync + `diff -qr` を完了条件に追加した |

#### 検証証跡

| コマンド                                                                                                                                                                            | 結果                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/views/DashboardView/DashboardView.test.tsx src/renderer/views/DashboardView/components/dashboardContent.test.ts`          | PASS（22 tests）     |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                             | PASS                 |
| `pnpm --filter @repo/desktop screenshot:dashboard-home`                                                                                                                             | PASS（TC-11-01..05） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement`                     | PASS                 |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement` | PASS                 |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                                            | PASS                 |

#### Phase 12で登録した関連未タスク

| タスクID                                              | 概要                                                                                                                 | 参照                                                                                                          |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001  | Phase 12 dual skill-root mirror sync ガード（canonical root 固定 + mirror sync + root間diff検証）                    | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md` |
| UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 | aiworkflow-requirements の入口導線整流（`SKILL.md` / `quick-reference` / `resource-map` と `quick_validate` の整合） | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md`                |

### タスク: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 canonical bridge / workflow ledger governance 設計（2026-03-23）

| 項目       | 値                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001                                                          |
| ステータス | **仕様書作成完了（`implementation_ready` / 設計タスク / Phase 13 blocked）**                             |
| タイプ     | design                                                                                                   |
| 優先度     | 高                                                                                                       |
| 完了日     | 2026-03-23                                                                                               |
| 対象       | canonical source table / bridge rule / state machine / same-wave sync protocol / follow-up formalization |
| 成果物     | `docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/`              |

#### 実施内容

- Canonical Source Table（5カテゴリ: Workflow Ledger / Lessons Learned / System Spec / Indexes / Skill Meta）を定義
- Compatibility Bridge Rule（legacy path の無期限保持 + 新規追加禁止 + deprecation timeline）を設計
- State Machine（spec_created → implementation_ready → completed）を type:design / type:implementation 別に定義
- Same-Wave Sync Protocol（Step A→E の順序実行）を設計し、P1/P25/P2/P27/P43/P56/P57/P59 の回帰防止策を組み込み
- Follow-up Formalization 3ステップ（指示書作成 → backlog 登録 → 発見元リンク追加）を設計タスクでも省略不可として定義
- 契約テストスクリプト `scripts/__tests__/canonical-bridge-ledger-governance.test.ts` を作成（Vitest 70テスト: Contract C-1〜C-12 / Unit U-1-1〜U-3-8 / Integration I-1〜I-6 / Artifact Existence / Edge Case BC-1〜BC-12 / Regression / Rollback & Recovery）
- 親パック4文書コンプライアンス検証を完了（全要件充足確認）
- 教訓2件を追加（L-CBLG-003: テストマトリクスファイル参照誤り、L-CBLG-004: TS1501 regex /s flag）
- Current / Baseline 切り分け（wave 完了条件での移管判定）を定義

#### 発見元

- 親パック: ai-runtime-execution-responsibility-realignment（step-06 / seq-task-09）
- 関連 Pitfall: P1, P2, P3, P4, P25, P26, P27, P38, P43, P51, P56, P57, P58, P59, P65

#### 苦戦箇所

| 苦戦箇所                                                            | 再発条件                                                     | 対処                                                                                              |
| ------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Phase 10 MINOR M-01 が unassigned-task-detection で 0件と記録された | Phase 10 MINOR を Phase 12 Task 4 で正しくカウントしない場合 | Phase 10 final-gate-decision.md の MINOR 一覧と unassigned-task-detection.md の件数を必ず照合する |
| Step A-E が「PRマージ後」として先送りされた（P57 違反）             | 設計タスク + worktree 環境で先送り判断が入る場合             | P57 準拠: 設計タスクでも Phase 12 完了時点で .claude/skills/ を実更新する                         |

#### Phase 12で登録した関連未タスク

| タスクID         | 概要                                       | 参照                                                                     |
| ---------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| (M-01 follow-up) | rsync コマンドの worktree 環境注意書き追加 | `docs/30-workflows/unassigned-task/worktree-rsync-caution-annotation.md` |

---

### タスク: TASK-IMP-HEALTH-POLICY-UNIFICATION-001 HealthPolicy 統一インターフェース（2026-03-25）

| 項目         | 値                                                                         |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-HEALTH-POLICY-UNIFICATION-001                                     |
| ステータス   | **完了**                                                                   |
| タイプ       | implementation                                                             |
| 優先度       | 高                                                                         |
| 完了日       | 2026-03-25                                                                 |
| 親パック     | ai-runtime-execution-responsibility-realignment                            |
| 対応ギャップ | Gap-3（HealthPolicy の統一不足）                                           |
| 成果物       | `docs/30-workflows/completed-tasks/impl-task-b-health-policy-unification/` |

#### 実施内容

- `packages/shared/src/types/health-policy.ts` — HealthPolicy 型 + resolveHealthPolicy() pure function（23テスト）
- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` — HealthPolicy DI + degraded 分岐（8テスト）
- `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts` — HealthPolicy 消費（7テスト）
- `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx` — HealthPolicy props 追加
- `packages/shared/src/types/execution-capability.ts` — apiKeyDegraded @deprecated v0.8.0

#### テスト

38件追加（全PASS）

#### Phase 12 未タスク

| 未タスクID                              | 概要                                                              | 優先度 | タスク仕様書                                                                   |
| --------------------------------------- | ----------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 | useMainlineExecutionAccess.ts を resolveHealthPolicy() 経由に移行 | 高     | `docs/30-workflows/unassigned-task/UT-HEALTH-POLICY-MAINLINE-MIGRATION-001.md` |
| ~~UT-HEALTH-POLICY-RUNTIME-INJECTION-001~~ | ~~RuntimePolicyResolver の HealthPolicy 注入元実装~~ | ~~高~~ | **完了**: 2026-04-07 `docs/30-workflows/ut-health-policy-runtime-injection/` |
| UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001 | @deprecated apiKeyDegraded の実際の除去（v0.8.0）                 | 中     | `docs/30-workflows/unassigned-task/UT-HEALTH-POLICY-DEPRECATED-REMOVAL-001.md` |

---

### タスク: TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Advanced Console Safety Governance（2026-03-24）

| 項目       | 値                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001                             |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 blocked）**                              |
| タイプ     | design / implementation                                                     |
| 優先度     | 高                                                                          |
| 完了日     | 2026-03-24                                                                  |
| ブランチ   | feature/advanced-console-safety-governance                                  |
| 対象       | ApprovalGate、Consumer Auth Guard、3層レイヤー、5 IPC channel               |
| 成果物     | `docs/30-workflows/step-03-seq-task-03-advanced-console-safety-governance/` |

#### 実施内容

- `ApprovalGate` / `IApprovalGate` を新規実装（TTL 300秒、ワンタイムトークン、DI パターン）
- Consumer Auth Guard（`isConsumerToken` 判定）を terminalHandlers に組み込み
- 3層レイヤーアーキテクチャ: Primary Surface → Safety Surface → Detail Surface
- 5 IPC チャンネル新設: `approval:respond`、`execution:get-terminal-log`、`execution:get-copy-command`、`execution:get-disclosure-info`、`approval:request`
- `advancedConsoleHandlers.ts` / `approvalHandlers.ts` / `disclosureHandlers.ts` の3ハンドラファイルを新規作成
- Phase 13（PR）は user approval 未取得のため blocked

#### Phase 12 未タスク

| 未タスクID | 概要                                                                             | 優先度 |
| ---------- | -------------------------------------------------------------------------------- | ------ |
| UT-6       | main/ipc/index.ts へ advancedConsole/approval/disclosure の3ハンドラ追加         | HIGH   |
| UT-7       | preload/index.ts の contextBridge に advancedConsole/approval/disclosure API追加 | HIGH   |
| UT-8       | Main→Renderer への承認要求プッシュ通知（webContents.send）                       | HIGH   |
| UT-9       | abort/done 時に ApprovalGate.revokeAll() でトークンクリア                        | MEDIUM |
| UT-10      | disclosureHandlers.ts 独立テスト作成                                             | LOW    |

---

### タスク: UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001 SkillExecutor/sdkMessageNormalizer 型ガード重複解消（2026-03-29）

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| タスクID   | UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001         |
| ステータス | **完了（Phase 1-12 完了 / Phase 13 未実施）**                |
| タイプ     | refactor                                                     |
| 優先度     | low                                                          |
| 完了日     | 2026-03-29                                                   |
| 関連Issue  | #1692                                                        |
| 由来       | TASK-RT-06 Phase 8 調査（unassigned-task-detection.md）      |
| 成果物     | `docs/30-workflows/skill-executor-normalizer-consolidation/` |

#### 実施内容

- `sdkMessageUtils.ts` を新規作成し、`asSdkMessageRecord()` / `getSdkMessageType()` を共通 helper として抽出
- `SkillExecutor.ts` の `convertToStreamMessage()` が shared helper を利用するよう更新
- `sdkMessageNormalizer.ts` が shared helper を利用するよう更新
- `sdkMessageUtils.test.ts` 新規作成（21件、Line/Branch/Function 100%）
- `pnpm typecheck` PASS、`pnpm lint` 0 errors / 10 warnings
- vitest 再実行は esbuild platform mismatch により環境 blocked（manual-test-result.md に記録済み）

#### Phase 12 未タスク

| 未タスクID                                      | 内容                                                          | 優先度 |
| ----------------------------------------------- | ------------------------------------------------------------- | ------ |
| UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001 | `SkillStreamMessage` と `SkillCreatorSdkEvent` の出力型を統一 | low    |

---

### タスク: TASK-RT-06 claude-sdk-message-contract-normalization（2026-03-29）

| 項目       | 値                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-RT-06                                                                                                         |
| ステータス | **Phase 1-12 完了 / Phase 13 pending**                                                                             |
| タイプ     | implementation                                                                                                     |
| 優先度     | RT                                                                                                                 |
| 完了日     | 2026-03-29                                                                                                         |
| 成果物     | `docs/30-workflows/skill-creator-agent-sdk-lane/step-08-par-task-rt-06-claude-sdk-message-contract-normalization/` |

#### 実施内容

- SDK raw message を `SkillCreatorSdkEvent` へ正規化する契約を Runtime Facade に集約
- `sessionId` 昇格を「最初に観測した sessionId」へ統一
- plan degraded error union (`llm_adapter_unavailable` / `resource_loader_unavailable`) を shared 公開面に反映
- Phase 11/12 成果物を補完（manual-test-checklist / discovered-issues / system-spec-update-summary / changelog / unassigned-task-detection / skill-feedback-report / compliance-check）

#### 検証

- `pnpm -s typecheck:shared`: PASS
- `pnpm -s typecheck:desktop`: PASS
- `pnpm -s vitest apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts`: FAIL（環境依存）

#### Phase 12 未タスク

| 未タスクID                         | 概要                           | 優先度 | タスク仕様書                                                              |
| ---------------------------------- | ------------------------------ | ------ | ------------------------------------------------------------------------- |
| UT-RT-06-ESBUILD-ARCH-MISMATCH-001 | esbuild アーキ不整合の環境修正 | 高     | `docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md` |

---

### タスク: UT-RT-06-ESBUILD-ARCH-MISMATCH-001 esbuild-arch-mismatch-fix（2026-03-29）

| 項目         | 値                                                           |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-RT-06-ESBUILD-ARCH-MISMATCH-001                           |
| ステータス   | **完了**                                                     |
| タイプ       | バグ修正（環境修正 + close-out 整流）                        |
| 優先度       | 高                                                           |
| 完了日       | 2026-03-29                                                   |
| GitHub Issue | #1710                                                        |
| 親タスク     | TASK-RT-06 Phase 12 未タスク                                 |
| 成果物       | `docs/30-workflows/step-ut-rt-06-esbuild-arch-mismatch-001/` |

#### 実施内容

- macOS 環境での esbuild バイナリと Node.js 実行アーキテクチャ（arm64/x64）の不一致を修正
- `EXPECTED_PLATFORM="darwin-$(node -p process.arch)"` を診断基準に統一し、`arm64` 固定ハードコードを除去
- `pnpm install --force` による optional dependency 再解決フローを確立
- 再発防止ガイドを `docs/40-guides/esbuild-arch-mismatch-prevention.md` に作成（Preflight チェックリスト 5 ステップ）
- Phase 10/11/12 の条件付き PASS / DEFERRED 判定を整流し、blocker の扱いを同一未タスク ID で追跡

#### テスト結果

- 対象: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts`
- 結果: 27 tests PASS

#### 再発防止ガイド

`docs/40-guides/esbuild-arch-mismatch-prevention.md` — Preflight チェックリスト（5 ステップ）および診断・復旧手順

---

### タスク: TASK-P0-04 manifest-loader-default-startup（2026-03-30）

| 項目       | 値                                                                              |
| ---------- | ------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-04                                                                      |
| ステータス | **Phase 1-12 完了 / Phase 13 pending**                                          |
| タイプ     | implementation                                                                  |
| 優先度     | P0                                                                              |
| 完了日     | 2026-03-30                                                                      |
| 依存タスク | TASK-P0-03（workflow-manifest.json canonical/mirror 配置）                      |
| 後続タスク | TASK-P0-05（runtime pipeline フル統合）                                         |
| 成果物     | `docs/30-workflows/completed-tasks/task-p0-04-manifest-loader-default-startup/` |

#### 実施内容

- `SKILL_CREATOR_MANIFEST_PATH = "workflow-manifest.json"` 定数を `apps/desktop/src/main/services/skill/constants.ts` に追加
- `resolveDefaultManifestPath(explicitRoot?: string): string` 関数を実装：
  - `explicitRoot` 指定時はそのパスを優先
  - 未指定時は `getSkillCreatorRootCandidates()` の候補（env → home → repo）から `fs.existsSync` で実在パスを探索
  - manifest が見つからない場合は日本語エラーメッセージで throw
- ManifestLoader 自体は変更なし（呼び出し元の追加のみ）

#### 検証

- `pnpm exec vitest run ManifestLoader.production-manifest.test.ts`: **25 tests PASS**
- TypeScript typecheck: PASS
- ESLint: PASS

#### テストケース追加内訳

| テストID | 内容                                            | 結果 |
| -------- | ----------------------------------------------- | ---- |
| TC-10    | SKILL_CREATOR_MANIFEST_PATH で canonical を読む | PASS |
| TC-11    | resolveDefaultManifestPath() が絶対パスを返す   | PASS |
| TC-12    | 解決パスから manifest を読み込める              | PASS |
| TC-13    | 定数が空文字でない                              | PASS |
| TC-14    | explicitRoot が優先される                       | PASS |
| EC-10    | 非存在ディレクトリ指定で正しいパスを返す        | PASS |
| EC-11    | 候補なし時にエラー throw                        | PASS |
| EC-12    | 破損 JSON で ManifestLoader がエラー            | PASS |

#### Phase 12 未タスク

なし（0件）

---

### タスク: TASK-UIUX-FEEDBACK-001 phase11-ui-ux-feedback-loop-review（2026-03-31）

| 項目       | 値                                                               |
| ---------- | ---------------------------------------------------------------- |
| タスクID   | TASK-UIUX-FEEDBACK-001                                           |
| ステータス | **spec_created 維持 / canonical・mirror・system spec sync 実施** |
| タイプ     | skill improvement + workflow documentation correction            |
| 優先度     | HIGH                                                             |
| 完了日     | 2026-03-31                                                       |
| 成果物     | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/`  |

#### 実施内容

- `.claude/skills/task-specification-creator/` に追加された `evaluate-ui-ux` script 群、prompt agent、テスト群を current fact として整理
- `evaluate-ui-ux.js` の CLI が `--task-id` を評価コンテキストへ渡していなかった不整合を修正
- screenshot 0 件で処理が進む false green を防ぐガードと回帰テストを追加
- workflow `artifacts.json` / `outputs/artifacts.json` を `spec_created` 現在地へ是正
- Phase 11/12 文書から completed 誤記を除去し、placeholder screenshot と `not_run` metadata を current fact として固定

#### 未完了事項

| 項目                           | 状態         |
| ------------------------------ | ------------ |
| representative screenshot 実測 | 未了         |
| Phase 11 実行結果              | 未了         |
| HIGH 問題の未タスク化          | 実行後に判定 |

---

### タスク: TASK-SDK-SC-02 Conversation UI 質問受信・回答送信 UI コンポーネント（2026-04-03）

| 項目       | 値                                                                    |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | TASK-SDK-SC-02                                                        |
| ステータス | **Phase 1-12 完了**                                                   |
| タイプ     | implementation                                                        |
| 優先度     | 高                                                                    |
| 完了日     | 2026-04-03                                                            |
| 依存タスク | TASK-SDK-SC-01                                                        |
| 後続タスク | なし                                                                  |
| 成果物     | `docs/30-workflows/step-02-par-task-02-conversation-ui/`              |

#### 実施内容

- Electron Renderer 側に Atomic Design 準拠の 5 コンポーネントを新規実装
  - `ChoiceButton`（Atom）: 選択/未選択状態の単一ボタン、`aria-pressed` 対応
  - `FreeTextInput`（Atom）: 自由入力テキストエリア、secret モード対応、Enter 送信 / Shift+Enter 改行
  - `ConversationProgress`（Atom）: 「質問 N / 推定合計」形式の進捗表示、`role="progressbar"` 対応
  - `QuestionCard`（Molecule）: `kind`（single_select / multi_select / free_text / secret / confirm）に応じた入力 UI 統合
  - `SkillCreatorConversationPanel`（Organism）: IPC listen・回答送信・全コンポーネント統合、`useReducer` による状態管理
- Session Bridge 型（`UserInputQuestion`/`UserInputAnswer`）と Workflow 型（`SkillCreatorUserInputRequest`/`InterviewUserAnswer`）のブリッジ層を Panel 内に実装
- `multi_select` の「その他（自由入力）」は `selectedValues` 経路として扱い、ブリッジで `UserInputAnswer.value` の配列に正規化
- `key={questionIndex}` パターンで QuestionCard の内部状態を質問切り替え時に自動リセット

#### 検証

- `pnpm --filter @repo/desktop exec vitest run ...skill-creator/__tests__/`: **57 tests PASS**
- カバレッジ: Stmts 97.54% / Branch 86.04% / Funcs 95.83% / Lines 97.54%
- TypeScript typecheck: PASS
- ESLint: PASS

#### テストケース追加内訳

| テストファイル                              | テスト数 | 主な検証内容                                           |
| ------------------------------------------- | -------- | ------------------------------------------------------ |
| `ChoiceButton.test.tsx`                     | 9        | 表示・選択状態・freeText 破線・disabled・aria-pressed  |
| `FreeTextInput.test.tsx`                    | 9        | 表示制御・Enter/Shift+Enter・secret・disabled・clear   |
| `ConversationProgress.test.tsx`             | 3        | 表示形式・プログレスバー幅                             |
| `QuestionCard.test.tsx`                     | 23       | 全 5 kind・エッジケース・XSS・多言語・multi_select 自由入力 |
| `SkillCreatorConversationPanel.test.tsx`    | 13       | IPC リスナー・クリーンアップ・質問表示・回答送信・エラー・重複送信防止 |

#### Phase 12 未タスク

なし（0件）

---

### タスク: TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 RuntimeSkillCreatorFacade adapter guard（2026-04-04）

| 項目       | 値                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001                                                                              |
| ステータス | **完了**                                                                                                                     |
| タイプ     | implementation                                                                                                               |
| 優先度     | 高                                                                                                                           |
| 完了日     | 2026-04-04                                                                                                                   |

#### 実施内容

- `execute()` / `improve()` 先頭に LLMAdapter ステータス3段階チェック（initializing / ready / failed）を追加
- `RuntimeSkillCreatorExecuteErrorResponse` 型を `packages/shared` に新設し `RuntimeSkillCreatorExecuteResponse` union を拡張
- `SkillCreatorWorkflowEngine.recordImproveFailure()` メソッドを追加
- `SkillCreateWizard` / `SkillLifecyclePanel` の structured error 表示対応

#### 検証

- 69 テスト PASS

---

### タスク: UT-SDK-L34-UI-DISPLAY-001 SkillLifecyclePanel Layer別グルーピング（2026-04-04）

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-SDK-L34-UI-DISPLAY-001                         |
| ステータス | **完了**                                          |
| タイプ     | implementation                                    |
| 優先度     | 中                                                |
| 完了日     | 2026-04-04                                        |

#### 実施内容

- `SkillLifecyclePanel.tsx` で Layer3/4 チェック結果をグループ別アコーディオン・severity アイコン付き表示を実装
- Phase 3 レビュー完了

---

### タスク: UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001 SkillStreamMessage と SkillCreatorSdkEvent の出力型統合（2026-04-04）

| 項目       | 値                                                                             |
| ---------- | ------------------------------------------------------------------------------ |
| タスクID   | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                                |
| ステータス | **完了**                                                                       |
| タイプ     | implementation                                                                 |
| 優先度     | low                                                                            |
| 完了日     | 2026-04-04                                                                     |

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

| 項目       | 値                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-09                                                                                                                                      |
| ステータス | **完了**                                                                                                                                        |
| タイプ     | implementation / TDD / governance                                                                                                               |
| 優先度     | 最高                                                                                                                                            |
| 完了日     | 2026-04-06                                                                                                                                      |
| 対象       | `runtime/governance/` サブディレクトリ（`SkillCreatorPermissionPolicy` / `SkillCreatorHooksFactory` / `SkillCreatorAuditSink` / `index.ts`）     |
| 成果物     | `docs/30-workflows/task-p0-09-sdk-permission-hooks-governance/`（Phase 1-13 仕様書 15ファイル）                                                 |

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

### タスク: TASK-UI-03-REMAINING IPC renderer移行完了（2026-04-07）

| 項目       | 値                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-03-REMAINING                                                                                                                                    |
| ステータス | **完了**                                                                                                                                                |
| タイプ     | refactor / IPC-preload-migration / NON_VISUAL                                                                                                          |
| 優先度     | P0                                                                                                                                                      |
| 完了日     | 2026-04-07                                                                                                                                              |
| 対象       | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`、`apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` |
| 成果物     | `docs/30-workflows/task-ui-03-ipc-renderer-migration/`（Phase 1-13 仕様書・Phase 12 6成果物）                                                          |
| 関連Issue  | #1940                                                                                                                                                   |

#### 実施内容

- `ImprovementProposalPanel.tsx`: `window.electronAPI.skillCreator.applyRuntimeImprovement` → `window.skillCreatorAPI.applyRuntimeImprovement` へ移行
- `GovernanceSummaryPanel.tsx`: `window.electronAPI.skillCreator.getGovernanceState` → `window.skillCreatorAPI.getGovernanceState` へ移行
- `useStreamingProgress.ts`: `SKILL_CREATOR_PROGRESS` IPC リスナーに useEffect cleanup を追加（メモリリーク防止）
- IPC canonical API として `window.skillCreatorAPI` を正本化。`window.electronAPI.skillCreator` は preload 互換シムとして残存
- variadic IPC イベント対応（L-IPC-VARIADIC-001）：snapshot + errorMessage の同一イベント配信を実現
- Phase 12: 実装ガイド（中学生レベル説明含む）・仕様更新サマリ・変更履歴・未タスク検出・スキルフィードバック・準拠確認 の 6 成果物を生成

#### 検証証跡

- `pnpm --filter @repo/desktop typecheck`: PASS（EXIT:0）
- `pnpm --filter @repo/desktop lint`: PASS
- 関連テスト（GovernanceSummaryPanel.test.tsx / ImprovementProposalPanel.test.tsx / SkillCreateWizard.test.tsx）: PASS
- Phase 11: NON_VISUAL（renderer は API 参照先のみ移行、自動テスト代替 PASS）
- `artifacts.json` と `outputs/artifacts.json` parity: 完全一致

---

### タスク: TASK-P0-09-U1 path-scoped-governance-runtime-enforcement（2026-04-07）

| 項目       | 値                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-P0-09-U1                                                                                                                                   |
| ステータス | **完了**                                                                                                                                        |
| タイプ     | implementation / TDD / security                                                                                                                 |
| 優先度     | 最高                                                                                                                                            |
| 完了日     | 2026-04-07                                                                                                                                      |
| 対象       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                                           |
| 成果物     | `docs/30-workflows/task-p0-09-u1-path-scoped-governance-runtime-enforcement/`（Phase 1-12 仕様書・テスト）                                     |

#### 実施内容

- `extractTargetPath(input)` private helper を追加（`file_path ?? path` fallback パターン）
- `createExecuteGovernanceCanUseTool(skillRoot)` のシグネチャを修正し、`targetPath` / `allowedSkillRoot` context を `evaluateGovernanceToolUse` に渡す配線を接続
- `createImproveGovernanceCanUseTool(skillRoot)` を新規追加（improve phase 対応）
- `_executeInternal()` 呼び出しで `this.getExplicitSkillCreatorRoot() ?? ""` を渡すよう修正
- `SkillCreatorPermissionPolicy.ts` の `TODO(TASK-P0-09-U1)` コメントを解消
- `RuntimeSkillCreatorExecuteErrorResponse` 型を shared に追加

#### 検証証跡

- TDD: TC-PATH-01〜06（path-scoped deny/allow）+ extractTargetPath 4件 = 11件追加
- 合計 101 tests PASS（`path-scoped-enforcement.test.ts` 含む）
- typecheck: EXIT:0 ✅
- Phase 11: NON_VISUAL（Main プロセス非 UI コンポーネント、自動テスト代替 PASS）

#### 苦戦箇所

- **SDK callback input キー名の揺れ**: SDK が `file_path` と `path` の両方を使用するケースがあり、`extractTargetPath()` で `file_path ?? path` の fallback 順序で吸収
- **判定ロジック層と配線層の責任分離**: `SkillCreatorPermissionPolicy` は変更禁止（判定ロジック层）、`RuntimeSkillCreatorFacade` のみ変更（配線層）という設計原則を維持
- **improve() が SDK callback を経由しない設計**: `applyImprovement()` 内での明示的呼び出しが必要だが、未タスク TASK-P0-09-U1-A として carry-forward
- **governance hooks と phase 追加時の統一性**: phase 追加時のチェックリスト明示化が未対応（TASK-P0-09-U1-B / C）

#### 派生未タスク

| 未タスクID         | 内容                                              | 優先度 |
| ------------------ | ------------------------------------------------- | ------ |
| TASK-P0-09-U1-A    | improve() canUseTool 配線（SDK callback 経由化）  | 中     |
| TASK-P0-09-U1-B    | renderer UI への governance 結果表示              | 中     |
| TASK-P0-09-U1-C    | audit 永続化（ring buffer → ストレージ）          | 低     |

---

### タスク: TASK-UI-04 仕様書ステータス乖離修正（Spec Status Drift Correction）（2026-04-07）

| 項目       | 値                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-04                                                                                                                                      |
| ステータス | **完了（Phase 12 close-out）**                                                                                                                  |
| タイプ     | maintenance / docs-only / 品質管理                                                                                                              |
| 優先度     | P0（最高）                                                                                                                                      |
| 完了日     | 2026-04-07                                                                                                                                      |
| 対象       | タスク仕様書群の artifacts.json / index.md ステータスフィールド（8件のタスク仕様書のステータス乖離修正）                                        |
| 成果物     | `docs/30-workflows/completed-tasks/step-13-seq-task-ui-04-spec-status-drift-correction/`                                                        |
| 関連Issue  | #1941                                                                                                                                           |
| 依存タスク | TASK-UI-01, TASK-UI-02, TASK-UI-03                                                                                                              |

#### 実施内容

- TASK-P0-01 〜 TASK-P0-09 の 8 件タスク仕様書において、artifacts.json / index.md の status フィールドが実装完了状態と乖離していた問題を是正
- 各タスクの artifacts.json の status を `spec_created` / `in_progress` → `phase12_completed` に更新
- 各タスクの index.md のステータスフィールドを実装状態と一致するよう更新
- completed-tasks/ ディレクトリへの未移動タスク仕様書の移動（TASK-UI-04 自身を含む）
- skill-creator-agent-sdk-lane の executor-guide.md / index.md のステータス整合を確認・更新

#### 検証証跡

- Phase 1: ステータス抽出マップ・乖離インベントリ作成 PASS（`outputs/phase-1/`）
- Phase 2: 修正計画作成 PASS（`outputs/phase-2/correction-plan.md`）
- Phase 3: 設計レビューゲート PASS（`outputs/phase-3/design-review-gate.md`）
- Phase 4-9: テストマトリクス・実装記録・QA レポート PASS（`outputs/phase-4/` 〜 `outputs/phase-9/`）
- Phase 10: 最終レビュー PASS（`outputs/phase-10/final-review-result.md`）
- Phase 11: 手動テスト PASS（`outputs/phase-11/manual-test-result.md`）、NON_VISUAL（docs-only タスク）
- Phase 12: スキルフィードバック・未タスク検出・準拠チェック PASS（`outputs/phase-12/`）

---

### タスク: TASK-UI-04 仕様書ステータス乖離修正（2026-04-07）

| 項目       | 値                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-04                                                                                                                |
| ステータス | **phase12_completed**（Phase 13 未実施）                                                                                  |
| タイプ     | docs-only / メンテナンス / 品質管理                                                                                       |
| 優先度     | P0                                                                                                                        |
| 完了日     | 2026-04-07                                                                                                                |
| 対象       | P0 是正タスク群（TASK-P0-01〜TASK-P0-09）の artifacts.json / index.md ステータスフィールド                               |
| 成果物     | `docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction/`（Phase 1-12 仕様書 + 6 Phase 12 outputs）       |

#### 実施内容

- **乖離検出**: P0 タスク群 8 件でコード実装完了済みにもかかわらず仕様書ステータスが `spec_created` / `in_progress` のまま放置されていることを確認
- **artifacts.json 正規化**: 8 タスク全ての `artifacts.json` status を標準値 `completed` に統一（非標準値 `phase_12_completed` も是正）
- **index.md 更新**: 8 タスクの `index.md` ステータスフィールドを実装状態と一致させる
- **skill-creator-agent-sdk-lane リンク修正**: `index.md` の P0 タスクリンク 5 件を旧相対パスから `../completed-tasks/` prefix に修正、✅ completed 追記
- **executor-guide.md 更新**: P0 全 9 タスクの完了状態テーブルを新規追加（タスクID / ステータス / 実装内容 / 仕様書パス）
- **Phase 12 成果物**: `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` の 6 ファイルを作成

#### skill-feedback-report 提案（2件）

1. **task-specification-creator 向け**: `complete-phase.js` 実行を Phase 完了チェックリストの「必須項目」に昇格させる（現在は任意実行であり、今回の乖離の主因）
2. **aiworkflow-requirements 向け**: executor-guide.md に「タスク完了時のアクション」セクションを追加（artifacts.json 更新 / executor-guide 状態テーブル更新 を必須記載）

#### 検証証跡

- 対象: 17 ファイル更新（docs-only / コード変更なし）
- `verify-unassigned-links`: ALL_LINKS_EXIST 確認
- `audit --diff-from HEAD`: current=0 確認
- Phase 11: 手動テスト（docs-only タスクのため UI 確認なし）

---

### タスク: UT-SDK-07-APPROVAL-REQUEST-SURFACE-001（2026-04-06）

| 項目       | 値                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001                                                                                                                  |
| ステータス | **完了**                                                                                                                                                |
| タイプ     | ui-task / IPC surface 追加                                                                                                                              |
| 優先度     | 高                                                                                                                                                      |
| 完了日     | 2026-04-06                                                                                                                                              |
| 発生元     | TASK-SDK-07 Phase 12 再監査 / Issue #1683                                                                                                               |
| 対象       | `apps/desktop/src/preload/skill-creator-api.ts`、`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                   |
| 成果物     | `docs/30-workflows/ut-sdk-07-approval-request-surface-001/`（Phase 1-12 仕様書・テスト）                                                               |

#### 実施内容

- `SkillCreatorAPI` interface に `onApprovalRequest(callback: (request: ApprovalRequest) => void): () => void` を追加
- `safeOn(APPROVAL_CHANNELS.APPROVAL_REQUEST, callback)` パターンで実装（`onDisclosureInfo` と同パターン）
- `SkillLifecyclePanel.tsx` に `pendingApproval` state・`ApprovalSheet` 条件レンダリング・`handleApprove`/`handleReject`・useEffect cleanup を追加
- TC-APPR-01〜18 テスト 19 件追加、全件 PASS

#### 検証証跡

- vitest 19/19 PASS（TC-APPR-01〜18 + fixture setup）
- `pnpm typecheck` EXIT:0 ✅
- `pnpm lint` EXIT:0（errors 0）✅
- IPC 契約対称性確認済み（APPROVAL_CHANNELS.APPROVAL_REQUEST）
- Phase 11: Visual 4件 CAPTURE_BLOCKED（worktree 環境制約）、NonVisual 3件 PASS(unit)
- CAPTURE_BLOCKED 未タスク: `docs/30-workflows/unassigned-task/ut-sdk-07-approval-request-surface-001-phase11-screenshot.md`
- [Workspace](./task-workflow-completed-workspace.md)
