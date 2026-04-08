# トレーサビリティ

**タスクID**: UT-SKILL-WIZARD-W2-seq-03b

## 要件 → テスト → 実装 対応表

| 要件                                                       | テストケース                                         | 実装箇所                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `DescribeStep` を index.ts から削除する                    | `DescribeStep がエクスポートされていないこと`        | `index.ts` から該当 export 行を削除                                          |
| `SkillInfoStep` を index.ts からエクスポートする           | `SkillInfoStep がエクスポートされていること`         | `index.ts` に `export { SkillInfoStep }` 追加                                |
| `SkillInfoStepProps` 型を index.ts からエクスポートする    | `SkillInfoStepProps 型がエクスポートされていること`  | `SkillInfoStep.tsx` に `export interface` + `index.ts` に `export type` 追加 |
| `ConversationRoundStep` を index.ts からエクスポートする   | `ConversationRoundStep がエクスポートされていること` | `index.ts` に該当行が存在することを確認（既存）                              |
| `ConfigureStep` / `WizardOptions` が存在しないことを契約化 | `ConfigureStep がエクスポートされていないこと` 他    | `index.ts` に該当行が存在しないことを確認                                    |
| 既存エクスポートを維持する                                 | 維持確認テスト 6 件                                  | `index.ts` の既存 export 行を保持                                            |
| `DescribeStep.tsx` に非推奨マーキングを行う                | — （テスト対象外・設計上の決定）                     | `DescribeStep.tsx` の JSDoc に `@deprecated` 追加                            |

## カバレッジサマリー

- 要件 7 件のうち、テスト対応あり: **6 件**
- テスト対象外（設計決定）: **1 件**（deprecated マーキング）
- 未対応要件: **0 件**
