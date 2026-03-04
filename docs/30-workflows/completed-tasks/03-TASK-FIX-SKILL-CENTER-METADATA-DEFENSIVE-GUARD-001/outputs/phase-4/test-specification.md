# Phase 4 テスト仕様（再監査版）

更新日: 2026-03-04

## 戦略

- 欠損入力を first-class ケースとして固定する。
- Hook/Component の境界で例外を再現し、Green 化を維持する。
- UI証跡（Phase 11）と自動テスト（Phase 6/7）を連結する。

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__
pnpm --filter @repo/desktop exec vitest run --coverage '--coverage.include=src/renderer/views/SkillCenterView/**' src/renderer/views/SkillCenterView/__tests__
```

## 成功条件

- 10 files / 132 tests PASS
- Coverage: Line>=90, Branch>=80, Function>=90
