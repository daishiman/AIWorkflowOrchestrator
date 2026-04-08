# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 10                                         |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 9                                    |
| 後続Phase  | Phase 11                                   |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

Phase 1〜9 の全成果物を統合レビューし、リリース可否を判定する。

## 統合レビューチェックリスト

### 要件達成確認

| 要件                                                                                                                                              | 達成状況 | 根拠                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------- |
| `description` / `options` state が削除されていること                                                                                              | [ ]      | Phase 5 実装サマリー |
| `generationMode` state が削除されていること                                                                                                       | [ ]      | Phase 5 実装サマリー |
| 全 `template` 条件分岐が除去されていること                                                                                                        | [ ]      | Phase 5 契約差分     |
| `formData` / `answers` / `smartDefaults` / `generationMethod` state が追加されていること                                                          | [ ]      | Phase 5 実装サマリー |
| `skillPath` state が追加されていること                                                                                                            | [ ]      | Phase 5 実装サマリー |
| `hasExternalIntegration` / `externalToolName` state が追加されていること                                                                          | [ ]      | Phase 5 実装サマリー |
| `inferSmartDefaults` 関数が実装されていること                                                                                                     | [ ]      | Phase 5 実装サマリー |
| STEPS が `["スキル情報入力", "詳細設定", "生成", "完了"]` になっていること                                                                        | [ ]      | Phase 5 実装サマリー |
| Step 0 で `<SkillInfoStep>` がレンダリングされること                                                                                              | [ ]      | Phase 11 手動テスト  |
| Step 1 で `<ConversationRoundStep>` が `onAnswersChange` / `onBack` 付きでレンダリングされること                                                  | [ ]      | Phase 11 手動テスト  |
| Step 2 で `<GenerateStep>` が `generationMode` なしでレンダリングされること                                                                       | [ ]      | Phase 5 実装サマリー |
| Step 3 で `<CompleteStep>` が `skillPath` / `hasExternalIntegration` / `externalToolName` / action cards / `onRetry` 付きでレンダリングされること | [ ]      | Phase 11 手動テスト  |
| `handleStep0Next` が実装されていること                                                                                                            | [ ]      | Phase 5 実装サマリー |
| `handleGenerate(method)` が `ConversationRoundStep` の onGenerate 契約と整合していること                                                          | [ ]      | Phase 5 実装サマリー |
| `handleQualityFeedback(satisfied)` が実装されていること                                                                                           | [ ]      | Phase 5 実装サマリー |
| `handleRetry()` が実装されていること                                                                                                              | [ ]      | Phase 5 実装サマリー |

### 品質基準達成確認

| 基準                        | 達成状況 | 根拠                   |
| --------------------------- | -------- | ---------------------- |
| 全テストが Green であること | [ ]      | Phase 6 回帰テスト結果 |
| カバレッジ目標 80%/90% 達成 | [ ]      | Phase 7 カバレッジ計画 |
| 静的解析エラー 0 件         | [ ]      | Phase 9 品質レポート   |
| TypeScript 型エラー 0 件    | [ ]      | Phase 9 品質レポート   |

### 依存関係確認

| 依存タスク                              | 状態 | 確認方法                                           |
| --------------------------------------- | ---- | -------------------------------------------------- |
| W0-seq-01（型定義）完了                 | [ ]  | `SkillInfoFormData` 等の型が解決できること         |
| W1-par-02a（SkillInfoStep）完了         | [ ]  | `SkillInfoStep.tsx` ファイルが存在すること         |
| W1-par-02b（ConversationRoundStep）完了 | [ ]  | `ConversationRoundStep.tsx` ファイルが存在すること |
| W1-par-02c（CompleteStep）完了          | [ ]  | `CompleteStep.tsx` ファイルが存在すること          |

## 最終レビュー判定

| 判定        | 条件                                               |
| ----------- | -------------------------------------------------- |
| PASS        | 全チェック項目が達成・重大な問題がないこと         |
| CONDITIONAL | 軽微な問題のみで、是正が Phase 11 前に完了すること |
| FAIL        | 重大な未達成項目が 1 件以上あること                |

## 参照資料

| 資料名         | パス                                     | 用途           |
| -------------- | ---------------------------------------- | -------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`      | Phase 9 成果物 |
| リスク台帳     | `outputs/phase-9/risk-register.md`       | Phase 9 成果物 |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md`   | Phase 9 成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |

## 実行手順

1. Phase 1〜9 の全成果物を一覧化する。
2. 統合レビューチェックリストを評価する。
3. 是正が必要な場合は是正計画を作成する。
4. 最終レビュー判定を記録する。
5. 出荷準備チェックリストを作成する。

## 成果物

| 成果物           | パス                                              | 説明                     |
| ---------------- | ------------------------------------------------- | ------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | 統合レビュー評価結果     |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md`      | 問題がある場合の是正計画 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | リリース可否チェック     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 最終レビュー判定が PASS または CONDITIONAL であること
- [ ] 全要件達成確認が完了していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 統合レビューチェックリスト評価
3. 是正計画作成（必要時）
4. 最終レビュー判定記録
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 11: 手動テスト
