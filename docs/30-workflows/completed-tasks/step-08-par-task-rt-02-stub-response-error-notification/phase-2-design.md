# Phase 2: 設計

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 2                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |
| 更新日 | 2026-04-04                       |

## 目的

explicit error union を既存契約に最も少ない差分で導入する。
**（2026-04-04 更新）** 実装済み箇所を確認し、`execute()` guard まで含めて current facts を確定する。

## 実行タスク

- plan error union を設計する → **設計済み・実装済み**
- improve degraded path の再利用方針を設計する → **設計済み・実装済み**
- execute 抑止フローを設計する → **UIフィードバック実装済み、Facade guard も実装済み**
- IPC / renderer 境界を設計する → **設計済み・実装済み**

## 参照資料

| 資料名       | パス                                                                  | 説明                 |
| ------------ | --------------------------------------------------------------------- | -------------------- |
| Phase 1 要件 | `phase-1-requirements.md`                                             | 問題点と影響範囲     |
| shared types | `packages/shared/src/types/skillCreator.ts`                           | existing union 契約  |
| Facade       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | degraded 実装        |
| IPC handler  | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | outer IpcResult 境界 |
| renderer     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | type guard 運用箇所  |

## 実行手順

### ステップ1: 型設計（実装済み）

```typescript
// packages/shared/src/types/skillCreator.ts:744
type RuntimeSkillCreatorDegradedReason =
  | "llm_adapter_unavailable"
  | "resource_loader_unavailable";

// skillCreator.ts:751 — 実装済み
interface RuntimeSkillCreatorPlanErrorResponse {
  success: false;
  error: {
    code: RuntimeSkillCreatorDegradedReason | "VALIDATION_ERROR";
    message: string;
  };
}

// skillCreator.ts:789 — 実装済み
type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | RuntimeSkillCreatorPlanErrorResponse
  | { type: "terminal_handoff"; guidance: HandoffGuidance };
```

- `status` 追加は採用しない → **実装済み（正しく守られている）**
- reason code は `error.code` に集約する → **実装済み**
- `RuntimeSkillCreatorImproveErrorResponse` と shape を揃える → **実装済み**

### ステップ2: Facade 設計

#### 実装済み

```typescript
// RuntimeSkillCreatorFacade.ts:1696-1714
const DEGRADED_REASON_MESSAGES: Record<
  RuntimeSkillCreatorDegradedReason,
  string
> = {
  llm_adapter_unavailable:
    "LLM アダプタが利用できません。設定を確認してください。",
  resource_loader_unavailable:
    "リソースローダーが利用できません。設定を確認してください。",
};

function buildDegradedError(reason: RuntimeSkillCreatorDegradedReason) {
  return {
    success: false,
    error: { code: reason, message: DEGRADED_REASON_MESSAGES[reason] },
  };
}

// plan() — Facade.ts:814-820（TASK-RT-02 コメント付き）
if (!this.llmAdapter) {
  return buildDegradedError("llm_adapter_unavailable");
}
if (!this.resourceLoader && !this.hasDynamicResourcePipeline()) {
  return buildDegradedError("resource_loader_unavailable");
}

// improve() — Facade.ts:1275-1280（TASK-RT-02 コメント付き）
// plan() と同型のガード
```

#### `execute()` / `_executeInternal()` guard 実装済み

```typescript
// _executeInternal() への追加設計（Facade.ts:1046 直後）
// terminal_handoff は LLM 不要のため除外済み → ここは integrated_api 経路のみ

// TASK-RT-02: スタブ応答排除 — terminal_handoff は除外済み、ここから integrated_api のみ
if (!this.llmAdapter) {
  const sdkEvents = normalizeSkillCreatorSdkEvents([], sourceProvenance);
  const result: SkillExecuteResult = {
    executeId: `degraded-${Date.now()}`,
    skillName:
      planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed",
    success: false,
    error: DEGRADED_REASON_MESSAGES.llm_adapter_unavailable,
    sdkEvents,
    sourceProvenance,
  };
  this.workflowEngine.recordExecutionFailure(planResult.planId, {
    executeId: result.executeId,
    skillName: result.skillName,
    reason: "execution_error",
    message: result.error ?? "LLM adapter unavailable.",
    sdkEvents,
    sourceProvenance,
  });
  return result;
}
```

**設計上の注意点:**

- `SkillExecuteResult` の `error` フィールドは `string | undefined` なので、`buildDegradedError()` を直接使わず文字列メッセージを返す
- `RuntimeSkillCreatorExecuteResponse` に新型を追加する必要はない（既存型と互換）
- `workflowEngine.recordExecutionFailure()` と `governanceHooks.onSessionEnd()` を呼んでワークフロー状態と監査ログを整合させる

### ステップ3: IPC / renderer 設計（実装済み）

| 層       | 方針                                                                   | 状態                                          |
| -------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| IPC      | outer `success:false` は validation / exception のみ                   | ✅ 実装済み                                   |
| IPC      | logical error は `success:true, data:<error union>` で返す             | ✅ 実装済み                                   |
| renderer | `isRuntimePlanErrorResponse()` を追加する                              | ✅ 実装済み（`SkillLifecyclePanel.tsx`:241）  |
| renderer | plan logical error 時は execute CTA を無効化し、error state を表示する | ✅ 実装済み（`SkillLifecyclePanel.tsx`:1187） |
| renderer | execute `success:false` は `setGenerationError()` で表示する           | ✅ 実装済み（`SkillLifecyclePanel.tsx`:1309） |

- `SkillCreateWizard.tsx` も同じ plan error union を表示する導線。execute 抑止は `SkillLifecyclePanel.tsx` に限定する。

## 統合テスト連携

- Phase 4 で `execute()` guard テストと stub-elimination テストを定義する
- Phase 5 で `_executeInternal()` guard を実装する
- Phase 6 で回帰テストを補強する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                   |
| ------------------ | -------- | -------------------------------------------- |
| アーキテクチャ     | 必須     | `aiworkflow-requirements: architecture-*.md` |
| API設計            | 必須     | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 必須     | `aiworkflow-requirements: error-handling.md` |
| UI/UX              | 必須     | `aiworkflow-requirements: ui-ux-*.md`        |

## 成果物

| 成果物               | パス                                       | 説明                |
| -------------------- | ------------------------------------------ | ------------------- |
| 設計書               | `phase-2-design.md`                        | 契約と責務分解      |
| error union 設計     | `outputs/phase-2/error-response-design.md` | plan / improve 契約 |
| reason code カタログ | `outputs/phase-2/reason-code-catalog.md`   | error.code 一覧     |

## 完了条件

- [x] `status` 横展開案を破棄し union 契約へ整理している
- [x] plan / improve / execute の責務差が明文化されている
- [x] IPC outer error と logical error の境界が定義されている
- [x] renderer の execute 抑止条件が定義されている
- [x] `execute()` guard の実装設計が Phase 5 で完了している
- [x] **本Phase内の全タスクを100%実行完了**
