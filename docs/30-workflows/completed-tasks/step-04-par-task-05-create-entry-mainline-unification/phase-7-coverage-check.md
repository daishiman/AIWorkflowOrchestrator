# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 7                                 |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | Phase 6                           |
| 後続Phase | Phase 8                           |

## 目的

mainline entry、secondary route、warning summary、Task06 境界の全観点が test plan に載っているかを確認する。

## 実行タスク

- route coverage を確認する
- state/handoff coverage を確認する
- warning coverage を確認する
- downstream boundary coverage を確認する

## 参照資料

| 資料名                 | パス                                          | 説明                     |
| ---------------------- | --------------------------------------------- | ------------------------ |
| Phase 5 implementation | `phase-5-implementation.md`                   | 実装対象との対応確認     |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md`              | test suite coverage      |
| Phase 6 test expansion | `phase-6-test-expansion.md`                   | edge case coverage       |
| Phase 2 matrix         | `outputs/phase-2/mainline-boundary-matrix.md` | route / warning 対象一覧 |

## 実行手順

- primary route と advanced route の両方に対応する suite があるかを確認する。
- `setCurrentView` / `currentSkillName` / `viewHistory` の handoff 観点が抜けていないかを確認する。
- Task03 の `source_conflict` / `structure_mismatch` が warning coverage に入っているかを確認する。
- Task06 / Task07 との boundary assertion が coverage 観点に入っているかを確認する。

## 統合テスト連携

- Phase 9 で coverage review に使う要約をここで固定する。
- Task06 側の test plan と重複するケースは境界 assertion のみに絞る。

## 成果物

| 成果物           | パス                        | 内容                   |
| ---------------- | --------------------------- | ---------------------- |
| カバレッジ確認書 | `phase-7-coverage-check.md` | coverage review の本文 |

## 完了条件

- [ ] primary route / advanced route の coverage が揃っている
- [ ] state/handoff の coverage が揃っている
- [ ] warning summary の coverage が揃っている
- [ ] Task06 / Task07 境界の coverage が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**
