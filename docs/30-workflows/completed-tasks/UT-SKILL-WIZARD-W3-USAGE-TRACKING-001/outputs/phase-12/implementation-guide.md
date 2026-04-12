# Implementation Guide: スキルウィザード使用率計装 (Wave 3)

# タスク: UT-SKILL-WIZARD-W3-USAGE-TRACKING-001

# 作成日: 2026-04-11

## 概要

この変更は、スキル作成ウィザードの利用状況を renderer 内で記録できるようにするものです。
画面の見た目は変えず、どの流れが使われたかだけを残します。

## Part 1: 中学生向けの説明

学校のバスに「乗車記録係」がいると考えると分かりやすいです。
誰が乗ったかの名前までは書かず、「どこから乗ったか」「途中で降りたか」「最後まで乗ったか」だけを記録します。

今回の記録も同じで、次の 4 つを数えます。

1. ウィザードを開いた
2. 各段階を終えた
3. 次に何をするかを選んだ
4. 途中でやめた

この記録があると、「どの段階でやめやすいか」「どの行動が多いか」が見えるので、あとから改善しやすくなります。
記録するのは操作の種類だけで、名前やメールアドレスのような個人情報は入れません。

## Part 2: 開発者向けの詳細

### 変更対象

- `apps/desktop/src/renderer/utils/trackEvent.ts`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`
- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

### 型定義

`SkillWizardEvents` は既存イベントを残したまま、新しい計測イベントを追加します。
`skill_wizard_next_action` だけは `action` の値が更新されています。

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
  skill_wizard_open: {
    source: "lifecycle_panel" | "direct";
  };
  skill_wizard_step_complete: {
    step: number;
    stepName: string;
  };
  skill_wizard_next_action: {
    action: "edit" | "execute" | "close";
  };
  skill_wizard_abandon: {
    lastStep: number;
  };
};

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void;
```

### 呼び出し例

```typescript
trackEvent("skill_wizard_open", { source: "lifecycle_panel" });
trackEvent("skill_wizard_step_complete", {
  step: 0,
  stepName: "スキル情報入力",
});
trackEvent("skill_wizard_step_complete", {
  step: 1,
  stepName: "詳細設定",
});
trackEvent("skill_wizard_step_complete", { step: 2, stepName: "生成" });
trackEvent("skill_wizard_next_action", { action: "execute" });
trackEvent("skill_wizard_next_action", { action: "edit" });
trackEvent("skill_wizard_next_action", { action: "close" });
trackEvent("skill_wizard_abandon", { lastStep: 0 });
```

### 実装メモ

- `trackEvent` は dev では `console.info`、production では no-op です。
- 新イベントは追加していますが、`skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_generation_completed` / `skill_skeleton_quality_feedback` は後方互換のため残しています。
- `skill_wizard_step_complete` は 0 / 1 / 2 の 3 か所で発火します。
- `skill_wizard_abandon` は未完了のままアンマウントされたときだけ発火します。
- `skill_wizard_next_action` の `close` は、UI 上の「別のスキルを作る」を指します。閉じるボタンとは別です。
- 完了後に「別のスキルを作る」を押して再度ウィザードを始める場合は、`resetGeneratedState()` で `wizardCompletedRef.current = false` に戻します。これにより、次の未完了離脱でも `skill_wizard_abandon` が再発火します。
- `skill_wizard_open.source` は起点ごとに切り替えます。
  - `App.tsx` の `/advanced/skill-create-wizard` は `source="direct"` を渡します。
  - `SkillManagementPanel.tsx` は create ボタン起点では `direct`、lifecycle panel 起点では `lifecycle_panel` を渡します。

### エッジケース

- 生成失敗時は `skill_wizard_generation_completed` を発火しません。
- 中断計測は cleanup で行うため、`currentStep` の最新値は ref で保持します。
- 画面の見た目を変えていないため、このタスクは NON_VISUAL です。Phase 11 の証跡は Vitest の結果を使います。
