# Phase 4 テスト仕様

## テスト戦略

- 既知不具合の再現テストを先に固定し、修正後の回帰で守る。
- 境界値（null/undefined/0件）を優先して追加。

## 対象ファイル

- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useFeaturedSkills.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillCard.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCard.test.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`

## 実行コマンド

- `pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts src/renderer/views/SkillCenterView/__tests__/SkillCard.test.tsx src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`
