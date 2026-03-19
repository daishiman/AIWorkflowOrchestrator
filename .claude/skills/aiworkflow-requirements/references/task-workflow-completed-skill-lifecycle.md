# タスク実行仕様書生成ガイド / completed records (skill lifecycle)

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records
> 分割元: `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`（500行超のため分割）
> 対象タスク: TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001, TASK-SKILL-LIFECYCLE-02, TASK-SKILL-LIFECYCLE-04, TASK-SKILL-LIFECYCLE-05, TASK-SKILL-LIFECYCLE-06, TASK-SKILL-LIFECYCLE-08, UT-06-003, UT-06-005, UT-06-005-A, UT-06-001
> 分割先: TASK-10A-C, TASK-10A-D → [`task-workflow-completed-skill-create-ui-integration.md`](task-workflow-completed-skill-create-ui-integration.md)

## TASK-SKILL-LIFECYCLE-02: SkillCenterView CTA ルーティング 完了記録（2026-03-18）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-02 |
| 対象workflow | `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-02-skillcenter-create-route/` |
| ステータス | completed（Phase 1-12） |
| テスト | `useSkillCenter.navigation` / `SkillCenterView.cta` / `skillLifecycleJourney` PASS |
| 画面証跡 | CLI環境のため自動テスト結果で代替検証 |

### 実装内容

| 観点 | 内容 |
| --- | --- |
| CTA ヘッダー | `SkillCenterView` ヘッダーに「+ 新規作成」ボタン追加（`data-testid="header-create-cta"`） |
| CTA JourneyPanel | `SkillLifecycleJourneyPanel` に3ジョブ別 CTA ボタン追加（create/use/improve） |
| ナビゲーション | `useSkillCenter` に `navigateToSkillCreate` / `navigateToWorkspace` / `navigateToSkillAnalysis` 追加 |
| 型拡張 | `SkillLifecycleJobGuide` に `ctaLabel?: string` フィールド追加 |
| スタイル | `viewStyles` に `headerRow` / `headerCta` / `journeyCardCta` 追加 |

### 検証証跡

| 区分 | コマンド / 証跡 | 結果 |
| --- | --- | --- |
| unit test | `pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/ src/renderer/navigation/skillLifecycleJourney.test.ts` | 34テスト PASS |
| coverage | Line 80%+ / Branch 60%+ | PASS |

### 苦戦箇所と再発防止

| 苦戦箇所 | 解決策 | 再利用ルール |
| --- | --- | --- |
| P31 対策: Zustand Hook 無限ループ | `useAppStore((state) => state.setCurrentView)` 個別セレクタ使用 | 合成Hook ではなく個別セレクタで action を取得する |
| P39 対策: happy-dom + userEvent | `fireEvent` を使用し `await act()` で非同期ハンドラを包む | happy-dom 環境では `userEvent` 禁止 |

### Phase 12 未タスク（1件）

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| TASK-IMP-SKILLCENTER-HEADER-CTA-RESPONSIVE-001 | ヘッダー CTA テキストのレスポンシブ対応（`hidden md:inline`） | LOW | `docs/30-workflows/unassigned-task/task-imp-skillcenter-header-cta-responsive-001.md` |

---

## TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001: WorkspaceChatPanel AI Runtime 同期 完了記録（2026-03-18）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 対象workflow | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment/` |
| ステータス | completed（Phase 1-12） |
| 完了日 | 2026-03-18 |
| 機能 | WorkspaceChatPanel の AI runtime 同期・P62三層防御・GuidanceBlock 統合 |

### 実装内容

| 観点 | 内容 |
| --- | --- |
| P62三層防御 | UI canSend / Controller guard / Main validation の3層で DEFAULT_CONFIG fallback を排除 |
| GuidanceBlock | blocked/error/handoff の3 variant を実装し、provider 未設定・streaming エラー・キャンセル後の誘導を統合 |
| 状態遷移 | idle → sending → streaming → completed/cancelled/error を `useWorkspaceChatController` で一元管理 |
| streaming キャンセル | `cancelStream → AbortController.abort() → streamContent クリア` で llm-streaming キャンセルフローに準拠 |
| runtime 同期 | Main Chat / Settings と同じ AI runtime セレクタ（provider/model）を WorkspaceChatPanel に接続 |

