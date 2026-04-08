# リファクタ計画

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b

## 目的

`index.ts` のエクスポート順序を論理グループ化し、将来の追加・削除時の可読性を向上させる。

## 現状の課題

現在の `index.ts` はコンポーネント追加順に並んでいる。Step 番号順・機能グループ順への整理が望ましい。

## リファクタ方針

### グループ化案

```typescript
// ─── Step インジケーター ───────────────────────────────
export { StepIndicator, stepStateStyles } from "./StepIndicator";
export type { StepState, StepIndicatorProps } from "./StepIndicator";

// ─── Step 0: スキル基本情報 ───────────────────────────
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";

// ─── Step 1: インタビュー ─────────────────────────────
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";
export { InterviewProgressBar } from "./InterviewProgressBar";
export type { InterviewProgressBarProps } from "./InterviewProgressBar";

// ─── Step 2: 生成 ─────────────────────────────────────
export { ApplySummaryCard } from "./ApplySummaryCard";
export type { ApplySummaryCardProps } from "./ApplySummaryCard";
export { GenerateStep } from "./GenerateStep";
export type { ... } from "./GenerateStep";

// ─── Step 3: 完了 ─────────────────────────────────────
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps, GeneratedSkill } from "./CompleteStep";
```

## 優先度

低（機能変更なし、可読性改善のみ）。別タスクで対応推奨。

## 前提条件

- 全テスト PASS 後に実施
- 変更後にテスト再実行で回帰がないことを確認
