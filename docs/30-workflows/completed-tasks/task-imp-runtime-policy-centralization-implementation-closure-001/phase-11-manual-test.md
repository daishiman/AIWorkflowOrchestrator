# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 11                                                                |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

main process centralization の結果が user-facing flow と operator flow の両方で破綻していないことを手動で確認する。

## 実行タスク

- AI Chat / Skill / Agent / Skill Creator の代表導線を確認する
- integrated / terminal_handoff / blocked 系の代表ケースを確認する
- cleanup 前提に影響する legacy route 表示有無を確認する

## 参照資料

| 資料名   | パス                       | 説明         |
| -------- | -------------------------- | ------------ |
| Phase 4  | `phase-4-test-creation.md` | 手動確認対象 |
| Phase 10 | `phase-10-final-review.md` | 判定観点     |

## 成果物

| 成果物                | パス                                        | 説明     |
| --------------------- | ------------------------------------------- | -------- |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` | 手順一覧 |
| manual test result    | `outputs/phase-11/manual-test-result.md`    | 実施結果 |
| discovered issues     | `outputs/phase-11/discovered-issues.md`     | 発見事項 |

### 前Phase成果物の再利用

- Phase 2: `outputs/phase-2/consumer-wiring-matrix.md` を導線ごとの期待動作一覧に使う。
- Phase 5: `outputs/phase-5/implementation-order.md` を確認対象コード面の索引に使う。
- Phase 6: `outputs/phase-6/regression-matrix.md` を手動確認対象の補完に使う。
- Phase 7: `outputs/phase-7/coverage-and-evidence-plan.md` を evidence 不足箇所の重点確認に使う。
- Phase 8: `outputs/phase-8/cleanup-sequencing.md` を legacy 残置確認の根拠に使う。
- Phase 9: `outputs/phase-9/quality-gate-report.md` を手動再確認が必要な観点の入力に使う。

## 統合テスト連携

- 手動確認は自動テストを置き換えず、代表導線の実在確認に限定する。
- blocked / handoff 導線は no-op CTA がないことを確認する。
- 新規 issue 化が必要な発見事項は Phase 12 の unassigned 判定へ渡す。

## 完了条件

- [ ] 4 surface の代表導線が確認されている
- [ ] integrated / terminal_handoff / blocked 系の代表ケースが確認されている
- [ ] discovered issues の記録先がある
- [ ] **本Phase内の全タスクを100%実行完了**
