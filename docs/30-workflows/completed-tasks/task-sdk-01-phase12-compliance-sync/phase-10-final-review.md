# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 10                                             |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

受入基準、validator、risk を総合し、Phase 11 へ進めるかを判定する。

## 実行タスク

- AC 最終確認: AC-1 から AC-5 を再確認する
- open findings 整理: unresolved item を列挙する
- review 判定: PASS / MINOR / MAJOR を記録する

## 参照資料

| 資料名                    | パス                                   | 説明         |
| ------------------------- | -------------------------------------- | ------------ |
| phase-1 requirements      | `phase-1-requirements.md`              | AC           |
| phase-2 design            | `phase-2-design.md`                    | topology     |
| phase-5 implementation    | `phase-5-implementation.md`            | 実更新面     |
| phase-9 quality assurance | `phase-9-quality-assurance.md`         | 品質確認結果 |
| quality checklist         | `outputs/phase-9/quality-checklist.md` | 判定 input   |

## 実行手順

### ステップ1: AC を再確認する

AC ごとに file、command、ledger の 3 観点で満たしているかを確認する。

### ステップ2: unresolved item を整理する

error、warning、manual review point を open findings として記録する。

### ステップ3: 判定を記録する

PASS なら Phase 11 へ進む。MAJOR なら戻り先 Phase を決める。

## 統合テスト連携

| 観点       | 実施内容                    |
| ---------- | --------------------------- |
| AC review  | AC と evidence の対応確認   |
| unresolved | open findings の棚卸し      |
| gate       | PASS / MINOR / MAJOR の記録 |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                                                        |
| -------- | -------------------------------------------------------------------------------- |
| 判断力   | close-out 是正と code hardening の完了条件を混同せず、両方の証跡で判定しているか |
| 客観性   | evidence に基づいて判定しているか                                                |
| 逆算思考 | Phase 12 完了までに残る作業が明確か                                              |

## サブタスク管理

1. AC 最終確認
2. open findings 整理
3. gate 判定
4. Phase 11 input 整理

## 成果物

| 成果物              | パス                                      | 説明          |
| ------------------- | ----------------------------------------- | ------------- |
| final review result | `outputs/phase-10/final-review-result.md` | 判定結果      |
| open findings       | `outputs/phase-10/open-findings.md`       | 未解決項目    |
| release readiness   | `outputs/phase-10/release-readiness.md`   | 次 Phase 条件 |

## 完了条件

- [ ] AC の最終確認が完了している
- [ ] open findings が記録されている
- [ ] PASS / MINOR / MAJOR の判定が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] Phase 2 を参照した
- [ ] Phase 5 を参照した
- [ ] Phase 9 を参照した

## 次のPhase

Phase 11: 手動テスト
