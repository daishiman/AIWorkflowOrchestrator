# Phase 7: テストカバレッジレポート

> 作成日: 2026-04-20
> 実行日: 2026-04-20

---

## 実行テスト一覧（全42件 PASS）

| ID      | テスト名                                                                              | ファイル                                   | 結果 |
| ------- | ------------------------------------------------------------------------------------- | ------------------------------------------ | ---- |
| TC-E-08 | phase-12-completion-checklist.md に validate-closeout-parity.js --workflow が含まれる | checklist-gate.parity.test.js              | PASS |
| TC-E-09 | phase-12-completion-checklist.md に PARITY_OK が含まれる                              | checklist-gate.parity.test.js              | PASS |
| TC-E-10 | phase-12-completion-checklist.md に PARITY_DRIFT bypass不許可の文言が含まれる         | checklist-gate.parity.test.js              | PASS |
| TC-C-01 | Phase完了後 → S1/S2/S3/S4のstatusが全て "completed" に一致                            | complete-phase.parity.test.js              | PASS |
| TC-C-02 | outputs/artifacts.json の書き込み失敗 → ロールバックされる                            | complete-phase.parity.test.js              | PASS |
| TC-C-03 | complete-phase実行後にparity検証FAILの場合 → ロールバック                             | complete-phase.parity.test.js              | PASS |
| TC-C-04 | 未知フラグ --skip-parity-check → usage error (exit 非0)                               | complete-phase.parity.test.js              | PASS |
| TC-C-05 | --workflow と --phase の基本動作 → 後方互換性あり                                     | complete-phase.parity.test.js              | PASS |
| TC-C-06 | Phase完了後 → phase-N-requirements.md の ステータス が "completed" に更新される       | complete-phase.parity.test.js              | PASS |
| TC-C-07 | 存在しないphase番号指定 → exit 非0                                                    | complete-phase.parity.test.js              | PASS |
| TC-C-08 | --skip-parity-check → usage error (exit 非0、書き込み開始前に終了)                    | complete-phase.parity.test.js              | PASS |
| TC-C-09 | rollback失敗シナリオ → stderrに適切なエラーが出力される                               | complete-phase.parity.test.js              | PASS |
| TC-C-10 | エラー発生時 → stderrにエラー情報が含まれる                                           | complete-phase.parity.test.js              | PASS |
| TC-E-11 | completed-tasks/UT-LIFECYCLE-... に validator 実行 → ファイルの mtime が変わらない    | no-retroactive-modification.parity.test.js | PASS |
| TC-E-12 | drift-inventory.md の baseline 31 件が現在も観測可能（増加していない）                | no-retroactive-modification.parity.test.js | PASS |
| TC-P-01 | normal fixture → exit 0 かつ PARITY_OK                                                | validate-closeout-parity.test.js           | PASS |
| TC-P-02 | S1ドリフト fixture → exit 1 かつ PARITY_DRIFT                                         | validate-closeout-parity.test.js           | PASS |
| TC-P-03 | S2ドリフト fixture → exit 1 かつ PARITY_DRIFT                                         | validate-closeout-parity.test.js           | PASS |
| TC-P-04 | S3ドリフト fixture → exit 1 かつ PARITY_DRIFT                                         | validate-closeout-parity.test.js           | PASS |
| TC-P-05 | S4ドリフト fixture → exit 1 かつ PARITY_DRIFT                                         | validate-closeout-parity.test.js           | PASS |
| TC-P-06 | 全ソースドリフト fixture → exit 1 かつ PARITY_DRIFT                                   | validate-closeout-parity.test.js           | PASS |
| TC-P-07 | S2（artifacts.json）が存在しない fixture → exit 2 かつ MISSING_SOURCE                 | validate-closeout-parity.test.js           | PASS |
| TC-P-08 | S3（outputs/artifacts.json）が存在しない fixture → exit 2 かつ MISSING_SOURCE         | validate-closeout-parity.test.js           | PASS |
| TC-P-09 | 無効なステータス値 fixture → exit 3 かつ INVALID_STATUS_VALUE                         | validate-closeout-parity.test.js           | PASS |
| TC-P-10 | 空ワークフロー fixture → exit 0 かつ PARITY_OK                                        | validate-closeout-parity.test.js           | PASS |
| TC-P-11 | S1のステータスが"-"の fixture → exit 0 かつ PARITY_OK                                 | validate-closeout-parity.test.js           | PASS |
| TC-P-12 | --jsonなし出力 → 人間可読テキストで phase/ソース/期待値/実測値を含む                  | validate-closeout-parity.test.js           | PASS |
| TC-P-13 | --json付きドリフト fixture → JSON出力でスキーマ一致                                   | validate-closeout-parity.test.js           | PASS |
| TC-P-14 | --workflow未指定 → exit 2（引数エラー）                                               | validate-closeout-parity.test.js           | PASS |
| TC-P-15 | --json付き normal fixture → sourcesChecked が S1/S2/S3/S4 を含む                      | validate-closeout-parity.test.js           | PASS |
| TC-P-16 | --json付き normal fixture → generatedAt がISO8601形式                                 | validate-closeout-parity.test.js           | PASS |
| TC-P-17 | normal fixture実行後 → fixtureファイルが変更されていない（read-only）                 | validate-closeout-parity.test.js           | PASS |
| TC-P-18 | two-drift-s1-s2 fixture → PARITY_DRIFT（S3/S4がdrift）                                | validate-closeout-parity.test.js           | PASS |
| TC-P-19 | s4-only-drift fixture → PARITY_DRIFT（差異はS4のみ）                                  | validate-closeout-parity.test.js           | PASS |
| TC-P-20 | mixed-across-phases fixture → PARITY_DRIFT（drifts.length===2、phase 1 なし）         | validate-closeout-parity.test.js           | PASS |
| TC-E-01 | normal fixture で verify-all-specs → parity部分は PARITY_OK                           | verify-all-specs.parity.test.js            | PASS |
| TC-E-02 | partial-drift-s1 fixture で verify-all-specs → exit 非0                               | verify-all-specs.parity.test.js            | PASS |
| TC-E-03 | full-drift fixture で verify-all-specs → exit 非0                                     | verify-all-specs.parity.test.js            | PASS |
| TC-E-04 | missing-s2 fixture で verify-all-specs → exit 非0                                     | verify-all-specs.parity.test.js            | PASS |
| TC-E-05 | invalid-status fixture で verify-all-specs → exit 非0                                 | verify-all-specs.parity.test.js            | PASS |
| TC-E-06 | normal fixture に --json オプション → JSON に parity フィールドが含まれる             | verify-all-specs.parity.test.js            | PASS |
| TC-E-07 | --json 出力に parity フィールドがあってもJSON が壊れない（後方互換）                  | verify-all-specs.parity.test.js            | PASS |

