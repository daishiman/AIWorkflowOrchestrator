# Phase 5: 実装

## 目的

verify runner、result surface、proposal apply flow の実装対象を定義する。

## 想定変更ポイント

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`
- `packages/shared/src/types/skill-improver.ts`

## 実装しないこと

- create 入口の主導線統合
- handoff governance
- session persistence 詳細

## 実装完了の判断

- verify / improve / apply / re-verify の一連の責務を分けて説明できる
- Task05 と並行しても入口導線の責務を奪わない

## 完了条件

- [ ] verify / improve surface の実装対象が明記されている
- [ ] 想定変更ポイントと非対象が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
