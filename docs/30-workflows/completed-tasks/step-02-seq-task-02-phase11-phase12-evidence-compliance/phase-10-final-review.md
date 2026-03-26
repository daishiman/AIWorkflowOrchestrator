# Phase 10: 最終レビュー

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 10                                                         |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

この corrective workflow を completed へ進めてよい条件と、まだ blocked にすべき条件を最終確認する。

## 実行タスク

- AC-1〜AC-8 の最終確認
- blocker の有無を確認
- Phase 11 / 12 成果物の閉じ方を決定

## 参照資料

| 資料名                    | パス                                                    | 説明                     |
| ------------------------- | ------------------------------------------------------- | ------------------------ |
| Phase 2 evidence decision | `outputs/phase-2/evidence-decision-record.md`           | visual / non-visual gate |
| Phase 5 evidence linkage  | `outputs/phase-5/evidence-linkage-map.md`               | TC-ID / artifact 対応    |
| Phase 7 coverage audit    | `outputs/phase-7/coverage-audit.md`                     | AC 最終確認              |
| Phase 9 qa gate report    | `outputs/phase-9/qa-gate-report.md`                     | QA 判定                  |
| Phase 11 / 12 spec        | `phase-11-manual-test.md` / `phase-12-documentation.md` | 最終対象                 |

## 判定ルール

- placeholder 依存が残る場合は FAIL
- compliance check が存在確認のみなら FAIL
- same-wave 更新不要の理由が残っていない場合は MINOR ではなく FAIL
- commit / PR 未承認なら Phase 13 は blocked 維持

## 統合テスト連携

Phase 10 では `validate-phase-output.js`、`verify-all-specs.js --json`、`validate-phase11-screenshot-coverage.js --json`、`validate-phase12-implementation-guide.js --json` を再実行し、最終レビューに添付する。

## 成果物

| 成果物               | パス                                       | 説明         |
| -------------------- | ------------------------------------------ | ------------ |
| final review summary | `outputs/phase-10/final-review-summary.md` | 判定サマリー |
| blocker disposition  | `outputs/phase-10/blocker-disposition.md`  | blocker 一覧 |

## 完了条件

- [ ] AC-1〜AC-8 を再確認済み
- [ ] blocker 有無を確定済み
- [ ] Phase 13 blocked 条件を維持済み
- [ ] **本Phase内の全タスクを100%実行完了**
