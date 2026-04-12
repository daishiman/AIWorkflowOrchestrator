# Phase 1: 受け入れ基準 — UT-SKILL-WIZARD-W2-seq-03b

## 受け入れ基準一覧

| ID    | 受け入れ基準                                                                                 | 検証方法                                  |
| ----- | -------------------------------------------------------------------------------------------- | ----------------------------------------- |
| AC-01 | `wizard/index.ts` から `DescribeStep` のエクスポートが削除されていること                     | grep で非存在確認 + TypeScript コンパイル |
| AC-02 | `wizard/index.ts` から `DescribeStepProps` の型エクスポートが削除されていること              | grep で非存在確認 + TypeScript コンパイル |
| AC-03 | `wizard/index.ts` から `GenerationMode` のインライン定義が削除されていること                 | grep で非存在確認                         |
| AC-04 | `wizard/index.ts` から `SkillInfoStepProps` の型エクスポートが存在すること                   | TypeScript コンパイル + import テスト     |
| AC-05 | `SkillInfoStep.tsx` の `SkillInfoStepProps` が `export` 付きで定義されていること             | grep で確認                               |
| AC-06 | `GenerationMode` が `wizard/index.ts` から引き続きインポート可能であること（再エクスポート） | TypeScript コンパイルで確認               |
| AC-07 | `StepIndicator`/`GenerateStep`/`CompleteStep` が引き続きエクスポートされていること           | TypeScript コンパイル + テスト            |
| AC-08 | `pnpm --filter @repo/desktop typecheck` がエラー 0 件で通過すること                          | CI 実行                                   |
| AC-09 | `DescribeStep.tsx` に `@deprecated` JSDoc が付与されていること                               | コードレビュー                            |
