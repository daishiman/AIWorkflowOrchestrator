# Phase 6: 拡張テストケース一覧

> 作成日: 2026-04-20
> Phase 6 成果物: テスト拡充

---

## テストケース一覧

### TC-E-01〜TC-E-07: verify-all-specs parity 統合テスト

| ID      | テスト名                                                                  | ファイル                        | 結果 |
| ------- | ------------------------------------------------------------------------- | ------------------------------- | ---- |
| TC-E-01 | normal fixture で verify-all-specs → parity部分は PARITY_OK               | verify-all-specs.parity.test.js | PASS |
| TC-E-02 | partial-drift-s1 fixture で verify-all-specs → exit 非0                   | verify-all-specs.parity.test.js | PASS |
| TC-E-03 | full-drift fixture で verify-all-specs → exit 非0                         | verify-all-specs.parity.test.js | PASS |
| TC-E-04 | missing-s2 fixture で verify-all-specs → exit 非0                         | verify-all-specs.parity.test.js | PASS |
| TC-E-05 | invalid-status fixture で verify-all-specs → exit 非0                     | verify-all-specs.parity.test.js | PASS |
| TC-E-06 | normal fixture に --json オプション → JSON に parity フィールドが含まれる | verify-all-specs.parity.test.js | PASS |
| TC-E-07 | --json 出力に parity フィールドがあってもJSON が壊れない（後方互換）      | verify-all-specs.parity.test.js | PASS |

### TC-E-08〜TC-E-10: checklist gate テスト

| ID      | テスト名                                                                              | ファイル                      | 結果 |
| ------- | ------------------------------------------------------------------------------------- | ----------------------------- | ---- |
| TC-E-08 | phase-12-completion-checklist.md に validate-closeout-parity.js --workflow が含まれる | checklist-gate.parity.test.js | PASS |
| TC-E-09 | phase-12-completion-checklist.md に PARITY_OK が含まれる                              | checklist-gate.parity.test.js | PASS |
| TC-E-10 | phase-12-completion-checklist.md に PARITY_DRIFT bypass不許可の文言が含まれる         | checklist-gate.parity.test.js | PASS |

### TC-E-11〜TC-E-12: 遡及修正禁止テスト

| ID      | テスト名                                                                           | ファイル                                   | 結果 |
| ------- | ---------------------------------------------------------------------------------- | ------------------------------------------ | ---- |
| TC-E-11 | completed-tasks/UT-LIFECYCLE-... に validator 実行 → ファイルの mtime が変わらない | no-retroactive-modification.parity.test.js | PASS |
| TC-E-12 | drift-inventory.md の baseline 31 件が現在も観測可能（増加していない）             | no-retroactive-modification.parity.test.js | PASS |

**注**: drift件数は Phase 1 観測時の 29 件から 31 件に増加（本タスク UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 および TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 が追加されたため）。

### TC-P-18〜TC-P-20: 新規 fixture テスト

| ID      | テスト名                                                                      | fixture             | 結果 |
| ------- | ----------------------------------------------------------------------------- | ------------------- | ---- |
| TC-P-18 | two-drift-s1-s2 fixture → PARITY_DRIFT（S3/S4がdrift）                        | two-drift-s1-s2     | PASS |
| TC-P-19 | s4-only-drift fixture → PARITY_DRIFT（差異はS4のみ）                          | s4-only-drift       | PASS |
| TC-P-20 | mixed-across-phases fixture → PARITY_DRIFT（drifts.length===2、phase 1 なし） | mixed-across-phases | PASS |

### TC-C-08〜TC-C-10: complete-phase 拡張テスト

| ID      | テスト名                                                           | ファイル                      | 結果 |
| ------- | ------------------------------------------------------------------ | ----------------------------- | ---- |
| TC-C-08 | --skip-parity-check → usage error (exit 非0、書き込み開始前に終了) | complete-phase.parity.test.js | PASS |
| TC-C-09 | rollback失敗シナリオ → stderrに適切なエラーが出力される            | complete-phase.parity.test.js | PASS |
| TC-C-10 | エラー発生時 → stderrにエラー情報が含まれる                        | complete-phase.parity.test.js | PASS |

---

## 全テスト実行ログ

```
# 実行コマンド（Phase 6 全テスト）:
# node --test \
#   validate-closeout-parity.test.js \
#   checklist-gate.parity.test.js \
#   no-retroactive-modification.parity.test.js \
#   complete-phase.parity.test.js \
#   verify-all-specs.parity.test.js

1..42
# tests 42
# suites 0
# pass 42
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 16285.065792
```

**全42件 PASS**

（TC-P-01〜TC-P-17: 既存17件 + TC-P-18〜TC-P-20: 3件 + TC-C-01〜TC-C-07: 7件 + TC-C-08〜TC-C-10: 3件 + TC-E-01〜TC-E-12: 12件 = 42件）

---

## AC 対応表

| AC   | 内容                                                                  | 対応テストケース          |
| ---- | --------------------------------------------------------------------- | ------------------------- |
| AC-3 | PARITY_DRIFT が発生した際に S1〜S4 のどのソースが不一致かを特定できる | TC-P-18, TC-P-19, TC-P-20 |
| AC-5 | verify-all-specs.js が parity 検証を内包し、FAIL 時は全体 FAIL になる | TC-E-01〜TC-E-07          |
| AC-7 | validator は既存ファイルを変更しない（read-only）                     | TC-E-11, TC-P-17          |

---

## 追加 fixture 詳細

### two-drift-s1-s2 (TC-P-18 用)

S1(index.md)=pending, S2(root artifacts.json)=pending が canonical として採用され、
S3(outputs/artifacts.json)=completed, S4(phase-1-requirements.md)=completed がdrift。

### s4-only-drift (TC-P-19 用)

S1/S2/S3=completed が canonical、S4(phase-1-requirements.md)=pending のみdrift。
単一ソースdriftのテストシナリオ。

### mixed-across-phases (TC-P-20 用)

- Phase 1: 全ソース completed（driftなし）
- Phase 5: S2=pending（canonical）、S3=completed のみdrift（S4はpendingで一致）
- Phase 12: S2=completed（canonical）、S1=in_progress のみdrift

結果: drifts.length === 2、phase 1は含まない
