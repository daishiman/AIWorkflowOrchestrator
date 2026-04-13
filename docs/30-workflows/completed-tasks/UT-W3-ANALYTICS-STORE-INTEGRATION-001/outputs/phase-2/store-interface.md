# Phase 2: ストアインターフェース定義

## 実行日時

2026-04-13

## SkillAnalyticsEvent 型定義（packages/shared/src/types/skill-analytics.ts に追加）

```typescript
/** renderer-side スキル実行ライフサイクルイベント種別 */
export type SkillAnalyticsEventType = "start" | "complete" | "error";

/** renderer-side スキル実行ライフサイクルイベント */
export interface SkillAnalyticsEvent {
  /** イベント種別 */
  type: SkillAnalyticsEventType;
  /** スキルID */
  skillId: string;
  /** イベント発生日時（ISO 8601形式） */
  timestamp: string;
  /** 実行時間（ミリ秒）- complete イベントのみ */
  duration?: number;
  /** エラーメッセージ - error イベントのみ */
  error?: string;
}
```

## AnalyticsActions 型定義

```typescript
interface AnalyticsActions {
  /** スキル実行開始を記録する */
  trackSkillStart: (skillId: string) => void;
  /** スキル実行完了を記録する */
  trackSkillComplete: (skillId: string, duration: number) => void;
  /** スキル実行エラーを記録する */
  trackSkillError: (skillId: string, error: string | Error) => void;
}

/** analyticsSlice の型（state なし、action のみ） */
type AnalyticsSlice = AnalyticsActions;
```

## useAnalyticsStore エクスポート

```typescript
// Zustand store として作成し、hook として公開
export const useAnalyticsStore = create<AnalyticsSlice>()((set, get) => ({
  trackSkillStart: (skillId: string) => { ... },
  trackSkillComplete: (skillId: string, duration: number) => { ... },
  trackSkillError: (skillId: string, error: string | Error) => { ... },
}));
```

## analyticsAdapter への送信 payload 仕様

| イベント名       | payload フィールド                                     |
| ---------------- | ------------------------------------------------------ |
| `skill_start`    | `{ type: "start", skillId, timestamp }`                |
| `skill_complete` | `{ type: "complete", skillId, timestamp, duration }`   |
| `skill_error`    | `{ type: "error", skillId, timestamp, error: string }` |