### 検証証跡

| 検証項目 | 結果 |
| --- | --- |
| TypeCheck | PASS |
| Unit tests | PASS |
| Phase 10 最終レビュー | PASS |

### Phase 12 未タスク（3件）

| 未タスクID | 概要 | 優先度 |
| --- | --- | --- |
| UT-INTEGRATE-ACCESS-CAPABILITY-RESOLVER-WORKSPACE-001 | AccessCapabilityResolver による Workspace 機能制御統合 | 高 |
| UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001 | useWorkspaceChatController 640行リファクタリング（責務分割） | 中 |
| UT-INTEGRATE-COMPACT-LAYOUT-WORKSPACE-CHAT-001 | CompactLayout との WorkspaceChatPanel 統合 | 低 |

---
> 対象タスク: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001, TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001, TASK-10A-C, TASK-10A-D, TASK-SKILL-LIFECYCLE-04, TASK-SKILL-LIFECYCLE-05, TASK-SKILL-LIFECYCLE-06, TASK-SKILL-LIFECYCLE-08
> 分割先: [task-workflow-completed-ut-06-safety-gate.md](task-workflow-completed-ut-06-safety-gate.md)（UT-06-001, UT-06-003, UT-06-005）
## TASK-IMP-CHATPANEL-REAL-AI-CHAT-001: ChatPanel Real AI Chat 配線 設計完了記録（2026-03-18）
| タスクID | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 対象workflow | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring/` |
| ステータス | spec_created（設計タスク、Phase 1-13 設計完了） |
| タスク種別 | 設計（プロダクションコードの実装は行わない） |
| 作成日 | 2026-03-13 |
| 設計完了日 | 2026-03-18 |
### 実装内容（設計成果物）
| chatSlice 拡張 | `ChatPanelStatus`（8状態: idle/ready/streaming/cancelled/completed/error/blocked/handoff）、`AccessCapability`（4値: integratedRuntime/terminalSurface/both/none）、ストリーミング関連ステート/アクション |
| 個別セレクタ12個 | `useChatPanelStatus`, `useResolvedCapability`, `useChatMessages`, `useChatInput`, `useSetChatInput`, `useSelectedProviderId`, `useSelectedModelId`, `useProviders`, `useHandoffGuidance`, `useIsStreaming`, `useSetChatPanelStatus`, `useResetChat` |
| ChatPanel 全面書換 | 3 placeholder 置換（message-list-slot, chat-input-slot, model-selector-slot）、useStreamingChat 接続、8 状態条件レンダリング |
| 新規コンポーネント10個 | RuntimeBanner(atom), ChatMessage(atom), ChatMessageList(molecule), ErrorGuidance(molecule), HandoffBlock(molecule), PersistentTerminalLauncher(atom), ComposerInput(atom), SendButton(atom), ComposerArea(molecule), LLMSelectorPanel(molecule) |
| Store 統一 | useStreamingChat 内の `useStore()` を `useAppStore()` に統一する方針を確定 |
| P62 対策 | Provider/Model 未選択時は `blocked` 状態に遷移し、暗黙 fallback を行わない |
### システム仕様書更新
| 更新ファイル | 更新内容 |
| `arch-state-management-core.md` | chatSlice 拡張セクション追加（ChatPanelStatus/AccessCapability 型定義、個別セレクタ12個、状態遷移図） |
| `ui-ux-feature-components-core.md` | 収録機能一覧にエントリ追加、ChatPanel コンポーネント階層・Atomic Design 分類・Props 設計・8状態レンダリングマトリクス・アクセシビリティ・キーボード操作のセクション追加 |
| `task-workflow-completed-skill-lifecycle.md` | 本記録の追加 |
### 関連タスク
| タスクID | 内容 | ステータス |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 | Main Chat/Settings AI runtime 同期（前提タスク） | 完了（2026-03-17） |
| TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 | AI Runtime/AuthMode Unification（親ワークフロー step-01） | 完了 |

## TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001: ViewType/renderView 基盤拡張 完了記録（2026-03-17）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 |
| 対象workflow | `docs/30-workflows/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/` |
| ステータス | completed（Phase 1-12） |
| テスト | `App.renderView.viewtype` / `skillLifecycleJourney` / `types` の targeted suite PASS |
| 画面証跡 | TC-11-01..05 screenshot（advanced route fallback） |

### 実装内容

| 観点 | 内容 |
| --- | --- |
| ViewType 拡張 | `apps/desktop/src/renderer/store/types.ts` に `skillAnalysis` / `skillCreate` を追加 |
| renderView 分岐 | `apps/desktop/src/renderer/App.tsx` に `skillAnalysis` / `skillCreate` case を追加 |
| close 導線 | `SkillAnalysisView` close で `skillCenter` へ戻し `currentSkillName` をクリア |
| 型契約 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` に `onAction?: () => void` を追加 |
| alias 正規化 | `normalizeSkillLifecycleView("skill-center") -> "skillCenter"` を維持 |

