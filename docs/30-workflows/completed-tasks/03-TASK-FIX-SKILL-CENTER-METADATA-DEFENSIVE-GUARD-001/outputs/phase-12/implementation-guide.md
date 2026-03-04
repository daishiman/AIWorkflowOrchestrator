# Phase 12 実装ガイド

## Part 1: 概要

- タスク: SkillCenter メタデータ欠落時の防御実装
- 解決方針: hooks/componentsに safeLength / normalizeSearchText / nullish default を導入し防御。

## Part 2: 実装詳細

### 変更ファイル

- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useFeaturedSkills.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillCard.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCard.test.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`

### テスト

- 実行コマンド: `pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts src/renderer/views/SkillCenterView/__tests__/SkillCard.test.tsx src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`
- 結果: 4 files / 78 tests PASS

### 再現手順（要点）

1. 既存不具合シナリオを実行する。
2. 修正後挙動が安定することを確認する。
3. 回帰テストを実行して固定する。
