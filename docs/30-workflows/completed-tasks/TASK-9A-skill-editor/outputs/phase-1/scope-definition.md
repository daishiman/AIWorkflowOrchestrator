# Phase 1 スコープ定義

## In Scope

- `apps/desktop/src/renderer/components/skill/SkillEditor.tsx` 新規
- `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` 新規
- `apps/desktop/src/renderer/components/skill/__tests__/SkillEditor.test.tsx` 新規
- `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx` 新規
- `apps/desktop/src/renderer/components/skill/__tests__/buildFileTree.test.ts` 新規
- `apps/desktop/src/renderer/components/skill/__tests__/getLanguage.test.ts` 新規
- `apps/desktop/src/renderer/components/skill/index.ts` export 追加

## Out of Scope

- Main/IPC の追加機能開発（TASK-9A-A/B 実装済みを利用）
- PR作成/コミット（本依頼で禁止）
- モナコエディタ等の高度編集機能
- リアルタイム共同編集

## 依存関係

- TASK-9A-A: SkillFileManager
- TASK-9A-B: skillFileHandlers / preload skill-api

## 判定

スコープ確定（PASS）