### 検証証跡

| 区分 | コマンド / 証跡 | 結果 |
| --- | --- | --- |
| unit test | `pnpm --filter @repo/desktop exec vitest run src/renderer/__tests__/App.renderView.viewtype.test.tsx src/renderer/navigation/skillLifecycleJourney.test.ts src/renderer/store/types.test.ts` | PASS |
| screenshot | `node apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs` | PASS（TC-11-01..05） |
| coverage | `validate-phase11-screenshot-coverage --workflow .../step-01-seq-task-01-viewtype-renderView-foundation` | PASS（expected=5 / covered=5） |
| guide validator | `validate-phase12-implementation-guide --workflow .../step-01-seq-task-01-viewtype-renderView-foundation` | PASS |

### 苦戦箇所と再発防止

| 苦戦箇所 | 解決策 | 再利用ルール |
| --- | --- | --- |
| `currentView` 注入で direct 到達が不安定 | screenshot は `advanced route fallback` に寄せ、分岐保証は unit test へ分離 | 「到達保証」と「分岐保証」を別コマンドで固定する |
| Phase 12 出力名揺れ | `unassigned-task-detection.md` を正本化し、`unassigned-task-report.md` は互換リンク化 | changelog / detection / summary の件数を同値で管理する |
| P40 再発: dynamic import の Vite alias 解決失敗 | モノレポルートではなく `cd apps/desktop` からテスト実行する | `pnpm --filter @repo/desktop exec vitest run` を標準コマンドとする |
| コンテキスト圧縮リカバリ | `git diff --stat HEAD` + `Glob` で完了判定 | エージェント作業の中断復帰時は差分から未完了成果物を特定する |
| ViewType union 拡張パターン | カテゴリコメント付き整理で見通し確保、`Record<ViewType, Config>` 不使用が安全 | union 拡張時は `types.ts` + `renderView()` を同一ターンで更新する |

### Phase 12 未タスク（1件）

| 未タスクID | 概要 | 優先度 | タスク仕様書 |
| --- | --- | --- | --- |
| UT-IMP-SKILL-LIFECYCLE-ROUTING-DIRECT-RENDERVIEW-CAPTURE-GUARD-001 | direct `currentView` 注入経路の screenshot 不安定性を guard 化 | 中 | `docs/30-workflows/unassigned-task/task-imp-skill-lifecycle-routing-direct-renderview-capture-guard-001.md` |

---

## UT-06-003: DefaultSafetyGate 具象クラス実装完了記録（2026-03-16）

