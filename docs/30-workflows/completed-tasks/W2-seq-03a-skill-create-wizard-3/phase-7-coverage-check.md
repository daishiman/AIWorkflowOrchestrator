# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 7                                          |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 6                                    |
| 後続Phase  | Phase 8                                    |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

テストカバレッジを計測し、未到達コードを分析して追加テストの要否を判断する。

## カバレッジ目標

| 対象ファイル              | 目標カバレッジ | 計測対象                           |
| ------------------------- | -------------- | ---------------------------------- |
| `SkillCreateWizard.tsx`   | 80% 以上       | 行カバレッジ・分岐カバレッジ       |
| `GenerateStep.tsx`        | 80% 以上       | `generationMode` 削除後の分岐      |
| `CompleteStep.tsx`        | 80% 以上       | action cards / 外部連携 / recovery |
| `inferSmartDefaults` 関数 | 90% 以上       | 全推論ルール分岐                   |

## カバレッジ計測コマンド

```bash
pnpm --filter @repo/desktop test --coverage \
  --coverage.include="**/SkillCreateWizard.tsx" \
  --coverage.include="**/wizard/GenerateStep.tsx" \
  --coverage.include="**/wizard/CompleteStep.tsx"
```

## 未到達分析の観点

### 推論ルール分岐の未到達チェック

| 分岐                             | カバー状況 | 未到達理由（予想）         |
| -------------------------------- | ---------- | -------------------------- |
| purpose に "GitHub" を含む       | [ ]        | テストケース未追加の可能性 |
| purpose に "Notion" を含む       | [ ]        | テストケース未追加の可能性 |
| purpose に "リアルタイム" を含む | [ ]        | テストケース未追加の可能性 |
| category === "data-analysis"     | [ ]        | テストケース未追加の可能性 |
| category === "code-support"      | [ ]        | テストケース未追加の可能性 |

### handleGenerate エラーパスの未到達チェック

| 分岐                              | カバー状況 | 未到達理由（予想）   |
| --------------------------------- | ---------- | -------------------- |
| LLM 生成 Promise reject           | [ ]        | モック設定が必要     |
| isGenerating 中の二重呼び出し防止 | [ ]        | 競合状態テストが必要 |

### レンダリング分岐の未到達チェック

| 分岐              | カバー状況 | 未到達理由（予想）                 |
| ----------------- | ---------- | ---------------------------------- |
| currentStep === 0 | [ ]        | SkillInfoStep レンダリング         |
| currentStep === 1 | [ ]        | ConversationRoundStep レンダリング |
| currentStep === 2 | [ ]        | GenerateStep レンダリング          |
| currentStep === 3 | [ ]        | CompleteStep レンダリング          |

## トレーサビリティ確認

| 要件 ID | テストケース                            | カバー状況 |
| ------- | --------------------------------------- | ---------- |
| AC-01   | description/options/generationMode 削除 | [ ]        |
| AC-02   | STEPS 名変更                            | [ ]        |
| AC-03   | inferSmartDefaults                      | [ ]        |
| AC-04   | handleStep0Next                         | [ ]        |
| AC-05   | handleGenerate                          | [ ]        |
| AC-06   | handleQualityFeedback                   | [ ]        |
| AC-07   | handleRetry / skillPath                 | [ ]        |

## 参照資料

| 資料名           | パス                                        | 用途           |
| ---------------- | ------------------------------------------- | -------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | Phase 6 成果物 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | Phase 6 成果物 |
| テスト仕様書     | `outputs/phase-4/test-specification.md`     | Phase 4 成果物 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`    | Phase 1 成果物 |

## 実行手順

1. Phase 6 成果物を確認する。
2. カバレッジ計測コマンドを実行する。
3. 未到達コードを分析し、一覧化する。
4. 追加テストが必要な箇所を特定する。
5. トレーサビリティ確認テーブルを埋める。

## 成果物

| 成果物                 | パス                                              | 説明                   |
| ---------------------- | ------------------------------------------------- | ---------------------- |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | 目標・計測方法         |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`      | 未到達箇所の一覧と対策 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | 要件とテストの対応確認 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] カバレッジ目標（80% / 90%）を達成していること
- [ ] 未到達コードが分析されていること
- [ ] トレーサビリティ確認が完了していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. カバレッジ計測実行
3. 未到達分析
4. トレーサビリティ確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
