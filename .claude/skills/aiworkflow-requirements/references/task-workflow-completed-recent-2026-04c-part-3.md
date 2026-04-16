# 完了タスク記録 — 2026-04-04〜2026-04-06（後半） — part-3

> 分割元: task-workflow-completed-recent-2026-04c.md
> 範囲: TASK-SDK-06 verify-and-improve-lifecycle-surface（2026-03-27） 〜 TASK-P0-09-U1 path-scoped-governance-runtime-enforcement（2026-04-06）

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
