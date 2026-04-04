# Phase 4 Test Matrix

## Layer 1 テストケース

| テストケース | チェックID | シナリオ                        | 期待結果                                          |
| ------------ | ---------- | ------------------------------- | ------------------------------------------------- |
| T-L1-01      | L1-001     | SKILL.md が存在する             | pass, layer: "layer1"                             |
| T-L1-02      | L1-001     | SKILL.md が存在しない           | fail, severity: error, evidenceSummary にパス記載 |
| T-L1-03      | L1-002     | agents/ が存在する              | pass                                              |
| T-L1-04      | L1-002     | agents/ が存在しない            | fail, severity: error                             |
| T-L1-05      | L1-003     | agents/ 配下にファイルあり      | pass                                              |
| T-L1-06      | L1-003     | agents/ は空ディレクトリ        | fail, severity: error                             |
| T-L1-07      | L1-004     | references/ が存在する          | pass                                              |
| T-L1-08      | L1-004     | references/ が存在しない        | fail, severity: warning                           |
| T-L1-09      | L1-005     | output-schema.json が存在する   | pass                                              |
| T-L1-10      | L1-005     | output-schema.json が存在しない | fail, severity: warning                           |

## Layer 2 テストケース

| テストケース | チェックID | シナリオ                           | 期待結果                |
| ------------ | ---------- | ---------------------------------- | ----------------------- |
| T-L2-01      | L2-001     | SKILL.md に H1 heading あり        | pass, layer: "layer2"   |
| T-L2-02      | L2-001     | SKILL.md に H1 heading なし        | fail, severity: error   |
| T-L2-03      | L2-002     | SKILL.md に概要セクションあり      | pass                    |
| T-L2-04      | L2-002     | SKILL.md に概要セクションなし      | fail, severity: error   |
| T-L2-05      | L2-003     | SKILL.md に Trigger セクションあり | pass                    |
| T-L2-06      | L2-003     | SKILL.md に Trigger セクションなし | fail, severity: error   |
| T-L2-07      | L2-004     | SKILL.md に Anchors セクションあり | pass                    |
| T-L2-08      | L2-004     | SKILL.md に Anchors セクションなし | fail, severity: warning |
| T-L2-09      | L2-005     | agent ファイルに H1 heading あり   | pass                    |
| T-L2-10      | L2-005     | agent ファイルに H1 heading なし   | fail, severity: error   |
| T-L2-11      | L2-006     | agent ファイルに責務セクションあり | pass                    |
| T-L2-12      | L2-006     | agent ファイルに責務セクションなし | fail, severity: warning |
| T-L2-13      | L2-007     | output-schema.json が valid JSON   | pass                    |
| T-L2-14      | L2-007     | output-schema.json が invalid JSON | fail, severity: error   |

## Engine 集約テストケース

| テストケース | シナリオ                  | 期待結果                                           |
| ------------ | ------------------------- | -------------------------------------------------- |
| T-ENG-01     | 完全な skill ディレクトリ | 全チェック pass、layer1/layer2 エントリ混在        |
| T-ENG-02     | 空ディレクトリ            | Layer 1 全 error、Layer 2 も実行（全結果返却方針） |
| T-ENG-03     | SKILL.md のみ存在         | Layer 1 部分 fail、Layer 2 SKILL.md チェックは実行 |

## Facade Injection テストケース

| テストケース | シナリオ                              | 期待結果                           |
| ------------ | ------------------------------------- | ---------------------------------- |
| T-FAC-01     | engine を inject して verify 呼び出し | engine.verify() が呼ばれ結果が返る |
| T-FAC-02     | engine 未 inject で verify 呼び出し   | 空配列を返す                       |

## Coverage マッピング

- L1-001〜L1-005: 各2ケース (pass/fail) = 10ケース
- L2-001〜L2-007: 各2ケース (pass/fail) = 14ケース
- Engine 集約: 3ケース
- Facade injection: 2ケース
- 合計: 29 テストケース (Phase 6 で edge case 追加予定)
