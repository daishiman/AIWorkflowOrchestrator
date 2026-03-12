# Phase 4 Red Test Report

## Red 条件

| 条件                  | 失敗シグナル                                  | 戻り先  |
| --------------------- | --------------------------------------------- | ------- |
| Phase ファイル欠落    | `validate-phase-output` が error を返す       | Phase 3 |
| canonical path 欠落   | T060-CT-03 が 3 child path を検出できない     | Phase 2 |
| dependency 契約欠落   | T060-CT-04 が `block` / `並列` を検出できない | Phase 2 |
| evidence 継承方針欠落 | T060-CT-05 が一致しない                       | Phase 2 |
| Phase 12 同期先欠落   | T060-CT-06 が一致しない                       | Phase 2 |

## 現時点の判定

- Red 条件はすべて定義済み
- 実行対象コマンドと戻り先の対応を Phase 5-9 で再利用可能な形に固定した

## 備考

Phase 4 は test case と red 条件の定義を完了条件とし、実行結果の最終 PASS/FAIL は Phase 9 と Phase 12 で確定する。
