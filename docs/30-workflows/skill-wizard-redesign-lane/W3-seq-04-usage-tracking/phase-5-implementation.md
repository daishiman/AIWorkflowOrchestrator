# Phase 5: 実装

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 5                            |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 4                      |
| 後続Phase  | Phase 6                      |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

Phase 4 で定義した Red テストを Green へ移行する。5つの計装ポイントを実装する。
既存の `SkillAnalytics` / `AnalyticsStore` は execution-centric なので、W3 の UI 計装は renderer-local の薄い `trackEvent` 抽象として実装する。

## 実装手順

### Step 1: trackEvent スタブ実装

`apps/desktop/src/renderer/utils/trackEvent.ts` を作成（または既存を確認）：

```typescript
import type { SkillCategory } from "packages/shared/src/types/skill";

type SkillWizardEvents = {
  skill_wizard_started: Record<never, never>;
  skill_wizard_step1_completed: {
    method: "complete" | "skip";
    skippedAtQuestion: number | null;
  };
  skill_wizard_generation_completed: {
    method: "complete" | "skip";
    category: SkillCategory;
    hasExternalIntegration: boolean;
  };
  skill_skeleton_quality_feedback: {
    satisfied: boolean;
    generationMethod: "complete" | "skip";
  };
  skill_wizard_next_action: {
    action: "execute" | "open_editor" | "create_another";
  };
};

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload);
  }
  // 将来: execution-centric 基盤とは独立した sink に差し替える
}
```

### Step 2: SkillCreateWizard.tsx への計装追加

#### 計装 1: ウィザード起動イベント

```typescript
// useEffect でマウント時に発火
useEffect(() => {
  trackEvent("skill_wizard_started", {});
}, []);
```

#### 計装 2〜3: handleGenerate での発火

```typescript
const handleGenerate = async (
  method: "complete" | "skip",
  skippedAt?: number,
) => {
  // 計装 2: Step 1 完了イベント
  trackEvent("skill_wizard_step1_completed", {
    method,
    skippedAtQuestion: skippedAt ?? null,
  });

  setGenerationMethod(method);
  setIsGenerating(true);
  const result = await llmGenerateSkill({
    formData,
    answers,
    smartDefaults,
    method,
  });
  setGeneratedSkill(result);
  setIsGenerating(false);

  // 計装 3: 生成完了イベント
  trackEvent("skill_wizard_generation_completed", {
    method,
    category: formData.category, // `SkillCategory` は `packages/shared/src/types/skill.ts` から参照する
    hasExternalIntegration: result.hasExternalIntegration ?? false,
  });

  setCurrentStep(3);
};
```

#### 計装 4: handleQualityFeedback での発火

```typescript
const handleQualityFeedback = (satisfied: boolean) => {
  trackEvent("skill_skeleton_quality_feedback", {
    satisfied,
    generationMethod,
  });
};
```

## 統合テスト連携

- Phase 4 の TC-01〜TC-09 が Green になることを実装完了条件にする。
- `skill_wizard_started` は 1 mount 1 event を原則とし、StrictMode の dev-only 重複は Phase 6 で明示的に扱う。
- `skill_wizard_started` は payload なしの空オブジェクトで発火し、source 依存を持たない。
- `skill_wizard_generation_completed` は成功時のみ発火し、失敗時は `trackEvent` を呼ばない。
- 既存の `SkillAnalytics` / `AnalyticsStore` をこの phase で直接流用しない。

### Step 3: CompleteStep.tsx への計装追加

#### 計装 5: ネクストアクション選択イベント

```typescript
// CompleteStep.tsx 内のネクストアクションボタン
const handleNextAction = (
  action: "execute" | "open_editor" | "create_another",
) => {
  trackEvent("skill_wizard_next_action", { action });
  onNextAction(action);
};
```

## 計装ポイント実装チェックリスト

| 計装ポイント                        | ファイル                | 実装状況 |
| ----------------------------------- | ----------------------- | -------- |
| `skill_wizard_started`              | `SkillCreateWizard.tsx` | [ ]      |
| `skill_wizard_step1_completed`      | `SkillCreateWizard.tsx` | [ ]      |
| `skill_wizard_generation_completed` | `SkillCreateWizard.tsx` | [ ]      |
| `skill_skeleton_quality_feedback`   | `SkillCreateWizard.tsx` | [ ]      |
| `skill_wizard_next_action`          | `CompleteStep.tsx`      | [ ]      |

## 参照資料

| 資料名         | パス                                       | 用途           |
| -------------- | ------------------------------------------ | -------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | Phase 4 成果物 |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`       | Phase 4 成果物 |
| 実装設計書     | `outputs/phase-2/implementation-design.md` | Phase 2 成果物 |
| 拡張設計書     | `outputs/phase-2/extension-design.md`      | Phase 2 成果物 |

## 実行タスク

1. Phase 4 成果物を確認する。
2. Step 1 で `trackEvent` スタブを実装する（既存があれば確認のみ）。
3. Step 2 で `SkillCreateWizard.tsx` に計装 1〜4 を追加する。
4. Step 3 で `CompleteStep.tsx` に計装 5 を追加する。
5. Phase 4 の全テストが Green になることを確認する。

## 成果物

| 成果物           | パス                                        | 説明                            |
| ---------------- | ------------------------------------------- | ------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 5計装ポイントの実装記録         |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル                |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | trackEvent インターフェース差分 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `trackEvent` スタブが実装されていること
- [ ] 5つの計装ポイントが全て実装されていること
- [ ] Phase 4 の全テストが Green になっていること
- [ ] `pnpm typecheck` がエラーなしで通過すること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. trackEvent スタブ実装（Step 1）
3. SkillCreateWizard.tsx 計装（Step 2）
4. CompleteStep.tsx 計装（Step 3）
5. テスト Green 確認
6. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
