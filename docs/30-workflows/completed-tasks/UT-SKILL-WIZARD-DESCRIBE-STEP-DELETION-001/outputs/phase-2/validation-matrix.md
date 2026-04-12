# Validation Matrix - AC-1〜AC-5

## タスクID: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001

| AC   | 検証コマンド                                                                           | 期待結果            |
| ---- | -------------------------------------------------------------------------------------- | ------------------- |
| AC-1 | `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                | No such file        |
| AC-2 | `ls apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx` | No such file        |
| AC-3 | `pnpm typecheck`                                                                       | exit code 0         |
| AC-4 | `grep -r "import.*DescribeStep" apps/ packages/`                                       | 出力なし（空）      |
| AC-5 | `pnpm test`                                                                            | wizard-exports PASS |
