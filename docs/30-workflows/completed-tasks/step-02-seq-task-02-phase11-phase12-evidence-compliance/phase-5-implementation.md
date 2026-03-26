# Phase 5: 実装

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 5                                                          |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

親 workflow の Phase 11 / 12 文書と成果物を、lane 順に是正する。

## 実行タスク

- Lane A: Phase 11 仕様書と evidence 文書を更新する
- Lane B: Phase 12 の 6 成果物を更新する
- Lane C: changelog と compliance に検証結果を反映する

## 参照資料

| 資料名                 | パス                                           | 説明     |
| ---------------------- | ---------------------------------------------- | -------- |
| Phase 2 設計           | `outputs/phase-2/remediation-lane-plan.md`     | 更新順序 |
| Phase 4 command matrix | `outputs/phase-4/validation-command-matrix.md` | 検証計画 |

## 実行手順

1. `phase-11-manual-test.md` を更新する。
2. `manual-test-checklist.md` / `manual-test-result.md` / screenshot metadata を更新する。
3. `phase-12-documentation.md` を更新する。
4. `implementation-guide.md` を全文見直す。
5. `documentation-changelog.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` を最後に更新する。

## 統合テスト連携

Lane A 完了後に Phase 11 validator、Lane B 完了後に Phase 12 validator を実行する。Lane C は両方 PASS 後にのみ着手する。

## 成果物

| 成果物               | パス                                      | 説明                 |
| -------------------- | ----------------------------------------- | -------------------- |
| change plan          | `outputs/phase-5/change-plan.md`          | 変更順序             |
| evidence linkage map | `outputs/phase-5/evidence-linkage-map.md` | TC-ID と成果物の対応 |

## 完了条件

- [ ] Lane A の更新順を固定済み
- [ ] Lane B の更新順を固定済み
- [ ] Lane C を最後に回す理由を明記済み
- [ ] **本Phase内の全タスクを100%実行完了**