### タスク概要

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-06-003                                                                  |
| 機能         | SafetyGatePort 具象クラス DefaultSafetyGate の Main Process 実装            |
| 実施日       | 2026-03-16                                                                 |
| ステータス   | completed（Phase 1-12）                                                    |
| ワークフロー | `docs/30-workflows/safety-gate-implementation/`                            |
| テスト       | 36 tests PASS（カバレッジ全100%）                                          |

### 実装内容

1. **DefaultSafetyGate**: SafetyGatePort の具象クラスとして5つのセキュリティチェック（critical/high/no-approval/all-low/protected-path）+ グレード集約ロジックを実装
2. **IPC ハンドラ**: `skill:evaluate-safety` チャンネルを追加し、Renderer から SafetyGate 評価を呼び出し可能に
3. **型定義拡充**: `packages/shared/src/types/safety-gate.ts` に SafetyGrade / SafetyGateResult / SafetyCheckId 等の実装型を追加

### 成果物

| ファイル | 内容 |
| --- | --- |
| `packages/shared/src/types/safety-gate.ts` | SafetyGate 関連型定義 |
| `apps/desktop/src/main/permissions/default-safety-gate.ts` | DefaultSafetyGate 具象クラス |
| `apps/desktop/src/main/ipc/safetyGateHandlers.ts` | IPC ハンドラ（skill:evaluate-safety） |

### 検証証跡

| 検証項目 | 結果 |
| --- | --- |
| テスト | 36テスト全PASS |
| Line Coverage | 100% |
| Branch Coverage | 100% |
| Function Coverage | 100% |

---

## UT-06-005: abort/skip/retry/timeout Permission Fallback 実装完了記録（2026-03-16）

### タスク概要

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-06-005                                                                  |
| 機能         | SkillExecutor の Permission 拒否時 fallback 制御（abort/skip/retry/timeout） |
| 実施日       | 2026-03-16                                                                 |
| ステータス   | completed（Phase 1-12）                                                    |
| ワークフロー | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/`                   |
| テスト       | 23 tests PASS（SkillExecutor.fallback.test.ts）                            |

### 苦戦箇所

| ID     | 内容                                                | 解決策                                                    |
| ------ | --------------------------------------------------- | --------------------------------------------------------- |
| S-PF-1 | 既実装コードの4ステップ abort フロー発見遅延         | Phase 1 で git log + grep で既存実装有無を確認する         |
| S-PF-2 | revokeSessionEntries スタブ実装の設計判断             | UT-06-005-B として未タスク化、Phase 2 に判断根拠記録       |
| S-PF-3 | PERMISSION_MAX_RETRIES デッドコードと Set メモリリーク | 定数参照統一 + セッション単位 clear 機構追加               |

### 派生未タスク（3件）

| タスクID    | 内容                                  | 優先度 |
| ----------- | ------------------------------------- | ------ |
| UT-06-005-A | PreToolUse Hook への fallback 統合    | 高     |
| UT-06-005-B | revokeSessionEntries セッション別実装 | 中     |
| UT-06-005-C | SkillStreamMessageType abort/skip 追加 | 中    |

### 検証証跡

- Phase 12 全 Task PASS（phase12-task-spec-compliance-check.md）
- 未タスク 3件検出、3ステップ完了（指示書 + backlog + 仕様書リンク）
- `workflow-permission-fallback-abort-skip-retry.md` に統合正本を作成

---

## UT-06-005-A: PreToolUse Hook fallback 統合完了記録（2026-03-17）
## TASK-10A-C: SkillCreateWizard 実装完了記録（2026-03-02）

### タスク概要

| 項目         | 内容 |
| ------------ | ---- |
| タスクID     | UT-06-005-A |
| 機能         | PreToolUse Hook への fallback 実行時統合 + timeout→abort 遷移 |
| 実施日       | 2026-03-17 |
| ステータス   | completed（Phase 1-12） |
| ワークフロー | `docs/30-workflows/UT-06-005-A-hook-fallback-integration/` |

### 実装内容（要点）

1. `createHooks().PreToolUse` が `handlePermissionCheck()` を呼び出す形に変更し、Permission 拒否時に `processPermissionFallback()` を実行時フローへ接続
2. `sendPermissionRequestWithTimeout()` と `PermissionTimeoutError` を追加し、30秒 timeout を `executeAbortFlow("timeout")` へ接続
3. 統合テスト `SkillExecutor.hook-fallback.test.ts` を追加し、reject/timeout/retry/skip/fail-closed を検証

### 参照仕様同期

- `interfaces-agent-sdk-executor-core.md`
- `interfaces-agent-sdk-executor-details.md`
- `security-skill-execution.md`
- `workflow-permission-fallback-abort-skip-retry.md`

---

## TASK-SKILL-LIFECYCLE-04: 採点・評価・受け入れゲート統合 再監査記録（2026-03-14）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-04 |
| 対象workflow | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/` |
| ステータス | in_progress（Phase 1-12 completed / Phase 13 blocked） |
| 主対象 | 採点ゲート契約（`ScoringGate`）・Δスコア表示・評価API契約・仕様同期 |

