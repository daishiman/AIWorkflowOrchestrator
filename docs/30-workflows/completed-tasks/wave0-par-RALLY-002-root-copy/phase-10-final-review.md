# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 10                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | Phase 9                                |
| 後続Phase  | Phase 11                               |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |
| 実装モード | verify_existing                        |

## 目的

RALLY-002 が単体で閉じた verify_existing タスクとして完了可能かを最終確認する。ここで見るのは Phase 1 の AC-1〜AC-5 のみであり、RALLY-001/003/005/006/007/010〜013 の実装完了は要求しない。

## 実行タスク

1. AC-1〜AC-5 の達成状況を確認する。
2. `typecheck` / `eslint` / `vitest` の結果を踏まえて release readiness を整理する。
3. Phase 11 へ進んでよいか gate 判定を記録する。

## 参照資料

| 資料名         | パス                                       | 用途         |
| -------------- | ------------------------------------------ | ------------ |
| Phase 1 AC     | `outputs/phase-1/acceptance-criteria.md`   | 判定基準     |
| Phase 9 品質   | `outputs/phase-9/quality-report.md`        | 品質結果     |
| Phase 9 監査   | `outputs/phase-9/four-conditions-audit.md` | 4条件結果    |
| Phase 9 リスク | `outputs/phase-9/risk-register.md`         | 残リスク確認 |

## 実行手順

1. AC-1〜AC-5 ごとに evidence を確認する。
2. `final-review-result.md` に判定結果を記録する。
3. `release-readiness-checklist.md` に残リスクと制約を記録する。
4. `gate-decision.md` に PASS / MINOR / MAJOR を記録する。

## 統合テスト連携

- PASS 条件は「RALLY-002 に対する新規矛盾なし」「後続 handoff に必要な説明あり」「静的検証結果あり」とする。
- `vitest` の環境制約は gate に明記する。

## 成果物

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-10/gate-decision.md`
- `outputs/phase-10/release-readiness-checklist.md`

## 完了条件

- [ ] AC-1〜AC-5 の判定を記録した
- [ ] gate 判定を記録した
- [ ] 制約込みの readiness を記録した

## タスク100%実行確認【必須】

- [ ] Phase 10 の3成果物を作成した
- [ ] RALLY-002 の外側を gate 条件に含めていない

## 次のPhase

Phase 11: 手動テスト検証
