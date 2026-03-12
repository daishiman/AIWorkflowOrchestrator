# Phase 7 カバレッジレポート

## 実行コマンド

```bash
/opt/homebrew/bin/node ../../node_modules/vitest/vitest.mjs run --coverage --coverage.include=src/renderer/components/skill/SkillManagementPanel.tsx --coverage.include=src/renderer/components/skill/SkillLifecycleSessionCard.tsx --coverage.include=src/renderer/components/skill/skillButtonStyles.ts src/renderer/components/skill/__tests__/SkillManagementPanel.lifecycle-session.test.tsx src/renderer/components/skill/__tests__/SkillManagementPanel.lifecycle-failure.test.tsx src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx
```

## 対象ファイル coverage

| ファイル                        | Statements | Branches | Functions | Lines  |
| ------------------------------- | ---------- | -------- | --------- | ------ |
| `SkillLifecycleSessionCard.tsx` | 85.26%     | 62.50%   | 85.71%    | 85.26% |
| `SkillManagementPanel.tsx`      | 95.89%     | 90.43%   | 90.47%    | 95.89% |
| `skillButtonStyles.ts`          | 100%       | 100%     | 100%      | 100%   |

## 総評

- 対象3ファイル合算: Statements 92.12%, Branches 80.44%, Functions 88.57%, Lines 92.12%
- list view 既存回帰と lifecycle session card の正常系 / 失敗系は主要分岐を押さえた。
