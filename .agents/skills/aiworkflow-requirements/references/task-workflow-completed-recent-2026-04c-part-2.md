# 完了タスク記録 — 2026-04-04〜2026-04-06（後半） — part-2

> 分割元: task-workflow-completed-recent-2026-04c.md
> 範囲: TASK-SDK-04 user-interaction-bridge-and-phase-ui（2026-03-27） 〜 UT-SKILL-WIZARD-W1-par-02d SkillLifecyclePanel ウィザード遷移ボタン化（2026-04-08）

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
