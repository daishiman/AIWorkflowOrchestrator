# Phase 7 カバレッジレポート（再監査版）

更新日: 2026-03-04

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage '--coverage.include=src/renderer/views/SkillCenterView/**' src/renderer/views/SkillCenterView/__tests__
```

## 結果

| 指標        |    実測 | 目標 | 判定 |
| ----------- | ------: | ---: | ---- |
| Stmts/Lines |  96.90% |  90% | PASS |
| Branch      |  91.85% |  80% | PASS |
| Functions   | 100.00% |  90% | PASS |

## 主要ファイル抜粋

- `hooks/useSkillCenter.ts`: Line 90.19 / Branch 82.14 / Func 100
- `hooks/useFeaturedSkills.ts`: Line 100 / Branch 100 / Func 100
- `components/SkillCard.tsx`: Line 100 / Branch 94.11 / Func 100
- `components/SkillDetailPanel/SkillDetailPanel.tsx`: Line 100 / Branch 93.75 / Func 100

## 2026-03-04 追補（削除導線ホットフィックス後の再計測）

### 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/SkillCenterView/__tests__/SkillCenterView.delete-confirm.test.tsx \
  src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts \
  src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts \
  --coverage \
  --coverage.reporter=text \
  --coverage.include='src/renderer/views/SkillCenterView/index.tsx' \
  --coverage.include='src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts' \
  --coverage.include='src/renderer/views/SkillCenterView/hooks/useFeaturedSkills.ts'
```

### 結果（80%以上確認）

| 指標        |  実測 | 基準 | 判定 |
| ----------- | ----: | ---: | ---- |
| Stmts/Lines | 86.89 |  80% | PASS |
| Branch      | 84.61 |  80% | PASS |
| Functions   | 88.88 |  80% | PASS |
