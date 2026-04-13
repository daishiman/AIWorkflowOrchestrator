# Phase 1: P50チェック結果

## 実行日時

2026-04-13

## 既存 store ディレクトリ構造

`apps/desktop/src/renderer/store/slices/` に以下のパターンが存在する:

- 各 slice は `StateCreator<AppStore>` パターン（CombinedStore用）を使用
- テストは `__tests__/` サブディレクトリに配置
- `analyticsSlice.ts` は**未作成**（新規作成が必要）

## analyticsAdapter 公開インターフェース

```typescript
export interface AnalyticsAdapter {
  send(eventName: string, payload: Record<string, unknown>): void;
  flush(): Promise<void>;
  isOptedOut(): boolean;
  getQueueSize(): number;
}

export function createAnalyticsAdapter(
  options?: CreateAnalyticsAdapterOptions,
): AnalyticsAdapter;
export function getAnalyticsAdapter(): AnalyticsAdapter;
export function resetAnalyticsAdapter(): void;
```

**変更禁止 API**: `send`, `flush`, `isOptedOut`, `getQueueSize`, `getAnalyticsAdapter`, `createAnalyticsAdapter`, `resetAnalyticsAdapter`

## trackEvent 公開 API（変更禁止）

```typescript
export type SkillWizardEvents = { ... }  // UI計装イベント型

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void
```

## 既存 Zustand パターン

- 複合Storeスライス: `StateCreator<AppStore>` を使用し `index.ts` で `create()` + `persist` + `devtools`
- スタンドアロンストア: `create()` 直接使用も可能（`analyticsSlice` はスタンドアロンが適切）

## スキル実行フロー

- `runSkill` / `executeSkill` は `agentSlice.ts` に存在
- スキル実行ライフサイクルイベント（start/complete/error）は現状手動通知なし

## main-process analytics 実装（今回変更対象外）

- `apps/desktop/src/main/services/skill/AnalyticsStore.ts`: `class AnalyticsStore`
- `apps/desktop/src/main/services/skill/SkillAnalytics.ts`: `class SkillAnalytics`

## 共有型の正本

- `packages/shared/src/types/skill-analytics.ts` に `SkillUsageEvent` 等が定義済み
- `SkillAnalyticsEvent`（renderer-side型）は**未定義**（追加が必要）
- `packages/shared/index.ts:169` で `skill-analytics` が re-export 済み

## 結論

- `analyticsSlice.ts` 新規作成が必要
- `skill-analytics.ts` に `SkillAnalyticsEvent` 型を追加が必要
- `trackEvent` 公開 API は変更しない
- `analyticsAdapter` の変更禁止 API を特定済み