### 反映内容（再監査）

| 観点 | 内容 |
| --- | --- |
| 実装不整合是正 | `SkillAnalysisView` → `ScoreDisplay` の `previousAnalysis` 受け渡し漏れを修正し、Δバッジ表示を復旧 |
| 画面検証 | Playwright harness `capture-task-skill-lifecycle-04-phase11.mjs` を追加し、TC-11-01〜04 の実画面証跡を再取得 |
| 仕様同期 | `interfaces-agent-sdk-skill-details.md`（採点ゲート/評価API契約）、`arch-state-management-details.md`（`previousAnalysis` state）を更新 |
| backlog 同期 | Phase 10 MINOR 2件を `task-workflow-backlog.md` と `docs/30-workflows/unassigned-task/` に登録済み |
| 統合正本 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` を追加し、current canonical set / artifact inventory / legacy path 互換 / same-wave 手順を一元化 |

### 仕様書別SubAgent分担（関心分離）

| SubAgent | 担当仕様書 / 生成物 | 主担当作業 |
| --- | --- | --- |
| A | `interfaces-agent-sdk-skill-details.md` | `ScoringGate` / `ScoringGateResult` / `evaluatePrompt` 契約同期 |
| B | `arch-state-management-details.md` | `previousAnalysis` snapshot state と action の責務同期 |
| C | `ui-ux-feature-components-reference.md` | SkillAnalysisView 節の現行実装追補（Store駆動 + Δ表示 + 証跡） |
| D | `task-workflow-backlog.md`, `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md`, `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md` | MINOR由来未タスクの台帳化 |
| Lead | `task-workflow-completed-*.md`, `indexes/topic-map.md`, `indexes/keywords.json` | 完了記録固定、index再生成、最終検証統合 |

### 検証証跡

| 検証項目 | コマンド | 結果 |
| --- | --- | --- |
| workflow 構造検証 | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate` | PASS（13/13） |
| workflow phase 検証 | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate` | PASS（28項目） |
| Phase 11 coverage | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate --json` | PASS（expected 4 / covered 4） |
| Phase 12 implementation guide | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate --json` | PASS（10/10） |
| 未タスクリンク整合 | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` | PASS（229/229, missing=0） |
| 未タスク差分監査 | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | PASS（current=0, baseline=134） |
| 画面/ロジックUT | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/scoring-gate.test.ts src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx src/renderer/components/skill/__tests__/useSkillAnalysis-gate.test.ts` | PASS（63/63） |
| 型検証 | `pnpm --filter @repo/desktop exec tsc -p tsconfig.json --noEmit` | PASS |

### 苦戦箇所と解決策

| 苦戦箇所 | 再発条件 | 解決策 |
| --- | --- | --- |
| Δ表示ロジックがテストPASSでも実画面に出ない | Hook戻り値を子コンポーネントに渡し忘れる | `SkillAnalysisView` の props 配線を修正し、Phase 11 で実画面再撮影して回帰確認 |
| 旧仕様の文言が現行実装を上書きする | TASK-10A-B 時点の説明を更新せず追記だけで運用する | UI仕様書に「初期実装」と「現行実装」の2層表記を導入 |
| docs-only検証で画面品質の証跡が薄くなる | CLI検証だけで完了判定する | harness 追加 + screenshot coverage validator を Phase 11 完了条件へ固定 |

### 同種課題の簡潔解決手順（5ステップ）

1. 実装差分は「テスト結果」ではなく「画面証跡 + セレクタ配線」で最終確認する。
2. workflow 仕様（Phase）と system spec（references）を同一ターンで更新する。
3. MINOR 指摘は Phase 12 で必ず未タスク化し、backlog と指示書を同時に生成する。
4. index 再生成（`generate-index.js`）を最後に実行し、`topic-map` / `keywords` の検索導線を更新する。
5. `current` と `baseline`（既存負債）を分離して監査結果を記録する。

### 関連未タスク（active）

| タスクID | 内容 | 優先度 | 指示書 |
| --- | --- | --- | --- |
| TASK-FIX-EVAL-STORE-DISPATCH-001 | `handleEvaluatePrompt` の Store 経由化 | 低 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-eval-store-dispatch-001.md` |
| TASK-FIX-SCORE-DELTA-DEDUP-001 | `calculateScoreDelta` の重複解消 | 低 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/unassigned-task/task-fix-score-delta-dedup-001.md` |

### Phase 12 指定ディレクトリ再確認（2026-03-14 追補）

| 観点 | 実施内容 | 結果 |
| --- | --- | --- |
| 未タスク配置 | workflow ローカル `tasks/unassigned-task/` から root `docs/30-workflows/unassigned-task/` へ正規化 | 完了 |
| 仕様同期 | `interfaces-agent-sdk-skill-details.md` / `task-workflow-backlog.md` / 本完了記録 / workflow Phase 12成果物の参照を一括更新 | 完了 |
| 未タスク品質 | 2件を task-spec 9セクション形式へ再作成し、`3.5 実装課題と解決策` を追記 | 完了 |
| 監査 | `verify-unassigned-links` と `audit-unassigned-tasks --diff-from HEAD --target-file` を再実行 | PASS |

#### 追補時の苦戦箇所と解決策

| 苦戦箇所 | 再発条件 | 解決策 |
| --- | --- | --- |
| 未タスク配置先の canonical path が曖昧になり、`--target-file` 境界と衝突する | workflow 配下 `unassigned-task` を一時運用したまま参照更新を後回しにする | root canonical path を先に固定し、関連仕様の参照を同ターンで一括更新する |
| `current`/`baseline` 判定と「指定ディレクトリ配置確認」を同じ意味で扱ってしまう | 監査結果を単一数値で報告する | 配置可否・links可否・audit可否を3軸で分離して記録する |

---

## TASK-SKILL-LIFECYCLE-05: 作成済みスキルを使う主導線（設計タスク）完了記録（2026-03-15）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-05 |
| タスク種別 | design |
| 完了日 | 2026-03-15 |
| Phase完了 | 1-12 完了、13（PR作成）未実施 |
| 成果物数 | 49ファイル（Phase 1-12） |
| テスト | 30テスト全GREEN（cta-visibility.test.ts） |
| 受入基準 | AC-1〜AC-5 全充足 |

実装コード:
- `packages/shared/src/types/cta-visibility.ts`: ScoringGate x CTA 16パターンマトリクス純粋関数
- `packages/shared/src/types/__tests__/cta-visibility.test.ts`: 30テスト
- `packages/shared/src/types/index.ts`: エクスポート追加

Phase 10 ゲート判定: PASS（MAJOR 0件、MINOR 8件→全て未タスク記録済み）
Phase 11 ウォークスルー: 63項目中61 PASS、2 MINOR

---

## TASK-SKILL-LIFECYCLE-05: 作成済みスキル利用導線 再監査記録（2026-03-15）

### タスク概要

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-05 |
| 対象workflow | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/` |
| ステータス | in_progress（Phase 1-12 completed / Phase 13 blocked） |
| 主対象 | 作成済みスキル利用導線（Immediate / Deferred / History）・ScoreGate表示・導線再利用性 |

