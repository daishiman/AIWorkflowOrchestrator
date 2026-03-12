# Phase 6 テスト拡充結果

## 追加テスト

- `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.lifecycle-failure.test.tsx`
  - 4 tests
  - detectMode failure / validateSkill failure / execute failure / auto improve failure

## 実行コマンド

```bash
/opt/homebrew/bin/node ../../node_modules/vitest/vitest.mjs run src/renderer/components/skill/__tests__/SkillManagementPanel.lifecycle-session.test.tsx src/renderer/components/skill/__tests__/SkillManagementPanel.lifecycle-failure.test.tsx src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx
```

## 結果

- Test Files: 4 passed
- Tests: 29 passed

## 補足

- panel のグローバル error banner は import / list 管理系に限定し、ライフサイクル系 error は session card 側に寄せた。
- `validateSkill` を create 後の非 blocking 検証として追加した。
