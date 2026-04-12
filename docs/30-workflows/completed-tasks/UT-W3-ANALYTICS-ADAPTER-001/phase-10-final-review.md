# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 10                                                           |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 9                                                      |
| 後続Phase  | Phase 11                                                     |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

AC-1〜AC-9の充足確認・既存W3-seq-04計装ポイントへの影響なし確認・
CSPセキュリティポリシーの最終確認を行い、Phase 11（手動テスト）への進行可否を判定する。

## 実行タスク

### タスク1: AC充足確認（AC-1〜AC-9全点検）

**目的**: 全受入条件が満たされているかを確認する

**実行手順**:

1. AC-1: 本番環境（`NODE_ENV=production`）でのanalytics sink送信確認
2. AC-2: IPC経由アプローチによるCSP非抵触確認
3. AC-3: オフライン時キュー保持・オンライン復帰後送信確認（テスト結果から）
4. AC-4: オプトアウト設定時の送信停止確認（テスト結果から）
5. AC-5: `trackEvent`公開APIシグネチャ不変確認（contract-diff.md参照）
6. AC-6: `SkillCreateWizard.tsx`の変更がないまたは最小であること確認
7. AC-7: analyticsAdapterテストカバレッジ90%+確認
8. AC-8: `pnpm typecheck/lint/test`全PASS確認
9. AC-9: 初期化失敗時no-opフォールバックテスト確認

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

### タスク2: 既存計装ポイントへの影響確認

**目的**: W3-seq-04で確立した計装ポイントが正常に機能することを確認する

**実行手順**:

1. `SkillCreateWizard.tsx`の5計装ポイントが変更されていないことを確認する
2. `SkillCreateWizard.tracking.test.tsx`が全件PASSしていることを確認する
3. `trackEvent.test.ts`が全件PASSしていることを確認する（回帰なし）
4. W3-seq-04のイベント型（`SkillWizardEvents`）が変更されていないことを確認する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`（計装確認セクション）

### タスク3: 出荷準備チェックリスト

**目的**: マージ前の最終確認事項を整理する

**実行手順**:

1. 出荷準備チェックリストを確認する
2. 全項目がPASSであることを確認する
3. MINORの場合は対応方針を記録する
4. 未タスク候補（MINOR判定の指摘事項）を特定する（Phase 12 Task 4の準備）

**期待される成果物**:

- `outputs/phase-10/release-readiness-checklist.md`

### タスク4: 最終レビュー判定

**目的**: PASS/MINOR/MAJOR/CRITICALの最終判定を行う

**実行手順**:

1. 全レビュー観点の結果を集計する
2. 判定基準テーブルに従い総合判定を行う
3. MAJOR以上の指摘がある場合は影響範囲に応じて戻り先を決定する
4. Phase 11進行可否を明記する

**期待される成果物**:

- `outputs/phase-10/corrective-action-plan.md`（MINOR以上の場合）

## レビュー観点

| 観点                   | チェック内容                             | 判定基準      |
| ---------------------- | ---------------------------------------- | ------------- |
| AC-1: 本番送信         | NODE_ENV=productionでのsink送信確認      | PASS/MAJOR    |
| AC-2: CSP非抵触        | IPC経由・CSPエラーなし                   | PASS/CRITICAL |
| AC-3: オフラインキュー | キュー保持・オンライン復帰後ドレイン確認 | PASS/MAJOR    |
| AC-4: オプトアウト     | 送信停止・オプトアウト設定連動確認       | PASS/MAJOR    |
| AC-5: API不変          | trackEvent公開APIシグネチャ変更なし      | PASS/CRITICAL |
| AC-6: 最小変更         | SkillCreateWizard.tsx変更最小            | PASS/MAJOR    |
| AC-7: カバレッジ       | analyticsAdapter 90%+・trackEvent 100%   | PASS/MAJOR    |
| AC-8: CI PASS          | typecheck/lint/test全通過                | PASS/CRITICAL |
| AC-9: フォールバック   | 初期化失敗時no-op・エラー非スロー        | PASS/MAJOR    |
| セキュリティ           | CSP設定・webSecurity維持                 | PASS/CRITICAL |

## レビュー結果判定基準

| 判定     | 条件             | 次のアクション            |
| -------- | ---------------- | ------------------------- |
| PASS     | 全観点でPASS     | Phase 11へ進行            |
| MINOR    | 軽微な指摘あり   | 指摘対応後Phase 11へ      |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザー確認 |

## 戻り先決定基準

| 問題の種類       | 戻り先                |
| ---------------- | --------------------- |
| 要件の問題       | Phase 1（要件定義）   |
| 設計の問題       | Phase 2（設計）       |
| テスト設計の問題 | Phase 4（テスト）     |
| 実装の問題       | Phase 5（実装）       |
| 品質の問題       | Phase 8（リファクタ） |

## 参照資料

| 参照資料                   | パス                                              |
| -------------------------- | ------------------------------------------------- |
| Phase 9 品質レポート       | `outputs/phase-9/quality-report.md`               |
| Phase 5 API変更なし証跡    | `outputs/phase-5/contract-diff.md`                |
| Phase 7 カバレッジレポート | `outputs/phase-7/traceability-coverage-report.md` |
| Phase 1 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`          |

## 成果物

| 成果物             | パス                                              | 内容                          |
| ------------------ | ------------------------------------------------- | ----------------------------- |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md`         | AC全点検・計装確認結果        |
| 出荷準備チェック   | `outputs/phase-10/release-readiness-checklist.md` | 最終確認チェックリスト        |
| 是正アクション計画 | `outputs/phase-10/corrective-action-plan.md`      | MINOR以上の対応方針（必要時） |

## 完了条件

- [ ] AC-1〜AC-9が全てPASS（またはMINOR対応済み）
- [ ] 既存計装テスト（SkillCreateWizard.tracking.test.tsx）が全件PASS
- [ ] セキュリティポリシー最終確認完了
- [ ] Phase 11進行可否が明確に判定されていること
- [ ] MINOR指摘がある場合は未タスク候補として特定済み
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 11: 手動テスト（NON_VISUAL）
