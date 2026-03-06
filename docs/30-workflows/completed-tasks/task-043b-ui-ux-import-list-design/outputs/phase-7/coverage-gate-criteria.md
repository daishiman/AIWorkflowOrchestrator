# Phase 7 coverage gate 条件

## Pass 条件

- 対象 2 テストファイルが PASS
- `SkillManagementPanel.tsx` が line 90 / branch 85 / function 85 以上
- `SkillImportDialog.tsx` が line 70 / branch 75 / function 65 以上
- jest-axe violation 0
- typecheck PASS
- screenshot 証跡を Phase 11 で取得可能

## Fail 条件

- row importing / success focus / failure alert のいずれかが未テスト
- `importSkill` 契約を誤読して success 判定を resolve 依存に戻す
- dialog / panel で error alert が二重化する
- new IPC / Store state を追加する

## 実行結果

- `SkillManagementPanel.test.tsx`: PASS
- `SkillManagementPanel.integration.test.tsx`: PASS
- `pnpm --filter @repo/desktop typecheck`: PASS
- Gate 判定: PASS
