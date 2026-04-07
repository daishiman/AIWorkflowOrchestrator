# 完了タスク記録 — 2026-03-22〜2026-03-26（後半）
> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

## 完了タスク

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
| UT-HEALTH-POLICY-RUNTIME-INJECTION-001  | RuntimePolicyResolver の HealthPolicy 注入元実装                  | 高     | `docs/30-workflows/unassigned-task/UT-HEALTH-POLICY-RUNTIME-INJECTION-001.md`  |
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

