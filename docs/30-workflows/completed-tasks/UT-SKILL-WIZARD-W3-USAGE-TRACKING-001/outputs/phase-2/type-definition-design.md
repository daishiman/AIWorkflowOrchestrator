# Phase 2 成果物: 型定義設計書

## 追加する型定義

```typescript
// skill_wizard_open（AC-1）
skill_wizard_open: {
  source: "lifecycle_panel" | "direct";
}

// skill_wizard_step_complete（AC-2）
skill_wizard_step_complete: {
  step: number;
  stepName: string;
}

// skill_wizard_next_action 更新（AC-3）
// Before: action: "execute" | "open_editor" | "create_another"
// After:
skill_wizard_next_action: {
  action: "edit" | "execute" | "close";
}

// skill_wizard_abandon（AC-4）
skill_wizard_abandon: {
  lastStep: number;
}
```

## 既存イベントとの整合性

- `skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_generation_completed` / `skill_skeleton_quality_feedback`: **変更なし**（後方互換維持）
- `skill_wizard_next_action`: **Breaking Change**（`action` 型変更）

## Breaking Change 対応箇所

1. `SkillCreateWizard.tsx`: `handleOpenInEditor` → `"edit"`, `handleCreateAnother` → `"close"`
2. `SkillCreateWizard.tracking.test.tsx`: TC-11, TC-12 の期待値更新
