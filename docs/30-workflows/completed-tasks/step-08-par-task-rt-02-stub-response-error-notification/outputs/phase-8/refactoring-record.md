# Phase 8: リファクタリング記録

## 共通化内容

### 1. `DEGRADED_REASON_MESSAGES` 定数マップ

```typescript
const DEGRADED_REASON_MESSAGES: Record<
  RuntimeSkillCreatorDegradedReason,
  string
> = {
  llm_adapter_unavailable:
    "LLM アダプタが利用できません。設定を確認してください。",
  resource_loader_unavailable:
    "リソースローダーが利用できません。設定を確認してください。",
};
```

### 2. `buildDegradedError()` ヘルパー関数

```typescript
function buildDegradedError(reason: RuntimeSkillCreatorDegradedReason): {
  success: false;
  error: { code: RuntimeSkillCreatorDegradedReason; message: string };
} {
  return {
    success: false,
    error: { code: reason, message: DEGRADED_REASON_MESSAGES[reason] },
  };
}
```

### 3. 呼び出し箇所の集約

| メソッド    | 変更前                    | 変更後                                                                                                |
| ----------- | ------------------------- | ----------------------------------------------------------------------------------------------------- |
| `plan()`    | インラインリテラル 2 箇所 | `buildDegradedError("llm_adapter_unavailable")` / `buildDegradedError("resource_loader_unavailable")` |
| `improve()` | インラインリテラル 2 箇所 | 同上                                                                                                  |

### 4. import 整理

- `RuntimeSkillCreatorPlanErrorResponse` を import から削除（`satisfies` 不要になったため）
- `RuntimeSkillCreatorDegradedReason` を import に追加（定数マップの型に使用）

## Minor Notes 対応

| ID   | 対応                                                             |
| ---- | ---------------------------------------------------------------- |
| M-01 | ✅ `DEGRADED_REASON_MESSAGES` 定数化完了                         |
| M-02 | ✅ `isRuntimePlanErrorResponse` で命名統一（Phase 5 で対応済み） |
| M-03 | Phase 6 で parity 確認済み                                       |
