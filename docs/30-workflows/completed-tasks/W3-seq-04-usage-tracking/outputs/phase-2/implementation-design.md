# 実装設計書

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 2                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 1. 実装方針

### 1.1 ファイル構成

`trackEvent` は **1 ファイルに閉じる**。型定義・実装・export を同一境界に置き、呼び出し側が参照するのはイベント名と payload 型のみとする。

```
apps/desktop/src/renderer/utils/
└── trackEvent.ts          # 新規作成（1 ファイルで完結）
```

### 1.2 実装コード

```typescript
// apps/desktop/src/renderer/utils/trackEvent.ts
import type { SkillCategory } from "../../../../packages/shared/src/types/skill";

export type SkillWizardEvents = {
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
}
```

### 1.3 設計上の決定事項

| 決定事項                | 内容                                                       | 理由                                                         |
| ----------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| 1 ファイル集約          | 型定義と実装を `trackEvent.ts` 1 ファイルに置く            | 呼び出し側の import パスを固定し、差し替えコストを最小化する |
| 同期処理                | `async` / `await` を使わない                               | 計装は軽量副作用であり非同期化は不要                         |
| production は no-op     | `NODE_ENV !== "production"` チェックで production を空処理 | 本番環境でのパフォーマンス影響をゼロにする                   |
| dev 時のみ console.info | 開発時に `[trackEvent]` プレフィックス付きでログ出力       | 開発者がコンソールで即座に確認できる                         |
| named export            | `trackEvent` を named export で提供                        | `vi.mock` による差し替えを可能にする                         |

---

## 2. 計装ポイント配置設計

全 5 イベントの発火責務は `SkillCreateWizard.tsx` に集約する。`CompleteStep.tsx` は presentational に留め、`onNextAction` コールバックで親へ通知するのみとする。

| ファイル                | 関数 / フック                   | 計装イベント                        | 位置                 |
| ----------------------- | ------------------------------- | ----------------------------------- | -------------------- |
| `SkillCreateWizard.tsx` | `useEffect`（deps: `[]`）       | `skill_wizard_started`              | マウント時 1 回      |
| `SkillCreateWizard.tsx` | `handleGenerate()` 冒頭         | `skill_wizard_step1_completed`      | 生成処理開始前       |
| `SkillCreateWizard.tsx` | `handleGenerate()` await 完了後 | `skill_wizard_generation_completed` | 生成成功時のみ       |
| `SkillCreateWizard.tsx` | `handleQualityFeedback()`       | `skill_skeleton_quality_feedback`   | フィードバック送信時 |
| `SkillCreateWizard.tsx` | `handleNextAction()`            | `skill_wizard_next_action`          | アクション選択時     |

### 2.1 CompleteStep.tsx の責務境界

```
CompleteStep.tsx
  └── UI のレンダリング + onNextAction(action) コールバック呼び出しのみ
      ※ trackEvent は呼ばない

SkillCreateWizard.tsx
  └── handleNextAction(action) でコールバックを受け取り trackEvent を発火
```

---

## 3. 実装詳細（疑似コード）

### 3.1 skill_wizard_started

```typescript
// SkillCreateWizard.tsx
useEffect(() => {
  trackEvent("skill_wizard_started", {});
}, []);
```

### 3.2 skill_wizard_step1_completed

```typescript
// SkillCreateWizard.tsx - handleGenerate()
const handleGenerate = async (
  isSkipped: boolean,
  currentQuestionIndex: number,
) => {
  trackEvent("skill_wizard_step1_completed", {
    method: isSkipped ? "skip" : "complete",
    skippedAtQuestion: isSkipped ? currentQuestionIndex : null,
  });
  // ... 生成処理
};
```

### 3.3 skill_wizard_generation_completed

```typescript
// SkillCreateWizard.tsx - handleGenerate() 内
const result = await generateSkillSkeleton(params);
// 生成成功時のみ発火
trackEvent("skill_wizard_generation_completed", {
  method: isSkipped ? "skip" : "complete",
  category: result.category,
  hasExternalIntegration: result.hasExternalIntegration,
});
```

### 3.4 skill_skeleton_quality_feedback

```typescript
// SkillCreateWizard.tsx
const handleQualityFeedback = (satisfied: boolean) => {
  trackEvent("skill_skeleton_quality_feedback", {
    satisfied,
    generationMethod: currentMethod, // Step 1 の method を state で保持
  });
};
```

### 3.5 skill_wizard_next_action

```typescript
// SkillCreateWizard.tsx
const handleNextAction = (
  action: "execute" | "open_editor" | "create_another",
) => {
  trackEvent("skill_wizard_next_action", { action });
  // ... アクション処理
};
```

---

## 4. 既存基盤との分離

| 基盤             | 責務                                      | W3 との関係                  |
| ---------------- | ----------------------------------------- | ---------------------------- |
| `SkillAnalytics` | スキル実行ログの記録（execution-centric） | W3 UI 計装とは直接接続しない |
| `AnalyticsStore` | 実行ログの永続化                          | W3 UI 計装とは直接接続しない |
| `trackEvent.ts`  | ウィザード UI 操作イベントの開発時ログ    | renderer-local に閉じる      |

---

## 5. タスク分類と NON_VISUAL 宣言

| 項目                 | 内容                                                           |
| -------------------- | -------------------------------------------------------------- |
| タスク分類           | NON_VISUAL                                                     |
| visible surface 変更 | なし（画面表示・レイアウト・スタイルの変更なし）               |
| Phase 11 証跡        | `console.info` ログ + 自動テスト結果（スクリーンショット不要） |

---

## 完了条件チェックリスト

- [x] trackEvent スタブ実装の設計が確定していること
- [x] 計装ポイント配置設計テーブルが完成していること
- [x] `CompleteStep.tsx` が presentational に留まる設計であること
- [x] `SkillAnalytics` / `AnalyticsStore` との分離方針が明記されていること
- [x] 型安全な計装設計が記述されていること
- [x] NON_VISUAL 方針が明記されていること
- [x] 矛盾なし・漏れなし
