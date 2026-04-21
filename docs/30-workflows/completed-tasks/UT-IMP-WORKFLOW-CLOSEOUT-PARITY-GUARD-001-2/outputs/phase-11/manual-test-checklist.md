# Phase 11 手動テストチェックリスト

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク種別 | NON_VISUAL（CLI / バリデータ）            |
| Phase      | 11                                        |
| ステータス | PASS（全シナリオ完了）                    |
| 実行日     | 2026-04-20                                |

---

## 前提

- 本ワークフローは NON_VISUAL のため UI スクリーンショットは不要
- Phase 10 の最終レビューで PASS 判定を取得後に本 Phase を実行済み
- 実測値は `manual-test-result.md` に詳細記録済み

---

## AC トレース一覧

| AC   | 内容                                                                                               | 対応シナリオ | 判定 |
| ---- | -------------------------------------------------------------------------------------------------- | ------------ | ---- |
| AC-1 | validator が正常系で exit 0 / PARITY_OK を返す                                                     | シナリオ 1   | PASS |
| AC-1 | validator が drift 時に exit 1 / PARITY_DRIFT を返す                                               | シナリオ 2   | PASS |
| AC-1 | validator が欠損時に exit 2 / MISSING_SOURCE を返す                                                | シナリオ 3   | PASS |
| AC-1 | validator が不正値時に exit 3 / INVALID_STATUS_VALUE を返す                                        | シナリオ 4   | PASS |
| AC-2 | drifts[].phase / source / expected が JSON に含まれる                                              | シナリオ 2   | PASS |
| AC-3 | verify-all-specs.js との統合で PASS                                                                | シナリオ 7   | PASS |
| AC-5 | phase-12-completion-checklist.md に validate-closeout-parity / PARITY_OK / PARITY_DRIFT の記載あり | シナリオ 5   | PASS |
| AC-7 | completed-tasks/ への遡及変更なし（0 件）                                                          | シナリオ 6   | PASS |

---

## CLI 手動テストシナリオ

| ID         | シナリオ                                               | 期待値                                          | 実測値                                           | PASS/FAIL |
| ---------- | ------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------ | --------- |
| シナリオ 1 | 正常系 fixture への validator 実行                     | exit 0 / stdout に PARITY_OK                    | exit=0 / PARITY_OK: 全ソース一致                 | PASS      |
| シナリオ 2 | partial-drift-s1 fixture への validator 実行（--json） | exit 1 / PARITY_DRIFT / drifts[].phase 存在     | exit=1 / result=PARITY_DRIFT / drifts[0].phase=1 | PASS      |
| シナリオ 3 | missing-s2 fixture への validator 実行（--json）       | exit 2 / MISSING_SOURCE                         | exit=2 / result=MISSING_SOURCE                   | PASS      |
| シナリオ 4 | invalid-status fixture への validator 実行（--json）   | exit 3 / INVALID_STATUS_VALUE                   | exit=3 / result=INVALID_STATUS_VALUE             | PASS      |
| シナリオ 5 | phase-12-completion-checklist.md の記載確認            | validate-closeout-parity / PARITY_OK が含まれる | 行 12, 87, 88 に全項目記載                       | PASS      |
| シナリオ 6 | completed-tasks/ への遡及変更なし確認                  | git status --porcelain で 0 件                  | 0 件                                             | PASS      |
| シナリオ 7 | verify-all-specs.js 統合確認                           | exit 0 / Phase 数 13/13 / エラー 0 / PASS       | exit=0 / 13/13 / エラー 0 / PASS                 | PASS      |

---

## `--json` 出力スキーマ目視確認

| 項目                       | 確認内容                            | 判定 |
| -------------------------- | ----------------------------------- | ---- |
| `result` キー存在          | PARITY_DRIFT / MISSING_SOURCE 等    | PASS |
| `drifts[]` キー存在        | drift 時に配列として出力            | PASS |
| `drifts[].phase` 存在      | drift 時に phase 番号が含まれる     | PASS |
| `drifts[].source` 存在     | drift 発生ソース（S1 等）が含まれる | PASS |
| `drifts[].expected` 存在   | 期待値が含まれる                    | PASS |
| `sourcesChecked[]` 存在    | 検証対象ソース一覧が含まれる        | PASS |
| `generatedAt` ISO8601 形式 | `2026-04-20T02:34:23.471Z` 形式     | PASS |

---

## HIGH 問題の有無

| 問題レベル | 件数 | 内容 |
| ---------- | ---- | ---- |
| HIGH       | 0    | なし |
| MEDIUM     | 0    | なし |
| LOW        | 0    | なし |

HIGH 問題なし。全シナリオ PASS のため Phase 12 へ進行可能。

---

## 完了条件チェック

- [x] シナリオ 1〜7 全 PASS
- [x] `--json` 出力スキーマ目視確認完了
- [x] `manual-test-result.md` に実測値記録完了
- [x] 発見事項は `discovered-issues.md` への転記不要（問題なし）
- [x] NON_VISUAL タスクのためスクリーンショット不要を確認
