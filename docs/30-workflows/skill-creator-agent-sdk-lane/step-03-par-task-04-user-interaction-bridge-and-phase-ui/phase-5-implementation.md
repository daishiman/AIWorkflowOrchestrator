# Phase 5: 実装

## 目的

bridge API、UI component contract、awaiting input state の実装対象を定義する。

## 想定変更ポイント

- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

## 実装しないこと

- create 入口の最終一本化
- verify / improve result surface
- session persistence

## 実装完了の判断

- question type と UI input 形式の対応表を作れる
- Task05 に入口設計を渡しつつ、interaction bridge 自体は独立責務に保てる

## 完了条件

- [ ] bridge / UI / state の実装対象が整理されている
- [ ] 想定変更ポイントと非対象が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
