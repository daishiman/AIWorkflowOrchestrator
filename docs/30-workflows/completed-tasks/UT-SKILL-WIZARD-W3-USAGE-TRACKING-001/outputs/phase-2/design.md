# Phase 2 成果物: 設計書（計装ポイント責務境界）

## P-1: skill_wizard_open（マウント時）

採用パターン: `useEffect(() => { ... }, [])` にインライン追加

```typescript
// 既存
useEffect(() => {
  trackEvent("skill_wizard_started", {});
  trackEvent("skill_wizard_open", { source: source ?? "direct" }); // 追加
}, []);
```

`source` は `useEffect` の依存配列に追加しない（マウント時1回のみ発火させるため）。

## P-2〜P-4: skill_wizard_step_complete

各ステップ完了ハンドラの末尾（`goNext()` / `goToStep()` 前）に追加：

- `handleStep0Next`: `trackEvent("skill_wizard_step_complete", { step: 0, stepName: STEPS[0] })` → `goNext()`
- `handleStep0NextFromLlm`: 同上
- `handleGenerate`: 既存 `skill_wizard_step1_completed` 発火の直後に step 1 追加
- `handleGenerate` 成功パス / `handleExecutePlan` 成功パス: `wizardCompletedRef.current = true` 設定後に step 2 追加 → `goToStep(3)`

## P-5: skill_wizard_abandon（アンマウント時）

```typescript
const wizardCompletedRef = useRef(false);
const currentStepRef = useRef(currentStep);

useEffect(() => {
  currentStepRef.current = currentStep;
}, [currentStep]);

// 既存のアンマウント useEffect のクリーンアップ
useEffect(() => {
  return () => {
    llmGenerationRequestIdRef.current += 1;
    if (!wizardCompletedRef.current) {
      trackEvent("skill_wizard_abandon", { lastStep: currentStepRef.current });
    }
  };
}, []);
```

`currentStep` を直接クロージャで参照できないため `useRef` パターンを採用。

## P-6: skill_wizard_next_action（CompleteStep）

採用方針: `CompleteStep` 内で直接 `trackEvent` を呼ぶ（責務を分散させない）

`nextActions` 配列に `action` プロパティを追加し、JSX の `onClick` で発火：

```typescript
const nextActions = [
  { ..., action: "execute" as const, handler: onExecuteNow },
  { ..., action: "edit" as const, handler: onOpenInEditor },
  { ..., action: "close" as const, handler: onCreateAnother },
];

// JSX
onClick={() => {
  trackEvent("skill_wizard_next_action", { action: action.action });
  action.handler?.();
}}
```

不採用: 親コンポーネントでラップして渡す方針（責務が分散するため）
