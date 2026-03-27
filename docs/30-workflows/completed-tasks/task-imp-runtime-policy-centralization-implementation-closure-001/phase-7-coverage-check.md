# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 7                                                                 |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

centralization close-out の concern coverage と証跡不足箇所を可視化し、Phase 8-10 の判断基準を固定する。

## 実行タスク

- consumer / shared / preload / cleanup 条件の coverage を確認する
- 重要コードパスの未検証箇所を洗い出す
- evidence に必要な test command と結果の対応を整理する

## 参照資料

| 資料名  | パス                        | 説明          |
| ------- | --------------------------- | ------------- |
| Phase 4 | `phase-4-test-creation.md`  | 設計 coverage |
| Phase 6 | `phase-6-test-expansion.md` | 回帰 coverage |

## 成果物

| 成果物                     | パス                                            | 説明                  |
| -------------------------- | ----------------------------------------------- | --------------------- |
| coverage and evidence plan | `outputs/phase-7/coverage-and-evidence-plan.md` | coverage と証跡の整理 |

### 前Phase成果物の再利用

- Phase 5: `outputs/phase-5/implementation-order.md` を code path coverage の起点に使う。
- Phase 6: `outputs/phase-6/regression-matrix.md` を regression evidence の対象一覧に使う。

## 統合テスト連携

- test command ごとにどの AC を証明するかを対応付ける。
- `pnpm --filter @repo/desktop test` と targeted suite の役割を分けて書く。
- shared type / preload drift は coverage 数値よりも contract ケース有無を優先して判定する。

## 完了条件

- [ ] consumer / shared / preload / cleanup 条件の coverage が見える
- [ ] 未検証箇所が列挙されている
- [ ] command と AC の対応が整理されている
- [ ] Phase 8-10 の判定材料が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**
