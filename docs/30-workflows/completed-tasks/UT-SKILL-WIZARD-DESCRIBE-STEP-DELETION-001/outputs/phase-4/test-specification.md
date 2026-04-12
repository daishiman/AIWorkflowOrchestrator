# テスト仕様書 - wizard-exports.test.ts

## タスクID: UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001

## テストマトリクス

| TC番号  | テスト名                                    | 対象                                      | 期待結果       |
| ------- | ------------------------------------------- | ----------------------------------------- | -------------- |
| TC-1-01 | wizard-exports.test.ts を新規作成する       | `wizard/__tests__/wizard-exports.test.ts` | 作成完了       |
| TC-1-02 | DescribeStep がエクスポートされていないこと | `wizard/index.ts`                         | PASS           |
| TC-1-03 | pnpm typecheck 通過確認                     | プロジェクト全体                          | exit code 0    |
| TC-1-04 | import 参照の全量検索が空であること         | `apps/` および `packages/`                | 出力なし（空） |
| TC-1-05 | wizard-exports.test.ts の実行結果が PASS    | `wizard/__tests__/wizard-exports.test.ts` | PASS           |

## 作成ファイル

`apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts`

新規作成済み。DescribeStep 非存在テストと既存エクスポートの正常確認テストを含む。
