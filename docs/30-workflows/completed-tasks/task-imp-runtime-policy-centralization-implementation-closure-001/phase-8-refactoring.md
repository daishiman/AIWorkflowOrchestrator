# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 8                                                                 |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

close-out 後に残る重複分岐、暫定 adapter、cleanup 前の整理順を定め、不要な再分岐を防ぐ。

## 実行タスク

- consumer ごとの重複分岐を整理する
- temporary adapter / sanitize helper の置き場を確認する
- cleanup task 前に残してよいものと今消すものを仕分ける

## 参照資料

| 資料名  | パス                        | 説明              |
| ------- | --------------------------- | ----------------- |
| Phase 5 | `phase-5-implementation.md` | 実装結果          |
| Phase 7 | `phase-7-coverage-check.md` | 未検証 / 重複観点 |

## 成果物

| 成果物             | パス                                    | 説明                                     |
| ------------------ | --------------------------------------- | ---------------------------------------- |
| cleanup sequencing | `outputs/phase-8/cleanup-sequencing.md` | 今回閉じる整理と cleanup task 送りの境界 |

### 前Phase成果物の再利用

- Phase 1: `outputs/phase-1/current-state-inventory.md` で洗い出した gap を refactor 対象の母集団にする。
- Phase 2: `outputs/phase-2/consumer-wiring-matrix.md` と `outputs/phase-2/shared-contract-sync-plan.md` を cleanup 境界の判断根拠にする。
- Phase 5: `outputs/phase-5/implementation-order.md` を削除順 / 移設順の前提にする。

## 統合テスト連携

- refactor は behavior-preserving を前提に、Phase 6 の regression matrix を再実行対象にする。
- `RuntimeResolver` や legacy health route の即時削除は cleanup 条件充足まで行わない。
- helper 移設は shared / preload import path 破壊を起こさないことを確認する。

## 完了条件

- [ ] 重複分岐の整理方針がある
- [ ] temporary adapter / helper の置き場が整理されている
- [ ] cleanup task 送りと今回完了の境界が説明されている
- [ ] regression 前提が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
