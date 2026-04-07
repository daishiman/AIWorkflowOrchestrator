# 完了タスク記録 — 2026-03-25〜2026-03-28
> 親ファイル: [task-workflow-completed.md](task-workflow-completed.md)

## 完了タスク

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

