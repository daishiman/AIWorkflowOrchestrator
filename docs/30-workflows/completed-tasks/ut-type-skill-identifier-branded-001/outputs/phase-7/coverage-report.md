# Phase 7 カバレッジレポート

## 計測コマンド

- `pnpm --filter @repo/shared exec vitest run --coverage src/types/__tests__/skill-identifier-branded.test.ts`
- `pnpm --filter @repo/desktop exec vitest run --coverage src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx src/main/ipc/__tests__/skillHandlers.test.ts`

## 結果

- shared（限定実行）
  - lines: 0%
  - branches: 0%
  - functions: 0%
  - statements: 0%
  - 備考: グローバル閾値（65/60/80）未達でexit 1
- desktop（限定実行）
  - lines: 1.26%
  - branches: 17.79%
  - functions: 4.81%
  - statements: 1.26%
  - 備考: グローバル閾値（80/60/80）未達でexit 1

## 判定

- 閾値達成: `未達`
- Phase 8への入力: カバレッジ母集団を絞った計測設計、または対象機能追加テストが必要。

## 証跡

- `outputs/phase-7/coverage-raw.log`
