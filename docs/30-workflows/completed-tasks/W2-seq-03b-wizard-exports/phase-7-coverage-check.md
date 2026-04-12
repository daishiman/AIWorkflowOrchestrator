# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 7                                |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | Phase 6                          |
| 後続Phase  | Phase 8                          |
| 作成日     | 2026-04-07                       |
| ステータス | pending                          |

## 目的

テストカバレッジを計測し、エクスポート変更に関する未確認項目を分析する。

## カバレッジ目標

| 対象                   | 目標 | 計測対象                                                                                                                                    |
| ---------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 変更契約の確認         | 100% | `DescribeStep` 系削除 / inline `GenerationMode` 除去 / `SkillInfoStepProps` 公開 / `GenerationMode` 再転送                                  |
| 回帰ガードの確認       | 100% | `ConfigureStep` / `WizardOptions` が引き続き非公開であること                                                                                |
| 維持エクスポートの確認 | 100% | `StepIndicator` / `SkillInfoStep` / `ConversationRoundStep` / `InterviewProgressBar` / `ApplySummaryCard` / `GenerateStep` / `CompleteStep` |

## カバレッジ計測コマンド

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行（カバレッジ付き）
pnpm --filter @repo/desktop test --coverage \
  --coverage.include="**/wizard/index.ts"
```

## 未到達分析の観点

### エクスポート網羅チェック

| エクスポート                                           | テストあり | 型テストあり | 備考                   |
| ------------------------------------------------------ | ---------- | ------------ | ---------------------- |
| `DescribeStep` 削除                                    | [ ]        | [ ]          | 非存在確認テスト要     |
| `DescribeStepProps` 削除                               | [ ]        | [ ]          | 型契約で確認要         |
| inline `GenerationMode` 定義除去                       | [ ]        | [ ]          | 再転送切替として確認要 |
| `SkillInfoStepProps` 追加                              | [ ]        | [ ]          | 型利用確認要           |
| `GenerationMode` 再転送                                | [ ]        | [ ]          | union 型確認要         |
| `ConfigureStep` 非公開維持                             | [ ]        | [ ]          | 回帰ガード             |
| `WizardOptions` 非公開維持                             | [ ]        | [ ]          | 回帰ガード             |
| `SkillInfoStep` 維持                                   | [ ]        | [ ]          | 存在確認要             |
| `ConversationRoundStep` / 関連型 維持                  | [ ]        | [ ]          | 存在・型確認要         |
| `InterviewProgressBar` / 関連型 維持                   | [ ]        | [ ]          | 存在確認要             |
| `ApplySummaryCard` / 関連型 維持                       | [ ]        | [ ]          | 存在確認要             |
| `StepIndicator` / `GenerateStep` / `CompleteStep` 維持 | [ ]        | [ ]          | 回帰テスト確認要       |

## トレーサビリティ確認

| 要件 ID | テストケース                             | カバー状況 |
| ------- | ---------------------------------------- | ---------- |
| AC-01   | DescribeStep 削除確認                    | [ ]        |
| AC-02   | DescribeStepProps 削除確認               | [ ]        |
| AC-03   | inline GenerationMode 定義削除確認       | [ ]        |
| AC-04   | SkillInfoStepProps 追加確認              | [ ]        |
| AC-05   | GenerationMode 再転送確認                | [ ]        |
| AC-06   | 維持エクスポート変更なし確認             | [ ]        |
| AC-07   | ConfigureStep / WizardOptions 非公開確認 | [ ]        |

## 参照資料

| 資料名           | パス                                        | 用途           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| テスト仕様書     | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`    | Phase 1 成果物 |

## 実行手順

1. Phase 6 成果物を確認する。
2. TypeScript 型チェックを実行する。
3. テストカバレッジを計測する。
4. エクスポート網羅チェックテーブルを埋める。
5. トレーサビリティ確認テーブルを埋める。

## 成果物

| 成果物                 | パス                                              | 説明                     |
| ---------------------- | ------------------------------------------------- | ------------------------ |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | 目標・計測方法           |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | 未確認エクスポートの一覧 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | 要件とテストの対応確認   |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 変更契約・回帰ガード・維持エクスポートのテストカバレッジが確認されていること
- [ ] TypeScript 型チェックがエラーなしで通過していること
- [ ] トレーサビリティ確認が完了していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 型チェック・カバレッジ計測実行
3. エクスポート網羅チェック
4. トレーサビリティ確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
