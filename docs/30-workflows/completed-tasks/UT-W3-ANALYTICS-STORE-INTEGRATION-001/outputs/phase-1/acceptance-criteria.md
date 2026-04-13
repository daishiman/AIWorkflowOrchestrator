# Phase 1: 受入基準（AC-1〜AC-4）

## 実行日時

2026-04-13

## 受入基準一覧

| ID   | 基準                                                                         | 検証方法                                                                                          | 検証タイミング |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------- |
| AC-1 | スキル実行の開始・完了・エラーが自動的に `analyticsAdapter` へ送信されること | `analyticsSlice.test.ts` でモックを使用して `analyticsAdapter.send` の呼び出しを検証              | Phase 5        |
| AC-2 | renderer-side `analyticsSlice` が Zustand slice として実装されていること     | `analyticsSlice.ts` が `create()` を使用し `useAnalyticsStore` としてエクスポートされているか確認 | Phase 5        |
| AC-3 | 既存の `trackEvent` 公開 API シグネチャが変更されないこと                    | `trackEvent.ts` のシグネチャを Phase 1 で記録し、Phase 10 で変更がないことを grep で確認          | Phase 10       |
| AC-4 | `pnpm typecheck && pnpm lint && pnpm test` が PASS すること                  | CI コマンド実行（Phase 9）                                                                        | Phase 9        |

## AC-3 検証のためのベースラインシグネチャ

```typescript
// trackEvent.ts ベースライン（変更禁止）
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
  skill_wizard_next_action: { action: "edit" | "execute" | "close" };
  skill_wizard_open: { source: "lifecycle_panel" | "direct" };
  skill_wizard_step_complete: { step: number; stepName: string };
  skill_wizard_abandon: { lastStep: number };
};

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void;
```
