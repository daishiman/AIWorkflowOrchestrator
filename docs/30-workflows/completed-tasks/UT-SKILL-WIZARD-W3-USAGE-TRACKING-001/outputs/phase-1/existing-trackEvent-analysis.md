# Phase 1 成果物: 既存 trackEvent 分析

## ファイルパス

`apps/desktop/src/renderer/utils/trackEvent.ts`

## 現在の実装構造

### 型定義 SkillWizardEvents

```typescript
export type SkillWizardEvents = {
  skill_wizard_started: Record<string, never>;
  skill_wizard_step1_completed: {
    method: "complete" | "skip";
    skippedAtQuestion: number | null;
  };
  skill_wizard_generation_completed: {
    method: "complete" | "skip";
    category: WizardSkillCategory;
    hasExternalIntegration: boolean;
  };
  skill_skeleton_quality_feedback: {
    satisfied: boolean;
    generationMethod: "complete" | "skip";
  };
  skill_wizard_next_action: {
    action: "execute" | "open_editor" | "create_another"; // ← 変更対象
  };
};
```

### trackEvent 関数の分岐構造

```typescript
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload); // dev 分岐
  }
  // prod: no-op（将来的に analytics sink に差し替え可能）
}
```

## 型依存

- `import type { SkillCategory as WizardSkillCategory } from "@repo/shared/types/skillCreator"` を使用

## 既存テスト状況

- `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts` が存在
- TC-07（例外なし）、TC-08（dev console.info）、TC-09（prod no-op）の3テストが実装済み

## Breaking Change: skill_wizard_next_action の変更

|             | Before                                           | After                            |
| ----------- | ------------------------------------------------ | -------------------------------- |
| `action` 型 | `"execute" \| "open_editor" \| "create_another"` | `'edit' \| 'execute' \| 'close'` |

影響ファイル:

- `SkillCreateWizard.tsx`: `handleOpenInEditor` の `"open_editor"` → `"edit"` / `handleCreateAnother` の `"create_another"` → `"close"` に変更
- `SkillCreateWizard.tracking.test.tsx`: TC-11（`"open_editor"`）、TC-12（`"create_another"`）の期待値を更新
