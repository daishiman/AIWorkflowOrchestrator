# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| Phase    | 3                                              |
| 機能名   | task-sdk-01-phase12-compliance-sync            |
| 作成日   | 2026-03-26                                     |
| タスクID | UT-IMP-TASK-SDK-01-PHASE12-COMPLIANCE-SYNC-001 |

## 目的

Phase 1-2 の要件と設計が Phase 4 以降の実行に耐えるかを判定し、戻り条件を固定する。

## 実行タスク

- 要件整合レビュー: AC と lane 設計が 1:1 で対応しているか確認する
- simpler alternative 評価: task を追加分割せず単一 workflow で閉じる方針が妥当か確認する
- gate 判定: PASS / MINOR / MAJOR の判定と戻り先を決める

## 参照資料

| 資料名                  | パス                                                                           | 説明                         |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| phase-1 requirements    | `phase-1-requirements.md`                                                      | 受入基準                     |
| phase-2 design          | `phase-2-design.md`                                                            | lane と validation matrix    |
| requirements definition | `outputs/phase-1/requirements-definition.md`                                   | Phase 1 evidence             |
| design summary          | `outputs/phase-2/design-summary.md`                                            | 実行順 summary               |
| validation matrix       | `outputs/phase-2/validation-matrix.md`                                         | pass 条件                    |
| spec update workflow    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1 / Step 2 判断の再確認 |

## レビュー結果

### 判定

PASS

### 判定理由

- AC-1 から AC-5 が Lane A / B / C と command matrix に対応している
- docs-only follow-up として必要な file surface が parent workflow と aiworkflow 正本の範囲に収まっている
- Phase 13 blocked を先に固定しているため、禁止アクションが実行手順へ混入しない

### simpler alternative の評価

| 代替案                                   | 判定   | 理由                                                         |
| ---------------------------------------- | ------ | ------------------------------------------------------------ |
| unassigned-task 1 ファイルだけで実行する | 不採用 | Phase 4 以降の command、戻り条件、validator 順を固定できない |
| 親 workflow に追記だけで閉じる           | 不採用 | follow-up task の独立した execution unit が消える            |
| 単一 workflow として管理する             | 採用   | 変更対象が docs-only であり、3 lane で十分に追跡できる       |

## 実行手順

### ステップ1: 要件と設計の整合を点検する

Phase 1 の AC と Phase 2 の lane / matrix を並べ、欠落項目がないかを確認する。

### ステップ2: 戻り条件を固定する

Step 1 / Step 2 が曖昧なら Phase 2 へ戻す。対象 inventory が不足しているなら Phase 1 へ戻す。

### ステップ3: Phase 4 着手条件を確定する

テスト作成で使う command suite と file list が十分に定義されていることを確認する。

## 統合テスト連携

| 観点                                                         | 判定 |
| ------------------------------------------------------------ | ---- |
| command matrix が parent workflow validator と矛盾しない     | PASS |
| backlog / completed ledger / lessons の link path が存在する | PASS |
| Phase 13 blocked 方針が明記されている                        | PASS |

## 多角的チェック観点

| 観点             | この Phase で確認する内容                                                      |
| ---------------- | ------------------------------------------------------------------------------ |
| クリティカル思考 | 「親 workflow が close 済みなら follow-up 不要」という誤前提を排除できているか |
| 論点思考         | 実装対象が code ではなく close-out 証跡であることが明確か                      |
| 運用性           | 再監査時に同じ command と同じ path で追跡できるか                              |

## サブタスク管理

1. Phase 1 と Phase 2 の整合レビュー
2. 代替案比較
3. gate decision の記録
4. Phase 4 着手条件の固定

## 成果物

| 成果物               | パス                                      | 説明               |
| -------------------- | ----------------------------------------- | ------------------ |
| design review result | `outputs/phase-3/design-review-result.md` | PASS 判定の要約    |
| review findings      | `outputs/phase-3/review-findings.md`      | 指摘一覧           |
| gate decision        | `outputs/phase-3/gate-decision.md`        | 戻り条件と着手条件 |

## 完了条件

- [ ] PASS / MINOR / MAJOR の判定が記録されている
- [ ] simpler alternative の比較結果が記録されている
- [ ] Phase 4 着手条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を確認した
- [ ] Phase 2 を確認した
- [ ] gate decision を決定した
- [ ] 戻り条件を記録した

## 次のPhase

Phase 4: テスト作成
