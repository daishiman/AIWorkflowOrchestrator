# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 7                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

AC-1〜AC-4 を type、engine、renderer、regression の 4 観点に割り付け、 coverage の穴をなくす。

## 実行タスク

- AC-1〜AC-4 と T4 / T6 ケースの対応表を作成する
- type / engine / renderer の責務境界ごとに coverage を確認する
- downstream task が再実装を必要としないか確認する
- 未カバー項目があれば Phase 6 または Phase 8 へ返す

## 参照資料

| 資料名         | パス                        | 説明      |
| -------------- | --------------------------- | --------- |
| Phase 4 テスト | `phase-4-test-creation.md`  | baseline  |
| Phase 6 拡充   | `phase-6-test-expansion.md` | edge case |

## 実行手順

### coverage matrix

| AC   | 主担当      | 代表テスト       |
| ---- | ----------- | ---------------- |
| AC-1 | shared type | T4-1             |
| AC-2 | engine      | T4-2, T4-3, T4-4 |
| AC-3 | renderer    | T4-5, T4-6       |
| AC-4 | regression  | T4-7, T6-4       |

## 統合テスト連携

- Phase 9 の quality gate でこの matrix を再利用する
- Phase 10 の final review で AC 判定根拠として使う

## 成果物

| 成果物             | パス                                 | 説明                  |
| ------------------ | ------------------------------------ | --------------------- |
| カバレッジ確認仕様 | `phase-7-coverage-check.md`          | AC とテストの対応付け |
| coverage matrix    | `outputs/phase-7/coverage-matrix.md` | カバレッジ表          |

## 完了条件

- [ ] AC-1〜AC-4 の対応表が作成されている
- [ ] coverage の穴がないか判定されている
- [ ] downstream 再実装不要が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