### 反映内容（再監査）

| 観点 | 内容 |
| --- | --- |
| Phase 11 証跡復旧 | `manual-test-checklist.md` / `manual-test-result.md` / `screenshot-plan.json` を作成し、TC-11-01〜05 の `.png` 証跡を current workflow に再集約 |
| 画面検証 | review board capture（`TC-11-00`）を追加し、source screenshot 5件と合わせて Apple UI/UX 観点の再確認を実施 |
| Phase 12 是正 | implementation guide を Part 1/2 要件に再編し、Part 1「なぜ先行」、Part 2「使用例」「エッジケース」を補強 |
| backlog 同期 | Phase 10/11/12 で露出した follow-up 6件を `task-workflow-backlog.md` と root `unassigned-task/` に登録 |
| 統合正本 | `workflow-skill-lifecycle-created-skill-usage-journey.md` を追加し、仕様抽出マップ・Task04依存契約・5分解決カードを一元化 |

### 仕様書別SubAgent分担（関心分離）

| SubAgent | 担当仕様書 / 生成物 | 主担当作業 |
| --- | --- | --- |
| A | workflow phase docs（Phase 1-13） | stale narrative の補正、完了条件の再同期 |
| B | `outputs/phase-11/*` | screenshot plan / checklist / result / evidence board の整備 |
| C | `outputs/phase-12/implementation-guide.md` | Part 1/2 validator 要件の不足補完 |
| D | `task-workflow-backlog.md`, `docs/30-workflows/unassigned-task/` | 未タスク formalize とリンク同期 |
| Lead | `task-workflow.md`, `lessons-learned-current.md`, `indexes/*`, `LOGS.md`, `.agents` mirror | system spec same-wave 同期と最終検証 |

