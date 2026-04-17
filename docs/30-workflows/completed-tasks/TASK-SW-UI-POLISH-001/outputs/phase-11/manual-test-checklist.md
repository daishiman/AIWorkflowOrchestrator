# Phase 11: 手動テストチェックリスト

## タスクID: TASK-SW-UI-POLISH-001

## 実施項目

| 項目                | 状態 | 確認内容                                   |
| ------------------- | ---- | ------------------------------------------ |
| Step 0 カテゴリ上限 | PASS | 3 件選択後に未選択ボタンが disabled になる |
| Step 0 カテゴリ解除 | PASS | 選択済みカテゴリは上限到達後でも解除できる |
| Step 0 ライトテーマ | PASS | CSS 変数ベースの色で崩れがない             |
| Step 0 ダークテーマ | PASS | CSS 変数ベースの色で崩れがない             |
| Step 1 ProgressBar  | PASS | 回答更新後もバーが滑らかに更新される       |
| Step 1 ライトテーマ | PASS | 進捗バーの見え方が破綻しない               |
| Step 1 ダークテーマ | PASS | 進捗バーの見え方が破綻しない               |

## 実施方法

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx src/renderer/components/skill/wizard/__tests__/InterviewProgressBar.test.tsx`
- `node apps/desktop/scripts/capture-task-sw-ui-polish-phase11.mjs`
