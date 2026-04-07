# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 10                                          |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 9                                     |
| 後続Phase  | Phase 11                                    |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

受け入れ基準（AC-01〜09）を全件確認し、Phase 11（手動テスト）へ進めるかを判定するゲートを通過する。

## 実行タスク

- 受け入れ基準確認: AC-01〜09 を全件チェックする
- Phase 1-9 成果物の整合性確認: 各フェーズ成果物が矛盾なく繋がっているかを確認する
- MINOR 指摘の未タスク化: MINOR 指摘を未タスク候補として記録する
- 出荷準備確認: Phase 11 手動テストへ進む条件が揃っているかを確認する

## 受け入れ基準チェックリスト

| AC-ID | 基準                                                                                   | 確認方法                                    |
| ----- | -------------------------------------------------------------------------------------- | ------------------------------------------- |
| AC-01 | `SkillCreatorAPI` interface に `onApprovalRequest` メソッドが定義されている            | `skill-creator-api.ts` interface を目視確認 |
| AC-02 | `skillCreatorAPI` オブジェクトに `onApprovalRequest` 実装が追加されている              | `skillCreatorAPI` オブジェクトを目視確認    |
| AC-03 | `onApprovalRequest` が `APPROVAL_REQUEST` チャンネルを `safeOn` で正しく購読する       | TC-APPR-02 PASS 確認                        |
| AC-04 | `SkillLifecyclePanel.tsx` が `onApprovalRequest` を消費して `ApprovalSheet` を表示する | TC-APPR-07 PASS 確認                        |
| AC-05 | approve / reject 操作が `respondToApproval` に接続されている                           | TC-APPR-08/09 PASS 確認                     |
| AC-06 | `preload/index.ts` の同名メソッドと型シグネチャが対称である                            | 型定義を比較確認                            |
| AC-07 | TypeScript コンパイルエラーなし（`pnpm typecheck` PASS）                               | Phase 9 品質レポート確認                    |
| AC-08 | ESLint エラーなし（`pnpm lint` PASS）                                                  | Phase 9 品質レポート確認                    |
| AC-09 | Vitest テスト PASS（新規テストケースを含む）                                           | Phase 9 品質レポート確認                    |

## ゲート判定基準

| 判定             | 条件                                   | アクション                 |
| ---------------- | -------------------------------------- | -------------------------- |
| PASS             | MAJOR 0件、AC 全件 PASS                | Phase 11 へ進む            |
| CONDITIONAL_PASS | MAJOR 0件・MINOR 1件以上、AC 全件 PASS | MINOR を未タスク化して進む |
| FAIL             | MAJOR 1件以上または AC 未達            | 該当 Phase へ差し戻す      |

## 参照資料

| 参照資料                                                        | パス                                               | 説明           |
| --------------------------------------------------------------- | -------------------------------------------------- | -------------- |
| 品質レポート                                                    | `outputs/phase-9/quality-report.md`                | Phase 9 成果物 |
| リスク台帳                                                      | `outputs/phase-9/risk-register.md`                 | Phase 9 成果物 |
| 受け入れ基準                                                    | `outputs/phase-1/acceptance-criteria.md`           | Phase 1 成果物 |
| トレーサビリティ行列                                            | `outputs/phase-1/traceability-matrix.md`           | Phase 1 成果物 |
| 依存整合マトリクス                                              | `outputs/phase-2/dependency-consistency-matrix.md` | Phase 2 成果物 |
| 契約差分                                                        | `outputs/phase-5/contract-diff.md`                 | Phase 5 成果物 |
| カバレッジ計画 outputs/phase-7/uncovered-analysis-plan.md       | `outputs/phase-7/coverage-plan.md`                 | Phase 7 成果物 |
| リファクタリング計画 outputs/phase-8/post-refactor-test-plan.md | `outputs/phase-8/refactoring-plan.md`              | Phase 8 成果物 |

## 実行手順

1. Phase 9 成果物を確認する。
2. 受け入れ基準チェックリストを全件実施する。
3. MAJOR/MINOR/PASS を判定する。
4. MINOR 指摘を未タスク候補として記録する。
5. Phase 13 は user approval 未取得なら blocked を維持し、commit / PR の導線を記録しない。
6. ゲート判定を `outputs/phase-10/gate-decision.md` に記録する（final-review-result.md 内に含める）。

## 成果物

| 成果物           | パス                                              | 説明                   |
| ---------------- | ------------------------------------------------- | ---------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | AC確認結果・ゲート判定 |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md`      | MINOR指摘と対応計画    |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | Phase 11 進行条件確認  |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] AC-01〜09 全件確認済み
- [ ] ゲート判定が記録されている（PASS / CONDITIONAL_PASS / FAIL）
- [ ] MINOR 指摘が未タスク候補として記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
```

## 次のPhase

Phase 11: 手動テスト検証
