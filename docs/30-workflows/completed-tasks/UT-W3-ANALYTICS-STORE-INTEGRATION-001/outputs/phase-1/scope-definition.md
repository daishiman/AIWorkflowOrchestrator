# Phase 1: スコープ定義

## 実行日時

2026-04-13

## スキル実行ライフサイクルと analyticsSlice の責務

| ライフサイクルイベント | 発火タイミング         | analyticsSlice が行うこと                                      |
| ---------------------- | ---------------------- | -------------------------------------------------------------- |
| `skillStart`           | スキル実行開始時       | `analyticsAdapter.send("skill_start", SkillAnalyticsEvent)`    |
| `skillComplete`        | スキル実行正常完了時   | `analyticsAdapter.send("skill_complete", SkillAnalyticsEvent)` |
| `skillError`           | スキル実行エラー終了時 | `analyticsAdapter.send("skill_error", SkillAnalyticsEvent)`    |

## 変更禁止 API リスト

| ファイル                                              | 変更禁止 API                                    | 理由                    |
| ----------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | `send`, `flush`, `isOptedOut`, `getQueueSize`   | IPC通信の抽象化レイヤー |
| `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | `getAnalyticsAdapter`, `createAnalyticsAdapter` | シングルトン管理        |
| `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | `resetAnalyticsAdapter`                         | テスト用リセット        |
| `apps/desktop/src/renderer/utils/trackEvent.ts`       | `trackEvent`, `SkillWizardEvents`               | AC-3: 公開 API 不変制約 |

## スコープ確定テーブル

| 責務                               | analyticsSlice が担う | 担わない（別コンポーネント）    |
| ---------------------------------- | --------------------- | ------------------------------- |
| スキル実行イベントの組み立て       | ✅                    |                                 |
| イベントの外部送信（IPC経由）      |                       | ✅ `analyticsAdapter` が担う    |
| IPC通信の抽象化                    |                       | ✅ `analyticsAdapter` が担う    |
| UI への analytics データ提供       |                       | ✅ 初回スコープ外（将来の拡張） |
| `trackEvent` の維持                |                       | ✅ 今回変更しない               |
| main-process `AnalyticsStore` 管理 |                       | ✅ main-process のみの責務      |

## 変更対象ファイル

| ファイル                                                                  | 変更種別 | 変更内容                                   |
| ------------------------------------------------------------------------- | -------- | ------------------------------------------ |
| `apps/desktop/src/renderer/store/slices/analyticsSlice.ts`                | 新規     | renderer-side analyticsSlice Zustand slice |
| `packages/shared/src/types/skill-analytics.ts`                            | 修正     | `SkillAnalyticsEvent` 型定義の追加         |
| `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts` | 新規     | ユニットテスト                             |

## 循環依存防止

- `analyticsSlice` → `analyticsAdapter` の一方向依存のみ
- `analyticsSlice` → `trackEvent` の依存は**禁止**
- `analyticsAdapter` → `analyticsSlice` の依存は**禁止**（循環）
