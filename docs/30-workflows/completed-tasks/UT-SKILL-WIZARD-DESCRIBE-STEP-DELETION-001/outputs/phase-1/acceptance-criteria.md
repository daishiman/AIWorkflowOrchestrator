# 受け入れ基準 - AC-1〜AC-5

## タスクID: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001

| ID   | 基準                                                                    | 検証コマンド                                                                           | 期待結果       |
| ---- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------- |
| AC-1 | `DescribeStep.tsx` が存在しない                                         | `ls apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                | No such file   |
| AC-2 | `DescribeStep.test.tsx` が存在しない                                    | `ls apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx` | No such file   |
| AC-3 | `pnpm typecheck` がエラーなく通過する                                   | `pnpm typecheck`                                                                       | exit code 0    |
| AC-4 | `DescribeStep` を import している箇所がない                             | `grep -r "import.*DescribeStep" apps/ packages/`                                       | 出力なし（空） |
| AC-5 | `wizard-exports.test.ts` の DescribeStep 確認テストが新規作成・パスする | `pnpm test`                                                                            | PASS           |
