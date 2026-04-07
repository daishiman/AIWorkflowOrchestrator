# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 10                           |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 9                      |
| 後続Phase  | Phase 11                     |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

Phase 1〜9 の全成果物を統合レビューし、計装実装のリリース可否を判定する。

## 統合レビューチェックリスト

### 要件達成確認

| 要件                                                     | 達成状況 | 根拠                   |
| -------------------------------------------------------- | -------- | ---------------------- |
| `trackEvent` スタブが実装されていること                  | [ ]      | Phase 5 実装サマリー   |
| `skill_wizard_started` が空 payload で発火すること       | [ ]      | Phase 5 実装サマリー   |
| `skill_wizard_step1_completed`（complete）が発火すること | [ ]      | Phase 5 実装サマリー   |
| `skill_wizard_step1_completed`（skip）が発火すること     | [ ]      | Phase 5 実装サマリー   |
| `skill_wizard_generation_completed` が発火すること       | [ ]      | Phase 5 実装サマリー   |
| `skill_skeleton_quality_feedback` が発火すること         | [ ]      | Phase 5 実装サマリー   |
| `skill_wizard_next_action` が3種類とも発火すること       | [ ]      | Phase 5 実装サマリー   |
| 型安全な `trackEvent` が実装されていること               | [ ]      | Phase 8 リファクタ計画 |
| 将来拡張設計が文書化されていること                       | [ ]      | Phase 2 拡張設計書     |

### 品質基準達成確認

| 基準                          | 達成状況 | 根拠                   |
| ----------------------------- | -------- | ---------------------- |
| 全テスト（9ケース）が Green   | [ ]      | Phase 6 回帰テスト結果 |
| カバレッジ目標 90%/100% 達成  | [ ]      | Phase 7 カバレッジ計画 |
| TypeScript 型エラー 0 件      | [ ]      | Phase 9 品質レポート   |
| StrictMode 二重発火が評価済み | [ ]      | Phase 9 リスク台帳     |

### 依存関係確認

| 依存タスク                                 | 状態 | 確認方法                                                |
| ------------------------------------------ | ---- | ------------------------------------------------------- |
| W2-seq-03a（SkillCreateWizard改修）完了    | [ ]  | `handleQualityFeedback` が実装されていること            |
| W2-seq-03a の `handleGenerate` 実装確認    | [ ]  | `generationMethod` state が存在すること                 |
| `SkillCategory` の参照元確認               | [ ]  | `packages/shared/src/types/skill.ts` を参照していること |
| `SkillAnalytics` / `AnalyticsStore` と分離 | [ ]  | UI 計装が renderer-local に閉じていること               |

## 最終レビュー判定

| 判定     | 条件                                                      |
| -------- | --------------------------------------------------------- |
| PASS     | 全チェック項目が達成・重大な問題がないこと                |
| MINOR    | 軽微な問題のみで、是正が Phase 11 前に完了すること        |
| MAJOR    | 重大な未達成項目が 1 件以上あること                       |
| CRITICAL | 破棄再構成が必要、または Phase 1 に戻るべき問題があること |

## 統合テスト連携

- Phase 1 の AC-01〜AC-05 と Phase 4 / 6 / 7 の証跡が一致していることを確認する。
- Phase 9 の品質レポートが PASS であること、または MINOR を Phase 12 で formalize できることを確認する。
- Phase 11 は NON_VISUAL のため、最終レビューでは screenshot ではなく console / automation evidence を参照する。
- `skill_wizard_started` の空 payload と source 依存なし方針が全フェーズで一致していることを確認する。

## 参照資料

| 資料名         | パス                                     | 用途           |
| -------------- | ---------------------------------------- | -------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`      | Phase 9 成果物 |
| リスク台帳     | `outputs/phase-9/risk-register.md`       | Phase 9 成果物 |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md`   | Phase 9 成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md` | Phase 1 成果物 |

## 実行タスク

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
- [ ] 最終レビュー判定が PASS または MINOR であること
- [ ] 5計装ポイントの全達成確認が完了していること
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
