# Phase 2: 設計

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 2                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

エラーレスポンス型の設計、Facade 内スタブ置換ロジック、IPC handler のエラー変換、renderer のエラー表示コンポーネントを設計する。

## 実行タスク

- エラーレスポンス型の拡張を設計する
- Facade 内スタブ → エラー変換ロジックを設計する
- IPC handler のエラー検出・変換を設計する
- renderer のエラー表示パターンを設計する

## 参照資料

| 資料名        | パス                                                                  | 説明                            |
| ------------- | --------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件  | `phase-1-requirements.md`                                             | スタブ箇所・型拡張・reason code |
| Facade        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 現行スタブ実装                  |
| IPC handler   | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | 既存 IpcResult パターン         |
| 型定義        | `packages/shared/src/types/skillCreator.ts`                           | 現行型定義                      |
| UI components | `apps/desktop/src/renderer/components/skill/`                         | 現行 UI コンポーネント          |

### 現行コードアンカー

| ファイル                                                              | 設計観点                                          |
| --------------------------------------------------------------------- | ------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                           | `RuntimeSkillCreatorPlanResponse` の拡張点        |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan/execute/improve の early return パスの変更点 |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | `IpcResult<T>` パターンの既存踏襲方式             |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | エラー状態の条件分岐挿入点                        |

## 実行手順

### ステップ1: エラーレスポンス型を設計する

```typescript
// packages/shared/src/types/skillCreator.ts

/** スタブレスポンスの degraded 原因 */
type SkillCreatorDegradedReason =
  | "llm_adapter_unavailable"
  | "resource_loader_unavailable";

/** レスポンスステータス */
type SkillCreatorResponseStatus = "ok" | "degraded" | "error";

// RuntimeSkillCreatorPlanResponse への追加フィールド
interface RuntimeSkillCreatorPlanResponse {
  // ... 既存フィールド ...
  status: SkillCreatorResponseStatus;
  degradedReason?: SkillCreatorDegradedReason | null;
  userMessage?: string | null;
}
```

- `status: "ok"` — 正常系。既存コードとの後方互換性を維持する。
- `status: "error"` — スタブ条件に該当。データフィールドは空のまま。
- `status: "degraded"` — 将来的な部分的成功用に予約。

同様の拡張を `RuntimeSkillCreatorExecuteResponse` と `RuntimeSkillCreatorImproveResponse` にも適用する。

### ステップ2: Facade 内スタブ → エラー変換を設計する

**plan() の変換**:

```typescript
if (
  !this.llmAdapter ||
  (!this.resourceLoader && !this.hasDynamicResourcePipeline())
) {
  const reason: SkillCreatorDegradedReason = !this.llmAdapter
    ? "llm_adapter_unavailable"
    : "resource_loader_unavailable";

  const userMessage =
    reason === "llm_adapter_unavailable"
      ? "LLM アダプタが利用できません。設定を確認してください。"
      : "リソースローダーが利用できません。";

  const errorResult = {
    planId,
    skillSpec,
    estimatedSteps: 0,
    skillName: "",
    description: "",
    agents: [],
    scripts: [],
    triggers: [],
    anchors: [],
    status: "error" as const,
    degradedReason: reason,
    userMessage,
  };

  this.logger?.warn(`[plan] stub response replaced with error: ${reason}`);
  this.workflowEngine.recordPlanResult(errorResult, decision, sourceProvenance);
  return errorResult;
}
```

- 正常系では `status: "ok"` を付与して返す（既存の return 文に追加）。
- execute() / improve() も同様のパターンを適用する。

### ステップ3: IPC handler のエラー検出・変換を設計する

```typescript
// apps/desktop/src/main/ipc/creatorHandlers.ts

// plan handler 内
const result = await facade.plan(spec);

if (result.status === "error" || result.status === "degraded") {
  return {
    success: false,
    error: result.userMessage ?? "スキル作成に失敗しました",
    data: {
      degradedReason: result.degradedReason,
      status: result.status,
    },
  } satisfies IpcResult;
}

return { success: true, data: result } satisfies IpcResult;
```

- 既存の try/catch エラーハンドリングはそのまま維持する。
- `status` チェックを try/catch の内側に追加する。

### ステップ4: renderer のエラー表示を設計する

**SkillLifecyclePanel.tsx / SkillCreateWizard.tsx**:

```typescript
// IPC 応答の判定
if (!result.success) {
  const degradedReason = result.data?.degradedReason;

  if (degradedReason === "llm_adapter_unavailable") {
    setError("LLM アダプタが利用できません。設定を確認してください。");
  } else if (degradedReason === "resource_loader_unavailable") {
    setError("リソースローダーが利用できません。");
  } else {
    setError(result.error ?? "不明なエラーが発生しました");
  }
  return;
}
```

- エラー表示は既存の error state パターンに統合する。
- reason code に応じたユーザーフレンドリーなメッセージを表示する。
- Toast / Alert / inline error の既存パターンに従う。

## 統合テスト連携

- Phase 4 で各スタブ条件の test case を定義する。
- Phase 6 で IPC 層 / renderer 層の edge case を追加する。
- Phase 9 で既存正常系パスとの互換性を監査する。

## 成果物

| 成果物              | パス                                        | 説明                              |
| ------------------- | ------------------------------------------- | --------------------------------- |
| 設計書              | `phase-2-design.md`                         | 型 / Facade / IPC / renderer 設計 |
| error response 設計 | `{outputs/phase-2/error-response-design.md` | 型拡張とエラー変換フロー          |
| reason code catalog | `{outputs/phase-2/reason-code-catalog.md`   | reason code 一覧と発火条件        |

## 完了条件

- [ ] エラーレスポンス型の拡張が定義されている
- [ ] Facade 内スタブ → エラー変換ロジックが設計されている
- [ ] IPC handler のエラー検出・変換が設計されている
- [ ] renderer のエラー表示パターンが設計されている
- [ ] **本Phase内の全タスクを100%実行完了**
