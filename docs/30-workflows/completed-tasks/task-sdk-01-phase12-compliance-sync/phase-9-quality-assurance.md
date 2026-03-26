# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 9                                              |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

実装済み文書と validator 結果の整合を確認し、Phase 10 最終レビューへ渡す。

## 実行タスク

- quality checklist 実行: file existence、parity、path、wording を確認する
- risk register 更新: 残リスクを severity 付きで整理する
- spec sync audit 実行: same-wave sync の抜けを確認する

## 参照資料

| 資料名                 | パス                                                                                          | 説明                 |
| ---------------------- | --------------------------------------------------------------------------------------------- | -------------------- |
| phase-5 implementation | `phase-5-implementation.md`                                                                   | 更新対象             |
| phase-8 refactoring    | `phase-8-refactoring.md`                                                                      | wording と link 整理 |
| parent workflow        | `docs/30-workflows/completed-tasks/step-01-seq-task-01-manifest-contract-foundation/index.md` | 実更新対象           |

## 実行手順

### ステップ1: quality checklist を実行する

path 実在、4点同期、Phase 12 outputs、canonical path を確認する。

### ステップ2: risk を再評価する

残る blocker と review point を severity 付きで整理する。

### ステップ3: spec sync audit を実行する

backlog、completed ledger、lessons、index 再生成の抜けを確認する。

## 統合テスト連携

| 観点   | 実施内容                                  |
| ------ | ----------------------------------------- |
| parity | root / outputs artifacts の一致確認       |
| paths  | canonical path と related file の存在確認 |
| sync   | same-wave 更新漏れ確認                    |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                      |
| -------- | ---------------------------------------------- |
| 厳密性   | error と warning の区別が明確か                |
| 監査性   | 誰が見てもリスクの優先度が分かるか             |
| 再利用性 | 同種 follow-up で使える audit 順になっているか |

## サブタスク管理

1. quality checklist 実行
2. risk register 更新
3. spec sync audit 実行
4. Phase 10 input 整理

## 成果物

| 成果物            | パス                                   | 説明          |
| ----------------- | -------------------------------------- | ------------- |
| quality checklist | `outputs/phase-9/quality-checklist.md` | 品質確認結果  |
| risk register     | `outputs/phase-9/risk-register.md`     | 残リスク      |
| spec sync audit   | `outputs/phase-9/spec-sync-audit.md`   | sync 抜け確認 |

## 完了条件

- [ ] quality checklist が実行されている
- [ ] risk register が更新されている
- [ ] spec sync audit が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 5 を参照した
- [ ] Phase 8 を参照した
- [ ] quality checklist を実行した
- [ ] risk register を更新した

## 次のPhase

Phase 10: 最終レビュー
