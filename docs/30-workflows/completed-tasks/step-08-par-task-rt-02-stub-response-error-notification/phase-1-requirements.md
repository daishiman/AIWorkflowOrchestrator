# Phase 1: 要件定義

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 1                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |
| 更新日 | 2026-04-04                       |

## 目的

false-success が発生する実装点と、最小変更で直せる公開契約を固定する。
**（2026-04-04 更新）** 現行コード調査により execute まで含めて実装状況を確定し、current facts を同期する。

## 実行タスク

- plan / improve の degraded 実装事実を確定する → **確定済み（実装済み）**
- execute の責務を「実行防止」に限定する → **実装済み**
- explicit error union の要件を定義する → **実装済み**
- IPC / renderer の境界条件を定義する → **実装済み**
- AC-1〜AC-7 と実装ポイントの対応を固定する → **完了**

## 参照資料

| 資料名           | パス                                                                  | 説明                                 |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------ |
| lane 要件草案    | `../skill-creator-agent-sdk-lane/requirements-draft.md`               | 親レーンの runtime / UI 要件         |
| 親 workflow pack | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md`         | lane 共通不変条件                    |
| Facade           | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 実装済み箇所・execute guard 追加済み |
| IPC handler      | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | outer IpcResult の運搬契約           |
| 共有型           | `packages/shared/src/types/skillCreator.ts`                           | 実装済み union / error response      |

## 実装状況調査（2026-04-04 コード調査）

### 実装済み

| コンポーネント                         | 実装内容                                                                                     | 参照行                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `RuntimeSkillCreatorDegradedReason`    | `"llm_adapter_unavailable" \| "resource_loader_unavailable"` の union type（shared）         | skillCreator.ts:744                                          |
| `RuntimeSkillCreatorPlanErrorResponse` | `{ success: false; error: { code, message } }` 型定義（shared）                              | skillCreator.ts:751                                          |
| `RuntimeSkillCreatorPlanResponse`      | `PlanResult \| PlanErrorResponse \| terminal_handoff` union（shared）                        | skillCreator.ts:789                                          |
| `DEGRADED_REASON_MESSAGES`             | reason code → 日本語メッセージマップ（Facade 内）                                            | Facade.ts:1696                                               |
| `buildDegradedError()`                 | reason → `{ success: false, error: { code, message } }` ヘルパー（Facade 内）                | Facade.ts:1706                                               |
| `plan()` 未注入ガード                  | `!this.llmAdapter` → `buildDegradedError("llm_adapter_unavailable")` TASK-RT-02 コメント付き | Facade.ts:814                                                |
| `plan()` 未注入ガード                  | `!this.resourceLoader && !this.hasDynamicResourcePipeline()` → `buildDegradedError(...)`     | Facade.ts:818                                                |
| `improve()` 未注入ガード               | `plan()` と同型の `buildDegradedError()` ガード（TASK-RT-02 コメント付き）                   | Facade.ts:1275                                               |
| `execute()` 未注入ガード               | `_executeInternal()` の integrated_api 経路で `!this.llmAdapter` → explicit error            | Facade.ts:1056                                               |
| `execute()` 監査終了                   | early return 時も `governanceHooks.onSessionEnd()` を呼び出す                                | Facade.ts:1068                                               |
| `stub-elimination.test.ts`             | execute guard の回帰テストを追加                                                             | `RuntimeSkillCreatorFacade.stub-elimination.test.ts`         |
| `isRuntimePlanErrorResponse()`         | plan error response の type guard（SkillLifecyclePanel 内）                                  | `SkillLifecyclePanel.tsx`:241                                |
| UI plan エラー表示                     | `SkillLifecyclePanel.tsx` / `SkillCreateWizard.tsx` で `plan()` の logical error を表示      | `SkillLifecyclePanel.tsx`:1187 / `SkillCreateWizard.tsx`:254 |
| UI execute エラー表示                  | `SkillLifecyclePanel.tsx` で `execute()` の `success:false` を表示                           | `SkillLifecyclePanel.tsx`:1309                               |

## 実行手順

### ステップ1: current facts の再確定（2026-04-04 時点）

- `plan()` には `llmAdapter` / `resourceLoader` 不足時の explicit error が実装済み
- `improve()` には degraded 条件で `buildDegradedError()` が実装済み
- `execute()` には `_executeInternal()` 内の LLM 未注入ガードが実装済み
- `RuntimeSkillCreatorImproveErrorResponse` は既存で存在、`PlanErrorResponse` も追加済み
- SkillLifecyclePanel は plan / execute 両方のエラー表示を実装済み、SkillCreateWizard は plan エラー表示を実装済み
- `RuntimeSkillCreatorFacade.stub-elimination.test.ts` は作成済みで、execute guard の回帰を固定している

### ステップ2: 残タスクの定義

| 残タスク | 対象メソッド/ファイル | 内容 |
| -------- | --------------------- | ---- |
| なし     | -                     | -    |

### ステップ3: 影響範囲の再確認（変更不要な箇所）

| 層           | ファイル                                          | 変更内容                                          |
| ------------ | ------------------------------------------------- | ------------------------------------------------- |
| shared types | `packages/shared/src/types/skillCreator.ts`       | **変更不要**（型定義済み）                        |
| main facade  | `RuntimeSkillCreatorFacade.ts`                    | `_executeInternal()` に guard 追加済み            |
| main ipc     | `creatorHandlers.ts`                              | **変更不要**                                      |
| renderer     | `SkillLifecyclePanel.tsx / SkillCreateWizard.tsx` | **変更不要**（plan エラー表示は両導線で実装済み） |

## 統合テスト連携

- Phase 4 で T-01・T-02 のテストケースを定義する
- Phase 5 で `_executeInternal()` guard の実装を行う
- Phase 7 で stub-elimination テストの coverage を確認する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| アーキテクチャ     | 必須     | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信            | 必須     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 必須     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 必須     | `aiworkflow-requirements: ui-ux-*.md`                  |

## 成果物

| 成果物         | パス                                     | 説明                     |
| -------------- | ---------------------------------------- | ------------------------ |
| 要件定義書     | `phase-1-requirements.md`                | current facts と契約要件 |
| 要件抽出マップ | `outputs/phase-1/spec-extraction-map.md` | AC と実装ポイントの対応  |

## 完了条件

- [x] false-success の発火点が `plan` / `improve` に限定されている
- [x] execute の責務が「invalid plan 防止」に整理されている（実装済み）
- [x] explicit error union の要件が定義されている（実装済み）
- [x] IPC / renderer 影響範囲が明記されている
- [x] AC-1〜AC-7 への写像が確認されている
- [x] 残課題（T-01・T-02）は Phase 5 で実装完了
- [x] **本Phase内の全タスクを100%実行完了**
