# イベントスキーマ定義

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 1                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## TypeScript 型定義

```typescript
// apps/desktop/src/renderer/utils/trackEvent.ts
import type { SkillCategory } from "../../../../packages/shared/src/types/skill";

/**
 * SkillWizard の計装イベントマップ。
 * キー: イベント名、値: payload 型。
 * trackEvent 呼び出し時に型が強制される。
 */
export type SkillWizardEvents = {
  /** ウィザード起動時（空 payload） */
  skill_wizard_started: Record<never, never>;

  /** Step 1 完了またはスキップ時 */
  skill_wizard_step1_completed: {
    /** 全問回答完了 or スキップボタン押下 */
    method: "complete" | "skip";
    /**
     * スキップ時に何問目で押したか（1-indexed）。
     * method === "complete" の場合は null。
     */
    skippedAtQuestion: number | null;
  };

  /** LLM 生成完了時 */
  skill_wizard_generation_completed: {
    /** 生成前の Step 1 の完了方式 */
    method: "complete" | "skip";
    /** 生成されたスキルのカテゴリ */
    category: SkillCategory;
    /** 外部統合（API 呼び出し等）の有無 */
    hasExternalIntegration: boolean;
  };

  /** 骨格品質フィードバック（👍/👎）送信時 */
  skill_skeleton_quality_feedback: {
    /** 満足（👍）= true、不満（👎）= false */
    satisfied: boolean;
    /** 生成時の方式（Step 1 の method と同値） */
    generationMethod: "complete" | "skip";
  };

  /** CompleteStep でのネクストアクション選択時 */
  skill_wizard_next_action: {
    /** 選択されたアクション種別 */
    action: "execute" | "open_editor" | "create_another";
  };
};
```

---

## イベント詳細

### 1. skill_wizard_started

| 項目           | 内容                                                               |
| -------------- | ------------------------------------------------------------------ |
| 発火タイミング | `SkillCreateWizard` コンポーネントの `useEffect`（deps: `[]`）内   |
| 発火ファイル   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` |
| payload 型     | `Record<never, never>`（空オブジェクト `{}`）                      |
| 発火回数       | マウントごとに 1 回のみ                                            |
| 制約           | アンマウント後の発火は不可                                         |

```typescript
useEffect(() => {
  trackEvent("skill_wizard_started", {});
}, []);
```

---

### 2. skill_wizard_step1_completed

| 項目           | 内容                                                                  |
| -------------- | --------------------------------------------------------------------- |
| 発火タイミング | `handleGenerate()` 呼び出し直前（生成処理開始前）                     |
| 発火ファイル   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`    |
| payload 型     | `{ method: "complete" \| "skip"; skippedAtQuestion: number \| null }` |
| 発火回数       | 生成ボタン押下ごとに 1 回                                             |

**整合規則:**

| method     | skippedAtQuestion                          |
| ---------- | ------------------------------------------ |
| `complete` | `null`                                     |
| `skip`     | `1` 以上の整数（スキップ時の現在質問番号） |

```typescript
// handleGenerate() 冒頭
trackEvent("skill_wizard_step1_completed", {
  method: isSkipped ? "skip" : "complete",
  skippedAtQuestion: isSkipped ? currentQuestionIndex : null,
});
```

---

### 3. skill_wizard_generation_completed

| 項目           | 内容                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| 発火タイミング | `handleGenerate()` 内の LLM 生成 await 完了直後（成功時のみ）                                |
| 発火ファイル   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           |
| payload 型     | `{ method: "complete" \| "skip"; category: SkillCategory; hasExternalIntegration: boolean }` |
| 発火回数       | 生成成功時に 1 回のみ（生成失敗時は発火しない）                                              |

```typescript
// handleGenerate() 内 await 完了後
trackEvent("skill_wizard_generation_completed", {
  method: isSkipped ? "skip" : "complete",
  category: generatedSkill.category,
  hasExternalIntegration: generatedSkill.hasExternalIntegration,
});
```

---

### 4. skill_skeleton_quality_feedback

| 項目           | 内容                                                               |
| -------------- | ------------------------------------------------------------------ |
| 発火タイミング | `handleQualityFeedback()` 呼び出し時                               |
| 発火ファイル   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` |
| payload 型     | `{ satisfied: boolean; generationMethod: "complete" \| "skip" }`   |
| 発火回数       | 👍 / 👎 ボタン押下ごとに 1 回                                      |

```typescript
// handleQualityFeedback(satisfied: boolean)
trackEvent("skill_skeleton_quality_feedback", {
  satisfied,
  generationMethod: currentMethod, // Step 1 で記録した method と同値
});
```

---

### 5. skill_wizard_next_action

| 項目           | 内容                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------- |
| 発火タイミング | `handleNextAction()` 呼び出し時（`CompleteStep.tsx` の `onNextAction` コールバック受け取り後） |
| 発火ファイル   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                             |
| payload 型     | `{ action: "execute" \| "open_editor" \| "create_another" }`                                   |
| 発火回数       | ネクストアクション選択ごとに 1 回                                                              |

```typescript
// handleNextAction(action: "execute" | "open_editor" | "create_another")
trackEvent("skill_wizard_next_action", { action });
```

---

## イベント一覧サマリー

| #   | イベント名                          | 発火タイミング           | payload キー                                   |
| --- | ----------------------------------- | ------------------------ | ---------------------------------------------- |
| 1   | `skill_wizard_started`              | コンポーネントマウント時 | （なし）                                       |
| 2   | `skill_wizard_step1_completed`      | 生成処理開始前           | `method`, `skippedAtQuestion`                  |
| 3   | `skill_wizard_generation_completed` | LLM 生成成功完了後       | `method`, `category`, `hasExternalIntegration` |
| 4   | `skill_skeleton_quality_feedback`   | 👍 / 👎 送信時           | `satisfied`, `generationMethod`                |
| 5   | `skill_wizard_next_action`          | ネクストアクション選択時 | `action`                                       |

---

## 型参照元

| 型名            | 参照元                               |
| --------------- | ------------------------------------ |
| `SkillCategory` | `packages/shared/src/types/skill.ts` |

---

## 完了条件チェックリスト

- [x] 5 イベントすべての TypeScript 型定義が記述されていること
- [x] 各イベントの発火タイミング・発火ファイル・発火回数が明記されていること
- [x] `skippedAtQuestion` の null 許容が型定義に反映されていること
- [x] `SkillCategory` の参照元が `packages/shared/src/types/skill.ts` であること
- [x] `CompleteStep.tsx` が trackEvent を呼ばない設計であること
- [x] 矛盾なし・漏れなし
