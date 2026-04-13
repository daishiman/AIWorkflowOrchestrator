# Phase 5 成果物: 実装サマリー

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 実装概要

Phase 4で定義したRed→Greenの移行を完了。全34テストがPASS（うち新規TC-01〜TC-05を含む）。

## 実施した変更

### 1. 型インポートの削除（SkillCreateWizard.tsx）

```typescript
// 削除
import type { GenerationMode } from "./wizard";
import type { PlanResult } from "../../store/slices/agentSlice";
import type {
  SkillCreatorWorkflowUiSnapshot,
  TerminalHandoffBundle,
} from "@repo/shared/types";
```

### 2. Store Hookインポートの削除（SkillCreateWizard.tsx）

```typescript
// 削除
useSetIsSkillGenerating, useSetGenerationProgress, useSetGenerationError,
useSetCurrentPlanResult, useSetCurrentPlanId, useCurrentPlanId, useCurrentPlanResult,
```

### 3. ユーティリティ関数の削除（SkillCreateWizard.tsx）

- `isTerminalHandoffExecuteResponse` - handleExecutePlanのみで使用
- `toHandoffGuidance` - handleExecutePlanのみで使用
- `toTerminalHandoffPlanResult` - handleExecutePlanのみで使用
- `SkillCreatorRuntimeApi` 型定義
- `getSkillCreatorApi` 関数

### 4. Refの削除

```typescript
// 削除
const llmGenerationRequestIdRef = useRef(0);
```

### 5. Stateの削除

```typescript
// 削除
const [generationMode, setGenerationMode] =
  useState<GenerationMode>("template");
const [hasActivatedLlmMode, setHasActivatedLlmMode] = useState(false);
const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(null);
const [llmDescription, setLlmDescription] = useState("");
const setStoreIsGenerating = useSetIsSkillGenerating();
// ... その他store setter 7件
```

### 6. 関数の削除・変更

- `handleStep0NextFromLlm` - 削除
- `handleLlmGenerate` - 削除
- `handleExecutePlan` - 削除
- `handleCancelPlan` - 削除
- `handleCancelTemplateGeneration` → `handleCancelGeneration` にリネーム

### 7. invalidateGenerationRequests の更新

```typescript
// 修正前
const invalidateGenerationRequests = () => {
  llmGenerationRequestIdRef.current += 1;
  templateGenerationRequestIdRef.current += 1;
};

// 修正後
const invalidateGenerationRequests = () => {
  templateGenerationRequestIdRef.current += 1;
};
```

### 8. Step 0 JSX の変更

```tsx
// 修正前: ラジオボタン + 条件分岐
{
  /* 76行分のラジオボタン・LLMテキストエリア */
}

// 修正後: SkillInfoStepのみ
{
  currentStep === 0 && (
    <div data-testid="wizard-step-info">
      <SkillInfoStep
        formData={formData}
        onFormDataChange={setFormData}
        onNext={handleStep0Next}
      />
    </div>
  );
}
```

### 9. Step 2 (GenerateStep) Props の変更

```tsx
// 修正前: generationMode条件分岐あり
onCancel={generationMode === "llm" ? handleCancelPlan : handleCancelTemplateGeneration}
onRetry={generationMode === "template" ? () => void handleGenerate(generationMethod) : undefined}
planResult={generationMode === "llm" ? localPlanResult : undefined}
onExecutePlan={generationMode === "llm" ? () => void handleExecutePlan() : undefined}
onCancelPlan={generationMode === "llm" ? handleCancelPlan : undefined}

// 修正後: 固定値
onCancel={handleCancelGeneration}
onRetry={() => void handleGenerate(generationMethod)}
```

## テスト結果

```
✓ 34 tests passed
  - TC-01: ラジオボタン非表示 ✓
  - TC-02: generation-mode-selector非存在 ✓
  - TC-03: Step 0→Step 1遷移 ✓
  - TC-04: Step 2直接遷移不可 ✓
  - TC-05: 正規フロー確認 ✓
  - 既存テスト29件: 全PASS ✓
```
