# Phase 5: 実装

## 目的

主導線 UI、補助導線 UI、遷移条件の実装対象を確定する。

## 想定変更ポイント

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`
- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`

## 実装しないこと

- verify contract の詳細化
- governance / handoff rule
- session / resume 契約

## 実装完了の判断

- 一次入口と補助入口の区別を画面遷移で説明できる
- Task06 と同時進行しても共通 component の競合が限定される

## 完了条件

- [ ] mainline / secondary 導線が分離されている
- [ ] 想定変更ポイントと非対象が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
