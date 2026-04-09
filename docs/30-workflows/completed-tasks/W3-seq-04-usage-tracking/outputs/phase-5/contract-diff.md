# trackEvent インターフェース差分

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 5                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 概要

W3-seq-04 で新規作成した `trackEvent.ts` のインターフェース定義を記録する。
既存の `SkillAnalytics` / `AnalyticsStore` とは独立した renderer-local の薄い抽象として設計したため、IPC / preload 契約への変更は発生しない。

---

## Before（実装前）

`trackEvent.ts` ファイル自体が存在しなかった。

```typescript
// ファイルなし
```

---

## After（実装後）

```typescript
// apps/desktop/src/renderer/utils/trackEvent.ts

import type { SkillCategory } from "@repo/shared/types/skill";

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
  // 将来: execution-centric 基盤とは独立した sink に差し替える
}
```

---

## インターフェース変更サマリー

| 項目                      | Before | After                                                                                         |
| ------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| ファイル                  | なし   | `apps/desktop/src/renderer/utils/trackEvent.ts`                                               |
| 関数シグネチャ            | なし   | `trackEvent<K extends keyof SkillWizardEvents>(name: K, payload: SkillWizardEvents[K]): void` |
| 型定義                    | なし   | `SkillWizardEvents` マップ（5 イベント）                                                      |
| エクスポート              | なし   | `trackEvent` 関数 + `SkillWizardEvents` 型                                                    |
| IPC 契約への影響          | なし   | なし（renderer-local のみ）                                                                   |
| preload 契約への影響      | なし   | なし（renderer-local のみ）                                                                   |
| `SkillAnalytics` への影響 | なし   | なし（独立した抽象）                                                                          |

---

## 型安全性の確認

`SkillWizardEvents` マップ外のイベント名を渡した場合、TypeScript コンパイル時にエラーが発生する。

```typescript
// コンパイルエラー例
trackEvent("unknown_event", {}); // TS2345: "unknown_event" は keyof SkillWizardEvents に存在しない

// payload 型ミスマッチ例
trackEvent("skill_wizard_started", { source: "button" }); // TS2345: Record<never, never> に "source" は存在しない
```

---

## 将来の差し替えポイント

現在は `console.info` のみの no-op スタブだが、将来的に分析基盤への送信が必要になった場合、`trackEvent` 関数内の実装を差し替えるだけでよい。呼び出し側（`SkillCreateWizard.tsx`）の変更は不要。

```typescript
// 将来の差し替えイメージ
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload);
  }
  // 差し替え先: analyticsAdapter.send(eventName, payload);
}
```

---

## 完了条件チェックリスト

- [x] Before / After の差分が明記されていること
- [x] 型安全な generics シグネチャが記録されていること
- [x] IPC / preload 契約への影響がないことが確認されていること
- [x] 将来の差し替えポイントが明示されていること
