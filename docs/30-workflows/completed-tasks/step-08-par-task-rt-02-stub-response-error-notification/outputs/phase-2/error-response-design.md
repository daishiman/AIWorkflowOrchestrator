# Phase 2: Error Response 設計

## 型設計

### 新規追加型

```typescript
type RuntimeSkillCreatorDegradedReason =
  | "llm_adapter_unavailable"
  | "resource_loader_unavailable";

interface RuntimeSkillCreatorPlanErrorResponse {
  success: false;
  error: {
    code: RuntimeSkillCreatorDegradedReason | "VALIDATION_ERROR";
    message: string;
  };
}
```

### union 拡張

```typescript
type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | RuntimeSkillCreatorPlanErrorResponse
  | { type: "terminal_handoff"; guidance: HandoffGuidance };
```

### improve 型（既存再利用）

`RuntimeSkillCreatorImproveErrorResponse` は既存。`error.code` に degraded reason を格納して再利用。

## Facade 設計

- `plan()` L308-328: stub success → `{ success: false, error: { code: "llm_adapter_unavailable", message } }` に置換
- `improve()` L560-567: `{improveId, suggestions:[]}` → `{ success: false, error: { code: "llm_adapter_unavailable", message } }` に置換
- `execute()`: shape 変更なし。renderer 側で plan logical error 時に execute 導線を無効化

## IPC 境界

| 層                | success:false の意味                           |
| ----------------- | ---------------------------------------------- |
| outer `IpcResult` | transport / validation failure                 |
| inner `data`      | logical error union（`success:false` in data） |

## renderer 設計

- `isRuntimePlanErrorResponse()` type guard を追加
- plan logical error 時: error message 表示、execute CTA 無効
- `SkillCreateWizard.tsx` でも同規則を適用