### 検証証跡

| 検証項目 | コマンド | 結果 |
| --- | --- | --- |
| workflow 構造検証 | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey --json` | PASS（13/13, errors=0, warnings=0） |
| workflow phase 検証 | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey` | PASS（28項目） |
| Phase 11 coverage | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey --json` | PASS（expected 5 / covered 5） |
| Phase 12 implementation guide | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey --json` | PASS（10/10） |
| 未タスクリンク整合 | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md --json` | PASS（229/229, missing=0） |
| 未タスク差分監査 | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | PASS（current=0, baseline=136） |

### 関連未タスク（active）

| タスクID | 内容 | 優先度 | 指示書 |
| --- | --- | --- | --- |
| TASK-IMP-SKILL-LIFECYCLE-05-CTA-INTERACTION-STATES-001 | CTA hover/active/focus-visible 状態定義の追加 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-cta-interaction-states-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-CUSTOMSTORAGE-VALIDATION-GUARD-001 | customStorage 復元時の runtime validation 強化 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-customstorage-validation-guard-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-FAVORITE-SELECTOR-STABILITY-001 | favorite selector の再レンダー安定性検証 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-favorite-selector-stability-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-AMBIGUITY-CRITERIA-CLARIFICATION-001 | テスト合否基準の曖昧表現除去 | 中 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-ambiguity-criteria-clarification-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-EMPTY-STATE-DETAIL-DESIGN-001 | Skill Center Empty State 詳細設計補完 | 低 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-empty-state-detail-design-001.md` |
| TASK-IMP-SKILL-LIFECYCLE-05-E2E-SCENARIOS-COVERAGE-001 | 3シナリオ導線の E2E カバレッジ固定 | 中 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-lifecycle-05-e2e-scenarios-coverage-001.md` |

### 同種課題の簡潔解決手順（5ステップ）

1. 先に `validate-phase11-screenshot-coverage` を通し、欠落成果物（checklist/result/plan/screenshot）を機械的に揃える。
2. `implementation-guide` は Part 1「なぜ先行」→ Part 2「型/API/使用例/エッジケース/設定一覧」の順で埋める。
3. 画面再現が環境依存で詰まる場合は、source screenshot 集約 + review board 1件 + metadata で evidence chain を固定する。
4. Phase 10/11/12 で残った論点は即 `unassigned-task/` に formalize し、backlog と同ターン同期する。
5. 最後に `task-workflow` / `lessons` / `indexes` / `LOGS` / mirror を同一 wave で更新し、再監査 drift を防ぐ。

---

## TASK-SKILL-LIFECYCLE-08: スキル共有・公開・互換性統合（設計タスク）仕様書作成完了記録（2026-03-16）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-08 |
| タスク種別 | design |
| ステータス | spec_created |
| 仕様書作成日 | 2026-03-16 |
| Phase完了 | 1-12 完了、13（PR作成）未実施 |
| 成果物ディレクトリ | `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/` |
| 依存タスク | TASK-SKILL-LIFECYCLE-05, TASK-SKILL-LIFECYCLE-06, TASK-SKILL-LIFECYCLE-07 |

主要設計成果物:
- 公開レベル定義: `SkillVisibility`（local / team / public の3段階）
- バージョン互換性チェック: `CompatibilityCheckResult`、`CompatibilityChecker`
- メタデータ設計: `SkillPublishingMetadata`（semver・公開日・ダウンロード数）
- サービス設計: `SkillRegistryService`、`SkillDistributionService`
- 公開可能性判定: `PublishReadiness`、`PublishReadinessChecker`（13項目チェック）
- 公開判定マトリクス: SkillVisibility × CompatibilityStatus の組合せ設計
- Skill Center フロー: 検索・閲覧・インポート・更新の UI 導線設計

Phase 10 ゲート判定: PASS（MINOR 2件→未タスク記録済み）
Phase 11 ウォークスルー: 実施済み

### 2026-03-17 再監査追補（画面証跡・未タスク同期）

| 観点 | 結果 |
| --- | --- |
| Phase 11 screenshot coverage | PASS（expected 3 / covered 3） |
| Phase 12 implementation guide | PASS（10/10） |
| 画面証跡 | `TC-11-01-skill-publishing-visual-review-board.png`, `TC-11-02-publishing-and-compatibility-focus.png`, `TC-11-03-safety-gate-and-permission-focus.png` |
| 未タスク formalize | `UT-SKILL-LIFECYCLE-08-TYPE-IMPL` / `UT-SKILL-LIFECYCLE-08-IPC-TEST` / `UT-SKILL-LIFECYCLE-08-UI-IMPL` / `UT-SKILL-LIFECYCLE-08-NAMING-FIX` を `docs/30-workflows/unassigned-task/` に作成 |

再監査では「設計タスクでも明示要求がある場合は representative capture を撮影する」運用を適用し、NON_VISUAL 単独判定を採用しない。

---

## TASK-SKILL-LIFECYCLE-06: 信頼・権限ガバナンス（設計タスク）完了記録（2026-03-16）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-SKILL-LIFECYCLE-06 |
| タスク種別 | design |
| ステータス | spec_created |
| 完了日 | 2026-03-16 |
| Phase完了 | 1-12 完了、13（PR作成）未実施 |
| 成果物ディレクトリ | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/` |

主要設計成果物:
- `outputs/phase-2/` : 型定義設計（ToolRiskLevel / AllowedToolEntryV2 / SafetyGatePort / PERMISSION_HISTORY_MAX_ENTRIES）
- `outputs/phase-12/implementation-guide.md` : Part 1（概念説明）/ Part 2（実装詳細）

Phase 10 ゲート判定: PASS
Phase 11 ウォークスルー: 実施済み

未タスク検出: UT-06-001〜UT-06-008（8件）登録済み

> UT-06-001 完了記録は [task-workflow-completed-ut-06-safety-gate.md](task-workflow-completed-ut-06-safety-gate.md) に移動済み
