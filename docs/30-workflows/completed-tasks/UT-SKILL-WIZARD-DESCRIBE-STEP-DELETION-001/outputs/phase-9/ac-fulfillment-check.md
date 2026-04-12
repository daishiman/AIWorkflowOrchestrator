# AC 充足確認一覧

## 実行日: 2026-04-11

| ID   | 基準                                                | 検証コマンド                                     | 結果        |
| ---- | --------------------------------------------------- | ------------------------------------------------ | ----------- |
| AC-1 | DescribeStep.tsx が存在しない                       | `ls .../wizard/DescribeStep.tsx`                 | PASS        |
| AC-2 | DescribeStep.test.tsx が存在しない                  | `ls .../wizard/__tests__/DescribeStep.test.tsx`  | PASS        |
| AC-3 | pnpm typecheck がエラーなく通過する                 | `pnpm typecheck`                                 | PASS        |
| AC-4 | DescribeStep を import している箇所がない           | `grep -r "import.*DescribeStep" apps/ packages/` | PASS        |
| AC-5 | wizard-exports.test.ts のテストが新規作成・パスする | `pnpm test`                                      | PASS（9/9） |

## 全 AC 充足: ✅
