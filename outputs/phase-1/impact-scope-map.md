# Phase 1: 影響範囲マップ — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## 新規作成対象

| ファイル                                                                                   | 種別 | 内容             |
| ------------------------------------------------------------------------------------------ | ---- | ---------------- |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`                | 新規 | 推論サービス本体 |
| `packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts` | 新規 | ユニットテスト   |

## 変更対象（既存ファイル）

| ファイル                                             | 変更内容                                   |
| ---------------------------------------------------- | ------------------------------------------ |
| `packages/shared/src/services/skillCreator/index.ts` | `inferSmartDefaults` の barrel export 追加 |

## 影響を受けるコンポーネント（将来の依存先）

| コンポーネント/タスク   | 依存内容                                                   |
| ----------------------- | ---------------------------------------------------------- |
| `SkillCreateWizard.tsx` | W2-seq-03a で本サービスをインポートして利用する            |
| W2-seq-03a              | 本タスク完了後、インライン実装を本サービスに置き換えられる |
