# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 6                                                                 |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

Phase 4 の最小ケースを、失敗系、legacy 残置条件、shared drift 防止まで拡張し、close-out 妥当性を高める。

## 実行タスク

- negative path と fallback path の test を追加する
- shared transport drift 防止ケースを追加する
- legacy route が新規 mainline に侵入しない回帰ケースを追加する
- cleanup task 前提条件をテスト観点に落とす

## 参照資料

| 資料名  | パス                        | 説明             |
| ------- | --------------------------- | ---------------- |
| Phase 4 | `phase-4-test-creation.md`  | 最小 test matrix |
| Phase 5 | `phase-5-implementation.md` | 実装順と変更対象 |

## 成果物

| 成果物            | パス                                   | 説明                                |
| ----------------- | -------------------------------------- | ----------------------------------- |
| regression matrix | `outputs/phase-6/regression-matrix.md` | fail path / legacy / drift の回帰表 |

## 統合テスト連携

- contract test は shared type 変更と preload export 変更を同時に検証する。
- handler tests は authority bypass を検出できる negative case を持つ。
- cleanup 条件は「この task で完了」と「cleanup で消す」を混同しない形で回帰観点化する。

## 完了条件

- [ ] fail path と fallback path のケースが追加されている
- [ ] shared transport drift 防止観点がある
- [ ] legacy route 侵入防止ケースがある
- [ ] cleanup 前提条件が回帰観点として分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
