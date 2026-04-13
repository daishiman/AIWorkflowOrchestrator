# Phase 5: 実装記録書

## タスクID: TASK-SW-FIX-FEEDBACK-001

## 変更1: SkillCreateWizard.tsx

### Before

```typescript
import { useCreateSkill, ... } from "../../store";
// useFetchSkills なし

const createSkill = useCreateSkill();
// fetchSkills なし

// handleExecutePlan 成功パス末尾:
setLocalPlanResult(null);
clearGenerationState();
wizardCompletedRef.current = true;
trackEvent(...);
goToStep(3); // fetchSkills なし
```

### After

```typescript
import { useCreateSkill, useFetchSkills, ... } from "../../store";
// useFetchSkills 追加

const createSkill = useCreateSkill();
const fetchSkills = useFetchSkills(); // 追加

// handleExecutePlan 成功パス末尾:
setLocalPlanResult(null);
clearGenerationState();
wizardCompletedRef.current = true;
trackEvent(...);
try {
  await fetchSkills(); // 問題6/8修正
} catch {
  // fetchSkills失敗はログのみ
}
goToStep(3);
```

## 変更2: CompleteStep.tsx

### Before

```typescript
// nextActions 定義後、直接 return
return (
  <div data-testid="complete-step" ...>
    <div data-testid="complete-step-header" role="status">
      <h2>スキルの骨格を生成しました</h2> // skillPath=null でも表示される
    </div>
    ...
  </div>
);
```

### After

```typescript
// nextActions 定義後、nullガード追加
if (skillPath === null) {
  return (
    <div data-testid="complete-step" ...>
      <div data-testid="complete-step-error-header" role="alert">
        <h2>スキルの生成に失敗しました</h2>
        <p>スキルファイルの作成中にエラーが発生しました。</p>
      </div>
      <button data-testid="complete-step-retry-button" onClick={onRetry}>
        もう一度試す
      </button>
    </div>
  );
}

// 正常ケース（変更なし）
return (
  <div data-testid="complete-step" ...>
    <div data-testid="complete-step-header" role="status">
      <h2>スキルの骨格を生成しました</h2>
    </div>
    ...
  </div>
);
```

## テスト結果

- TC-FEEDBACK-001〜007: 全件 GREEN ✓
- TC-FEEDBACK-009, 011, 013: 全件 GREEN ✓
- 既存テスト回帰: 0件