**合計: 42件 / 全PASS (fail: 0, skip: 0)**

---

## exit code 経路別テスト一覧

| exit code | 意味                           | 通過するテスト                                                                           |
| --------- | ------------------------------ | ---------------------------------------------------------------------------------------- |
| 0         | PARITY_OK（全ソース一致）      | TC-P-01, TC-P-10, TC-P-11                                                                |
| 1         | PARITY_DRIFT（ソース間不一致） | TC-P-02, TC-P-03, TC-P-04, TC-P-05, TC-P-06, TC-P-12, TC-P-13, TC-P-18, TC-P-19, TC-P-20 |
| 2         | MISSING_SOURCE / 引数エラー    | TC-P-07, TC-P-08, TC-P-14                                                                |
| 3         | INVALID_STATUS_VALUE           | TC-P-09                                                                                  |

**全4経路（exit 0/1/2/3）をテストが網羅している。**

---

## 未到達パスの確認

| カテゴリ            | 未到達パス                  | 状況                                 |
| ------------------- | --------------------------- | ------------------------------------ |
| exit code           | exit 0 / 1 / 2 / 3 全て     | 到達済み（上記参照）                 |
| S1〜S4 単独ドリフト | S1/S2/S3/S4 各単独          | TC-P-02〜TC-P-05で到達済み           |
| 複合ドリフト        | 複数ソース同時ドリフト      | TC-P-06, TC-P-18, TC-P-20 で到達済み |
| read-only           | validator の書き込み禁止    | TC-P-17, TC-E-11 で到達済み          |
| JSON / テキスト出力 | --json / なし の両出力形式  | TC-P-12, TC-P-13 等で到達済み        |
| cross-phase drift   | 複数フェーズにまたがるdrift | TC-P-20 で到達済み                   |

**未到達パス: なし**
