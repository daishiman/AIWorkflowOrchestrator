# PR情報（Phase 13）

## 対象タスク

- TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001

## PR本文に反映する要点

- `useSkillCenter` / `useFeaturedSkills` / `SkillCard` / `SkillDetailPanel` に欠損メタデータ防御を追加。
- `undefined.length` / `toLowerCase` 例外を誘発する入力を nullish-safe に統一。
- 欠損入力ケースの回帰テストを hooks/components に追加しクラッシュ回避を固定。

## 検証結果

- Phase 12 記録コマンド: `pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts src/renderer/views/SkillCenterView/__tests__/SkillCard.test.tsx src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`
- 結果: PASS（4 files / 78 tests）
- 手動検証スクリーンショット: `outputs/phase-11/screenshots/*.png`

## リスク

- 異常値を空表示へ吸収するため、データ不備検知が遅れる可能性。
- 対策: safe fallback とテスト固定に加え、ログ観測点を維持。
