# Phase 11: 手動テストチェックリスト — UT-SKILL-WIZARD-W2-seq-03b

| チェック項目                                                                                                      | 状態 |
| ----------------------------------------------------------------------------------------------------------------- | ---- |
| `pnpm --filter @repo/desktop typecheck` エラー 0 件                                                               | ✅   |
| `wizard-exports.test.ts` が `13/13` PASS                                                                          | ✅   |
| `wizard/index.ts` から `DescribeStep` / `DescribeStepProps` が非公開であること                                    | ✅   |
| `wizard/index.ts` から `SkillInfoStepProps` / `GenerationMode` が参照可能であること                               | ✅   |
| `DescribeStep.tsx` に `@deprecated` が付与され、型 import が直接実装元を向いていること                            | ✅   |
| Step 0 / Step 1 の代表スクリーンショット 2 枚を current task 証跡として確認したこと                               | ✅   |
| `evidence-index.md` / `screenshot-plan.json` / `phase11-capture-metadata.json` が current task に同期していること | ✅   |
