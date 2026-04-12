# 出荷準備チェックリスト

## タスクID: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001

- [x] AC-1〜AC-5 全件 PASS
- [x] typecheck エラー 0 件
- [x] lint エラー 0 件（warning のみ・既存）
- [x] wizard-exports.test.ts 9/9 PASS
- [x] 参照ゼロ確認済み
- [x] Phase 13 blocked 条件 クリア

## Phase 13 blocked 条件クリア確認

- [x] DescribeStep.tsx / DescribeStep.test.tsx 削除済み
- [x] pnpm typecheck PASS
- [x] grep -r "import.\*DescribeStep" 0件
- [x] wizard-exports.test.ts PASS
